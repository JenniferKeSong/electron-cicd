import { RoleThemes, Theme, ThemeColors, ThemeRole } from '@/types/ThemeTypes'

export const themes: RoleThemes = {
  wiko: {
    light: {
      // 浅色基础色
      bg: '#FFFFFF',
      lightBg: '#F5F5F5',
      textHint: '#BFBFBF', //底部责任说明小字
      textPre: '#8c8c8c',
      textTitle: '#000000',
      borderMain: '#F5F5F5',
      // 侧边导航选中态渐变（浅色版 10% 透明度）
      navActiveGradient:
        'linear-gradient(90deg, rgb(230,240,255) 0%, rgb(225,238,255) 50%, rgb(235,232,255) 100%)',
      boxShadowActive:
        '0px 10px 35px -2px rgba(114,46,209,0.05), 0px -10px 35px -2px rgba(22,119,255,0.05)',
      boxShadowNormal: '0px 10px 35px -2px rgba(0,44,140,0.05)',

      bgLinear:
        'linear-gradient(180deg,rgba(255,255,255,0) 0%,#FFFFFF 85%,#FFFFFF 100%)',

      colorPrimary: '#1677FF',
      colorPrimaryHover: '#4096FF',
      hoverBg: '#E6F4FF',
      // 品牌色
      // 浅色标签色
      colorMainRed: '#F5222d',
    },
    dark: {
      // 深色基础色
      bg: '#141414',
      textTitle: '#FFFFFF',
      lightBg: '#282828',
      textDisabled: '#3E3E3E',
      textSecondary: '#6A6A6A',
      textPre: '#bfbfbf',
      textDisabledLight: '#AEAEAE',
      textLight: '#F5F5F5',
      borderMain: '#434343',
      // 侧边导航选中态渐变（深色版 30% 透明度）
      navActiveGradient:
        'linear-gradient(91deg,rgba(22,119,255,0.3),rgba(47,84,235,0.3),rgba(114,46,209,0.3))',
      boxShadowActive:
        '0px 10px 35px -2px rgba(114,46,209,0.05), 0px -10px 35px -2px rgba(22,119,255,0.05)',
      boxShadowNormal: '0px 10px 35px -2px rgba(0,44,140,0.05)',

      bgLinear:
        'linear-gradient(180deg,rgba(20,20,20,0) 0%,#141414 85%,#141414 100%)',

      colorPrimary: '#1677FF',
      colorPrimaryHover: '#4096FF',
      hoverBg: '#002C8C',
      // 标签
      colorMainRed: '#F5222d',
    },
  },
  asus: {
    light: {},
    dark: {},
  },
}

// 转换成css可用变量
export function toCssVars(themeObj: ThemeColors) {
  const vars: Record<string, string> = {}
  for (const [key, value] of Object.entries(themeObj)) {
    if (typeof value === 'string') {
      vars[`--${key}-color`] = value
    }
  }
  return vars
}

/**
 * 应用主题并返回供AntD token使用的变量，在layout/index.tsx中设置antd全局及组件颜色token
 */
export function applyTheme(brand: ThemeRole, mode: Theme) {
  const themeObj = themes[brand][mode]
  const cssVars = toCssVars(themeObj)
  const root = document.documentElement
  for (const [key, val] of Object.entries(cssVars)) {
    root.style.setProperty(key, val)
  }
  return themeObj
}
