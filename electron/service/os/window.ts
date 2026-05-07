import { getConfig } from 'ee-core/config'
import { getMainWindow } from 'ee-core/electron'
import { logger } from 'ee-core/log'
import { getBaseDir, getElectronDir, isProd } from 'ee-core/ps'
import { isFileProtocol } from 'ee-core/utils'
import { BrowserWindow, Notification } from 'electron'
import path from 'path'
import { setTimeout as delay } from 'timers'
import ThemeConfig from '../../config/theme.config'
import { applyOpenDevToolsFromRuntime } from '../../utils/runtimeUserConfig'
import { UNDERLINE_WINDOW_SIZE } from '../underlineConfig'

/**
 * Window 管理服务
 */
class WindowService {
  private myNotification: Notification | null = null
  public windows: Record<string, BrowserWindow> = {}

  /**
   * 创建新窗口
   */
  createWindow({
    type,
    content,
    windowName,
    windowTitle,
  }: {
    type: 'html' | 'dist' | 'web'
    content: string
    windowName: string
    windowTitle: string
  }): number {
    const { iconPath, title: themeTitle } = ThemeConfig()
    let contentUrl = ''

    logger.info(`✅ 创建窗口 ${type} ${windowName} ${iconPath}`)
    switch (type) {
      case 'html':
        contentUrl = path.join('file://', getBaseDir(), content)
        break
      case 'web':
        contentUrl = content
        break
      case 'dist':
        contentUrl = this._getVueUrl(content, windowName)
        break
      default:
        logger.warn(`[createWindow] 未知窗口类型: ${type}`)
        break
    }
    logger.info('[createWindow] url:', contentUrl)

    // 配置窗口参数
    const windowOptions = this._getWindowOptions(windowName)
    const opt: any = {
      title: windowTitle || themeTitle,
      // 默认系统投影；单窗口可在 WINDOW_CONFIGS 里设 hasShadow: false 覆盖
      hasShadow: true,
      ...windowOptions,
      autoHideMenuBar: true,
      menuBarVisible: false,
      showScreenSize: false,
      icon: iconPath,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(getElectronDir(), 'preload', 'bridge.js'),
      },
    }

    const win = new BrowserWindow(opt)
    const winContentsId = win.webContents.id
    win.loadURL(contentUrl)

    if (windowName === 'underlineWord') {
      // 划词浮窗：失焦后自动隐藏
      win.on('blur', () => {
        if (win.isDestroyed()) return
        setTimeout(() => {
          if (!win.isDestroyed() && win.isVisible() && !win.isFocused()) {
            win.hide()
          }
        }, 50)
      })
      this.registerUnderlineWindowShortcuts(win)
    }

    // 开发模式：shortcutWindow加载重试机制
    if (!isProd() && windowName === 'shortcutWindow' && type === 'dist') {
      this._retryWindowLoad(win, contentUrl)
    }

    // 默认打开DevTools，非特定窗口
    if (!['shortcutWindow', 'underlineWord'].includes(windowName)) {
      win.webContents.openDevTools({ mode: 'detach' })
    }

    this.windows[windowName] = win

    if (windowName === 'shortcutWindow') {
      this.disableContextMenu(win)
    }

    applyOpenDevToolsFromRuntime()

