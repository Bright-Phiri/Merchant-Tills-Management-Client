import axios from 'axios'
import { useCustomerStore } from '@/stores/useCustomerStore'

const customerApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000/api/v1/',
  timeout: 25000,
})
customerApi.interceptors.request.use((config) => {
  const customer = useCustomerStore()
  if (customer.token) config.headers.Authorization = `Bearer ${customer.token}`
  return config
})
customerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('taxpayers/login')) {
      useCustomerStore().logout()
      window.dispatchEvent(new Event('portal:unauthorized'))
    }
    return Promise.reject(error)
  },
)
export default customerApi
