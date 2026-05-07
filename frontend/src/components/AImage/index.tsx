import useThemeStore from '@/models/themeStore'
import { Image, ImageProps } from 'antd'
import React, { useCallback, useMemo, useRef } from 'react'
export interface AImageProps extends Omit<ImageProps, 'src'> {
  /** 主题图片名（必填） */
  name: string
  /** 图片格式，默认 png，仅预留参数（如需实现可扩展） */
  format?: 'png' | 'jpg' | 'jpeg' | 'svg' | 'webp'
  /** 加载失败时显示的 fallback 图片 */
  fallback?: string
  /** 是否启用缓存，默认 true */
  enableCache?: boolean
  /** 自定义占位组件 */
  placeholder?: React.ReactNode
  /** 自定义未找到图片的组件 */
  notFoundComponent?: React.ReactNode
}

const DEFAULT_FALLBACK =
  'data:image/png;base64,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'

const AImage: React.FC<AImageProps> = React.memo(
  ({
    name,
    fallback = DEFAULT_FALLBACK,
    enableCache = true,
    placeholder,
    notFoundComponent,
    ...imageProps
  }) => {
    const { allImages, theme } = useThemeStore()
    // 使用 Map 缓存图片查找结果，避免重复计算
    const imgCache = useRef<Map<string, string>>(new Map())
    // 缓存主题版本，避免不必要的缓存清除
    const lastThemeVersion = useRef<string>('')

    // 智能缓存：仅在主题实际变化时清除缓存
    const currentThemeVersion = useMemo(() => {
      const lightImages = allImages.light || []
      const darkImages = allImages.dark || []
      const allImageList = [...lightImages, ...darkImages]
      return allImageList.map((img) => `${img.name}:${img.value}`).join('|')
    }, [allImages])

    // 创建图片名称到值的映射表，提升查找性能
    const imageMap = useMemo(() => {
      const currentThemeImages = allImages?.[theme as keyof typeof allImages]

      if (!currentThemeImages?.length) {
        return new Map<string, string>()
      }

      // 使用单次遍历创建映射，避免重复代码
      return currentThemeImages.reduce((map, item) => {
        if (item?.name && item?.value) {
          map.set(item.name, item.value)
          map.set(item.name.toLowerCase(), item.value)
        }
        return map
      }, new Map<string, string>())
    }, [allImages, theme])

    // 优化的图片查找逻辑，带缓存功能和更好的错误处理
    const getImageSrc = useCallback(
      (imageName: string): string => {
        // 输入验证
        if (!imageName || typeof imageName !== 'string') {
          console.warn('[AImage] Invalid image name provided:', imageName)
          return ''
        }

        // 检查主题是否发生变化，如果变化则清除缓存
        if (currentThemeVersion !== lastThemeVersion.current) {
          imgCache.current.clear()
          lastThemeVersion.current = currentThemeVersion
        }

        // 如果启用缓存，先从缓存查找
        if (enableCache && imgCache.current.has(imageName)) {
          return imgCache.current.get(imageName)!
        }

        // 尝试多种查找策略
        let imageSrc = ''

        // 1. 精确匹配
        imageSrc = imageMap.get(imageName) || ''

        // 2. 如果没找到，尝试大小写不敏感匹配
        if (!imageSrc) {
          imageSrc = imageMap.get(imageName.toLowerCase()) || ''
        }

        // 3. 记录未找到的图片（便于调试）
        if (!imageSrc) {
          const availableImages = Array.from(imageMap.keys()).slice(0, 10)
          console.warn(
            `[AImage] Image "${imageName}" not found. Available images: ${availableImages.join(', ')}${availableImages.length >= 10 ? '...' : ''}`,
          )
        }

        // 缓存结果（包括空结果，避免重复查找）
        if (enableCache) {
          imgCache.current.set(imageName, imageSrc)
        }

        return imageSrc
      },
      [imageMap, currentThemeVersion, enableCache],
    )

    const imageSrc = useMemo(() => getImageSrc(name), [name, getImageSrc])

    // 未指定 name 时的占位组件
    if (!name) {
      if (placeholder) {
        return <>{placeholder}</>
      }
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: '#bbb',
            fontSize: 13,
            padding: 10,
            background: '#fafafa',
            borderRadius: 6,
            border: '1px dashed #d9d9d9',
            minHeight: 60,
            ...imageProps.style,
          }}
        >
          <span style={{ userSelect: 'none' }}>未指定图片 name</span>
        </div>
      )
    }

    // 图片找不到时的处理
    if (!imageSrc) {
      if (notFoundComponent) {
        return <>{notFoundComponent}</>
      }
      return (
        <Image
          src={fallback}
          preview={false}
          alt="fallback"
          loading="lazy"
          {...imageProps}
          style={{
            opacity: 0.6,
            filter: 'grayscale(0.8)',
            transition: 'all 0.3s ease',
            ...imageProps.style,
          }}
          onError={(e) => {
            console.warn(`AImage: Fallback image failed to load for "${name}"`)
            imageProps.onError?.(e)
          }}
        />
      )
    }

    // 正常图片渲染
    return (
      <Image
        src={imageSrc}
        fallback={fallback}
        loading="lazy"
        preview={imageProps.preview ?? false}
        alt={imageProps.alt || name}
        {...imageProps}
        onLoad={(e) => {
          console.debug(`AImage: Successfully loaded image "${name}"`)
          imageProps.onLoad?.(e)
        }}
        onError={(e) => {
          console.warn(`AImage: Failed to load image "${name}", using fallback`)
          imageProps.onError?.(e)
        }}
      />
    )
  },
  // 自定义比较函数，避免不必要的重渲染
  (prevProps, nextProps) => {
    const keysToCompare: (keyof AImageProps)[] = [
      'name',
      'fallback',
      'enableCache',
      'width',
      'height',
      'alt',
      'preview',
      'className',
      'style',
    ]

    return keysToCompare.every((key) => prevProps[key] === nextProps[key])
  },
)

// 设置 displayName 用于调试
AImage.displayName = 'AImage'

export default AImage

/**
 * AImage 图片组件使用说明
 *
 * ## 组件用途
 * 提供主题化的图片展示，支持以下功能：
 * - 跟随主题切换自动更新图片
 * - 智能缓存机制，提升性能
 * - 优雅的错误处理和占位符
 * - 支持懒加载和预览
 * - 完全兼容 Ant Design Image 组件
 *
 * ## 使用示例
 * ```tsx
 * <AImage name="logo" width={200} />
 * <AImage name="banner" preview={true} fallback="/custom/fallback.png" />
 * <AImage
 *   name="avatar"
 *   placeholder={<div>加载中...</div>}
 *   notFoundComponent={<div>图片不存在</div>}
 * />
 * ```
 *
 * ## props 类型定义
 */
