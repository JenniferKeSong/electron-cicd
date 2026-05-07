import { BrowserWindow, ipcMain, nativeTheme } from 'electron'

/**
 * 获取当前系统主题色
 * @returns {'light' | 'dark'}
 */
const getSystemTheme = (): 'light' | 'dark' =>
  nativeTheme.shouldUseDarkColors ? 'dark' : 'light'

/** 系统主题变化：通知所有 BrowserWindow（划词/快捷栏等为独立窗口，仅发主窗口会导致不同步） */
function broadcastSystemThemeToAllWindows(mode: 'light' | 'dark') {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send('update-system-theme', mode)
    }
  }
}

type AppThemeBroadcastPayload = { mode: 'light' | 'dark'; setting?: 'light' | 'dark' | 'system' }

/** 用户切换主题：由发起窗口通知主进程，再同步到其余窗口 */
function registerBroadcastAppTheme() {
  ipcMain.on('broadcast-app-theme', (event, payload: AppThemeBroadcastPayload) => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (win.isDestroyed() || win.webContents === event.sender) continue
      win.webContents.send('sync-app-theme', payload)
    }
  })
}

const themeManager = () => {
  ipcMain.handle('get-system-theme', getSystemTheme)

  nativeTheme.on('updated', () => {
    broadcastSystemThemeToAllWindows(getSystemTheme())
  })

  registerBroadcastAppTheme()
}

export default themeManager

