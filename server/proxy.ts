import {
  RingQueue,
  ConstantBackoff,
  Websocket,
  WebsocketBuilder,
  WebsocketEvent,
} from 'websocket-ts'
import { get, update } from 'idb-keyval'
import {
  $ReadableStreamIpc,
  ReadableStreamIpc,
  PromiseOut,
  IPC_ROLE,
  ReadableStreamOut,
  streamReadAll,
  jsProcess,
  simpleEncoder,
  IpcResponse,
  IpcHeaders,
} from '@dweb-browser/js-process'
import manifest from '../manifest.json'

let wsInstance: PromiseOut<Websocket> = new PromiseOut()

function createWs(
  url: string,
  reconnectDuration: number = 3000,
  maxRetries: number | undefined = 20,
): Websocket {
  console.log('ws url: ', url)
  const ws = new WebsocketBuilder(url)
    .withBuffer(new RingQueue(100))
    .withBackoff(new ConstantBackoff(reconnectDuration))
    .withMaxRetries(maxRetries)
    .build()

  ws.binaryType = 'arraybuffer'

  wsInstance = new PromiseOut()
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
      saveError(`ipc bindIncomeStream: ${error}`)
      console.error('ipc bindIncomeStream: ', error)
    }

    ws.addEventListener(
      WebsocketEvent.close,
      (_: Websocket, event: CloseEvent) => {
        console.error('ws close: ', event)

        try {
          proxyStream.controller.close()
        } catch (error) {
          saveError(`proxyStream close: ${error}`)
          console.error('proxyStream close: ', error)
        }

        serverIPC.close()
      },
    )

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
        } catch (error) {
          saveError(`ws message: ${error}`)
          console.error('ws message: ', error)
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
          saveError(`ws send: ${error}`)
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
    saveError(`ws onerror: ${event}`)
    console.error('ws onerror: ', event)
    // ws.close()
  })

  return waitOpenPo.promise
}

interface NetInfo {
  domain: string
  port: number
  secret: string
  broadcast_address: string
  net_id: string
}

const netConfigKey = manifest.id

async function initProxy() {
  let wsState: boolean = false
  const netInfos = await get<NetInfo[] | undefined>(netConfigKey)
  if (!netInfos) {
    return wsState
  }

  const netInfo = netInfos[0]
  if (!netInfo || !netInfo.domain || !netInfo.broadcast_address) {
    saveError('配置不正确')
    console.warn('需要配置网络模块')
    return wsState
  }

  let url: string
  // TODO for test
  if (netInfo.broadcast_address == 'c.b.com') {
    url = `ws://127.0.0.1:${netInfo.port}/proxy/ws?secret=${netInfo.secret}&client_id=${netInfo.broadcast_address}&domain=${netInfo.broadcast_address}`
  } else {
    url = `ws://${netInfo.domain}:${netInfo.port}/proxy/ws?secret=${netInfo.secret}&client_id=${netInfo.broadcast_address}&domain=${netInfo.broadcast_address}`
  }

  // const url = 'ws://127.0.0.1:8000/proxy/ws?secret=111&client_id=test.bn.com&domain=test.bn.com'
  let ipc: $ReadableStreamIpc
  try {
    ipc = await initWs(url)
  } catch (err) {
    console.error('init ws err: ', err)
    saveError(`init ws err: ${err}`)
    return wsState
  }

  wsState = true

  ipc
    .onFetch(async (event) => {
      const url = new URL(event.request.url)

      console.log('forward url: ', url, event, netInfo)

      if (url.hostname !== netInfo.broadcast_address) {
        return Response.json({ success: false, message: 'invalid request' })
      }

      // forwarding reqeusts
      const mmid = event.headers.get('X-Dweb-Host') as string

      console.log('forward request: ', url, mmid)

      // const u = 'http://external.testmodule.bagen.com.dweb:443/test?client_id=test.bn.com'
      const u = `http://external.${mmid}:443${event.pathname}${event.search}`

      try {
        const resp = await jsProcess.nativeFetch(u, {
          method: event.method,
          headers: event.headers,
          body: event.body,
        })

        console.log('forward response: ', resp.status)
        return resp
      } catch (error) {
        saveError(`forward reqeust: ${error}`)
        const headers = new IpcHeaders({ 'Content-Type': 'application/json' })
        return IpcResponse.fromJson(
          event.req_id,
          400,
          headers,
          { success: false, message: error },
          ipc,
        )
      }
    })
    .forbidden()
    .cors()

  return wsState
}

export const rebuildCurrentWs = async () => {
  if (wsInstance.is_finished) {
    const ws = await wsInstance.promise
    ws.close()
  }

  const wsState = await initProxy()

  let msg: string = wsState ? 'connection successful' : 'connection failed'
  return { success: wsState, message: msg }
}

export const shutdownCurrentWs = async () => {
  if (wsInstance.is_finished) {
    const ws = await wsInstance.promise
    ws.close()
  }

  return { success: true, message: '已关闭' }
}

const ErrKey = 'errors'

async function saveError(err: any) {
  update(ErrKey, (val) => {
    const v = val || []
    v.push(err)

    if (v.length > 100) {
      return v.slice(v.length - 100, v.length)
    }

    return v
  })
}
