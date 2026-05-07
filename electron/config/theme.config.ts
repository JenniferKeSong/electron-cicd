import { getBaseDir } from 'ee-core/ps'
import path from 'path'

export type ThemeKey = 'demo'

export interface ThemeMeta {
  title: string
  name: string
}

export interface IThemeConfig {
  readonly iconPath: string // 图片路径
  readonly icoPath: string // .ico 图标路径
  readonly trayIcon: string // 托盘图片路径
  readonly title: string // 窗口标题
  readonly name: string // appId 英文名
  readonly theme: ThemeKey // 主题
}

export const DEFAULT_THEME: ThemeKey = 'demo'

export const THEME_META: Record<ThemeKey, ThemeMeta> = {
  demo: { title: 'Demo', name: 'demo' },
} as const

export const ASSETS_PATHS = {
  LOGO_32: 'logo-32.png',
  TRAY_ICON: 'tray.png',
  ICO_ICON: 'icon.ico',
  BUILD_ICOS_DIR: 'build/icons',
  PUBLIC_IMAGES_DIR: 'public/images',
} as const

function validateThemeKey(theme: unknown): theme is ThemeKey {
  return typeof theme === 'string' && theme in THEME_META
}

export function getThemeKey(theme?: ThemeKey | string): ThemeKey {
  if (theme && validateThemeKey(theme)) {
    return theme as ThemeKey
  }
  return DEFAULT_THEME
}

export function getIconDir(themeKey: ThemeKey): string {
  return path.join(getBaseDir(), ASSETS_PATHS.PUBLIC_IMAGES_DIR, themeKey)
}

export function getIcoPath(themeKey: ThemeKey): string {
  return path.join(ASSETS_PATHS.BUILD_ICOS_DIR, themeKey, ASSETS_PATHS.ICO_ICON)
}

const themeConfigCache = new Map<ThemeKey, IThemeConfig>()

export function clearThemeConfigCache(): void {
  themeConfigCache.clear()
}

export function ThemeConfig(theme?: ThemeKey | string): IThemeConfig {
  const themeKey = getThemeKey(theme)

  if (themeConfigCache.has(themeKey)) {
    return themeConfigCache.get(themeKey)!
  }

  const iconDir = getIconDir(themeKey)
  const { title, name } = THEME_META[themeKey]

  const config: IThemeConfig = Object.freeze({
    iconPath: path.join(iconDir, ASSETS_PATHS.LOGO_32),
    icoPath: getIcoPath(themeKey),
    trayIcon: path.join(iconDir, ASSETS_PATHS.TRAY_ICON),
    title,
    name,
    theme: themeKey,
  })

  themeConfigCache.set(themeKey, config)
  return config
}

export default ThemeConfig
