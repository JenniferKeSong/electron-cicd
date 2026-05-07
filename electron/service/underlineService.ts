/**
 * 划词（阅读高亮）服务：全局监听鼠标拖拽选区，读取选中文本后在独立浮窗中展示快捷操作条。
 *
 * 流程概览：
 * 1. uIOhook 捕获 mousedown / mouseup，仅在左键拖拽超过阈值且开启划词功能时触发；
 * 2. 按平台读取当前选中文本（Windows 优先 UI Automation，避免破坏选区 / 误发 Ctrl+C）；
 * 3. 将文本与坐标通过 IPC 发给 `underlineWord` 窗体，并定位到光标附近且约束在工作区内。
 */
import { exec } from 'child_process'
import { logger } from 'ee-core/log'
import { clipboard, screen } from 'electron'
import { getUnderlineWordWindow } from '../ipc/underline'
import { uIOhook } from 'uiohook-napi'
import { UNDERLINE_WINDOW_OFFSET, UNDERLINE_WINDOW_SIZE } from './underlineConfig'
import { getReadingHighlightEnabled } from './userSettings'

/** 划词成功后的回调：透传文本与 hook 事件坐标（浮窗定位会优先用系统光标） */
type OnUnderlineSelected = (payload: { text: string; x: number; y: number }) => void

const LEFT_MOUSE_BUTTON = 1
/** 拖拽小于该距离视为点击，不触发划词 */
const MIN_DRAG_DISTANCE = 6
/** 连续划词间隔防抖，避免一次选择触发多次 */
const TRIGGER_DEBOUNCE_MS = 300
/** Windows 前台进程检测结果缓存时长，减少频繁 PowerShell 调用 */
const WINDOWS_FOREGROUND_CACHE_MS = 500

/** 左键按下时的屏幕坐标，用于与 mouseup 计算拖拽距离 */
let mouseDownPosition: { x: number; y: number } | null = null
/** 上次成功触发划词的时间戳（配合 TRIGGER_DEBOUNCE_MS） */
let lastTriggerAt = 0
/** 防止并发读取选区造成额外卡顿 */
let isReadingSelection = false
/** Windows 前台是否终端进程的缓存 */
let cachedWindowsConsoleForeground: boolean | null = null
let cachedWindowsConsoleForegroundAt = 0

/** 用户在其他区域按下鼠标时收起浮窗；命中浮窗矩形（含容差）则不隐藏。 */
function hideUnderlineWindowOnOutsideClick(x: number, y: number): void {
  const win = getUnderlineWordWindow()
  if (!win || !win.isVisible()) return

  // Windows 高 DPI 下 uIOhook 坐标与 BrowserWindow 坐标可能不一致，
  // 优先使用 Electron 的屏幕坐标，避免误判为“窗外点击”。
  const cursorPoint = screen.getCursorScreenPoint()
  const pointX = Number.isFinite(cursorPoint.x) ? cursorPoint.x : x
  const pointY = Number.isFinite(cursorPoint.y) ? cursorPoint.y : y
  const HIT_TOLERANCE = 8

  const bounds = win.getBounds()
  const isInsideWindow =
    pointX >= bounds.x - HIT_TOLERANCE &&
    pointX <= bounds.x + bounds.width + HIT_TOLERANCE &&
    pointY >= bounds.y - HIT_TOLERANCE &&
    pointY <= bounds.y + bounds.height + HIT_TOLERANCE

  if (!isInsideWindow) {
    win.hide()
  }
}

/** 执行 shell 命令，返回 stdout 去首尾空白（错误时不抛，仅可能得到空串） */
function execCommand(command: string): Promise<string> {
  return new Promise((resolve) => {
    exec(command, (_, stdout: string) => {
      resolve((stdout || '').trim())
    })
  })
}

/**
 * Windows：通过 UI Automation 读取焦点控件的 TextPattern 选区，尽量不模拟按键、不改变剪贴板。
 * 不支持 TextPattern 的应用返回空串，由上层走 SendKeys 兜底。
 */
async function getSelectedTextByWindowsAutomation(): Promise<string> {
  const script = [
    "$selected = ''",
    'try {',
    '  Add-Type -AssemblyName UIAutomationClient | Out-Null',
    '  $focused = [System.Windows.Automation.AutomationElement]::FocusedElement',
    '  if ($focused) {',
    '    $patternObj = $null',
    '    if ($focused.TryGetCurrentPattern([System.Windows.Automation.TextPattern]::Pattern, [ref]$patternObj)) {',
    '      $textPattern = [System.Windows.Automation.TextPattern]$patternObj',
    '      $ranges = $textPattern.GetSelection()',
    '      if ($ranges -and $ranges.Length -gt 0) {',
    '        $selected = $ranges[0].GetText(-1)',
    '      }',
    '    }',
    '  }',
    '} catch {}',
    '$selected.Trim()',
  ].join('; ')

  const escapedScript = script.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return execCommand(`powershell -NoProfile -Command "${escapedScript}"`)
}

