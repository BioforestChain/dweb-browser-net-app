import { Router } from '@plaoc/server/middleware'
import proxy from './proxy'
import { $IpcEvent, jsProcess, $Ipc } from '@dweb-browser/js-process'

const app = new Router()

// 监听其它模块发的IpcRequest
app.use(async (event) => {
  console.log('net external:=>', event, event.ipcRequest)

  const ipcPo = proxy.getIpc()
  if (!ipcPo.is_finished) {
    return Response.json({
      success: false,
      message: 'Please configure the network application first',
    })
  }

  if (ipcPo.is_rejected) {
    return Response.json({
      success: false,
      message: 'Network application connection failed',
    })
  }

  // TODO
  // 1. postMessage需要ack吗？
  // 2. postMessage超时设置？
  // 3. postMessage重传机制？重试几次？
  const ipc = await ipcPo.promise
  // 转发请求
  ipc.postMessage(event.ipcRequest)
  // TODO postMessage没有超时设置，会导致阻塞
  const resp = await ipc.registerReqId(event.req_id).promise
  console.log('net resp: ', resp.toResponse())
  return resp
  // return Response.json({ success: true, message: 'ok' })
})

// 监听其它模块发的IpcEvent
jsProcess.onActivity((message: $IpcEvent, ipc: $Ipc) => {
  // TODO 通过ipc发送
  console.log('net module event: ', message, ipc)
})

export default app
