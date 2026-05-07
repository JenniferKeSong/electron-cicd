export type Theme = 'light' | 'dark'
export type ThemeRole = 'wiko' | 'asus'
export type ThemeSetting = Theme | 'system'

export const themes = ['light', 'dark'] as const
export const DEFAULT_THEME: Theme = 'dark'

// 主题配置优先级
export enum ThemePriority {
  USER_SAVED = 1,
  ENVIRONMENT = 2,
  DEFAULT = 3,
}

// 主题验证相关类型
export interface ThemeValidationResult {
  isValid: boolean
  theme?: Theme
  source?: string
}

export interface ThemeAssetItem {
  name: string
  value: string
}

export interface IThemeAsset {
  light: ThemeAssetItem[]
  dark: ThemeAssetItem[]
}
export interface ThemeAssetsPayload {
  allImages: IThemeAsset
  allSvgs: IThemeAsset
}

// 通用声明：可用于扩展任意键值的主题颜色配置
export type ThemeColors = Record<string, string | undefined>

// Ant Design 主题令牌类型 - 从 ThemeColors 转换后的标准格式
export type ThemeToken = {
  // Ant Design 标准令牌映射
  colorPrimary?: string
  colorBgBase?: string
  colorTextBase?: string
  colorBorder?: string
  colorBgContainer?: string
  colorSuccess?: string
  colorWarning?: string
  colorError?: string

  // 扩展令牌
  colorSecondary?: string
  colorBgSecondary?: string
  colorTextSecondary?: string
  colorCardBg?: string
  colorHeaderBg?: string
  colorFooterBg?: string
  colorLink?: string
} & Partial<ThemeColors>

export type RoleThemes = {
  [r in ThemeRole]: {
    light: ThemeColors
    dark: ThemeColors
  }
}
