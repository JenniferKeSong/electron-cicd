/**
 * electron APIs - 封装所有 electron 相关的 API
 */
import { electronAPI } from './context'

export { ipc, isEE, platform } from './context'
export { systemAPI } from './systemAPI'
export { appAPI } from './appAPI'

// 导出向后兼容的 Renderer 对象
const Renderer = electronAPI || {}

export { Renderer }
