import { Router } from '@plaoc/server/middleware'
import { initWsProxy } from './proxy'

initWsProxy()

const app = new Router()

// --> proxy server
// const ws = new WebSocket("ws://xxxxx")

// ws.onmessage(e=>{
//   e.message
// })

app.use((event) => {
  console.log('api server:=>', event.request.url)
  return Response.json({ success: true, message: 'api server ok' })
})

console.log('api init backend')

export default app
