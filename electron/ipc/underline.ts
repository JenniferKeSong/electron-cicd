import { dialog, ipcMain, screen } from 'electron'
import { windowService } from '../service'
import ThemeConfig from '../config/theme.config'
import {
  getReadingHighlightEnabled,
  setReadingHighlightEnabled,
} from '../service/userSettings'
import { UNDERLINE_WINDOW_SIZE } from '../service/underlineConfig'

/**
 * 获取当前划词窗口实例
 */
function getUnderlineWordWindow() {
  const win = (windowService as any).windows['underlineWord']
  return win && !win.isDestroyed() ? win : null
}

/**
 * 启动时预创建划词窗口，后续通过 show/hide 控制
 */
function ensureUnderlineWordWindow(): void {
  let win = getUnderlineWordWindow()
  if (!win) {
    windowService.createWindow({
      type: 'dist',
      content: '#/underlineWord',
      windowName: 'underlineWord',
      windowTitle: '',
    })
    win = getUnderlineWordWindow()
  }
  win?.hide()
}

/**
 * 注册划词窗口 IPC 处理器
 */
function registerIpcHandlers(): void {
  ensureUnderlineWordWindow()

  ipcMain.handle('open-underline-word', () => {
    let win = getUnderlineWordWindow()
    if (!win) {
      ensureUnderlineWordWindow()
      win = getUnderlineWordWindow()
    }
    win?.show()
    win?.focus()
  })

  ipcMain.handle('close-underline-window', () => {
    const win = getUnderlineWordWindow()
    win?.hide()
  })

  ipcMain.handle('update-underline-window-size', (_event, width: number) => {
    const win = getUnderlineWordWindow()
    if (!win) return

    const bounds = win.getBounds()
    const display = screen.getDisplayNearestPoint({
      x: bounds.x,
      y: bounds.y,
    })
    const { x: areaX, y: areaY, width: areaWidth, height: areaHeight } = display.workArea

    const nextWidth = Math.floor(
      Math.min(Math.max(Number(width) || UNDERLINE_WINDOW_SIZE.width, 320), areaWidth)
    )

    const nextX = Math.min(Math.max(bounds.x, areaX), areaX + areaWidth - nextWidth)
    const nextY = Math.min(
      Math.max(bounds.y, areaY),
      areaY + areaHeight - bounds.height,
    )

    win.setBounds({
      x: Math.floor(nextX),
      y: Math.floor(nextY),
      width: nextWidth,
      height: bounds.height,
    })
  })

  ipcMain.handle('set-reading-highlight-enabled', (_event, enabled: boolean, showDialog?: boolean) => {
    const { iconPath } = ThemeConfig()
    if (showDialog) {
      dialog.showMessageBox({
        type: 'info',
        buttons: ['确定', '取消'],
        defaultId: 0,
        cancelId: 1,
        title: '提示',
        icon: iconPath,
        message: '关闭后仍可在系统设置中打开'
      }).then((res) => {
        if (res.response === 0) {
          return setReadingHighlightEnabled(Boolean(enabled))
        }
      })
    } else {
      return setReadingHighlightEnabled(Boolean(enabled))
    }
  })

  ipcMain.handle('get-reading-highlight-enabled', () => {
    return getReadingHighlightEnabled()
  })
}

export { registerIpcHandlers, getUnderlineWordWindow }
