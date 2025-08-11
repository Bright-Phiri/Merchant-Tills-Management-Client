import { createConsumer } from '@rails/actioncable'
import { useAuthStore } from '@/stores/useAuthStore'

const authStore = useAuthStore()

const cable = createConsumer(
  'wss://terminalcontrol-api.onrender.com/websocket?token=' + authStore.getToken,
)

export default cable
