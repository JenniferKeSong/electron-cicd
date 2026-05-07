import { logger } from 'ee-core/log'
import fs from 'fs'

/**
 * 解析配置文件内容为对象，将键值对还原为对象
 * @param content 文件内容字符串
 * @returns 配置对象
 */
function parseObj(content: string): Record<string, string> {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce(
      (env, line) => {
        const [key, ...rest] = line.split('=')
        if (key) env[key] = rest.join('=')
        return env
      },
      {} as Record<string, string>,
    )
}

/**
 * 写入指定字段（key）到配置文件，保留其它已存在的键值对。
 *
 * 使用方法:
 * ```
 * import { writeConfigField } from './readLocalConfig'
 * writeConfigField('/path/to/.env', 'KEY', 'VALUE')
 * ```
 *
 * @param filePath 配置文件路径
 * @param key 要写入的键名
 * @param value 要写入的值
 * @returns 写入是否成功
 */
function writeConfigField(
  filePath: string,
  key: string,
  value: string
): boolean {
  let envObj: Record<string, string> = {}
  if (fs.existsSync(filePath)) {
    try {
      envObj = parseObj(fs.readFileSync(filePath, 'utf8'))
    } catch (err) {
      logger.warn(`读取${filePath}以写入${key}失败: ${err}`)
    }
  }
  envObj[key] = value

  // 格式化写回
  const envString = Object.entries(envObj)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')

  try {
    fs.writeFileSync(filePath, envString, 'utf8')
    logger.info(`已将${key}写入到${filePath}: ${value}`)
    return true
  } catch (err) {
    logger.error(`写入${filePath}文件异常: ${err}`)
    return false
  }
}

/**
 * 读取配置文件中的指定字段（key）的值
 * 
 * 使用方法:
 * ```
 * import { readConfigField } from './readLocalConfig'
 * const value = readConfigField('/path/to/.env', 'KEY')
 * ```
 * 
 * @param filePath 配置文件路径
 * @param key 要读取的键名
 * @returns 键对应的值，若不存在则返回null
 */
function readConfigField(
  filePath: string,
  key: string
): string | null {
  if (!fs.existsSync(filePath)) return null
  try {
    const envContent = fs.readFileSync(filePath, 'utf8')
    const envObj = parseObj(envContent)
    return envObj[key] || null
  } catch (err) {
    logger.warn(`读取${filePath}文件异常: ${err}`)
    return null
  }
}

export { writeConfigField, readConfigField }
