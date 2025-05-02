import { createConsumer } from '@rails/actioncable'

const cable = createConsumer('ws://127.0.0.1:3000/websocket')

export default cable
