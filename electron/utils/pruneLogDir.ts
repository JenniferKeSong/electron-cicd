import { logger } from 'ee-core/log'
import fs from 'fs'
import path from 'path'

const MS_PER_DAY = 86_400_000

/**
 * 删除日志目录中修改时间早于 (now - retentionDays) 的 .log 文件。
 * ee-core 按天轮转只生成新文件，不会自动删历史文件。
 */
export async function pruneLogDir(
  dir: string,
  retentionDays: number,
): Promise<void> {
  if (!dir || retentionDays <= 0) return

  const maxAgeMs = retentionDays * MS_PER_DAY
  const now = Date.now()
  let entries: string[]
  try {
    entries = await fs.promises.readdir(dir)
  } catch {
    return
  }

  let removed = 0
  await Promise.all(
    entries.map(async (name) => {
      if (!name.endsWith('.log')) return
      const full = path.join(dir, name)
      try {
        const st = await fs.promises.stat(full)
        if (!st.isFile()) return
        if (now - st.mtimeMs > maxAgeMs) {
          await fs.promises.unlink(full)
          removed++
        }
      } catch {
        // 并发删除 / 权限等忽略
      }
    }),
  )

  if (removed > 0) {
    logger.info(`[log-retention] 已删除 ${removed} 个超过 ${retentionDays} 天的日志文件`)
  }
}
