import { Router } from '@plaoc/server/middleware'
import proxy from './proxy'
import {
  $IpcEvent,
  $IpcRequest,
  jsProcess,
  $Ipc,
  IpcRequest,
  streamReadAllBuffer,
} from '@dweb-browser/js-process'

const app = new Router()

// 监听其它模块发的IpcRequest
app.use(async (event) => {
  console.log('net external:=>', event, event.ipcRequest)

  const proxyIpcPo = proxy.getIpc()
  if (!proxyIpcPo.is_finished) {
    return Response.json({
      success: false,
      message: 'Please configure the network application first',
    })
  }

  if (proxyIpcPo.is_rejected) {
    return Response.json({
      success: false,
      message: 'Network application connection failed',
    })
  }

  // TODO
  // 1. postMessage需要ack吗？
  // 2. postMessage超时设置？
  // 3. postMessage重传机制？重试几次？
  const proxyIpc = await proxyIpcPo.promise

  // jsProcess.onConnect(myIpc => {

  //   console.log("onConnent",myIpc.remote.mmid)

  //   myIpc.onRequest((message: $IpcRequest, ipc: $Ipc)=>{
  //     console.log("myipc onrequest: ", message, ipc)
  //   })

  //   ipc.onStream((message: $IpcStreamMessage, ipc: $Ipc)=>{
  //     console.log("ipc.onStream: ", message, ipc)
  //     // ipc.postMessage(event.ipcRequest)

  //     myIpc.postMessage(message)
  //   })
  // })

  // ipc.onEvent((message: $IpcEvent, ipc: $Ipc)=>{
  //   console.log("ipc.onEvent: ", message, ipc)
  //   ipc.postMessage(event.ipcRequest)
  // })

  // TODO 由于dweb browser的bug，这里写死header头，后续修复后需删除
  event.headers.append('X-Dweb-Pubsub', 'pubsubmodule.bagen.com.dweb')
  event.headers.append('X-Dweb-Pubsub-App', `testmodule.bagen.com.dweb`)
  event.headers.append('X-Dweb-Pubsub-Net', 'netmodule.bagen.com.dweb')
  event.headers.append('X-Dweb-Pubsub-Net-Domain', 'c.b.com')

  let body: ArrayBuffer
  let req: $IpcRequest
  if (event.body) {
    console.log('net req body1')
    // body = await event.ipcRequest.body.u8a()
    body = await streamReadAllBuffer(event.body)
    console.log(
      'net req body2: ',
      body.byteLength,
      new TextDecoder().decode(body),
    )
    req = IpcRequest.fromBinary(
      event.req_id,
      event.url.toString(),
      event.method,
      event.headers,
      body,
      proxyIpc,
    )
  } else {
    req = IpcRequest.fromText(
      event.req_id,
      event.url.toString(),
      event.method,
      event.headers,
      '',
      proxyIpc,
    )
  }

  console.log('net req: ', req)
  // 转发请求
  proxyIpc.postMessage(req)
  // TODO postMessage没有超时设置，会导致阻塞
  const resp = await proxyIpc.registerReqId(event.req_id).promise
  console.log('net resp: ', resp.toResponse())
  return resp

  // return Response.json({ success: true, message: 'ok' })
})

// jsProcess.onConnect(myIpc => {
//   console.log("net onConnent", myIpc.remote.mmid)

//   myIpc.onFetch(async (event)=>{
//     console.log("myipc onrequest: ", event.ipcRequest, event)
//     const proxyIpcPro = proxy.getIpc()

//   // myIpc.onRequest(async (message: $IpcRequest, ipc: $Ipc)=>{
//     // console.log("myipc onrequest: ", message, ipc)

//     // const r = IpcResponse.fromJson(message.req_id, 200, undefined, { success: true, message: 'ok' }, ipc)
//     // ipc.postMessage(r)
//     // return

//     // return Response.json({ success: false, message: 'Please configure the network application first' })

//     if (!proxyIpcPro.is_finished) {
//       return Response.json({
//         success: false,
//         message: 'Please configure the network application first',
//       })
//     }

//     if (proxyIpcPro.is_rejected) {
//       return Response.json({
//         success: false,
//         message: 'Network application connection failed',
//       })
//     }

//     // TODO
//     // 1. postMessage需要ack吗？
//     // 2. postMessage超时设置？
//     // 3. postMessage重传机制？重试几次？
//     const proxyIpc = await proxyIpcPro.promise

//     let body: ArrayBuffer
//     let req: $IpcRequest
//     if (event.body) {
//       console.log('net req body1')
//       body = await streamReadAllBuffer(event.body)
//       console.log('net req body2: ', new TextDecoder().decode(body))
//       req = IpcRequest.fromBinary(
//         event.req_id,
//         event.url.toString(),
//         event.method,
//         event.headers,
//         body,
//         myIpc)
//     } else {
//       req = IpcRequest.fromText(
//         event.req_id,
//         event.url.toString(),
//         event.method,
//         event.headers,
//         '',
//         myIpc)
//     }
//     // 转发请求
//     proxyIpc.postMessage(req)
//     // proxyIpc.postMessage(event.ipcRequest)
//     // TODO postMessage没有超时设置，会导致阻塞
//     const resp = await proxyIpc.registerReqId(event.req_id).promise
//     console.log('net resp: ', resp)
//     return resp

//   })

//   // ipc.onStream((message: $IpcStreamMessage, ipc: $Ipc)=>{
//   //   console.log("ipc.onStream: ", message, ipc)
//   //   // ipc.postMessage(event.ipcRequest)

//   //   myIpc.postMessage(message)
//   // })
// })

// 监听其它模块发的IpcEvent
jsProcess.onActivity((message: $IpcEvent, ipc: $Ipc) => {
  // TODO 通过ipc发送
  console.log('net module event: ', message, ipc)
})

export default app
