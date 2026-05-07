// 页面类型 -> 后端 chat_type 的统一映射（单一事实来源，避免类型/映射重复维护）
export const PAGE_TO_CHAT_TYPE = {
  'chat': 'normal',
  'translate': 'translate',
  'search': 'search',
  'doc-chat': 'doc',
  'pc-control': 'pc_control',
} as const

// 页面类型（用于前端路由/页面区分）
export type IPageType = keyof typeof PAGE_TO_CHAT_TYPE

export type IMaskType = 'translate' | 'doc-chat' | 'chat'

// 后端问答接口要求的 chat_type
export type IChatType = (typeof PAGE_TO_CHAT_TYPE)[IPageType]

export const mapPageTypeToChatType = (pageType?: IPageType): IChatType => {
  return (pageType && PAGE_TO_CHAT_TYPE[pageType]) || PAGE_TO_CHAT_TYPE.chat
}

export const getKeyByValue = (value: IChatType): IPageType | undefined => {
  const entry = Object.entries(PAGE_TO_CHAT_TYPE).find(([, v]) => v === value)
  return entry?.[0] as IPageType | undefined
}
