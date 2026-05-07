import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { logger } from 'ee-core/log'

// 创建独立的axios实例，避免影响全局axios
const axiosInstance: AxiosInstance = axios.create({
  timeout: 30000, // 30秒超时
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.data) {
      logger.info(`[Request] ${config.method?.toUpperCase()} ${config.url}`)
      logger.debug(`Data: ${JSON.stringify(config.data)}`)
    }
    return config
  },
  (error) => {
    logger.error(`[Request Error] ${error.message}`)
    return Promise.reject(error)
  },
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    logger.info(`[Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`)
    logger.debug(`Data: ${JSON.stringify(response.data)}`)
    return response
  },
  (error) => {
    logger.error(`[Response Error] ${error.message}`)

    if (error.response) {
      logger.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`)
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
