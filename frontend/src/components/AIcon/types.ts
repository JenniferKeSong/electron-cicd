import type { ButtonProps, TooltipProps } from 'antd'
import React, { CSSProperties, ReactNode } from 'react'

/** 基础图标属性 */
export interface BaseIconProps {
  /** 图标名称 */
  name: string
  /** 图标宽度 */
  width?: string | number
  /** 图标高度 */
  height?: string | number
  /** 图标大小（同时设置宽高） */
  size?: string | number
  /** 图标颜色 */
  color?: string
  /** 图标替代文本 */
  alt?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** CSS 类名 */
  className?: string
  /** 其他属性 */
  [key: string]: any
}

/** IconFont 图标属性 */
export interface IconFontProps extends BaseIconProps {
  /** 是否在暗色主题下反转颜色 */
  invert?: number
}

/** AIcon 组件属性 */
export interface AIconProps extends IconFontProps {
  /** 自定义外层样式 */
  className?: string
  style?: CSSProperties
  /** 点击时样式，可覆盖默认 hover 样式 */
  hoverClassName?: string
  /** 是否禁用点击 */
  disabled?: boolean
  /** 工具提示文本 */
  tooltip?: ReactNode | (() => ReactNode)
  /** 工具提示配置 */
  tooltipProps?: Omit<TooltipProps, 'title' | 'children'>

  buttonProps?: ButtonProps

  customIcon?: React.ReactNode
}
