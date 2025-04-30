import { useRouter } from 'vue-router'
import { showAlert, showToast } from '@/utils/utils'
import { useAuthStore } from '@/stores/useAuthStore'

export function useErrorHandler() {
  const router = useRouter()

  const handleError = (error) => {
    const status = error?.response?.status
    const resData = error?.response?.data

    const message = resData?.message || 'An error occurred'
    const errors = resData?.errors

    // Server unreachable
    if (!status) {
      showAlert('error', 'Error', "Couldn't reach API")
      return
    }

    switch (status) {
      case 400:
        showToast(message, 'warning')
        break

      case 401:
        // Check if it's a session expiration
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
