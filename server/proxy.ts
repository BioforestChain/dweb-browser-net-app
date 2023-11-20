/**
 * 1. 从storage里获取网络服务信息，并发起websocket连接
 * 2. 监听接收到的请求，并通过websocket转发
 * 3. 网络服务配置发生变更时，重新发起ws连接
 */

// 1. plaoc/server/middleware怎么引入？
// 1. ws接收到的data如何转成ipc对象？
// 2. 后端可以主动通知前端吗？
// 2. 后端能用vue的第三方库吗？ x
// 2. 前端如何调用后端接口？

import {
  $ReadableStreamIpc,
  ReadableStreamIpc,
  PromiseOut,
  IPC_ROLE,
  ReadableStreamOut,
  streamReadAll,
  jsProcess,
  simpleEncoder,
} from '@dweb-browser/js-process'

// wsURL: const url = `${netInfo.url}:${netInfo.port}/proxy/ws?secret=${netInfo.secret}&client_id=${netInfo.net_id}&domain=${netInfo.domain}`
export const createWsProxy = (wsURL: string) => {
  const waitOpenPo = new PromiseOut<$ReadableStreamIpc>()
  const ws = new WebSocket(wsURL)

  console.log('ws url: ', ws, wsURL)

  ws.binaryType = 'arraybuffer'

  ws.onerror = (event) => {
    waitOpenPo.reject(event)
    console.error('ws err: ', event)
    ws.close()
  }

  ws.onopen = () => {
    const serverIPC = new ReadableStreamIpc(
      {
        mmid: '.dweb', // TODO 从manifest获取net模块id？
        name: '.dweb', // TODO
        ipc_support_protocols: { cbor: false, protobuf: false, raw: false },
        dweb_deeplinks: [],
        categories: [],
      },
      // @ts-ignore
      IPC_ROLE.CLIENT,
    )

    waitOpenPo.resolve(serverIPC)

    const proxyStream = new ReadableStreamOut<Uint8Array>({ highWaterMark: 1 })

    serverIPC.bindIncomeStream(proxyStream.stream)

    ws.onclose = () => {
      try {
        proxyStream.controller.close()
      } catch (error) {}

      serverIPC.close()

      // setInterval(()=>{
      //   console.log('retry: ', wsURL)
      //   createWsProxy(wsURL)

      // }, 2000)
    }

    waitOpenPo.onError((event) => {
      proxyStream.controller.error((event as ErrorEvent).error)
    })

    // forwarding reqeusts from proxy servers
    ws.onmessage = (event) => {
      try {
        const data = event.data
        if (typeof data === 'string') {
          proxyStream.controller.enqueue(simpleEncoder(data, 'utf8'))
          console.log('receive msg1: ', data)
        } else if (data instanceof ArrayBuffer) {
          proxyStream.controller.enqueue(new Uint8Array(data))

          const msg = new TextDecoder().decode(data)
          console.log('receive msg2: ', msg)
        } else {
          throw new Error('should not happend')
        }
      } catch (err) {
        console.error(err)
      }
    }

    // responding to requests from proxy servers
    void streamReadAll(serverIPC.stream, {
      map(chunk: Uint8Array) {
        // console.log("ws send: ", chunk)

        const msg = new TextDecoder().decode(chunk)
        console.log('ws send msg: ', msg)
        try {
          ws.send(chunk)
        } catch (error) {
          console.error(error)
        }
      },
      complete() {
        ws.close()
      },
    })
  }

  return waitOpenPo.promise
}

import { get } from 'idb-keyval'

interface NetInfo {
  url: string
  port: number
  secret: string
  domain: string
  net_id: string
}

const DefaultNetInfo = {
  url: 'ws://127.0.0.1',
  port: 8000,
  secret: 'test',
  domain: 'test.bn.com',
  net_id: 'netmodule.bagen.com.dweb',
} as NetInfo

export const initWsProxy = async () => {
  // const netInfo = getCache('config')
  const netInfo = ((await get('config')) as NetInfo) || DefaultNetInfo

  const url = `${netInfo.url}:${netInfo.port}/proxy/ws?secret=${netInfo.secret}&client_id=${netInfo.domain}&domain=${netInfo.domain}`

  const ipc = await createWsProxy(url)
  ipc
    .onFetch(async (event) => {
      console.log('net app event: ', event)
      const url = new URL(event.request.url)

      console.log('forward url: ', url, netInfo)
      // TODO for test
      if (url.hostname == '127.0.0.1') {
      } else if (url.hostname !== netInfo.domain) {
        return Response.json({ success: false, message: 'invalid request' })
      }

      // forwarding reqeusts
      const mmid = event.headers.get('X-Dweb-Host')

      url.host = mmid as string

      console.log('forward request: ', url, mmid)

      const u =
        'http://external.testmodule.bagen.com.dweb:443/test?client_id=test.bn.com'
      const resp = await jsProcess.nativeFetch(u, {
        method: event.method,
        headers: event.headers,
        body: event.body,
      })

      console.log('forward response: ', resp.status)
      return resp
    })
    .forbidden()
    .cors()
}
