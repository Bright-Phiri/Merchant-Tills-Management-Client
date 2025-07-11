import { createConsumer } from '@rails/actioncable'

const cable = createConsumer('wss://terminalcontrol-api.onrender.com/websocket')

export default cable
