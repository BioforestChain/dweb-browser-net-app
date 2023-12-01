import { Router } from '@plaoc/server/middleware'
import { get, set, del } from 'idb-keyval'
import { jsProcess } from '@dweb-browser/js-process'
import Proxy from './proxy'

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

      const keys = Object.keys(data)
      if (keys.length != 1) {
        throw new Error('只能传一个json key')
      }

      await set(keys[0], data[keys[0]])
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
    const result = await Proxy.restart()
    return Response.json(result)
  }

  // 断开websocket连接
  if (event.pathname == `${prefixpath}/reconnection` && event.method == 'PUT') {
    const result = await Proxy.shutdown()
    return Response.json(result)
  }

  // 获取当前设备安装模块
  if (event.pathname == `${prefixpath}/apps` && event.method == 'GET') {
    const apps = await jsProcess.nativeFetch(
      'file://dns.std.dweb/search?category=application',
    )
    return Response.json(await apps.json())
  }

  return Response.json({ success: true, message: 'api server ok' })
})

console.log('api init backend')

export default app
