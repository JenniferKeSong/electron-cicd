import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en'
import zh from './zh'
import zh_TW from './zh_TW'

i18n
  .use(initReactI18next) // 结合react
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
      zh_TW: { translation: zh_TW },
    },
    lng: 'zh', // 默认语言
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
