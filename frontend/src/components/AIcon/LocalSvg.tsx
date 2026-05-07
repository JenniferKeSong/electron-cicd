import useThemeStore from '@/models/themeStore'
import Icon from '@ant-design/icons'
import React from 'react'
import type { IconFontProps } from './types'

/**
 * 本地 SVG 图标组件
 */
const LocalSvg: React.FC<IconFontProps> = ({
  name,
  width,
  height,
  size,
  alt,
  style,
  ...restProps
}) => {
  const { allSvgs, theme } = useThemeStore()

  // 查找 SVG
  const svgSrc = React.useMemo(() => {
    const currentThemeSvgs = allSvgs?.[theme as keyof typeof allSvgs] || []

    // 创建映射
    const svgMap = currentThemeSvgs.reduce((map, item) => {
      if (item?.name && item?.value) {
        map.set(item.name, item.value)
        map.set(item.name.toLowerCase(), item.value)
      }
      return map
    }, new Map<string, string>())

    return svgMap.get(name) || svgMap.get(name.toLowerCase())
  }, [allSvgs, theme, name])

  // 使用 ref 缓存组件实例，确保 onClick 稳定
  const componentRef = React.useRef<React.FC>(() => null)

  // 仅在核心属性变化时更新组件引用
  React.useEffect(() => {
    componentRef.current = () => (
      <img
        src={svgSrc}
        alt={alt || 'icon'}
        width={width || size || 16}
        height={height || size || 'auto'}
        draggable={false}
        style={{
          display: 'block',
          objectFit: 'contain',
          ...style,
        }}
      />
    )
  }, [svgSrc, alt, width, height, size])

  // 未找到图标时的占位符
  if (!svgSrc) {
    return (
      <div
        style={{
          width: width || size || 16,
          height: height || size || 16,
          backgroundColor: '#f0f0f0',
          borderRadius: 4,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
        {...restProps}
      >
        <span style={{ fontSize: 12, color: '#999' }}>—</span>
      </div>
    )
  }

  // 渲染图标
  return <Icon component={componentRef.current} {...restProps} />
}

export default LocalSvg
