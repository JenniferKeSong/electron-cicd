import { type AppConfig } from 'ee-core/config'

const config: () => AppConfig = () => {
  return {
    openDevTools: true,
  }
}

export default config
