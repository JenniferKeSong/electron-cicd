import { IPageType } from "@/types/CommonTypes";
import { TitleConfig } from './index'
import { MainMenu } from '@/router/constants'
export const promptData = {
  // 三大类提示词
  Encyclopedia: [
    '天空为什么这么蓝',
    '给我一些关于时间的名言',
    '介绍一下霍元甲',
    '清华大学怎么样',
    '介绍一下杜甫',
    '随机给我一首李白的诗',
    '窗前明月光的下一句',
    '静夜思是谁写的',
    '山东有什么好吃的',
    '珠穆拉玛峰有多高',
  ],
  EfficiencyAssistant: [
    '写一封感谢信，感谢小明助人为乐',
    '写一首关于四季的诗',
    '写一个童话剧本大纲',
    '帮我写个工作总结',
    '写一篇演讲稿，主题青春奋斗',
    '写一篇关于人工智能的PPT大纲',
  ],
  CasualChat: [
    '属龙的和什么属相最配',
    '生肖蛇的性格',
    '1994年出生的属什么',
    '讲个笑话',
    '双子座的性格特点',
    '水瓶座和双鱼座配么',
    '告诉我一个动物冷知识',
    '今天我的心情很开心',
    '红烧肉怎么做',
    '今天吃什么',
  ],
}

export const PROMPT_ICON_COLORS = ['#1677FF', '#722ED1', '#EB2F96'] as const

export const PROMPT_ICON_CONFIG: Partial<
  Record<IPageType, { icons: string[]; colors?: readonly string[] }>
> = {
  chat: {
    icons: ['icon-a-3-icon', 'icon-a-2-icon', 'icon-a-1-icon'],
  },
  'doc-chat': {
    icons: [
      'icon-suijitubiao-11',
      'icon-suijitubiao-21',
      'icon-suijitubiao-31',
      'icon-suijitubiao-41',
      'icon-suijitubiao-51',
      'icon-suijitubiao-61',
      'icon-suijitubiao-71',
    ],
    colors: PROMPT_ICON_COLORS,
  },
  search: {
    icons: ['icon-wenjianchazhao-icon'],
    colors: PROMPT_ICON_COLORS,
  },
  'pc-control': {
    icons: ['icon-diannaoshezhi-icon'],
    colors: PROMPT_ICON_COLORS,
  },
}

export const DEFAULT_PAGE_CONFIG: TitleConfig = {
  titleKey: 'aiQaTitle',
  subTitleKey: 'aiQaSubtitle',
  type: 'chat',
}

export const TITLE_CONFIG: Partial<Record<MainMenu, TitleConfig>> = {
  [MainMenu.通识问答]: DEFAULT_PAGE_CONFIG,
  [MainMenu.翻译助手]: {
    titleKey: 'aiTranslationTitle',
    subTitleKey: 'aiTranslationSubtitle',
    type: 'translate', // 智能翻译
  },
  [MainMenu.智能搜索]: {
    titleKey: 'smartSearch',
    subTitleKey: 'smartSearchSubtitle',
    type: 'search', // 智能搜索
  },
  [MainMenu.文档大师]: {
    titleKey: 'aiDocumentTitle',
    subTitleKey: 'aiDocumentSubtitle',
    type: 'doc-chat', // 文档大师
  },
  [MainMenu.智能操控]: {
    titleKey: 'pcControlTitle',
    subTitleKey: 'pcControlSubtitle',
    type: 'pc-control',
  },
}

// 使用「随机 3 条」推荐策略的页面（其余如通识问答使用「每类一条」）
export const RANDOM_THREE_PATHS: MainMenu[] = [
  MainMenu.翻译助手,
  MainMenu.文档大师,
  MainMenu.智能搜索,
  MainMenu.智能操控,
]

export const PENDING_DOC_CHAT_FILES = 'wiko_pending_doc_chat_files'