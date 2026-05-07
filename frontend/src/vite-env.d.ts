/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    electronAPI?: {
      /** 当前平台：darwin | win32 | linux */
      platform: string

      ipcRenderer?: {
        on?: (...args: any[]) => any
        once?: (...args: any[]) => any
        removeListener?: (...args: any[]) => any
        removeAllListeners?: (...args: any[]) => any
        send?: (...args: any[]) => any
        sendSync?: (...args: any[]) => any
        postMessage?: (...args: any[]) => any
        sendTo?: (...args: any[]) => any
        sendToHost?: (...args: any[]) => any
        invoke?: (...args: any[]) => Promise<any>
      }

      getSystemTheme?: () => Promise<'light' | 'dark'>
      updateSystemTheme?: (callback: (event: any, theme: 'light' | 'dark') => void) => void
      removeUpdateTheme?: () => void
      refreshChildWindow?: () => void

      broadcastAppTheme?: (payload: {
        mode: 'light' | 'dark'
        setting?: 'light' | 'dark' | 'system'
      }) => void

      onSyncAppTheme?: (
        listener: (
          event: any,
          payload: { mode: 'light' | 'dark'; setting?: 'light' | 'dark' | 'system' },
        ) => void,
      ) => void
      offSyncAppTheme?: (
        listener: (
          event: any,
          payload: { mode: 'light' | 'dark'; setting?: 'light' | 'dark' | 'system' },
        ) => void,
      ) => void

      logger?: (data: { info: string; type?: 'info' | 'error' | 'warn' | 'debug' }) => Promise<void>

      onSetUnderlineWord?: (
        listener: (event: any, payload: { text: string; x: number; y: number }) => void,
      ) => void
      offSetUnderlineWord?: (
        listener: (event: any, payload: { text: string; x: number; y: number }) => void,
      ) => void

      setReadingHighlightEnabled?: (enabled: boolean, showDialog?: boolean) => Promise<boolean>
      closeUnderlineWindow?: () => Promise<void>
      updateUnderlineWindowSize?: (width: number) => Promise<void>
      openMainWindow?: () => Promise<boolean>
      sendShortcutAction?: (type: string, value: string) => void

      common?: {
        getResourcePath: () => Promise<string>
      }
    }
  }
}

export {}
