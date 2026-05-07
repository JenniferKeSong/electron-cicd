import { electronAPI } from './context'

/**
 * 系统相关 API
 */
export const systemAPI = {
  /**
   * 获取系统语言
   */

  getSystemTheme: () => {
    return electronAPI?.getSystemTheme?.() || Promise.resolve('light')
  },
  updateSystemTheme: (
    callback: (event: any, theme: 'light' | 'dark') => void,
  ) => {
    return electronAPI?.updateSystemTheme?.(callback)
  },
  removeUpdateTheme: () => {
    return electronAPI?.removeUpdateTheme?.()
  },

  refreshChildWindow: () => {
    return electronAPI?.refreshChildWindow?.()
  },

  broadcastAppTheme: (payload: {
    mode: 'light' | 'dark'
    setting?: 'light' | 'dark' | 'system'
  }) => {
    electronAPI?.broadcastAppTheme?.(payload)
  },
}
