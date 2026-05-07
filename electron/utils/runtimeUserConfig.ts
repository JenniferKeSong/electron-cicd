import fs from 'fs'
import path from 'path'
import { app, type BrowserWindow } from 'electron'
import { getMainWindow } from 'ee-core/electron'
import { logger } from 'ee-core/log'

/** 用户数据目录下的运行时配置，安装包发布后可手动编辑，保存即生效（DevTools 开关） */
const RUNTIME_CONFIG_BASENAME = 'wiko-runtime.json'

/**
 * 与 BrowserWindow 实例对应的名称（用于 JSON 配置）：
 * - main：主窗口（getMainWindow）
 * - shortcutWindow：快捷键浮窗
 * - underlineWord：划词浮窗
 * - local-knowledge：本地知识窗口
 * - glm-ppt：GLM PPT 等其它 createWindow 传入的 windowName
 */
export interface RuntimeUserConfig {
  /** 仅作用于主窗口（兼容旧配置）；若存在 openDevToolsWindows 则忽略此项 */
  openDevTools?: boolean
  /** 按窗口名精确控制；值为 true 打开、false 关闭该窗口的 DevTools */
  openDevToolsWindows?: Record<string, boolean>
}

export function getRuntimeUserConfigPath(): string {
  return path.join(app.getPath('userData'), RUNTIME_CONFIG_BASENAME)
}

export function readRuntimeUserConfig(): RuntimeUserConfig | null {
  const p = getRuntimeUserConfigPath()
  if (!fs.existsSync(p)) return null
  try {
    const raw = fs.readFileSync(p, 'utf8')
    return JSON.parse(raw) as RuntimeUserConfig
  } catch (e) {
    logger.warn('[runtime-config] JSON 解析失败:', p, e)
    return null
  }
}

function getWindowByRuntimeName(name: string): BrowserWindow | null {
  if (name === 'main') {
    try {
      const w = getMainWindow()
      return w.isDestroyed() ? null : w
    } catch {
      return null
    }
  }
  // 避免 runtimeUserConfig ↔ windowService 顶层循环依赖
  const { windowService } =
    require('../service/os/window') as typeof import('../service/os/window')
  const w = windowService.windows[name]
  return w && !w.isDestroyed() ? w : null
}

export function applyOpenDevToolsToWindow(win: BrowserWindow, wantOpen: boolean): void {
  if (win.isDestroyed()) return
  try {
    if (wantOpen) {
      if (!win.webContents.isDevToolsOpened()) {
        win.webContents.openDevTools({ mode: 'detach' })
      }
    } else if (win.webContents.isDevToolsOpened()) {
      win.webContents.closeDevTools()
    }
  } catch (e) {
    logger.warn('[runtime-config] 应用 openDevTools 失败:', e)
  }
}

/**
 * 读取 wiko-runtime.json，对所有已存在且配置中写明的窗口应用 DevTools 状态。
 * 子窗口晚于主窗口创建时，会在 WindowService.createWindow 末尾再次调用本函数。
 */
export function applyOpenDevToolsFromRuntime(): void {
  const cfg = readRuntimeUserConfig()
  if (cfg == null) return

  const byName = cfg.openDevToolsWindows
  if (byName && typeof byName === 'object' && !Array.isArray(byName)) {
    for (const [name, want] of Object.entries(byName)) {
      if (typeof want !== 'boolean') continue
      const win = getWindowByRuntimeName(name)
      if (win) applyOpenDevToolsToWindow(win, want)
    }
    return
  }

  if (cfg.openDevTools === true || cfg.openDevTools === false) {
    const main = getWindowByRuntimeName('main')
    if (main) applyOpenDevToolsToWindow(main, cfg.openDevTools)
  }
}

/** 监听配置文件变更，保存后短时间内对所有相关窗口重新应用 */
export function watchRuntimeUserConfig(): () => void {
  const p = getRuntimeUserConfigPath()
  let timer: NodeJS.Timeout | null = null

  const flush = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      applyOpenDevToolsFromRuntime()
    }, 200)
  }

  fs.watchFile(p, { interval: 800 }, flush)

  return () => {
    if (timer) clearTimeout(timer)
    fs.unwatchFile(p, flush)
  }
}
