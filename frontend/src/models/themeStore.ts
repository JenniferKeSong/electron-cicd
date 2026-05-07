import {
  DEFAULT_THEME,
  Theme,
  ThemeAssetsPayload,
  ThemeSetting,
} from '@/types/ThemeTypes'
import { create } from 'zustand'

type ThemeStore = ThemeAssetsPayload & {
  settingTheme: ThemeSetting
  theme: Theme
  setTheme: (themeName: Theme) => void
  setImportAll: (assets: ThemeAssetsPayload) => void
  setThemeSetting: (t: ThemeSetting) => void
}

const initThemeValue = { light: [], dark: [] }

const useThemeStore = create<ThemeStore>()((set, get) => ({
  settingTheme: (localStorage.getItem('theme') as ThemeSetting) || 'system',
  theme: DEFAULT_THEME,
  allImages: initThemeValue,
  allSvgs: initThemeValue,

  setTheme: (themeName: Theme) => {
    if (!themeName || themeName === get().theme) return
    set({ theme: themeName })
  },

  setImportAll: ({ allImages, allSvgs }) => {
    set(() => ({
      allImages: allImages || initThemeValue,
      allSvgs: allSvgs || initThemeValue,
    }))
  },

  setThemeSetting: (t: ThemeSetting) => {
    localStorage.setItem('theme', t)
    set({ settingTheme: t })
  },
}))

export default useThemeStore