/** Windows：判断前台是否为终端类进程；此类场景下模拟 Ctrl+C 会发送中断而非复制，需跳过剪贴板兜底。 */
async function isWindowsConsoleForeground(): Promise<boolean> {
  const now = Date.now()
  if (
    cachedWindowsConsoleForeground !== null &&
    now - cachedWindowsConsoleForegroundAt < WINDOWS_FOREGROUND_CACHE_MS
  ) {
    return cachedWindowsConsoleForeground
  }

  const script = [
    '$result = "false"',
    'try {',
    '  Add-Type @"',
    'using System;',
    'using System.Runtime.InteropServices;',
    'public static class WinApi {',
    '  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();',
    '  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);',
    '}',
    '"@ | Out-Null',
    '  $hwnd = [WinApi]::GetForegroundWindow()',
    '  if ($hwnd -ne [IntPtr]::Zero) {',
    '    $pid = 0',
    '    [WinApi]::GetWindowThreadProcessId($hwnd, [ref]$pid) | Out-Null',
    '    if ($pid -gt 0) {',
    '      $p = Get-Process -Id $pid -ErrorAction SilentlyContinue',
    '      $name = ($p.ProcessName + "").ToLowerInvariant()',
    '      if (',
    '        $name -eq "conhost" -or',
    '        $name -eq "windowsterminal" -or',
    '        $name -eq "wt" -or',
    '        $name -eq "cmd" -or',
    '        $name -eq "powershell" -or',
    '        $name -eq "pwsh"',
    '      ) {',
    '        $result = "true"',
    '      }',
    '    }',
    '  }',
    '} catch {}',
    '$result',
  ].join('; ')

  const escapedScript = script.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  const output = await execCommand(
    `powershell -NoProfile -Command "${escapedScript}"`
  )
  const isConsole = output.toLowerCase() === 'true'
  cachedWindowsConsoleForeground = isConsole
  cachedWindowsConsoleForegroundAt = now
  return isConsole
}

/**
 * 跨平台读取「当前选中文本」。
 * - win32：UI Automation →（非控制台）SendKeys^c + Electron clipboard，前后恢复剪贴板；
 * - darwin：osascript 模拟 Cmd+C，恢复剪贴板；
 * - linux：xclip primary selection。
 */
async function getSelectedText(): Promise<string> {
  if (process.platform === 'win32') {
    // 优先用 UI Automation 读取选中文本，避免改变当前选区状态
    const textByAutomation = await getSelectedTextByWindowsAutomation()
    if (textByAutomation) return textByAutomation

    // 兼容兜底：部分应用不支持 TextPattern 时，回退到 Ctrl+C
    // 控制台前台场景下 Ctrl+C 会触发中断信号，直接跳过兜底。
    if (await isWindowsConsoleForeground()) {
      return ''
    }

    // 保护用户剪贴板：先保存旧内容，读取划词后恢复
    const previousClipboardText = clipboard.readText()
    try {
      // 写入占位符用于检测 Ctrl+C 是否真正复制了新内容，
      // 相比清空剪贴板，即使用户在此期间粘贴也只会得到原有内容而非空白。
      const sentinel = `\0__underline_sentinel_${Date.now()}`
      clipboard.writeText(sentinel)
      await execCommand(
        'powershell -Command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys(\'^c\')"'
      )
      await new Promise((resolve) => setTimeout(resolve, 80))
      const copiedText = clipboard.readText().trim()
      // 剪贴板仍为占位符说明 Ctrl+C 没有复制到任何选中文本
      if (!copiedText || copiedText === sentinel) return ''
      return copiedText
    } finally {
      clipboard.writeText(previousClipboardText)
    }
  }

  if (process.platform === 'darwin') {
    // 保护用户剪贴板：先保存旧内容，读取划词后恢复
    const previousClipboardText = clipboard.readText()
    try {
      // 写入占位符用于检测 Cmd+C 是否真正复制了新内容，
      // 避免未选中文字时将剪贴板旧内容误当作选中文本。
      const sentinel = `\0__underline_sentinel_${Date.now()}`
      clipboard.writeText(sentinel)
      await execCommand(
        'osascript -e \'tell application "System Events" to keystroke "c" using command down\' && sleep 0.05'
      )
      const copiedText = clipboard.readText().trim()
      // 剪贴板仍为占位符说明 Cmd+C 没有复制到任何选中文本
      if (!copiedText || copiedText === sentinel) return ''
      return copiedText
    } finally {
      clipboard.writeText(previousClipboardText)
    }
  }

  if (process.platform === 'linux') {
    return execCommand('xclip -o -selection primary')
  }

  return ''
}

/**
 * 注册全局鼠标钩子：左键拖拽选区松开后拉取文本并回调。
 * 与 `getReadingHighlightEnabled()` 联动，关闭划词时不记录/不触发。
 */
