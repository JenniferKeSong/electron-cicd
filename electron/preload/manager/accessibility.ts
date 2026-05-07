import { app } from 'electron'
import { logger } from 'ee-core/log'
const AccessibilitySupport = () => {
  const isAccess = app.isAccessibilitySupportEnabled() // 是否开启无障碍
  if (isAccess) {
    logger.info('[accessibility] Accessibility support is enabled')
  }
}

export default AccessibilitySupport
