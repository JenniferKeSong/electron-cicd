import {
  getCloseAndQuit,
  getMainWindow,
  setCloseAndQuit,
} from 'ee-core/electron'
import { logger } from 'ee-core/log'
import { app as electronApp, Menu, Tray } from 'electron'
/**
 * 托盘
 * @class
 */
class TrayService {
  tray: Tray | null

  constructor() {
    this.tray = null
  }

  /**
   * Create the tray icon
   */
  create(cfg) {
    const mainWindow = getMainWindow()

    // Tray menu items
    const trayMenuTemplate = [
      {
        label: '显示',
        click: function () {
          mainWindow.show()
        },
      },
      {
        label: '退出',
        click: async () => {
          // 须先 setCloseAndQuit(true)，否则主窗口 close 会 preventDefault 隐藏窗口，app.quit() 无法关完窗口，进程残留；
          // 子进程清理由 ee-core before-close（lifecycle.beforeClose）在真正退出流程里执行。
          try {
            setCloseAndQuit(true)
            this.tray?.destroy()
            this.tray = null
            electronApp.quit()
          } catch (e) {
            logger.error('[tray] 退出异常:', e)
          }
        },
      },
    ]

    // Set a flag to minimize to tray instead of closing
    setCloseAndQuit(false)
    mainWindow.on('close', (event: any) => {
      if (getCloseAndQuit()) {
        return
      }
      mainWindow.hide()
      event.preventDefault()
    })

    // Initialize the tray
    this.tray = new Tray(cfg.icon)
    this.tray.setToolTip(cfg.title)
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate)
    this.tray.setContextMenu(contextMenu)
    // Show the main window when the tray icon is clicked
    this.tray.on('click', () => {
      mainWindow.show()
      mainWindow.focus()
    })
  }
}
TrayService.toString = () => '[class TrayService]'
const trayService = new TrayService()

export { trayService }
