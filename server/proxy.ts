import {
  ArrayQueue,
  ConstantBackoff,
  Websocket,
  WebsocketBuilder,
  WebsocketEvent,
} from 'websocket-ts'
import { get } from 'idb-keyval'
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

const wsInstance: PromiseOut<Websocket> = new PromiseOut()

function createWs(
  url: string,
  reconnectDuration: number = 3000,
  maxRetries: number | undefined = 20,
): Websocket {
  console.log('ws url: ', url)
  const ws = new WebsocketBuilder(url)
    .withBuffer(new ArrayQueue())
    .withBackoff(new ConstantBackoff(reconnectDuration))
    .withMaxRetries(maxRetries)
    .build()

  ws.binaryType = 'arraybuffer'

  wsInstance.resolve(ws)

  return ws
}

function initWs(url: string) {
  // 每3s无限重连
  const ws = createWs(url, 3000, undefined)

  const waitOpenPo = new PromiseOut<$ReadableStreamIpc>()

  const onOpen = (w: Websocket, event: Event) => {
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

    try {
      serverIPC.bindIncomeStream(proxyStream.stream)
    } catch (error) {
      console.error('ipc bindIncomeStream: ', error)
    }

    ws.addEventListener(WebsocketEvent.close, () => {
      try {
        proxyStream.controller.close()
      } catch (error) {
        console.error('proxyStream close: ', error)
      }

      serverIPC.close()
    })

    waitOpenPo.onError((event) => {
      proxyStream.controller.error((event as ErrorEvent).error)
    })

    // forwarding reqeusts from proxy servers
    ws.addEventListener(
      WebsocketEvent.message,
      (_: Websocket, event: MessageEvent) => {
        try {
          const data = event.data
          if (typeof data === 'string') {
            proxyStream.controller.enqueue(simpleEncoder(data, 'utf8'))
            console.log('receive string msg: ', data)
          } else if (data instanceof ArrayBuffer) {
            proxyStream.controller.enqueue(new Uint8Array(data))

            const msg = new TextDecoder().decode(data)
            console.log('receive arraybuffer msg: ', msg)
          } else {
            throw new Error('should not happend')
          }
        } catch (err) {
          console.error('ws message: ', err)
        }
      },
    )

    // responding to requests from proxy servers
    void streamReadAll(serverIPC.stream, {
      map(chunk: Uint8Array) {
        // for test
        const msg = new TextDecoder().decode(chunk)
        console.log('ws send msg: ', msg)

        try {
          ws.send(chunk)
        } catch (error) {
          console.error('ws send: ', error)
        }
      },
      complete() {
        ws.close()
      },
    })
  }

  ws.addEventListener(WebsocketEvent.open, onOpen)
  ws.addEventListener(WebsocketEvent.error, (_: Websocket, event: Event) => {
    waitOpenPo.reject(event)
    wsInstance.reject(event)
    console.error('ws onerror: ', event)
    // ws.close()
  })

  return waitOpenPo.promise
}

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

async function initProxy() {
  let wsState: boolean = false

  // const netInfo = ((await get('config')) as NetInfo) || DefaultNetInfo
  const netInfo = (await get('config')) as NetInfo
  if (!netInfo || (!netInfo.url && !netInfo.domain)) {
    console.warn('需要配置网络模块')
    return
  }

  // const url = 'ws://127.0.0.1:8000/proxy/ws?secret=111&client_id=test.bn.com&domain=test.bn.com'
  const url = `${netInfo.url}:${netInfo.port}/proxy1/ws?secret=${netInfo.secret}&client_id=${netInfo.domain}&domain=${netInfo.domain}`

  let ipc: $ReadableStreamIpc
  try {
    ipc = await initWs(url)
  } catch (err) {
    console.error('init ws err: ', err)
    return
  }

  wsState = true

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
      const mmid = event.headers.get('X-Dweb-Host') as string

      console.log('forward request: ', url, mmid)

      // const u = 'http://external.testmodule.bagen.com.dweb:443/test?client_id=test.bn.com'
      const u = `http://external.${mmid}:443${event.pathname}${event.search}`

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

  return wsState
}

export const rebuildCurrentWs = async () => {
  if (wsInstance.is_resolved || wsInstance.is_rejected) {
    const ws = await wsInstance.promise
    ws.close()
  }

  let msg: string = 'connection successful'
  if (!wsInstance.reason) {
    msg = wsInstance.reason as string
  }

  const wsState = await initProxy()
  return { success: wsState, message: msg }
}