    return winContentsId
  }

  /**
   * 获取窗口配置
   */
  private _getWindowOptions(windowName: string) {
    const WINDOW_CONFIGS: Record<string, any> = {
      shortcutWindow: {
        width: 420,
        height: 480,
        resizable: false,
        show: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        frame: false,
      },
      underlineWord: {
        width: UNDERLINE_WINDOW_SIZE.width,
        height: UNDERLINE_WINDOW_SIZE.height,
        resizable: false,
        show: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        transparent: true,
        frame: false,
      },
      default: {
        width: 980,
        height: 650,
        resizable: true,
        show: true,
        alwaysOnTop: false,
        skipTaskbar: false,
        minimizable: true,
        maximizable: true,
        fullscreenable: true,
        frame: true,
      },
    }
    return { ...(WINDOW_CONFIGS[windowName] || WINDOW_CONFIGS.default) }
  }

  /**
   * 获取dist窗口url
   */
  private _getVueUrl(content: string, windowName: string): string {
    if (isProd()) {
      const { mainServer } = getConfig()
      if (
        mainServer &&
        mainServer.protocol &&
        isFileProtocol(mainServer.protocol)
      ) {
        const pathKey =
          windowName === 'glm-ppt'
            ? (mainServer as any).glmPPTPath
            : mainServer.indexPath
        return mainServer.protocol + path.join(getBaseDir(), pathKey) + content
      } else {
        logger.warn(
          '[createWindow] mainServer 配置异常或协议非 file，无法获取 vue 地址',
        )
        return ''
      }
    }
    return `http://localhost:${windowName === 'glm-ppt' ? '8086' : '8085'}${content}`
  }

  /**
   * 快捷窗口开发态重试加载
   */
  private _retryWindowLoad(win: BrowserWindow, contentUrl: string) {
    const maxRetries = 20
    let attempt = 0
    let finished = false

    const tryReload = async () => {
      if (finished || win.isDestroyed()) return
      attempt += 1
      if (attempt > maxRetries) return
      const waitMs = Math.min(300 * Math.pow(1.5, attempt - 1), 3000)
      await new Promise((r) => delay(r, waitMs))
      if (finished || win.isDestroyed()) return
      win.loadURL(contentUrl)
    }

    const onFailLoad = (
      _event: any,
      errorCode: number,
      errorDescription: string,
      _validatedURL: string,
      isMainFrame: boolean,
    ) => {
      if (!isMainFrame) return
      if (
        errorCode === -102 ||
        /ERR_CONNECTION_REFUSED/i.test(errorDescription)
      ) {
        tryReload()
      }
    }
    const onFinishLoad = () => {
      finished = true
      win.webContents.removeListener('did-fail-load', onFailLoad)
    }

    win.webContents.on('did-fail-load', onFailLoad)
    win.webContents.once('did-finish-load', onFinishLoad)
  }

  /**
   * 禁用窗口右键菜单（用于快捷键窗口）
   */
  disableContextMenu(window: BrowserWindow): void {
    if (typeof (window as any).hookWindowMessage !== 'function') return
    ;(window as any).hookWindowMessage(278, () => {
      window.setEnabled(false)
      setTimeout(() => window.setEnabled(true), 100)
      return true
    })
  }

  /**
   * 划词窗口快捷键：Esc 隐藏
   */
  registerUnderlineWindowShortcuts(window: BrowserWindow): void {
    window.webContents.on('before-input-event', (event, input) => {
      if (input.type === 'keyDown' && input.key === 'Escape') {
        event.preventDefault()
        window.hide()
      }
    })
  }

  /**
   * 获取窗口 contents id
   */
  getWCid({ windowName }: { windowName: string }): number {
    const win =
      windowName === 'main' ? getMainWindow() : this.windows[windowName]
    return win.webContents.id
  }

  /**
   * 实现窗口间通信
   */
  communicate({ receiver, content }: { receiver: string; content: any }): void {
    if (receiver === 'main') {
      getMainWindow().webContents.send(
        'controller/os/window2ToWindow1',
        content,
      )
    } else if (receiver === 'window2') {
      const win = this.windows[receiver]
      win.webContents.send('controller/os/window1ToWindow2', content)
    }
  }

  /**
   * 创建通知
   */
  createNotification(options: any, event: any): void {
    const channel = 'controller/os/sendNotification'
    this.myNotification = new Notification(options)

    if (options.clickEvent) {
      this.myNotification.on('click', () => {
        event.reply(channel, { type: 'click', msg: '您点击了通知消息' })
      })
    }
    if (options.closeEvent) {
      this.myNotification.on('close', () => {
        event.reply(channel, { type: 'close', msg: '您关闭了通知消息' })
      })
    }
    this.myNotification.show()
  }
}

WindowService.toString = () => '[class WindowService]'
const windowService = new WindowService()

export { WindowService, windowService }
