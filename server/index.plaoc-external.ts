import { Router } from '@plaoc/server/middleware'
import Proxy from './proxy'

const app = new Router()

app.use(async (event) => {
  console.log('external:=>', event.request.url, event.ipcRequest.toJSON())

  Proxy.getIpc()
    .then((ipc) => {
      console.log('ipc: ', ipc)
    })
    .catch((err) => {
      console.error('ipc: ', err)
    })

  return Response.json({ success: true, message: 'haha' })
})

console.log('init backend')

export default app
