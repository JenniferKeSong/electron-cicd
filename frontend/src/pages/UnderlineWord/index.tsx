import AIcon from '@/components/AIcon'
import AImage from '@/components/AImage'
import { MainMenu } from '@/router/constants'
import { CloseOutlined, CopyOutlined } from '@ant-design/icons'
import { Button, message } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type UnderlinePayload = { text: string; x: number; y: number }
type QuickAction = {
  route: MainMenu
  transform?: (text: string) => string
  shouldClose?: boolean
}

const UnderlineWord: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [content, setContent] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const debugLog = (info: string) => {
    window.electronAPI?.logger?.({
      info: `[underline-word] ${info}`,
      type: 'info',
    })
  }

  useEffect(() => {
    const listener = (_event: unknown, payload: UnderlinePayload) => {
      if (!payload?.text) return
      // 限制字数为1000字
      const formatText = Array.from(payload.text.trim()).slice(0, 1000).join('')
      setContent(formatText)
    }

    window.electronAPI?.onSetUnderlineWord?.(listener)
    return () => {
      window.electronAPI?.offSetUnderlineWord?.(listener)
    }
  }, [])

  useEffect(() => {
    const reportSize = () => {
      const container = containerRef.current
      if (!container) return

      const nextWidth = Math.ceil(container.scrollWidth + 16)
      window.electronAPI?.updateUnderlineWindowSize?.(nextWidth)
    }

    reportSize()
    const resizeObserver = new ResizeObserver(() => reportSize())
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [content, i18n.language])

  // 关闭划词悬浮窗
  const onCloseWindow = async () => {
    await window.electronAPI?.closeUnderlineWindow?.()
  }

  const getTrimmedContent = () => {
    const text = content.trim()
    if (!text) {
      message.warning(
        t('underlineWordNoContent', { defaultValue: '暂无可提问内容' }),
      )
      return null
    }
    return text
  }

  const runQuickAction = async ({
    route,
    transform,
    shouldClose = true,
  }: QuickAction) => {
    debugLog(`runQuickAction start route=${route}`)
    const text = getTrimmedContent()
    if (!text) {
      debugLog(`runQuickAction skip route=${route} reason=empty-text`)
      return
    }

    const value = transform ? transform(text) : text
    window.electronAPI?.sendShortcutAction?.(route, value)
    debugLog(
      `sendShortcutAction route=${route} valueLength=${String(value.length)}`,
    )

    if (shouldClose) {
      await onCloseWindow()
      debugLog(`window closed route=${route}`)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
    } catch {
      message.error(t('underlineWordCopyFail', { defaultValue: '复制失败' }))
    } finally {
      onCloseWindow()
    }
  }

  const handlePermanentClose = async () => {
    try {
      // 第一个参数，控制划词关闭，第二个参数，控制是否弹二次确认窗口
      await window.electronAPI?.setReadingHighlightEnabled?.(false, true)
      await onCloseWindow()
    } catch (error) {
      console.error('handlePermanentClose failed', error)
    }
  }

  const handleClickIcon = async () => {
    try {
      const opened = await window.electronAPI?.openMainWindow?.()
      if (opened === false) {
        message.error(
          t('underlineWordOpenMainWindowFail', {
            defaultValue: '无法打开主窗口',
          }),
        )
      }
    } catch {
      message.error(
        t('underlineWordOpenMainWindowFail', {
          defaultValue: '无法打开主窗口',
        }),
      )
    }
  }

  const actions = [
    {
      key: 'ask',
      label: t('underlineWordAskWiko', { defaultValue: '问问小唯' }),
      icon: <AIcon name="icon-tongshiwenda" />,
      onClick: () => {},
      eventName: 'select_ask_wiko',
    },
    {
      key: 'search',
      label: t('smartSearch', { defaultValue: '智能搜索' }),
      icon: <AIcon name="icon-zhinengsousuo" />,
      onClick: () => {},
      eventName: 'select_ask_wiko_smart_search',
    },
    {
      key: 'translate',
      label: t('smartTranslate', { defaultValue: '智能翻译' }),
      icon: <AIcon name="icon-zhinengfanyi" />,
      onClick: () => {},
      eventName: 'select_ask_wiko_smart_translate',
    },
    {
      key: 'polish',
      label: t('underlineWordPolish', { defaultValue: '润色' }),
      icon: <AIcon name="icon-runse-icon" />,
      onClick: () => {},
      eventName: 'polish',
    },
    {
      key: 'summary',
      label: t('underlineWordSummary', { defaultValue: '总结' }),
      icon: <AIcon name="icon-zongjie-icon" />,
      onClick: () => {},
      eventName: 'summarize',
    },
    {
      key: 'continue',
      label: t('underlineWordContinueWrite', { defaultValue: '续写' }),
      icon: <AIcon name="icon-xuxie-icon" />,
      onClick: () => {},
      eventName: 'select_ask_wiko_continue_write',
    },
    {
      key: 'copy',
      label: t('Copy.tooltip', { defaultValue: '复制' }),
      icon: <CopyOutlined />,
      onClick: handleCopy,
      eventName: 'select_ask_wiko_copy',
    },
  ]

  return (
    <div
      ref={containerRef}
      className="bg-page text-title rounded-4 box-shadow-normal flex items-center justify-between px-8 py-4 box-border overflow-hidden relative"
    >
      <AImage name="wiko" width={20} onClick={handleClickIcon} />
      <div className="flex items-center gap-4 flex-1 min-w-0 overflow-x-auto whitespace-nowrap cursor-pointer scrollbar-none">
        {actions.map((action) => (
          <div
            key={action.key}
            onClick={() => {
              debugLog(`click action key=${action.key}`)

              action.onClick()
            }}
            className="hover:bg-surface px-6 py-4 rounded-4 flex gap-4 items-center text-title cursor-pointer text-14"
          >
            {action.icon}
            {action.label}
          </div>
        ))}
      </div>
      <Button
        type="text"
        size="small"
        icon={<CloseOutlined />}
        onClick={handlePermanentClose}
        className="text-title flex items-center justify-center ml-4"
      >
        {t('underlineWordPermanentClose', { defaultValue: '永久关闭' })}
      </Button>
    </div>
  )
}

export default UnderlineWord
