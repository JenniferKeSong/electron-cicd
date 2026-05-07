import { useTheme } from '@/hooks/useTheme'
import useThemeStore from '@/models/themeStore'
import Loading from '@/pages/Loading'
import type { ThemeSetting } from '@/types/ThemeTypes'
import { appAPI, isEE, systemAPI } from '@/utils/ipcRenderer'
import { XProvider } from '@ant-design/x'
import { theme as antdTheme } from 'antd'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const DEFAULT_BORDER_RADIUS = 8

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // -------------------- Store / Hooks --------------------
  const { initTheme, themeToken, changeDocTheme, applyResolvedTheme } =
    useTheme()
  const { theme, settingTheme, setThemeSetting } = useThemeStore()

  // -------------------- Local State --------------------
  const [loading] = useState(false)
  const isMountedRef = useRef(true)

  // -------------------- Derived Theme Config --------------------
  // 使用 useMemo 缓存主题配置对象，避免每次渲染都重新创建
  const xProviderTheme = useMemo(
    () => ({
      algorithm:
        theme === 'light'
          ? antdTheme.defaultAlgorithm
          : antdTheme.darkAlgorithm,
      token: {
        borderRadius: DEFAULT_BORDER_RADIUS,
      },
      components: {
        Button: {
          defaultBorderColor: themeToken.current?.borderMain,
        },
        Think: {
          colorTextBlink: 'var(--colorPrimary-color)',
          colorTextBlinkDefault: 'var(--colorPrimary-color)',
        },
      },
    }),
    [theme, themeToken],
  )

  // 初始化时获取本地资源路径配置，供全局使用（如图片预览等）
  const getLocalConfig = useCallback(() => {
    appAPI.getResourcePath().then((path: string) => {
      if (path) {
        const base = path.replace(/\\/g, '/').replace(/\/?$/, '/')
        localStorage.setItem('resourcePath', decodeURIComponent(base))
      }
    })
  }, [])

  // -------------------- Effects: Initialization --------------------
  useEffect(() => {
    getLocalConfig()
    initTheme()

    // 自动化无障碍检测（仅开发环境启用，避免打入生产包）
    if (import.meta.env.DEV) {
      void import('axe-core').then(({ default: axe }) => {
        axe.run(document, {}, (err, results) => {
          if (err) {
            console.error('Accessibility check failed:', err)
            return
          }
          if (results.violations.length > 0) {
            console.warn('Accessibility violations:', results.violations)
          } else {
            console.log('No accessibility violations 🎉')
          }
        })
      })
    }

    return () => {
      isMountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // -------------------- Effects: Theme / Language Sync --------------------
  useEffect(() => {
    // 跟随系统时，才监听主题变化
    if (settingTheme === 'system') {
      systemAPI.updateSystemTheme((_: any, theme: any) => {
        changeDocTheme(theme)
      })

      return () => {
        systemAPI.removeUpdateTheme()
      }
    }
  }, [settingTheme, changeDocTheme])

  // 其他 BrowserWindow（划词浮窗等）与主窗口共用前端资源
  // 需同步 CSS 变量与 zustand
  useEffect(() => {
    if (!isEE) return
    const api = window.electronAPI
    if (!api?.onSyncAppTheme) return

    const handler = (
      _e: unknown,
      payload: { mode: 'light' | 'dark'; setting?: ThemeSetting },
    ) => {
      applyResolvedTheme(payload.mode)
      if (payload.setting) {
        setThemeSetting(payload.setting)
      }
    }
    api.onSyncAppTheme(handler)
    return () => {
      api.offSyncAppTheme?.(handler)
    }
  }, [applyResolvedTheme, setThemeSetting])

  // -------------------- Render --------------------
  return (
    <XProvider theme={xProviderTheme}>
      {loading ? <Loading /> : children}
    </XProvider>
  )
}

export default Layout
