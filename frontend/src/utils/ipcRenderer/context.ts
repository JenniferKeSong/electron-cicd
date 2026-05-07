/**
 * Electron preload 注入的全局 API，以及 ipcRenderer 能力归一化
 */
export const electronAPI = window.electronAPI

/**
 * ipc
 * 官方api说明：https://www.electronjs.org/zh/docs/latest/api/ipc-renderer
 *
 * 属性/方法
 * ipc.invoke(channel, param) - 发送异步消息（invoke/handle 模型）
 * ipc.sendSync(channel, param) - 发送同步消息（send/on 模型）
 * ipc.on(channel, listener) - 监听 channel, 当新消息到达，调用 listener
 * ipc.once(channel, listener) - 添加一次性 listener 函数
 * ipc.removeListener(channel, listener) - 为特定的 channel 从监听队列中删除特定的 listener 监听者
 * ipc.removeAllListeners(channel) - 移除所有的监听器，当指定 channel 时只移除与其相关的所有监听器
 * ipc.send(channel, ...args) - 通过channel向主进程发送异步消息
 * ipc.postMessage(channel, message, [transfer]) - 发送消息到主进程
 * ipc.sendTo(webContentsId, channel, ...args) - 通过 channel 发送消息到带有 webContentsId 的窗口
 * ipc.sendToHost(channel, ...args) - 消息会被发送到 host 页面上的 <webview> 元素
 */
// 某些窗口/运行态下 preload 可能只注入 ipcRenderer 的部分方法。
// 这里做一次“能力归一化”，避免出现 ipc.on 不是函数导致白屏。
const rawIpc = (electronAPI as any)?.ipcRenderer || {}
export const ipc = {
  on:
    typeof rawIpc.on === 'function'
      ? rawIpc.on.bind(rawIpc)
      : (_channel: string, _listener: any) => {},
  once:
    typeof rawIpc.once === 'function'
      ? rawIpc.once.bind(rawIpc)
      : (_channel: string, _listener: any) => {},
  removeListener:
    typeof rawIpc.removeListener === 'function'
      ? rawIpc.removeListener.bind(rawIpc)
      : (_channel: string, _listener: any) => {},
  removeAllListeners:
    typeof rawIpc.removeAllListeners === 'function'
      ? rawIpc.removeAllListeners.bind(rawIpc)
      : (_channel?: string) => {},
  send:
    typeof rawIpc.send === 'function'
      ? rawIpc.send.bind(rawIpc)
      : (_channel: string, ..._args: any[]) => {},
  sendSync:
    typeof rawIpc.sendSync === 'function'
      ? rawIpc.sendSync.bind(rawIpc)
      : (_channel: string, ..._args: any[]) => undefined,
  postMessage:
    typeof rawIpc.postMessage === 'function'
      ? rawIpc.postMessage.bind(rawIpc)
      : (_channel: string, _message: any, _transfer?: any[]) => {},
  sendTo:
    typeof rawIpc.sendTo === 'function'
      ? rawIpc.sendTo.bind(rawIpc)
      : (_webContentsId: number, _channel: string, ..._args: any[]) => {},
  sendToHost:
    typeof rawIpc.sendToHost === 'function'
      ? rawIpc.sendToHost.bind(rawIpc)
      : (_channel: string, ..._args: any[]) => {},
  invoke:
    typeof rawIpc.invoke === 'function'
      ? rawIpc.invoke.bind(rawIpc)
      : async (_channel: string, ..._args: any[]) => undefined,
}

/**
 * 是否为EE环境
 */
export const isEE = !!window.electronAPI

/**
 * 当前平台（仅 EE 有效）：darwin | win32 | linux
 * Mac 上更新检查会直接返回无更新，无需走 IPC
 */
export const platform = window.electronAPI?.platform ?? ''
