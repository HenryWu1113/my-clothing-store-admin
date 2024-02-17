import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { useAdminStore } from '@/stores/admin'

const createAxiosInstance = (): ((type?: 'auth') => AxiosInstance) => {
  const baseInstance = axios.create({
    baseURL: import.meta.env.VITE_API
  })

  const authInstance = axios.create({
    baseURL: import.meta.env.VITE_API
  })

  authInstance.interceptors.request.use((config) => {
    const admin = useAdminStore()
    config.headers.authorization = `Bearer ${admin.token}`
    return config
  })

  authInstance.interceptors.response.use(
    (res) => {
      return res
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        if (error.config.url !== '/admins/extend' && error.config.url !== '/admins/logout') {
          const admin = useAdminStore()
          return authInstance
            .post('/admins/extend', {})
            .then(({ data }) => {
              admin.token = data.result
              error.config.headers.authorization = `Bearer ${admin.token}`
              return axios(error.config)
            })
            .catch((_) => {
              admin.logout()
              return Promise.reject(error)
            })
        }
      }
      return Promise.reject(error)
    }
  )

  return (type?: 'auth'): AxiosInstance => {
    if (type === 'auth') return authInstance
    else if (type === void 0) return baseInstance
    else return baseInstance
  }
}

/**
 * return 一個 function
 * @param type (已登入 auth，未登入不傳)
 */
export const api = createAxiosInstance()
