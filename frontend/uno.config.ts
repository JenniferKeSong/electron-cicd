import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  // ...UnoCSS options
  presets: [presetUno(), presetAttributify(), presetIcons()],
  theme: {
    breakpoints: {
      xs: '370px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  // 基于 theme.ts 中 CSS 变量的语义化原子类
  // 说明：所有 var(--xxx-color) 由 applyTheme 根据当前主题写入
  shortcuts: [
    {
      // 渐变背景（品牌蓝渐变）
      'bg-gradient-30':
        'bg-[linear-gradient(91deg,rgba(22,119,255,0.3),rgba(47,84,235,0.3),rgba(114,46,209,0.3))]',
      'bg-gradient-10':
        'bg-[linear-gradient(91deg,rgba(22,119,255,0.1),rgba(47,84,235,0.1),rgba(114,46,209,0.1))]',
      'bg-gradient-100':
        'bg-[linear-gradient(90deg,rgba(22,119,255,1),rgba(47,84,235,1),rgba(114,46,209,1))]',

      // 基础背景（light / dark 自动随 var 变化）
      'bg-page': 'bg-[var(--bg-color)]', // 页面主背景，对应 bg
      'bg-surface': 'bg-[var(--lightBg-color)]', // 内容区/卡片背景，对应 lightBg
      'bg-surface-50': 'bg-[var(--lightBg-color)]/50', // 内容区/卡片背景，对应 lightBg

      // 文本颜色
      'text-title': 'text-[var(--textTitle-color)]', // 主要文字
      'text-hint': 'text-[var(--textHint-color)]', // 提示文字
      'text-pre': 'text-[var(--textPre-color)]', // 文字
      'text-light': 'text-[var(--textLight-color)]', // 反色文字（深色背景上的白字等）
      'text-primary': 'text-[var(--colorPrimary-color)]', // 主要颜色

      // 边框
      'border-main': 'border-[var(--borderMain-color)]',

      // 导航选中态背景（自动根据主题使用 10% 或 30% 的渐变）
      'bg-nav-active': '[background:var(--navActiveGradient-color)]',

      // flex布局
      'flex-center': 'flex justify-center items-center',

      // // 标签主色（uno描边/文字）—— 与设计稿中的主色一一对应
      // 'text-tag-red': 'text-[var(--colorMainRed-color)]',
      // 'text-tag-orange': 'text-[var(--colorMainOrange-color)]',
      // 'text-tag-yellow': 'text-[var(--colorMainYellowOrange-color)]',
      // 'text-tag-green': 'text-[var(--colorMainGreen-color)]',
      // 'text-tag-teal': 'text-[var(--colorMainTeal-color)]',
      // 'text-tag-blue': 'text-[var(--colorMainBlue-color)]',
      // 'text-tag-purple': 'text-[var(--colorMainPurple-color)]',
      // 'text-tag-pink': 'text-[var(--colorMainPink-color)]',

      // // 标签背景色（fill）—— 对应 colorBgXXX
      // 'bg-tag-red': 'bg-[var(--colorBgRed-color)]',
      // 'bg-tag-orange': 'bg-[var(--colorBgOrange-color)]',
      // 'bg-tag-yellow': 'bg-[var(--colorBgYellow-color)]',
      // 'bg-tag-green': 'bg-[var(--colorBgGreen-color)]',
      // 'bg-tag-teal': 'bg-[var(--colorBgTeal-color)]',
      // 'bg-tag-blue': 'bg-[var(--colorBgBlue-color)]',
      // 'bg-tag-purple': 'bg-[var(--colorBgPurple-color)]',
      // 'bg-tag-pink': 'bg-[var(--colorBgPink-color)]',
    },
    [
      /^f-(.*)-(\d+)$/,
      ([, d, g]) => `flex flex-${d} gap-${g}px justify-center items-center`,
    ],
  ],

  rules: [
    // Margin
    [/^m-(\d+)$/, ([, num]) => ({ margin: `${num}px` })],
    [/^mt-(\d+)$/, ([, num]) => ({ 'margin-top': `${num}px` })],
    [/^mr-(\d+)$/, ([, num]) => ({ 'margin-right': `${num}px` })],
    [/^mb-(\d+)$/, ([, num]) => ({ 'margin-bottom': `${num}px` })],
    [/^ml-(\d+)$/, ([, num]) => ({ 'margin-left': `${num}px` })],
    [
      /^mx-(\d+)$/,
      ([, num]) => ({ 'margin-left': `${num}px`, 'margin-right': `${num}px` }),
    ],
    [
      /^my-(\d+)$/,
      ([, num]) => ({ 'margin-top': `${num}px`, 'margin-bottom': `${num}px` }),
    ],

    // Padding
    [/^p-(\d+)$/, ([, num]) => ({ padding: `${num}px` })],
    [/^pt-(\d+)$/, ([, num]) => ({ 'padding-top': `${num}px` })],
    [/^pr-(\d+)$/, ([, num]) => ({ 'padding-right': `${num}px` })],
    [/^pb-(\d+)$/, ([, num]) => ({ 'padding-bottom': `${num}px` })],
    [/^pl-(\d+)$/, ([, num]) => ({ 'padding-left': `${num}px` })],
    [
      /^px-(\d+)$/,
      ([, num]) => ({
        'padding-left': `${num}px`,
        'padding-right': `${num}px`,
      }),
    ],
    [
      /^py-(\d+)$/,
      ([, num]) => ({
        'padding-top': `${num}px`,
        'padding-bottom': `${num}px`,
      }),
    ],

    // Width and Height
    [/^w-(\d+)$/, ([, num]) => ({ width: `${num}px` })],
    [/^h-(\d+)$/, ([, num]) => ({ height: `${num}px` })],
    [/^min-w-(\d+)$/, ([, num]) => ({ 'min-width': `${num}px` })],
    [/^min-h-(\d+)$/, ([, num]) => ({ 'min-height': `${num}px` })],
    [/^max-w-(\d+)$/, ([, num]) => ({ 'max-width': `${num}px` })],
    [/^max-h-(\d+)$/, ([, num]) => ({ 'max-height': `${num}px` })],

    // Gap
    [/^gap-(\d+)$/, ([, num]) => ({ gap: `${num}px` })],
    [/^gap-x-(\d+)$/, ([, num]) => ({ 'column-gap': `${num}px` })],
    [/^gap-y-(\d+)$/, ([, num]) => ({ 'row-gap': `${num}px` })],

    // Border Radius
    [/^rounded-(\d+)$/, ([, num]) => ({ 'border-radius': `${num}px` })],
    [
      /^rounded-t-(\d+)$/,
      ([, num]) => ({
        'border-top-left-radius': `${num}px`,
        'border-top-right-radius': `${num}px`,
      }),
    ],
    [
      /^rounded-r-(\d+)$/,
      ([, num]) => ({
        'border-top-right-radius': `${num}px`,
        'border-bottom-right-radius': `${num}px`,
      }),
    ],
    [
      /^rounded-b-(\d+)$/,
      ([, num]) => ({
        'border-bottom-left-radius': `${num}px`,
        'border-bottom-right-radius': `${num}px`,
      }),
    ],
    [
      /^rounded-l-(\d+)$/,
      ([, num]) => ({
        'border-top-left-radius': `${num}px`,
        'border-bottom-left-radius': `${num}px`,
      }),
    ],
    [
      /^rounded-tl-(\d+)$/,
      ([, num]) => ({ 'border-top-left-radius': `${num}px` }),
    ],
    [
      /^rounded-tr-(\d+)$/,
      ([, num]) => ({ 'border-top-right-radius': `${num}px` }),
    ],
    [
      /^rounded-bl-(\d+)$/,
      ([, num]) => ({ 'border-bottom-left-radius': `${num}px` }),
    ],
    [
      /^rounded-br-(\d+)$/,
      ([, num]) => ({ 'border-bottom-right-radius': `${num}px` }),
    ],

    // Font Size
    [/^text-(\d+)$/, ([, num]) => ({ 'font-size': `${num}px` })],

    // Line Height
    [/^leading-(\d+)$/, ([, num]) => ({ 'line-height': `${num}px` })],

    // Top, Right, Bottom, Left
    [/^top-(\d+)$/, ([, num]) => ({ top: `${num}px` })],
    [/^right-(\d+)$/, ([, num]) => ({ right: `${num}px` })],
    [/^bottom-(\d+)$/, ([, num]) => ({ bottom: `${num}px` })],
    [/^left-(\d+)$/, ([, num]) => ({ left: `${num}px` })],

    // Border Width
    [/^border-(\d+)$/, ([, num]) => ({ 'border-width': `${num}px` })],
    [/^border-t-(\d+)$/, ([, num]) => ({ 'border-top-width': `${num}px` })],
    [/^border-r-(\d+)$/, ([, num]) => ({ 'border-right-width': `${num}px` })],
    [/^border-b-(\d+)$/, ([, num]) => ({ 'border-bottom-width': `${num}px` })],
    [/^border-l-(\d+)$/, ([, num]) => ({ 'border-left-width': `${num}px` })],

    // Spacing (for transform, translate, etc.)
    [/^translate-x-(\d+)$/, ([, num]) => ({ '--un-translate-x': `${num}px` })],
    [/^translate-y-(\d+)$/, ([, num]) => ({ '--un-translate-y': `${num}px` })],

    // Z-index
    [/^z-(\d+)$/, ([, num]) => ({ 'z-index': num })],

    // Opacity with percentage
    [/^opacity-(\d+)$/, ([, num]) => ({ opacity: Number(num) / 100 })],
    // border快捷方式 b-1-solid-#000
    [
      /^b-(\d+)-solid-(\w+)$/,
      ([, num, color]) => ({ border: `${num}px solid ${color}` }),
    ],
  ],
})
