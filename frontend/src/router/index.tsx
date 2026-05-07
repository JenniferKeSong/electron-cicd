import Loading from '@/pages/Loading'
import { Suspense, useEffect, useState } from 'react'
import { useRoutes } from 'react-router-dom'
import config from './config'

const FALLBACK_DELAY_MS = 180

const DelayedLoadingFallback = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(true)
    }, FALLBACK_DELAY_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Loading />
    </div>
  )
}

export default function BeforeRouterEnter() {
  const outlet = useRoutes(config)
  return (
    <Suspense fallback={<DelayedLoadingFallback />}>
      {outlet}
    </Suspense>
  )
}
