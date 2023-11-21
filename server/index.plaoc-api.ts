import { Router } from '@plaoc/server/middleware'
import { get, set, del } from 'idb-keyval'
import { rebuildCurrentWs } from './proxy'

rebuildCurrentWs()

const app = new Router()

app.use(async (event) => {
  console.log('api server:=>', event.request.url)

  if (event.pathname == '/cache' && event.method == 'GET') {
    const key = event.searchParams.get('key') as string

    try {
      const data = await get(key)
      return Response.json(data)
    } catch (error) {
      return Response.json({ success: false, message: error })
    }
  }

  if (event.pathname == '/cache' && event.method == 'POST') {
    try {
      const data = await event.json()
      console.log('data: ', data)

      await set('config', data)
      return Response.json({ success: true, message: 'ok' })
    } catch (error) {
      return Response.json({ success: false, message: error })
    }
  }

  if (event.pathname == '/cache' && event.method == 'DELETE') {
    const key = event.searchParams.get('key') as string
    try {
      await del(key)
      return Response.json({ success: true, message: 'ok' })
    } catch (error) {
      return Response.json({ success: false, message: error })
    }
  }

  if (event.pathname == '/reconnection' && event.method == 'POST') {
    const result = await rebuildCurrentWs()
    return Response.json(result)
  }

  return Response.json({ success: true, message: 'api server ok' })
})

console.log('api init backend')

export default app
