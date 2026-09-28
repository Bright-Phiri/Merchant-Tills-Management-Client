import axios from 'axios'
import { useAuthStore } from '@/stores/useAuthStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000/api/v1/',
})

api.interceptors.request.use((config) => {
  const authStore = useAuthStore()

  if (authStore.getToken) {
    config.headers.Authorization = `Bearer ${authStore.getToken}`
  }

  return config
})

export default api
