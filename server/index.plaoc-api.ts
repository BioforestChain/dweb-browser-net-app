import { Router } from '@plaoc/server/middleware'
import { get, set, del } from 'idb-keyval'
import { rebuildCurrentWs, shutdownCurrentWs } from './proxy'
import manifest from '../manifest.json'

rebuildCurrentWs()

const app = new Router()

const prefixpath = '/config.sys.dweb'

app.use(async (event) => {
  console.log('api server:=>', event.request.url)

  // 获取indexedDB数据
  if (event.pathname == `${prefixpath}/cache` && event.method == 'GET') {
    const key = event.searchParams.get('key') as string

    try {
      const data = await get(key)
      return Response.json(data)
    } catch (error) {
      return Response.json({ success: false, message: error })
    }
  }

  // 更新indexedDB数据
  if (event.pathname == `${prefixpath}/cache` && event.method == 'POST') {
    try {
      const data = await event.json()
      console.log('data: ', data)
      await set(manifest.id, data[manifest.id])
      return Response.json({ success: true, message: 'ok' })
    } catch (error) {
      return Response.json({ success: false, message: error })
    }
  }

  // 删除indexedDB数据
  if (event.pathname == `${prefixpath}/cache` && event.method == 'DELETE') {
    const key = event.searchParams.get('key') as string
    try {
      await del(key)
      return Response.json({ success: true, message: 'ok' })
    } catch (error) {
      return Response.json({ success: false, message: error })
    }
  }

  // websocket重新连接
  if (
    event.pathname == `${prefixpath}/reconnection` &&
    event.method == 'POST'
  ) {
    const result = await rebuildCurrentWs()
    return Response.json(result)
  }

  // 断开websocket连接
  if (event.pathname == `${prefixpath}/reconnection` && event.method == 'PUT') {
    const result = await shutdownCurrentWs()
    return Response.json(result)
  }

  return Response.json({ success: true, message: 'api server ok' })
})

console.log('api init backend')

export default app
