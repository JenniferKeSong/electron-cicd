import useThemeStore from '@/models/themeStore'
import {
  Theme,
  ThemeAssetsPayload,
  ThemeSetting,
  ThemeToken,
} from '@/types/ThemeTypes'
import { getAllImport } from '@/utils/importAll'
import { systemAPI } from '@/utils/ipcRenderer'
import { applyTheme } from '@/utils/theme'
import { useCallback, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'

const THEME_ROLE = 'wiko'
const SYSTEM_THEME_CACHE_TTL = 1000

// 主题 Hook：统一处理主题解析、DOM class 同步、静态资源加载与跨窗口广播
export const useTheme = () => {
  const { setImportAll, setTheme, settingTheme, setThemeSetting } =
    useThemeStore(
      useShallow((state) => ({
        setImportAll: state.setImportAll,
        setTheme: state.setTheme,
        settingTheme: state.settingTheme,
        setThemeSetting: state.setThemeSetting,
      })),
    )
  // 保存 applyTheme 返回的 token，供外部在必要时访问
  const themeToken = useRef<ThemeToken | null>(null)
  // 主题切换请求序号：仅允许最后一次请求触发后续副作用
  const latestChangeThemeSeq = useRef(0)
  // system 主题短时缓存，减少高频切换时的 IPC 查询压力
  const systemThemeCache = useRef<{ value: Theme | null; timestamp: number }>({
    value: null,
    timestamp: 0,
  })

  // 应用“已解析后的最终主题”（仅接收 dark/light，不接收 system）
  const applyResolvedTheme = useCallback(
    (nextMode: Theme) => {
      // 1) 应用 design token
      themeToken.current = applyTheme(THEME_ROLE, nextMode)
      // 2) 同步 html.dark，驱动 Tailwind/样式变量等暗色分支
      if (nextMode === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      // 3) 写入全局状态，供业务组件读取当前生效主题
      setTheme(nextMode)
    },
    [setTheme],
  )

  // 获取系统主题（带短时缓存）
  const getSystemThemeWithCache = useCallback(async (): Promise<Theme> => {
    const now = Date.now()
    const cache = systemThemeCache.current
    if (cache.value && now - cache.timestamp < SYSTEM_THEME_CACHE_TTL) {
      return cache.value
    }
    const currentSystemTheme = await systemAPI.getSystemTheme()
    systemThemeCache.current = { value: currentSystemTheme, timestamp: now }
    return currentSystemTheme
  }, [])

  // 将 ThemeSetting(system/dark/light) 解析为最终 Theme(dark/light)，并落到文档
  const changeDocTheme = useCallback(
    async (t: ThemeSetting): Promise<Theme | null> => {
      try {
        const nextMode: Theme =
          // 选择“跟随系统”时，向主进程查询系统当前主题
          t === 'system' ? await getSystemThemeWithCache() : t
        applyResolvedTheme(nextMode)
        return nextMode
      } catch (error) {
        console.warn('切换主题时出错:', error)
        return null
      }
    },
    [applyResolvedTheme, getSystemThemeWithCache],
  )

  // 按主题目录收集静态资源（images/svg），并写入 store
  const loadThemeAssets = (
    themeName = 'wiko',
    setImportAll: (assets: ThemeAssetsPayload) => void,
  ) => {
    try {
      const allImages = getAllImport(themeName, 'images')
      const allSvgs = getAllImport(themeName, 'svg')
      setImportAll({ allImages, allSvgs })
    } catch (error) {
      console.warn('Failed to load theme assets:', error)
    }
  }

  // 对外暴露资源加载能力，默认加载当前业务主题资源
  const loadAssets = useCallback(
    (themeName = 'wiko') => {
      loadThemeAssets(themeName, setImportAll)
    },
    [setImportAll],
  )

  // 初始化：先应用当前设置对应的文档主题，再加载主题静态资源
  const initTheme = useCallback(async () => {
    await changeDocTheme(settingTheme)
    loadAssets()
  }, [changeDocTheme, loadAssets, settingTheme])

  // 切换成功后统一处理跨窗口同步，避免副作用散落在主流程中
  const syncThemeToWindows = useCallback((setting: ThemeSetting) => {
    const { theme: resolved } = useThemeStore.getState()
    systemAPI.broadcastAppTheme({ mode: resolved, setting })
    systemAPI.refreshChildWindow()
  }, [])

  // 用户主动切换主题：
  // 1) 更新设置（system/dark/light）
  // 2) 应用最终主题到文档
  // 3) 广播给其他窗口并刷新子窗口显示
  const changeTheme = useCallback(
    async (theme: ThemeSetting) => {
      const seq = ++latestChangeThemeSeq.current
      setThemeSetting(theme)
      const resolved = await changeDocTheme(theme)
      if (!resolved) return
      // 并发保护：如果期间触发了更新的切换请求，则忽略当前请求的副作用
      if (seq !== latestChangeThemeSeq.current) return
      syncThemeToWindows(theme)
    },
    [changeDocTheme, setThemeSetting, syncThemeToWindows],
  )

  return {
    loadAssets,
    changeTheme,
    initTheme,
    themeToken,
    changeDocTheme,
    applyResolvedTheme,
  }
}
