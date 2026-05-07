import { IThemeAsset } from '@/types/ThemeTypes'
// 批量引入
const importAll = (values: any, suffix = /\.(svg)$/) => {
  return Object.keys(values).map((key) => {
    return {
      name: key.split('/').pop()!.replace(suffix, ''), // 提取文件名并移除.gif .png扩展名
      value: values[key].default,
    }
  })
}

type IType = 'images' | 'svg'

const getAllImport = (role = 'wiko', type: IType) => {
  // 图片类，导出gif，png等
  if (type === 'images') {
    const common = importAll(
      import.meta.glob('@/assets/images/wiko/*.{gif,png}', {
        eager: true,
      }),
      /\.(gif|png)$/,
    )
    const themeImgs: IThemeAsset = {
      light: common,
      dark: common,
    }

    if (role === 'wiko') {
      const light = importAll(
        import.meta.glob('@/assets/images/wiko/light/*.{gif,png}', {
          eager: true,
        }),
        /\.(gif|png)$/,
      )

      const dark = importAll(
        import.meta.glob('@/assets/images/wiko/dark/*.{gif,png}', {
          eager: true,
        }),
        /\.(gif|png)$/,
      )

      themeImgs.light = themeImgs.light.concat(light)
      themeImgs.dark = themeImgs.dark.concat(dark)
    }
    return themeImgs
  } else {
    const common = importAll(
      import.meta.glob('@/assets/svgs/wiko/*.svg', {
        eager: true,
      }),
    )
    const themeSvgs: IThemeAsset = {
      light: common,
      dark: common,
    }

    if (role === 'wiko') {
      const light = importAll(
        import.meta.glob('@/assets/svgs/wiko/light/*.svg', {
          eager: true,
        }),
      )
      const dark = importAll(
        import.meta.glob('@/assets/svgs/wiko/dark/*.svg', {
          eager: true,
        }),
      )

      themeSvgs.light = themeSvgs.light.concat(light)
      themeSvgs.dark = themeSvgs.dark.concat(dark)
    }
    return themeSvgs
  }
}

export { getAllImport }
