import { createConsumer } from '@rails/actioncable'

const cable = createConsumer('ws://localhost:3000/websocket') // or /cable if you're using the default

export default cable
