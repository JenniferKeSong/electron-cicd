import { electronAPI } from './context'

/**
 * 应用相关 API
 */
export const appAPI = {
  /**
   * 获取应用信息
   */
  getInfo: () => {
    return electronAPI?.app || {}
  },
  logger: (data: any) => {
    return electronAPI?.logger?.(data) ?? Promise.resolve()
  },
  quitApp: () => {
    return electronAPI?.common?.quitApp?.() || Promise.resolve()
  },
  updateApp: () => {
    return electronAPI?.common?.updateApp?.() || Promise.resolve()
  },
  // openGlmPPT: () => {
  //   return electronAPI.openGlmPPT()
  // },
  openLoginWindow: (loginUrl: string) => {
    return electronAPI?.openLoginWindow?.(loginUrl)
  },
  closeLoginWindow: () => {
    return electronAPI?.closeLoginWindow?.()
  },
  /** 在 Electron 主进程创建 BrowserWindow 打开第三方页面 */
  openExternalWindow: (args: {
    url: string
    key?: string
    title?: string
    width?: number
    height?: number
  }) => {
    return typeof (electronAPI as any)?.openExternalWindow === 'function'
      ? (electronAPI as any).openExternalWindow(args)
      : Promise.resolve(false)
  },
  /** 在主窗口内嵌入 BrowserView */
  embeddedView: {
    create: (args: { key: string; url: string; userAgent?: string }) => {
      return typeof (electronAPI as any)?.embeddedView?.create === 'function'
        ? (electronAPI as any).embeddedView.create(args)
        : Promise.resolve(false)
    },
    setBounds: (args: { key: string; bounds: { x: number; y: number; width: number; height: number } }) => {
      return typeof (electronAPI as any)?.embeddedView?.setBounds === 'function'
        ? (electronAPI as any).embeddedView.setBounds(args)
        : Promise.resolve(false)
    },
    hide: (key: string) => {
      return typeof (electronAPI as any)?.embeddedView?.hide === 'function'
        ? (electronAPI as any).embeddedView.hide(key)
        : Promise.resolve(false)
    },
    destroy: (key: string) => {
      return typeof (electronAPI as any)?.embeddedView?.destroy === 'function'
        ? (electronAPI as any).embeddedView.destroy(key)
        : Promise.resolve(false)
    },
  },
  getResourcePath: () => {
    return electronAPI?.common?.getResourcePath() || Promise.resolve('')
  },
  readImage: (path: string) => {
    return electronAPI?.common?.readImage(path) || ''
  },
  openBrowserLink: (url: string) => {
    return electronAPI?.common?.openBrowserLink(url) || Promise.resolve(false)
  },
  getLogFile: () => {
    return electronAPI?.common?.getLogFile() || Promise.resolve(new ArrayBuffer(0))
  },
  openMainWindow: () => {
    return electronAPI?.openMainWindow?.() || Promise.resolve(true)
  },
}