function registerUnderlineMouseHook(onSelected: OnUnderlineSelected): void {
  uIOhook.on('mousedown', (event) => {
    if (Number(event.button) !== LEFT_MOUSE_BUTTON) {
      mouseDownPosition = null
      return
    }
    if (!getReadingHighlightEnabled()) {
      mouseDownPosition = null
      return
    }

    // 点击其他位置时隐藏划词浮窗（点击窗体内部时不隐藏）
    hideUnderlineWindowOnOutsideClick(event.x, event.y)
    // 记录按下位置，使用 Electron 逻辑像素（DIP）以兼容 Windows 高 DPI
    const cursorPoint = screen.getCursorScreenPoint()
    mouseDownPosition = {
      x: Number.isFinite(cursorPoint.x) ? cursorPoint.x : event.x,
      y: Number.isFinite(cursorPoint.y) ? cursorPoint.y : event.y,
    }
  })

  uIOhook.on('mouseup', async (event) => {
    if (isReadingSelection) {
      return
    }
    if (Number(event.button) !== LEFT_MOUSE_BUTTON || !mouseDownPosition) {
      return
    }
    if (!getReadingHighlightEnabled()) {
      mouseDownPosition = null
      return
    }

    // 使用 Electron 逻辑像素（DIP）计算拖拽距离，与 mousedown 保持同一坐标系，
    // 避免 Windows 高 DPI 下 uIOhook 物理像素与逻辑像素不一致导致距离被放大、
    // 普通点击被误判为拖拽选词。
    const endCursor = screen.getCursorScreenPoint()
    const endX = Number.isFinite(endCursor.x) ? endCursor.x : event.x
    const endY = Number.isFinite(endCursor.y) ? endCursor.y : event.y

    const distance = Math.hypot(
      endX - mouseDownPosition.x,
      endY - mouseDownPosition.y
    )
    mouseDownPosition = null
    if (distance < MIN_DRAG_DISTANCE) {
      return
    }

    const now = Date.now()
    if (now - lastTriggerAt < TRIGGER_DEBOUNCE_MS) {
      return
    }

    isReadingSelection = true
    try {
      const text = await getSelectedText()
      if (!text) return
      lastTriggerAt = Date.now()

      onSelected({ text, x: endX, y: endY })
    } finally {
      isReadingSelection = false
    }
  })

  uIOhook.on('wheel', () => {
    const win = getUnderlineWordWindow()
    if (win && win.isVisible()) {
      win.hide()
    }
  })

  uIOhook.start()
}

/**
 * 设置划词浮窗几何位置（相对光标偏移 + 工作区夹紧），按平台选择 show/showInactive，
 * 并向渲染进程派发 `set-underline-word` 以更新展示文案。
 */
function openUnderlineWordWindow(text: string, x: number, y: number): void {
  const win = getUnderlineWordWindow()
  if (!win) {
    logger.warn('[underline] underlineWord window not found')
    return
  }

  // x, y 已在 mouseup 时通过 screen.getCursorScreenPoint() 转换为逻辑像素（DIP），
  // 可直接用于 Electron API 定位，无需再次获取光标位置。
  const anchorX = x
  const anchorY = y

  const targetX = anchorX + UNDERLINE_WINDOW_OFFSET.x
  const targetY = anchorY + UNDERLINE_WINDOW_OFFSET.y
  const display = screen.getDisplayNearestPoint({ x: targetX, y: targetY })
  const { x: areaX, y: areaY, width: areaWidth, height: areaHeight } = display.workArea

  const { width: currentWidth, height: currentHeight } = win.getBounds()
  const windowWidth = currentWidth || UNDERLINE_WINDOW_SIZE.width
  const windowHeight = currentHeight || UNDERLINE_WINDOW_SIZE.height

  const boundedX = Math.min(
    Math.max(targetX, areaX),
    areaX + areaWidth - windowWidth,
  )
  const boundedY = Math.min(
    Math.max(targetY, areaY),
    areaY + areaHeight - windowHeight,
  )

  win.setBounds({
    x: Math.floor(boundedX),
    y: Math.floor(boundedY),
    width: Math.floor(windowWidth),
    height: Math.floor(windowHeight),
  })
  // Windows 下 showInactive 常出现“首击只激活窗口、不触发按钮点击”
  // 改为显式聚焦，保证工具条按钮一次点击即可触发。
  if (process.platform === 'win32') {
    win.show()
    win.focus()
  } else {
    // 其他平台保持不抢键盘焦点，避免打断输入
    win.showInactive()
  }
  // 增加判断逻辑，当text相同，x/y坐标不同的时候，不展示划词窗口
  logger.info(`[underline] openUnderlineWordWindow text: ${text} x: ${x} y: ${y}`)

  win.webContents.send('set-underline-word', { text, x, y })
}

/** 启动全局划词监听（应用生命周期内由 lifecycle 调用） */
function start(): void {
  registerUnderlineMouseHook(({ text, x, y }) => {
    logger.info(`[underline] selected text: ${text}`)
    // 在这里显示划词窗口
    openUnderlineWordWindow(text, x, y)
  })
}

/** 停止全局鼠标钩子 */
function stop(): void {
  uIOhook.stop()
}

/** 划词服务对外接口（供主进程 lifecycle 注册/卸载） */
export const underlineService = {
  start,
  stop,
}
