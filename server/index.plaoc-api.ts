import { Router } from '@plaoc/server/middleware'
import { get, set } from 'idb-keyval'
import { rebuildCurrentWs } from './proxy'

rebuildCurrentWs()

const app = new Router()

app.use(async (event) => {
  console.log('api server:=>', event.request.url)

  if (event.pathname == '/cache' && event.method == 'GET') {
    const key = event.searchParams.get('key') as string

    const data = await get(key)

    return Response.json(data)
  }

  if (event.pathname == '/cache' && event.method == 'POST') {
    const data = await event.json()
    await set('config', data)

    const result = await rebuildCurrentWs()
    return Response.json(result)
  }

  return Response.json({ success: true, message: 'api server ok' })
})

console.log('api init backend')

export default app
