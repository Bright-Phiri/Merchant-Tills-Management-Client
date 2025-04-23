import { createConsumer } from '@rails/actioncable'

const cable = createConsumer('ws://localhost:3000/websocket')

export default cable
