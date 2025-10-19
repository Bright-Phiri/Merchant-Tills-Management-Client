import { createConsumer } from '@rails/actioncable'
import { useAuthStore } from '@/stores/useAuthStore'

const authStore = useAuthStore()

const cable = createConsumer('ws://127.0.0.1:3000/websocket?token=' + authStore.getToken)

export default cable
