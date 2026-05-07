import { logger } from 'ee-core/log'

type ShutdownTask = {
  name: string
  stop: () => Promise<unknown> | unknown
  timeoutMs?: number
}

async function stopWithTimeout(
  name: string,
  stopFn: () => Promise<unknown> | unknown,
  timeoutMs: number,
): Promise<boolean> {
  try {
    await Promise.race([
      stopFn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeoutMs),
      ),
    ])
    logger.info(`[lifecycle] ${name} 已停止`)
    return true
  } catch (error) {
    logger.warn(`[lifecycle] ${name} 停止异常: ${error}`)
    return false
  }
}

export async function shutdownServices(tasks: ShutdownTask[]): Promise<void> {
  const results = await Promise.allSettled(
    tasks.map((task) => stopWithTimeout(task.name, task.stop, task.timeoutMs ?? 3000)),
  )

  const failed = results
    .map((result, index) => ({ result, name: tasks[index].name }))
    .filter((item) => item.result.status === 'rejected' || item.result.value === false)

  if (failed.length > 0) {
    logger.warn(
      `[lifecycle] 部分服务停止失败: ${failed.map((f) => f.name).join(', ')}`,
    )
  }
}
