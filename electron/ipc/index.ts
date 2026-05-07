import { logger } from 'ee-core/log'
import Logger from './logger'
import theme from './theme'
import { registerIpcHandlers as registerUnderlineIpcHandlers } from './underline'

/**
 * 统一注册主进程 IPC（唯一入口）
 * - 约定：所有 ipcMain.handle/on 最终都应由这里聚合调用
 */
export async function registerMainIpcHandlers(): Promise<void> {
  logger.info('[ipc] start register main IPC handlers')
  await theme()
  // 日志/通用能力
  await Logger()
  // 业务能力
  registerUnderlineIpcHandlers()

  logger.info('[ipc] main IPC handlers registered')
}
