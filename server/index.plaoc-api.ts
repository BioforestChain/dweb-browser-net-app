import { Router } from '@plaoc/server/middleware'

const app = new Router()

// --> proxy server
// const ws = new WebSocket("ws://xxxxx")

// ws.onmessage(e=>{
//   e.message
// })

app.use((event) => {
  console.log('api server:=>', event.request.url)
})

console.log('api init backend')

export default app
