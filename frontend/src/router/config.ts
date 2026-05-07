import { lazy } from 'react'
import { MainMenu } from './constants'
export { MainMenu }
const importCommonHome = () => import('@/pages/CommonHome')
const importUnderlineWord = () => import('@/pages/UnderlineWord')
const CommonHome = lazy(importCommonHome)
const UnderlineWord = lazy(importUnderlineWord)

export const routerConfig = [
  {
    path: '/',
    Component: CommonHome,
  },
  {
    path: '/underlineWord',
    Component: UnderlineWord,
  },
]

export default routerConfig
