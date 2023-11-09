import { useWebSocket } from '@vueuse/core'
import { useLocalCache } from './lib/cache'

const { getCache } = useLocalCache()

/**
 * 1. 从storage里获取网络服务信息，并发起websocket连接
 * 2. 监听接收到的请求，并通过websocket转发
 * 3. 网络服务配置发生变更时，重新发起ws连接
 */
export default class NetProxy {
  constructor() {
    const netInfo = getCache('config')

    const url = `${netInfo.url}:${netInfo.port}/proxy/ws?secret=${netInfo.secret}&client_id=${netInfo.net_id}&domain=${netInfo.domain}`

    const { status, data, open, close, send } = useWebSocket(url, {
      autoReconnect: {
        delay: 1000,
        onFailed() {
          console.log('Failed to connect WebSocket')
        },
      },
    })

    console.log('ws stata: ', status, data)
    send('hello')
  }
}

// 1. plaoc/server/middleware怎么引入？
// 1. ws接收到的data如何转成ipc对象？
// 2. 后端可以主动通知前端吗？
// 2. 后端能用vue的第三方库吗？ x
// 2. 前端如何调用后端接口？
