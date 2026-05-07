import { createFromIconfontCN } from '@ant-design/icons'
import { isNumber } from 'lodash'
import type { BaseIconProps } from './types'
// 创建全局 IconFont 实例
// TODO:线上地址方便调试，打包之前记得替换iconfont文件，/public/iconfont/
// !! 上传到云端图标库的图标记得清除icon本身颜色，否则本地组件无法修改颜色
const IconFont = createFromIconfontCN({
  scriptUrl: import.meta.env.VITE_ICONFONT_URL,
})

/**
 * IconFont 图标组件
 */
const Index = ({
  name,
  color,
  size,
  style,
  invert,
  className,
  ...restProps
}: BaseIconProps) => {
  // 未找到图标时的占位符
  if (!name) {
    return (
      <span
        style={{
          width: size || 16,
          height: size || 16,
          backgroundColor: '#f5f5f5',
          border: '1px dashed #d9d9d9',
          borderRadius: 4,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
        className={className}
      >
        <span style={{ fontSize: 12, color: '#999' }}>i</span>
      </span>
    )
  }

  return (
    <IconFont
      type={name}
      style={{
        fontSize: size || 16,
        color: color || 'inherit',
        filter: isNumber(invert) ? `invert(${invert})` : undefined,
        ...style,
      }}
      aria-label={name}
      role="img"
      className={`my-iconfont ${className}`}
      {...restProps}
    />
  )
}

export default Index
