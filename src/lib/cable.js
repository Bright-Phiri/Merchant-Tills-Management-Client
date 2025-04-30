import { createConsumer } from '@rails/actioncable'

const cable = createConsumer('ws://172.20.10.11:3000/websocket')

export default cable
