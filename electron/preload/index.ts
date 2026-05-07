/**
 * Preload module, this file will be loaded when the program starts.
 */

import { getConfig } from 'ee-core/config'
import { logger } from 'ee-core/log'
import { CustomConfig } from 'electron/config/config.default'
import { trayService } from '../service'

/**
 * Initializes preload tasks.
 */
function preload(): void {
  const config = getConfig() as CustomConfig
  if (config?.tray) {
    trayService.create(config.tray)
    logger.info('[preload] Tray initialized.')
  } else {
    logger.warn('[preload] Tray config missing.')
  }
}

/**
 * Entry point of the preload module
 */
export { preload }
