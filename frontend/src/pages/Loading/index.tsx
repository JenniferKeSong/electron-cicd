import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './index.css'

const Loading: React.FC = () => {
  const { t } = useTranslation()
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', handleOnlineStatusChange)
    window.addEventListener('offline', handleOnlineStatusChange)

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange)
      window.removeEventListener('offline', handleOnlineStatusChange)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-page">
      <div className="flex items-center justify-center gap-12px flex-col">
        <div className="relative mb-50px">
          <div className="loader">
            <div className="inner one"></div>
            <div className="inner two"></div>
            <div className="inner three"></div>
          </div>
        </div>

        <p className="text-title font-['PingFang_SC'] text-16px font-400 leading-normal">
          {t('loading.text')}
        </p>
        {!isOnline && (
          <p className="text-[#666] font-['PingFang_SC'] text-14px font-400 leading-normal">
            {t('loading.offlineHint')}
          </p>
        )}
      </div>
    </div>
  )
}

export default Loading
