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

  // TODO 由于dweb browser的bug，这里写死header头，后续修复后需删除
  event.headers.append('X-Dweb-Host', 'netmodule.bagen.com.dweb')
  event.headers.append('X-Dweb-Host-Domain', '1234567.b.com') //bro_addr

  event.headers.append('X-Dweb-Pubsub', 'pubsubmodule.bagen.com.dweb')
  event.headers.append('X-Dweb-Pubsub-App', `testmodule.bagen.com.dweb`)

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
})

// 监听其它模块发的IpcEvent
jsProcess.onActivity((message: $IpcEvent, ipc: $Ipc) => {
  // TODO 通过ipc发送
  console.log('net module event: ', message, ipc)
})

export default app
