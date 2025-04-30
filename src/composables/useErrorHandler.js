import { useRouter } from 'vue-router'
import { showAlert, showToast } from '@/utils/utils'
import { useAuthStore } from '@/stores/useAuthStore'

export function useErrorHandler() {
  const router = useRouter()

  const handleError = (error) => {
    const isNetworkError = !error.response && error.message === 'Network Error'
    const status = error?.response?.status
    const resData = error?.response?.data

    const message = resData?.message || 'An error occurred'
    const errors = resData?.errors

    // Handle network/unreachable error
    if (isNetworkError) {
      showAlert('error', 'Error', "Couldn't reach API")
      return
    }

    // Handle other unexpected cases where status is undefined
    if (!status) {
      console.error('Unexpected error structure:', error)
      showAlert('error', 'Unexpected Error', error.message || 'Unknown error')
      return
    }

    switch (status) {
      case 400:
        showToast(message, 'warning')
        break

      case 401:
        if (message.includes('Invalid or expired token')) {
          const auth = useAuthStore()
          auth.logout()
          router.push({ path: '/sign-in' })
          showToast('🔒 Session expired. Please log in again.', 'info')
        }
        break

      case 403:
        showToast(message, 'warning')
        break

      case 422:
        showAlert('error', message, errors ? `${errors}` : '')
        break

      case 423:
        showToast(message, 'info')
        break

      default:
        showToast(message, 'error')
        break
    }
  }

  return {
    handleError,
  }
}
