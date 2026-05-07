import { app } from 'electron'
import { logger } from 'ee-core/log'
import fs from 'fs'
import path from 'path'

const CONFIG_FILE = 'userSetting.json'
const configFilePath = path.join(app.getPath('userData'), CONFIG_FILE)
let configCache: Record<string, unknown> | null = null

function loadConfig<T extends Record<string, unknown>>(defaults: T): T {
  if (configCache) return configCache as T

  try {
    if (fs.existsSync(configFilePath)) {
      const raw = fs.readFileSync(configFilePath, 'utf8')
      const parsed = JSON.parse(raw) as Partial<T>
      const merged = { ...defaults, ...parsed }
      configCache = merged
      return merged
    }
  } catch (error) {
    logger.error(`[config:${CONFIG_FILE}] 读取配置失败:`, error)
  }

  const fallback = { ...defaults }
  configCache = fallback
  return fallback
}

function saveConfig<T extends Record<string, unknown>>(data: T): void {
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(data), 'utf8')
    configCache = data
  } catch (error) {
    logger.error(`[config:${CONFIG_FILE}] 保存配置失败:`, error)
  }
}

function getConfigValue<T extends Record<string, unknown>, K extends keyof T>(
  defaults: T,
  key: K,
): T[K] {
  return loadConfig(defaults)[key]
}

function setConfigValue<T extends Record<string, unknown>, K extends keyof T>(
  defaults: T,
  key: K,
  value: T[K],
): boolean {
  const current = loadConfig(defaults)
  const next = { ...current, [key]: value }
  saveConfig(next)
  return true
}

// ---- 划词配置 ----

type UnderlineSettings = {
  readingHighlightEnabled: boolean
}

const UNDERLINE_DEFAULTS: UnderlineSettings = {
  readingHighlightEnabled: false,
}

function getReadingHighlightEnabled(): boolean {
  return getConfigValue(UNDERLINE_DEFAULTS, 'readingHighlightEnabled')
}

function setReadingHighlightEnabled(enabled: boolean): boolean {
  return setConfigValue(UNDERLINE_DEFAULTS, 'readingHighlightEnabled', enabled)
}

// ---- 开机自启配置 ----

type LaunchAtStartupSettings = {
  launchAtStartupEnabled: boolean
}

const LAUNCH_DEFAULTS: LaunchAtStartupSettings = {
  launchAtStartupEnabled: false,
}

function getLaunchAtStartupEnabled(): boolean {
  return getConfigValue(LAUNCH_DEFAULTS, 'launchAtStartupEnabled')
}

function setLaunchAtStartupEnabled(enabled: boolean): boolean {
  app.setLoginItemSettings({ openAtLogin: enabled })
  return setConfigValue(LAUNCH_DEFAULTS, 'launchAtStartupEnabled', enabled)
}

export {
  loadConfig,
  saveConfig,
  getConfigValue,
  setConfigValue,
  getReadingHighlightEnabled,
  setReadingHighlightEnabled,
  getLaunchAtStartupEnabled,
  setLaunchAtStartupEnabled,
}
