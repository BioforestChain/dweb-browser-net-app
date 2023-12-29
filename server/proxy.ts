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
  IpcEvent,
  $MMID,
  FetchEvent,
  $IpcEvent,
  $Ipc,
} from '@dweb-browser/js-process'
import manifest from '../manifest.json'
import { makeSignature } from './crypto'

let wsInstance: PromiseOut<Websocket> = new PromiseOut()

function createWs(
  url: string,
  reconnectDuration: number = 3000,
  maxRetries: number | undefined,
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

function initWs(url: string, mmid: $MMID) {
  // 每3s无限重连
  const ws = createWs(url, 3000, undefined)

  const waitOpenPo = new PromiseOut<$ReadableStreamIpc>()

  const onOpen = (w: Websocket, event: Event) => {
    const serverIPC = new ReadableStreamIpc(
      {
        mmid: mmid, // TODO 从manifest获取net模块id？
        name: mmid, // TODO
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

        proxy.reset()

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

async function haveApp(mmid: string, dstMmid: string): Promise<boolean> {
  const apps = await get<{ app_id: string }[]>(`${mmid}_appModuleList`)
  if (!apps) return false

  for (const app of apps) {
    if (app.app_id === dstMmid) return true
  }

  return false
}

export class Proxy {
  constructor() {}

  #ipc: PromiseOut<$ReadableStreamIpc> = new PromiseOut()

  getIpc(): PromiseOut<$ReadableStreamIpc> {
    return this.#ipc
  }

  private async connect() {
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

    const signatureSrc = await makeSignature(netInfo.broadcast_address)
    const signature = encodeURIComponent(signatureSrc as string)
    let url: string
    // TODO for test
    if (netInfo.broadcast_address == '1234567.b.com') {
      url = `ws://127.0.0.1:${netInfo.port}/proxy/ws?secret=${netInfo.secret}&client_id=${netInfo.broadcast_address}&s=${signature}`
    } else {
      url = `ws://${netInfo.domain}:${netInfo.port}/proxy/ws?secret=${netInfo.secret}&client_id=${netInfo.broadcast_address}&s=${signature}`
    }

    // const url = 'ws://127.0.0.1:8000/proxy/ws?secret=111&client_id=test.bn.com&domain=test.bn.com'
    let ipc: $ReadableStreamIpc
    try {
      ipc = await initWs(url, netConfigKey as $MMID)
      this.#ipc.resolve(ipc)
    } catch (err) {
      this.#ipc.reject(err)
      console.error('init ws err: ', err)
      saveError(`init ws err: ${err}`)
      return wsState
    }

    wsState = true

    // 监听 ws 推来的IpcRequest
    ipc
      .onFetch(async (event) => {
        return await this.forwardIpcRequest(event, netInfo, ipc)
      })
      .forbidden()
      .cors()

    // 监听 ws 推来的IpcEvent
    ipc.onEvent((message, ipc) => {
      console.log('aaaaaaa: ', message, ipc)
      return this.forwardIpcEvent(message, ipc)
    })

    return wsState
  }

  private async forwardIpcRequest(
    event: FetchEvent,
    netInfo: NetInfo,
    ipc: $ReadableStreamIpc,
  ) {
    const url = new URL(event.request.url)

    console.log('forward url: ', url, event, netInfo)

    if (url.hostname !== netInfo?.broadcast_address) {
      return IpcResponse.fromJson(
        event.req_id,
        400,
        undefined,
        { success: false, message: 'invalid request' },
        ipc,
      )
    }

    // forwarding reqeusts
    const mmid = event.headers.get('X-Dweb-Host') as string
    console.log('forward request: ', url, mmid)
    if (!(await haveApp(netConfigKey, mmid))) {
      return IpcResponse.fromJson(
        event.req_id,
        404,
        undefined,
        { success: false, message: 'Not Found' },
        ipc,
      )
    }

    // const u = 'http://external.testmodule.bagen.com.dweb:443/test?client_id=test.bn.com'
    const u = `http://external.${mmid}:443${event.pathname}${event.search}`

    try {
      // TODO 如果没安装mmid或权限原因，这里应该立即返回错误，但目前却会一直hanging，需要plaoc or dweb-browser修复
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
  }

  private async forwardIpcEvent(event: $IpcEvent, ipc: $Ipc) {
    // IpcEvent.data数据格式：
    // IpcEvent.data = {
    //   headers: {
    //       "X-Dweb-Host": "xxx.dweb"， // 必填，网络模块转发的下个模块mmid；发布订阅模式下，就是发布订阅模块mmid
    //       "X-Dweb-Pubsub-App": "xxx.dweb", // 选填，发布订阅模式下，是使用发布订阅模块的mmid
    //    },
    //   body: {
    //       topic: "xxx" // 必填，订阅的主题
    //       data：string | []byte ， // 必填，发布的数据
    //   }
    // }
    const eventData = JSON.parse(event.text) as EventData
    const proxiedMMID = eventData.headers['X-Dweb-Host'] as $MMID
    const targetIpc = await jsProcess.connect(proxiedMMID)
    // TODO 这里写activity是由于dweb_browser目前只有这个途径使用event，后续改进后这里应该使用topic
    const ipcEvent = IpcEvent.fromText('activity', event.text)
    targetIpc.postMessage(ipcEvent)
  }

  async restart() {
    await this.close()

    let result = false
    try {
      result = await this.connect()
    } catch (error) {
      console.error('restart ipc: ', error)
    }

    let msg: string = result ? 'connection successful' : 'connection failed'
    return { success: result, message: msg }
  }

  async shutdown() {
    await this.close()
    return { success: true, message: '已关闭' }
  }

  private async close() {
    if (wsInstance.is_finished) {
      const ws = await wsInstance.promise
      ws.close()
    }

    this.reset()
  }

  reset() {
    this.#ipc = new PromiseOut<$ReadableStreamIpc>()
  }

  state() {
    let code = 0
    let message = 'No connection'
    if (this.#ipc.is_resolved) {
      code = 1
      message = 'Successful connection'
    }

    if (this.#ipc.is_rejected) {
      code = 2
      message = 'Connection failed'
    }

    // code = 0 未连接
    // code = 1 连接成功
    // code = 2 连接失败
    return { success: true, data: { code: code }, message: message }
  }
}

const proxy = new Proxy()

type EventData = {
  headers: {
    'X-Dweb-Host': string
    'X-Dweb-Pubsub-App'?: string
  }
  body: {
    topic: string
    data: string | Uint8Array
  }
}

export default proxy
