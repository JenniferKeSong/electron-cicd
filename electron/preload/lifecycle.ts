import { getConfig } from 'ee-core/config'
import { getMainWindow } from 'ee-core/electron'
import { logger } from 'ee-core/log'
import { app, ipcMain, protocol, screen, type BrowserWindow } from 'electron'
import type { CustomConfig } from '../config/config.default'
import { registerMainIpcHandlers } from '../ipc'
import { underlineService } from '../service'
import { setLaunchAtStartupEnabled } from '../service/userSettings'
import { pruneLogDir } from '../utils/pruneLogDir'
import { applyOpenDevToolsFromRuntime } from '../utils/runtimeUserConfig'
import accessibility from './manager/accessibility'

class Lifecycle {
  private singleInstanceLockInitialized = false

  /**
   * Core app has been loaded
   */
  ready = async (): Promise<void> => {
    logger.info('[lifecycle] ready')
    if (!this.ensureSingleInstanceLock()) {
      return
    }

    protocol.registerSchemesAsPrivileged([
      {
        scheme: 'app',
        privileges: {
          standard: true,
          secure: true,
          supportFetchAPI: true,
          allowServiceWorkers: true,
        },
      },
    ])

    await app.whenReady()

    ipcMain.handle(
      'set-launch-at-startup-enabled',
      (_event, enabled: boolean) => {
        return setLaunchAtStartupEnabled(enabled)
      },
    )

    const logCfg = (getConfig() as CustomConfig).logger
    if (logCfg?.dir && logCfg.logRetentionDays) {
      void pruneLogDir(logCfg.dir, logCfg.logRetentionDays)
    }

    underlineService.start()

    await accessibility()
  }

  /**
   * Electron app is ready
   */
  electronAppReady = async (): Promise<void> => {
    logger.info('[lifecycle] electron-app-ready')

    if (!app.isReady()) {
      await app.whenReady()
    }
  }

  private ensureSingleInstanceLock(): boolean {
    if (this.singleInstanceLockInitialized) {
      return true
    }

    const hasLock = app.requestSingleInstanceLock()
    if (!hasLock) {
      logger.info('[lifecycle] 检测到重复实例，当前进程退出')
      app.quit()
      return false
    }

    this.singleInstanceLockInitialized = true
    return true
  }

  /**
   * Main window has been loaded
   */
  windowReady = async (): Promise<void> => {
    logger.info('[lifecycle] window-ready')
    const win = getMainWindow()
    this.setWindowBounds(win)

    const { windowsOption } = getConfig()
    if (windowsOption?.show === false) {
      win.once('ready-to-show', () => {
        win.show()
        win.focus()
      })
    }

    try {
      await registerMainIpcHandlers()
    } catch (error) {
      logger.error('[lifecycle] IPC 注册失败:', error)
    }

    logger.info('[lifecycle] IPC 已注册')

    try {
      applyOpenDevToolsFromRuntime()
    } catch (error) {
      logger.warn('[lifecycle] 运行时用户配置监听失败:', error)
    }
  }

  /**
   * 设置窗口居中和大小
   */
  private setWindowBounds(win: BrowserWindow): void {
    const mainScreen = screen.getPrimaryDisplay()
    const { width, height } = mainScreen.workAreaSize
    const windowWidth = Math.floor(width * 0.6)
    const windowHeight = Math.floor(height * 0.8)
    const x = Math.floor((width - windowWidth) / 2)
    const y = Math.floor((height - windowHeight) / 2)
    win.setBounds({ x, y, width: windowWidth, height: windowHeight })
  }

  /**
   * Before app close
   */
  beforeClose = async (): Promise<void> => {
    logger.info('[lifecycle] before-close')
  }
}

Lifecycle.toString = () => '[class Lifecycle]'

export { Lifecycle }
