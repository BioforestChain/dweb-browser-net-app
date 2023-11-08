// import { useWebSocket, useLocalStorage } from '@vueuse/core'

// /**
//  * 1. 从storage里获取网络服务信息，并发起websocket连接
//  * 2. 监听接收到的请求，并通过websocket转发
//  */

// interface NetInfo {
//   url: string
//   port: number
//   secret: string
//   domain: string
//   net_id: string
// }

// export default class NetProxy {
//   constructor() {
//     const netInfo = this.getNetInfo()

//     const url = `${netInfo.url}:${netInfo.port}/proxy/ws?secret=${netInfo.secret}&client_id=net-app-id`

//     const { status, data, send } = useWebSocket(url, {
//       autoReconnect: {
//         delay: 1000,
//         onFailed() {
//           console.log('Failed to connect WebSocket')
//         },
//       },
//     })

//     console.log('ws stata: ', status, data)
//     send('hello')
//   }

//   getNetInfo(): NetInfo {
//     const store = useLocalStorage('net-info', {
//       url: 'ws://127.0.0.1',
//       port: 8000,
//       secret: 'test',
//       domain: 'test',
//     })

//     return store.value as NetInfo
//   }
// }
