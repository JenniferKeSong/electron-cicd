import { logger } from 'ee-core/log'
import { ipcMain } from 'electron'

/**
 * 日志等级对应logger方法
 */
const logLevelMap: Record<string, (msg: string) => void> = {
  info: (msg) => logger.info(msg),
  error: (msg) => logger.error(msg),
  warn: (msg) => logger.warn(msg),
  debug: (msg) => logger.debug(msg),
}

/**
 * 注册日志IPC处理，支持不同日志级别
 */
const registerLoggerIpc = () => {
  // 避免重复注册
  if ((ipcMain as any)._loggerLogRegistered) return
  ;(ipcMain as any)._loggerLogRegistered = true

  ipcMain.handle(
    'logger-log',
    (_event, info: string, type: 'info' | 'error' | 'warn' | 'debug' = 'info') => {
      const logFn = logLevelMap[type] || logger.info
      logFn(`渲染进程日志: ${info}`)
    },
  )
}

export default registerLoggerIpc

