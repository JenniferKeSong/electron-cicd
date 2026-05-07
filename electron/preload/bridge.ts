/*
 * 启用了上下文隔离，渲染进程无法使用electron的api，
 * 可通过contextBridge 导出api给渲染进程使用
 * 渲染进程相关配置在ipcRender.ts中
 */

import {
  type IpcRenderer,
  type IpcRendererEvent,
  contextBridge,
  ipcRenderer,
} from 'electron'

type LoggerLevel = 'info' | 'error' | 'warn' | 'debug'

type ElectronEventListener<T> = (event: IpcRendererEvent, payload: T) => void

type ElectronApi = {
  ipcRenderer: IpcRenderer
  /** 当前平台：darwin | win32 | linux，用于前端判断是否支持更新检查 */
  platform: NodeJS.Platform
  onSetUnderlineWord: (
    listener: ElectronEventListener<{ text: string; x: number; y: number }>,
  ) => void
  offSetUnderlineWord: (
    listener: ElectronEventListener<{ text: string; x: number; y: number }>,
  ) => void
  getLaunchAtStartupEnabled: () => Promise<boolean>
  setLaunchAtStartupEnabled: (enabled: boolean) => Promise<boolean>
  setReadingHighlightEnabled: (
    enabled: boolean,
    showDialog?: boolean,
  ) => Promise<boolean>
  closeUnderlineWindow: () => Promise<void>
  updateUnderlineWindowSize: (width: number) => Promise<void>
  openMainWindow: () => Promise<boolean>
  getSystemTheme: () => Promise<'light' | 'dark'>
  refreshChildWindow: () => void
  sendShortcutAction: (type: string, value: string) => void
  logger: (data: { info: string; type?: LoggerLevel }) => Promise<void>
}

const invoke = ipcRenderer.invoke.bind(ipcRenderer)
const send = ipcRenderer.send.bind(ipcRenderer)

const electronAPI = {
  ipcRenderer,
  platform: process.platform,
  onSetUnderlineWord: (listener) =>
    ipcRenderer.on('set-underline-word', listener),
  offSetUnderlineWord: (listener) =>
    ipcRenderer.removeListener('set-underline-word', listener),
  getLaunchAtStartupEnabled: () => invoke('get-launch-at-startup-enabled'),
  setLaunchAtStartupEnabled: (enabled: boolean) =>
    invoke('set-launch-at-startup-enabled', enabled),
  setReadingHighlightEnabled: (enabled: boolean, showDialog?: boolean) =>
    invoke('set-reading-highlight-enabled', enabled, showDialog),
  closeUnderlineWindow: () => invoke('close-underline-window'),
  updateUnderlineWindowSize: (width: number) =>
    invoke('update-underline-window-size', width),
  openMainWindow: () => invoke('open-main-window'),
  getSystemTheme: () => invoke('get-system-theme'),
  refreshChildWindow: () => send('refresh-child-window'),
  sendShortcutAction: (type: string, value: string) =>
    send('shortcut-action', type, value),
  logger: ({ info, type }) => invoke('logger-log', info, type),
} satisfies ElectronApi

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
