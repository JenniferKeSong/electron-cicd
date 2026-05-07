import { Button, Tooltip } from 'antd'
import React from 'react'
import IconFont from './IconFont'
import LocalSvg from './LocalSvg'
import type { AIconProps } from './types'

const AIcon: React.FC<AIconProps> = ({
  tooltip,
  tooltipProps,
  invert,
  onClick,
  name,
  disabled,
  buttonProps,
  customIcon,
  ...restProps
}) => {
  // 判断图标类型并渲染对应组件
  const isIconFont = name?.startsWith('icon-')

  const iconNode = isIconFont ? (
    <IconFont invert={invert} name={name} {...restProps} />
  ) : (
    <LocalSvg name={name} {...restProps} />
  )

  // 如果onclick存在，则包裹button按钮
  const clickableWrapper =
    onClick || tooltip ? (
      <Button
        type="text"
        disabled={disabled}
        className={'p-4 rounded-4'}
        onClick={onClick}
        style={{
          border: 'none',
          height: 'fit-content',
          padding: 4,
          ...buttonProps?.style,
        }}
        {...buttonProps}
      >
        {customIcon || iconNode}
      </Button>
    ) : (
      iconNode
    )

  // 如果有 tooltip，则包裹 Tooltip 组件
  return tooltip ? (
    <Tooltip title={tooltip} placement="bottom" arrow={false} {...tooltipProps}>
      {clickableWrapper}
    </Tooltip>
  ) : (
    clickableWrapper
  )
}

export default AIcon
export type { AIconProps, BaseIconProps, IconFontProps } from './types'
export { IconFont, LocalSvg }

/**
 * AIcon 统一图标组件
 * ==================
 *
 * 用于在项目中统一渲染图标，支持 IconFont 与本地 SVG 图标，支持添加 tooltip 提示。
 *
 * ## 使用方法
 *
 * ```tsx
 * import AIcon from '@@/AIcon'
 *
 * // 使用 IconFont 图标（name 以 'icon-' 开头）
 * <AIcon name="icon-add" size={24} />
 *
 * // 使用本地 svg 图标（name 不是以 'icon-' 开头，自定义业务图标名）
 * <AIcon name="sendBtn" size={20} invert />
 *
 * // 带 tooltip 提示
 * <AIcon name="icon-edit" tooltip="编辑" />
 *
 * // 更多支持的 props 见 AIconProps
 * ```
 *
 * ## 主要 Props
 * | 参数       | 说明                | 类型           | 默认值   |
 * |------------|---------------------|----------------|----------|
 * | name       | 图标名称            | string         | -        |
 * | size       | 图标大小(单位px)     | number         | 20       |
 * | invert     | 是否反色             | number        | 根据深浅主题变化 |自定义：0 不反色 1 反色
 * | tooltip    | 鼠标悬浮提示文字      | ReactNode      | -        |
 * | onClick    | 点击事件             | function      | 自动增加hover等样式 |
 * | ...        | 其余参考 types 文件   |                |          |
 *
 * ## 组件说明
 * - 若 name 以 'icon-' 开头，使用 IconFont 方式渲染；
 * - 否则认为是本地 SVG 图标；
 * - 支持 tooltip 提示功能；
 *
 * ## 扩展
 * - 也可直接引入 IconFont 或 LocalSvg 独立使用（见上方导出）。
 */
