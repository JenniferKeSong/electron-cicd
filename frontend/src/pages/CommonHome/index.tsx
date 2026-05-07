import { IPageType } from '@/types/CommonTypes'
import { FC } from 'react'
import { promptData } from './constants'

export type PromptData = typeof promptData

// 页面类型配置映射
export type TitleConfig = {
  titleKey: string
  subTitleKey: string
  type: IPageType
}

const CommonHome: FC = () => {
  return <div className="flex align-center justify-center gap-4 w-full h-full">这是首页</div>
}

export default CommonHome
