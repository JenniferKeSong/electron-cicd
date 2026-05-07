import { type AppConfig, type LoggerConfig } from 'ee-core/config'
import { getElectronDir } from 'ee-core/ps'
import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import ThemeConfig from './theme.config'

export interface CustomConfig extends Omit<AppConfig, 'logger'> {
  tray?: {
    icon: string
    title: string
  }
  theme: 'demo'
  /** 日志保留策略（天）；仅本项目读取，用于启动时清理过期 .log */
  logger?: LoggerConfig & { logRetentionDays?: number }
}

const config: () => CustomConfig = () => {
  const { title, trayIcon, iconPath, theme } = ThemeConfig()
  // 日志不要写进项目目录（dev 时 EE_EXEC_DIR/EE_BASE_DIR 往往是项目根）
  // Electron 推荐使用系统日志目录：macOS -> ~/Library/Logs/<AppName>，Windows -> %APPDATA%\\<AppName>\\logs
  const logDir = path.join(app.getPath('logs'), title)
  try {
    fs.mkdirSync(logDir, { recursive: true })
  } catch {
    // ignore：logger 初始化时也会尝试创建目录
  }
  return {
    theme: theme,
    openDevTools: { mode: 'detach' },
    singleLock: true,
    tray: {
      icon: trayIcon,
      title: title,
    },
    windowsOption: {
      title: title,
      width: 980,
      height: 650,
      minWidth: 330,
      minHeight: 330,
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(getElectronDir(), 'preload', 'bridge.js'),
        webviewTag: true
      },
      frame: true,
      show: false,
      icon: iconPath,
    },
    logger: {
      level: 'INFO',
      encoding: 'utf8',
      rotator: 'day',
      outputJSON: false,
      buffer: false,
      appLogName: `${title}.log`,
      coreLogName: `${title}-core.log`,
      errorLogName: `${title}-error.log`,
      dir: logDir,
      /** 仅保留约一个月内有过写入的 .log（按文件 mtime 判断） */
      logRetentionDays: 31,
    },
    remote: {
      enable: false,
      url: '',
    },
    socketServer: {
      enable: true,
      port: 7070,
      path: '/socket.io/',
      connectTimeout: 45000,
      pingTimeout: 30000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e8,
      transports: ['polling', 'websocket'],
      cors: {
        origin: true,
      },
      channel: 'socket-channel',
    },
    httpServer: {
      enable: true,
      https: {
        enable: false,
        key: '/public/ssl/localhost+1.key',
        cert: '/public/ssl/localhost+1.pem',
      },
      host: '127.0.0.1',
      port: 7071,
    },
    mainServer: {
      indexPath: '/public/dist/index.html',
    },
  }
}

export default config
