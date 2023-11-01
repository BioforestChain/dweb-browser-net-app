var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _binary, _text, _jsonAble, _a, _type_encoding, _type_isInline, _type_isStream, _jsonAble2, _b, _binary2, _text2, _jsonAble3, _c, _ipcHeaders, _d, _manifest, _e2, _request, _f;
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const style = "";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target2, value) => __defProp(target2, "name", { value, configurable: true });
var __decorateClass = (decorators, target2, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target2, key) : target2;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target2, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target2, key, result);
  return result;
};
var __accessCheck2 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet2 = (obj, member, getter) => {
  __accessCheck2(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd2 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var isBinary = /* @__PURE__ */ __name((data) => data instanceof ArrayBuffer || ArrayBuffer.isView(data) || typeof SharedArrayBuffer === "function" && data instanceof SharedArrayBuffer, "isBinary");
var binaryToU8a = /* @__PURE__ */ __name((binary) => {
  if (binary instanceof Uint8Array) {
    return binary;
  }
  if (ArrayBuffer.isView(binary)) {
    return new Uint8Array(binary.buffer, binary.byteOffset, binary.byteLength);
  }
  return new Uint8Array(binary);
}, "binaryToU8a");
var u8aConcat = /* @__PURE__ */ __name((binaryList) => {
  let totalLength = 0;
  for (const binary of binaryList) {
    totalLength += binary.byteLength;
  }
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const binary of binaryList) {
    result.set(binary, offset);
    offset += binary.byteLength;
  }
  return result;
}, "u8aConcat");
var textEncoder = new TextEncoder();
var simpleEncoder = /* @__PURE__ */ __name((data, encoding) => {
  if (encoding === "base64") {
    const byteCharacters = atob(data);
    const binary = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      binary[i] = byteCharacters.charCodeAt(i);
    }
    return binary;
  } else if (encoding === "hex") {
    const binary = new Uint8Array(data.length / 2);
    for (let i = 0; i < binary.length; i++) {
      const start = i + i;
      binary[i] = parseInt(data.slice(start, start + 2), 16);
    }
    return binary;
  }
  return textEncoder.encode(data);
}, "simpleEncoder");
var textDecoder = new TextDecoder();
var simpleDecoder = /* @__PURE__ */ __name((data, encoding) => {
  if (encoding === "base64") {
    let binary = "";
    const bytes = binaryToU8a(data);
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  } else if (encoding === "hex") {
    let hex = "";
    const bytes = binaryToU8a(data);
    for (const byte of bytes) {
      hex += byte.toString(16).padStart(2, "0");
    }
    return hex;
  }
  return textDecoder.decode(data);
}, "simpleDecoder");
var createSignal = /* @__PURE__ */ __name((autoStart) => {
  return new Signal(autoStart);
}, "createSignal");
var Signal = class {
  constructor(autoStart = true) {
    this._cbs = /* @__PURE__ */ new Set();
    this._started = false;
    this._cachedEmits = [];
    this.start = () => {
      if (this._started) {
        return;
      }
      this._started = true;
      if (this._cachedEmits.length) {
        for (const args of this._cachedEmits) {
          this._emit(args, this._cbs);
        }
        this._cachedEmits.length = 0;
      }
    };
    this.listen = (cb) => {
      this._cbs.add(cb);
      this.start();
      return () => this._cbs.delete(cb);
    };
    this.emit = (...args) => {
      if (this._started) {
        this._emit(args, this._cbs);
      } else {
        this._cachedEmits.push(args);
      }
    };
    this.emitAndClear = (...args) => {
      if (this._started) {
        const cbs = [...this._cbs];
        this._cbs.clear();
        this._emit(args, cbs);
      } else {
        this._cachedEmits.push(args);
      }
    };
    this._emit = (args, cbs) => {
      for (const cb of cbs) {
        try {
          cb.apply(null, args);
        } catch (reason) {
          console.warn(reason);
        }
      }
    };
    this.clear = () => {
      this._cbs.clear();
    };
    if (autoStart) {
      this.start();
    }
  }
};
__name(Signal, "Signal");
async function* _doRead(reader, options) {
  const signal = options == null ? void 0 : options.signal;
  if (signal !== void 0) {
    signal.addEventListener("abort", (reason) => reader.cancel(reason));
  }
  try {
    while (true) {
      const item = await reader.read();
      if (item.done) {
        break;
      }
      yield item.value;
    }
  } catch (err) {
    reader.cancel(err);
  } finally {
    reader.releaseLock();
  }
}
__name(_doRead, "_doRead");
var streamRead = /* @__PURE__ */ __name((stream, options) => {
  return _doRead(stream.getReader(), options);
}, "streamRead");
var binaryStreamRead = /* @__PURE__ */ __name((stream, options) => {
  const reader = streamRead(stream, options);
  let done = false;
  let cache = new Uint8Array(0);
  const appendToCache = /* @__PURE__ */ __name(async () => {
    const item = await reader.next();
    if (item.done) {
      done = true;
      return false;
    } else {
      cache = u8aConcat([cache, item.value]);
      return true;
    }
  }, "appendToCache");
  const available = /* @__PURE__ */ __name(async () => {
    if (cache.length > 0) {
      return cache.length;
    }
    if (done) {
      return -1;
    }
    await appendToCache();
    return available();
  }, "available");
  const readBinary = /* @__PURE__ */ __name(async (size) => {
    if (cache.length >= size) {
      const result = cache.subarray(0, size);
      cache = cache.subarray(size);
      return result;
    }
    if (await appendToCache()) {
      return readBinary(size);
    } else {
      throw new Error(`fail to read bytes(${cache.length}/${size} byte) in stream`);
    }
  }, "readBinary");
  const u32 = new Uint32Array(1);
  const u32_u8 = new Uint8Array(u32.buffer);
  const readInt = /* @__PURE__ */ __name(async () => {
    const intBuf = await readBinary(4);
    u32_u8.set(intBuf);
    return u32[0];
  }, "readInt");
  return Object.assign(reader, {
    available,
    readBinary,
    readInt
  });
}, "binaryStreamRead");
var streamReadAll = /* @__PURE__ */ __name(async (stream, options = {}) => {
  var _a2;
  const maps = [];
  for await (const item of _doRead(stream.getReader())) {
    if (options.map) {
      maps.push(options.map(item));
    }
  }
  const result = (_a2 = options.complete) == null ? void 0 : _a2.call(options, maps);
  return {
    maps,
    result
  };
}, "streamReadAll");
var streamReadAllBuffer = /* @__PURE__ */ __name(async (stream) => {
  return (await streamReadAll(stream, {
    map(chunk) {
      return chunk;
    },
    complete(chunks) {
      return u8aConcat(chunks);
    }
  })).result;
}, "streamReadAllBuffer");
var ReadableStreamOut = class {
  constructor(strategy) {
    this.strategy = strategy;
    this.stream = new ReadableStream(
      {
        cancel: (reason) => {
          var _a2;
          (_a2 = this._on_cancel_signal) == null ? void 0 : _a2.emit(reason);
        },
        start: (controller) => {
          this.controller = controller;
        },
        pull: () => {
          var _a2;
          (_a2 = this._on_pull_signal) == null ? void 0 : _a2.emit();
        }
      },
      this.strategy
    );
  }
  get onCancel() {
    return (this._on_cancel_signal ?? (this._on_cancel_signal = createSignal())).listen;
  }
  get onPull() {
    return (this._on_pull_signal ?? (this._on_pull_signal = createSignal())).listen;
  }
};
__name(ReadableStreamOut, "ReadableStreamOut");
var _IpcBody = class {
  get raw() {
    return this._bodyHub.data;
  }
  async u8a() {
    const bodyHub = this._bodyHub;
    let body_u8a = bodyHub.u8a;
    if (body_u8a === void 0) {
      if (bodyHub.stream) {
        body_u8a = await streamReadAllBuffer(bodyHub.stream);
      } else if (bodyHub.text !== void 0) {
        body_u8a = simpleEncoder(bodyHub.text, "utf8");
      } else {
        throw new Error(`invalid body type`);
      }
      bodyHub.u8a = body_u8a;
      _IpcBody.CACHE.raw_ipcBody_WMap.set(body_u8a, this);
    }
    return body_u8a;
  }
  async stream() {
    const bodyHub = this._bodyHub;
    let body_stream = bodyHub.stream;
    if (body_stream === void 0) {
      body_stream = new Blob([await this.u8a()]).stream();
      bodyHub.stream = body_stream;
      _IpcBody.CACHE.raw_ipcBody_WMap.set(body_stream, this);
    }
    return body_stream;
  }
  async text() {
    const bodyHub = this._bodyHub;
    let body_text = bodyHub.text;
    if (body_text === void 0) {
      body_text = simpleDecoder(await this.u8a(), "utf8");
      bodyHub.text = body_text;
    }
    return body_text;
  }
};
var IpcBody = _IpcBody;
__name(IpcBody, "IpcBody");
IpcBody.CACHE = new class {
  constructor() {
    this.raw_ipcBody_WMap = /* @__PURE__ */ new WeakMap();
    this.metaId_receiverIpc_Map = /* @__PURE__ */ new Map();
    this.metaId_ipcBodySender_Map = /* @__PURE__ */ new Map();
  }
}();
var BodyHub = class {
  constructor(data) {
    this.data = data;
    if (typeof data === "string") {
      this.text = data;
    } else if (data instanceof ReadableStream) {
      this.stream = data;
    } else {
      this.u8a = data;
    }
  }
};
__name(BodyHub, "BodyHub");
var toIpcMethod = /* @__PURE__ */ __name((method) => {
  if (method == null) {
    return "GET";
  }
  switch (method.toUpperCase()) {
    case "GET": {
      return "GET";
    }
    case "POST": {
      return "POST";
    }
    case "PUT": {
      return "PUT";
    }
    case "DELETE": {
      return "DELETE";
    }
    case "OPTIONS": {
      return "OPTIONS";
    }
    case "TRACE": {
      return "TRACE";
    }
    case "PATCH": {
      return "PATCH";
    }
    case "PURGE": {
      return "PURGE";
    }
    case "HEAD": {
      return "HEAD";
    }
  }
  throw new Error(`invalid method: ${method}`);
}, "toIpcMethod");
var IpcMessage = class {
  constructor(type) {
    this.type = type;
  }
};
__name(IpcMessage, "IpcMessage");
var $dataToBinary = /* @__PURE__ */ __name((data, encoding) => {
  switch (encoding) {
    case 8: {
      return data;
    }
    case 4: {
      return simpleEncoder(data, "base64");
    }
    case 2: {
      return simpleEncoder(data, "utf8");
    }
  }
  throw new Error(`unknown encoding: ${encoding}`);
}, "$dataToBinary");
var $dataToText = /* @__PURE__ */ __name((data, encoding) => {
  switch (encoding) {
    case 8: {
      return simpleDecoder(data, "utf8");
    }
    case 4: {
      return simpleDecoder(simpleEncoder(data, "base64"), "utf8");
    }
    case 2: {
      return data;
    }
  }
  throw new Error(`unknown encoding: ${encoding}`);
}, "$dataToText");
var IpcStreamAbort = class extends IpcMessage {
  constructor(stream_id) {
    super(
      6
      /* STREAM_ABORT */
    );
    this.stream_id = stream_id;
  }
};
__name(IpcStreamAbort, "IpcStreamAbort");
var IpcStreamPulling = class extends IpcMessage {
  constructor(stream_id, bandwidth) {
    super(
      3
      /* STREAM_PULLING */
    );
    this.stream_id = stream_id;
    this.bandwidth = bandwidth ?? 0;
  }
};
__name(IpcStreamPulling, "IpcStreamPulling");
var IpcBodyReceiver = class extends IpcBody {
  constructor(metaBody, ipc) {
    super();
    this.metaBody = metaBody;
    if (metaBody.type_isStream) {
      const streamId = metaBody.streamId;
      const senderIpcUid = metaBody.senderUid;
      const metaId = `${senderIpcUid}/${streamId}`;
      if (IpcBodyReceiver.CACHE.metaId_receiverIpc_Map.has(metaId) === false) {
        ipc.onClose(() => {
          IpcBodyReceiver.CACHE.metaId_receiverIpc_Map.delete(metaId);
        });
        IpcBodyReceiver.CACHE.metaId_receiverIpc_Map.set(metaId, ipc);
        metaBody.receiverUid = ipc.uid;
      }
      const receiver = IpcBodyReceiver.CACHE.metaId_receiverIpc_Map.get(metaId);
      if (receiver === void 0) {
        throw new Error(`no found ipc by metaId:${metaId}`);
      }
      ipc = receiver;
      this._bodyHub = new BodyHub($metaToStream(this.metaBody, ipc));
    } else
      switch (metaBody.type_encoding) {
        case 2:
          this._bodyHub = new BodyHub(metaBody.data);
          break;
        case 4:
          this._bodyHub = new BodyHub(simpleEncoder(metaBody.data, "base64"));
          break;
        case 8:
          this._bodyHub = new BodyHub(metaBody.data);
          break;
        default:
          throw new Error(`invalid metaBody type: ${metaBody.type}`);
      }
  }
  /**
   * 基于 metaBody 还原 IpcBodyReceiver
   */
  static from(metaBody, ipc) {
    return IpcBodyReceiver.CACHE.metaId_ipcBodySender_Map.get(metaBody.metaId) ?? new IpcBodyReceiver(metaBody, ipc);
  }
};
__name(IpcBodyReceiver, "IpcBodyReceiver");
var $metaToStream = /* @__PURE__ */ __name((metaBody, ipc) => {
  if (ipc == null) {
    throw new Error(`miss ipc when ipc-response has stream-body`);
  }
  const stream_ipc = ipc;
  const stream_id = metaBody.streamId;
  let paused = true;
  const stream = new ReadableStream(
    {
      start(controller) {
        ipc.onClose(() => {
          try {
            controller.close();
          } catch {
          }
        });
        let firstData;
        switch (metaBody.type_encoding) {
          case 2:
            firstData = simpleEncoder(metaBody.data, "utf8");
            break;
          case 4:
            firstData = simpleEncoder(metaBody.data, "base64");
            break;
          case 8:
            firstData = metaBody.data;
            break;
        }
        if (firstData) {
          controller.enqueue(firstData);
        }
        const off = ipc.onStream((message) => {
          if (message.stream_id === stream_id) {
            switch (message.type) {
              case 2:
                controller.enqueue(message.binary);
                break;
              case 5:
                controller.close();
                off();
                break;
            }
          }
        });
      },
      pull(_controller) {
        if (paused) {
          paused = false;
          stream_ipc.postMessage(new IpcStreamPulling(stream_id));
        }
      },
      cancel() {
        stream_ipc.postMessage(new IpcStreamAbort(stream_id));
      }
    },
    {
      /// 按需 pull, 不可以0以上。否则一开始的时候就会发送pull指令，会导致远方直接把流给读取出来。
      /// 这会导致一些优化的行为异常，有些时候流一旦开始读取了，其他读取者就不能再进入读取了。那么流转发就不能工作了
      highWaterMark: 0
    }
  );
  return stream;
}, "$metaToStream");
new WritableStream({});
var isPromiseLike = /* @__PURE__ */ __name((value) => {
  return value instanceof Object && typeof value.then === "function";
}, "isPromiseLike");
var PromiseOut = class {
  constructor() {
    this.is_resolved = false;
    this.is_rejected = false;
    this.is_finished = false;
    this.promise = new Promise((resolve, reject) => {
      this.resolve = (value) => {
        try {
          if (isPromiseLike(value)) {
            value.then(this.resolve, this.reject);
          } else {
            this.is_resolved = true;
            this.is_finished = true;
            resolve(this.value = value);
            this._runThen();
            this._innerFinallyArg = Object.freeze({
              status: "resolved",
              result: this.value
            });
            this._runFinally();
          }
        } catch (err) {
          this.reject(err);
        }
      };
      this.reject = (reason) => {
        this.is_rejected = true;
        this.is_finished = true;
        reject(this.reason = reason);
        this._runCatch();
        this._innerFinallyArg = Object.freeze({
          status: "rejected",
          reason: this.reason
        });
        this._runFinally();
      };
    });
  }
  static resolve(v7) {
    const po = new PromiseOut();
    po.resolve(v7);
    return po;
  }
  static reject(reason) {
    const po = new PromiseOut();
    po.reject(reason);
    return po;
  }
  static sleep(ms) {
    const po = new PromiseOut();
    let ti = setTimeout(() => {
      ti = void 0;
      po.resolve();
    }, ms);
    po.onFinished(() => ti !== void 0 && clearTimeout(ti));
    return po;
  }
  onSuccess(innerThen) {
    if (this.is_resolved) {
      this.__callInnerThen(innerThen);
    } else {
      (this._innerThen || (this._innerThen = [])).push(innerThen);
    }
  }
  onError(innerCatch) {
    if (this.is_rejected) {
      this.__callInnerCatch(innerCatch);
    } else {
      (this._innerCatch || (this._innerCatch = [])).push(innerCatch);
    }
  }
  onFinished(innerFinally) {
    if (this.is_finished) {
      this.__callInnerFinally(innerFinally);
    } else {
      (this._innerFinally || (this._innerFinally = [])).push(innerFinally);
    }
  }
  _runFinally() {
    if (this._innerFinally) {
      for (const innerFinally of this._innerFinally) {
        this.__callInnerFinally(innerFinally);
      }
      this._innerFinally = void 0;
    }
  }
  __callInnerFinally(innerFinally) {
    queueMicrotask(async () => {
      try {
        await innerFinally(this._innerFinallyArg);
      } catch (err) {
        console.error("Unhandled promise rejection when running onFinished", innerFinally, err);
      }
    });
  }
  _runThen() {
    if (this._innerThen) {
      for (const innerThen of this._innerThen) {
        this.__callInnerThen(innerThen);
      }
      this._innerThen = void 0;
    }
  }
  _runCatch() {
    if (this._innerCatch) {
      for (const innerCatch of this._innerCatch) {
        this.__callInnerCatch(innerCatch);
      }
      this._innerCatch = void 0;
    }
  }
  __callInnerThen(innerThen) {
    queueMicrotask(async () => {
      try {
        await innerThen(this.value);
      } catch (err) {
        console.error("Unhandled promise rejection when running onSuccess", innerThen, err);
      }
    });
  }
  __callInnerCatch(innerCatch) {
    queueMicrotask(async () => {
      try {
        await innerCatch(this.value);
      } catch (err) {
        console.error("Unhandled promise rejection when running onError", innerCatch, err);
      }
    });
  }
};
__name(PromiseOut, "PromiseOut");
if (typeof crypto.randomUUID !== "function") {
  crypto.randomUUID = /* @__PURE__ */ __name(function randomUUID() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (_c2) => {
      const c7 = +_c2;
      return (c7 ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c7 / 4).toString(16);
    });
  }, "randomUUID");
}
var CacheGetter = class {
  constructor(getter) {
    this.getter = getter;
    this._first = true;
  }
  get value() {
    if (this._first) {
      this._first = false;
      this._value = this.getter();
    }
    return this._value;
  }
  reset() {
    this._first = true;
    this._value = void 0;
  }
};
__name(CacheGetter, "CacheGetter");
var IpcStreamData = (_a = class extends IpcMessage {
  constructor(stream_id, data, encoding) {
    super(
      2
      /* STREAM_DATA */
    );
    __privateAdd(this, _binary, new CacheGetter(() => $dataToBinary(this.data, this.encoding)));
    __privateAdd(this, _text, new CacheGetter(() => $dataToText(this.data, this.encoding)));
    __privateAdd(this, _jsonAble, new CacheGetter(() => {
      if (this.encoding === 8) {
        return IpcStreamData.fromBase64(this.stream_id, this.data);
      }
      return this;
    }));
    this.stream_id = stream_id;
    this.data = data;
    this.encoding = encoding;
  }
  static fromBase64(stream_id, data) {
    return new IpcStreamData(
      stream_id,
      simpleDecoder(data, "base64"),
      4
      /* BASE64 */
    );
  }
  static fromBinary(stream_id, data) {
    return new IpcStreamData(
      stream_id,
      data,
      8
      /* BINARY */
    );
  }
  static fromUtf8(stream_id, data) {
    return new IpcStreamData(
      stream_id,
      simpleDecoder(data, "utf8"),
      2
      /* UTF8 */
    );
  }
  get binary() {
    return __privateGet(this, _binary).value;
  }
  get text() {
    return __privateGet(this, _text).value;
  }
  get jsonAble() {
    return __privateGet(this, _jsonAble).value;
  }
  toJSON() {
    return { ...this.jsonAble };
  }
}, _binary = new WeakMap(), _text = new WeakMap(), _jsonAble = new WeakMap(), _a);
__name(IpcStreamData, "IpcStreamData");
var IpcStreamEnd = class extends IpcMessage {
  constructor(stream_id) {
    super(
      5
      /* STREAM_END */
    );
    this.stream_id = stream_id;
  }
};
__name(IpcStreamEnd, "IpcStreamEnd");
var MetaBody = (_b = class {
  constructor(type, senderUid, data, streamId, receiverUid, metaId = simpleDecoder(crypto.getRandomValues(new Uint8Array(8)), "base64")) {
    __privateAdd(this, _type_encoding, new CacheGetter(() => {
      const encoding = this.type & 254;
      switch (encoding) {
        case 2:
          return 2;
        case 4:
          return 4;
        case 8:
          return 8;
        default:
          return 2;
      }
    }));
    __privateAdd(this, _type_isInline, new CacheGetter(() => (this.type & 1) !== 0));
    __privateAdd(this, _type_isStream, new CacheGetter(() => (this.type & 1) === 0));
    __privateAdd(this, _jsonAble2, new CacheGetter(() => {
      if (this.type_encoding === 8) {
        return MetaBody.fromBase64(
          this.senderUid,
          simpleDecoder(this.data, "base64"),
          this.streamId,
          this.receiverUid
        );
      }
      return this;
    }));
    this.type = type;
    this.senderUid = senderUid;
    this.data = data;
    this.streamId = streamId;
    this.receiverUid = receiverUid;
    this.metaId = metaId;
  }
  static fromJSON(metaBody) {
    if (metaBody instanceof MetaBody === false) {
      metaBody = new MetaBody(
        metaBody.type,
        metaBody.senderUid,
        metaBody.data,
        metaBody.streamId,
        metaBody.receiverUid,
        metaBody.metaId
      );
    }
    return metaBody;
  }
  static fromText(senderUid, data, streamId, receiverUid) {
    return new MetaBody(
      streamId == null ? IPC_META_BODY_TYPE.INLINE_TEXT : IPC_META_BODY_TYPE.STREAM_WITH_TEXT,
      senderUid,
      data,
      streamId,
      receiverUid
    );
  }
  static fromBase64(senderUid, data, streamId, receiverUid) {
    return new MetaBody(
      streamId == null ? IPC_META_BODY_TYPE.INLINE_BASE64 : IPC_META_BODY_TYPE.STREAM_WITH_BASE64,
      senderUid,
      data,
      streamId,
      receiverUid
    );
  }
  static fromBinary(sender, data, streamId, receiverUid) {
    if (typeof sender === "number") {
      return new MetaBody(
        streamId == null ? IPC_META_BODY_TYPE.INLINE_BINARY : IPC_META_BODY_TYPE.STREAM_WITH_BINARY,
        sender,
        data,
        streamId,
        receiverUid
      );
    }
    if (sender.support_binary) {
      return this.fromBinary(sender.uid, data, streamId, receiverUid);
    }
    return this.fromBase64(sender.uid, simpleDecoder(data, "base64"), streamId, receiverUid);
  }
  get type_encoding() {
    return __privateGet(this, _type_encoding).value;
  }
  get type_isInline() {
    return __privateGet(this, _type_isInline).value;
  }
  get type_isStream() {
    return __privateGet(this, _type_isStream).value;
  }
  get jsonAble() {
    return __privateGet(this, _jsonAble2).value;
  }
  toJSON() {
    return { ...this.jsonAble };
  }
}, _type_encoding = new WeakMap(), _type_isInline = new WeakMap(), _type_isStream = new WeakMap(), _jsonAble2 = new WeakMap(), _b);
__name(MetaBody, "MetaBody");
var IPC_META_BODY_TYPE = ((IPC_META_BODY_TYPE2) => {
  IPC_META_BODY_TYPE2[IPC_META_BODY_TYPE2["STREAM_ID"] = 0] = "STREAM_ID";
  IPC_META_BODY_TYPE2[IPC_META_BODY_TYPE2["INLINE"] = 1] = "INLINE";
  IPC_META_BODY_TYPE2[
    IPC_META_BODY_TYPE2["STREAM_WITH_TEXT"] = 0 | 2
    /* UTF8 */
  ] = "STREAM_WITH_TEXT";
  IPC_META_BODY_TYPE2[
    IPC_META_BODY_TYPE2["STREAM_WITH_BASE64"] = 0 | 4
    /* BASE64 */
  ] = "STREAM_WITH_BASE64";
  IPC_META_BODY_TYPE2[
    IPC_META_BODY_TYPE2["STREAM_WITH_BINARY"] = 0 | 8
    /* BINARY */
  ] = "STREAM_WITH_BINARY";
  IPC_META_BODY_TYPE2[
    IPC_META_BODY_TYPE2["INLINE_TEXT"] = 1 | 2
    /* UTF8 */
  ] = "INLINE_TEXT";
  IPC_META_BODY_TYPE2[
    IPC_META_BODY_TYPE2["INLINE_BASE64"] = 1 | 4
    /* BASE64 */
  ] = "INLINE_BASE64";
  IPC_META_BODY_TYPE2[
    IPC_META_BODY_TYPE2["INLINE_BINARY"] = 1 | 8
    /* BINARY */
  ] = "INLINE_BINARY";
  return IPC_META_BODY_TYPE2;
})(IPC_META_BODY_TYPE || {});
var _IpcBodySender = class extends IpcBody {
  constructor(data, ipc) {
    super();
    this.data = data;
    this.ipc = ipc;
    this.streamCtorSignal = createSignal();
    this.usedIpcMap = /* @__PURE__ */ new Map();
    this.UsedIpcInfo = /* @__PURE__ */ __name(class UsedIpcInfo {
      constructor(ipcBody, ipc2, bandwidth = 0, fuse = 0) {
        this.ipcBody = ipcBody;
        this.ipc = ipc2;
        this.bandwidth = bandwidth;
        this.fuse = fuse;
      }
      emitStreamPull(message) {
        return this.ipcBody.emitStreamPull(this, message);
      }
      emitStreamPaused(message) {
        return this.ipcBody.emitStreamPaused(this, message);
      }
      emitStreamAborted() {
        return this.ipcBody.emitStreamAborted(this);
      }
    }, "UsedIpcInfo");
    this.closeSignal = createSignal();
    this.openSignal = createSignal();
    this._isStreamOpened = false;
    this._isStreamClosed = false;
    this._bodyHub = new BodyHub(data);
    this.metaBody = this.$bodyAsMeta(data, ipc);
    this.isStream = data instanceof ReadableStream;
    if (typeof data !== "string") {
      _IpcBodySender.CACHE.raw_ipcBody_WMap.set(data, this);
    }
    _IpcBodySender.$usableByIpc(ipc, this);
  }
  static fromAny(data, ipc) {
    if (typeof data !== "string") {
      const cache = _IpcBodySender.CACHE.raw_ipcBody_WMap.get(data);
      if (cache !== void 0) {
        return cache;
      }
    }
    return new _IpcBodySender(data, ipc);
  }
  static fromText(raw, ipc) {
    return this.fromAny(raw, ipc);
  }
  static fromBinary(raw, ipc) {
    return this.fromAny(raw, ipc);
  }
  static fromStream(raw, ipc) {
    return this.fromAny(raw, ipc);
  }
  /**
   * 绑定使用
   */
  useByIpc(ipc) {
    const info = this.usedIpcMap.get(ipc);
    if (info !== void 0) {
      return info;
    }
    if (this.isStream && !this._isStreamOpened) {
      const info2 = new this.UsedIpcInfo(this, ipc);
      this.usedIpcMap.set(ipc, info2);
      this.closeSignal.listen(() => {
        this.emitStreamAborted(info2);
      });
      return info2;
    }
  }
  /**
   * 拉取数据
   */
  emitStreamPull(info, message) {
    info.bandwidth = message.bandwidth;
    this.streamCtorSignal.emit(
      0
      /* PULLING */
    );
  }
  /**
   * 暂停数据
   */
  emitStreamPaused(info, message) {
    info.bandwidth = -1;
    info.fuse = message.fuse;
    let paused = true;
    for (const info2 of this.usedIpcMap.values()) {
      if (info2.bandwidth >= 0) {
        paused = false;
        break;
      }
    }
    if (paused) {
      this.streamCtorSignal.emit(
        1
        /* PAUSED */
      );
    }
  }
  /**
   * 解绑使用
   */
  emitStreamAborted(info) {
    if (this.usedIpcMap.delete(info.ipc) != null) {
      if (this.usedIpcMap.size === 0) {
        this.streamCtorSignal.emit(
          2
          /* ABORTED */
        );
      }
    }
  }
  onStreamClose(cb) {
    return this.closeSignal.listen(cb);
  }
  onStreamOpen(cb) {
    return this.openSignal.listen(cb);
  }
  get isStreamOpened() {
    return this._isStreamOpened;
  }
  set isStreamOpened(value) {
    if (this._isStreamOpened !== value) {
      this._isStreamOpened = value;
      if (value) {
        this.openSignal.emitAndClear();
      }
    }
  }
  get isStreamClosed() {
    return this._isStreamClosed;
  }
  set isStreamClosed(value) {
    if (this._isStreamClosed !== value) {
      this._isStreamClosed = value;
      if (value) {
        this.closeSignal.emitAndClear();
      }
    }
  }
  emitStreamClose() {
    this.isStreamOpened = true;
    this.isStreamClosed = true;
  }
  $bodyAsMeta(body, ipc) {
    if (typeof body === "string") {
      return MetaBody.fromText(ipc.uid, body);
    }
    if (body instanceof ReadableStream) {
      return this.$streamAsMeta(body, ipc);
    }
    return MetaBody.fromBinary(ipc, body);
  }
  /**
   * 如果 rawData 是流模式，需要提供数据发送服务
   *
   * 这里不会一直无脑发，而是对方有需要的时候才发
   * @param stream_id
   * @param stream
   * @param ipc
   */
  $streamAsMeta(stream, ipc) {
    const stream_id = getStreamId(stream);
    let _reader;
    const getReader = /* @__PURE__ */ __name(() => _reader ?? (_reader = binaryStreamRead(stream)), "getReader");
    (async () => {
      let pullingLock = new PromiseOut();
      this.streamCtorSignal.listen(async (signal) => {
        switch (signal) {
          case 0: {
            pullingLock.resolve();
            break;
          }
          case 1: {
            if (pullingLock.is_finished) {
              pullingLock = new PromiseOut();
            }
            break;
          }
          case 2: {
            await getReader().return();
            await stream.cancel();
            this.emitStreamClose();
          }
        }
      });
      while (true) {
        await pullingLock.promise;
        const reader = getReader();
        const availableLen = await reader.available();
        if (availableLen > 0) {
          this.isStreamOpened = true;
          const message = IpcStreamData.fromBinary(stream_id, await reader.readBinary(availableLen));
          for (const ipc2 of this.usedIpcMap.keys()) {
            ipc2.postMessage(message);
          }
        } else if (availableLen === -1) {
          const message = new IpcStreamEnd(stream_id);
          for (const ipc2 of this.usedIpcMap.keys()) {
            ipc2.postMessage(message);
          }
          await stream.cancel();
          this.emitStreamClose();
          break;
        }
      }
    })().catch(console.error);
    const streamType = 0;
    const streamFirstData = "";
    if ("preReadableSize" in stream && typeof stream.preReadableSize === "number" && stream.preReadableSize > 0)
      ;
    const metaBody = new MetaBody(streamType, ipc.uid, streamFirstData, stream_id);
    _IpcBodySender.CACHE.metaId_ipcBodySender_Map.set(metaBody.metaId, this);
    this.streamCtorSignal.listen((signal) => {
      if (signal == 2) {
        _IpcBodySender.CACHE.metaId_ipcBodySender_Map.delete(metaBody.metaId);
      }
    });
    return metaBody;
  }
};
var IpcBodySender = _IpcBodySender;
__name(IpcBodySender, "IpcBodySender");
IpcBodySender.$usableByIpc = (ipc, ipcBody) => {
  if (ipcBody.isStream && !ipcBody._isStreamOpened) {
    const streamId = ipcBody.metaBody.streamId;
    let usableIpcBodyMapper = IpcUsableIpcBodyMap.get(ipc);
    if (usableIpcBodyMapper === void 0) {
      const mapper = new UsableIpcBodyMapper();
      IpcUsableIpcBodyMap.set(ipc, mapper);
      mapper.onDestroy(
        ipc.onStream((message) => {
          var _a2, _b2, _c2, _d2, _e3, _f2;
          switch (message.type) {
            case 3:
              (_b2 = (_a2 = mapper.get(message.stream_id)) == null ? void 0 : _a2.useByIpc(ipc)) == null ? void 0 : _b2.emitStreamPull(message);
              break;
            case 4:
              (_d2 = (_c2 = mapper.get(message.stream_id)) == null ? void 0 : _c2.useByIpc(ipc)) == null ? void 0 : _d2.emitStreamPaused(message);
              break;
            case 6:
              (_f2 = (_e3 = mapper.get(message.stream_id)) == null ? void 0 : _e3.useByIpc(ipc)) == null ? void 0 : _f2.emitStreamAborted();
              break;
          }
        })
      );
      mapper.onDestroy(() => IpcUsableIpcBodyMap.delete(ipc));
      usableIpcBodyMapper = mapper;
    }
    if (usableIpcBodyMapper.add(streamId, ipcBody)) {
      ipcBody.onStreamClose(() => usableIpcBodyMapper.remove(streamId));
    }
  }
};
var streamIdWM = /* @__PURE__ */ new WeakMap();
var streamRealmId = crypto.randomUUID();
var stream_id_acc = 0;
var getStreamId = /* @__PURE__ */ __name((stream) => {
  let id = streamIdWM.get(stream);
  if (id === void 0) {
    id = `${streamRealmId}-${stream_id_acc++}`;
    streamIdWM.set(stream, id);
  }
  return id;
}, "getStreamId");
var setStreamId = /* @__PURE__ */ __name((stream, cid) => {
  let id = streamIdWM.get(stream);
  if (id === void 0) {
    streamIdWM.set(stream, id = `${streamRealmId}-${stream_id_acc++}[${cid}]`);
  }
  return id;
}, "setStreamId");
var UsableIpcBodyMapper = class {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
    this.destroySignal = createSignal();
  }
  add(streamId, ipcBody) {
    if (this.map.has(streamId)) {
      return false;
    }
    this.map.set(streamId, ipcBody);
    return true;
  }
  get(streamId) {
    return this.map.get(streamId);
  }
  remove(streamId) {
    const ipcBody = this.map.get(streamId);
    if (ipcBody !== void 0) {
      this.map.delete(streamId);
      if (this.map.size === 0) {
        this.destroySignal.emitAndClear();
      }
    }
  }
  onDestroy(cb) {
    this.destroySignal.listen(cb);
  }
};
__name(UsableIpcBodyMapper, "UsableIpcBodyMapper");
var IpcUsableIpcBodyMap = /* @__PURE__ */ new WeakMap();
var IpcEvent = (_c = class extends IpcMessage {
  constructor(name, data, encoding) {
    super(
      7
      /* EVENT */
    );
    __privateAdd(this, _binary2, new CacheGetter(() => $dataToBinary(this.data, this.encoding)));
    __privateAdd(this, _text2, new CacheGetter(() => $dataToText(this.data, this.encoding)));
    __privateAdd(this, _jsonAble3, new CacheGetter(() => {
      if (this.encoding === 8) {
        return IpcEvent.fromBase64(this.name, this.data);
      }
      return this;
    }));
    this.name = name;
    this.data = data;
    this.encoding = encoding;
  }
  static fromBase64(name, data) {
    return new IpcEvent(
      name,
      simpleDecoder(data, "base64"),
      4
      /* BASE64 */
    );
  }
  static fromBinary(name, data) {
    return new IpcEvent(
      name,
      data,
      8
      /* BINARY */
    );
  }
  static fromUtf8(name, data) {
    return new IpcEvent(
      name,
      simpleDecoder(data, "utf8"),
      2
      /* UTF8 */
    );
  }
  static fromText(name, data) {
    return new IpcEvent(
      name,
      data,
      2
      /* UTF8 */
    );
  }
  get binary() {
    return __privateGet(this, _binary2).value;
  }
  get text() {
    return __privateGet(this, _text2).value;
  }
  get jsonAble() {
    return __privateGet(this, _jsonAble3).value;
  }
  toJSON() {
    return { ...this.jsonAble };
  }
}, _binary2 = new WeakMap(), _text2 = new WeakMap(), _jsonAble3 = new WeakMap(), _c);
__name(IpcEvent, "IpcEvent");
var IpcHeaders = class extends Headers {
  init(key, value) {
    if (this.has(key) === false) {
      this.set(key, value);
    }
    return this;
  }
  toJSON() {
    const record = {};
    this.forEach((value, key) => {
      record[key.replace(/\w+/g, (w8) => w8[0].toUpperCase() + w8.slice(1))] = value;
    });
    return record;
  }
};
__name(IpcHeaders, "IpcHeaders");
var once = /* @__PURE__ */ __name((fn) => {
  let first = true;
  let resolved;
  let rejected;
  let success = false;
  return function(...args) {
    if (first) {
      first = false;
      try {
        resolved = fn.apply(this, args);
        success = true;
      } catch (err) {
        rejected = err;
      }
    }
    if (success) {
      return resolved;
    }
    throw rejected;
  };
}, "once");
var getBaseUrl = /* @__PURE__ */ __name(() => URL_BASE ?? (URL_BASE = "document" in globalThis ? document.baseURI : "location" in globalThis && (location.protocol === "http:" || location.protocol === "https:" || location.protocol === "file:" || location.protocol === "chrome-extension:") ? location.href : "file:///"), "getBaseUrl");
var URL_BASE;
var parseUrl = /* @__PURE__ */ __name((url2, base = getBaseUrl()) => {
  return new URL(url2, base);
}, "parseUrl");
var httpMethodCanOwnBody = /* @__PURE__ */ __name((method, headers) => {
  if (headers !== void 0) {
    return isWebSocket(method, headers instanceof Headers ? headers : new Headers(headers));
  }
  return method !== "GET" && method !== "HEAD" && method !== "TRACE" && method !== "OPTIONS";
}, "httpMethodCanOwnBody");
var $bodyInitToIpcBodyArgs = /* @__PURE__ */ __name(async (bodyInit, onUnknown) => {
  let body = "";
  if (bodyInit instanceof FormData || bodyInit instanceof URLSearchParams) {
    bodyInit = await new Request("", {
      body: bodyInit
    }).blob();
  }
  if (bodyInit instanceof ReadableStream) {
    body = bodyInit;
  } else if (bodyInit instanceof Blob) {
    if (bodyInit.size >= 16 * 1024 * 1024) {
      body = (bodyInit == null ? void 0 : bodyInit.stream()) || "";
    }
    if (body === "") {
      body = new Uint8Array(await bodyInit.arrayBuffer());
    }
  } else if (isBinary(bodyInit)) {
    body = binaryToU8a(bodyInit);
  } else if (typeof bodyInit === "string") {
    body = bodyInit;
  } else if (bodyInit) {
    if (onUnknown) {
      bodyInit = onUnknown(bodyInit);
    } else {
      throw new Error(`unsupport body type: ${bodyInit == null ? void 0 : bodyInit.constructor.name}`);
    }
  }
  return body;
}, "$bodyInitToIpcBodyArgs");
var isWebSocket = /* @__PURE__ */ __name((method, headers) => {
  var _a2;
  return method === "GET" && ((_a2 = headers.get("Upgrade")) == null ? void 0 : _a2.toLowerCase()) === "websocket";
}, "isWebSocket");
var buildRequestX = /* @__PURE__ */ __name((url2, init = {}) => {
  let method = init.method ?? "GET";
  const headers = init.headers instanceof Headers ? init.headers : new Headers(init.headers);
  const isWs = isWebSocket(method, headers);
  let body;
  if (isWs) {
    method = "POST";
    body = init.body;
  } else if (httpMethodCanOwnBody(method)) {
    body = init.body;
  }
  const request_init = {
    method,
    headers,
    body,
    duplex: body instanceof ReadableStream ? "half" : void 0
  };
  const request = new Request(url2, request_init);
  if (isWs) {
    Object.defineProperty(request, "method", {
      configurable: true,
      enumerable: true,
      writable: false,
      value: "GET"
    });
  }
  if (request_init.body instanceof ReadableStream && request.body != request_init.body) {
    Object.defineProperty(request, "body", {
      configurable: true,
      enumerable: true,
      writable: false,
      value: request_init.body
    });
  }
  return request;
}, "buildRequestX");
var IpcRequest = class extends IpcMessage {
  constructor(req_id, url2, method, headers, body, ipc) {
    super(
      0
      /* REQUEST */
    );
    this.req_id = req_id;
    this.url = url2;
    this.method = method;
    this.headers = headers;
    this.body = body;
    this.ipc = ipc;
    this.ipcReqMessage = once(
      () => new IpcReqMessage(this.req_id, this.method, this.url, this.headers.toJSON(), this.body.metaBody)
    );
    if (body instanceof IpcBodySender) {
      IpcBodySender.$usableByIpc(ipc, body);
    }
  }
  get parsed_url() {
    return this._parsed_url ?? (this._parsed_url = parseUrl(this.url));
  }
  static fromText(req_id, url2, method = "GET", headers = new IpcHeaders(), text, ipc) {
    return new IpcRequest(req_id, url2, method, headers, IpcBodySender.fromText(text, ipc), ipc);
  }
  static fromBinary(req_id, url2, method = "GET", headers = new IpcHeaders(), binary, ipc) {
    headers.init("Content-Type", "application/octet-stream");
    headers.init("Content-Length", binary.byteLength + "");
    return new IpcRequest(req_id, url2, method, headers, IpcBodySender.fromBinary(binaryToU8a(binary), ipc), ipc);
  }
  // 如果需要发送stream数据 一定要使用这个方法才可以传递数据否则数据无法传递
  static fromStream(req_id, url2, method = "GET", headers = new IpcHeaders(), stream, ipc) {
    headers.init("Content-Type", "application/octet-stream");
    return new IpcRequest(req_id, url2, method, headers, IpcBodySender.fromStream(stream, ipc), ipc);
  }
  static fromRequest(req_id, ipc, url2, init = {}) {
    const method = toIpcMethod(init.method);
    const headers = init.headers instanceof IpcHeaders ? init.headers : new IpcHeaders(init.headers);
    let ipcBody;
    if (isBinary(init.body)) {
      ipcBody = IpcBodySender.fromBinary(init.body, ipc);
    } else if (init.body instanceof ReadableStream) {
      ipcBody = IpcBodySender.fromStream(init.body, ipc);
    } else if (init.body instanceof Blob) {
      ipcBody = IpcBodySender.fromStream(init.body.stream(), ipc);
    } else {
      ipcBody = IpcBodySender.fromText(init.body ?? "", ipc);
    }
    return new IpcRequest(req_id, url2, method, headers, ipcBody, ipc);
  }
  /**
   * 判断是否是双工协议
   *
   * 比如目前双工协议可以由 WebSocket 来提供支持
   */
  get isDuplex() {
    return isWebSocket(this.method, this.headers);
  }
  toRequest() {
    return buildRequestX(this.url, { method: this.method, headers: this.headers, body: this.body.raw });
  }
  toJSON() {
    const { method } = this;
    if ((method === "GET" || method === "HEAD") === false) {
      return new IpcReqMessage(this.req_id, this.method, this.url, this.headers.toJSON(), this.body.metaBody);
    }
    return this.ipcReqMessage();
  }
};
__name(IpcRequest, "IpcRequest");
var IpcReqMessage = class extends IpcMessage {
  constructor(req_id, method, url2, headers, metaBody) {
    super(
      0
      /* REQUEST */
    );
    this.req_id = req_id;
    this.method = method;
    this.url = url2;
    this.headers = headers;
    this.metaBody = metaBody;
  }
};
__name(IpcReqMessage, "IpcReqMessage");
var IpcResponse = (_d = class extends IpcMessage {
  constructor(req_id, statusCode, headers, body, ipc) {
    super(
      1
      /* RESPONSE */
    );
    __privateAdd(this, _ipcHeaders, void 0);
    this.req_id = req_id;
    this.statusCode = statusCode;
    this.headers = headers;
    this.body = body;
    this.ipc = ipc;
    this.ipcResMessage = once(
      () => new IpcResMessage(this.req_id, this.statusCode, this.headers.toJSON(), this.body.metaBody)
    );
    if (body instanceof IpcBodySender) {
      IpcBodySender.$usableByIpc(ipc, body);
    }
  }
  get ipcHeaders() {
    return __privateGet(this, _ipcHeaders) ?? __privateSet(this, _ipcHeaders, new IpcHeaders(this.headers));
  }
  toResponse(url2) {
    const body = this.body.raw;
    if (body instanceof Uint8Array) {
      this.headers.init("Content-Length", body.length + "");
    }
    const response = new Response(body, {
      headers: this.headers,
      status: this.statusCode
    });
    if (url2) {
      Object.defineProperty(response, "url", {
        value: url2,
        enumerable: true,
        configurable: true,
        writable: false
      });
    }
    return response;
  }
  /** 将 response 对象进行转码变成 ipcResponse */
  static async fromResponse(req_id, response, ipc, asBinary = false) {
    if (response.bodyUsed) {
      throw new Error("body used");
    }
    let ipcBody;
    if (asBinary || response.body == void 0 || parseInt(response.headers.get("Content-Length") || "NaN") < 16 * 1024 * 1024) {
      ipcBody = IpcBodySender.fromBinary(binaryToU8a(await response.arrayBuffer()), ipc);
    } else {
      setStreamId(response.body, response.url);
      ipcBody = IpcBodySender.fromStream(response.body, ipc);
    }
    const ipcHeaders = new IpcHeaders(response.headers);
    return new IpcResponse(req_id, response.status, ipcHeaders, ipcBody, ipc);
  }
  static fromJson(req_id, statusCode, headers = new IpcHeaders(), jsonable, ipc) {
    headers.init("Content-Type", "application/json");
    return this.fromText(req_id, statusCode, headers, JSON.stringify(jsonable), ipc);
  }
  static fromText(req_id, statusCode, headers = new IpcHeaders(), text, ipc) {
    headers.init("Content-Type", "text/plain");
    return new IpcResponse(req_id, statusCode, headers, IpcBodySender.fromText(text, ipc), ipc);
  }
  static fromBinary(req_id, statusCode, headers = new IpcHeaders(), binary, ipc) {
    headers.init("Content-Type", "application/octet-stream");
    headers.init("Content-Length", binary.byteLength + "");
    return new IpcResponse(req_id, statusCode, headers, IpcBodySender.fromBinary(binaryToU8a(binary), ipc), ipc);
  }
  static fromStream(req_id, statusCode, headers = new IpcHeaders(), stream, ipc) {
    headers.init("Content-Type", "application/octet-stream");
    const ipcResponse = new IpcResponse(req_id, statusCode, headers, IpcBodySender.fromStream(stream, ipc), ipc);
    return ipcResponse;
  }
  toJSON() {
    return this.ipcResMessage();
  }
}, _ipcHeaders = new WeakMap(), _d);
__name(IpcResponse, "IpcResponse");
var IpcResMessage = class extends IpcMessage {
  constructor(req_id, statusCode, headers, metaBody) {
    super(
      1
      /* RESPONSE */
    );
    this.req_id = req_id;
    this.statusCode = statusCode;
    this.headers = headers;
    this.metaBody = metaBody;
  }
};
__name(IpcResMessage, "IpcResMessage");
var IpcStreamPaused = class extends IpcMessage {
  constructor(stream_id, fuse) {
    super(
      4
      /* STREAM_PAUSED */
    );
    this.stream_id = stream_id;
    this.fuse = fuse ?? 1;
  }
};
__name(IpcStreamPaused, "IpcStreamPaused");
var $makeFetchExtends = /* @__PURE__ */ __name((exts) => {
  return exts;
}, "$makeFetchExtends");
var fetchBaseExtends = $makeFetchExtends({
  async number() {
    const text = await this.text();
    return +text;
  },
  async ok() {
    const response = await this;
    if (response.status >= 400) {
      throw response.statusText || await response.text();
    } else {
      return response;
    }
  },
  async text() {
    const ok = await this.ok();
    return ok.text();
  },
  async binary() {
    const ok = await this.ok();
    return ok.arrayBuffer();
  },
  async boolean() {
    const text = await this.text();
    return text === "true";
  },
  async object() {
    const ok = await this.ok();
    try {
      return await ok.json();
    } catch (err) {
      debugger;
      throw err;
    }
  }
});
var JsonlinesStream = class extends TransformStream {
  constructor(onError) {
    let json = "";
    const try_enqueue = /* @__PURE__ */ __name((controller, jsonline) => {
      try {
        controller.enqueue(JSON.parse(jsonline));
      } catch (err) {
        onError ? onError(err, controller) : controller.error(err);
        return true;
      }
    }, "try_enqueue");
    super({
      transform: (chunk, controller) => {
        json += chunk;
        let line_break_index;
        while ((line_break_index = json.indexOf("\n")) !== -1) {
          const jsonline = json.slice(0, line_break_index);
          json = json.slice(jsonline.length + 1);
          if (try_enqueue(controller, jsonline)) {
            break;
          }
        }
      },
      flush: (controller) => {
        json = json.trim();
        if (json.length > 0) {
          try_enqueue(controller, json);
        }
        controller.terminate();
      }
    });
  }
};
__name(JsonlinesStream, "JsonlinesStream");
var toJsonlinesStream = /* @__PURE__ */ __name((stream) => {
  return stream.pipeThrough(new TextDecoderStream()).pipeThrough(new JsonlinesStream());
}, "toJsonlinesStream");
var $makeFetchExtends2 = /* @__PURE__ */ __name((exts) => {
  return exts;
}, "$makeFetchExtends");
var fetchStreamExtends = $makeFetchExtends2({
  /** 将响应的内容解码成 jsonlines 格式 */
  async jsonlines() {
    return (
      // 首先要能拿到数据流
      toJsonlinesStream(await this.stream())
    );
  },
  /** 获取 Response 的 body 为 ReadableStream */
  stream() {
    return this.then((res) => {
      const stream = res.body;
      if (stream == null) {
        throw new Error(`request ${res.url} could not by stream.`);
      }
      return stream;
    });
  }
});
var fetchExtends = {
  ...fetchBaseExtends,
  ...fetchStreamExtends
};
var normalizeFetchArgs = /* @__PURE__ */ __name((url2, init) => {
  let _parsed_url;
  let _request_init = init;
  if (typeof url2 === "string") {
    _parsed_url = parseUrl(url2);
  } else if (url2 instanceof Request) {
    _parsed_url = parseUrl(url2.url);
    _request_init = url2;
  } else if (url2 instanceof URL) {
    _parsed_url = url2;
  }
  if (_parsed_url === void 0) {
    throw new Error(`no found url for fetch`);
  }
  const parsed_url = _parsed_url;
  const request_init = _request_init ?? {};
  return {
    parsed_url,
    request_init
  };
}, "normalizeFetchArgs");
var AdaptersManager = class {
  constructor() {
    this.adapterOrderMap = /* @__PURE__ */ new Map();
    this.orderdAdapters = [];
  }
  _reorder() {
    this.orderdAdapters = [...this.adapterOrderMap].sort((a2, b5) => b5[1] - a2[1]).map((a2) => a2[0]);
  }
  get adapters() {
    return this.orderdAdapters;
  }
  /**
   *
   * @param adapter
   * @param order 越大优先级越高
   * @returns
   */
  append(adapter, order = 0) {
    this.adapterOrderMap.set(adapter, order);
    this._reorder();
    return () => this.remove(adapter);
  }
  remove(adapter) {
    if (this.adapterOrderMap.delete(adapter) != null) {
      this._reorder();
      return true;
    }
    return false;
  }
};
__name(AdaptersManager, "AdaptersManager");
var nativeFetchAdaptersManager = new AdaptersManager();
var MicroModule = (_e2 = class {
  constructor() {
    __privateAdd(this, _manifest, void 0);
    this._running_state_lock = PromiseOut.resolve(false);
    this._after_shutdown_signal = createSignal();
    this.onAfterShutdown = this._after_shutdown_signal.listen;
    this._ipcSet = /* @__PURE__ */ new Set();
    this._connectSignal = createSignal();
    this._activitySignal = createSignal();
    this.onActivity = this._activitySignal.listen;
    __privateSet(this, _manifest, new CacheGetter(() => {
      return {
        mmid: this.mmid,
        name: this.name,
        short_name: this.short_name,
        ipc_support_protocols: this.ipc_support_protocols,
        dweb_deeplinks: this.dweb_deeplinks,
        categories: this.categories,
        dir: this.dir,
        lang: this.lang,
        description: this.description,
        icons: this.icons,
        screenshots: this.screenshots,
        display: this.display,
        orientation: this.orientation,
        theme_color: this.theme_color,
        background_color: this.background_color,
        shortcuts: this.shortcuts
      };
    }));
  }
  addToIpcSet(ipc) {
    if (this._running_state_lock.value === true) {
      void ipc.ready();
    }
    this._ipcSet.add(ipc);
    ipc.onClose(() => {
      this._ipcSet.delete(ipc);
    });
  }
  get isRunning() {
    return this._running_state_lock.promise;
  }
  async before_bootstrap(context) {
    if (await this._running_state_lock.promise) {
      throw new Error(`module ${this.mmid} alreay running`);
    }
    this._running_state_lock = new PromiseOut();
    this.context = context;
  }
  after_bootstrap(_context) {
    this._running_state_lock.resolve(true);
    this.onConnect((ipc) => {
      void ipc.ready();
    });
    for (const ipc of this._ipcSet) {
      void ipc.ready();
    }
  }
  async bootstrap(context) {
    await this.before_bootstrap(context);
    try {
      await this._bootstrap(context);
    } finally {
      this.after_bootstrap(context);
    }
  }
  async before_shutdown() {
    if (false === await this._running_state_lock.promise) {
      throw new Error(`module ${this.mmid} already shutdown`);
    }
    this._running_state_lock = new PromiseOut();
    this.context = void 0;
    for (const ipc of this._ipcSet) {
      ipc.close();
    }
    this._ipcSet.clear();
  }
  after_shutdown() {
    this._after_shutdown_signal.emitAndClear();
    this._activitySignal.clear();
    this._connectSignal.clear();
    this._running_state_lock.resolve(false);
  }
  async shutdown() {
    await this.before_shutdown();
    try {
      await this._shutdown();
    } finally {
      this.after_shutdown();
    }
  }
  /**
   * 给内部程序自己使用的 onConnect，外部与内部建立连接时使用
   * 因为 NativeMicroModule 的内部程序在这里编写代码，所以这里会提供 onConnect 方法
   * 如果时 JsMicroModule 这个 onConnect 就是写在 WebWorker 那边了
   */
  onConnect(cb) {
    return this._connectSignal.listen(cb);
  }
  /**
   * 尝试连接到指定对象
   */
  async connect(mmid) {
    if (this.context) {
      const [ipc] = await this.context.dns.connect(mmid);
      return ipc;
    }
  }
  /**
   * 收到一个连接，触发相关事件
   */
  beConnect(ipc, reason) {
    this.addToIpcSet(ipc);
    ipc.onEvent((event, ipc2) => {
      if (event.name == "activity") {
        this._activitySignal.emit(event, ipc2);
      }
    });
    this._connectSignal.emit(ipc, reason);
  }
  async _nativeFetch(url2, init) {
    const args = normalizeFetchArgs(url2, init);
    for (const adapter of nativeFetchAdaptersManager.adapters) {
      const response = await adapter(this, args.parsed_url, args.request_init);
      if (response !== void 0) {
        return response;
      }
    }
    return fetch(args.parsed_url, args.request_init);
  }
  nativeFetch(url2, init) {
    if ((init == null ? void 0 : init.body) instanceof ReadableStream) {
      Reflect.set(init, "duplex", "half");
    }
    return Object.assign(this._nativeFetch(url2, init), fetchExtends);
  }
  toManifest() {
    return __privateGet(this, _manifest).value;
  }
}, _manifest = new WeakMap(), _e2);
__name(MicroModule, "MicroModule");
function once2(func) {
  let result;
  let called = false;
  return function(...args) {
    if (!called) {
      result = func(...args);
      called = true;
    }
    return result;
  };
}
__name(once2, "once");
var mapHelper = new class {
  getOrPut(map, key, putter) {
    if (map.has(key)) {
      return map.get(key);
    }
    const put = putter(key);
    map.set(key, put);
    return put;
  }
  getAndRemove(map, key) {
    const val = map.get(key);
    if (map.delete(key)) {
      return val;
    }
  }
}();
var ipc_uid_acc = 0;
var Ipc = class {
  constructor() {
    this.uid = ipc_uid_acc++;
    this._support_cbor = false;
    this._support_protobuf = false;
    this._support_raw = false;
    this._support_binary = false;
    this._closeSignal = createSignal(false);
    this.onClose = this._closeSignal.listen;
    this._messageSignal = this._createSignal(false);
    this.onMessage = this._messageSignal.listen;
    this.emitMessage = (args) => this._messageSignal.emit(args, this);
    this.__onRequestSignal = new CacheGetter(() => {
      const signal = this._createSignal(false);
      this.onMessage((request, ipc) => {
        if (request.type === 0) {
          signal.emit(request, ipc);
        }
      });
      return signal;
    });
    this.__onStreamSignal = new CacheGetter(() => {
      const signal = this._createSignal(false);
      this.onMessage((request, ipc) => {
        if ("stream_id" in request) {
          signal.emit(request, ipc);
        }
      });
      return signal;
    });
    this.__onEventSignal = new CacheGetter(() => {
      const signal = this._createSignal(false);
      this.onMessage((event, ipc) => {
        if (event.type === 7) {
          signal.emit(event, ipc);
        }
      });
      return signal;
    });
    this._closed = false;
    this._req_id_acc = 0;
    this.__reqresMap = new CacheGetter(() => {
      const reqresMap = /* @__PURE__ */ new Map();
      this.onMessage((message) => {
        if (message.type === 1) {
          const response_po = reqresMap.get(message.req_id);
          if (response_po) {
            reqresMap.delete(message.req_id);
            response_po.resolve(message);
          } else {
            throw new Error(`no found response by req_id: ${message.req_id}`);
          }
        }
      });
      return reqresMap;
    });
    this.readyListener = once2(async () => {
      const ready = new PromiseOut();
      this.onEvent((event, ipc) => {
        if (event.name === "ping") {
          ipc.postMessage(new IpcEvent("pong", event.data, event.encoding));
        } else if (event.name === "pong") {
          ready.resolve(event);
        }
      });
      (async () => {
        let timeDelay = 50;
        while (!ready.is_resolved && !this.isClosed && timeDelay < 5e3) {
          this.postMessage(IpcEvent.fromText("ping", ""));
          await PromiseOut.sleep(timeDelay).promise;
          timeDelay *= 3;
        }
      })();
      return await ready.promise;
    });
  }
  /**
   * 是否支持使用 MessagePack 直接传输二进制
   * 在一些特殊的场景下支持字符串传输，比如与webview的通讯
   * 二进制传输在网络相关的服务里被支持，里效率会更高，但前提是对方有 MessagePack 的编解码能力
   * 否则 JSON 是通用的传输协议
   */
  get support_cbor() {
    return this._support_cbor;
  }
  /**
   * 是否支持使用 Protobuf 直接传输二进制
   * 在网络环境里，protobuf 是更加高效的协议
   */
  get support_protobuf() {
    return this._support_protobuf;
  }
  /**
   * 是否支持结构化内存协议传输：
   * 就是说不需要对数据手动序列化反序列化，可以直接传输内存对象
   */
  get support_raw() {
    return this._support_raw;
  }
  /**
   * 是否支持二进制传输
   */
  get support_binary() {
    return this._support_binary ?? (this.support_cbor || this.support_protobuf || this.support_raw);
  }
  asRemoteInstance() {
    if (this.remote instanceof MicroModule) {
      return this.remote;
    }
  }
  // deno-lint-ignore no-explicit-any
  _createSignal(autoStart) {
    const signal = createSignal(autoStart);
    this.onClose(() => signal.clear());
    return signal;
  }
  postMessage(message) {
    if (this._closed) {
      return;
    }
    this._doPostMessage(message);
  }
  get _onRequestSignal() {
    return this.__onRequestSignal.value;
  }
  onRequest(cb) {
    return this._onRequestSignal.listen(cb);
  }
  onFetch(...handlers) {
    const onRequest = createFetchHandler(handlers);
    return onRequest.extendsTo(this.onRequest(onRequest));
  }
  get _onStreamSignal() {
    return this.__onStreamSignal.value;
  }
  onStream(cb) {
    return this._onStreamSignal.listen(cb);
  }
  get _onEventSignal() {
    return this.__onEventSignal.value;
  }
  onEvent(cb) {
    return this._onEventSignal.listen(cb);
  }
  close() {
    if (this._closed) {
      return;
    }
    this._closed = true;
    this._doClose();
    this._closeSignal.emitAndClear();
  }
  get isClosed() {
    return this._closed;
  }
  allocReqId(_url) {
    return this._req_id_acc++;
  }
  get _reqresMap() {
    return this.__reqresMap.value;
  }
  _buildIpcRequest(url2, init) {
    const req_id = this.allocReqId();
    const ipcRequest = IpcRequest.fromRequest(req_id, this, url2, init);
    return ipcRequest;
  }
  request(input, init) {
    const ipcRequest = input instanceof IpcRequest ? input : this._buildIpcRequest(input, init);
    const result = this.registerReqId(ipcRequest.req_id);
    this.postMessage(ipcRequest);
    return result.promise;
  }
  /** 自定义注册 请求与响应 的id */
  registerReqId(req_id = this.allocReqId()) {
    return mapHelper.getOrPut(this._reqresMap, req_id, () => new PromiseOut());
  }
  ready() {
    return this.readyListener();
  }
};
__name(Ipc, "Ipc");
var fetchMid = /* @__PURE__ */ __name((handler) => Object.assign(handler, { [FETCH_MID_SYMBOL]: true }), "fetchMid");
var FETCH_MID_SYMBOL = Symbol("fetch.middleware");
var fetchEnd = /* @__PURE__ */ __name((handler) => Object.assign(handler, { [FETCH_END_SYMBOL]: true }), "fetchEnd");
var FETCH_END_SYMBOL = Symbol("fetch.end");
var $throw = /* @__PURE__ */ __name((err) => {
  throw err;
}, "$throw");
var fetchHanlderFactory = {
  NoFound: () => fetchEnd((_event, res) => res ?? $throw(new FetchError("No Found", { status: 404 }))),
  Forbidden: () => fetchEnd((_event, res) => res ?? $throw(new FetchError("Forbidden", { status: 403 }))),
  BadRequest: () => fetchEnd((_event, res) => res ?? $throw(new FetchError("Bad Request", { status: 400 }))),
  InternalServerError: (message = "Internal Server Error") => fetchEnd((_event, res) => res ?? $throw(new FetchError(message, { status: 500 })))
  // deno-lint-ignore no-explicit-any
};
var createFetchHandler = /* @__PURE__ */ __name((onFetchs) => {
  const onFetchHanlders = [...onFetchs];
  const extendsTo = /* @__PURE__ */ __name((_to) => {
    const wrapFactory = /* @__PURE__ */ __name((factory) => {
      return (...args) => {
        onFetchHanlders.push(factory(...args));
        return to;
      };
    }, "wrapFactory");
    const EXT = {
      onFetch: (handler) => {
        onFetchHanlders.push(handler);
        return to;
      },
      onWebSocket: (hanlder) => {
        onFetchHanlders.push(hanlder);
        return to;
      },
      mid: (handler) => {
        onFetchHanlders.push(fetchMid(handler));
        return to;
      },
      end: (handler) => {
        onFetchHanlders.push(fetchEnd(handler));
        return to;
      },
      /**
       * 配置跨域，一般是最后调用
       * @param config
       */
      cors: (config = {}) => {
        onFetchHanlders.unshift((event) => {
          if (event.method === "OPTIONS") {
            return { body: "" };
          }
        });
        onFetchHanlders.push(
          fetchMid((res) => {
            res == null ? void 0 : res.headers.init("Access-Control-Allow-Origin", config.origin ?? "*").init("Access-Control-Allow-Headers", config.headers ?? "*").init("Access-Control-Allow-Methods", config.methods ?? "*");
            return res;
          })
        );
        return to;
      },
      noFound: wrapFactory(fetchHanlderFactory.NoFound),
      forbidden: wrapFactory(fetchHanlderFactory.Forbidden),
      badRequest: wrapFactory(fetchHanlderFactory.BadRequest),
      internalServerError: wrapFactory(fetchHanlderFactory.InternalServerError),
      extendsTo
    };
    const to = _to;
    Object.assign(to, EXT);
    return to;
  }, "extendsTo");
  const onRequest = /* @__PURE__ */ __name(async (request, ipc) => {
    const event = new FetchEvent(request, ipc);
    let res;
    for (const handler of onFetchHanlders) {
      try {
        let result = void 0;
        if (FETCH_MID_SYMBOL in handler) {
          if (res !== void 0) {
            result = await handler(res, event);
          }
        } else if (FETCH_END_SYMBOL in handler) {
          result = await handler(event, res);
        } else {
          if (res === void 0) {
            result = await handler(event);
          }
        }
        if (result instanceof IpcResponse) {
          res = result;
        } else if (result instanceof Response) {
          res = await IpcResponse.fromResponse(request.req_id, result, ipc);
        } else if (typeof result === "object") {
          const req_id = request.req_id;
          const status = result.status ?? 200;
          const headers = new IpcHeaders(result.headers);
          if (result.body instanceof IpcBody) {
            res = new IpcResponse(req_id, status, headers, result.body, ipc);
          } else {
            const body = await $bodyInitToIpcBodyArgs(result.body, (bodyInit) => {
              if (headers.has("Content-Type") === false || headers.get("Content-Type").startsWith("application/javascript")) {
                headers.init("Content-Type", "application/javascript,charset=utf8");
                return JSON.stringify(bodyInit);
              }
              return String(bodyInit);
            });
            if (typeof body === "string") {
              res = IpcResponse.fromText(req_id, status, headers, body, ipc);
            } else if (isBinary(body)) {
              res = IpcResponse.fromBinary(req_id, status, headers, body, ipc);
            } else if (body instanceof ReadableStream) {
              res = IpcResponse.fromStream(req_id, status, headers, body, ipc);
            }
          }
        }
      } catch (err) {
        if (err instanceof Response) {
          res = await IpcResponse.fromResponse(request.req_id, err, ipc);
        } else {
          let err_code = 500;
          let err_message = "";
          let err_detail = "";
          if (err instanceof Error) {
            err_message = err.message;
            err_detail = err.stack ?? err.name;
            if (err instanceof FetchError) {
              err_code = err.code;
            }
          } else {
            err_message = String(err);
          }
          if (request.headers.get("Accept") === "application/json") {
            res = IpcResponse.fromJson(
              request.req_id,
              err_code,
              new IpcHeaders().init("Content-Type", "text/html,charset=utf8"),
              { message: err_message, detail: err_detail },
              ipc
            );
          } else {
            res = IpcResponse.fromText(
              request.req_id,
              err_code,
              new IpcHeaders().init("Content-Type", "text/html,charset=utf8"),
              err instanceof Error ? `<h1>${err.message}</h1><hr/><pre>${err.stack}</pre>` : String(err),
              ipc
            );
          }
        }
      }
    }
    if (res) {
      ipc.postMessage(res);
      return res;
    }
  }, "onRequest");
  return extendsTo(onRequest);
}, "createFetchHandler");
var FetchEvent = (_f = class {
  constructor(ipcRequest, ipc) {
    __privateAdd(this, _request, void 0);
    this.ipcRequest = ipcRequest;
    this.ipc = ipc;
  }
  get url() {
    return this.ipcRequest.parsed_url;
  }
  get pathname() {
    return this.url.pathname;
  }
  get search() {
    return this.url.search;
  }
  get searchParams() {
    return this.url.searchParams;
  }
  get request() {
    return __privateGet(this, _request) ?? __privateSet(this, _request, this.ipcRequest.toRequest());
  }
  //#region Body 相关的属性与方法
  /** A simple getter used to expose a `ReadableStream` of the body contents. */
  get body() {
    return this.request.body;
  }
  /** Stores a `Boolean` that declares whether the body has been used in a
   * response yet.
   */
  get bodyUsed() {
    return this.request.bodyUsed;
  }
  /** Takes a `Response` stream and reads it to completion. It returns a promise
   * that resolves with an `ArrayBuffer`.
   */
  arrayBuffer() {
    return this.request.arrayBuffer();
  }
  async typedArray() {
    return new Uint8Array(await this.request.arrayBuffer());
  }
  /** Takes a `Response` stream and reads it to completion. It returns a promise
   * that resolves with a `Blob`.
   */
  blob() {
    return this.request.blob();
  }
  /** Takes a `Response` stream and reads it to completion. It returns a promise
   * that resolves with a `FormData` object.
   */
  formData() {
    return this.request.formData();
  }
  /** Takes a `Response` stream and reads it to completion. It returns a promise
   * that resolves with the result of parsing the body text as JSON.
   */
  // deno-lint-ignore no-explicit-any
  json() {
    return this.request.json();
  }
  /** Takes a `Response` stream and reads it to completion. It returns a promise
   * that resolves with a `USVString` (text).
   */
  text() {
    return this.request.text();
  }
  //#endregion
  /** Returns a Headers object consisting of the headers associated with request. Note that headers added in the network layer by the user agent will not be accounted for in this object, e.g., the "Host" header. */
  get headers() {
    return this.ipcRequest.headers;
  }
  /** Returns request's HTTP method, which is "GET" by default. */
  get method() {
    return this.ipcRequest.method;
  }
  /** Returns the URL of request as a string. */
  get href() {
    return this.url.href;
  }
  get req_id() {
    return this.ipcRequest.req_id;
  }
}, _request = new WeakMap(), _f);
__name(FetchEvent, "FetchEvent");
var FetchError = class extends Error {
  constructor(message, options) {
    super(message, options);
    this.code = (options == null ? void 0 : options.status) ?? 500;
  }
};
__name(FetchError, "FetchError");
var decoder;
try {
  decoder = new TextDecoder();
} catch (error) {
}
var src;
var srcEnd;
var position = 0;
var LEGACY_RECORD_INLINE_ID = 105;
var RECORD_DEFINITIONS_ID = 57342;
var RECORD_INLINE_ID = 57343;
var BUNDLED_STRINGS_ID = 57337;
var PACKED_REFERENCE_TAG_ID = 6;
var STOP_CODE = {};
var currentDecoder = {};
var currentStructures;
var srcString;
var srcStringStart = 0;
var srcStringEnd = 0;
var bundledStrings;
var referenceMap;
var currentExtensions = [];
var currentExtensionRanges = [];
var packedValues;
var dataView;
var restoreMapsAsObject;
var defaultOptions = {
  useRecords: false,
  mapsAsObjects: true
};
var sequentialMode = false;
var inlineObjectReadThreshold = 2;
try {
  new Function("");
} catch (error) {
  inlineObjectReadThreshold = Infinity;
}
var Decoder = class {
  constructor(options) {
    if (options) {
      if ((options.keyMap || options._keyMap) && !options.useRecords) {
        options.useRecords = false;
        options.mapsAsObjects = true;
      }
      if (options.useRecords === false && options.mapsAsObjects === void 0)
        options.mapsAsObjects = true;
      if (options.getStructures)
        options.getShared = options.getStructures;
      if (options.getShared && !options.structures)
        (options.structures = []).uninitialized = true;
      if (options.keyMap) {
        this.mapKey = /* @__PURE__ */ new Map();
        for (let [k6, v7] of Object.entries(options.keyMap))
          this.mapKey.set(v7, k6);
      }
    }
    Object.assign(this, options);
  }
  /*
  decodeKey(key) {
  	return this.keyMap
  		? Object.keys(this.keyMap)[Object.values(this.keyMap).indexOf(key)] || key
  		: key
  }
  */
  decodeKey(key) {
    return this.keyMap ? this.mapKey.get(key) || key : key;
  }
  encodeKey(key) {
    return this.keyMap && this.keyMap.hasOwnProperty(key) ? this.keyMap[key] : key;
  }
  encodeKeys(rec) {
    if (!this._keyMap)
      return rec;
    let map = /* @__PURE__ */ new Map();
    for (let [k6, v7] of Object.entries(rec))
      map.set(this._keyMap.hasOwnProperty(k6) ? this._keyMap[k6] : k6, v7);
    return map;
  }
  decodeKeys(map) {
    if (!this._keyMap || map.constructor.name != "Map")
      return map;
    if (!this._mapKey) {
      this._mapKey = /* @__PURE__ */ new Map();
      for (let [k6, v7] of Object.entries(this._keyMap))
        this._mapKey.set(v7, k6);
    }
    let res = {};
    map.forEach((v7, k6) => res[safeKey(this._mapKey.has(k6) ? this._mapKey.get(k6) : k6)] = v7);
    return res;
  }
  mapDecode(source, end) {
    let res = this.decode(source);
    if (this._keyMap) {
      switch (res.constructor.name) {
        case "Array":
          return res.map((r2) => this.decodeKeys(r2));
      }
    }
    return res;
  }
  decode(source, end) {
    if (src) {
      return saveState(() => {
        clearSource();
        return this ? this.decode(source, end) : Decoder.prototype.decode.call(defaultOptions, source, end);
      });
    }
    srcEnd = end > -1 ? end : source.length;
    position = 0;
    srcStringEnd = 0;
    srcString = null;
    bundledStrings = null;
    src = source;
    try {
      dataView = source.dataView || (source.dataView = new DataView(source.buffer, source.byteOffset, source.byteLength));
    } catch (error) {
      src = null;
      if (source instanceof Uint8Array)
        throw error;
      throw new Error("Source must be a Uint8Array or Buffer but was a " + (source && typeof source == "object" ? source.constructor.name : typeof source));
    }
    if (this instanceof Decoder) {
      currentDecoder = this;
      packedValues = this.sharedValues && (this.pack ? new Array(this.maxPrivatePackedValues || 16).concat(this.sharedValues) : this.sharedValues);
      if (this.structures) {
        currentStructures = this.structures;
        return checkedRead();
      } else if (!currentStructures || currentStructures.length > 0) {
        currentStructures = [];
      }
    } else {
      currentDecoder = defaultOptions;
      if (!currentStructures || currentStructures.length > 0)
        currentStructures = [];
      packedValues = null;
    }
    return checkedRead();
  }
  decodeMultiple(source, forEach) {
    let values, lastPosition = 0;
    try {
      let size = source.length;
      sequentialMode = true;
      let value = this ? this.decode(source, size) : defaultDecoder.decode(source, size);
      if (forEach) {
        if (forEach(value) === false) {
          return;
        }
        while (position < size) {
          lastPosition = position;
          if (forEach(checkedRead()) === false) {
            return;
          }
        }
      } else {
        values = [value];
        while (position < size) {
          lastPosition = position;
          values.push(checkedRead());
        }
        return values;
      }
    } catch (error) {
      error.lastPosition = lastPosition;
      error.values = values;
      throw error;
    } finally {
      sequentialMode = false;
      clearSource();
    }
  }
};
__name(Decoder, "Decoder");
function checkedRead() {
  try {
    let result = read();
    if (bundledStrings) {
      if (position >= bundledStrings.postBundlePosition) {
        let error = new Error("Unexpected bundle position");
        error.incomplete = true;
        throw error;
      }
      position = bundledStrings.postBundlePosition;
      bundledStrings = null;
    }
    if (position == srcEnd) {
      currentStructures = null;
      src = null;
      if (referenceMap)
        referenceMap = null;
    } else if (position > srcEnd) {
      let error = new Error("Unexpected end of CBOR data");
      error.incomplete = true;
      throw error;
    } else if (!sequentialMode) {
      throw new Error("Data read, but end of buffer not reached");
    }
    return result;
  } catch (error) {
    clearSource();
    if (error instanceof RangeError || error.message.startsWith("Unexpected end of buffer")) {
      error.incomplete = true;
    }
    throw error;
  }
}
__name(checkedRead, "checkedRead");
function read() {
  let token = src[position++];
  let majorType = token >> 5;
  token = token & 31;
  if (token > 23) {
    switch (token) {
      case 24:
        token = src[position++];
        break;
      case 25:
        if (majorType == 7) {
          return getFloat16();
        }
        token = dataView.getUint16(position);
        position += 2;
        break;
      case 26:
        if (majorType == 7) {
          let value = dataView.getFloat32(position);
          if (currentDecoder.useFloat32 > 2) {
            let multiplier = mult10[(src[position] & 127) << 1 | src[position + 1] >> 7];
            position += 4;
            return (multiplier * value + (value > 0 ? 0.5 : -0.5) >> 0) / multiplier;
          }
          position += 4;
          return value;
        }
        token = dataView.getUint32(position);
        position += 4;
        break;
      case 27:
        if (majorType == 7) {
          let value = dataView.getFloat64(position);
          position += 8;
          return value;
        }
        if (majorType > 1) {
          if (dataView.getUint32(position) > 0)
            throw new Error("JavaScript does not support arrays, maps, or strings with length over 4294967295");
          token = dataView.getUint32(position + 4);
        } else if (currentDecoder.int64AsNumber) {
          token = dataView.getUint32(position) * 4294967296;
          token += dataView.getUint32(position + 4);
        } else
          token = dataView.getBigUint64(position);
        position += 8;
        break;
      case 31:
        switch (majorType) {
          case 2:
          case 3:
            throw new Error("Indefinite length not supported for byte or text strings");
          case 4:
            let array = [];
            let value, i = 0;
            while ((value = read()) != STOP_CODE) {
              array[i++] = value;
            }
            return majorType == 4 ? array : majorType == 3 ? array.join("") : Buffer.concat(array);
          case 5:
            let key;
            if (currentDecoder.mapsAsObjects) {
              let object = {};
              if (currentDecoder.keyMap)
                while ((key = read()) != STOP_CODE)
                  object[safeKey(currentDecoder.decodeKey(key))] = read();
              else
                while ((key = read()) != STOP_CODE)
                  object[safeKey(key)] = read();
              return object;
            } else {
              if (restoreMapsAsObject) {
                currentDecoder.mapsAsObjects = true;
                restoreMapsAsObject = false;
              }
              let map = /* @__PURE__ */ new Map();
              if (currentDecoder.keyMap)
                while ((key = read()) != STOP_CODE)
                  map.set(currentDecoder.decodeKey(key), read());
              else
                while ((key = read()) != STOP_CODE)
                  map.set(key, read());
              return map;
            }
          case 7:
            return STOP_CODE;
          default:
            throw new Error("Invalid major type for indefinite length " + majorType);
        }
      default:
        throw new Error("Unknown token " + token);
    }
  }
  switch (majorType) {
    case 0:
      return token;
    case 1:
      return ~token;
    case 2:
      return readBin(token);
    case 3:
      if (srcStringEnd >= position) {
        return srcString.slice(position - srcStringStart, (position += token) - srcStringStart);
      }
      if (srcStringEnd == 0 && srcEnd < 140 && token < 32) {
        let string = token < 16 ? shortStringInJS(token) : longStringInJS(token);
        if (string != null)
          return string;
      }
      return readFixedString(token);
    case 4:
      let array = new Array(token);
      for (let i = 0; i < token; i++)
        array[i] = read();
      return array;
    case 5:
      if (currentDecoder.mapsAsObjects) {
        let object = {};
        if (currentDecoder.keyMap)
          for (let i = 0; i < token; i++)
            object[safeKey(currentDecoder.decodeKey(read()))] = read();
        else
          for (let i = 0; i < token; i++)
            object[safeKey(read())] = read();
        return object;
      } else {
        if (restoreMapsAsObject) {
          currentDecoder.mapsAsObjects = true;
          restoreMapsAsObject = false;
        }
        let map = /* @__PURE__ */ new Map();
        if (currentDecoder.keyMap)
          for (let i = 0; i < token; i++)
            map.set(currentDecoder.decodeKey(read()), read());
        else
          for (let i = 0; i < token; i++)
            map.set(read(), read());
        return map;
      }
    case 6:
      if (token >= BUNDLED_STRINGS_ID) {
        let structure = currentStructures[token & 8191];
        if (structure) {
          if (!structure.read)
            structure.read = createStructureReader(structure);
          return structure.read();
        }
        if (token < 65536) {
          if (token == RECORD_INLINE_ID) {
            let length = readJustLength();
            let id = read();
            let structure2 = read();
            recordDefinition(id, structure2);
            let object = {};
            if (currentDecoder.keyMap)
              for (let i = 2; i < length; i++) {
                let key = currentDecoder.decodeKey(structure2[i - 2]);
                object[safeKey(key)] = read();
              }
            else
              for (let i = 2; i < length; i++) {
                let key = structure2[i - 2];
                object[safeKey(key)] = read();
              }
            return object;
          } else if (token == RECORD_DEFINITIONS_ID) {
            let length = readJustLength();
            let id = read();
            for (let i = 2; i < length; i++) {
              recordDefinition(id++, read());
            }
            return read();
          } else if (token == BUNDLED_STRINGS_ID) {
            return readBundleExt();
          }
          if (currentDecoder.getShared) {
            loadShared();
            structure = currentStructures[token & 8191];
            if (structure) {
              if (!structure.read)
                structure.read = createStructureReader(structure);
              return structure.read();
            }
          }
        }
      }
      let extension = currentExtensions[token];
      if (extension) {
        if (extension.handlesRead)
          return extension(read);
        else
          return extension(read());
      } else {
        let input = read();
        for (let i = 0; i < currentExtensionRanges.length; i++) {
          let value = currentExtensionRanges[i](token, input);
          if (value !== void 0)
            return value;
        }
        return new Tag(input, token);
      }
    case 7:
      switch (token) {
        case 20:
          return false;
        case 21:
          return true;
        case 22:
          return null;
        case 23:
          return;
        case 31:
        default:
          let packedValue = (packedValues || getPackedValues())[token];
          if (packedValue !== void 0)
            return packedValue;
          throw new Error("Unknown token " + token);
      }
    default:
      if (isNaN(token)) {
        let error = new Error("Unexpected end of CBOR data");
        error.incomplete = true;
        throw error;
      }
      throw new Error("Unknown CBOR token " + token);
  }
}
__name(read, "read");
var validName = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;
function createStructureReader(structure) {
  function readObject() {
    let length = src[position++];
    length = length & 31;
    if (length > 23) {
      switch (length) {
        case 24:
          length = src[position++];
          break;
        case 25:
          length = dataView.getUint16(position);
          position += 2;
          break;
        case 26:
          length = dataView.getUint32(position);
          position += 4;
          break;
        default:
          throw new Error("Expected array header, but got " + src[position - 1]);
      }
    }
    let compiledReader = this.compiledReader;
    while (compiledReader) {
      if (compiledReader.propertyCount === length)
        return compiledReader(read);
      compiledReader = compiledReader.next;
    }
    if (this.slowReads++ >= inlineObjectReadThreshold) {
      let array = this.length == length ? this : this.slice(0, length);
      compiledReader = currentDecoder.keyMap ? new Function("r", "return {" + array.map((k6) => currentDecoder.decodeKey(k6)).map((k6) => validName.test(k6) ? safeKey(k6) + ":r()" : "[" + JSON.stringify(k6) + "]:r()").join(",") + "}") : new Function("r", "return {" + array.map((key) => validName.test(key) ? safeKey(key) + ":r()" : "[" + JSON.stringify(key) + "]:r()").join(",") + "}");
      if (this.compiledReader)
        compiledReader.next = this.compiledReader;
      compiledReader.propertyCount = length;
      this.compiledReader = compiledReader;
      return compiledReader(read);
    }
    let object = {};
    if (currentDecoder.keyMap)
      for (let i = 0; i < length; i++)
        object[safeKey(currentDecoder.decodeKey(this[i]))] = read();
    else
      for (let i = 0; i < length; i++) {
        object[safeKey(this[i])] = read();
      }
    return object;
  }
  __name(readObject, "readObject");
  structure.slowReads = 0;
  return readObject;
}
__name(createStructureReader, "createStructureReader");
function safeKey(key) {
  return key === "__proto__" ? "__proto_" : key;
}
__name(safeKey, "safeKey");
var readFixedString = readStringJS;
function readStringJS(length) {
  let result;
  if (length < 16) {
    if (result = shortStringInJS(length))
      return result;
  }
  if (length > 64 && decoder)
    return decoder.decode(src.subarray(position, position += length));
  const end = position + length;
  const units = [];
  result = "";
  while (position < end) {
    const byte1 = src[position++];
    if ((byte1 & 128) === 0) {
      units.push(byte1);
    } else if ((byte1 & 224) === 192) {
      const byte2 = src[position++] & 63;
      units.push((byte1 & 31) << 6 | byte2);
    } else if ((byte1 & 240) === 224) {
      const byte2 = src[position++] & 63;
      const byte3 = src[position++] & 63;
      units.push((byte1 & 31) << 12 | byte2 << 6 | byte3);
    } else if ((byte1 & 248) === 240) {
      const byte2 = src[position++] & 63;
      const byte3 = src[position++] & 63;
      const byte4 = src[position++] & 63;
      let unit = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
      if (unit > 65535) {
        unit -= 65536;
        units.push(unit >>> 10 & 1023 | 55296);
        unit = 56320 | unit & 1023;
      }
      units.push(unit);
    } else {
      units.push(byte1);
    }
    if (units.length >= 4096) {
      result += fromCharCode.apply(String, units);
      units.length = 0;
    }
  }
  if (units.length > 0) {
    result += fromCharCode.apply(String, units);
  }
  return result;
}
__name(readStringJS, "readStringJS");
var fromCharCode = String.fromCharCode;
function longStringInJS(length) {
  let start = position;
  let bytes = new Array(length);
  for (let i = 0; i < length; i++) {
    const byte = src[position++];
    if ((byte & 128) > 0) {
      position = start;
      return;
    }
    bytes[i] = byte;
  }
  return fromCharCode.apply(String, bytes);
}
__name(longStringInJS, "longStringInJS");
function shortStringInJS(length) {
  if (length < 4) {
    if (length < 2) {
      if (length === 0)
        return "";
      else {
        let a2 = src[position++];
        if ((a2 & 128) > 1) {
          position -= 1;
          return;
        }
        return fromCharCode(a2);
      }
    } else {
      let a2 = src[position++];
      let b5 = src[position++];
      if ((a2 & 128) > 0 || (b5 & 128) > 0) {
        position -= 2;
        return;
      }
      if (length < 3)
        return fromCharCode(a2, b5);
      let c7 = src[position++];
      if ((c7 & 128) > 0) {
        position -= 3;
        return;
      }
      return fromCharCode(a2, b5, c7);
    }
  } else {
    let a2 = src[position++];
    let b5 = src[position++];
    let c7 = src[position++];
    let d6 = src[position++];
    if ((a2 & 128) > 0 || (b5 & 128) > 0 || (c7 & 128) > 0 || (d6 & 128) > 0) {
      position -= 4;
      return;
    }
    if (length < 6) {
      if (length === 4)
        return fromCharCode(a2, b5, c7, d6);
      else {
        let e2 = src[position++];
        if ((e2 & 128) > 0) {
          position -= 5;
          return;
        }
        return fromCharCode(a2, b5, c7, d6, e2);
      }
    } else if (length < 8) {
      let e2 = src[position++];
      let f7 = src[position++];
      if ((e2 & 128) > 0 || (f7 & 128) > 0) {
        position -= 6;
        return;
      }
      if (length < 7)
        return fromCharCode(a2, b5, c7, d6, e2, f7);
      let g7 = src[position++];
      if ((g7 & 128) > 0) {
        position -= 7;
        return;
      }
      return fromCharCode(a2, b5, c7, d6, e2, f7, g7);
    } else {
      let e2 = src[position++];
      let f7 = src[position++];
      let g7 = src[position++];
      let h4 = src[position++];
      if ((e2 & 128) > 0 || (f7 & 128) > 0 || (g7 & 128) > 0 || (h4 & 128) > 0) {
        position -= 8;
        return;
      }
      if (length < 10) {
        if (length === 8)
          return fromCharCode(a2, b5, c7, d6, e2, f7, g7, h4);
        else {
          let i = src[position++];
          if ((i & 128) > 0) {
            position -= 9;
            return;
          }
          return fromCharCode(a2, b5, c7, d6, e2, f7, g7, h4, i);
        }
      } else if (length < 12) {
        let i = src[position++];
        let j7 = src[position++];
        if ((i & 128) > 0 || (j7 & 128) > 0) {
          position -= 10;
          return;
        }
        if (length < 11)
          return fromCharCode(a2, b5, c7, d6, e2, f7, g7, h4, i, j7);
        let k6 = src[position++];
        if ((k6 & 128) > 0) {
          position -= 11;
          return;
        }
        return fromCharCode(a2, b5, c7, d6, e2, f7, g7, h4, i, j7, k6);
      } else {
        let i = src[position++];
        let j7 = src[position++];
        let k6 = src[position++];
        let l4 = src[position++];
        if ((i & 128) > 0 || (j7 & 128) > 0 || (k6 & 128) > 0 || (l4 & 128) > 0) {
          position -= 12;
          return;
        }
        if (length < 14) {
          if (length === 12)
            return fromCharCode(a2, b5, c7, d6, e2, f7, g7, h4, i, j7, k6, l4);
          else {
            let m8 = src[position++];
            if ((m8 & 128) > 0) {
              position -= 13;
              return;
            }
            return fromCharCode(a2, b5, c7, d6, e2, f7, g7, h4, i, j7, k6, l4, m8);
          }
        } else {
          let m8 = src[position++];
          let n2 = src[position++];
          if ((m8 & 128) > 0 || (n2 & 128) > 0) {
            position -= 14;
            return;
          }
          if (length < 15)
            return fromCharCode(a2, b5, c7, d6, e2, f7, g7, h4, i, j7, k6, l4, m8, n2);
          let o2 = src[position++];
          if ((o2 & 128) > 0) {
            position -= 15;
            return;
          }
          return fromCharCode(a2, b5, c7, d6, e2, f7, g7, h4, i, j7, k6, l4, m8, n2, o2);
        }
      }
    }
  }
}
__name(shortStringInJS, "shortStringInJS");
function readBin(length) {
  return currentDecoder.copyBuffers ? (
    // specifically use the copying slice (not the node one)
    Uint8Array.prototype.slice.call(src, position, position += length)
  ) : src.subarray(position, position += length);
}
__name(readBin, "readBin");
var f32Array = new Float32Array(1);
var u8Array = new Uint8Array(f32Array.buffer, 0, 4);
function getFloat16() {
  let byte0 = src[position++];
  let byte1 = src[position++];
  let exponent = (byte0 & 127) >> 2;
  if (exponent === 31) {
    if (byte1 || byte0 & 3)
      return NaN;
    return byte0 & 128 ? -Infinity : Infinity;
  }
  if (exponent === 0) {
    let abs = ((byte0 & 3) << 8 | byte1) / (1 << 24);
    return byte0 & 128 ? -abs : abs;
  }
  u8Array[3] = byte0 & 128 | // sign bit
  (exponent >> 1) + 56;
  u8Array[2] = (byte0 & 7) << 5 | // last exponent bit and first two mantissa bits
  byte1 >> 3;
  u8Array[1] = byte1 << 5;
  u8Array[0] = 0;
  return f32Array[0];
}
__name(getFloat16, "getFloat16");
new Array(4096);
var Tag = class {
  constructor(value, tag) {
    this.value = value;
    this.tag = tag;
  }
};
__name(Tag, "Tag");
currentExtensions[0] = (dateString) => {
  return new Date(dateString);
};
currentExtensions[1] = (epochSec) => {
  return new Date(Math.round(epochSec * 1e3));
};
currentExtensions[2] = (buffer) => {
  let value = BigInt(0);
  for (let i = 0, l4 = buffer.byteLength; i < l4; i++) {
    value = BigInt(buffer[i]) + value << BigInt(8);
  }
  return value;
};
currentExtensions[3] = (buffer) => {
  return BigInt(-1) - currentExtensions[2](buffer);
};
currentExtensions[4] = (fraction) => {
  return +(fraction[1] + "e" + fraction[0]);
};
currentExtensions[5] = (fraction) => {
  return fraction[1] * Math.exp(fraction[0] * Math.log(2));
};
var recordDefinition = /* @__PURE__ */ __name((id, structure) => {
  id = id - 57344;
  let existingStructure = currentStructures[id];
  if (existingStructure && existingStructure.isShared) {
    (currentStructures.restoreStructures || (currentStructures.restoreStructures = []))[id] = existingStructure;
  }
  currentStructures[id] = structure;
  structure.read = createStructureReader(structure);
}, "recordDefinition");
currentExtensions[LEGACY_RECORD_INLINE_ID] = (data) => {
  let length = data.length;
  let structure = data[1];
  recordDefinition(data[0], structure);
  let object = {};
  for (let i = 2; i < length; i++) {
    let key = structure[i - 2];
    object[safeKey(key)] = data[i];
  }
  return object;
};
currentExtensions[14] = (value) => {
  if (bundledStrings)
    return bundledStrings[0].slice(bundledStrings.position0, bundledStrings.position0 += value);
  return new Tag(value, 14);
};
currentExtensions[15] = (value) => {
  if (bundledStrings)
    return bundledStrings[1].slice(bundledStrings.position1, bundledStrings.position1 += value);
  return new Tag(value, 15);
};
var glbl = { Error, RegExp };
currentExtensions[27] = (data) => {
  return (glbl[data[0]] || Error)(data[1], data[2]);
};
var packedTable = /* @__PURE__ */ __name((read2) => {
  if (src[position++] != 132)
    throw new Error("Packed values structure must be followed by a 4 element array");
  let newPackedValues = read2();
  packedValues = packedValues ? newPackedValues.concat(packedValues.slice(newPackedValues.length)) : newPackedValues;
  packedValues.prefixes = read2();
  packedValues.suffixes = read2();
  return read2();
}, "packedTable");
packedTable.handlesRead = true;
currentExtensions[51] = packedTable;
currentExtensions[PACKED_REFERENCE_TAG_ID] = (data) => {
  if (!packedValues) {
    if (currentDecoder.getShared)
      loadShared();
    else
      return new Tag(data, PACKED_REFERENCE_TAG_ID);
  }
  if (typeof data == "number")
    return packedValues[16 + (data >= 0 ? 2 * data : -2 * data - 1)];
  throw new Error("No support for non-integer packed references yet");
};
currentExtensions[28] = (read2) => {
  if (!referenceMap) {
    referenceMap = /* @__PURE__ */ new Map();
    referenceMap.id = 0;
  }
  let id = referenceMap.id++;
  let token = src[position];
  let target2;
  if (token >> 5 == 4)
    target2 = [];
  else
    target2 = {};
  let refEntry = { target: target2 };
  referenceMap.set(id, refEntry);
  let targetProperties = read2();
  if (refEntry.used)
    return Object.assign(target2, targetProperties);
  refEntry.target = targetProperties;
  return targetProperties;
};
currentExtensions[28].handlesRead = true;
currentExtensions[29] = (id) => {
  let refEntry = referenceMap.get(id);
  refEntry.used = true;
  return refEntry.target;
};
currentExtensions[258] = (array) => new Set(array);
(currentExtensions[259] = (read2) => {
  if (currentDecoder.mapsAsObjects) {
    currentDecoder.mapsAsObjects = false;
    restoreMapsAsObject = true;
  }
  return read2();
}).handlesRead = true;
function combine(a2, b5) {
  if (typeof a2 === "string")
    return a2 + b5;
  if (a2 instanceof Array)
    return a2.concat(b5);
  return Object.assign({}, a2, b5);
}
__name(combine, "combine");
function getPackedValues() {
  if (!packedValues) {
    if (currentDecoder.getShared)
      loadShared();
    else
      throw new Error("No packed values available");
  }
  return packedValues;
}
__name(getPackedValues, "getPackedValues");
var SHARED_DATA_TAG_ID = 1399353956;
currentExtensionRanges.push((tag, input) => {
  if (tag >= 225 && tag <= 255)
    return combine(getPackedValues().prefixes[tag - 224], input);
  if (tag >= 28704 && tag <= 32767)
    return combine(getPackedValues().prefixes[tag - 28672], input);
  if (tag >= 1879052288 && tag <= 2147483647)
    return combine(getPackedValues().prefixes[tag - 1879048192], input);
  if (tag >= 216 && tag <= 223)
    return combine(input, getPackedValues().suffixes[tag - 216]);
  if (tag >= 27647 && tag <= 28671)
    return combine(input, getPackedValues().suffixes[tag - 27639]);
  if (tag >= 1811940352 && tag <= 1879048191)
    return combine(input, getPackedValues().suffixes[tag - 1811939328]);
  if (tag == SHARED_DATA_TAG_ID) {
    return {
      packedValues,
      structures: currentStructures.slice(0),
      version: input
    };
  }
  if (tag == 55799)
    return input;
});
var isLittleEndianMachine = new Uint8Array(new Uint16Array([1]).buffer)[0] == 1;
var typedArrays = [
  Uint8Array,
  Uint8ClampedArray,
  Uint16Array,
  Uint32Array,
  typeof BigUint64Array == "undefined" ? { name: "BigUint64Array" } : BigUint64Array,
  Int8Array,
  Int16Array,
  Int32Array,
  typeof BigInt64Array == "undefined" ? { name: "BigInt64Array" } : BigInt64Array,
  Float32Array,
  Float64Array
];
var typedArrayTags = [64, 68, 69, 70, 71, 72, 77, 78, 79, 85, 86];
for (let i = 0; i < typedArrays.length; i++) {
  registerTypedArray(typedArrays[i], typedArrayTags[i]);
}
function registerTypedArray(TypedArray, tag) {
  let dvMethod = "get" + TypedArray.name.slice(0, -5);
  let bytesPerElement;
  if (typeof TypedArray === "function")
    bytesPerElement = TypedArray.BYTES_PER_ELEMENT;
  else
    TypedArray = null;
  for (let littleEndian = 0; littleEndian < 2; littleEndian++) {
    if (!littleEndian && bytesPerElement == 1)
      continue;
    let sizeShift = bytesPerElement == 2 ? 1 : bytesPerElement == 4 ? 2 : 3;
    currentExtensions[littleEndian ? tag : tag - 4] = bytesPerElement == 1 || littleEndian == isLittleEndianMachine ? (buffer) => {
      if (!TypedArray)
        throw new Error("Could not find typed array for code " + tag);
      return new TypedArray(Uint8Array.prototype.slice.call(buffer, 0).buffer);
    } : (buffer) => {
      if (!TypedArray)
        throw new Error("Could not find typed array for code " + tag);
      let dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      let elements = buffer.length >> sizeShift;
      let ta = new TypedArray(elements);
      let method = dv[dvMethod];
      for (let i = 0; i < elements; i++) {
        ta[i] = method.call(dv, i << sizeShift, littleEndian);
      }
      return ta;
    };
  }
}
__name(registerTypedArray, "registerTypedArray");
function readBundleExt() {
  let length = readJustLength();
  let bundlePosition = position + read();
  for (let i = 2; i < length; i++) {
    let bundleLength = readJustLength();
    position += bundleLength;
  }
  let dataPosition = position;
  position = bundlePosition;
  bundledStrings = [readStringJS(readJustLength()), readStringJS(readJustLength())];
  bundledStrings.position0 = 0;
  bundledStrings.position1 = 0;
  bundledStrings.postBundlePosition = position;
  position = dataPosition;
  return read();
}
__name(readBundleExt, "readBundleExt");
function readJustLength() {
  let token = src[position++] & 31;
  if (token > 23) {
    switch (token) {
      case 24:
        token = src[position++];
        break;
      case 25:
        token = dataView.getUint16(position);
        position += 2;
        break;
      case 26:
        token = dataView.getUint32(position);
        position += 4;
        break;
    }
  }
  return token;
}
__name(readJustLength, "readJustLength");
function loadShared() {
  if (currentDecoder.getShared) {
    let sharedData = saveState(() => {
      src = null;
      return currentDecoder.getShared();
    }) || {};
    let updatedStructures = sharedData.structures || [];
    currentDecoder.sharedVersion = sharedData.version;
    packedValues = currentDecoder.sharedValues = sharedData.packedValues;
    if (currentStructures === true)
      currentDecoder.structures = currentStructures = updatedStructures;
    else
      currentStructures.splice.apply(currentStructures, [0, updatedStructures.length].concat(updatedStructures));
  }
}
__name(loadShared, "loadShared");
function saveState(callback) {
  let savedSrcEnd = srcEnd;
  let savedPosition = position;
  let savedSrcStringStart = srcStringStart;
  let savedSrcStringEnd = srcStringEnd;
  let savedSrcString = srcString;
  let savedReferenceMap = referenceMap;
  let savedBundledStrings = bundledStrings;
  let savedSrc = new Uint8Array(src.slice(0, srcEnd));
  let savedStructures = currentStructures;
  let savedDecoder = currentDecoder;
  let savedSequentialMode = sequentialMode;
  let value = callback();
  srcEnd = savedSrcEnd;
  position = savedPosition;
  srcStringStart = savedSrcStringStart;
  srcStringEnd = savedSrcStringEnd;
  srcString = savedSrcString;
  referenceMap = savedReferenceMap;
  bundledStrings = savedBundledStrings;
  src = savedSrc;
  sequentialMode = savedSequentialMode;
  currentStructures = savedStructures;
  currentDecoder = savedDecoder;
  dataView = new DataView(src.buffer, src.byteOffset, src.byteLength);
  return value;
}
__name(saveState, "saveState");
function clearSource() {
  src = null;
  referenceMap = null;
  currentStructures = null;
}
__name(clearSource, "clearSource");
var mult10 = new Array(147);
for (let i = 0; i < 256; i++) {
  mult10[i] = +("1e" + Math.floor(45.15 - i * 0.30103));
}
var defaultDecoder = new Decoder({ useRecords: false });
var decode = defaultDecoder.decode;
defaultDecoder.decodeMultiple;
var textEncoder2;
try {
  textEncoder2 = new TextEncoder();
} catch (error) {
}
var extensions;
var extensionClasses;
var Buffer2 = typeof globalThis === "object" && globalThis.Buffer;
var hasNodeBuffer = typeof Buffer2 !== "undefined";
var ByteArrayAllocate = hasNodeBuffer ? Buffer2.allocUnsafeSlow : Uint8Array;
var ByteArray = hasNodeBuffer ? Buffer2 : Uint8Array;
var MAX_STRUCTURES = 256;
var MAX_BUFFER_SIZE = hasNodeBuffer ? 4294967296 : 2144337920;
var throwOnIterable;
var target;
var targetView;
var position2 = 0;
var safeEnd;
var bundledStrings2 = null;
var MAX_BUNDLE_SIZE = 61440;
var hasNonLatin = /[\u0080-\uFFFF]/;
var RECORD_SYMBOL = Symbol("record-id");
var Encoder = class extends Decoder {
  constructor(options) {
    super(options);
    this.offset = 0;
    let start;
    let sharedStructures;
    let hasSharedUpdate;
    let structures;
    let referenceMap2;
    options = options || {};
    let encodeUtf8 = ByteArray.prototype.utf8Write ? function(string, position3, maxBytes) {
      return target.utf8Write(string, position3, maxBytes);
    } : textEncoder2 && textEncoder2.encodeInto ? function(string, position3) {
      return textEncoder2.encodeInto(string, target.subarray(position3)).written;
    } : false;
    let encoder = this;
    let hasSharedStructures = options.structures || options.saveStructures;
    let maxSharedStructures = options.maxSharedStructures;
    if (maxSharedStructures == null)
      maxSharedStructures = hasSharedStructures ? 128 : 0;
    if (maxSharedStructures > 8190)
      throw new Error("Maximum maxSharedStructure is 8190");
    let isSequential = options.sequential;
    if (isSequential) {
      maxSharedStructures = 0;
    }
    if (!this.structures)
      this.structures = [];
    if (this.saveStructures)
      this.saveShared = this.saveStructures;
    let samplingPackedValues, packedObjectMap2, sharedValues = options.sharedValues;
    let sharedPackedObjectMap2;
    if (sharedValues) {
      sharedPackedObjectMap2 = /* @__PURE__ */ Object.create(null);
      for (let i = 0, l4 = sharedValues.length; i < l4; i++) {
        sharedPackedObjectMap2[sharedValues[i]] = i;
      }
    }
    let recordIdsToRemove = [];
    let transitionsCount = 0;
    let serializationsSinceTransitionRebuild = 0;
    this.mapEncode = function(value, encodeOptions) {
      if (this._keyMap && !this._mapped) {
        switch (value.constructor.name) {
          case "Array":
            value = value.map((r2) => this.encodeKeys(r2));
            break;
        }
      }
      return this.encode(value, encodeOptions);
    };
    this.encode = function(value, encodeOptions) {
      if (!target) {
        target = new ByteArrayAllocate(8192);
        targetView = new DataView(target.buffer, 0, 8192);
        position2 = 0;
      }
      safeEnd = target.length - 10;
      if (safeEnd - position2 < 2048) {
        target = new ByteArrayAllocate(target.length);
        targetView = new DataView(target.buffer, 0, target.length);
        safeEnd = target.length - 10;
        position2 = 0;
      } else if (encodeOptions === REUSE_BUFFER_MODE)
        position2 = position2 + 7 & 2147483640;
      start = position2;
      if (encoder.useSelfDescribedHeader) {
        targetView.setUint32(position2, 3654940416);
        position2 += 3;
      }
      referenceMap2 = encoder.structuredClone ? /* @__PURE__ */ new Map() : null;
      if (encoder.bundleStrings && typeof value !== "string") {
        bundledStrings2 = [];
        bundledStrings2.size = Infinity;
      } else
        bundledStrings2 = null;
      sharedStructures = encoder.structures;
      if (sharedStructures) {
        if (sharedStructures.uninitialized) {
          let sharedData = encoder.getShared() || {};
          encoder.structures = sharedStructures = sharedData.structures || [];
          encoder.sharedVersion = sharedData.version;
          let sharedValues2 = encoder.sharedValues = sharedData.packedValues;
          if (sharedValues2) {
            sharedPackedObjectMap2 = {};
            for (let i = 0, l4 = sharedValues2.length; i < l4; i++)
              sharedPackedObjectMap2[sharedValues2[i]] = i;
          }
        }
        let sharedStructuresLength = sharedStructures.length;
        if (sharedStructuresLength > maxSharedStructures && !isSequential)
          sharedStructuresLength = maxSharedStructures;
        if (!sharedStructures.transitions) {
          sharedStructures.transitions = /* @__PURE__ */ Object.create(null);
          for (let i = 0; i < sharedStructuresLength; i++) {
            let keys = sharedStructures[i];
            if (!keys)
              continue;
            let nextTransition, transition = sharedStructures.transitions;
            for (let j7 = 0, l4 = keys.length; j7 < l4; j7++) {
              if (transition[RECORD_SYMBOL] === void 0)
                transition[RECORD_SYMBOL] = i;
              let key = keys[j7];
              nextTransition = transition[key];
              if (!nextTransition) {
                nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
              }
              transition = nextTransition;
            }
            transition[RECORD_SYMBOL] = i | 1048576;
          }
        }
        if (!isSequential)
          sharedStructures.nextId = sharedStructuresLength;
      }
      if (hasSharedUpdate)
        hasSharedUpdate = false;
      structures = sharedStructures || [];
      packedObjectMap2 = sharedPackedObjectMap2;
      if (options.pack) {
        let packedValues2 = /* @__PURE__ */ new Map();
        packedValues2.values = [];
        packedValues2.encoder = encoder;
        packedValues2.maxValues = options.maxPrivatePackedValues || (sharedPackedObjectMap2 ? 16 : Infinity);
        packedValues2.objectMap = sharedPackedObjectMap2 || false;
        packedValues2.samplingPackedValues = samplingPackedValues;
        findRepetitiveStrings(value, packedValues2);
        if (packedValues2.values.length > 0) {
          target[position2++] = 216;
          target[position2++] = 51;
          writeArrayHeader(4);
          let valuesArray = packedValues2.values;
          encode2(valuesArray);
          writeArrayHeader(0);
          writeArrayHeader(0);
          packedObjectMap2 = Object.create(sharedPackedObjectMap2 || null);
          for (let i = 0, l4 = valuesArray.length; i < l4; i++) {
            packedObjectMap2[valuesArray[i]] = i;
          }
        }
      }
      throwOnIterable = encodeOptions & THROW_ON_ITERABLE;
      try {
        if (throwOnIterable)
          return;
        encode2(value);
        if (bundledStrings2) {
          writeBundles(start, encode2);
        }
        encoder.offset = position2;
        if (referenceMap2 && referenceMap2.idsToInsert) {
          position2 += referenceMap2.idsToInsert.length * 2;
          if (position2 > safeEnd)
            makeRoom(position2);
          encoder.offset = position2;
          let serialized = insertIds(target.subarray(start, position2), referenceMap2.idsToInsert);
          referenceMap2 = null;
          return serialized;
        }
        if (encodeOptions & REUSE_BUFFER_MODE) {
          target.start = start;
          target.end = position2;
          return target;
        }
        return target.subarray(start, position2);
      } finally {
        if (sharedStructures) {
          if (serializationsSinceTransitionRebuild < 10)
            serializationsSinceTransitionRebuild++;
          if (sharedStructures.length > maxSharedStructures)
            sharedStructures.length = maxSharedStructures;
          if (transitionsCount > 1e4) {
            sharedStructures.transitions = null;
            serializationsSinceTransitionRebuild = 0;
            transitionsCount = 0;
            if (recordIdsToRemove.length > 0)
              recordIdsToRemove = [];
          } else if (recordIdsToRemove.length > 0 && !isSequential) {
            for (let i = 0, l4 = recordIdsToRemove.length; i < l4; i++) {
              recordIdsToRemove[i][RECORD_SYMBOL] = void 0;
            }
            recordIdsToRemove = [];
          }
        }
        if (hasSharedUpdate && encoder.saveShared) {
          if (encoder.structures.length > maxSharedStructures) {
            encoder.structures = encoder.structures.slice(0, maxSharedStructures);
          }
          let returnBuffer = target.subarray(start, position2);
          if (encoder.updateSharedData() === false)
            return encoder.encode(value);
          return returnBuffer;
        }
        if (encodeOptions & RESET_BUFFER_MODE)
          position2 = start;
      }
    };
    this.findCommonStringsToPack = () => {
      samplingPackedValues = /* @__PURE__ */ new Map();
      if (!sharedPackedObjectMap2)
        sharedPackedObjectMap2 = /* @__PURE__ */ Object.create(null);
      return (options2) => {
        let threshold = options2 && options2.threshold || 4;
        let position3 = this.pack ? options2.maxPrivatePackedValues || 16 : 0;
        if (!sharedValues)
          sharedValues = this.sharedValues = [];
        for (let [key, status] of samplingPackedValues) {
          if (status.count > threshold) {
            sharedPackedObjectMap2[key] = position3++;
            sharedValues.push(key);
            hasSharedUpdate = true;
          }
        }
        while (this.saveShared && this.updateSharedData() === false) {
        }
        samplingPackedValues = null;
      };
    };
    const encode2 = /* @__PURE__ */ __name((value) => {
      if (position2 > safeEnd)
        target = makeRoom(position2);
      var type = typeof value;
      var length;
      if (type === "string") {
        if (packedObjectMap2) {
          let packedPosition = packedObjectMap2[value];
          if (packedPosition >= 0) {
            if (packedPosition < 16)
              target[position2++] = packedPosition + 224;
            else {
              target[position2++] = 198;
              if (packedPosition & 1)
                encode2(15 - packedPosition >> 1);
              else
                encode2(packedPosition - 16 >> 1);
            }
            return;
          } else if (samplingPackedValues && !options.pack) {
            let status = samplingPackedValues.get(value);
            if (status)
              status.count++;
            else
              samplingPackedValues.set(value, {
                count: 1
              });
          }
        }
        let strLength = value.length;
        if (bundledStrings2 && strLength >= 4 && strLength < 1024) {
          if ((bundledStrings2.size += strLength) > MAX_BUNDLE_SIZE) {
            let extStart;
            let maxBytes2 = (bundledStrings2[0] ? bundledStrings2[0].length * 3 + bundledStrings2[1].length : 0) + 10;
            if (position2 + maxBytes2 > safeEnd)
              target = makeRoom(position2 + maxBytes2);
            target[position2++] = 217;
            target[position2++] = 223;
            target[position2++] = 249;
            target[position2++] = bundledStrings2.position ? 132 : 130;
            target[position2++] = 26;
            extStart = position2 - start;
            position2 += 4;
            if (bundledStrings2.position) {
              writeBundles(start, encode2);
            }
            bundledStrings2 = ["", ""];
            bundledStrings2.size = 0;
            bundledStrings2.position = extStart;
          }
          let twoByte = hasNonLatin.test(value);
          bundledStrings2[twoByte ? 0 : 1] += value;
          target[position2++] = twoByte ? 206 : 207;
          encode2(strLength);
          return;
        }
        let headerSize;
        if (strLength < 32) {
          headerSize = 1;
        } else if (strLength < 256) {
          headerSize = 2;
        } else if (strLength < 65536) {
          headerSize = 3;
        } else {
          headerSize = 5;
        }
        let maxBytes = strLength * 3;
        if (position2 + maxBytes > safeEnd)
          target = makeRoom(position2 + maxBytes);
        if (strLength < 64 || !encodeUtf8) {
          let i, c1, c22, strPosition = position2 + headerSize;
          for (i = 0; i < strLength; i++) {
            c1 = value.charCodeAt(i);
            if (c1 < 128) {
              target[strPosition++] = c1;
            } else if (c1 < 2048) {
              target[strPosition++] = c1 >> 6 | 192;
              target[strPosition++] = c1 & 63 | 128;
            } else if ((c1 & 64512) === 55296 && ((c22 = value.charCodeAt(i + 1)) & 64512) === 56320) {
              c1 = 65536 + ((c1 & 1023) << 10) + (c22 & 1023);
              i++;
              target[strPosition++] = c1 >> 18 | 240;
              target[strPosition++] = c1 >> 12 & 63 | 128;
              target[strPosition++] = c1 >> 6 & 63 | 128;
              target[strPosition++] = c1 & 63 | 128;
            } else {
              target[strPosition++] = c1 >> 12 | 224;
              target[strPosition++] = c1 >> 6 & 63 | 128;
              target[strPosition++] = c1 & 63 | 128;
            }
          }
          length = strPosition - position2 - headerSize;
        } else {
          length = encodeUtf8(value, position2 + headerSize, maxBytes);
        }
        if (length < 24) {
          target[position2++] = 96 | length;
        } else if (length < 256) {
          if (headerSize < 2) {
            target.copyWithin(position2 + 2, position2 + 1, position2 + 1 + length);
          }
          target[position2++] = 120;
          target[position2++] = length;
        } else if (length < 65536) {
          if (headerSize < 3) {
            target.copyWithin(position2 + 3, position2 + 2, position2 + 2 + length);
          }
          target[position2++] = 121;
          target[position2++] = length >> 8;
          target[position2++] = length & 255;
        } else {
          if (headerSize < 5) {
            target.copyWithin(position2 + 5, position2 + 3, position2 + 3 + length);
          }
          target[position2++] = 122;
          targetView.setUint32(position2, length);
          position2 += 4;
        }
        position2 += length;
      } else if (type === "number") {
        if (!this.alwaysUseFloat && value >>> 0 === value) {
          if (value < 24) {
            target[position2++] = value;
          } else if (value < 256) {
            target[position2++] = 24;
            target[position2++] = value;
          } else if (value < 65536) {
            target[position2++] = 25;
            target[position2++] = value >> 8;
            target[position2++] = value & 255;
          } else {
            target[position2++] = 26;
            targetView.setUint32(position2, value);
            position2 += 4;
          }
        } else if (!this.alwaysUseFloat && value >> 0 === value) {
          if (value >= -24) {
            target[position2++] = 31 - value;
          } else if (value >= -256) {
            target[position2++] = 56;
            target[position2++] = ~value;
          } else if (value >= -65536) {
            target[position2++] = 57;
            targetView.setUint16(position2, ~value);
            position2 += 2;
          } else {
            target[position2++] = 58;
            targetView.setUint32(position2, ~value);
            position2 += 4;
          }
        } else {
          let useFloat32;
          if ((useFloat32 = this.useFloat32) > 0 && value < 4294967296 && value >= -2147483648) {
            target[position2++] = 250;
            targetView.setFloat32(position2, value);
            let xShifted;
            if (useFloat32 < 4 || // this checks for rounding of numbers that were encoded in 32-bit float to nearest significant decimal digit that could be preserved
            (xShifted = value * mult10[(target[position2] & 127) << 1 | target[position2 + 1] >> 7]) >> 0 === xShifted) {
              position2 += 4;
              return;
            } else
              position2--;
          }
          target[position2++] = 251;
          targetView.setFloat64(position2, value);
          position2 += 8;
        }
      } else if (type === "object") {
        if (!value)
          target[position2++] = 246;
        else {
          if (referenceMap2) {
            let referee = referenceMap2.get(value);
            if (referee) {
              target[position2++] = 216;
              target[position2++] = 29;
              target[position2++] = 25;
              if (!referee.references) {
                let idsToInsert = referenceMap2.idsToInsert || (referenceMap2.idsToInsert = []);
                referee.references = [];
                idsToInsert.push(referee);
              }
              referee.references.push(position2 - start);
              position2 += 2;
              return;
            } else
              referenceMap2.set(value, { offset: position2 - start });
          }
          let constructor = value.constructor;
          if (constructor === Object) {
            writeObject(value, true);
          } else if (constructor === Array) {
            length = value.length;
            if (length < 24) {
              target[position2++] = 128 | length;
            } else {
              writeArrayHeader(length);
            }
            for (let i = 0; i < length; i++) {
              encode2(value[i]);
            }
          } else if (constructor === Map) {
            if (this.mapsAsObjects ? this.useTag259ForMaps !== false : this.useTag259ForMaps) {
              target[position2++] = 217;
              target[position2++] = 1;
              target[position2++] = 3;
            }
            length = value.size;
            if (length < 24) {
              target[position2++] = 160 | length;
            } else if (length < 256) {
              target[position2++] = 184;
              target[position2++] = length;
            } else if (length < 65536) {
              target[position2++] = 185;
              target[position2++] = length >> 8;
              target[position2++] = length & 255;
            } else {
              target[position2++] = 186;
              targetView.setUint32(position2, length);
              position2 += 4;
            }
            if (encoder.keyMap) {
              for (let [key, entryValue] of value) {
                encode2(encoder.encodeKey(key));
                encode2(entryValue);
              }
            } else {
              for (let [key, entryValue] of value) {
                encode2(key);
                encode2(entryValue);
              }
            }
          } else {
            for (let i = 0, l4 = extensions.length; i < l4; i++) {
              let extensionClass = extensionClasses[i];
              if (value instanceof extensionClass) {
                let extension = extensions[i];
                let tag = extension.tag;
                if (tag == void 0)
                  tag = extension.getTag && extension.getTag.call(this, value);
                if (tag < 24) {
                  target[position2++] = 192 | tag;
                } else if (tag < 256) {
                  target[position2++] = 216;
                  target[position2++] = tag;
                } else if (tag < 65536) {
                  target[position2++] = 217;
                  target[position2++] = tag >> 8;
                  target[position2++] = tag & 255;
                } else if (tag > -1) {
                  target[position2++] = 218;
                  targetView.setUint32(position2, tag);
                  position2 += 4;
                }
                extension.encode.call(this, value, encode2, makeRoom);
                return;
              }
            }
            if (value[Symbol.iterator]) {
              if (throwOnIterable) {
                let error = new Error("Iterable should be serialized as iterator");
                error.iteratorNotHandled = true;
                throw error;
              }
              target[position2++] = 159;
              for (let entry of value) {
                encode2(entry);
              }
              target[position2++] = 255;
              return;
            }
            if (value[Symbol.asyncIterator] || isBlob(value)) {
              let error = new Error("Iterable/blob should be serialized as iterator");
              error.iteratorNotHandled = true;
              throw error;
            }
            if (this.useToJSON && value.toJSON) {
              const json = value.toJSON();
              if (json !== value)
                return encode2(json);
            }
            writeObject(value, !value.hasOwnProperty);
          }
        }
      } else if (type === "boolean") {
        target[position2++] = value ? 245 : 244;
      } else if (type === "bigint") {
        if (value < BigInt(1) << BigInt(64) && value >= 0) {
          target[position2++] = 27;
          targetView.setBigUint64(position2, value);
        } else if (value > -(BigInt(1) << BigInt(64)) && value < 0) {
          target[position2++] = 59;
          targetView.setBigUint64(position2, -value - BigInt(1));
        } else {
          if (this.largeBigIntToFloat) {
            target[position2++] = 251;
            targetView.setFloat64(position2, Number(value));
          } else {
            throw new RangeError(value + " was too large to fit in CBOR 64-bit integer format, set largeBigIntToFloat to convert to float-64");
          }
        }
        position2 += 8;
      } else if (type === "undefined") {
        target[position2++] = 247;
      } else {
        throw new Error("Unknown type: " + type);
      }
    }, "encode");
    const writeObject = this.useRecords === false ? this.variableMapSize ? (object) => {
      let keys = Object.keys(object);
      let vals = Object.values(object);
      let length = keys.length;
      if (length < 24) {
        target[position2++] = 160 | length;
      } else if (length < 256) {
        target[position2++] = 184;
        target[position2++] = length;
      } else if (length < 65536) {
        target[position2++] = 185;
        target[position2++] = length >> 8;
        target[position2++] = length & 255;
      } else {
        target[position2++] = 186;
        targetView.setUint32(position2, length);
        position2 += 4;
      }
      if (encoder.keyMap) {
        for (let i = 0; i < length; i++) {
          encode2(encoder.encodeKey(keys[i]));
          encode2(vals[i]);
        }
      } else {
        for (let i = 0; i < length; i++) {
          encode2(keys[i]);
          encode2(vals[i]);
        }
      }
    } : (object, safePrototype) => {
      target[position2++] = 185;
      let objectOffset = position2 - start;
      position2 += 2;
      let size = 0;
      if (encoder.keyMap) {
        for (let key in object)
          if (safePrototype || object.hasOwnProperty(key)) {
            encode2(encoder.encodeKey(key));
            encode2(object[key]);
            size++;
          }
      } else {
        for (let key in object)
          if (safePrototype || object.hasOwnProperty(key)) {
            encode2(key);
            encode2(object[key]);
            size++;
          }
      }
      target[objectOffset++ + start] = size >> 8;
      target[objectOffset + start] = size & 255;
    } : (object, safePrototype) => {
      let nextTransition, transition = structures.transitions || (structures.transitions = /* @__PURE__ */ Object.create(null));
      let newTransitions = 0;
      let length = 0;
      let parentRecordId;
      let keys;
      if (this.keyMap) {
        keys = Object.keys(object).map((k6) => this.encodeKey(k6));
        length = keys.length;
        for (let i = 0; i < length; i++) {
          let key = keys[i];
          nextTransition = transition[key];
          if (!nextTransition) {
            nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
            newTransitions++;
          }
          transition = nextTransition;
        }
      } else {
        for (let key in object)
          if (safePrototype || object.hasOwnProperty(key)) {
            nextTransition = transition[key];
            if (!nextTransition) {
              if (transition[RECORD_SYMBOL] & 1048576) {
                parentRecordId = transition[RECORD_SYMBOL] & 65535;
              }
              nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
              newTransitions++;
            }
            transition = nextTransition;
            length++;
          }
      }
      let recordId = transition[RECORD_SYMBOL];
      if (recordId !== void 0) {
        recordId &= 65535;
        target[position2++] = 217;
        target[position2++] = recordId >> 8 | 224;
        target[position2++] = recordId & 255;
      } else {
        if (!keys)
          keys = transition.__keys__ || (transition.__keys__ = Object.keys(object));
        if (parentRecordId === void 0) {
          recordId = structures.nextId++;
          if (!recordId) {
            recordId = 0;
            structures.nextId = 1;
          }
          if (recordId >= MAX_STRUCTURES) {
            structures.nextId = (recordId = maxSharedStructures) + 1;
          }
        } else {
          recordId = parentRecordId;
        }
        structures[recordId] = keys;
        if (recordId < maxSharedStructures) {
          target[position2++] = 217;
          target[position2++] = recordId >> 8 | 224;
          target[position2++] = recordId & 255;
          transition = structures.transitions;
          for (let i = 0; i < length; i++) {
            if (transition[RECORD_SYMBOL] === void 0 || transition[RECORD_SYMBOL] & 1048576)
              transition[RECORD_SYMBOL] = recordId;
            transition = transition[keys[i]];
          }
          transition[RECORD_SYMBOL] = recordId | 1048576;
          hasSharedUpdate = true;
        } else {
          transition[RECORD_SYMBOL] = recordId;
          targetView.setUint32(position2, 3655335680);
          position2 += 3;
          if (newTransitions)
            transitionsCount += serializationsSinceTransitionRebuild * newTransitions;
          if (recordIdsToRemove.length >= MAX_STRUCTURES - maxSharedStructures)
            recordIdsToRemove.shift()[RECORD_SYMBOL] = void 0;
          recordIdsToRemove.push(transition);
          writeArrayHeader(length + 2);
          encode2(57344 + recordId);
          encode2(keys);
          if (safePrototype === null)
            return;
          for (let key in object)
            if (safePrototype || object.hasOwnProperty(key))
              encode2(object[key]);
          return;
        }
      }
      if (length < 24) {
        target[position2++] = 128 | length;
      } else {
        writeArrayHeader(length);
      }
      if (safePrototype === null)
        return;
      for (let key in object)
        if (safePrototype || object.hasOwnProperty(key))
          encode2(object[key]);
    };
    const makeRoom = /* @__PURE__ */ __name((end) => {
      let newSize;
      if (end > 16777216) {
        if (end - start > MAX_BUFFER_SIZE)
          throw new Error("Encoded buffer would be larger than maximum buffer size");
        newSize = Math.min(
          MAX_BUFFER_SIZE,
          Math.round(Math.max((end - start) * (end > 67108864 ? 1.25 : 2), 4194304) / 4096) * 4096
        );
      } else
        newSize = (Math.max(end - start << 2, target.length - 1) >> 12) + 1 << 12;
      let newBuffer = new ByteArrayAllocate(newSize);
      targetView = new DataView(newBuffer.buffer, 0, newSize);
      if (target.copy)
        target.copy(newBuffer, 0, start, end);
      else
        newBuffer.set(target.slice(start, end));
      position2 -= start;
      start = 0;
      safeEnd = newBuffer.length - 10;
      return target = newBuffer;
    }, "makeRoom");
    let chunkThreshold = 100;
    let continuedChunkThreshold = 1e3;
    this.encodeAsIterable = function(value, options2) {
      return startEncoding(value, options2, encodeObjectAsIterable);
    };
    this.encodeAsAsyncIterable = function(value, options2) {
      return startEncoding(value, options2, encodeObjectAsAsyncIterable);
    };
    function* encodeObjectAsIterable(object, iterateProperties, finalIterable) {
      let constructor = object.constructor;
      if (constructor === Object) {
        let useRecords = encoder.useRecords !== false;
        if (useRecords)
          writeObject(object, null);
        else
          writeEntityLength(Object.keys(object).length, 160);
        for (let key in object) {
          let value = object[key];
          if (!useRecords)
            encode2(key);
          if (value && typeof value === "object") {
            if (iterateProperties[key])
              yield* encodeObjectAsIterable(value, iterateProperties[key]);
            else
              yield* tryEncode(value, iterateProperties, key);
          } else
            encode2(value);
        }
      } else if (constructor === Array) {
        let length = object.length;
        writeArrayHeader(length);
        for (let i = 0; i < length; i++) {
          let value = object[i];
          if (value && (typeof value === "object" || position2 - start > chunkThreshold)) {
            if (iterateProperties.element)
              yield* encodeObjectAsIterable(value, iterateProperties.element);
            else
              yield* tryEncode(value, iterateProperties, "element");
          } else
            encode2(value);
        }
      } else if (object[Symbol.iterator]) {
        target[position2++] = 159;
        for (let value of object) {
          if (value && (typeof value === "object" || position2 - start > chunkThreshold)) {
            if (iterateProperties.element)
              yield* encodeObjectAsIterable(value, iterateProperties.element);
            else
              yield* tryEncode(value, iterateProperties, "element");
          } else
            encode2(value);
        }
        target[position2++] = 255;
      } else if (isBlob(object)) {
        writeEntityLength(object.size, 64);
        yield target.subarray(start, position2);
        yield object;
        restartEncoding();
      } else if (object[Symbol.asyncIterator]) {
        target[position2++] = 159;
        yield target.subarray(start, position2);
        yield object;
        restartEncoding();
        target[position2++] = 255;
      } else {
        encode2(object);
      }
      if (finalIterable && position2 > start)
        yield target.subarray(start, position2);
      else if (position2 - start > chunkThreshold) {
        yield target.subarray(start, position2);
        restartEncoding();
      }
    }
    __name(encodeObjectAsIterable, "encodeObjectAsIterable");
    function* tryEncode(value, iterateProperties, key) {
      let restart = position2 - start;
      try {
        encode2(value);
        if (position2 - start > chunkThreshold) {
          yield target.subarray(start, position2);
          restartEncoding();
        }
      } catch (error) {
        if (error.iteratorNotHandled) {
          iterateProperties[key] = {};
          position2 = start + restart;
          yield* encodeObjectAsIterable.call(this, value, iterateProperties[key]);
        } else
          throw error;
      }
    }
    __name(tryEncode, "tryEncode");
    function restartEncoding() {
      chunkThreshold = continuedChunkThreshold;
      encoder.encode(null, THROW_ON_ITERABLE);
    }
    __name(restartEncoding, "restartEncoding");
    function startEncoding(value, options2, encodeIterable) {
      if (options2 && options2.chunkThreshold)
        chunkThreshold = continuedChunkThreshold = options2.chunkThreshold;
      else
        chunkThreshold = 100;
      if (value && typeof value === "object") {
        encoder.encode(null, THROW_ON_ITERABLE);
        return encodeIterable(value, encoder.iterateProperties || (encoder.iterateProperties = {}), true);
      }
      return [encoder.encode(value)];
    }
    __name(startEncoding, "startEncoding");
    async function* encodeObjectAsAsyncIterable(value, iterateProperties) {
      for (let encodedValue of encodeObjectAsIterable(value, iterateProperties, true)) {
        let constructor = encodedValue.constructor;
        if (constructor === ByteArray || constructor === Uint8Array)
          yield encodedValue;
        else if (isBlob(encodedValue)) {
          let reader = encodedValue.stream().getReader();
          let next;
          while (!(next = await reader.read()).done) {
            yield next.value;
          }
        } else if (encodedValue[Symbol.asyncIterator]) {
          for await (let asyncValue of encodedValue) {
            restartEncoding();
            if (asyncValue)
              yield* encodeObjectAsAsyncIterable(asyncValue, iterateProperties.async || (iterateProperties.async = {}));
            else
              yield encoder.encode(asyncValue);
          }
        } else {
          yield encodedValue;
        }
      }
    }
    __name(encodeObjectAsAsyncIterable, "encodeObjectAsAsyncIterable");
  }
  useBuffer(buffer) {
    target = buffer;
    targetView = new DataView(target.buffer, target.byteOffset, target.byteLength);
    position2 = 0;
  }
  clearSharedData() {
    if (this.structures)
      this.structures = [];
    if (this.sharedValues)
      this.sharedValues = void 0;
  }
  updateSharedData() {
    let lastVersion = this.sharedVersion || 0;
    this.sharedVersion = lastVersion + 1;
    let structuresCopy = this.structures.slice(0);
    let sharedData = new SharedData(structuresCopy, this.sharedValues, this.sharedVersion);
    let saveResults = this.saveShared(
      sharedData,
      (existingShared) => (existingShared && existingShared.version || 0) == lastVersion
    );
    if (saveResults === false) {
      sharedData = this.getShared() || {};
      this.structures = sharedData.structures || [];
      this.sharedValues = sharedData.packedValues;
      this.sharedVersion = sharedData.version;
      this.structures.nextId = this.structures.length;
    } else {
      structuresCopy.forEach((structure, i) => this.structures[i] = structure);
    }
    return saveResults;
  }
};
__name(Encoder, "Encoder");
function writeEntityLength(length, majorValue) {
  if (length < 24)
    target[position2++] = majorValue | length;
  else if (length < 256) {
    target[position2++] = majorValue | 24;
    target[position2++] = length;
  } else if (length < 65536) {
    target[position2++] = majorValue | 25;
    target[position2++] = length >> 8;
    target[position2++] = length & 255;
  } else {
    target[position2++] = majorValue | 26;
    targetView.setUint32(position2, length);
    position2 += 4;
  }
}
__name(writeEntityLength, "writeEntityLength");
var SharedData = class {
  constructor(structures, values, version) {
    this.structures = structures;
    this.packedValues = values;
    this.version = version;
  }
};
__name(SharedData, "SharedData");
function writeArrayHeader(length) {
  if (length < 24)
    target[position2++] = 128 | length;
  else if (length < 256) {
    target[position2++] = 152;
    target[position2++] = length;
  } else if (length < 65536) {
    target[position2++] = 153;
    target[position2++] = length >> 8;
    target[position2++] = length & 255;
  } else {
    target[position2++] = 154;
    targetView.setUint32(position2, length);
    position2 += 4;
  }
}
__name(writeArrayHeader, "writeArrayHeader");
var BlobConstructor = typeof Blob === "undefined" ? function() {
} : Blob;
function isBlob(object) {
  if (object instanceof BlobConstructor)
    return true;
  let tag = object[Symbol.toStringTag];
  return tag === "Blob" || tag === "File";
}
__name(isBlob, "isBlob");
function findRepetitiveStrings(value, packedValues2) {
  switch (typeof value) {
    case "string":
      if (value.length > 3) {
        if (packedValues2.objectMap[value] > -1 || packedValues2.values.length >= packedValues2.maxValues)
          return;
        let packedStatus = packedValues2.get(value);
        if (packedStatus) {
          if (++packedStatus.count == 2) {
            packedValues2.values.push(value);
          }
        } else {
          packedValues2.set(value, {
            count: 1
          });
          if (packedValues2.samplingPackedValues) {
            let status = packedValues2.samplingPackedValues.get(value);
            if (status)
              status.count++;
            else
              packedValues2.samplingPackedValues.set(value, {
                count: 1
              });
          }
        }
      }
      break;
    case "object":
      if (value) {
        if (value instanceof Array) {
          for (let i = 0, l4 = value.length; i < l4; i++) {
            findRepetitiveStrings(value[i], packedValues2);
          }
        } else {
          let includeKeys = !packedValues2.encoder.useRecords;
          for (var key in value) {
            if (value.hasOwnProperty(key)) {
              if (includeKeys)
                findRepetitiveStrings(key, packedValues2);
              findRepetitiveStrings(value[key], packedValues2);
            }
          }
        }
      }
      break;
    case "function":
      console.log(value);
  }
}
__name(findRepetitiveStrings, "findRepetitiveStrings");
var isLittleEndianMachine2 = new Uint8Array(new Uint16Array([1]).buffer)[0] == 1;
extensionClasses = [
  Date,
  Set,
  Error,
  RegExp,
  Tag,
  ArrayBuffer,
  Uint8Array,
  Uint8ClampedArray,
  Uint16Array,
  Uint32Array,
  typeof BigUint64Array == "undefined" ? function() {
  } : BigUint64Array,
  Int8Array,
  Int16Array,
  Int32Array,
  typeof BigInt64Array == "undefined" ? function() {
  } : BigInt64Array,
  Float32Array,
  Float64Array,
  SharedData
];
extensions = [
  {
    // Date
    tag: 1,
    encode(date, encode2) {
      let seconds = date.getTime() / 1e3;
      if ((this.useTimestamp32 || date.getMilliseconds() === 0) && seconds >= 0 && seconds < 4294967296) {
        target[position2++] = 26;
        targetView.setUint32(position2, seconds);
        position2 += 4;
      } else {
        target[position2++] = 251;
        targetView.setFloat64(position2, seconds);
        position2 += 8;
      }
    }
  },
  {
    // Set
    tag: 258,
    // https://github.com/input-output-hk/cbor-sets-spec/blob/master/CBOR_SETS.md
    encode(set, encode2) {
      let array = Array.from(set);
      encode2(array);
    }
  },
  {
    // Error
    tag: 27,
    // http://cbor.schmorp.de/generic-object
    encode(error, encode2) {
      encode2([error.name, error.message]);
    }
  },
  {
    // RegExp
    tag: 27,
    // http://cbor.schmorp.de/generic-object
    encode(regex, encode2) {
      encode2(["RegExp", regex.source, regex.flags]);
    }
  },
  {
    // Tag
    getTag(tag) {
      return tag.tag;
    },
    encode(tag, encode2) {
      encode2(tag.value);
    }
  },
  {
    // ArrayBuffer
    encode(arrayBuffer, encode2, makeRoom) {
      writeBuffer(arrayBuffer, makeRoom);
    }
  },
  {
    // Uint8Array
    getTag(typedArray) {
      if (typedArray.constructor === Uint8Array) {
        if (this.tagUint8Array || hasNodeBuffer && this.tagUint8Array !== false)
          return 64;
      }
    },
    encode(typedArray, encode2, makeRoom) {
      writeBuffer(typedArray, makeRoom);
    }
  },
  typedArrayEncoder(68, 1),
  typedArrayEncoder(69, 2),
  typedArrayEncoder(70, 4),
  typedArrayEncoder(71, 8),
  typedArrayEncoder(72, 1),
  typedArrayEncoder(77, 2),
  typedArrayEncoder(78, 4),
  typedArrayEncoder(79, 8),
  typedArrayEncoder(85, 4),
  typedArrayEncoder(86, 8),
  {
    encode(sharedData, encode2) {
      let packedValues2 = sharedData.packedValues || [];
      let sharedStructures = sharedData.structures || [];
      if (packedValues2.values.length > 0) {
        target[position2++] = 216;
        target[position2++] = 51;
        writeArrayHeader(4);
        let valuesArray = packedValues2.values;
        encode2(valuesArray);
        writeArrayHeader(0);
        writeArrayHeader(0);
        packedObjectMap = Object.create(sharedPackedObjectMap || null);
        for (let i = 0, l4 = valuesArray.length; i < l4; i++) {
          packedObjectMap[valuesArray[i]] = i;
        }
      }
      if (sharedStructures) {
        targetView.setUint32(position2, 3655335424);
        position2 += 3;
        let definitions = sharedStructures.slice(0);
        definitions.unshift(57344);
        definitions.push(new Tag(sharedData.version, 1399353956));
        encode2(definitions);
      } else
        encode2(new Tag(sharedData.version, 1399353956));
    }
  }
];
function typedArrayEncoder(tag, size) {
  if (!isLittleEndianMachine2 && size > 1)
    tag -= 4;
  return {
    tag,
    encode: /* @__PURE__ */ __name(function writeExtBuffer(typedArray, encode2) {
      let length = typedArray.byteLength;
      let offset = typedArray.byteOffset || 0;
      let buffer = typedArray.buffer || typedArray;
      encode2(hasNodeBuffer ? Buffer2.from(buffer, offset, length) : new Uint8Array(buffer, offset, length));
    }, "writeExtBuffer")
  };
}
__name(typedArrayEncoder, "typedArrayEncoder");
function writeBuffer(buffer, makeRoom) {
  let length = buffer.byteLength;
  if (length < 24) {
    target[position2++] = 64 + length;
  } else if (length < 256) {
    target[position2++] = 88;
    target[position2++] = length;
  } else if (length < 65536) {
    target[position2++] = 89;
    target[position2++] = length >> 8;
    target[position2++] = length & 255;
  } else {
    target[position2++] = 90;
    targetView.setUint32(position2, length);
    position2 += 4;
  }
  if (position2 + length >= target.length) {
    makeRoom(position2 + length);
  }
  target.set(buffer.buffer ? buffer : new Uint8Array(buffer), position2);
  position2 += length;
}
__name(writeBuffer, "writeBuffer");
function insertIds(serialized, idsToInsert) {
  let nextId;
  let distanceToMove = idsToInsert.length * 2;
  let lastEnd = serialized.length - distanceToMove;
  idsToInsert.sort((a2, b5) => a2.offset > b5.offset ? 1 : -1);
  for (let id = 0; id < idsToInsert.length; id++) {
    let referee = idsToInsert[id];
    referee.id = id;
    for (let position3 of referee.references) {
      serialized[position3++] = id >> 8;
      serialized[position3] = id & 255;
    }
  }
  while (nextId = idsToInsert.pop()) {
    let offset = nextId.offset;
    serialized.copyWithin(offset + distanceToMove, offset, lastEnd);
    distanceToMove -= 2;
    let position3 = offset + distanceToMove;
    serialized[position3++] = 216;
    serialized[position3++] = 28;
    lastEnd = offset;
  }
  return serialized;
}
__name(insertIds, "insertIds");
function writeBundles(start, encode2) {
  targetView.setUint32(bundledStrings2.position + start, position2 - bundledStrings2.position - start + 1);
  let writeStrings = bundledStrings2;
  bundledStrings2 = null;
  encode2(writeStrings[0]);
  encode2(writeStrings[1]);
}
__name(writeBundles, "writeBundles");
var defaultEncoder = new Encoder({ useRecords: false });
var encode = defaultEncoder.encode;
defaultEncoder.encodeAsIterable;
defaultEncoder.encodeAsAsyncIterable;
var REUSE_BUFFER_MODE = 512;
var RESET_BUFFER_MODE = 1024;
var THROW_ON_ITERABLE = 2048;
var $isIpcSignalMessage = /* @__PURE__ */ __name((msg) => msg === "close" || msg === "ping" || msg === "pong", "$isIpcSignalMessage");
var $objectToIpcMessage = /* @__PURE__ */ __name((data, ipc) => {
  let message;
  if (data.type === 0) {
    message = new IpcRequest(
      data.req_id,
      data.url,
      data.method,
      new IpcHeaders(data.headers),
      IpcBodyReceiver.from(MetaBody.fromJSON(data.metaBody), ipc),
      ipc
    );
  } else if (data.type === 1) {
    message = new IpcResponse(
      data.req_id,
      data.statusCode,
      new IpcHeaders(data.headers),
      IpcBodyReceiver.from(MetaBody.fromJSON(data.metaBody), ipc),
      ipc
    );
  } else if (data.type === 7) {
    message = new IpcEvent(data.name, data.data, data.encoding);
  } else if (data.type === 2) {
    message = new IpcStreamData(data.stream_id, data.data, data.encoding);
  } else if (data.type === 3) {
    message = new IpcStreamPulling(data.stream_id, data.bandwidth);
  } else if (data.type === 4) {
    message = new IpcStreamPaused(data.stream_id, data.fuse);
  } else if (data.type === 6) {
    message = new IpcStreamAbort(data.stream_id);
  } else if (data.type === 5) {
    message = new IpcStreamEnd(data.stream_id);
  }
  return message;
}, "$objectToIpcMessage");
var $messageToIpcMessage = /* @__PURE__ */ __name((data, ipc) => {
  if ($isIpcSignalMessage(data)) {
    return data;
  }
  return $objectToIpcMessage(data, ipc);
}, "$messageToIpcMessage");
var $jsonToIpcMessage = /* @__PURE__ */ __name((data, ipc) => {
  if ($isIpcSignalMessage(data)) {
    return data;
  }
  return $objectToIpcMessage(JSON.parse(data), ipc);
}, "$jsonToIpcMessage");
new TextDecoder();
var $messagePackToIpcMessage = /* @__PURE__ */ __name((data, ipc) => {
  return $messageToIpcMessage(decode(data), ipc);
}, "$messagePackToIpcMessage");
var _rso;
var _ReadableStreamIpc = class extends Ipc {
  constructor(remote, role, self_support_protocols = {
    raw: false,
    cbor: true,
    protobuf: false
  }) {
    super();
    this.remote = remote;
    this.role = role;
    this.self_support_protocols = self_support_protocols;
    __privateAdd2(this, _rso, new ReadableStreamOut());
    this.PONG_DATA = once(() => {
      const pong = encode("pong");
      return _ReadableStreamIpc.concatLen(pong);
    });
    this.CLOSE_DATA = once(() => {
      const close = encode("close");
      return _ReadableStreamIpc.concatLen(close);
    });
    this._support_cbor = self_support_protocols.cbor && remote.ipc_support_protocols.cbor;
  }
  /** 这是输出流，给外部读取用的 */
  get stream() {
    return __privateGet2(this, _rso).stream;
  }
  get controller() {
    return __privateGet2(this, _rso).controller;
  }
  /**
   * 输入流要额外绑定
   * 注意，非必要不要 await 这个promise
   */
  async bindIncomeStream(stream, options = {}) {
    if (this._incomne_stream !== void 0) {
      throw new Error("in come stream alreay binded.");
    }
    this._incomne_stream = await stream;
    const { signal } = options;
    const reader = binaryStreamRead(this._incomne_stream, { signal });
    this.onClose(() => {
      reader.throw("output stream closed");
    });
    while (await reader.available() > 0) {
      const size = await reader.readInt();
      const data = await reader.readBinary(size);
      const message = this.support_cbor ? $messagePackToIpcMessage(data, this) : $jsonToIpcMessage(simpleDecoder(data, "utf8"), this);
      if (message === void 0) {
        console.error("unkonwn message", data);
        return;
      }
      if (message === "pong") {
        return;
      }
      if (message === "close") {
        this.close();
        return;
      }
      if (message === "ping") {
        this.controller.enqueue(this.PONG_DATA());
        return;
      }
      this._messageSignal.emit(message, this);
    }
    this.close();
  }
  _doPostMessage(message) {
    let message_raw;
    if (message.type === 0) {
      message_raw = message.ipcReqMessage();
    } else if (message.type === 1) {
      message_raw = message.ipcResMessage();
    } else {
      message_raw = message;
    }
    const message_data = this.support_cbor ? encode(message_raw) : simpleEncoder(JSON.stringify(message_raw), "utf8");
    const chunk = _ReadableStreamIpc.concatLen(message_data);
    this.controller.enqueue(chunk);
  }
  _doClose() {
    this.controller.enqueue(this.CLOSE_DATA());
    this.controller.close();
  }
};
var ReadableStreamIpc = _ReadableStreamIpc;
__name(ReadableStreamIpc, "ReadableStreamIpc");
_rso = /* @__PURE__ */ new WeakMap();
ReadableStreamIpc._len = new Uint32Array(1);
ReadableStreamIpc._len_u8a = new Uint8Array(_ReadableStreamIpc._len.buffer);
ReadableStreamIpc.concatLen = (data) => {
  _ReadableStreamIpc._len[0] = data.length;
  return u8aConcat([_ReadableStreamIpc._len_u8a, data]);
};
var g;
(function(s2) {
  s2.assertEqual = (n2) => n2;
  function e2(n2) {
  }
  __name(e2, "e");
  s2.assertIs = e2;
  function t3(n2) {
    throw new Error();
  }
  __name(t3, "t");
  s2.assertNever = t3, s2.arrayToEnum = (n2) => {
    let a2 = {};
    for (let i of n2)
      a2[i] = i;
    return a2;
  }, s2.getValidEnumValues = (n2) => {
    let a2 = s2.objectKeys(n2).filter((o2) => typeof n2[n2[o2]] != "number"), i = {};
    for (let o2 of a2)
      i[o2] = n2[o2];
    return s2.objectValues(i);
  }, s2.objectValues = (n2) => s2.objectKeys(n2).map(function(a2) {
    return n2[a2];
  }), s2.objectKeys = typeof Object.keys == "function" ? (n2) => Object.keys(n2) : (n2) => {
    let a2 = [];
    for (let i in n2)
      Object.prototype.hasOwnProperty.call(n2, i) && a2.push(i);
    return a2;
  }, s2.find = (n2, a2) => {
    for (let i of n2)
      if (a2(i))
        return i;
  }, s2.isInteger = typeof Number.isInteger == "function" ? (n2) => Number.isInteger(n2) : (n2) => typeof n2 == "number" && isFinite(n2) && Math.floor(n2) === n2;
  function r2(n2, a2 = " | ") {
    return n2.map((i) => typeof i == "string" ? `'${i}'` : i).join(a2);
  }
  __name(r2, "r");
  s2.joinValues = r2, s2.jsonStringifyReplacer = (n2, a2) => typeof a2 == "bigint" ? a2.toString() : a2;
})(g || (g = {}));
var me;
(function(s2) {
  s2.mergeShapes = (e2, t3) => ({ ...e2, ...t3 });
})(me || (me = {}));
var d = g.arrayToEnum(["string", "nan", "number", "integer", "float", "boolean", "date", "bigint", "symbol", "function", "undefined", "null", "array", "object", "unknown", "promise", "void", "never", "map", "set"]);
var P = /* @__PURE__ */ __name((s2) => {
  switch (typeof s2) {
    case "undefined":
      return d.undefined;
    case "string":
      return d.string;
    case "number":
      return isNaN(s2) ? d.nan : d.number;
    case "boolean":
      return d.boolean;
    case "function":
      return d.function;
    case "bigint":
      return d.bigint;
    case "symbol":
      return d.symbol;
    case "object":
      return Array.isArray(s2) ? d.array : s2 === null ? d.null : s2.then && typeof s2.then == "function" && s2.catch && typeof s2.catch == "function" ? d.promise : typeof Map < "u" && s2 instanceof Map ? d.map : typeof Set < "u" && s2 instanceof Set ? d.set : typeof Date < "u" && s2 instanceof Date ? d.date : d.object;
    default:
      return d.unknown;
  }
}, "P");
var c = g.arrayToEnum(["invalid_type", "invalid_literal", "custom", "invalid_union", "invalid_union_discriminator", "invalid_enum_value", "unrecognized_keys", "invalid_arguments", "invalid_return_type", "invalid_date", "invalid_string", "too_small", "too_big", "invalid_intersection_types", "not_multiple_of", "not_finite"]);
var Ne = /* @__PURE__ */ __name((s2) => JSON.stringify(s2, null, 2).replace(/"([^"]+)":/g, "$1:"), "Ne");
var T = /* @__PURE__ */ __name(class extends Error {
  constructor(e2) {
    super(), this.issues = [], this.addIssue = (r2) => {
      this.issues = [...this.issues, r2];
    }, this.addIssues = (r2 = []) => {
      this.issues = [...this.issues, ...r2];
    };
    let t3 = new.target.prototype;
    Object.setPrototypeOf ? Object.setPrototypeOf(this, t3) : this.__proto__ = t3, this.name = "ZodError", this.issues = e2;
  }
  get errors() {
    return this.issues;
  }
  format(e2) {
    let t3 = e2 || function(a2) {
      return a2.message;
    }, r2 = { _errors: [] }, n2 = /* @__PURE__ */ __name((a2) => {
      for (let i of a2.issues)
        if (i.code === "invalid_union")
          i.unionErrors.map(n2);
        else if (i.code === "invalid_return_type")
          n2(i.returnTypeError);
        else if (i.code === "invalid_arguments")
          n2(i.argumentsError);
        else if (i.path.length === 0)
          r2._errors.push(t3(i));
        else {
          let o2 = r2, f7 = 0;
          for (; f7 < i.path.length; ) {
            let l4 = i.path[f7];
            f7 === i.path.length - 1 ? (o2[l4] = o2[l4] || { _errors: [] }, o2[l4]._errors.push(t3(i))) : o2[l4] = o2[l4] || { _errors: [] }, o2 = o2[l4], f7++;
          }
        }
    }, "n");
    return n2(this), r2;
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, g.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e2 = (t3) => t3.message) {
    let t3 = {}, r2 = [];
    for (let n2 of this.issues)
      n2.path.length > 0 ? (t3[n2.path[0]] = t3[n2.path[0]] || [], t3[n2.path[0]].push(e2(n2))) : r2.push(e2(n2));
    return { formErrors: r2, fieldErrors: t3 };
  }
  get formErrors() {
    return this.flatten();
  }
}, "T");
T.create = (s2) => new T(s2);
var oe = /* @__PURE__ */ __name((s2, e2) => {
  let t3;
  switch (s2.code) {
    case c.invalid_type:
      s2.received === d.undefined ? t3 = "Required" : t3 = `Expected ${s2.expected}, received ${s2.received}`;
      break;
    case c.invalid_literal:
      t3 = `Invalid literal value, expected ${JSON.stringify(s2.expected, g.jsonStringifyReplacer)}`;
      break;
    case c.unrecognized_keys:
      t3 = `Unrecognized key(s) in object: ${g.joinValues(s2.keys, ", ")}`;
      break;
    case c.invalid_union:
      t3 = "Invalid input";
      break;
    case c.invalid_union_discriminator:
      t3 = `Invalid discriminator value. Expected ${g.joinValues(s2.options)}`;
      break;
    case c.invalid_enum_value:
      t3 = `Invalid enum value. Expected ${g.joinValues(s2.options)}, received '${s2.received}'`;
      break;
    case c.invalid_arguments:
      t3 = "Invalid function arguments";
      break;
    case c.invalid_return_type:
      t3 = "Invalid function return type";
      break;
    case c.invalid_date:
      t3 = "Invalid date";
      break;
    case c.invalid_string:
      typeof s2.validation == "object" ? "includes" in s2.validation ? (t3 = `Invalid input: must include "${s2.validation.includes}"`, typeof s2.validation.position == "number" && (t3 = `${t3} at one or more positions greater than or equal to ${s2.validation.position}`)) : "startsWith" in s2.validation ? t3 = `Invalid input: must start with "${s2.validation.startsWith}"` : "endsWith" in s2.validation ? t3 = `Invalid input: must end with "${s2.validation.endsWith}"` : g.assertNever(s2.validation) : s2.validation !== "regex" ? t3 = `Invalid ${s2.validation}` : t3 = "Invalid";
      break;
    case c.too_small:
      s2.type === "array" ? t3 = `Array must contain ${s2.exact ? "exactly" : s2.inclusive ? "at least" : "more than"} ${s2.minimum} element(s)` : s2.type === "string" ? t3 = `String must contain ${s2.exact ? "exactly" : s2.inclusive ? "at least" : "over"} ${s2.minimum} character(s)` : s2.type === "number" ? t3 = `Number must be ${s2.exact ? "exactly equal to " : s2.inclusive ? "greater than or equal to " : "greater than "}${s2.minimum}` : s2.type === "date" ? t3 = `Date must be ${s2.exact ? "exactly equal to " : s2.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(s2.minimum))}` : t3 = "Invalid input";
      break;
    case c.too_big:
      s2.type === "array" ? t3 = `Array must contain ${s2.exact ? "exactly" : s2.inclusive ? "at most" : "less than"} ${s2.maximum} element(s)` : s2.type === "string" ? t3 = `String must contain ${s2.exact ? "exactly" : s2.inclusive ? "at most" : "under"} ${s2.maximum} character(s)` : s2.type === "number" ? t3 = `Number must be ${s2.exact ? "exactly" : s2.inclusive ? "less than or equal to" : "less than"} ${s2.maximum}` : s2.type === "bigint" ? t3 = `BigInt must be ${s2.exact ? "exactly" : s2.inclusive ? "less than or equal to" : "less than"} ${s2.maximum}` : s2.type === "date" ? t3 = `Date must be ${s2.exact ? "exactly" : s2.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(s2.maximum))}` : t3 = "Invalid input";
      break;
    case c.custom:
      t3 = "Invalid input";
      break;
    case c.invalid_intersection_types:
      t3 = "Intersection results could not be merged";
      break;
    case c.not_multiple_of:
      t3 = `Number must be a multiple of ${s2.multipleOf}`;
      break;
    case c.not_finite:
      t3 = "Number must be finite";
      break;
    default:
      t3 = e2.defaultError, g.assertNever(s2);
  }
  return { message: t3 };
}, "oe");
var ke = oe;
function Ee(s2) {
  ke = s2;
}
__name(Ee, "Ee");
function de() {
  return ke;
}
__name(de, "de");
var ue = /* @__PURE__ */ __name((s2) => {
  let { data: e2, path: t3, errorMaps: r2, issueData: n2 } = s2, a2 = [...t3, ...n2.path || []], i = { ...n2, path: a2 }, o2 = "", f7 = r2.filter((l4) => !!l4).slice().reverse();
  for (let l4 of f7)
    o2 = l4(i, { data: e2, defaultError: o2 }).message;
  return { ...n2, path: a2, message: n2.message || o2 };
}, "ue");
var Ie = [];
function u(s2, e2) {
  let t3 = ue({ issueData: e2, data: s2.data, path: s2.path, errorMaps: [s2.common.contextualErrorMap, s2.schemaErrorMap, de(), oe].filter((r2) => !!r2) });
  s2.common.issues.push(t3);
}
__name(u, "u");
var k = /* @__PURE__ */ __name(class {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    this.value === "valid" && (this.value = "dirty");
  }
  abort() {
    this.value !== "aborted" && (this.value = "aborted");
  }
  static mergeArray(e2, t3) {
    let r2 = [];
    for (let n2 of t3) {
      if (n2.status === "aborted")
        return m;
      n2.status === "dirty" && e2.dirty(), r2.push(n2.value);
    }
    return { status: e2.value, value: r2 };
  }
  static async mergeObjectAsync(e2, t3) {
    let r2 = [];
    for (let n2 of t3)
      r2.push({ key: await n2.key, value: await n2.value });
    return k.mergeObjectSync(e2, r2);
  }
  static mergeObjectSync(e2, t3) {
    let r2 = {};
    for (let n2 of t3) {
      let { key: a2, value: i } = n2;
      if (a2.status === "aborted" || i.status === "aborted")
        return m;
      a2.status === "dirty" && e2.dirty(), i.status === "dirty" && e2.dirty(), (typeof i.value < "u" || n2.alwaysSet) && (r2[a2.value] = i.value);
    }
    return { status: e2.value, value: r2 };
  }
}, "k");
var m = Object.freeze({ status: "aborted" });
var be = /* @__PURE__ */ __name((s2) => ({ status: "dirty", value: s2 }), "be");
var b = /* @__PURE__ */ __name((s2) => ({ status: "valid", value: s2 }), "b");
var ye = /* @__PURE__ */ __name((s2) => s2.status === "aborted", "ye");
var ve = /* @__PURE__ */ __name((s2) => s2.status === "dirty", "ve");
var le = /* @__PURE__ */ __name((s2) => s2.status === "valid", "le");
var fe = /* @__PURE__ */ __name((s2) => typeof Promise < "u" && s2 instanceof Promise, "fe");
var h;
(function(s2) {
  s2.errToObj = (e2) => typeof e2 == "string" ? { message: e2 } : e2 || {}, s2.toString = (e2) => typeof e2 == "string" ? e2 : e2 == null ? void 0 : e2.message;
})(h || (h = {}));
var O = /* @__PURE__ */ __name(class {
  constructor(e2, t3, r2, n2) {
    this._cachedPath = [], this.parent = e2, this.data = t3, this._path = r2, this._key = n2;
  }
  get path() {
    return this._cachedPath.length || (this._key instanceof Array ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}, "O");
var ge = /* @__PURE__ */ __name((s2, e2) => {
  if (le(e2))
    return { success: true, data: e2.value };
  if (!s2.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return { success: false, get error() {
    if (this._error)
      return this._error;
    let t3 = new T(s2.common.issues);
    return this._error = t3, this._error;
  } };
}, "ge");
function y(s2) {
  if (!s2)
    return {};
  let { errorMap: e2, invalid_type_error: t3, required_error: r2, description: n2 } = s2;
  if (e2 && (t3 || r2))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e2 ? { errorMap: e2, description: n2 } : { errorMap: (i, o2) => i.code !== "invalid_type" ? { message: o2.defaultError } : typeof o2.data > "u" ? { message: r2 ?? o2.defaultError } : { message: t3 ?? o2.defaultError }, description: n2 };
}
__name(y, "y");
var v = /* @__PURE__ */ __name(class {
  constructor(e2) {
    this.spa = this.safeParseAsync, this._def = e2, this.parse = this.parse.bind(this), this.safeParse = this.safeParse.bind(this), this.parseAsync = this.parseAsync.bind(this), this.safeParseAsync = this.safeParseAsync.bind(this), this.spa = this.spa.bind(this), this.refine = this.refine.bind(this), this.refinement = this.refinement.bind(this), this.superRefine = this.superRefine.bind(this), this.optional = this.optional.bind(this), this.nullable = this.nullable.bind(this), this.nullish = this.nullish.bind(this), this.array = this.array.bind(this), this.promise = this.promise.bind(this), this.or = this.or.bind(this), this.and = this.and.bind(this), this.transform = this.transform.bind(this), this.brand = this.brand.bind(this), this.default = this.default.bind(this), this.catch = this.catch.bind(this), this.describe = this.describe.bind(this), this.pipe = this.pipe.bind(this), this.isNullable = this.isNullable.bind(this), this.isOptional = this.isOptional.bind(this);
  }
  get description() {
    return this._def.description;
  }
  _getType(e2) {
    return P(e2.data);
  }
  _getOrReturnCtx(e2, t3) {
    return t3 || { common: e2.parent.common, data: e2.data, parsedType: P(e2.data), schemaErrorMap: this._def.errorMap, path: e2.path, parent: e2.parent };
  }
  _processInputParams(e2) {
    return { status: new k(), ctx: { common: e2.parent.common, data: e2.data, parsedType: P(e2.data), schemaErrorMap: this._def.errorMap, path: e2.path, parent: e2.parent } };
  }
  _parseSync(e2) {
    let t3 = this._parse(e2);
    if (fe(t3))
      throw new Error("Synchronous parse encountered promise.");
    return t3;
  }
  _parseAsync(e2) {
    let t3 = this._parse(e2);
    return Promise.resolve(t3);
  }
  parse(e2, t3) {
    let r2 = this.safeParse(e2, t3);
    if (r2.success)
      return r2.data;
    throw r2.error;
  }
  safeParse(e2, t3) {
    var r2;
    let n2 = { common: { issues: [], async: (r2 = t3 == null ? void 0 : t3.async) !== null && r2 !== void 0 ? r2 : false, contextualErrorMap: t3 == null ? void 0 : t3.errorMap }, path: (t3 == null ? void 0 : t3.path) || [], schemaErrorMap: this._def.errorMap, parent: null, data: e2, parsedType: P(e2) }, a2 = this._parseSync({ data: e2, path: n2.path, parent: n2 });
    return ge(n2, a2);
  }
  async parseAsync(e2, t3) {
    let r2 = await this.safeParseAsync(e2, t3);
    if (r2.success)
      return r2.data;
    throw r2.error;
  }
  async safeParseAsync(e2, t3) {
    let r2 = { common: { issues: [], contextualErrorMap: t3 == null ? void 0 : t3.errorMap, async: true }, path: (t3 == null ? void 0 : t3.path) || [], schemaErrorMap: this._def.errorMap, parent: null, data: e2, parsedType: P(e2) }, n2 = this._parse({ data: e2, path: r2.path, parent: r2 }), a2 = await (fe(n2) ? n2 : Promise.resolve(n2));
    return ge(r2, a2);
  }
  refine(e2, t3) {
    let r2 = /* @__PURE__ */ __name((n2) => typeof t3 == "string" || typeof t3 > "u" ? { message: t3 } : typeof t3 == "function" ? t3(n2) : t3, "r");
    return this._refinement((n2, a2) => {
      let i = e2(n2), o2 = /* @__PURE__ */ __name(() => a2.addIssue({ code: c.custom, ...r2(n2) }), "o");
      return typeof Promise < "u" && i instanceof Promise ? i.then((f7) => f7 ? true : (o2(), false)) : i ? true : (o2(), false);
    });
  }
  refinement(e2, t3) {
    return this._refinement((r2, n2) => e2(r2) ? true : (n2.addIssue(typeof t3 == "function" ? t3(r2, n2) : t3), false));
  }
  _refinement(e2) {
    return new C({ schema: this, typeName: p.ZodEffects, effect: { type: "refinement", refinement: e2 } });
  }
  superRefine(e2) {
    return this._refinement(e2);
  }
  optional() {
    return E.create(this, this._def);
  }
  nullable() {
    return $.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return S.create(this, this._def);
  }
  promise() {
    return D.create(this, this._def);
  }
  or(e2) {
    return q.create([this, e2], this._def);
  }
  and(e2) {
    return J.create(this, e2, this._def);
  }
  transform(e2) {
    return new C({ ...y(this._def), schema: this, typeName: p.ZodEffects, effect: { type: "transform", transform: e2 } });
  }
  default(e2) {
    let t3 = typeof e2 == "function" ? e2 : () => e2;
    return new K({ ...y(this._def), innerType: this, defaultValue: t3, typeName: p.ZodDefault });
  }
  brand() {
    return new he({ typeName: p.ZodBranded, type: this, ...y(this._def) });
  }
  catch(e2) {
    let t3 = typeof e2 == "function" ? e2 : () => e2;
    return new ae({ ...y(this._def), innerType: this, catchValue: t3, typeName: p.ZodCatch });
  }
  describe(e2) {
    let t3 = this.constructor;
    return new t3({ ...this._def, description: e2 });
  }
  pipe(e2) {
    return Q.create(this, e2);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}, "v");
var je = /^c[^\s-]{8,}$/i;
var Re = /^[a-z][a-z0-9]*$/;
var Ae = /[0-9A-HJKMNP-TV-Z]{26}/;
var Ze = /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;
var Me = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\])|(\[IPv6:(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))\])|([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])*(\.[A-Za-z]{2,})+))$/;
var Ve = /^(\p{Extended_Pictographic}|\p{Emoji_Component})+$/u;
var $e = /^(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))$/;
var Pe = /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/;
var Le = /* @__PURE__ */ __name((s2) => s2.precision ? s2.offset ? new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${s2.precision}}(([+-]\\d{2}(:?\\d{2})?)|Z)$`) : new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${s2.precision}}Z$`) : s2.precision === 0 ? s2.offset ? new RegExp("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(([+-]\\d{2}(:?\\d{2})?)|Z)$") : new RegExp("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$") : s2.offset ? new RegExp("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(([+-]\\d{2}(:?\\d{2})?)|Z)$") : new RegExp("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z$"), "Le");
function ze(s2, e2) {
  return !!((e2 === "v4" || !e2) && $e.test(s2) || (e2 === "v6" || !e2) && Pe.test(s2));
}
__name(ze, "ze");
var w = /* @__PURE__ */ __name(class extends v {
  constructor() {
    super(...arguments), this._regex = (e2, t3, r2) => this.refinement((n2) => e2.test(n2), { validation: t3, code: c.invalid_string, ...h.errToObj(r2) }), this.nonempty = (e2) => this.min(1, h.errToObj(e2)), this.trim = () => new w({ ...this._def, checks: [...this._def.checks, { kind: "trim" }] }), this.toLowerCase = () => new w({ ...this._def, checks: [...this._def.checks, { kind: "toLowerCase" }] }), this.toUpperCase = () => new w({ ...this._def, checks: [...this._def.checks, { kind: "toUpperCase" }] });
  }
  _parse(e2) {
    if (this._def.coerce && (e2.data = String(e2.data)), this._getType(e2) !== d.string) {
      let a2 = this._getOrReturnCtx(e2);
      return u(a2, { code: c.invalid_type, expected: d.string, received: a2.parsedType }), m;
    }
    let r2 = new k(), n2;
    for (let a2 of this._def.checks)
      if (a2.kind === "min")
        e2.data.length < a2.value && (n2 = this._getOrReturnCtx(e2, n2), u(n2, { code: c.too_small, minimum: a2.value, type: "string", inclusive: true, exact: false, message: a2.message }), r2.dirty());
      else if (a2.kind === "max")
        e2.data.length > a2.value && (n2 = this._getOrReturnCtx(e2, n2), u(n2, { code: c.too_big, maximum: a2.value, type: "string", inclusive: true, exact: false, message: a2.message }), r2.dirty());
      else if (a2.kind === "length") {
        let i = e2.data.length > a2.value, o2 = e2.data.length < a2.value;
        (i || o2) && (n2 = this._getOrReturnCtx(e2, n2), i ? u(n2, { code: c.too_big, maximum: a2.value, type: "string", inclusive: true, exact: true, message: a2.message }) : o2 && u(n2, { code: c.too_small, minimum: a2.value, type: "string", inclusive: true, exact: true, message: a2.message }), r2.dirty());
      } else if (a2.kind === "email")
        Me.test(e2.data) || (n2 = this._getOrReturnCtx(e2, n2), u(n2, { validation: "email", code: c.invalid_string, message: a2.message }), r2.dirty());
      else if (a2.kind === "emoji")
        Ve.test(e2.data) || (n2 = this._getOrReturnCtx(e2, n2), u(n2, { validation: "emoji", code: c.invalid_string, message: a2.message }), r2.dirty());
      else if (a2.kind === "uuid")
        Ze.test(e2.data) || (n2 = this._getOrReturnCtx(e2, n2), u(n2, { validation: "uuid", code: c.invalid_string, message: a2.message }), r2.dirty());
      else if (a2.kind === "cuid")
        je.test(e2.data) || (n2 = this._getOrReturnCtx(e2, n2), u(n2, { validation: "cuid", code: c.invalid_string, message: a2.message }), r2.dirty());
      else if (a2.kind === "cuid2")
        Re.test(e2.data) || (n2 = this._getOrReturnCtx(e2, n2), u(n2, { validation: "cuid2", code: c.invalid_string, message: a2.message }), r2.dirty());
      else if (a2.kind === "ulid")
        Ae.test(e2.data) || (n2 = this._getOrReturnCtx(e2, n2), u(n2, { validation: "ulid", code: c.invalid_string, message: a2.message }), r2.dirty());
      else if (a2.kind === "url")
        try {
          new URL(e2.data);
        } catch {
          n2 = this._getOrReturnCtx(e2, n2), u(n2, { validation: "url", code: c.invalid_string, message: a2.message }), r2.dirty();
        }
      else
        a2.kind === "regex" ? (a2.regex.lastIndex = 0, a2.regex.test(e2.data) || (n2 = this._getOrReturnCtx(e2, n2), u(n2, { validation: "regex", code: c.invalid_string, message: a2.message }), r2.dirty())) : a2.kind === "trim" ? e2.data = e2.data.trim() : a2.kind === "includes" ? e2.data.includes(a2.value, a2.position) || (n2 = this._getOrReturnCtx(e2, n2), u(n2, { code: c.invalid_string, validation: { includes: a2.value, position: a2.position }, message: a2.message }), r2.dirty()) : a2.kind === "toLowerCase" ? e2.data = e2.data.toLowerCase() : a2.kind === "toUpperCase" ? e2.data = e2.data.toUpperCase() : a2.kind === "startsWith" ? e2.data.startsWith(a2.value) || (n2 = this._getOrReturnCtx(e2, n2), u(n2, { code: c.invalid_string, validation: { startsWith: a2.value }, message: a2.message }), r2.dirty()) : a2.kind === "endsWith" ? e2.data.endsWith(a2.value) || (n2 = this._getOrReturnCtx(e2, n2), u(n2, { code: c.invalid_string, validation: { endsWith: a2.value }, message: a2.message }), r2.dirty()) : a2.kind === "datetime" ? Le(a2).test(e2.data) || (n2 = this._getOrReturnCtx(e2, n2), u(n2, { code: c.invalid_string, validation: "datetime", message: a2.message }), r2.dirty()) : a2.kind === "ip" ? ze(e2.data, a2.version) || (n2 = this._getOrReturnCtx(e2, n2), u(n2, { validation: "ip", code: c.invalid_string, message: a2.message }), r2.dirty()) : g.assertNever(a2);
    return { status: r2.value, value: e2.data };
  }
  _addCheck(e2) {
    return new w({ ...this._def, checks: [...this._def.checks, e2] });
  }
  email(e2) {
    return this._addCheck({ kind: "email", ...h.errToObj(e2) });
  }
  url(e2) {
    return this._addCheck({ kind: "url", ...h.errToObj(e2) });
  }
  emoji(e2) {
    return this._addCheck({ kind: "emoji", ...h.errToObj(e2) });
  }
  uuid(e2) {
    return this._addCheck({ kind: "uuid", ...h.errToObj(e2) });
  }
  cuid(e2) {
    return this._addCheck({ kind: "cuid", ...h.errToObj(e2) });
  }
  cuid2(e2) {
    return this._addCheck({ kind: "cuid2", ...h.errToObj(e2) });
  }
  ulid(e2) {
    return this._addCheck({ kind: "ulid", ...h.errToObj(e2) });
  }
  ip(e2) {
    return this._addCheck({ kind: "ip", ...h.errToObj(e2) });
  }
  datetime(e2) {
    var t3;
    return typeof e2 == "string" ? this._addCheck({ kind: "datetime", precision: null, offset: false, message: e2 }) : this._addCheck({ kind: "datetime", precision: typeof (e2 == null ? void 0 : e2.precision) > "u" ? null : e2 == null ? void 0 : e2.precision, offset: (t3 = e2 == null ? void 0 : e2.offset) !== null && t3 !== void 0 ? t3 : false, ...h.errToObj(e2 == null ? void 0 : e2.message) });
  }
  regex(e2, t3) {
    return this._addCheck({ kind: "regex", regex: e2, ...h.errToObj(t3) });
  }
  includes(e2, t3) {
    return this._addCheck({ kind: "includes", value: e2, position: t3 == null ? void 0 : t3.position, ...h.errToObj(t3 == null ? void 0 : t3.message) });
  }
  startsWith(e2, t3) {
    return this._addCheck({ kind: "startsWith", value: e2, ...h.errToObj(t3) });
  }
  endsWith(e2, t3) {
    return this._addCheck({ kind: "endsWith", value: e2, ...h.errToObj(t3) });
  }
  min(e2, t3) {
    return this._addCheck({ kind: "min", value: e2, ...h.errToObj(t3) });
  }
  max(e2, t3) {
    return this._addCheck({ kind: "max", value: e2, ...h.errToObj(t3) });
  }
  length(e2, t3) {
    return this._addCheck({ kind: "length", value: e2, ...h.errToObj(t3) });
  }
  get isDatetime() {
    return !!this._def.checks.find((e2) => e2.kind === "datetime");
  }
  get isEmail() {
    return !!this._def.checks.find((e2) => e2.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((e2) => e2.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((e2) => e2.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((e2) => e2.kind === "uuid");
  }
  get isCUID() {
    return !!this._def.checks.find((e2) => e2.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((e2) => e2.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((e2) => e2.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((e2) => e2.kind === "ip");
  }
  get minLength() {
    let e2 = null;
    for (let t3 of this._def.checks)
      t3.kind === "min" && (e2 === null || t3.value > e2) && (e2 = t3.value);
    return e2;
  }
  get maxLength() {
    let e2 = null;
    for (let t3 of this._def.checks)
      t3.kind === "max" && (e2 === null || t3.value < e2) && (e2 = t3.value);
    return e2;
  }
}, "w");
w.create = (s2) => {
  var e2;
  return new w({ checks: [], typeName: p.ZodString, coerce: (e2 = s2 == null ? void 0 : s2.coerce) !== null && e2 !== void 0 ? e2 : false, ...y(s2) });
};
function De(s2, e2) {
  let t3 = (s2.toString().split(".")[1] || "").length, r2 = (e2.toString().split(".")[1] || "").length, n2 = t3 > r2 ? t3 : r2, a2 = parseInt(s2.toFixed(n2).replace(".", "")), i = parseInt(e2.toFixed(n2).replace(".", ""));
  return a2 % i / Math.pow(10, n2);
}
__name(De, "De");
var j = /* @__PURE__ */ __name(class extends v {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e2) {
    if (this._def.coerce && (e2.data = Number(e2.data)), this._getType(e2) !== d.number) {
      let a2 = this._getOrReturnCtx(e2);
      return u(a2, { code: c.invalid_type, expected: d.number, received: a2.parsedType }), m;
    }
    let r2, n2 = new k();
    for (let a2 of this._def.checks)
      a2.kind === "int" ? g.isInteger(e2.data) || (r2 = this._getOrReturnCtx(e2, r2), u(r2, { code: c.invalid_type, expected: "integer", received: "float", message: a2.message }), n2.dirty()) : a2.kind === "min" ? (a2.inclusive ? e2.data < a2.value : e2.data <= a2.value) && (r2 = this._getOrReturnCtx(e2, r2), u(r2, { code: c.too_small, minimum: a2.value, type: "number", inclusive: a2.inclusive, exact: false, message: a2.message }), n2.dirty()) : a2.kind === "max" ? (a2.inclusive ? e2.data > a2.value : e2.data >= a2.value) && (r2 = this._getOrReturnCtx(e2, r2), u(r2, { code: c.too_big, maximum: a2.value, type: "number", inclusive: a2.inclusive, exact: false, message: a2.message }), n2.dirty()) : a2.kind === "multipleOf" ? De(e2.data, a2.value) !== 0 && (r2 = this._getOrReturnCtx(e2, r2), u(r2, { code: c.not_multiple_of, multipleOf: a2.value, message: a2.message }), n2.dirty()) : a2.kind === "finite" ? Number.isFinite(e2.data) || (r2 = this._getOrReturnCtx(e2, r2), u(r2, { code: c.not_finite, message: a2.message }), n2.dirty()) : g.assertNever(a2);
    return { status: n2.value, value: e2.data };
  }
  gte(e2, t3) {
    return this.setLimit("min", e2, true, h.toString(t3));
  }
  gt(e2, t3) {
    return this.setLimit("min", e2, false, h.toString(t3));
  }
  lte(e2, t3) {
    return this.setLimit("max", e2, true, h.toString(t3));
  }
  lt(e2, t3) {
    return this.setLimit("max", e2, false, h.toString(t3));
  }
  setLimit(e2, t3, r2, n2) {
    return new j({ ...this._def, checks: [...this._def.checks, { kind: e2, value: t3, inclusive: r2, message: h.toString(n2) }] });
  }
  _addCheck(e2) {
    return new j({ ...this._def, checks: [...this._def.checks, e2] });
  }
  int(e2) {
    return this._addCheck({ kind: "int", message: h.toString(e2) });
  }
  positive(e2) {
    return this._addCheck({ kind: "min", value: 0, inclusive: false, message: h.toString(e2) });
  }
  negative(e2) {
    return this._addCheck({ kind: "max", value: 0, inclusive: false, message: h.toString(e2) });
  }
  nonpositive(e2) {
    return this._addCheck({ kind: "max", value: 0, inclusive: true, message: h.toString(e2) });
  }
  nonnegative(e2) {
    return this._addCheck({ kind: "min", value: 0, inclusive: true, message: h.toString(e2) });
  }
  multipleOf(e2, t3) {
    return this._addCheck({ kind: "multipleOf", value: e2, message: h.toString(t3) });
  }
  finite(e2) {
    return this._addCheck({ kind: "finite", message: h.toString(e2) });
  }
  safe(e2) {
    return this._addCheck({ kind: "min", inclusive: true, value: Number.MIN_SAFE_INTEGER, message: h.toString(e2) })._addCheck({ kind: "max", inclusive: true, value: Number.MAX_SAFE_INTEGER, message: h.toString(e2) });
  }
  get minValue() {
    let e2 = null;
    for (let t3 of this._def.checks)
      t3.kind === "min" && (e2 === null || t3.value > e2) && (e2 = t3.value);
    return e2;
  }
  get maxValue() {
    let e2 = null;
    for (let t3 of this._def.checks)
      t3.kind === "max" && (e2 === null || t3.value < e2) && (e2 = t3.value);
    return e2;
  }
  get isInt() {
    return !!this._def.checks.find((e2) => e2.kind === "int" || e2.kind === "multipleOf" && g.isInteger(e2.value));
  }
  get isFinite() {
    let e2 = null, t3 = null;
    for (let r2 of this._def.checks) {
      if (r2.kind === "finite" || r2.kind === "int" || r2.kind === "multipleOf")
        return true;
      r2.kind === "min" ? (t3 === null || r2.value > t3) && (t3 = r2.value) : r2.kind === "max" && (e2 === null || r2.value < e2) && (e2 = r2.value);
    }
    return Number.isFinite(t3) && Number.isFinite(e2);
  }
}, "j");
j.create = (s2) => new j({ checks: [], typeName: p.ZodNumber, coerce: (s2 == null ? void 0 : s2.coerce) || false, ...y(s2) });
var R = /* @__PURE__ */ __name(class extends v {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte;
  }
  _parse(e2) {
    if (this._def.coerce && (e2.data = BigInt(e2.data)), this._getType(e2) !== d.bigint) {
      let a2 = this._getOrReturnCtx(e2);
      return u(a2, { code: c.invalid_type, expected: d.bigint, received: a2.parsedType }), m;
    }
    let r2, n2 = new k();
    for (let a2 of this._def.checks)
      a2.kind === "min" ? (a2.inclusive ? e2.data < a2.value : e2.data <= a2.value) && (r2 = this._getOrReturnCtx(e2, r2), u(r2, { code: c.too_small, type: "bigint", minimum: a2.value, inclusive: a2.inclusive, message: a2.message }), n2.dirty()) : a2.kind === "max" ? (a2.inclusive ? e2.data > a2.value : e2.data >= a2.value) && (r2 = this._getOrReturnCtx(e2, r2), u(r2, { code: c.too_big, type: "bigint", maximum: a2.value, inclusive: a2.inclusive, message: a2.message }), n2.dirty()) : a2.kind === "multipleOf" ? e2.data % a2.value !== BigInt(0) && (r2 = this._getOrReturnCtx(e2, r2), u(r2, { code: c.not_multiple_of, multipleOf: a2.value, message: a2.message }), n2.dirty()) : g.assertNever(a2);
    return { status: n2.value, value: e2.data };
  }
  gte(e2, t3) {
    return this.setLimit("min", e2, true, h.toString(t3));
  }
  gt(e2, t3) {
    return this.setLimit("min", e2, false, h.toString(t3));
  }
  lte(e2, t3) {
    return this.setLimit("max", e2, true, h.toString(t3));
  }
  lt(e2, t3) {
    return this.setLimit("max", e2, false, h.toString(t3));
  }
  setLimit(e2, t3, r2, n2) {
    return new R({ ...this._def, checks: [...this._def.checks, { kind: e2, value: t3, inclusive: r2, message: h.toString(n2) }] });
  }
  _addCheck(e2) {
    return new R({ ...this._def, checks: [...this._def.checks, e2] });
  }
  positive(e2) {
    return this._addCheck({ kind: "min", value: BigInt(0), inclusive: false, message: h.toString(e2) });
  }
  negative(e2) {
    return this._addCheck({ kind: "max", value: BigInt(0), inclusive: false, message: h.toString(e2) });
  }
  nonpositive(e2) {
    return this._addCheck({ kind: "max", value: BigInt(0), inclusive: true, message: h.toString(e2) });
  }
  nonnegative(e2) {
    return this._addCheck({ kind: "min", value: BigInt(0), inclusive: true, message: h.toString(e2) });
  }
  multipleOf(e2, t3) {
    return this._addCheck({ kind: "multipleOf", value: e2, message: h.toString(t3) });
  }
  get minValue() {
    let e2 = null;
    for (let t3 of this._def.checks)
      t3.kind === "min" && (e2 === null || t3.value > e2) && (e2 = t3.value);
    return e2;
  }
  get maxValue() {
    let e2 = null;
    for (let t3 of this._def.checks)
      t3.kind === "max" && (e2 === null || t3.value < e2) && (e2 = t3.value);
    return e2;
  }
}, "R");
R.create = (s2) => {
  var e2;
  return new R({ checks: [], typeName: p.ZodBigInt, coerce: (e2 = s2 == null ? void 0 : s2.coerce) !== null && e2 !== void 0 ? e2 : false, ...y(s2) });
};
var U = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    if (this._def.coerce && (e2.data = !!e2.data), this._getType(e2) !== d.boolean) {
      let r2 = this._getOrReturnCtx(e2);
      return u(r2, { code: c.invalid_type, expected: d.boolean, received: r2.parsedType }), m;
    }
    return b(e2.data);
  }
}, "U");
U.create = (s2) => new U({ typeName: p.ZodBoolean, coerce: (s2 == null ? void 0 : s2.coerce) || false, ...y(s2) });
var M = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    if (this._def.coerce && (e2.data = new Date(e2.data)), this._getType(e2) !== d.date) {
      let a2 = this._getOrReturnCtx(e2);
      return u(a2, { code: c.invalid_type, expected: d.date, received: a2.parsedType }), m;
    }
    if (isNaN(e2.data.getTime())) {
      let a2 = this._getOrReturnCtx(e2);
      return u(a2, { code: c.invalid_date }), m;
    }
    let r2 = new k(), n2;
    for (let a2 of this._def.checks)
      a2.kind === "min" ? e2.data.getTime() < a2.value && (n2 = this._getOrReturnCtx(e2, n2), u(n2, { code: c.too_small, message: a2.message, inclusive: true, exact: false, minimum: a2.value, type: "date" }), r2.dirty()) : a2.kind === "max" ? e2.data.getTime() > a2.value && (n2 = this._getOrReturnCtx(e2, n2), u(n2, { code: c.too_big, message: a2.message, inclusive: true, exact: false, maximum: a2.value, type: "date" }), r2.dirty()) : g.assertNever(a2);
    return { status: r2.value, value: new Date(e2.data.getTime()) };
  }
  _addCheck(e2) {
    return new M({ ...this._def, checks: [...this._def.checks, e2] });
  }
  min(e2, t3) {
    return this._addCheck({ kind: "min", value: e2.getTime(), message: h.toString(t3) });
  }
  max(e2, t3) {
    return this._addCheck({ kind: "max", value: e2.getTime(), message: h.toString(t3) });
  }
  get minDate() {
    let e2 = null;
    for (let t3 of this._def.checks)
      t3.kind === "min" && (e2 === null || t3.value > e2) && (e2 = t3.value);
    return e2 != null ? new Date(e2) : null;
  }
  get maxDate() {
    let e2 = null;
    for (let t3 of this._def.checks)
      t3.kind === "max" && (e2 === null || t3.value < e2) && (e2 = t3.value);
    return e2 != null ? new Date(e2) : null;
  }
}, "M");
M.create = (s2) => new M({ checks: [], coerce: (s2 == null ? void 0 : s2.coerce) || false, typeName: p.ZodDate, ...y(s2) });
var te = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    if (this._getType(e2) !== d.symbol) {
      let r2 = this._getOrReturnCtx(e2);
      return u(r2, { code: c.invalid_type, expected: d.symbol, received: r2.parsedType }), m;
    }
    return b(e2.data);
  }
}, "te");
te.create = (s2) => new te({ typeName: p.ZodSymbol, ...y(s2) });
var B = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    if (this._getType(e2) !== d.undefined) {
      let r2 = this._getOrReturnCtx(e2);
      return u(r2, { code: c.invalid_type, expected: d.undefined, received: r2.parsedType }), m;
    }
    return b(e2.data);
  }
}, "B");
B.create = (s2) => new B({ typeName: p.ZodUndefined, ...y(s2) });
var W = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    if (this._getType(e2) !== d.null) {
      let r2 = this._getOrReturnCtx(e2);
      return u(r2, { code: c.invalid_type, expected: d.null, received: r2.parsedType }), m;
    }
    return b(e2.data);
  }
}, "W");
W.create = (s2) => new W({ typeName: p.ZodNull, ...y(s2) });
var z = /* @__PURE__ */ __name(class extends v {
  constructor() {
    super(...arguments), this._any = true;
  }
  _parse(e2) {
    return b(e2.data);
  }
}, "z");
z.create = (s2) => new z({ typeName: p.ZodAny, ...y(s2) });
var Z = /* @__PURE__ */ __name(class extends v {
  constructor() {
    super(...arguments), this._unknown = true;
  }
  _parse(e2) {
    return b(e2.data);
  }
}, "Z");
Z.create = (s2) => new Z({ typeName: p.ZodUnknown, ...y(s2) });
var I = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    let t3 = this._getOrReturnCtx(e2);
    return u(t3, { code: c.invalid_type, expected: d.never, received: t3.parsedType }), m;
  }
}, "I");
I.create = (s2) => new I({ typeName: p.ZodNever, ...y(s2) });
var se = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    if (this._getType(e2) !== d.undefined) {
      let r2 = this._getOrReturnCtx(e2);
      return u(r2, { code: c.invalid_type, expected: d.void, received: r2.parsedType }), m;
    }
    return b(e2.data);
  }
}, "se");
se.create = (s2) => new se({ typeName: p.ZodVoid, ...y(s2) });
var S = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    let { ctx: t3, status: r2 } = this._processInputParams(e2), n2 = this._def;
    if (t3.parsedType !== d.array)
      return u(t3, { code: c.invalid_type, expected: d.array, received: t3.parsedType }), m;
    if (n2.exactLength !== null) {
      let i = t3.data.length > n2.exactLength.value, o2 = t3.data.length < n2.exactLength.value;
      (i || o2) && (u(t3, { code: i ? c.too_big : c.too_small, minimum: o2 ? n2.exactLength.value : void 0, maximum: i ? n2.exactLength.value : void 0, type: "array", inclusive: true, exact: true, message: n2.exactLength.message }), r2.dirty());
    }
    if (n2.minLength !== null && t3.data.length < n2.minLength.value && (u(t3, { code: c.too_small, minimum: n2.minLength.value, type: "array", inclusive: true, exact: false, message: n2.minLength.message }), r2.dirty()), n2.maxLength !== null && t3.data.length > n2.maxLength.value && (u(t3, { code: c.too_big, maximum: n2.maxLength.value, type: "array", inclusive: true, exact: false, message: n2.maxLength.message }), r2.dirty()), t3.common.async)
      return Promise.all([...t3.data].map((i, o2) => n2.type._parseAsync(new O(t3, i, t3.path, o2)))).then((i) => k.mergeArray(r2, i));
    let a2 = [...t3.data].map((i, o2) => n2.type._parseSync(new O(t3, i, t3.path, o2)));
    return k.mergeArray(r2, a2);
  }
  get element() {
    return this._def.type;
  }
  min(e2, t3) {
    return new S({ ...this._def, minLength: { value: e2, message: h.toString(t3) } });
  }
  max(e2, t3) {
    return new S({ ...this._def, maxLength: { value: e2, message: h.toString(t3) } });
  }
  length(e2, t3) {
    return new S({ ...this._def, exactLength: { value: e2, message: h.toString(t3) } });
  }
  nonempty(e2) {
    return this.min(1, e2);
  }
}, "S");
S.create = (s2, e2) => new S({ type: s2, minLength: null, maxLength: null, exactLength: null, typeName: p.ZodArray, ...y(e2) });
function ee(s2) {
  if (s2 instanceof x) {
    let e2 = {};
    for (let t3 in s2.shape) {
      let r2 = s2.shape[t3];
      e2[t3] = E.create(ee(r2));
    }
    return new x({ ...s2._def, shape: () => e2 });
  } else
    return s2 instanceof S ? new S({ ...s2._def, type: ee(s2.element) }) : s2 instanceof E ? E.create(ee(s2.unwrap())) : s2 instanceof $ ? $.create(ee(s2.unwrap())) : s2 instanceof N ? N.create(s2.items.map((e2) => ee(e2))) : s2;
}
__name(ee, "ee");
var x = /* @__PURE__ */ __name(class extends v {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    let e2 = this._def.shape(), t3 = g.objectKeys(e2);
    return this._cached = { shape: e2, keys: t3 };
  }
  _parse(e2) {
    if (this._getType(e2) !== d.object) {
      let l4 = this._getOrReturnCtx(e2);
      return u(l4, { code: c.invalid_type, expected: d.object, received: l4.parsedType }), m;
    }
    let { status: r2, ctx: n2 } = this._processInputParams(e2), { shape: a2, keys: i } = this._getCached(), o2 = [];
    if (!(this._def.catchall instanceof I && this._def.unknownKeys === "strip"))
      for (let l4 in n2.data)
        i.includes(l4) || o2.push(l4);
    let f7 = [];
    for (let l4 of i) {
      let _6 = a2[l4], F5 = n2.data[l4];
      f7.push({ key: { status: "valid", value: l4 }, value: _6._parse(new O(n2, F5, n2.path, l4)), alwaysSet: l4 in n2.data });
    }
    if (this._def.catchall instanceof I) {
      let l4 = this._def.unknownKeys;
      if (l4 === "passthrough")
        for (let _6 of o2)
          f7.push({ key: { status: "valid", value: _6 }, value: { status: "valid", value: n2.data[_6] } });
      else if (l4 === "strict")
        o2.length > 0 && (u(n2, { code: c.unrecognized_keys, keys: o2 }), r2.dirty());
      else if (l4 !== "strip")
        throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      let l4 = this._def.catchall;
      for (let _6 of o2) {
        let F5 = n2.data[_6];
        f7.push({ key: { status: "valid", value: _6 }, value: l4._parse(new O(n2, F5, n2.path, _6)), alwaysSet: _6 in n2.data });
      }
    }
    return n2.common.async ? Promise.resolve().then(async () => {
      let l4 = [];
      for (let _6 of f7) {
        let F5 = await _6.key;
        l4.push({ key: F5, value: await _6.value, alwaysSet: _6.alwaysSet });
      }
      return l4;
    }).then((l4) => k.mergeObjectSync(r2, l4)) : k.mergeObjectSync(r2, f7);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e2) {
    return h.errToObj, new x({ ...this._def, unknownKeys: "strict", ...e2 !== void 0 ? { errorMap: (t3, r2) => {
      var n2, a2, i, o2;
      let f7 = (i = (a2 = (n2 = this._def).errorMap) === null || a2 === void 0 ? void 0 : a2.call(n2, t3, r2).message) !== null && i !== void 0 ? i : r2.defaultError;
      return t3.code === "unrecognized_keys" ? { message: (o2 = h.errToObj(e2).message) !== null && o2 !== void 0 ? o2 : f7 } : { message: f7 };
    } } : {} });
  }
  strip() {
    return new x({ ...this._def, unknownKeys: "strip" });
  }
  passthrough() {
    return new x({ ...this._def, unknownKeys: "passthrough" });
  }
  extend(e2) {
    return new x({ ...this._def, shape: () => ({ ...this._def.shape(), ...e2 }) });
  }
  merge(e2) {
    return new x({ unknownKeys: e2._def.unknownKeys, catchall: e2._def.catchall, shape: () => ({ ...this._def.shape(), ...e2._def.shape() }), typeName: p.ZodObject });
  }
  setKey(e2, t3) {
    return this.augment({ [e2]: t3 });
  }
  catchall(e2) {
    return new x({ ...this._def, catchall: e2 });
  }
  pick(e2) {
    let t3 = {};
    return g.objectKeys(e2).forEach((r2) => {
      e2[r2] && this.shape[r2] && (t3[r2] = this.shape[r2]);
    }), new x({ ...this._def, shape: () => t3 });
  }
  omit(e2) {
    let t3 = {};
    return g.objectKeys(this.shape).forEach((r2) => {
      e2[r2] || (t3[r2] = this.shape[r2]);
    }), new x({ ...this._def, shape: () => t3 });
  }
  deepPartial() {
    return ee(this);
  }
  partial(e2) {
    let t3 = {};
    return g.objectKeys(this.shape).forEach((r2) => {
      let n2 = this.shape[r2];
      e2 && !e2[r2] ? t3[r2] = n2 : t3[r2] = n2.optional();
    }), new x({ ...this._def, shape: () => t3 });
  }
  required(e2) {
    let t3 = {};
    return g.objectKeys(this.shape).forEach((r2) => {
      if (e2 && !e2[r2])
        t3[r2] = this.shape[r2];
      else {
        let a2 = this.shape[r2];
        for (; a2 instanceof E; )
          a2 = a2._def.innerType;
        t3[r2] = a2;
      }
    }), new x({ ...this._def, shape: () => t3 });
  }
  keyof() {
    return we(g.objectKeys(this.shape));
  }
}, "x");
x.create = (s2, e2) => new x({ shape: () => s2, unknownKeys: "strip", catchall: I.create(), typeName: p.ZodObject, ...y(e2) });
x.strictCreate = (s2, e2) => new x({ shape: () => s2, unknownKeys: "strict", catchall: I.create(), typeName: p.ZodObject, ...y(e2) });
x.lazycreate = (s2, e2) => new x({ shape: s2, unknownKeys: "strip", catchall: I.create(), typeName: p.ZodObject, ...y(e2) });
var q = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    let { ctx: t3 } = this._processInputParams(e2), r2 = this._def.options;
    function n2(a2) {
      for (let o2 of a2)
        if (o2.result.status === "valid")
          return o2.result;
      for (let o2 of a2)
        if (o2.result.status === "dirty")
          return t3.common.issues.push(...o2.ctx.common.issues), o2.result;
      let i = a2.map((o2) => new T(o2.ctx.common.issues));
      return u(t3, { code: c.invalid_union, unionErrors: i }), m;
    }
    __name(n2, "n");
    if (t3.common.async)
      return Promise.all(r2.map(async (a2) => {
        let i = { ...t3, common: { ...t3.common, issues: [] }, parent: null };
        return { result: await a2._parseAsync({ data: t3.data, path: t3.path, parent: i }), ctx: i };
      })).then(n2);
    {
      let a2, i = [];
      for (let f7 of r2) {
        let l4 = { ...t3, common: { ...t3.common, issues: [] }, parent: null }, _6 = f7._parseSync({ data: t3.data, path: t3.path, parent: l4 });
        if (_6.status === "valid")
          return _6;
        _6.status === "dirty" && !a2 && (a2 = { result: _6, ctx: l4 }), l4.common.issues.length && i.push(l4.common.issues);
      }
      if (a2)
        return t3.common.issues.push(...a2.ctx.common.issues), a2.result;
      let o2 = i.map((f7) => new T(f7));
      return u(t3, { code: c.invalid_union, unionErrors: o2 }), m;
    }
  }
  get options() {
    return this._def.options;
  }
}, "q");
q.create = (s2, e2) => new q({ options: s2, typeName: p.ZodUnion, ...y(e2) });
var ce = /* @__PURE__ */ __name((s2) => s2 instanceof H ? ce(s2.schema) : s2 instanceof C ? ce(s2.innerType()) : s2 instanceof G ? [s2.value] : s2 instanceof A ? s2.options : s2 instanceof X ? Object.keys(s2.enum) : s2 instanceof K ? ce(s2._def.innerType) : s2 instanceof B ? [void 0] : s2 instanceof W ? [null] : null, "ce");
var re = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    let { ctx: t3 } = this._processInputParams(e2);
    if (t3.parsedType !== d.object)
      return u(t3, { code: c.invalid_type, expected: d.object, received: t3.parsedType }), m;
    let r2 = this.discriminator, n2 = t3.data[r2], a2 = this.optionsMap.get(n2);
    return a2 ? t3.common.async ? a2._parseAsync({ data: t3.data, path: t3.path, parent: t3 }) : a2._parseSync({ data: t3.data, path: t3.path, parent: t3 }) : (u(t3, { code: c.invalid_union_discriminator, options: Array.from(this.optionsMap.keys()), path: [r2] }), m);
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  static create(e2, t3, r2) {
    let n2 = /* @__PURE__ */ new Map();
    for (let a2 of t3) {
      let i = ce(a2.shape[e2]);
      if (!i)
        throw new Error(`A discriminator value for key \`${e2}\` could not be extracted from all schema options`);
      for (let o2 of i) {
        if (n2.has(o2))
          throw new Error(`Discriminator property ${String(e2)} has duplicate value ${String(o2)}`);
        n2.set(o2, a2);
      }
    }
    return new re({ typeName: p.ZodDiscriminatedUnion, discriminator: e2, options: t3, optionsMap: n2, ...y(r2) });
  }
}, "re");
function _e(s2, e2) {
  let t3 = P(s2), r2 = P(e2);
  if (s2 === e2)
    return { valid: true, data: s2 };
  if (t3 === d.object && r2 === d.object) {
    let n2 = g.objectKeys(e2), a2 = g.objectKeys(s2).filter((o2) => n2.indexOf(o2) !== -1), i = { ...s2, ...e2 };
    for (let o2 of a2) {
      let f7 = _e(s2[o2], e2[o2]);
      if (!f7.valid)
        return { valid: false };
      i[o2] = f7.data;
    }
    return { valid: true, data: i };
  } else if (t3 === d.array && r2 === d.array) {
    if (s2.length !== e2.length)
      return { valid: false };
    let n2 = [];
    for (let a2 = 0; a2 < s2.length; a2++) {
      let i = s2[a2], o2 = e2[a2], f7 = _e(i, o2);
      if (!f7.valid)
        return { valid: false };
      n2.push(f7.data);
    }
    return { valid: true, data: n2 };
  } else
    return t3 === d.date && r2 === d.date && +s2 == +e2 ? { valid: true, data: s2 } : { valid: false };
}
__name(_e, "_e");
var J = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    let { status: t3, ctx: r2 } = this._processInputParams(e2), n2 = /* @__PURE__ */ __name((a2, i) => {
      if (ye(a2) || ye(i))
        return m;
      let o2 = _e(a2.value, i.value);
      return o2.valid ? ((ve(a2) || ve(i)) && t3.dirty(), { status: t3.value, value: o2.data }) : (u(r2, { code: c.invalid_intersection_types }), m);
    }, "n");
    return r2.common.async ? Promise.all([this._def.left._parseAsync({ data: r2.data, path: r2.path, parent: r2 }), this._def.right._parseAsync({ data: r2.data, path: r2.path, parent: r2 })]).then(([a2, i]) => n2(a2, i)) : n2(this._def.left._parseSync({ data: r2.data, path: r2.path, parent: r2 }), this._def.right._parseSync({ data: r2.data, path: r2.path, parent: r2 }));
  }
}, "J");
J.create = (s2, e2, t3) => new J({ left: s2, right: e2, typeName: p.ZodIntersection, ...y(t3) });
var N = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    let { status: t3, ctx: r2 } = this._processInputParams(e2);
    if (r2.parsedType !== d.array)
      return u(r2, { code: c.invalid_type, expected: d.array, received: r2.parsedType }), m;
    if (r2.data.length < this._def.items.length)
      return u(r2, { code: c.too_small, minimum: this._def.items.length, inclusive: true, exact: false, type: "array" }), m;
    !this._def.rest && r2.data.length > this._def.items.length && (u(r2, { code: c.too_big, maximum: this._def.items.length, inclusive: true, exact: false, type: "array" }), t3.dirty());
    let a2 = [...r2.data].map((i, o2) => {
      let f7 = this._def.items[o2] || this._def.rest;
      return f7 ? f7._parse(new O(r2, i, r2.path, o2)) : null;
    }).filter((i) => !!i);
    return r2.common.async ? Promise.all(a2).then((i) => k.mergeArray(t3, i)) : k.mergeArray(t3, a2);
  }
  get items() {
    return this._def.items;
  }
  rest(e2) {
    return new N({ ...this._def, rest: e2 });
  }
}, "N");
N.create = (s2, e2) => {
  if (!Array.isArray(s2))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new N({ items: s2, typeName: p.ZodTuple, rest: null, ...y(e2) });
};
var Y = /* @__PURE__ */ __name(class extends v {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e2) {
    let { status: t3, ctx: r2 } = this._processInputParams(e2);
    if (r2.parsedType !== d.object)
      return u(r2, { code: c.invalid_type, expected: d.object, received: r2.parsedType }), m;
    let n2 = [], a2 = this._def.keyType, i = this._def.valueType;
    for (let o2 in r2.data)
      n2.push({ key: a2._parse(new O(r2, o2, r2.path, o2)), value: i._parse(new O(r2, r2.data[o2], r2.path, o2)) });
    return r2.common.async ? k.mergeObjectAsync(t3, n2) : k.mergeObjectSync(t3, n2);
  }
  get element() {
    return this._def.valueType;
  }
  static create(e2, t3, r2) {
    return t3 instanceof v ? new Y({ keyType: e2, valueType: t3, typeName: p.ZodRecord, ...y(r2) }) : new Y({ keyType: w.create(), valueType: e2, typeName: p.ZodRecord, ...y(t3) });
  }
}, "Y");
var ne = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    let { status: t3, ctx: r2 } = this._processInputParams(e2);
    if (r2.parsedType !== d.map)
      return u(r2, { code: c.invalid_type, expected: d.map, received: r2.parsedType }), m;
    let n2 = this._def.keyType, a2 = this._def.valueType, i = [...r2.data.entries()].map(([o2, f7], l4) => ({ key: n2._parse(new O(r2, o2, r2.path, [l4, "key"])), value: a2._parse(new O(r2, f7, r2.path, [l4, "value"])) }));
    if (r2.common.async) {
      let o2 = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (let f7 of i) {
          let l4 = await f7.key, _6 = await f7.value;
          if (l4.status === "aborted" || _6.status === "aborted")
            return m;
          (l4.status === "dirty" || _6.status === "dirty") && t3.dirty(), o2.set(l4.value, _6.value);
        }
        return { status: t3.value, value: o2 };
      });
    } else {
      let o2 = /* @__PURE__ */ new Map();
      for (let f7 of i) {
        let l4 = f7.key, _6 = f7.value;
        if (l4.status === "aborted" || _6.status === "aborted")
          return m;
        (l4.status === "dirty" || _6.status === "dirty") && t3.dirty(), o2.set(l4.value, _6.value);
      }
      return { status: t3.value, value: o2 };
    }
  }
}, "ne");
ne.create = (s2, e2, t3) => new ne({ valueType: e2, keyType: s2, typeName: p.ZodMap, ...y(t3) });
var V = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    let { status: t3, ctx: r2 } = this._processInputParams(e2);
    if (r2.parsedType !== d.set)
      return u(r2, { code: c.invalid_type, expected: d.set, received: r2.parsedType }), m;
    let n2 = this._def;
    n2.minSize !== null && r2.data.size < n2.minSize.value && (u(r2, { code: c.too_small, minimum: n2.minSize.value, type: "set", inclusive: true, exact: false, message: n2.minSize.message }), t3.dirty()), n2.maxSize !== null && r2.data.size > n2.maxSize.value && (u(r2, { code: c.too_big, maximum: n2.maxSize.value, type: "set", inclusive: true, exact: false, message: n2.maxSize.message }), t3.dirty());
    let a2 = this._def.valueType;
    function i(f7) {
      let l4 = /* @__PURE__ */ new Set();
      for (let _6 of f7) {
        if (_6.status === "aborted")
          return m;
        _6.status === "dirty" && t3.dirty(), l4.add(_6.value);
      }
      return { status: t3.value, value: l4 };
    }
    __name(i, "i");
    let o2 = [...r2.data.values()].map((f7, l4) => a2._parse(new O(r2, f7, r2.path, l4)));
    return r2.common.async ? Promise.all(o2).then((f7) => i(f7)) : i(o2);
  }
  min(e2, t3) {
    return new V({ ...this._def, minSize: { value: e2, message: h.toString(t3) } });
  }
  max(e2, t3) {
    return new V({ ...this._def, maxSize: { value: e2, message: h.toString(t3) } });
  }
  size(e2, t3) {
    return this.min(e2, t3).max(e2, t3);
  }
  nonempty(e2) {
    return this.min(1, e2);
  }
}, "V");
V.create = (s2, e2) => new V({ valueType: s2, minSize: null, maxSize: null, typeName: p.ZodSet, ...y(e2) });
var L = /* @__PURE__ */ __name(class extends v {
  constructor() {
    super(...arguments), this.validate = this.implement;
  }
  _parse(e2) {
    let { ctx: t3 } = this._processInputParams(e2);
    if (t3.parsedType !== d.function)
      return u(t3, { code: c.invalid_type, expected: d.function, received: t3.parsedType }), m;
    function r2(o2, f7) {
      return ue({ data: o2, path: t3.path, errorMaps: [t3.common.contextualErrorMap, t3.schemaErrorMap, de(), oe].filter((l4) => !!l4), issueData: { code: c.invalid_arguments, argumentsError: f7 } });
    }
    __name(r2, "r");
    function n2(o2, f7) {
      return ue({ data: o2, path: t3.path, errorMaps: [t3.common.contextualErrorMap, t3.schemaErrorMap, de(), oe].filter((l4) => !!l4), issueData: { code: c.invalid_return_type, returnTypeError: f7 } });
    }
    __name(n2, "n");
    let a2 = { errorMap: t3.common.contextualErrorMap }, i = t3.data;
    return this._def.returns instanceof D ? b(async (...o2) => {
      let f7 = new T([]), l4 = await this._def.args.parseAsync(o2, a2).catch((pe) => {
        throw f7.addIssue(r2(o2, pe)), f7;
      }), _6 = await i(...l4);
      return await this._def.returns._def.type.parseAsync(_6, a2).catch((pe) => {
        throw f7.addIssue(n2(_6, pe)), f7;
      });
    }) : b((...o2) => {
      let f7 = this._def.args.safeParse(o2, a2);
      if (!f7.success)
        throw new T([r2(o2, f7.error)]);
      let l4 = i(...f7.data), _6 = this._def.returns.safeParse(l4, a2);
      if (!_6.success)
        throw new T([n2(l4, _6.error)]);
      return _6.data;
    });
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...e2) {
    return new L({ ...this._def, args: N.create(e2).rest(Z.create()) });
  }
  returns(e2) {
    return new L({ ...this._def, returns: e2 });
  }
  implement(e2) {
    return this.parse(e2);
  }
  strictImplement(e2) {
    return this.parse(e2);
  }
  static create(e2, t3, r2) {
    return new L({ args: e2 || N.create([]).rest(Z.create()), returns: t3 || Z.create(), typeName: p.ZodFunction, ...y(r2) });
  }
}, "L");
var H = /* @__PURE__ */ __name(class extends v {
  get schema() {
    return this._def.getter();
  }
  _parse(e2) {
    let { ctx: t3 } = this._processInputParams(e2);
    return this._def.getter()._parse({ data: t3.data, path: t3.path, parent: t3 });
  }
}, "H");
H.create = (s2, e2) => new H({ getter: s2, typeName: p.ZodLazy, ...y(e2) });
var G = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    if (e2.data !== this._def.value) {
      let t3 = this._getOrReturnCtx(e2);
      return u(t3, { received: t3.data, code: c.invalid_literal, expected: this._def.value }), m;
    }
    return { status: "valid", value: e2.data };
  }
  get value() {
    return this._def.value;
  }
}, "G");
G.create = (s2, e2) => new G({ value: s2, typeName: p.ZodLiteral, ...y(e2) });
function we(s2, e2) {
  return new A({ values: s2, typeName: p.ZodEnum, ...y(e2) });
}
__name(we, "we");
var A = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    if (typeof e2.data != "string") {
      let t3 = this._getOrReturnCtx(e2), r2 = this._def.values;
      return u(t3, { expected: g.joinValues(r2), received: t3.parsedType, code: c.invalid_type }), m;
    }
    if (this._def.values.indexOf(e2.data) === -1) {
      let t3 = this._getOrReturnCtx(e2), r2 = this._def.values;
      return u(t3, { received: t3.data, code: c.invalid_enum_value, options: r2 }), m;
    }
    return b(e2.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    let e2 = {};
    for (let t3 of this._def.values)
      e2[t3] = t3;
    return e2;
  }
  get Values() {
    let e2 = {};
    for (let t3 of this._def.values)
      e2[t3] = t3;
    return e2;
  }
  get Enum() {
    let e2 = {};
    for (let t3 of this._def.values)
      e2[t3] = t3;
    return e2;
  }
  extract(e2) {
    return A.create(e2);
  }
  exclude(e2) {
    return A.create(this.options.filter((t3) => !e2.includes(t3)));
  }
}, "A");
A.create = we;
var X = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    let t3 = g.getValidEnumValues(this._def.values), r2 = this._getOrReturnCtx(e2);
    if (r2.parsedType !== d.string && r2.parsedType !== d.number) {
      let n2 = g.objectValues(t3);
      return u(r2, { expected: g.joinValues(n2), received: r2.parsedType, code: c.invalid_type }), m;
    }
    if (t3.indexOf(e2.data) === -1) {
      let n2 = g.objectValues(t3);
      return u(r2, { received: r2.data, code: c.invalid_enum_value, options: n2 }), m;
    }
    return b(e2.data);
  }
  get enum() {
    return this._def.values;
  }
}, "X");
X.create = (s2, e2) => new X({ values: s2, typeName: p.ZodNativeEnum, ...y(e2) });
var D = /* @__PURE__ */ __name(class extends v {
  unwrap() {
    return this._def.type;
  }
  _parse(e2) {
    let { ctx: t3 } = this._processInputParams(e2);
    if (t3.parsedType !== d.promise && t3.common.async === false)
      return u(t3, { code: c.invalid_type, expected: d.promise, received: t3.parsedType }), m;
    let r2 = t3.parsedType === d.promise ? t3.data : Promise.resolve(t3.data);
    return b(r2.then((n2) => this._def.type.parseAsync(n2, { path: t3.path, errorMap: t3.common.contextualErrorMap })));
  }
}, "D");
D.create = (s2, e2) => new D({ type: s2, typeName: p.ZodPromise, ...y(e2) });
var C = /* @__PURE__ */ __name(class extends v {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === p.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e2) {
    let { status: t3, ctx: r2 } = this._processInputParams(e2), n2 = this._def.effect || null;
    if (n2.type === "preprocess") {
      let i = n2.transform(r2.data);
      return r2.common.async ? Promise.resolve(i).then((o2) => this._def.schema._parseAsync({ data: o2, path: r2.path, parent: r2 })) : this._def.schema._parseSync({ data: i, path: r2.path, parent: r2 });
    }
    let a2 = { addIssue: (i) => {
      u(r2, i), i.fatal ? t3.abort() : t3.dirty();
    }, get path() {
      return r2.path;
    } };
    if (a2.addIssue = a2.addIssue.bind(a2), n2.type === "refinement") {
      let i = /* @__PURE__ */ __name((o2) => {
        let f7 = n2.refinement(o2, a2);
        if (r2.common.async)
          return Promise.resolve(f7);
        if (f7 instanceof Promise)
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return o2;
      }, "i");
      if (r2.common.async === false) {
        let o2 = this._def.schema._parseSync({ data: r2.data, path: r2.path, parent: r2 });
        return o2.status === "aborted" ? m : (o2.status === "dirty" && t3.dirty(), i(o2.value), { status: t3.value, value: o2.value });
      } else
        return this._def.schema._parseAsync({ data: r2.data, path: r2.path, parent: r2 }).then((o2) => o2.status === "aborted" ? m : (o2.status === "dirty" && t3.dirty(), i(o2.value).then(() => ({ status: t3.value, value: o2.value }))));
    }
    if (n2.type === "transform")
      if (r2.common.async === false) {
        let i = this._def.schema._parseSync({ data: r2.data, path: r2.path, parent: r2 });
        if (!le(i))
          return i;
        let o2 = n2.transform(i.value, a2);
        if (o2 instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t3.value, value: o2 };
      } else
        return this._def.schema._parseAsync({ data: r2.data, path: r2.path, parent: r2 }).then((i) => le(i) ? Promise.resolve(n2.transform(i.value, a2)).then((o2) => ({ status: t3.value, value: o2 })) : i);
    g.assertNever(n2);
  }
}, "C");
C.create = (s2, e2, t3) => new C({ schema: s2, typeName: p.ZodEffects, effect: e2, ...y(t3) });
C.createWithPreprocess = (s2, e2, t3) => new C({ schema: e2, effect: { type: "preprocess", transform: s2 }, typeName: p.ZodEffects, ...y(t3) });
var E = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    return this._getType(e2) === d.undefined ? b(void 0) : this._def.innerType._parse(e2);
  }
  unwrap() {
    return this._def.innerType;
  }
}, "E");
E.create = (s2, e2) => new E({ innerType: s2, typeName: p.ZodOptional, ...y(e2) });
var $ = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    return this._getType(e2) === d.null ? b(null) : this._def.innerType._parse(e2);
  }
  unwrap() {
    return this._def.innerType;
  }
}, "$");
$.create = (s2, e2) => new $({ innerType: s2, typeName: p.ZodNullable, ...y(e2) });
var K = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    let { ctx: t3 } = this._processInputParams(e2), r2 = t3.data;
    return t3.parsedType === d.undefined && (r2 = this._def.defaultValue()), this._def.innerType._parse({ data: r2, path: t3.path, parent: t3 });
  }
  removeDefault() {
    return this._def.innerType;
  }
}, "K");
K.create = (s2, e2) => new K({ innerType: s2, typeName: p.ZodDefault, defaultValue: typeof e2.default == "function" ? e2.default : () => e2.default, ...y(e2) });
var ae = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    let { ctx: t3 } = this._processInputParams(e2), r2 = { ...t3, common: { ...t3.common, issues: [] } }, n2 = this._def.innerType._parse({ data: r2.data, path: r2.path, parent: { ...r2 } });
    return fe(n2) ? n2.then((a2) => ({ status: "valid", value: a2.status === "valid" ? a2.value : this._def.catchValue({ get error() {
      return new T(r2.common.issues);
    }, input: r2.data }) })) : { status: "valid", value: n2.status === "valid" ? n2.value : this._def.catchValue({ get error() {
      return new T(r2.common.issues);
    }, input: r2.data }) };
  }
  removeCatch() {
    return this._def.innerType;
  }
}, "ae");
ae.create = (s2, e2) => new ae({ innerType: s2, typeName: p.ZodCatch, catchValue: typeof e2.catch == "function" ? e2.catch : () => e2.catch, ...y(e2) });
var ie = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    if (this._getType(e2) !== d.nan) {
      let r2 = this._getOrReturnCtx(e2);
      return u(r2, { code: c.invalid_type, expected: d.nan, received: r2.parsedType }), m;
    }
    return { status: "valid", value: e2.data };
  }
}, "ie");
ie.create = (s2) => new ie({ typeName: p.ZodNaN, ...y(s2) });
var Ue = Symbol("zod_brand");
var he = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    let { ctx: t3 } = this._processInputParams(e2), r2 = t3.data;
    return this._def.type._parse({ data: r2, path: t3.path, parent: t3 });
  }
  unwrap() {
    return this._def.type;
  }
}, "he");
var Q = /* @__PURE__ */ __name(class extends v {
  _parse(e2) {
    let { status: t3, ctx: r2 } = this._processInputParams(e2);
    if (r2.common.async)
      return (async () => {
        let a2 = await this._def.in._parseAsync({ data: r2.data, path: r2.path, parent: r2 });
        return a2.status === "aborted" ? m : a2.status === "dirty" ? (t3.dirty(), be(a2.value)) : this._def.out._parseAsync({ data: a2.value, path: r2.path, parent: r2 });
      })();
    {
      let n2 = this._def.in._parseSync({ data: r2.data, path: r2.path, parent: r2 });
      return n2.status === "aborted" ? m : n2.status === "dirty" ? (t3.dirty(), { status: "dirty", value: n2.value }) : this._def.out._parseSync({ data: n2.value, path: r2.path, parent: r2 });
    }
  }
  static create(e2, t3) {
    return new Q({ in: e2, out: t3, typeName: p.ZodPipeline });
  }
}, "Q");
var Te = /* @__PURE__ */ __name((s2, e2 = {}, t3) => s2 ? z.create().superRefine((r2, n2) => {
  var a2, i;
  if (!s2(r2)) {
    let o2 = typeof e2 == "function" ? e2(r2) : typeof e2 == "string" ? { message: e2 } : e2, f7 = (i = (a2 = o2.fatal) !== null && a2 !== void 0 ? a2 : t3) !== null && i !== void 0 ? i : true, l4 = typeof o2 == "string" ? { message: o2 } : o2;
    n2.addIssue({ code: "custom", ...l4, fatal: f7 });
  }
}) : z.create(), "Te");
var Be = { object: x.lazycreate };
var p;
(function(s2) {
  s2.ZodString = "ZodString", s2.ZodNumber = "ZodNumber", s2.ZodNaN = "ZodNaN", s2.ZodBigInt = "ZodBigInt", s2.ZodBoolean = "ZodBoolean", s2.ZodDate = "ZodDate", s2.ZodSymbol = "ZodSymbol", s2.ZodUndefined = "ZodUndefined", s2.ZodNull = "ZodNull", s2.ZodAny = "ZodAny", s2.ZodUnknown = "ZodUnknown", s2.ZodNever = "ZodNever", s2.ZodVoid = "ZodVoid", s2.ZodArray = "ZodArray", s2.ZodObject = "ZodObject", s2.ZodUnion = "ZodUnion", s2.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", s2.ZodIntersection = "ZodIntersection", s2.ZodTuple = "ZodTuple", s2.ZodRecord = "ZodRecord", s2.ZodMap = "ZodMap", s2.ZodSet = "ZodSet", s2.ZodFunction = "ZodFunction", s2.ZodLazy = "ZodLazy", s2.ZodLiteral = "ZodLiteral", s2.ZodEnum = "ZodEnum", s2.ZodEffects = "ZodEffects", s2.ZodNativeEnum = "ZodNativeEnum", s2.ZodOptional = "ZodOptional", s2.ZodNullable = "ZodNullable", s2.ZodDefault = "ZodDefault", s2.ZodCatch = "ZodCatch", s2.ZodPromise = "ZodPromise", s2.ZodBranded = "ZodBranded", s2.ZodPipeline = "ZodPipeline";
})(p || (p = {}));
var We = /* @__PURE__ */ __name((s2, e2 = { message: `Input not instance of ${s2.name}` }) => Te((t3) => t3 instanceof s2, e2), "We");
var Se = w.create;
var Ce = j.create;
var qe = ie.create;
var Je = R.create;
var Oe = U.create;
var Ye = M.create;
var He = te.create;
var Ge = B.create;
var Xe = W.create;
var Ke = z.create;
var Qe = Z.create;
var Fe = I.create;
var et = se.create;
var tt = S.create;
var st = x.create;
var rt = x.strictCreate;
var nt = q.create;
var at = re.create;
var it = J.create;
var ot = N.create;
var ct = Y.create;
var dt = ne.create;
var ut = V.create;
var lt = L.create;
var ft = H.create;
var ht = G.create;
var pt = A.create;
var mt = X.create;
var yt = D.create;
var xe = C.create;
var vt = E.create;
var _t = $.create;
var gt = C.createWithPreprocess;
var xt = Q.create;
var kt = /* @__PURE__ */ __name(() => Se().optional(), "kt");
var bt = /* @__PURE__ */ __name(() => Ce().optional(), "bt");
var wt = /* @__PURE__ */ __name(() => Oe().optional(), "wt");
var Tt = { string: (s2) => w.create({ ...s2, coerce: true }), number: (s2) => j.create({ ...s2, coerce: true }), boolean: (s2) => U.create({ ...s2, coerce: true }), bigint: (s2) => R.create({ ...s2, coerce: true }), date: (s2) => M.create({ ...s2, coerce: true }) };
var St = m;
var Ct = Object.freeze({ __proto__: null, defaultErrorMap: oe, setErrorMap: Ee, getErrorMap: de, makeIssue: ue, EMPTY_PATH: Ie, addIssueToContext: u, ParseStatus: k, INVALID: m, DIRTY: be, OK: b, isAborted: ye, isDirty: ve, isValid: le, isAsync: fe, get util() {
  return g;
}, get objectUtil() {
  return me;
}, ZodParsedType: d, getParsedType: P, ZodType: v, ZodString: w, ZodNumber: j, ZodBigInt: R, ZodBoolean: U, ZodDate: M, ZodSymbol: te, ZodUndefined: B, ZodNull: W, ZodAny: z, ZodUnknown: Z, ZodNever: I, ZodVoid: se, ZodArray: S, ZodObject: x, ZodUnion: q, ZodDiscriminatedUnion: re, ZodIntersection: J, ZodTuple: N, ZodRecord: Y, ZodMap: ne, ZodSet: V, ZodFunction: L, ZodLazy: H, ZodLiteral: G, ZodEnum: A, ZodNativeEnum: X, ZodPromise: D, ZodEffects: C, ZodTransformer: C, ZodOptional: E, ZodNullable: $, ZodDefault: K, ZodCatch: ae, ZodNaN: ie, BRAND: Ue, ZodBranded: he, ZodPipeline: Q, custom: Te, Schema: v, ZodSchema: v, late: Be, get ZodFirstPartyTypeKind() {
  return p;
}, coerce: Tt, any: Ke, array: tt, bigint: Je, boolean: Oe, date: Ye, discriminatedUnion: at, effect: xe, enum: pt, function: lt, instanceof: We, intersection: it, lazy: ft, literal: ht, map: dt, nan: qe, nativeEnum: mt, never: Fe, null: Xe, nullable: _t, number: Ce, object: st, oboolean: wt, onumber: bt, optional: vt, ostring: kt, pipeline: xt, preprocess: gt, promise: yt, record: ct, set: ut, strictObject: rt, string: Se, symbol: He, transformer: xe, tuple: ot, undefined: Ge, union: nt, unknown: Qe, void: et, NEVER: St, ZodIssueCode: c, quotelessJson: Ne, ZodError: T });
var DEFAULT_ERROR_MESSAGE = "Bad Request";
var DEFAULT_ERROR_STATUS = 400;
function createErrorResponse(options = {}, error) {
  const statusText = (options == null ? void 0 : options.message) || DEFAULT_ERROR_MESSAGE;
  const status = (options == null ? void 0 : options.status) || DEFAULT_ERROR_STATUS;
  return new Response(error ? stringifyZodError(error) : statusText, { status, statusText });
}
__name(createErrorResponse, "createErrorResponse");
var stringifyZodError = /* @__PURE__ */ __name((error) => {
  return error.issues.map((issue, index) => {
    let msg = `${index + 1}. [${issue.code}] ${issue.message} ${issue.path.join(".")}.`;
    const details = [];
    if ("expected" in issue) {
      details.push(`expected: ${issue.expected}`);
    }
    if ("received" in issue) {
      details.push(`received: ${issue.received}`);
    }
    if ("keys" in issue) {
      details.push(`keys: ${issue.keys.join(", ")}`);
    }
    if ("unionErrors" in issue) {
      details.push(
        "Union Errors:\n" + issue.unionErrors.map(
          (error2, index2) => `${index2 + 1}.`.padEnd(4, " ") + stringifyZodError(error2).split("\n").map((line) => "    " + line).join("\n")
        ).join("\n")
      );
    }
    if ("argumentsError" in issue) {
      details.push("Arguments Error: " + stringifyZodError(issue.argumentsError));
    }
    if ("returnTypeError" in issue) {
      details.push("ReturnTypeError: " + stringifyZodError(issue.returnTypeError));
    }
    if ("validation" in issue) {
      details.push("validation: " + JSON.stringify(issue.validation));
    }
    if ("minimum" in issue) {
      details.push(`minimum: (${issue.type})` + issue.minimum);
    }
    if ("maximum" in issue) {
      details.push(`maximum: (${issue.type})` + issue.maximum);
    }
    if ("multipleOf" in issue) {
      details.push(`multipleOf: ${issue.multipleOf}`);
    }
    if ("options" in issue) {
      details.push(`options: ${issue.options}`);
    }
    if ("params" in issue) {
      details.push(`params: ${JSON.stringify(issue.params, null, 4)}`);
    }
    msg += `
` + details.map((detail, index2) => {
      return detail.split("\n").map((line, lineIndex) => {
        if (lineIndex === 0) {
          return `${index2 + 1}.`.padEnd(4, " ") + line;
        }
        return "    " + line;
      }).join("\n");
    }).join("\n").split("\n").map((line) => "    " + line).join("\n");
    return msg;
  }).join("\n");
}, "stringifyZodError");
var isZodType = /* @__PURE__ */ __name((input) => {
  return typeof input.parse === "function";
}, "isZodType");
function parseQuery(request, schema, options) {
  try {
    const searchParams = isURLSearchParams(request) ? request : getSearchParamsFromRequest(request);
    const params = parseSearchParams(searchParams, options == null ? void 0 : options.parser);
    const finalSchema = isZodType(schema) ? schema : Ct.object(schema);
    return finalSchema.parse(params);
  } catch (error) {
    throw createErrorResponse(options, error instanceof T ? error : void 0);
  }
}
__name(parseQuery, "parseQuery");
var zqObject = /* @__PURE__ */ __name((schema) => {
  return Object.assign(
    (searchParams) => {
      return parseQuery(searchParams, schema, { message: "Invalid Search Params" });
    },
    {
      and(incoming) {
        return zqObject(schema.and(incoming));
      },
      or(option) {
        return zqObject(schema.or(option));
      }
    }
  );
}, "zqObject");
var zq = {
  mmid: () => (
    // z.custom<$MMID>((val) => {
    //   return typeof val === "string" && val.endsWith(".dweb");
    // }),
    Ct.string().transform((val, ctx) => {
      if (val.endsWith(".dweb") === false) {
        ctx.addIssue({
          code: Ct.ZodIssueCode.custom,
          message: `[${ctx.path.join(".")}] invalid mmid `
        });
        return Ct.NEVER;
      }
      return val;
    })
  ),
  url: () => Ct.string().url(),
  string: () => Ct.string(),
  number: (float = true) => Ct.string().transform((val, ctx) => {
    const num = float ? parseFloat(val) : parseInt(val);
    if (isFinite(num)) {
      return num;
    }
    ctx.addIssue({
      code: Ct.ZodIssueCode.custom,
      message: `[${ctx.path.join(".")}] fail to parse to number`
    });
    return Ct.NEVER;
  }),
  boolean: () => Ct.string().transform((val) => /^true$/i.test(val)),
  transform: (transform) => Ct.string().transform(transform),
  object: (shape) => {
    return zqObject(Ct.object(shape));
  }
};
function parseSearchParams(searchParams, customParser) {
  const parser = customParser || parseSearchParamsDefault;
  return parser(searchParams);
}
__name(parseSearchParams, "parseSearchParams");
var parseSearchParamsDefault = /* @__PURE__ */ __name((searchParams) => {
  const values = {};
  searchParams.forEach((value, key) => {
    const currentVal = values[key];
    if (currentVal && Array.isArray(currentVal)) {
      currentVal.push(value);
    } else if (currentVal) {
      values[key] = [currentVal, value];
    } else {
      values[key] = value;
    }
  });
  return values;
}, "parseSearchParamsDefault");
function getSearchParamsFromRequest(request) {
  const url2 = new URL(request.url);
  return url2.searchParams;
}
__name(getSearchParamsFromRequest, "getSearchParamsFromRequest");
function isURLSearchParams(value) {
  return getObjectTypeName(value) === "URLSearchParams";
}
__name(isURLSearchParams, "isURLSearchParams");
function getObjectTypeName(value) {
  return toString.call(value).slice(8, -1);
}
__name(getObjectTypeName, "getObjectTypeName");
function hexaToRGBA(str) {
  return {
    red: parseInt(str.slice(1, 3), 16),
    green: parseInt(str.slice(3, 5), 16),
    blue: parseInt(str.slice(5, 7), 16),
    alpha: parseInt(str.slice(7), 16)
  };
}
__name(hexaToRGBA, "hexaToRGBA");
function colorToHex(color) {
  const rgbaColor = color.alpha === 255 ? [color.red, color.green, color.blue] : [color.red, color.green, color.blue, color.alpha];
  return `#${rgbaColor.map((v7) => (v7 & 255).toString(16).padStart(2, "0")).join("")}`;
}
__name(colorToHex, "colorToHex");
var EMULATOR = "/emulator";
var BASE_URL = new URL(
  new URLSearchParams(location.search).get(
    "X-Plaoc-Internal-Url"
    /* API_INTERNAL_URL */
  ).replace(/^http:/, "ws:").replace(/^https:/, "wss:")
);
BASE_URL.pathname = EMULATOR;
var createMockModuleServerIpc = /* @__PURE__ */ __name((mmid, apiUrl = BASE_URL) => {
  const waitOpenPo = new PromiseOut();
  const wsUrl = new URL(apiUrl);
  wsUrl.searchParams.set("mmid", mmid);
  const ws = new WebSocket(wsUrl);
  ws.binaryType = "arraybuffer";
  ws.onerror = (event) => {
    waitOpenPo.reject(event);
  };
  ws.onopen = () => {
    const serverIpc = new ReadableStreamIpc(
      {
        mmid,
        name: mmid,
        ipc_support_protocols: {
          cbor: false,
          protobuf: false,
          raw: false
        },
        dweb_deeplinks: [],
        categories: []
      },
      "client"
      /* CLIENT */
    );
    waitOpenPo.resolve(serverIpc);
    const proxyStream = new ReadableStreamOut({ highWaterMark: 0 });
    serverIpc.bindIncomeStream(proxyStream.stream);
    ws.onclose = () => {
      proxyStream.controller.close();
      serverIpc.close();
    };
    waitOpenPo.onError((event) => {
      proxyStream.controller.error(event.error);
    });
    ws.onmessage = (event) => {
      try {
        const data = event.data;
        if (typeof data === "string") {
          proxyStream.controller.enqueue(simpleEncoder(data, "utf8"));
        } else if (data instanceof ArrayBuffer) {
          proxyStream.controller.enqueue(new Uint8Array(data));
        } else {
          throw new Error("should not happend");
        }
      } catch (err) {
        console.error(err);
      }
    };
    void streamReadAll(serverIpc.stream, {
      map(chunk) {
        ws.send(chunk);
      },
      complete() {
        ws.close();
      }
    });
  };
  return waitOpenPo.promise;
}, "createMockModuleServerIpc");
var BaseController = class {
  constructor() {
    this._onUpdate = [];
    this._inited = false;
    this._ready = false;
  }
  // Using the Web Animations API
  onUpdate(cb) {
    var _a2;
    (_a2 = this._onUpdate) == null ? void 0 : _a2.push(cb);
    return this;
  }
  // <T>
  emitUpdate() {
    var _a2;
    (_a2 = this._onUpdate) == null ? void 0 : _a2.forEach((callback) => callback(this));
  }
  onInit(cb) {
    if (this._inited) {
      cb(this);
    }
    this._onInit = cb;
    return this;
  }
  emitInit() {
    var _a2;
    if (this._inited) {
      return;
    }
    this._inited = true;
    (_a2 = this._onInit) == null ? void 0 : _a2.call(this, this);
  }
  onReady(cb) {
    if (this._ready) {
      cb(this);
    }
    this._onReady = cb;
    return this;
  }
  emitReady() {
    var _a2;
    if (this._ready) {
      return;
    }
    this._ready = true;
    (_a2 = this._onReady) == null ? void 0 : _a2.call(this, this);
  }
};
__name(BaseController, "BaseController");
var BiometricsController = class extends BaseController {
  constructor() {
    super(...arguments);
    this._initer = async () => {
      this.emitInit();
      const ipc = await createMockModuleServerIpc("biometrics.sys.dweb");
      ipc.onFetch(async (event) => {
        const { pathname } = event;
        if (pathname === "/check") {
          return Response.json(true);
        }
        if (pathname === "/biometrics") {
          return Response.json(await this.biometricsMock());
        }
      }).forbidden().cors();
      this.emitReady();
    };
    this.queue = [];
  }
  get state() {
    return this.queue.at(0);
  }
  biometricsMock() {
    const task = new PromiseOut();
    this.queue.push(task);
    this.emitUpdate();
    task.onFinished(() => {
      this.queue = this.queue.filter((t3) => t3 !== task);
      this.emitUpdate();
    });
    return task.promise;
  }
};
__name(BiometricsController, "BiometricsController");
var g2 = Symbol("@ts-pattern/matcher");
var T2 = Symbol("@ts-pattern/isVariadic");
var I2 = "@ts-pattern/anonymous-select-key";
var A2 = /* @__PURE__ */ __name((t3) => !!(t3 && typeof t3 == "object"), "A");
var E2 = /* @__PURE__ */ __name((t3) => t3 && !!t3[g2], "E");
var h2 = /* @__PURE__ */ __name((t3, e2, n2) => {
  if (E2(t3)) {
    let r2 = t3[g2](), { matched: s2, selections: i } = r2.match(e2);
    return s2 && i && Object.keys(i).forEach((a2) => n2(a2, i[a2])), s2;
  }
  if (A2(t3)) {
    if (!A2(e2))
      return false;
    if (Array.isArray(t3)) {
      if (!Array.isArray(e2))
        return false;
      let r2 = [], s2 = [], i = [];
      for (let a2 of t3.keys()) {
        let u4 = t3[a2];
        E2(u4) && u4[T2] ? i.push(u4) : i.length ? s2.push(u4) : r2.push(u4);
      }
      if (i.length) {
        if (i.length > 1)
          throw new Error("Pattern error: Using `...P.array(...)` several times in a single pattern is not allowed.");
        if (e2.length < r2.length + s2.length)
          return false;
        let a2 = e2.slice(0, r2.length), u4 = s2.length === 0 ? [] : e2.slice(-s2.length), v7 = e2.slice(r2.length, s2.length === 0 ? 1 / 0 : -s2.length);
        return r2.every((b5, O5) => h2(b5, a2[O5], n2)) && s2.every((b5, O5) => h2(b5, u4[O5], n2)) && (i.length === 0 || h2(i[0], v7, n2));
      }
      return t3.length === e2.length && t3.every((a2, u4) => h2(a2, e2[u4], n2));
    }
    return Object.keys(t3).every((r2) => {
      let s2 = t3[r2];
      return (r2 in e2 || E2(i = s2) && i[g2]().matcherType === "optional") && h2(s2, e2[r2], n2);
      var i;
    });
  }
  return Object.is(e2, t3);
}, "h");
var f = /* @__PURE__ */ __name((t3) => {
  var e2, n2, r2;
  return A2(t3) ? E2(t3) ? (e2 = (n2 = (r2 = t3[g2]()).getSelectionKeys) == null ? void 0 : n2.call(r2)) != null ? e2 : [] : Array.isArray(t3) ? j2(t3, f) : j2(Object.values(t3), f) : [];
}, "f");
var j2 = /* @__PURE__ */ __name((t3, e2) => t3.reduce((n2, r2) => n2.concat(e2(r2)), []), "j");
function l(t3) {
  return Object.assign(t3, { optional: () => P2(t3), and: (e2) => o(t3, e2), or: (e2) => W2(t3, e2), select: (e2) => e2 === void 0 ? B2(t3) : B2(e2, t3) });
}
__name(l, "l");
function P2(t3) {
  return l({ [g2]: () => ({ match: (e2) => {
    let n2 = {}, r2 = /* @__PURE__ */ __name((s2, i) => {
      n2[s2] = i;
    }, "r");
    return e2 === void 0 ? (f(t3).forEach((s2) => r2(s2, void 0)), { matched: true, selections: n2 }) : { matched: h2(t3, e2, r2), selections: n2 };
  }, getSelectionKeys: () => f(t3), matcherType: "optional" }) });
}
__name(P2, "P");
function o(...t3) {
  return l({ [g2]: () => ({ match: (e2) => {
    let n2 = {}, r2 = /* @__PURE__ */ __name((s2, i) => {
      n2[s2] = i;
    }, "r");
    return { matched: t3.every((s2) => h2(s2, e2, r2)), selections: n2 };
  }, getSelectionKeys: () => j2(t3, f), matcherType: "and" }) });
}
__name(o, "o");
function W2(...t3) {
  return l({ [g2]: () => ({ match: (e2) => {
    let n2 = {}, r2 = /* @__PURE__ */ __name((s2, i) => {
      n2[s2] = i;
    }, "r");
    return j2(t3, f).forEach((s2) => r2(s2, void 0)), { matched: t3.some((s2) => h2(s2, e2, r2)), selections: n2 };
  }, getSelectionKeys: () => j2(t3, f), matcherType: "or" }) });
}
__name(W2, "W");
function c2(t3) {
  return { [g2]: () => ({ match: (e2) => ({ matched: !!t3(e2) }) }) };
}
__name(c2, "c");
function B2(...t3) {
  let e2 = typeof t3[0] == "string" ? t3[0] : void 0, n2 = t3.length === 2 ? t3[1] : typeof t3[0] == "string" ? void 0 : t3[0];
  return l({ [g2]: () => ({ match: (r2) => {
    let s2 = { [e2 ?? I2]: r2 };
    return { matched: n2 === void 0 || h2(n2, r2, (i, a2) => {
      s2[i] = a2;
    }), selections: s2 };
  }, getSelectionKeys: () => [e2 ?? I2].concat(n2 === void 0 ? [] : f(n2)) }) });
}
__name(B2, "B");
function y2(t3) {
  return typeof t3 == "number";
}
__name(y2, "y");
function w2(t3) {
  return typeof t3 == "string";
}
__name(w2, "w");
function d2(t3) {
  return typeof t3 == "bigint";
}
__name(d2, "d");
l(c2(function(t3) {
  return true;
}));
var S2 = /* @__PURE__ */ __name((t3) => Object.assign(l(t3), { startsWith: (e2) => {
  return S2(o(t3, (n2 = e2, c2((r2) => w2(r2) && r2.startsWith(n2)))));
  var n2;
}, endsWith: (e2) => {
  return S2(o(t3, (n2 = e2, c2((r2) => w2(r2) && r2.endsWith(n2)))));
  var n2;
}, minLength: (e2) => S2(o(t3, ((n2) => c2((r2) => w2(r2) && r2.length >= n2))(e2))), maxLength: (e2) => S2(o(t3, ((n2) => c2((r2) => w2(r2) && r2.length <= n2))(e2))), includes: (e2) => {
  return S2(o(t3, (n2 = e2, c2((r2) => w2(r2) && r2.includes(n2)))));
  var n2;
}, regex: (e2) => {
  return S2(o(t3, (n2 = e2, c2((r2) => w2(r2) && !!r2.match(n2)))));
  var n2;
} }), "S");
S2(c2(w2));
var N2 = /* @__PURE__ */ __name((t3, e2) => c2((n2) => y2(n2) && t3 <= n2 && e2 >= n2), "N");
var _ = /* @__PURE__ */ __name((t3) => c2((e2) => y2(e2) && e2 < t3), "_");
var $2 = /* @__PURE__ */ __name((t3) => c2((e2) => y2(e2) && e2 > t3), "$");
var z2 = /* @__PURE__ */ __name((t3) => c2((e2) => y2(e2) && e2 <= t3), "z");
var L2 = /* @__PURE__ */ __name((t3) => c2((e2) => y2(e2) && e2 >= t3), "L");
var F = /* @__PURE__ */ __name(() => c2((t3) => y2(t3) && Number.isInteger(t3)), "F");
var J2 = /* @__PURE__ */ __name(() => c2((t3) => y2(t3) && Number.isFinite(t3)), "J");
var U2 = /* @__PURE__ */ __name(() => c2((t3) => y2(t3) && t3 > 0), "U");
var V2 = /* @__PURE__ */ __name(() => c2((t3) => y2(t3) && t3 < 0), "V");
var m2 = /* @__PURE__ */ __name((t3) => Object.assign(l(t3), { between: (e2, n2) => m2(o(t3, N2(e2, n2))), lt: (e2) => m2(o(t3, _(e2))), gt: (e2) => m2(o(t3, $2(e2))), lte: (e2) => m2(o(t3, z2(e2))), gte: (e2) => m2(o(t3, L2(e2))), int: () => m2(o(t3, F())), finite: () => m2(o(t3, J2())), positive: () => m2(o(t3, U2())), negative: () => m2(o(t3, V2())) }), "m");
m2(c2(y2));
var q2 = /* @__PURE__ */ __name((t3, e2) => c2((n2) => d2(n2) && t3 <= n2 && e2 >= n2), "q");
var C2 = /* @__PURE__ */ __name((t3) => c2((e2) => d2(e2) && e2 < t3), "C");
var D2 = /* @__PURE__ */ __name((t3) => c2((e2) => d2(e2) && e2 > t3), "D");
var G2 = /* @__PURE__ */ __name((t3) => c2((e2) => d2(e2) && e2 <= t3), "G");
var H2 = /* @__PURE__ */ __name((t3) => c2((e2) => d2(e2) && e2 >= t3), "H");
var Q2 = /* @__PURE__ */ __name(() => c2((t3) => d2(t3) && t3 > 0), "Q");
var R2 = /* @__PURE__ */ __name(() => c2((t3) => d2(t3) && t3 < 0), "R");
var p2 = /* @__PURE__ */ __name((t3) => Object.assign(l(t3), { between: (e2, n2) => p2(o(t3, q2(e2, n2))), lt: (e2) => p2(o(t3, C2(e2))), gt: (e2) => p2(o(t3, D2(e2))), lte: (e2) => p2(o(t3, G2(e2))), gte: (e2) => p2(o(t3, H2(e2))), positive: () => p2(o(t3, Q2())), negative: () => p2(o(t3, R2())) }), "p");
p2(c2(d2));
l(c2(function(t3) {
  return typeof t3 == "boolean";
}));
l(c2(function(t3) {
  return typeof t3 == "symbol";
}));
l(c2(function(t3) {
  return t3 == null;
}));
function at2(t3) {
  return new x2(t3);
}
__name(at2, "at");
var K2 = { matched: false, value: void 0 };
var x2 = /* @__PURE__ */ __name(class t {
  constructor(e2, n2 = K2) {
    this.input = void 0, this.state = void 0, this.input = e2, this.state = n2;
  }
  with(...e2) {
    if (this.state.matched)
      return this;
    let n2 = e2[e2.length - 1], r2 = [e2[0]], s2 = [];
    e2.length === 3 && typeof e2[1] == "function" ? (r2.push(e2[0]), s2.push(e2[1])) : e2.length > 2 && r2.push(...e2.slice(1, e2.length - 1));
    let i = {}, a2 = r2.some((u4) => h2(u4, this.input, (v7, b5) => {
      i[v7] = b5;
    })) && s2.every((u4) => u4(this.input)) ? { matched: true, value: n2(Object.keys(i).length ? I2 in i ? i[I2] : i : this.input, this.input) } : K2;
    return new t(this.input, a2);
  }
  when(e2, n2) {
    if (this.state.matched)
      return this;
    let r2 = !!e2(this.input);
    return new t(this.input, r2 ? { matched: true, value: n2(this.input, this.input) } : K2);
  }
  otherwise(e2) {
    return this.state.matched ? this.state.value : e2(this.input);
  }
  exhaustive() {
    return this.run();
  }
  run() {
    if (this.state.matched)
      return this.state.value;
    let e2;
    try {
      e2 = JSON.stringify(this.input);
    } catch {
      e2 = this.input;
    }
    throw new Error(`Pattern matching error: no pattern matches value ${e2}`);
  }
  returnType() {
    return this;
  }
}, "t");
var StateObservable = class {
  constructor(getStateJson) {
    this.getStateJson = getStateJson;
    this._observerIpcMap = /* @__PURE__ */ new Map();
    this._changeSignal = createSignal();
    this._observe = (cb) => this._changeSignal.listen(cb);
    this._controllersMap = /* @__PURE__ */ new Map();
  }
  startObserve(ipc, controller) {
    this._controllersMap.set(ipc, controller);
    mapHelper.getOrPut(this._observerIpcMap, ipc, () => {
      return this._observe(() => {
        controller == null ? void 0 : controller.enqueue(simpleEncoder(this.getStateJson() + "\n", "utf8"));
      });
    });
  }
  notifyObserver() {
    this._changeSignal.emit();
  }
  stopObserve(ipc) {
    var _a2;
    const controller = this._controllersMap.get(ipc);
    if (controller === void 0)
      throw new Error(`controller === undefined`);
    controller.close();
    this._controllersMap.delete(ipc);
    return (_a2 = mapHelper.getAndRemove(this._observerIpcMap, ipc)) == null ? void 0 : _a2.apply(void 0);
  }
};
__name(StateObservable, "StateObservable");
var StatusBarController = class extends BaseController {
  constructor() {
    super(...arguments);
    this._initer = async () => {
      this.emitInit();
      const ipc = await createMockModuleServerIpc("status-bar.nativeui.browser.dweb");
      const query_state = Ct.object({
        color: zq.transform((color) => colorToHex(JSON.parse(color))).optional(),
        style: Ct.enum(["DARK", "LIGHT", "DEFAULT"]).optional(),
        overlay: zq.boolean().optional(),
        visible: zq.boolean().optional()
      });
      ipc.onFetch(async (event) => {
        return at2(event).with({ pathname: "/getState" }, () => {
          const state = this.statusBarGetState();
          return Response.json(state);
        }).with({ pathname: "/setState" }, () => {
          const states = parseQuery(event.searchParams, query_state);
          this.statusBarSetState(states);
          return Response.json(null);
        }).with({ pathname: "/observe" }, () => {
          const readableStream = new ReadableStream({
            start: (controller) => {
              this.observer.startObserve(ipc, controller);
            },
            pull() {
            },
            cancel() {
            }
          });
          return new Response(readableStream, {
            status: 200,
            statusText: "ok",
            headers: new Headers({ "Content-Type": "application/octet-stream" })
          });
        }).with({ pathname: "/stopObserve" }, () => {
          this.observer.stopObserve(ipc);
          return Response.json("");
        }).run();
      }).forbidden().cors();
      this.emitReady();
    };
    this.observer = new StateObservable(() => {
      return JSON.stringify(this.statusBarGetState());
    });
    this.state = {
      color: "#FFFFFF80",
      style: "DEFAULT",
      insets: {
        top: 38,
        right: 0,
        bottom: 0,
        left: 0
      },
      overlay: false,
      visible: true
    };
  }
  emitUpdate() {
    this.observer.notifyObserver();
    super.emitUpdate();
  }
  statusBarSetState(state) {
    this.state = {
      ...this.state,
      /// 这边这样做的目的是移除undefined值
      ...JSON.parse(JSON.stringify(state))
    };
    this.emitUpdate();
  }
  statusBarSetStyle(style2) {
    this.state = {
      ...this.state,
      style: style2
    };
    this.emitUpdate();
  }
  statusBarSetBackground(color) {
    this.state = {
      ...this.state,
      color
    };
    this.emitUpdate();
  }
  statusBarSetOverlay(overlay) {
    this.state = {
      ...this.state,
      overlay
    };
    this.emitUpdate();
  }
  statusBarSetVisible(visible) {
    this.state = {
      ...this.state,
      visible
    };
    this.emitUpdate();
  }
  statusBarGetState() {
    return {
      ...this.state,
      color: hexaToRGBA(this.state.color)
    };
  }
};
__name(StatusBarController, "StatusBarController");
var ToastController = class extends BaseController {
  constructor(show) {
    super();
    this.show = show;
    this._initer = async () => {
      this.emitInit();
      const ipc = await createMockModuleServerIpc("toast.nativeui.browser.dweb");
      ipc.onFetch(async (event) => {
        return at2(event).with({ pathname: "/show" }, () => {
          const message = event.searchParams.get("message");
          const duration = event.searchParams.get("duration");
          const position3 = event.searchParams.get("position");
          if (message === null)
            throw new Error(`message === null`);
          if (duration === null)
            throw new Error(`duration === null`);
          if (position3 === null)
            throw new Error(`position === null`);
          this.show(message, duration, position3);
          return Response.json(null);
        }).run();
      }).forbidden().cors();
      this.emitReady();
    };
  }
  emitUpdate() {
    super.emitUpdate();
  }
};
__name(ToastController, "ToastController");
var HapticsController = class extends BaseController {
  constructor() {
    super(...arguments);
    this._initer = async () => {
      this.emitInit();
      const ipc = await createMockModuleServerIpc("haptics.sys.dweb");
      const query_state = Ct.object({
        // type: zq.string().optional(),
        duration: zq.string().optional(),
        style: zq.string().optional()
      });
      ipc.onFetch((event) => {
        const { pathname, searchParams } = event;
        const state = parseQuery(searchParams, query_state);
        this.hapticsMock(JSON.stringify({ pathname, state }));
        return Response.json(true);
      }).forbidden().cors();
      this.emitReady();
    };
  }
  hapticsMock(text) {
    console.log("hapticsMock", text);
    this.emitUpdate();
  }
};
__name(HapticsController, "HapticsController");
var NavigationBarController = class extends BaseController {
  constructor() {
    super(...arguments);
    this._initer = async () => {
      this.emitInit();
      const ipc = await createMockModuleServerIpc("navigation-bar.nativeui.browser.dweb");
      const query_state = Ct.object({
        color: zq.transform((color) => colorToHex(JSON.parse(color))).optional(),
        style: Ct.enum(["DARK", "LIGHT", "DEFAULT"]).optional(),
        overlay: zq.boolean().optional(),
        visible: zq.boolean().optional()
      });
      ipc.onFetch(async (event) => {
        return at2(event).with({ pathname: "/getState" }, () => {
          const state = this.navigationBarGetState();
          return Response.json(state);
        }).with({ pathname: "/setState" }, () => {
          const states = parseQuery(event.searchParams, query_state);
          this.navigationBarSetState(states);
          return Response.json(null);
        }).with({ pathname: "/observe" }, () => {
          const readableStream = new ReadableStream({
            start: (controller) => {
              this.observer.startObserve(ipc, controller);
            },
            pull() {
            },
            cancel() {
            }
          });
          return new Response(readableStream, {
            status: 200,
            statusText: "ok",
            headers: new Headers({ "Content-Type": "application/octet-stream" })
          });
        }).with({ pathname: "/stopObserve" }, () => {
          this.observer.stopObserve(ipc);
          return Response.json("");
        }).run();
      }).forbidden().cors();
      this.emitReady();
    };
    this.observer = new StateObservable(() => {
      return JSON.stringify(this.navigationBarGetState());
    });
    this.state = {
      color: "#FFFFFFFF",
      style: "DEFAULT",
      insets: {
        top: 0,
        right: 0,
        bottom: 26,
        left: 0
      },
      overlay: false,
      visible: true
    };
  }
  emitUpdate() {
    this.observer.notifyObserver();
    super.emitUpdate();
  }
  navigationBarSetState(state) {
    this.state = {
      ...this.state,
      /// 这边这样做的目的是移除undefined值
      ...JSON.parse(JSON.stringify(state))
    };
    this.emitUpdate();
  }
  navigationBarSetStyle(style2) {
    this.state = {
      ...this.state,
      style: style2
    };
    this.emitUpdate();
  }
  navigationBarSetBackground(color) {
    this.state = {
      ...this.state,
      color
    };
    this.emitUpdate();
  }
  navigationBarSetOverlay(overlay) {
    this.state = {
      ...this.state,
      overlay
    };
    this.emitUpdate();
  }
  navigationBarSetVisible(visible) {
    this.state = {
      ...this.state,
      visible
    };
    this.emitUpdate();
  }
  navigationBarGetState() {
    return {
      ...this.state,
      color: hexaToRGBA(this.state.color)
    };
  }
};
__name(NavigationBarController, "NavigationBarController");
function getButtomBarState(navigationBarState, isShowVirtualKeyboard, virtualKeyboardState) {
  return {
    visible: isShowVirtualKeyboard ? virtualKeyboardState.visible : navigationBarState.visible,
    overlay: isShowVirtualKeyboard ? virtualKeyboardState.overlay : navigationBarState.overlay,
    insets: isShowVirtualKeyboard ? virtualKeyboardState.insets : navigationBarState.insets
  };
}
__name(getButtomBarState, "getButtomBarState");
var SafeAreaController = class extends BaseController {
  constructor() {
    super(...arguments);
    this._initer = async () => {
      this.emitInit();
      const ipc = await createMockModuleServerIpc("safe-area.nativeui.browser.dweb");
      const query_state = Ct.object({
        overlay: zq.boolean()
      });
      ipc.onFetch(async (event) => {
        return at2(event).with({ pathname: "/getState" }, () => {
          return Response.json(this.state);
        }).with({ pathname: "/setState" }, () => {
          const states = parseQuery(event.searchParams, query_state);
          this.safeAreaSetOverlay(states.overlay);
          return Response.json(null);
        }).with({ pathname: "/observe" }, () => {
          const readableStream = new ReadableStream({
            start: (controller) => {
              this.observer.startObserve(ipc, controller);
            },
            pull() {
            },
            cancel() {
            }
          });
          return new Response(readableStream, {
            status: 200,
            statusText: "ok",
            headers: new Headers({ "Content-Type": "application/octet-stream" })
          });
        }).with({ pathname: "/stopObserve" }, () => {
          this.observer.stopObserve(ipc);
          return Response.json("");
        }).run();
      }).forbidden().cors();
      this.emitReady();
    };
    this.observer = new StateObservable(() => {
      return JSON.stringify(this.state);
    });
    this.state = {
      overlay: false,
      insets: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      },
      cutoutInsets: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      },
      // 外部尺寸
      outerInsets: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      }
    };
    this.safgeAreaUpdateState = (statusBarState, navigationBarState, virtualKeyboardState, isShowVirtualKeyboard) => {
      const bottomBarState = getButtomBarState(navigationBarState, isShowVirtualKeyboard, virtualKeyboardState);
      this.state = {
        overlay: statusBarState.overlay && bottomBarState.overlay,
        insets: {
          left: 0,
          top: statusBarState.overlay ? statusBarState.insets.top : 0,
          right: 0,
          bottom: bottomBarState.overlay ? bottomBarState.insets.bottom : 0
        },
        cutoutInsets: {
          left: 0,
          top: statusBarState.insets.top,
          right: 0,
          bottom: 0
        },
        // 外部尺寸
        outerInsets: {
          left: 0,
          top: statusBarState.overlay ? 0 : statusBarState.insets.top,
          right: 0,
          bottom: bottomBarState.overlay ? 0 : bottomBarState.insets.bottom
        }
      };
      this.observer.notifyObserver();
      return this.state;
    };
    this.safeAreaSetOverlay = (overlay) => {
      this.state.overlay = overlay;
      this.emitUpdate();
    };
  }
  emitUpdate() {
    this.observer.notifyObserver();
    super.emitUpdate();
  }
};
__name(SafeAreaController, "SafeAreaController");
var ShareController = class extends BaseController {
  constructor(share) {
    super();
    this.share = share;
    this._initer = async () => {
      this.emitInit();
      const ipc = await createMockModuleServerIpc("share.sys.dweb");
      ipc.onFetch(async (event) => {
        return at2(event).with({ method: "POST", pathname: "/share" }, async () => {
          const title = event.searchParams.get("title");
          const text = event.searchParams.get("text");
          const url2 = event.searchParams.get("url");
          const body = await event.arrayBuffer();
          const bodyType = event.headers.get("Content-Type");
          const options = {
            title: title ? title : "",
            text: text ? text : "",
            link: url2 ? url2 : "",
            src: "",
            body: new Uint8Array(body),
            bodyType: bodyType ? bodyType : ""
          };
          this.share(options);
          return Response.json(true);
        }).run();
      }).forbidden().cors();
      this.emitReady();
    };
  }
  emitUpdate() {
    super.emitUpdate();
  }
};
__name(ShareController, "ShareController");
var TorchController = class extends BaseController {
  constructor() {
    super(...arguments);
    this._initer = async () => {
      this.emitInit();
      const ipc = await createMockModuleServerIpc("torch.nativeui.browser.dweb");
      ipc.onFetch(async (event) => {
        const { pathname } = event;
        if (pathname === "/toggleTorch") {
          this.torchToggleTorch();
          return Response.json(true);
        }
        if (pathname === "/state") {
          return Response.json(this.state.isOpen);
        }
      }).forbidden().cors();
      this.emitReady();
    };
    this.state = { isOpen: false };
  }
  torchToggleTorch() {
    this.state = {
      isOpen: !this.state.isOpen
    };
    this.emitUpdate();
    return this.state.isOpen;
  }
};
__name(TorchController, "TorchController");
var VirtualKeyboardController = class extends BaseController {
  constructor() {
    super(...arguments);
    this._initer = async () => {
      this.emitInit();
      const ipc = await createMockModuleServerIpc("virtual-keyboard.nativeui.browser.dweb");
      const query_state = Ct.object({
        overlay: zq.boolean().optional(),
        visible: zq.boolean().optional()
      });
      ipc.onFetch(async (event) => {
        return at2(event).with({ pathname: "/getState" }, () => {
          return Response.json(this.state);
        }).with({ pathname: "/setState" }, (event2) => {
          const states = parseQuery(event2.searchParams, query_state);
          this.virtualKeyboardSeVisiable(states.visible === true ? true : false);
          this.virtualKeyboardSetOverlay(states.overlay);
          return Response.json(true);
        }).with({ pathname: "/observe" }, () => {
          const readableStream = new ReadableStream({
            start: (controller) => {
              this.observer.startObserve(ipc, controller);
            },
            pull() {
            },
            cancel() {
            }
          });
          return new Response(readableStream, {
            status: 200,
            statusText: "ok",
            headers: new Headers({ "Content-Type": "application/octet-stream" })
          });
        }).with({ pathname: "/stopObserve" }, () => {
          this.observer.stopObserve(ipc);
          return Response.json("");
        }).run();
      }).forbidden().cors();
      this.emitReady();
    };
    this.observer = new StateObservable(() => {
      return JSON.stringify(this.state);
    });
    this.emitUpdate = () => {
      this.observer.notifyObserver();
      super.emitUpdate();
    };
    this.isShowVirtualKeyboard = false;
    this.state = {
      insets: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      overlay: false,
      visible: false
    };
    this.virtualKeyboardSetOverlay = (overlay = true) => {
      this.state = {
        ...this.state,
        overlay
      };
      this.emitUpdate();
    };
    this.virtualKeyboardSeVisiable = (visible = true) => {
      this.state = {
        ...this.state,
        visible
      };
      visible ? this.isShowVirtualKeyboard = visible : "";
      this.emitUpdate();
    };
    this.virtualKeyboardFirstUpdated = (e2) => {
      this.state.insets.bottom = this.getHeightByEvent(e2);
      this.state.visible = true;
      this.emitUpdate();
    };
    this.virtualKeyboardHideCompleted = (e2) => {
      this.isShowVirtualKeyboard = false;
      this.state.insets.bottom = this.getHeightByEvent(e2);
      this.state.visible = false;
      this.emitUpdate();
    };
    this.virtualKeyboardShowCompleted = (e2) => {
      this.state.insets.bottom = this.getHeightByEvent(e2);
      this.state.visible = true;
      this.emitUpdate();
    };
    this.getHeightByEvent = (e2) => {
      const virtualKeyboardEl = e2.target;
      if (virtualKeyboardEl === null)
        throw new Error("vitualKeyboardEl === null");
      const rect = virtualKeyboardEl.getBoundingClientRect();
      return Math.ceil(rect.height);
    };
  }
};
__name(VirtualKeyboardController, "VirtualKeyboardController");
var l2 = window;
var c3 = l2.ShadowRoot && (l2.ShadyCSS === void 0 || l2.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var u2 = Symbol();
var E3 = /* @__PURE__ */ new WeakMap();
var h3 = /* @__PURE__ */ __name(class {
  constructor(t3, e2, s2) {
    if (this._$cssResult$ = true, s2 !== u2)
      throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t3, this.t = e2;
  }
  get styleSheet() {
    let t3 = this.o, e2 = this.t;
    if (c3 && t3 === void 0) {
      let s2 = e2 !== void 0 && e2.length === 1;
      s2 && (t3 = E3.get(e2)), t3 === void 0 && ((this.o = t3 = new CSSStyleSheet()).replaceSync(this.cssText), s2 && E3.set(e2, t3));
    }
    return t3;
  }
  toString() {
    return this.cssText;
  }
}, "h");
var _2 = /* @__PURE__ */ __name((r2) => new h3(typeof r2 == "string" ? r2 : r2 + "", void 0, u2), "_");
var C3 = /* @__PURE__ */ __name((r2, ...t3) => {
  let e2 = r2.length === 1 ? r2[0] : t3.reduce((s2, i, o2) => s2 + ((n2) => {
    if (n2._$cssResult$ === true)
      return n2.cssText;
    if (typeof n2 == "number")
      return n2;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n2 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + r2[o2 + 1], r2[0]);
  return new h3(e2, r2, u2);
}, "C");
var v2 = /* @__PURE__ */ __name((r2, t3) => {
  c3 ? r2.adoptedStyleSheets = t3.map((e2) => e2 instanceof CSSStyleSheet ? e2 : e2.styleSheet) : t3.forEach((e2) => {
    let s2 = document.createElement("style"), i = l2.litNonce;
    i !== void 0 && s2.setAttribute("nonce", i), s2.textContent = e2.cssText, r2.appendChild(s2);
  });
}, "v");
var d3 = c3 ? (r2) => r2 : (r2) => r2 instanceof CSSStyleSheet ? ((t3) => {
  let e2 = "";
  for (let s2 of t3.cssRules)
    e2 += s2.cssText;
  return _2(e2);
})(r2) : r2;
var S3;
var p3 = window;
var $3 = p3.trustedTypes;
var w3 = $3 ? $3.emptyScript : "";
var m3 = p3.reactiveElementPolyfillSupport;
var y3 = { toAttribute(r2, t3) {
  switch (t3) {
    case Boolean:
      r2 = r2 ? w3 : null;
      break;
    case Object:
    case Array:
      r2 = r2 == null ? r2 : JSON.stringify(r2);
  }
  return r2;
}, fromAttribute(r2, t3) {
  let e2 = r2;
  switch (t3) {
    case Boolean:
      e2 = r2 !== null;
      break;
    case Number:
      e2 = r2 === null ? null : Number(r2);
      break;
    case Object:
    case Array:
      try {
        e2 = JSON.parse(r2);
      } catch {
        e2 = null;
      }
  }
  return e2;
} };
var b2 = /* @__PURE__ */ __name((r2, t3) => t3 !== r2 && (t3 == t3 || r2 == r2), "b");
var f2 = { attribute: true, type: String, converter: y3, reflect: false, hasChanged: b2 };
var a = /* @__PURE__ */ __name(class extends HTMLElement {
  constructor() {
    super(), this._$Ei = /* @__PURE__ */ new Map(), this.isUpdatePending = false, this.hasUpdated = false, this._$El = null, this.u();
  }
  static addInitializer(t3) {
    var e2;
    this.finalize(), ((e2 = this.h) !== null && e2 !== void 0 ? e2 : this.h = []).push(t3);
  }
  static get observedAttributes() {
    this.finalize();
    let t3 = [];
    return this.elementProperties.forEach((e2, s2) => {
      let i = this._$Ep(s2, e2);
      i !== void 0 && (this._$Ev.set(i, s2), t3.push(i));
    }), t3;
  }
  static createProperty(t3, e2 = f2) {
    if (e2.state && (e2.attribute = false), this.finalize(), this.elementProperties.set(t3, e2), !e2.noAccessor && !this.prototype.hasOwnProperty(t3)) {
      let s2 = typeof t3 == "symbol" ? Symbol() : "__" + t3, i = this.getPropertyDescriptor(t3, s2, e2);
      i !== void 0 && Object.defineProperty(this.prototype, t3, i);
    }
  }
  static getPropertyDescriptor(t3, e2, s2) {
    return { get() {
      return this[e2];
    }, set(i) {
      let o2 = this[t3];
      this[e2] = i, this.requestUpdate(t3, o2, s2);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t3) {
    return this.elementProperties.get(t3) || f2;
  }
  static finalize() {
    if (this.hasOwnProperty("finalized"))
      return false;
    this.finalized = true;
    let t3 = Object.getPrototypeOf(this);
    if (t3.finalize(), t3.h !== void 0 && (this.h = [...t3.h]), this.elementProperties = new Map(t3.elementProperties), this._$Ev = /* @__PURE__ */ new Map(), this.hasOwnProperty("properties")) {
      let e2 = this.properties, s2 = [...Object.getOwnPropertyNames(e2), ...Object.getOwnPropertySymbols(e2)];
      for (let i of s2)
        this.createProperty(i, e2[i]);
    }
    return this.elementStyles = this.finalizeStyles(this.styles), true;
  }
  static finalizeStyles(t3) {
    let e2 = [];
    if (Array.isArray(t3)) {
      let s2 = new Set(t3.flat(1 / 0).reverse());
      for (let i of s2)
        e2.unshift(d3(i));
    } else
      t3 !== void 0 && e2.push(d3(t3));
    return e2;
  }
  static _$Ep(t3, e2) {
    let s2 = e2.attribute;
    return s2 === false ? void 0 : typeof s2 == "string" ? s2 : typeof t3 == "string" ? t3.toLowerCase() : void 0;
  }
  u() {
    var t3;
    this._$E_ = new Promise((e2) => this.enableUpdating = e2), this._$AL = /* @__PURE__ */ new Map(), this._$Eg(), this.requestUpdate(), (t3 = this.constructor.h) === null || t3 === void 0 || t3.forEach((e2) => e2(this));
  }
  addController(t3) {
    var e2, s2;
    ((e2 = this._$ES) !== null && e2 !== void 0 ? e2 : this._$ES = []).push(t3), this.renderRoot !== void 0 && this.isConnected && ((s2 = t3.hostConnected) === null || s2 === void 0 || s2.call(t3));
  }
  removeController(t3) {
    var e2;
    (e2 = this._$ES) === null || e2 === void 0 || e2.splice(this._$ES.indexOf(t3) >>> 0, 1);
  }
  _$Eg() {
    this.constructor.elementProperties.forEach((t3, e2) => {
      this.hasOwnProperty(e2) && (this._$Ei.set(e2, this[e2]), delete this[e2]);
    });
  }
  createRenderRoot() {
    var t3;
    let e2 = (t3 = this.shadowRoot) !== null && t3 !== void 0 ? t3 : this.attachShadow(this.constructor.shadowRootOptions);
    return v2(e2, this.constructor.elementStyles), e2;
  }
  connectedCallback() {
    var t3;
    this.renderRoot === void 0 && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), (t3 = this._$ES) === null || t3 === void 0 || t3.forEach((e2) => {
      var s2;
      return (s2 = e2.hostConnected) === null || s2 === void 0 ? void 0 : s2.call(e2);
    });
  }
  enableUpdating(t3) {
  }
  disconnectedCallback() {
    var t3;
    (t3 = this._$ES) === null || t3 === void 0 || t3.forEach((e2) => {
      var s2;
      return (s2 = e2.hostDisconnected) === null || s2 === void 0 ? void 0 : s2.call(e2);
    });
  }
  attributeChangedCallback(t3, e2, s2) {
    this._$AK(t3, s2);
  }
  _$EO(t3, e2, s2 = f2) {
    var i;
    let o2 = this.constructor._$Ep(t3, s2);
    if (o2 !== void 0 && s2.reflect === true) {
      let n2 = (((i = s2.converter) === null || i === void 0 ? void 0 : i.toAttribute) !== void 0 ? s2.converter : y3).toAttribute(e2, s2.type);
      this._$El = t3, n2 == null ? this.removeAttribute(o2) : this.setAttribute(o2, n2), this._$El = null;
    }
  }
  _$AK(t3, e2) {
    var s2;
    let i = this.constructor, o2 = i._$Ev.get(t3);
    if (o2 !== void 0 && this._$El !== o2) {
      let n2 = i.getPropertyOptions(o2), g7 = typeof n2.converter == "function" ? { fromAttribute: n2.converter } : ((s2 = n2.converter) === null || s2 === void 0 ? void 0 : s2.fromAttribute) !== void 0 ? n2.converter : y3;
      this._$El = o2, this[o2] = g7.fromAttribute(e2, n2.type), this._$El = null;
    }
  }
  requestUpdate(t3, e2, s2) {
    let i = true;
    t3 !== void 0 && (((s2 = s2 || this.constructor.getPropertyOptions(t3)).hasChanged || b2)(this[t3], e2) ? (this._$AL.has(t3) || this._$AL.set(t3, e2), s2.reflect === true && this._$El !== t3 && (this._$EC === void 0 && (this._$EC = /* @__PURE__ */ new Map()), this._$EC.set(t3, s2))) : i = false), !this.isUpdatePending && i && (this._$E_ = this._$Ej());
  }
  async _$Ej() {
    this.isUpdatePending = true;
    try {
      await this._$E_;
    } catch (e2) {
      Promise.reject(e2);
    }
    let t3 = this.scheduleUpdate();
    return t3 != null && await t3, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var t3;
    if (!this.isUpdatePending)
      return;
    this.hasUpdated, this._$Ei && (this._$Ei.forEach((i, o2) => this[o2] = i), this._$Ei = void 0);
    let e2 = false, s2 = this._$AL;
    try {
      e2 = this.shouldUpdate(s2), e2 ? (this.willUpdate(s2), (t3 = this._$ES) === null || t3 === void 0 || t3.forEach((i) => {
        var o2;
        return (o2 = i.hostUpdate) === null || o2 === void 0 ? void 0 : o2.call(i);
      }), this.update(s2)) : this._$Ek();
    } catch (i) {
      throw e2 = false, this._$Ek(), i;
    }
    e2 && this._$AE(s2);
  }
  willUpdate(t3) {
  }
  _$AE(t3) {
    var e2;
    (e2 = this._$ES) === null || e2 === void 0 || e2.forEach((s2) => {
      var i;
      return (i = s2.hostUpdated) === null || i === void 0 ? void 0 : i.call(s2);
    }), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t3)), this.updated(t3);
  }
  _$Ek() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$E_;
  }
  shouldUpdate(t3) {
    return true;
  }
  update(t3) {
    this._$EC !== void 0 && (this._$EC.forEach((e2, s2) => this._$EO(s2, this[s2], e2)), this._$EC = void 0), this._$Ek();
  }
  updated(t3) {
  }
  firstUpdated(t3) {
  }
}, "a");
a.finalized = true, a.elementProperties = /* @__PURE__ */ new Map(), a.elementStyles = [], a.shadowRootOptions = { mode: "open" }, m3 == null ? void 0 : m3({ ReactiveElement: a }), ((S3 = p3.reactiveElementVersions) !== null && S3 !== void 0 ? S3 : p3.reactiveElementVersions = []).push("1.6.1");
var R3;
var S4 = window;
var x3 = S4.trustedTypes;
var D3 = x3 ? x3.createPolicy("lit-html", { createHTML: (h4) => h4 }) : void 0;
var E4 = "$lit$";
var _3 = `lit$${(Math.random() + "").slice(9)}$`;
var k2 = "?" + _3;
var X2 = `<${k2}>`;
var m4 = document;
var C4 = /* @__PURE__ */ __name(() => m4.createComment(""), "C");
var b3 = /* @__PURE__ */ __name((h4) => h4 === null || typeof h4 != "object" && typeof h4 != "function", "b");
var q3 = Array.isArray;
var G3 = /* @__PURE__ */ __name((h4) => q3(h4) || typeof (h4 == null ? void 0 : h4[Symbol.iterator]) == "function", "G");
var j3 = `[ 	
\f\r]`;
var N3 = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var W3 = /-->/g;
var O2 = />/g;
var p4 = RegExp(`>|${j3}(?:([^\\s"'>=/]+)(${j3}*=${j3}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var V3 = /'/g;
var Z2 = /"/g;
var J3 = /^(?:script|style|textarea|title)$/i;
var K3 = /* @__PURE__ */ __name((h4) => (t3, ...e2) => ({ _$litType$: h4, strings: t3, values: e2 }), "K");
var tt2 = K3(1);
K3(2);
var w4 = Symbol.for("lit-noChange");
var A3 = Symbol.for("lit-nothing");
var z3 = /* @__PURE__ */ new WeakMap();
var g3 = m4.createTreeWalker(m4, 129, null, false);
var Q3 = /* @__PURE__ */ __name((h4, t3) => {
  let e2 = h4.length - 1, i = [], s2, o2 = t3 === 2 ? "<svg>" : "", n2 = N3;
  for (let l4 = 0; l4 < e2; l4++) {
    let r2 = h4[l4], u4, $5, d6 = -1, c7 = 0;
    for (; c7 < r2.length && (n2.lastIndex = c7, $5 = n2.exec(r2), $5 !== null); )
      c7 = n2.lastIndex, n2 === N3 ? $5[1] === "!--" ? n2 = W3 : $5[1] !== void 0 ? n2 = O2 : $5[2] !== void 0 ? (J3.test($5[2]) && (s2 = RegExp("</" + $5[2], "g")), n2 = p4) : $5[3] !== void 0 && (n2 = p4) : n2 === p4 ? $5[0] === ">" ? (n2 = s2 ?? N3, d6 = -1) : $5[1] === void 0 ? d6 = -2 : (d6 = n2.lastIndex - $5[2].length, u4 = $5[1], n2 = $5[3] === void 0 ? p4 : $5[3] === '"' ? Z2 : V3) : n2 === Z2 || n2 === V3 ? n2 = p4 : n2 === W3 || n2 === O2 ? n2 = N3 : (n2 = p4, s2 = void 0);
    let T6 = n2 === p4 && h4[l4 + 1].startsWith("/>") ? " " : "";
    o2 += n2 === N3 ? r2 + X2 : d6 >= 0 ? (i.push(u4), r2.slice(0, d6) + E4 + r2.slice(d6) + _3 + T6) : r2 + _3 + (d6 === -2 ? (i.push(void 0), l4) : T6);
  }
  let a2 = o2 + (h4[e2] || "<?>") + (t3 === 2 ? "</svg>" : "");
  if (!Array.isArray(h4) || !h4.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return [D3 !== void 0 ? D3.createHTML(a2) : a2, i];
}, "Q");
var f3 = /* @__PURE__ */ __name(class {
  constructor({ strings: t3, _$litType$: e2 }, i) {
    let s2;
    this.parts = [];
    let o2 = 0, n2 = 0, a2 = t3.length - 1, l4 = this.parts, [r2, u4] = Q3(t3, e2);
    if (this.el = f3.createElement(r2, i), g3.currentNode = this.el.content, e2 === 2) {
      let $5 = this.el.content, d6 = $5.firstChild;
      d6.remove(), $5.append(...d6.childNodes);
    }
    for (; (s2 = g3.nextNode()) !== null && l4.length < a2; ) {
      if (s2.nodeType === 1) {
        if (s2.hasAttributes()) {
          let $5 = [];
          for (let d6 of s2.getAttributeNames())
            if (d6.endsWith(E4) || d6.startsWith(_3)) {
              let c7 = u4[n2++];
              if ($5.push(d6), c7 !== void 0) {
                let T6 = s2.getAttribute(c7.toLowerCase() + E4).split(_3), M6 = /([.?@])?(.*)/.exec(c7);
                l4.push({ type: 1, index: o2, name: M6[2], strings: T6, ctor: M6[1] === "." ? B3 : M6[1] === "?" ? P3 : M6[1] === "@" ? U3 : H3 });
              } else
                l4.push({ type: 6, index: o2 });
            }
          for (let d6 of $5)
            s2.removeAttribute(d6);
        }
        if (J3.test(s2.tagName)) {
          let $5 = s2.textContent.split(_3), d6 = $5.length - 1;
          if (d6 > 0) {
            s2.textContent = x3 ? x3.emptyScript : "";
            for (let c7 = 0; c7 < d6; c7++)
              s2.append($5[c7], C4()), g3.nextNode(), l4.push({ type: 2, index: ++o2 });
            s2.append($5[d6], C4());
          }
        }
      } else if (s2.nodeType === 8)
        if (s2.data === k2)
          l4.push({ type: 2, index: o2 });
        else {
          let $5 = -1;
          for (; ($5 = s2.data.indexOf(_3, $5 + 1)) !== -1; )
            l4.push({ type: 7, index: o2 }), $5 += _3.length - 1;
        }
      o2++;
    }
  }
  static createElement(t3, e2) {
    let i = m4.createElement("template");
    return i.innerHTML = t3, i;
  }
}, "f");
function y4(h4, t3, e2 = h4, i) {
  var s2, o2, n2, a2;
  if (t3 === w4)
    return t3;
  let l4 = i !== void 0 ? (s2 = e2._$Co) === null || s2 === void 0 ? void 0 : s2[i] : e2._$Cl, r2 = b3(t3) ? void 0 : t3._$litDirective$;
  return (l4 == null ? void 0 : l4.constructor) !== r2 && ((o2 = l4 == null ? void 0 : l4._$AO) === null || o2 === void 0 || o2.call(l4, false), r2 === void 0 ? l4 = void 0 : (l4 = new r2(h4), l4._$AT(h4, e2, i)), i !== void 0 ? ((n2 = (a2 = e2)._$Co) !== null && n2 !== void 0 ? n2 : a2._$Co = [])[i] = l4 : e2._$Cl = l4), l4 !== void 0 && (t3 = y4(h4, l4._$AS(h4, t3.values), l4, i)), t3;
}
__name(y4, "y");
var I3 = /* @__PURE__ */ __name(class {
  constructor(t3, e2) {
    this._$AV = [], this._$AN = void 0, this._$AD = t3, this._$AM = e2;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t3) {
    var e2;
    let { el: { content: i }, parts: s2 } = this._$AD, o2 = ((e2 = t3 == null ? void 0 : t3.creationScope) !== null && e2 !== void 0 ? e2 : m4).importNode(i, true);
    g3.currentNode = o2;
    let n2 = g3.nextNode(), a2 = 0, l4 = 0, r2 = s2[0];
    for (; r2 !== void 0; ) {
      if (a2 === r2.index) {
        let u4;
        r2.type === 2 ? u4 = new v3(n2, n2.nextSibling, this, t3) : r2.type === 1 ? u4 = new r2.ctor(n2, r2.name, r2.strings, this, t3) : r2.type === 6 && (u4 = new L3(n2, this, t3)), this._$AV.push(u4), r2 = s2[++l4];
      }
      a2 !== (r2 == null ? void 0 : r2.index) && (n2 = g3.nextNode(), a2++);
    }
    return g3.currentNode = m4, o2;
  }
  v(t3) {
    let e2 = 0;
    for (let i of this._$AV)
      i !== void 0 && (i.strings !== void 0 ? (i._$AI(t3, i, e2), e2 += i.strings.length - 2) : i._$AI(t3[e2])), e2++;
  }
}, "I");
var v3 = /* @__PURE__ */ __name(class {
  constructor(t3, e2, i, s2) {
    var o2;
    this.type = 2, this._$AH = A3, this._$AN = void 0, this._$AA = t3, this._$AB = e2, this._$AM = i, this.options = s2, this._$Cp = (o2 = s2 == null ? void 0 : s2.isConnected) === null || o2 === void 0 || o2;
  }
  get _$AU() {
    var t3, e2;
    return (e2 = (t3 = this._$AM) === null || t3 === void 0 ? void 0 : t3._$AU) !== null && e2 !== void 0 ? e2 : this._$Cp;
  }
  get parentNode() {
    let t3 = this._$AA.parentNode, e2 = this._$AM;
    return e2 !== void 0 && (t3 == null ? void 0 : t3.nodeType) === 11 && (t3 = e2.parentNode), t3;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t3, e2 = this) {
    t3 = y4(this, t3, e2), b3(t3) ? t3 === A3 || t3 == null || t3 === "" ? (this._$AH !== A3 && this._$AR(), this._$AH = A3) : t3 !== this._$AH && t3 !== w4 && this._(t3) : t3._$litType$ !== void 0 ? this.g(t3) : t3.nodeType !== void 0 ? this.$(t3) : G3(t3) ? this.T(t3) : this._(t3);
  }
  k(t3) {
    return this._$AA.parentNode.insertBefore(t3, this._$AB);
  }
  $(t3) {
    this._$AH !== t3 && (this._$AR(), this._$AH = this.k(t3));
  }
  _(t3) {
    this._$AH !== A3 && b3(this._$AH) ? this._$AA.nextSibling.data = t3 : this.$(m4.createTextNode(t3)), this._$AH = t3;
  }
  g(t3) {
    var e2;
    let { values: i, _$litType$: s2 } = t3, o2 = typeof s2 == "number" ? this._$AC(t3) : (s2.el === void 0 && (s2.el = f3.createElement(s2.h, this.options)), s2);
    if (((e2 = this._$AH) === null || e2 === void 0 ? void 0 : e2._$AD) === o2)
      this._$AH.v(i);
    else {
      let n2 = new I3(o2, this), a2 = n2.u(this.options);
      n2.v(i), this.$(a2), this._$AH = n2;
    }
  }
  _$AC(t3) {
    let e2 = z3.get(t3.strings);
    return e2 === void 0 && z3.set(t3.strings, e2 = new f3(t3)), e2;
  }
  T(t3) {
    q3(this._$AH) || (this._$AH = [], this._$AR());
    let e2 = this._$AH, i, s2 = 0;
    for (let o2 of t3)
      s2 === e2.length ? e2.push(i = new v3(this.k(C4()), this.k(C4()), this, this.options)) : i = e2[s2], i._$AI(o2), s2++;
    s2 < e2.length && (this._$AR(i && i._$AB.nextSibling, s2), e2.length = s2);
  }
  _$AR(t3 = this._$AA.nextSibling, e2) {
    var i;
    for ((i = this._$AP) === null || i === void 0 || i.call(this, false, true, e2); t3 && t3 !== this._$AB; ) {
      let s2 = t3.nextSibling;
      t3.remove(), t3 = s2;
    }
  }
  setConnected(t3) {
    var e2;
    this._$AM === void 0 && (this._$Cp = t3, (e2 = this._$AP) === null || e2 === void 0 || e2.call(this, t3));
  }
}, "v");
var H3 = /* @__PURE__ */ __name(class {
  constructor(t3, e2, i, s2, o2) {
    this.type = 1, this._$AH = A3, this._$AN = void 0, this.element = t3, this.name = e2, this._$AM = s2, this.options = o2, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = A3;
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3, e2 = this, i, s2) {
    let o2 = this.strings, n2 = false;
    if (o2 === void 0)
      t3 = y4(this, t3, e2, 0), n2 = !b3(t3) || t3 !== this._$AH && t3 !== w4, n2 && (this._$AH = t3);
    else {
      let a2 = t3, l4, r2;
      for (t3 = o2[0], l4 = 0; l4 < o2.length - 1; l4++)
        r2 = y4(this, a2[i + l4], e2, l4), r2 === w4 && (r2 = this._$AH[l4]), n2 || (n2 = !b3(r2) || r2 !== this._$AH[l4]), r2 === A3 ? t3 = A3 : t3 !== A3 && (t3 += (r2 ?? "") + o2[l4 + 1]), this._$AH[l4] = r2;
    }
    n2 && !s2 && this.j(t3);
  }
  j(t3) {
    t3 === A3 ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 ?? "");
  }
}, "H");
var B3 = /* @__PURE__ */ __name(class extends H3 {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t3) {
    this.element[this.name] = t3 === A3 ? void 0 : t3;
  }
}, "B");
var Y2 = x3 ? x3.emptyScript : "";
var P3 = /* @__PURE__ */ __name(class extends H3 {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t3) {
    t3 && t3 !== A3 ? this.element.setAttribute(this.name, Y2) : this.element.removeAttribute(this.name);
  }
}, "P");
var U3 = /* @__PURE__ */ __name(class extends H3 {
  constructor(t3, e2, i, s2, o2) {
    super(t3, e2, i, s2, o2), this.type = 5;
  }
  _$AI(t3, e2 = this) {
    var i;
    if ((t3 = (i = y4(this, t3, e2, 0)) !== null && i !== void 0 ? i : A3) === w4)
      return;
    let s2 = this._$AH, o2 = t3 === A3 && s2 !== A3 || t3.capture !== s2.capture || t3.once !== s2.once || t3.passive !== s2.passive, n2 = t3 !== A3 && (s2 === A3 || o2);
    o2 && this.element.removeEventListener(this.name, this, s2), n2 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
  }
  handleEvent(t3) {
    var e2, i;
    typeof this._$AH == "function" ? this._$AH.call((i = (e2 = this.options) === null || e2 === void 0 ? void 0 : e2.host) !== null && i !== void 0 ? i : this.element, t3) : this._$AH.handleEvent(t3);
  }
}, "U");
var L3 = /* @__PURE__ */ __name(class {
  constructor(t3, e2, i) {
    this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = e2, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3) {
    y4(this, t3);
  }
}, "L");
var F2 = S4.litHtmlPolyfillSupport;
F2 == null ? void 0 : F2(f3, v3), ((R3 = S4.litHtmlVersions) !== null && R3 !== void 0 ? R3 : S4.litHtmlVersions = []).push("2.7.4");
var st3 = /* @__PURE__ */ __name((h4, t3, e2) => {
  var i, s2;
  let o2 = (i = e2 == null ? void 0 : e2.renderBefore) !== null && i !== void 0 ? i : t3, n2 = o2._$litPart$;
  if (n2 === void 0) {
    let a2 = (s2 = e2 == null ? void 0 : e2.renderBefore) !== null && s2 !== void 0 ? s2 : null;
    o2._$litPart$ = n2 = new v3(t3.insertBefore(C4(), a2), a2, void 0, e2 ?? {});
  }
  return n2._$AI(h4), n2;
}, "st");
var r;
var s;
var n = /* @__PURE__ */ __name(class extends a {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var e2, t3;
    let i = super.createRenderRoot();
    return (e2 = (t3 = this.renderOptions).renderBefore) !== null && e2 !== void 0 || (t3.renderBefore = i.firstChild), i;
  }
  update(e2) {
    let t3 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e2), this._$Do = st3(t3, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e2;
    super.connectedCallback(), (e2 = this._$Do) === null || e2 === void 0 || e2.setConnected(true);
  }
  disconnectedCallback() {
    var e2;
    super.disconnectedCallback(), (e2 = this._$Do) === null || e2 === void 0 || e2.setConnected(false);
  }
  render() {
    return w4;
  }
}, "n");
n.finalized = true, n._$litElement$ = true, (r = globalThis.litElementHydrateSupport) === null || r === void 0 || r.call(globalThis, { LitElement: n });
var l3 = globalThis.litElementPolyfillSupport;
l3 == null ? void 0 : l3({ LitElement: n });
((s = globalThis.litElementVersions) !== null && s !== void 0 ? s : globalThis.litElementVersions = []).push("3.3.2");
var c4 = /* @__PURE__ */ __name((s2) => (t3) => typeof t3 == "function" ? ((n2, e2) => (customElements.define(n2, e2), e2))(s2, t3) : ((n2, e2) => {
  let { kind: m8, elements: o2 } = e2;
  return { kind: m8, elements: o2, finisher(i) {
    customElements.define(n2, i);
  } };
})(s2, t3), "c");
var c5 = /* @__PURE__ */ __name((t3, i) => i.kind === "method" && i.descriptor && !("value" in i.descriptor) ? { ...i, finisher(r2) {
  r2.createProperty(i.key, t3);
} } : { kind: "field", key: Symbol(), placement: "own", descriptor: {}, originalKey: i.key, initializer() {
  typeof i.initializer == "function" && (this[i.key] = i.initializer.call(this));
}, finisher(r2) {
  r2.createProperty(i.key, t3);
} }, "c");
function y5(t3) {
  return (i, r2) => r2 !== void 0 ? ((e2, o2, n2) => {
    o2.constructor.createProperty(n2, e2);
  })(t3, i, r2) : c5(t3, i);
}
__name(y5, "y");
var p5 = /* @__PURE__ */ __name((t3, r2) => r2.kind === "method" && r2.descriptor && !("value" in r2.descriptor) ? { ...r2, finisher(i) {
  i.createProperty(r2.key, t3);
} } : { kind: "field", key: Symbol(), placement: "own", descriptor: {}, originalKey: r2.key, initializer() {
  typeof r2.initializer == "function" && (this[r2.key] = r2.initializer.call(this));
}, finisher(i) {
  i.createProperty(r2.key, t3);
} }, "p");
function e(t3) {
  return (r2, i) => i !== void 0 ? ((o2, n2, a2) => {
    n2.constructor.createProperty(a2, o2);
  })(t3, r2, i) : p5(t3, r2);
}
__name(e, "e");
function y6(t3) {
  return e({ ...t3, state: true });
}
__name(y6, "y");
var d4 = /* @__PURE__ */ __name(({ finisher: o2, descriptor: i }) => (t3, n2) => {
  var r2;
  if (n2 === void 0) {
    let e2 = (r2 = t3.originalKey) !== null && r2 !== void 0 ? r2 : t3.key, l4 = i != null ? { kind: "method", placement: "prototype", key: e2, descriptor: i(t3.key) } : { ...t3, key: e2 };
    return o2 != null && (l4.finisher = function(c7) {
      o2(c7, e2);
    }), l4;
  }
  {
    let e2 = t3.constructor;
    i !== void 0 && Object.defineProperty(t3, n2, i(n2)), o2 == null ? void 0 : o2(e2, n2);
  }
}, "d");
function y7(o2, i) {
  return d4({ descriptor: (t3) => {
    let n2 = { get() {
      var r2, e2;
      return (e2 = (r2 = this.renderRoot) === null || r2 === void 0 ? void 0 : r2.querySelector(o2)) !== null && e2 !== void 0 ? e2 : null;
    }, enumerable: true, configurable: true };
    if (i) {
      let r2 = typeof t3 == "symbol" ? Symbol() : "__" + t3;
      n2.get = function() {
        var e2, l4;
        return this[r2] === void 0 && (this[r2] = (l4 = (e2 = this.renderRoot) === null || e2 === void 0 ? void 0 : e2.querySelector(o2)) !== null && l4 !== void 0 ? l4 : null), this[r2];
      };
    }
    return n2;
  } });
}
__name(y7, "y");
var d5;
((d5 = window.HTMLSlotElement) === null || d5 === void 0 ? void 0 : d5.prototype.assignedElements) != null ? (e2, t3) => e2.assignedElements(t3) : (e2, t3) => e2.assignedNodes(t3).filter((o2) => o2.nodeType === Node.ELEMENT_NODE);
var c6;
((c6 = window.HTMLSlotElement) === null || c6 === void 0 ? void 0 : c6.prototype.assignedElements) != null ? (e2, t3) => e2.assignedElements(t3) : (e2, t3) => e2.assignedNodes(t3).filter((o2) => o2.nodeType === Node.ELEMENT_NODE);
var I4;
var w5 = window;
var y9 = w5.trustedTypes;
var O3 = y9 ? y9.createPolicy("lit-html", { createHTML: (r2) => r2 }) : void 0;
var U4 = "$lit$";
var v4 = `lit$${(Math.random() + "").slice(9)}$`;
var Y3 = "?" + v4;
var X3 = `<${Y3}>`;
var g4 = document;
var M3 = /* @__PURE__ */ __name(() => g4.createComment(""), "M");
var C5 = /* @__PURE__ */ __name((r2) => r2 === null || typeof r2 != "object" && typeof r2 != "function", "C");
var q4 = Array.isArray;
var tt3 = /* @__PURE__ */ __name((r2) => q4(r2) || typeof (r2 == null ? void 0 : r2[Symbol.iterator]) == "function", "tt");
var B4 = `[ 	
\f\r]`;
var N4 = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var k3 = /-->/g;
var V4 = />/g;
var _4 = RegExp(`>|${B4}(?:([^\\s"'>=/]+)(${B4}*=${B4}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var W4 = /'/g;
var Z3 = /"/g;
var G4 = /^(?:script|style|textarea|title)$/i;
var J4 = /* @__PURE__ */ __name((r2) => (t3, ...e2) => ({ _$litType$: r2, strings: t3, values: e2 }), "J");
J4(1);
J4(2);
var m5 = Symbol.for("lit-noChange");
var $4 = Symbol.for("lit-nothing");
var z4 = /* @__PURE__ */ new WeakMap();
var p7 = g4.createTreeWalker(g4, 129, null, false);
var et4 = /* @__PURE__ */ __name((r2, t3) => {
  let e2 = r2.length - 1, i = [], s2, n2 = t3 === 2 ? "<svg>" : "", o2 = N4;
  for (let l4 = 0; l4 < e2; l4++) {
    let h4 = r2[l4], A4, a2, d6 = -1, u4 = 0;
    for (; u4 < h4.length && (o2.lastIndex = u4, a2 = o2.exec(h4), a2 !== null); )
      u4 = o2.lastIndex, o2 === N4 ? a2[1] === "!--" ? o2 = k3 : a2[1] !== void 0 ? o2 = V4 : a2[2] !== void 0 ? (G4.test(a2[2]) && (s2 = RegExp("</" + a2[2], "g")), o2 = _4) : a2[3] !== void 0 && (o2 = _4) : o2 === _4 ? a2[0] === ">" ? (o2 = s2 ?? N4, d6 = -1) : a2[1] === void 0 ? d6 = -2 : (d6 = o2.lastIndex - a2[2].length, A4 = a2[1], o2 = a2[3] === void 0 ? _4 : a2[3] === '"' ? Z3 : W4) : o2 === Z3 || o2 === W4 ? o2 = _4 : o2 === k3 || o2 === V4 ? o2 = N4 : (o2 = _4, s2 = void 0);
    let b5 = o2 === _4 && r2[l4 + 1].startsWith("/>") ? " " : "";
    n2 += o2 === N4 ? h4 + X3 : d6 >= 0 ? (i.push(A4), h4.slice(0, d6) + U4 + h4.slice(d6) + v4 + b5) : h4 + v4 + (d6 === -2 ? (i.push(void 0), l4) : b5);
  }
  let c7 = n2 + (r2[e2] || "<?>") + (t3 === 2 ? "</svg>" : "");
  if (!Array.isArray(r2) || !r2.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return [O3 !== void 0 ? O3.createHTML(c7) : c7, i];
}, "et");
var f4 = /* @__PURE__ */ __name(class {
  constructor({ strings: t3, _$litType$: e2 }, i) {
    let s2;
    this.parts = [];
    let n2 = 0, o2 = 0, c7 = t3.length - 1, l4 = this.parts, [h4, A4] = et4(t3, e2);
    if (this.el = f4.createElement(h4, i), p7.currentNode = this.el.content, e2 === 2) {
      let a2 = this.el.content, d6 = a2.firstChild;
      d6.remove(), a2.append(...d6.childNodes);
    }
    for (; (s2 = p7.nextNode()) !== null && l4.length < c7; ) {
      if (s2.nodeType === 1) {
        if (s2.hasAttributes()) {
          let a2 = [];
          for (let d6 of s2.getAttributeNames())
            if (d6.endsWith(U4) || d6.startsWith(v4)) {
              let u4 = A4[o2++];
              if (a2.push(d6), u4 !== void 0) {
                let b5 = s2.getAttribute(u4.toLowerCase() + U4).split(v4), E6 = /([.?@])?(.*)/.exec(u4);
                l4.push({ type: 1, index: n2, name: E6[2], strings: b5, ctor: E6[1] === "." ? R4 : E6[1] === "?" ? L4 : E6[1] === "@" ? j4 : T3 });
              } else
                l4.push({ type: 6, index: n2 });
            }
          for (let d6 of a2)
            s2.removeAttribute(d6);
        }
        if (G4.test(s2.tagName)) {
          let a2 = s2.textContent.split(v4), d6 = a2.length - 1;
          if (d6 > 0) {
            s2.textContent = y9 ? y9.emptyScript : "";
            for (let u4 = 0; u4 < d6; u4++)
              s2.append(a2[u4], M3()), p7.nextNode(), l4.push({ type: 2, index: ++n2 });
            s2.append(a2[d6], M3());
          }
        }
      } else if (s2.nodeType === 8)
        if (s2.data === Y3)
          l4.push({ type: 2, index: n2 });
        else {
          let a2 = -1;
          for (; (a2 = s2.data.indexOf(v4, a2 + 1)) !== -1; )
            l4.push({ type: 7, index: n2 }), a2 += v4.length - 1;
        }
      n2++;
    }
  }
  static createElement(t3, e2) {
    let i = g4.createElement("template");
    return i.innerHTML = t3, i;
  }
}, "f");
function H4(r2, t3, e2 = r2, i) {
  var s2, n2, o2, c7;
  if (t3 === m5)
    return t3;
  let l4 = i !== void 0 ? (s2 = e2._$Co) === null || s2 === void 0 ? void 0 : s2[i] : e2._$Cl, h4 = C5(t3) ? void 0 : t3._$litDirective$;
  return (l4 == null ? void 0 : l4.constructor) !== h4 && ((n2 = l4 == null ? void 0 : l4._$AO) === null || n2 === void 0 || n2.call(l4, false), h4 === void 0 ? l4 = void 0 : (l4 = new h4(r2), l4._$AT(r2, e2, i)), i !== void 0 ? ((o2 = (c7 = e2)._$Co) !== null && o2 !== void 0 ? o2 : c7._$Co = [])[i] = l4 : e2._$Cl = l4), l4 !== void 0 && (t3 = H4(r2, l4._$AS(r2, t3.values), l4, i)), t3;
}
__name(H4, "H");
var P4 = /* @__PURE__ */ __name(class {
  constructor(t3, e2) {
    this._$AV = [], this._$AN = void 0, this._$AD = t3, this._$AM = e2;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t3) {
    var e2;
    let { el: { content: i }, parts: s2 } = this._$AD, n2 = ((e2 = t3 == null ? void 0 : t3.creationScope) !== null && e2 !== void 0 ? e2 : g4).importNode(i, true);
    p7.currentNode = n2;
    let o2 = p7.nextNode(), c7 = 0, l4 = 0, h4 = s2[0];
    for (; h4 !== void 0; ) {
      if (c7 === h4.index) {
        let A4;
        h4.type === 2 ? A4 = new x4(o2, o2.nextSibling, this, t3) : h4.type === 1 ? A4 = new h4.ctor(o2, h4.name, h4.strings, this, t3) : h4.type === 6 && (A4 = new D4(o2, this, t3)), this._$AV.push(A4), h4 = s2[++l4];
      }
      c7 !== (h4 == null ? void 0 : h4.index) && (o2 = p7.nextNode(), c7++);
    }
    return p7.currentNode = g4, n2;
  }
  v(t3) {
    let e2 = 0;
    for (let i of this._$AV)
      i !== void 0 && (i.strings !== void 0 ? (i._$AI(t3, i, e2), e2 += i.strings.length - 2) : i._$AI(t3[e2])), e2++;
  }
}, "P");
var x4 = /* @__PURE__ */ __name(class {
  constructor(t3, e2, i, s2) {
    var n2;
    this.type = 2, this._$AH = $4, this._$AN = void 0, this._$AA = t3, this._$AB = e2, this._$AM = i, this.options = s2, this._$Cp = (n2 = s2 == null ? void 0 : s2.isConnected) === null || n2 === void 0 || n2;
  }
  get _$AU() {
    var t3, e2;
    return (e2 = (t3 = this._$AM) === null || t3 === void 0 ? void 0 : t3._$AU) !== null && e2 !== void 0 ? e2 : this._$Cp;
  }
  get parentNode() {
    let t3 = this._$AA.parentNode, e2 = this._$AM;
    return e2 !== void 0 && (t3 == null ? void 0 : t3.nodeType) === 11 && (t3 = e2.parentNode), t3;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t3, e2 = this) {
    t3 = H4(this, t3, e2), C5(t3) ? t3 === $4 || t3 == null || t3 === "" ? (this._$AH !== $4 && this._$AR(), this._$AH = $4) : t3 !== this._$AH && t3 !== m5 && this._(t3) : t3._$litType$ !== void 0 ? this.g(t3) : t3.nodeType !== void 0 ? this.$(t3) : tt3(t3) ? this.T(t3) : this._(t3);
  }
  k(t3) {
    return this._$AA.parentNode.insertBefore(t3, this._$AB);
  }
  $(t3) {
    this._$AH !== t3 && (this._$AR(), this._$AH = this.k(t3));
  }
  _(t3) {
    this._$AH !== $4 && C5(this._$AH) ? this._$AA.nextSibling.data = t3 : this.$(g4.createTextNode(t3)), this._$AH = t3;
  }
  g(t3) {
    var e2;
    let { values: i, _$litType$: s2 } = t3, n2 = typeof s2 == "number" ? this._$AC(t3) : (s2.el === void 0 && (s2.el = f4.createElement(s2.h, this.options)), s2);
    if (((e2 = this._$AH) === null || e2 === void 0 ? void 0 : e2._$AD) === n2)
      this._$AH.v(i);
    else {
      let o2 = new P4(n2, this), c7 = o2.u(this.options);
      o2.v(i), this.$(c7), this._$AH = o2;
    }
  }
  _$AC(t3) {
    let e2 = z4.get(t3.strings);
    return e2 === void 0 && z4.set(t3.strings, e2 = new f4(t3)), e2;
  }
  T(t3) {
    q4(this._$AH) || (this._$AH = [], this._$AR());
    let e2 = this._$AH, i, s2 = 0;
    for (let n2 of t3)
      s2 === e2.length ? e2.push(i = new x4(this.k(M3()), this.k(M3()), this, this.options)) : i = e2[s2], i._$AI(n2), s2++;
    s2 < e2.length && (this._$AR(i && i._$AB.nextSibling, s2), e2.length = s2);
  }
  _$AR(t3 = this._$AA.nextSibling, e2) {
    var i;
    for ((i = this._$AP) === null || i === void 0 || i.call(this, false, true, e2); t3 && t3 !== this._$AB; ) {
      let s2 = t3.nextSibling;
      t3.remove(), t3 = s2;
    }
  }
  setConnected(t3) {
    var e2;
    this._$AM === void 0 && (this._$Cp = t3, (e2 = this._$AP) === null || e2 === void 0 || e2.call(this, t3));
  }
}, "x");
var T3 = /* @__PURE__ */ __name(class {
  constructor(t3, e2, i, s2, n2) {
    this.type = 1, this._$AH = $4, this._$AN = void 0, this.element = t3, this.name = e2, this._$AM = s2, this.options = n2, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = $4;
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3, e2 = this, i, s2) {
    let n2 = this.strings, o2 = false;
    if (n2 === void 0)
      t3 = H4(this, t3, e2, 0), o2 = !C5(t3) || t3 !== this._$AH && t3 !== m5, o2 && (this._$AH = t3);
    else {
      let c7 = t3, l4, h4;
      for (t3 = n2[0], l4 = 0; l4 < n2.length - 1; l4++)
        h4 = H4(this, c7[i + l4], e2, l4), h4 === m5 && (h4 = this._$AH[l4]), o2 || (o2 = !C5(h4) || h4 !== this._$AH[l4]), h4 === $4 ? t3 = $4 : t3 !== $4 && (t3 += (h4 ?? "") + n2[l4 + 1]), this._$AH[l4] = h4;
    }
    o2 && !s2 && this.j(t3);
  }
  j(t3) {
    t3 === $4 ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 ?? "");
  }
}, "T");
var R4 = /* @__PURE__ */ __name(class extends T3 {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t3) {
    this.element[this.name] = t3 === $4 ? void 0 : t3;
  }
}, "R");
var it3 = y9 ? y9.emptyScript : "";
var L4 = /* @__PURE__ */ __name(class extends T3 {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t3) {
    t3 && t3 !== $4 ? this.element.setAttribute(this.name, it3) : this.element.removeAttribute(this.name);
  }
}, "L");
var j4 = /* @__PURE__ */ __name(class extends T3 {
  constructor(t3, e2, i, s2, n2) {
    super(t3, e2, i, s2, n2), this.type = 5;
  }
  _$AI(t3, e2 = this) {
    var i;
    if ((t3 = (i = H4(this, t3, e2, 0)) !== null && i !== void 0 ? i : $4) === m5)
      return;
    let s2 = this._$AH, n2 = t3 === $4 && s2 !== $4 || t3.capture !== s2.capture || t3.once !== s2.once || t3.passive !== s2.passive, o2 = t3 !== $4 && (s2 === $4 || n2);
    n2 && this.element.removeEventListener(this.name, this, s2), o2 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
  }
  handleEvent(t3) {
    var e2, i;
    typeof this._$AH == "function" ? this._$AH.call((i = (e2 = this.options) === null || e2 === void 0 ? void 0 : e2.host) !== null && i !== void 0 ? i : this.element, t3) : this._$AH.handleEvent(t3);
  }
}, "j");
var D4 = /* @__PURE__ */ __name(class {
  constructor(t3, e2, i) {
    this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = e2, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3) {
    H4(this, t3);
  }
}, "D");
var F3 = w5.litHtmlPolyfillSupport;
F3 == null ? void 0 : F3(f4, x4), ((I4 = w5.litHtmlVersions) !== null && I4 !== void 0 ? I4 : w5.litHtmlVersions = []).push("2.7.4");
var K4 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
var Q4 = /* @__PURE__ */ __name((r2) => (...t3) => ({ _$litDirective$: r2, values: t3 }), "Q");
var S5 = /* @__PURE__ */ __name(class {
  constructor(t3) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t3, e2, i) {
    this._$Ct = t3, this._$AM = e2, this._$Ci = i;
  }
  _$AS(t3, e2) {
    return this.update(t3, e2);
  }
  update(t3, e2) {
    return this.render(...e2);
  }
}, "S");
var at3 = Q4(class extends S5 {
  constructor(r2) {
    var t3;
    if (super(r2), r2.type !== K4.ATTRIBUTE || r2.name !== "class" || ((t3 = r2.strings) === null || t3 === void 0 ? void 0 : t3.length) > 2)
      throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(r2) {
    return " " + Object.keys(r2).filter((t3) => r2[t3]).join(" ") + " ";
  }
  update(r2, [t3]) {
    var e2, i;
    if (this.it === void 0) {
      this.it = /* @__PURE__ */ new Set(), r2.strings !== void 0 && (this.nt = new Set(r2.strings.join(" ").split(/\s/).filter((n2) => n2 !== "")));
      for (let n2 in t3)
        t3[n2] && !(!((e2 = this.nt) === null || e2 === void 0) && e2.has(n2)) && this.it.add(n2);
      return this.render(t3);
    }
    let s2 = r2.element.classList;
    this.it.forEach((n2) => {
      n2 in t3 || (s2.remove(n2), this.it.delete(n2));
    });
    for (let n2 in t3) {
      let o2 = !!t3[n2];
      o2 === this.it.has(n2) || !((i = this.nt) === null || i === void 0) && i.has(n2) || (o2 ? (s2.add(n2), this.it.add(n2)) : (s2.remove(n2), this.it.delete(n2)));
    }
    return m5;
  }
});
var W5;
var S6 = window;
var P5 = S6.trustedTypes;
var G5 = P5 ? P5.createPolicy("lit-html", { createHTML: (n2) => n2 }) : void 0;
var B5 = "$lit$";
var f5 = `lit$${(Math.random() + "").slice(9)}$`;
var z5 = "?" + f5;
var ut2 = `<${z5}>`;
var x5 = document;
var I5 = /* @__PURE__ */ __name(() => x5.createComment(""), "I");
var M4 = /* @__PURE__ */ __name((n2) => n2 === null || typeof n2 != "object" && typeof n2 != "function", "M");
var tt4 = Array.isArray;
var et5 = /* @__PURE__ */ __name((n2) => tt4(n2) || typeof (n2 == null ? void 0 : n2[Symbol.iterator]) == "function", "et");
var Z4 = `[ 	
\f\r]`;
var w6 = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var Q5 = /-->/g;
var Y4 = />/g;
var g5 = RegExp(`>|${Z4}(?:([^\\s"'>=/]+)(${Z4}*=${Z4}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var q5 = /'/g;
var J5 = /"/g;
var it4 = /^(?:script|style|textarea|title)$/i;
var st5 = /* @__PURE__ */ __name((n2) => (t3, ...e2) => ({ _$litType$: n2, strings: t3, values: e2 }), "st");
st5(1);
st5(2);
var H5 = Symbol.for("lit-noChange");
var v5 = Symbol.for("lit-nothing");
var K5 = /* @__PURE__ */ new WeakMap();
var y10 = x5.createTreeWalker(x5, 129, null, false);
var nt4 = /* @__PURE__ */ __name((n2, t3) => {
  let e2 = n2.length - 1, i = [], s2, r2 = t3 === 2 ? "<svg>" : "", o2 = w6;
  for (let h4 = 0; h4 < e2; h4++) {
    let l4 = n2[h4], _6, $5, a2 = -1, u4 = 0;
    for (; u4 < l4.length && (o2.lastIndex = u4, $5 = o2.exec(l4), $5 !== null); )
      u4 = o2.lastIndex, o2 === w6 ? $5[1] === "!--" ? o2 = Q5 : $5[1] !== void 0 ? o2 = Y4 : $5[2] !== void 0 ? (it4.test($5[2]) && (s2 = RegExp("</" + $5[2], "g")), o2 = g5) : $5[3] !== void 0 && (o2 = g5) : o2 === g5 ? $5[0] === ">" ? (o2 = s2 ?? w6, a2 = -1) : $5[1] === void 0 ? a2 = -2 : (a2 = o2.lastIndex - $5[2].length, _6 = $5[1], o2 = $5[3] === void 0 ? g5 : $5[3] === '"' ? J5 : q5) : o2 === J5 || o2 === q5 ? o2 = g5 : o2 === Q5 || o2 === Y4 ? o2 = w6 : (o2 = g5, s2 = void 0);
    let c7 = o2 === g5 && n2[h4 + 1].startsWith("/>") ? " " : "";
    r2 += o2 === w6 ? l4 + ut2 : a2 >= 0 ? (i.push(_6), l4.slice(0, a2) + B5 + l4.slice(a2) + f5 + c7) : l4 + f5 + (a2 === -2 ? (i.push(void 0), h4) : c7);
  }
  let d6 = r2 + (n2[e2] || "<?>") + (t3 === 2 ? "</svg>" : "");
  if (!Array.isArray(n2) || !n2.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return [G5 !== void 0 ? G5.createHTML(d6) : d6, i];
}, "nt");
var T4 = /* @__PURE__ */ __name(class {
  constructor({ strings: t3, _$litType$: e2 }, i) {
    let s2;
    this.parts = [];
    let r2 = 0, o2 = 0, d6 = t3.length - 1, h4 = this.parts, [l4, _6] = nt4(t3, e2);
    if (this.el = T4.createElement(l4, i), y10.currentNode = this.el.content, e2 === 2) {
      let $5 = this.el.content, a2 = $5.firstChild;
      a2.remove(), $5.append(...a2.childNodes);
    }
    for (; (s2 = y10.nextNode()) !== null && h4.length < d6; ) {
      if (s2.nodeType === 1) {
        if (s2.hasAttributes()) {
          let $5 = [];
          for (let a2 of s2.getAttributeNames())
            if (a2.endsWith(B5) || a2.startsWith(f5)) {
              let u4 = _6[o2++];
              if ($5.push(a2), u4 !== void 0) {
                let c7 = s2.getAttribute(u4.toLowerCase() + B5).split(f5), A4 = /([.?@])?(.*)/.exec(u4);
                h4.push({ type: 1, index: r2, name: A4[2], strings: c7, ctor: A4[1] === "." ? U5 : A4[1] === "?" ? D5 : A4[1] === "@" ? L5 : b4 });
              } else
                h4.push({ type: 6, index: r2 });
            }
          for (let a2 of $5)
            s2.removeAttribute(a2);
        }
        if (it4.test(s2.tagName)) {
          let $5 = s2.textContent.split(f5), a2 = $5.length - 1;
          if (a2 > 0) {
            s2.textContent = P5 ? P5.emptyScript : "";
            for (let u4 = 0; u4 < a2; u4++)
              s2.append($5[u4], I5()), y10.nextNode(), h4.push({ type: 2, index: ++r2 });
            s2.append($5[a2], I5());
          }
        }
      } else if (s2.nodeType === 8)
        if (s2.data === z5)
          h4.push({ type: 2, index: r2 });
        else {
          let $5 = -1;
          for (; ($5 = s2.data.indexOf(f5, $5 + 1)) !== -1; )
            h4.push({ type: 7, index: r2 }), $5 += f5.length - 1;
        }
      r2++;
    }
  }
  static createElement(t3, e2) {
    let i = x5.createElement("template");
    return i.innerHTML = t3, i;
  }
}, "T");
function C6(n2, t3, e2 = n2, i) {
  var s2, r2, o2, d6;
  if (t3 === H5)
    return t3;
  let h4 = i !== void 0 ? (s2 = e2._$Co) === null || s2 === void 0 ? void 0 : s2[i] : e2._$Cl, l4 = M4(t3) ? void 0 : t3._$litDirective$;
  return (h4 == null ? void 0 : h4.constructor) !== l4 && ((r2 = h4 == null ? void 0 : h4._$AO) === null || r2 === void 0 || r2.call(h4, false), l4 === void 0 ? h4 = void 0 : (h4 = new l4(n2), h4._$AT(n2, e2, i)), i !== void 0 ? ((o2 = (d6 = e2)._$Co) !== null && o2 !== void 0 ? o2 : d6._$Co = [])[i] = h4 : e2._$Cl = h4), h4 !== void 0 && (t3 = C6(n2, h4._$AS(n2, t3.values), h4, i)), t3;
}
__name(C6, "C");
var R5 = /* @__PURE__ */ __name(class {
  constructor(t3, e2) {
    this._$AV = [], this._$AN = void 0, this._$AD = t3, this._$AM = e2;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t3) {
    var e2;
    let { el: { content: i }, parts: s2 } = this._$AD, r2 = ((e2 = t3 == null ? void 0 : t3.creationScope) !== null && e2 !== void 0 ? e2 : x5).importNode(i, true);
    y10.currentNode = r2;
    let o2 = y10.nextNode(), d6 = 0, h4 = 0, l4 = s2[0];
    for (; l4 !== void 0; ) {
      if (d6 === l4.index) {
        let _6;
        l4.type === 2 ? _6 = new N5(o2, o2.nextSibling, this, t3) : l4.type === 1 ? _6 = new l4.ctor(o2, l4.name, l4.strings, this, t3) : l4.type === 6 && (_6 = new V5(o2, this, t3)), this._$AV.push(_6), l4 = s2[++h4];
      }
      d6 !== (l4 == null ? void 0 : l4.index) && (o2 = y10.nextNode(), d6++);
    }
    return y10.currentNode = x5, r2;
  }
  v(t3) {
    let e2 = 0;
    for (let i of this._$AV)
      i !== void 0 && (i.strings !== void 0 ? (i._$AI(t3, i, e2), e2 += i.strings.length - 2) : i._$AI(t3[e2])), e2++;
  }
}, "R");
var N5 = /* @__PURE__ */ __name(class {
  constructor(t3, e2, i, s2) {
    var r2;
    this.type = 2, this._$AH = v5, this._$AN = void 0, this._$AA = t3, this._$AB = e2, this._$AM = i, this.options = s2, this._$Cp = (r2 = s2 == null ? void 0 : s2.isConnected) === null || r2 === void 0 || r2;
  }
  get _$AU() {
    var t3, e2;
    return (e2 = (t3 = this._$AM) === null || t3 === void 0 ? void 0 : t3._$AU) !== null && e2 !== void 0 ? e2 : this._$Cp;
  }
  get parentNode() {
    let t3 = this._$AA.parentNode, e2 = this._$AM;
    return e2 !== void 0 && (t3 == null ? void 0 : t3.nodeType) === 11 && (t3 = e2.parentNode), t3;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t3, e2 = this) {
    t3 = C6(this, t3, e2), M4(t3) ? t3 === v5 || t3 == null || t3 === "" ? (this._$AH !== v5 && this._$AR(), this._$AH = v5) : t3 !== this._$AH && t3 !== H5 && this._(t3) : t3._$litType$ !== void 0 ? this.g(t3) : t3.nodeType !== void 0 ? this.$(t3) : et5(t3) ? this.T(t3) : this._(t3);
  }
  k(t3) {
    return this._$AA.parentNode.insertBefore(t3, this._$AB);
  }
  $(t3) {
    this._$AH !== t3 && (this._$AR(), this._$AH = this.k(t3));
  }
  _(t3) {
    this._$AH !== v5 && M4(this._$AH) ? this._$AA.nextSibling.data = t3 : this.$(x5.createTextNode(t3)), this._$AH = t3;
  }
  g(t3) {
    var e2;
    let { values: i, _$litType$: s2 } = t3, r2 = typeof s2 == "number" ? this._$AC(t3) : (s2.el === void 0 && (s2.el = T4.createElement(s2.h, this.options)), s2);
    if (((e2 = this._$AH) === null || e2 === void 0 ? void 0 : e2._$AD) === r2)
      this._$AH.v(i);
    else {
      let o2 = new R5(r2, this), d6 = o2.u(this.options);
      o2.v(i), this.$(d6), this._$AH = o2;
    }
  }
  _$AC(t3) {
    let e2 = K5.get(t3.strings);
    return e2 === void 0 && K5.set(t3.strings, e2 = new T4(t3)), e2;
  }
  T(t3) {
    tt4(this._$AH) || (this._$AH = [], this._$AR());
    let e2 = this._$AH, i, s2 = 0;
    for (let r2 of t3)
      s2 === e2.length ? e2.push(i = new N5(this.k(I5()), this.k(I5()), this, this.options)) : i = e2[s2], i._$AI(r2), s2++;
    s2 < e2.length && (this._$AR(i && i._$AB.nextSibling, s2), e2.length = s2);
  }
  _$AR(t3 = this._$AA.nextSibling, e2) {
    var i;
    for ((i = this._$AP) === null || i === void 0 || i.call(this, false, true, e2); t3 && t3 !== this._$AB; ) {
      let s2 = t3.nextSibling;
      t3.remove(), t3 = s2;
    }
  }
  setConnected(t3) {
    var e2;
    this._$AM === void 0 && (this._$Cp = t3, (e2 = this._$AP) === null || e2 === void 0 || e2.call(this, t3));
  }
}, "N");
var b4 = /* @__PURE__ */ __name(class {
  constructor(t3, e2, i, s2, r2) {
    this.type = 1, this._$AH = v5, this._$AN = void 0, this.element = t3, this.name = e2, this._$AM = s2, this.options = r2, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = v5;
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3, e2 = this, i, s2) {
    let r2 = this.strings, o2 = false;
    if (r2 === void 0)
      t3 = C6(this, t3, e2, 0), o2 = !M4(t3) || t3 !== this._$AH && t3 !== H5, o2 && (this._$AH = t3);
    else {
      let d6 = t3, h4, l4;
      for (t3 = r2[0], h4 = 0; h4 < r2.length - 1; h4++)
        l4 = C6(this, d6[i + h4], e2, h4), l4 === H5 && (l4 = this._$AH[h4]), o2 || (o2 = !M4(l4) || l4 !== this._$AH[h4]), l4 === v5 ? t3 = v5 : t3 !== v5 && (t3 += (l4 ?? "") + r2[h4 + 1]), this._$AH[h4] = l4;
    }
    o2 && !s2 && this.j(t3);
  }
  j(t3) {
    t3 === v5 ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 ?? "");
  }
}, "b");
var U5 = /* @__PURE__ */ __name(class extends b4 {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t3) {
    this.element[this.name] = t3 === v5 ? void 0 : t3;
  }
}, "U");
var ct3 = P5 ? P5.emptyScript : "";
var D5 = /* @__PURE__ */ __name(class extends b4 {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t3) {
    t3 && t3 !== v5 ? this.element.setAttribute(this.name, ct3) : this.element.removeAttribute(this.name);
  }
}, "D");
var L5 = /* @__PURE__ */ __name(class extends b4 {
  constructor(t3, e2, i, s2, r2) {
    super(t3, e2, i, s2, r2), this.type = 5;
  }
  _$AI(t3, e2 = this) {
    var i;
    if ((t3 = (i = C6(this, t3, e2, 0)) !== null && i !== void 0 ? i : v5) === H5)
      return;
    let s2 = this._$AH, r2 = t3 === v5 && s2 !== v5 || t3.capture !== s2.capture || t3.once !== s2.once || t3.passive !== s2.passive, o2 = t3 !== v5 && (s2 === v5 || r2);
    r2 && this.element.removeEventListener(this.name, this, s2), o2 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
  }
  handleEvent(t3) {
    var e2, i;
    typeof this._$AH == "function" ? this._$AH.call((i = (e2 = this.options) === null || e2 === void 0 ? void 0 : e2.host) !== null && i !== void 0 ? i : this.element, t3) : this._$AH.handleEvent(t3);
  }
}, "L");
var V5 = /* @__PURE__ */ __name(class {
  constructor(t3, e2, i) {
    this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = e2, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3) {
    C6(this, t3);
  }
}, "V");
var ot2 = { O: B5, P: f5, A: z5, C: 1, M: nt4, L: R5, D: et5, R: C6, I: N5, V: b4, H: D5, N: L5, U: U5, F: V5 };
var X4 = S6.litHtmlPolyfillSupport;
X4 == null ? void 0 : X4(T4, N5), ((W5 = S6.litHtmlVersions) !== null && W5 !== void 0 ? W5 : S6.litHtmlVersions = []).push("2.7.4");
var rt3 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
var lt2 = /* @__PURE__ */ __name((n2) => (...t3) => ({ _$litDirective$: n2, values: t3 }), "lt");
var j5 = /* @__PURE__ */ __name(class {
  constructor(t3) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t3, e2, i) {
    this._$Ct = t3, this._$AM = e2, this._$Ci = i;
  }
  _$AS(t3, e2) {
    return this.update(t3, e2);
  }
  update(t3, e2) {
    return this.render(...e2);
  }
}, "j");
var { I: At } = ot2;
var ht2 = /* @__PURE__ */ __name(() => document.createComment(""), "ht");
var E5 = /* @__PURE__ */ __name((n2, t3, e2) => {
  var i;
  let s2 = n2._$AA.parentNode, r2 = t3 === void 0 ? n2._$AB : t3._$AA;
  if (e2 === void 0) {
    let o2 = s2.insertBefore(ht2(), r2), d6 = s2.insertBefore(ht2(), r2);
    e2 = new At(o2, d6, n2, n2.options);
  } else {
    let o2 = e2._$AB.nextSibling, d6 = e2._$AM, h4 = d6 !== n2;
    if (h4) {
      let l4;
      (i = e2._$AQ) === null || i === void 0 || i.call(e2, n2), e2._$AM = n2, e2._$AP !== void 0 && (l4 = n2._$AU) !== d6._$AU && e2._$AP(l4);
    }
    if (o2 !== r2 || h4) {
      let l4 = e2._$AA;
      for (; l4 !== o2; ) {
        let _6 = l4.nextSibling;
        s2.insertBefore(l4, r2), l4 = _6;
      }
    }
  }
  return e2;
}, "E");
var m6 = /* @__PURE__ */ __name((n2, t3, e2 = n2) => (n2._$AI(t3, e2), n2), "m");
var vt2 = {};
var at4 = /* @__PURE__ */ __name((n2, t3 = vt2) => n2._$AH = t3, "at");
var dt2 = /* @__PURE__ */ __name((n2) => n2._$AH, "dt");
var k4 = /* @__PURE__ */ __name((n2) => {
  var t3;
  (t3 = n2._$AP) === null || t3 === void 0 || t3.call(n2, false, true);
  let e2 = n2._$AA, i = n2._$AB.nextSibling;
  for (; e2 !== i; ) {
    let s2 = e2.nextSibling;
    e2.remove(), e2 = s2;
  }
}, "k");
var $t = /* @__PURE__ */ __name((n2, t3, e2) => {
  let i = /* @__PURE__ */ new Map();
  for (let s2 = t3; s2 <= e2; s2++)
    i.set(n2[s2], s2);
  return i;
}, "$t");
var Ct2 = lt2(class extends j5 {
  constructor(n2) {
    if (super(n2), n2.type !== rt3.CHILD)
      throw Error("repeat() can only be used in text expressions");
  }
  dt(n2, t3, e2) {
    let i;
    e2 === void 0 ? e2 = t3 : t3 !== void 0 && (i = t3);
    let s2 = [], r2 = [], o2 = 0;
    for (let d6 of n2)
      s2[o2] = i ? i(d6, o2) : o2, r2[o2] = e2(d6, o2), o2++;
    return { values: r2, keys: s2 };
  }
  render(n2, t3, e2) {
    return this.dt(n2, t3, e2).values;
  }
  update(n2, [t3, e2, i]) {
    var s2;
    let r2 = dt2(n2), { values: o2, keys: d6 } = this.dt(t3, e2, i);
    if (!Array.isArray(r2))
      return this.ht = d6, o2;
    let h4 = (s2 = this.ht) !== null && s2 !== void 0 ? s2 : this.ht = [], l4 = [], _6, $5, a2 = 0, u4 = r2.length - 1, c7 = 0, A4 = o2.length - 1;
    for (; a2 <= u4 && c7 <= A4; )
      if (r2[a2] === null)
        a2++;
      else if (r2[u4] === null)
        u4--;
      else if (h4[a2] === d6[c7])
        l4[c7] = m6(r2[a2], o2[c7]), a2++, c7++;
      else if (h4[u4] === d6[A4])
        l4[A4] = m6(r2[u4], o2[A4]), u4--, A4--;
      else if (h4[a2] === d6[A4])
        l4[A4] = m6(r2[a2], o2[A4]), E5(n2, l4[A4 + 1], r2[a2]), a2++, A4--;
      else if (h4[u4] === d6[c7])
        l4[c7] = m6(r2[u4], o2[c7]), E5(n2, r2[a2], r2[u4]), u4--, c7++;
      else if (_6 === void 0 && (_6 = $t(d6, c7, A4), $5 = $t(h4, a2, u4)), _6.has(h4[a2]))
        if (_6.has(h4[u4])) {
          let p9 = $5.get(d6[c7]), O5 = p9 !== void 0 ? r2[p9] : null;
          if (O5 === null) {
            let F5 = E5(n2, r2[a2]);
            m6(F5, o2[c7]), l4[c7] = F5;
          } else
            l4[c7] = m6(O5, o2[c7]), E5(n2, r2[a2], O5), r2[p9] = null;
          c7++;
        } else
          k4(r2[u4]), u4--;
      else
        k4(r2[a2]), a2++;
    for (; c7 <= A4; ) {
      let p9 = E5(n2, l4[A4 + 1]);
      m6(p9, o2[c7]), l4[c7++] = p9;
    }
    for (; a2 <= u4; ) {
      let p9 = r2[a2++];
      p9 !== null && k4(p9);
    }
    return this.ht = d6, at4(n2, l4), H5;
  }
});
var P6;
var w7 = window;
var y11 = w7.trustedTypes;
var j6 = y11 ? y11.createPolicy("lit-html", { createHTML: (o2) => o2 }) : void 0;
var B6 = "$lit$";
var _5 = `lit$${(Math.random() + "").slice(9)}$`;
var Y5 = "?" + _5;
var tt5 = `<${Y5}>`;
var g6 = document;
var M5 = /* @__PURE__ */ __name(() => g6.createComment(""), "M");
var C7 = /* @__PURE__ */ __name((o2) => o2 === null || typeof o2 != "object" && typeof o2 != "function", "C");
var q6 = Array.isArray;
var et6 = /* @__PURE__ */ __name((o2) => q6(o2) || typeof (o2 == null ? void 0 : o2[Symbol.iterator]) == "function", "et");
var S7 = `[ 	
\f\r]`;
var N6 = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var k5 = /-->/g;
var W6 = />/g;
var v6 = RegExp(`>|${S7}(?:([^\\s"'>=/]+)(${S7}*=${S7}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var V6 = /'/g;
var Z5 = /"/g;
var G6 = /^(?:script|style|textarea|title)$/i;
var J6 = /* @__PURE__ */ __name((o2) => (t3, ...e2) => ({ _$litType$: o2, strings: t3, values: e2 }), "J");
J6(1);
J6(2);
var m7 = Symbol.for("lit-noChange");
var u3 = Symbol.for("lit-nothing");
var z6 = /* @__PURE__ */ new WeakMap();
var p8 = g6.createTreeWalker(g6, 129, null, false);
var it5 = /* @__PURE__ */ __name((o2, t3) => {
  let e2 = o2.length - 1, i = [], s2, r2 = t3 === 2 ? "<svg>" : "", n2 = N6;
  for (let l4 = 0; l4 < e2; l4++) {
    let h4 = o2[l4], A4, a2, d6 = -1, c7 = 0;
    for (; c7 < h4.length && (n2.lastIndex = c7, a2 = n2.exec(h4), a2 !== null); )
      c7 = n2.lastIndex, n2 === N6 ? a2[1] === "!--" ? n2 = k5 : a2[1] !== void 0 ? n2 = W6 : a2[2] !== void 0 ? (G6.test(a2[2]) && (s2 = RegExp("</" + a2[2], "g")), n2 = v6) : a2[3] !== void 0 && (n2 = v6) : n2 === v6 ? a2[0] === ">" ? (n2 = s2 ?? N6, d6 = -1) : a2[1] === void 0 ? d6 = -2 : (d6 = n2.lastIndex - a2[2].length, A4 = a2[1], n2 = a2[3] === void 0 ? v6 : a2[3] === '"' ? Z5 : V6) : n2 === Z5 || n2 === V6 ? n2 = v6 : n2 === k5 || n2 === W6 ? n2 = N6 : (n2 = v6, s2 = void 0);
    let b5 = n2 === v6 && o2[l4 + 1].startsWith("/>") ? " " : "";
    r2 += n2 === N6 ? h4 + tt5 : d6 >= 0 ? (i.push(A4), h4.slice(0, d6) + B6 + h4.slice(d6) + _5 + b5) : h4 + _5 + (d6 === -2 ? (i.push(void 0), l4) : b5);
  }
  let $5 = r2 + (o2[e2] || "<?>") + (t3 === 2 ? "</svg>" : "");
  if (!Array.isArray(o2) || !o2.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return [j6 !== void 0 ? j6.createHTML($5) : $5, i];
}, "it");
var f6 = /* @__PURE__ */ __name(class {
  constructor({ strings: t3, _$litType$: e2 }, i) {
    let s2;
    this.parts = [];
    let r2 = 0, n2 = 0, $5 = t3.length - 1, l4 = this.parts, [h4, A4] = it5(t3, e2);
    if (this.el = f6.createElement(h4, i), p8.currentNode = this.el.content, e2 === 2) {
      let a2 = this.el.content, d6 = a2.firstChild;
      d6.remove(), a2.append(...d6.childNodes);
    }
    for (; (s2 = p8.nextNode()) !== null && l4.length < $5; ) {
      if (s2.nodeType === 1) {
        if (s2.hasAttributes()) {
          let a2 = [];
          for (let d6 of s2.getAttributeNames())
            if (d6.endsWith(B6) || d6.startsWith(_5)) {
              let c7 = A4[n2++];
              if (a2.push(d6), c7 !== void 0) {
                let b5 = s2.getAttribute(c7.toLowerCase() + B6).split(_5), E6 = /([.?@])?(.*)/.exec(c7);
                l4.push({ type: 1, index: r2, name: E6[2], strings: b5, ctor: E6[1] === "." ? R6 : E6[1] === "?" ? L6 : E6[1] === "@" ? D6 : T5 });
              } else
                l4.push({ type: 6, index: r2 });
            }
          for (let d6 of a2)
            s2.removeAttribute(d6);
        }
        if (G6.test(s2.tagName)) {
          let a2 = s2.textContent.split(_5), d6 = a2.length - 1;
          if (d6 > 0) {
            s2.textContent = y11 ? y11.emptyScript : "";
            for (let c7 = 0; c7 < d6; c7++)
              s2.append(a2[c7], M5()), p8.nextNode(), l4.push({ type: 2, index: ++r2 });
            s2.append(a2[d6], M5());
          }
        }
      } else if (s2.nodeType === 8)
        if (s2.data === Y5)
          l4.push({ type: 2, index: r2 });
        else {
          let a2 = -1;
          for (; (a2 = s2.data.indexOf(_5, a2 + 1)) !== -1; )
            l4.push({ type: 7, index: r2 }), a2 += _5.length - 1;
        }
      r2++;
    }
  }
  static createElement(t3, e2) {
    let i = g6.createElement("template");
    return i.innerHTML = t3, i;
  }
}, "f");
function H6(o2, t3, e2 = o2, i) {
  var s2, r2, n2, $5;
  if (t3 === m7)
    return t3;
  let l4 = i !== void 0 ? (s2 = e2._$Co) === null || s2 === void 0 ? void 0 : s2[i] : e2._$Cl, h4 = C7(t3) ? void 0 : t3._$litDirective$;
  return (l4 == null ? void 0 : l4.constructor) !== h4 && ((r2 = l4 == null ? void 0 : l4._$AO) === null || r2 === void 0 || r2.call(l4, false), h4 === void 0 ? l4 = void 0 : (l4 = new h4(o2), l4._$AT(o2, e2, i)), i !== void 0 ? ((n2 = ($5 = e2)._$Co) !== null && n2 !== void 0 ? n2 : $5._$Co = [])[i] = l4 : e2._$Cl = l4), l4 !== void 0 && (t3 = H6(o2, l4._$AS(o2, t3.values), l4, i)), t3;
}
__name(H6, "H");
var U6 = /* @__PURE__ */ __name(class {
  constructor(t3, e2) {
    this._$AV = [], this._$AN = void 0, this._$AD = t3, this._$AM = e2;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t3) {
    var e2;
    let { el: { content: i }, parts: s2 } = this._$AD, r2 = ((e2 = t3 == null ? void 0 : t3.creationScope) !== null && e2 !== void 0 ? e2 : g6).importNode(i, true);
    p8.currentNode = r2;
    let n2 = p8.nextNode(), $5 = 0, l4 = 0, h4 = s2[0];
    for (; h4 !== void 0; ) {
      if ($5 === h4.index) {
        let A4;
        h4.type === 2 ? A4 = new x6(n2, n2.nextSibling, this, t3) : h4.type === 1 ? A4 = new h4.ctor(n2, h4.name, h4.strings, this, t3) : h4.type === 6 && (A4 = new O4(n2, this, t3)), this._$AV.push(A4), h4 = s2[++l4];
      }
      $5 !== (h4 == null ? void 0 : h4.index) && (n2 = p8.nextNode(), $5++);
    }
    return p8.currentNode = g6, r2;
  }
  v(t3) {
    let e2 = 0;
    for (let i of this._$AV)
      i !== void 0 && (i.strings !== void 0 ? (i._$AI(t3, i, e2), e2 += i.strings.length - 2) : i._$AI(t3[e2])), e2++;
  }
}, "U");
var x6 = /* @__PURE__ */ __name(class {
  constructor(t3, e2, i, s2) {
    var r2;
    this.type = 2, this._$AH = u3, this._$AN = void 0, this._$AA = t3, this._$AB = e2, this._$AM = i, this.options = s2, this._$Cp = (r2 = s2 == null ? void 0 : s2.isConnected) === null || r2 === void 0 || r2;
  }
  get _$AU() {
    var t3, e2;
    return (e2 = (t3 = this._$AM) === null || t3 === void 0 ? void 0 : t3._$AU) !== null && e2 !== void 0 ? e2 : this._$Cp;
  }
  get parentNode() {
    let t3 = this._$AA.parentNode, e2 = this._$AM;
    return e2 !== void 0 && (t3 == null ? void 0 : t3.nodeType) === 11 && (t3 = e2.parentNode), t3;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t3, e2 = this) {
    t3 = H6(this, t3, e2), C7(t3) ? t3 === u3 || t3 == null || t3 === "" ? (this._$AH !== u3 && this._$AR(), this._$AH = u3) : t3 !== this._$AH && t3 !== m7 && this._(t3) : t3._$litType$ !== void 0 ? this.g(t3) : t3.nodeType !== void 0 ? this.$(t3) : et6(t3) ? this.T(t3) : this._(t3);
  }
  k(t3) {
    return this._$AA.parentNode.insertBefore(t3, this._$AB);
  }
  $(t3) {
    this._$AH !== t3 && (this._$AR(), this._$AH = this.k(t3));
  }
  _(t3) {
    this._$AH !== u3 && C7(this._$AH) ? this._$AA.nextSibling.data = t3 : this.$(g6.createTextNode(t3)), this._$AH = t3;
  }
  g(t3) {
    var e2;
    let { values: i, _$litType$: s2 } = t3, r2 = typeof s2 == "number" ? this._$AC(t3) : (s2.el === void 0 && (s2.el = f6.createElement(s2.h, this.options)), s2);
    if (((e2 = this._$AH) === null || e2 === void 0 ? void 0 : e2._$AD) === r2)
      this._$AH.v(i);
    else {
      let n2 = new U6(r2, this), $5 = n2.u(this.options);
      n2.v(i), this.$($5), this._$AH = n2;
    }
  }
  _$AC(t3) {
    let e2 = z6.get(t3.strings);
    return e2 === void 0 && z6.set(t3.strings, e2 = new f6(t3)), e2;
  }
  T(t3) {
    q6(this._$AH) || (this._$AH = [], this._$AR());
    let e2 = this._$AH, i, s2 = 0;
    for (let r2 of t3)
      s2 === e2.length ? e2.push(i = new x6(this.k(M5()), this.k(M5()), this, this.options)) : i = e2[s2], i._$AI(r2), s2++;
    s2 < e2.length && (this._$AR(i && i._$AB.nextSibling, s2), e2.length = s2);
  }
  _$AR(t3 = this._$AA.nextSibling, e2) {
    var i;
    for ((i = this._$AP) === null || i === void 0 || i.call(this, false, true, e2); t3 && t3 !== this._$AB; ) {
      let s2 = t3.nextSibling;
      t3.remove(), t3 = s2;
    }
  }
  setConnected(t3) {
    var e2;
    this._$AM === void 0 && (this._$Cp = t3, (e2 = this._$AP) === null || e2 === void 0 || e2.call(this, t3));
  }
}, "x");
var T5 = /* @__PURE__ */ __name(class {
  constructor(t3, e2, i, s2, r2) {
    this.type = 1, this._$AH = u3, this._$AN = void 0, this.element = t3, this.name = e2, this._$AM = s2, this.options = r2, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = u3;
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3, e2 = this, i, s2) {
    let r2 = this.strings, n2 = false;
    if (r2 === void 0)
      t3 = H6(this, t3, e2, 0), n2 = !C7(t3) || t3 !== this._$AH && t3 !== m7, n2 && (this._$AH = t3);
    else {
      let $5 = t3, l4, h4;
      for (t3 = r2[0], l4 = 0; l4 < r2.length - 1; l4++)
        h4 = H6(this, $5[i + l4], e2, l4), h4 === m7 && (h4 = this._$AH[l4]), n2 || (n2 = !C7(h4) || h4 !== this._$AH[l4]), h4 === u3 ? t3 = u3 : t3 !== u3 && (t3 += (h4 ?? "") + r2[l4 + 1]), this._$AH[l4] = h4;
    }
    n2 && !s2 && this.j(t3);
  }
  j(t3) {
    t3 === u3 ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 ?? "");
  }
}, "T");
var R6 = /* @__PURE__ */ __name(class extends T5 {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t3) {
    this.element[this.name] = t3 === u3 ? void 0 : t3;
  }
}, "R");
var st6 = y11 ? y11.emptyScript : "";
var L6 = /* @__PURE__ */ __name(class extends T5 {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t3) {
    t3 && t3 !== u3 ? this.element.setAttribute(this.name, st6) : this.element.removeAttribute(this.name);
  }
}, "L");
var D6 = /* @__PURE__ */ __name(class extends T5 {
  constructor(t3, e2, i, s2, r2) {
    super(t3, e2, i, s2, r2), this.type = 5;
  }
  _$AI(t3, e2 = this) {
    var i;
    if ((t3 = (i = H6(this, t3, e2, 0)) !== null && i !== void 0 ? i : u3) === m7)
      return;
    let s2 = this._$AH, r2 = t3 === u3 && s2 !== u3 || t3.capture !== s2.capture || t3.once !== s2.once || t3.passive !== s2.passive, n2 = t3 !== u3 && (s2 === u3 || r2);
    r2 && this.element.removeEventListener(this.name, this, s2), n2 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
  }
  handleEvent(t3) {
    var e2, i;
    typeof this._$AH == "function" ? this._$AH.call((i = (e2 = this.options) === null || e2 === void 0 ? void 0 : e2.host) !== null && i !== void 0 ? i : this.element, t3) : this._$AH.handleEvent(t3);
  }
}, "D");
var O4 = /* @__PURE__ */ __name(class {
  constructor(t3, e2, i) {
    this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = e2, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3) {
    H6(this, t3);
  }
}, "O");
var F4 = w7.litHtmlPolyfillSupport;
F4 == null ? void 0 : F4(f6, x6), ((P6 = w7.litHtmlVersions) !== null && P6 !== void 0 ? P6 : w7.litHtmlVersions = []).push("2.7.4");
var K6 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
var Q6 = /* @__PURE__ */ __name((o2) => (...t3) => ({ _$litDirective$: o2, values: t3 }), "Q");
var I6 = /* @__PURE__ */ __name(class {
  constructor(t3) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t3, e2, i) {
    this._$Ct = t3, this._$AM = e2, this._$Ci = i;
  }
  _$AS(t3, e2) {
    return this.update(t3, e2);
  }
  update(t3, e2) {
    return this.render(...e2);
  }
}, "I");
var X5 = "important";
var nt5 = " !" + X5;
var ut3 = Q6(class extends I6 {
  constructor(o2) {
    var t3;
    if (super(o2), o2.type !== K6.ATTRIBUTE || o2.name !== "style" || ((t3 = o2.strings) === null || t3 === void 0 ? void 0 : t3.length) > 2)
      throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(o2) {
    return Object.keys(o2).reduce((t3, e2) => {
      let i = o2[e2];
      return i == null ? t3 : t3 + `${e2 = e2.includes("-") ? e2 : e2.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${i};`;
    }, "");
  }
  update(o2, [t3]) {
    let { style: e2 } = o2.element;
    if (this.ut === void 0) {
      this.ut = /* @__PURE__ */ new Set();
      for (let i in t3)
        this.ut.add(i);
      return this.render(t3);
    }
    this.ut.forEach((i) => {
      t3[i] == null && (this.ut.delete(i), i.includes("-") ? e2.removeProperty(i) : e2[i] = "");
    });
    for (let i in t3) {
      let s2 = t3[i];
      if (s2 != null) {
        this.ut.add(i);
        let r2 = typeof s2 == "string" && s2.endsWith(nt5);
        i.includes("-") || r2 ? e2.setProperty(i, r2 ? s2.slice(0, -11) : s2, r2 ? X5 : "") : e2[i] = s2;
      }
    }
    return m7;
  }
});
function t2(e2, o2, n2) {
  return e2 ? o2() : n2 == null ? void 0 : n2();
}
__name(t2, "t");
var css = C3;
var html = tt2;
var TAG = "emulator-toolbar";
var EmulatorToolbarElement = class extends n {
  constructor() {
    super(...arguments);
    this.url = "";
    this._on_keydown_reload = (e2) => {
      e2 = e2 || window.event;
      if (e2.ctrlKey && e2.keyCode == 82 || //ctrl+R
      e2.keyCode == 116) {
        debugger;
      }
    };
  }
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("keydown", this._on_keydown_reload);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this._on_keydown_reload);
  }
  render() {
    return html`<div class="bar"><input .value="${this.url}" readonly="readonly" @input="${(e2) => {
      this.url = e2.target.value;
    }}"></div>`;
  }
};
__name(EmulatorToolbarElement, "EmulatorToolbarElement");
EmulatorToolbarElement.styles = createAllCSS();
__decorateClass([
  y5({ type: String })
], EmulatorToolbarElement.prototype, "url", 2);
EmulatorToolbarElement = __decorateClass([
  c4(TAG)
], EmulatorToolbarElement);
function createAllCSS() {
  return [
    css`:host{display:block}.bar{background:#00000033}input{width:100%;height:2em}`
  ];
}
__name(createAllCSS, "createAllCSS");
var TAG2 = "multi-webview-comp-biometrics";
var MultiWebviewCompBiometrics = class extends n {
  pass() {
    var _a2;
    console.error("点击了 pass 但是还没有处理");
    this.dispatchEvent(new Event("pass"));
    (_a2 = this.shadowRoot) == null ? void 0 : _a2.host.remove();
  }
  noPass() {
    var _a2;
    console.error("点击了 no pass 但是还没有处理");
    this.dispatchEvent(new Event("no-pass"));
    (_a2 = this.shadowRoot) == null ? void 0 : _a2.host.remove();
  }
  render() {
    return html`<div class="panel"><p>点击按钮 模拟 返回结果</p><div class="btn_group"><button class="pass" @click="${this.pass}">识别通过</button> <button class="no_pass" @click="${this.noPass}">识别没通过</button></div></div>`;
  }
};
__name(MultiWebviewCompBiometrics, "MultiWebviewCompBiometrics");
MultiWebviewCompBiometrics.styles = createAllCSS2();
MultiWebviewCompBiometrics = __decorateClass([
  c4(TAG2)
], MultiWebviewCompBiometrics);
function createAllCSS2() {
  return [
    css`:host{position:absolute;z-index:1;left:0;top:0;box-sizing:border-box;padding-bottom:100px;width:100%;height:100%;display:flex;justify-content:center;align-items:center;background:#00000033}.panel{padding:12px 20px;width:80%;border-radius:12px;background:#ffffffff}.btn_group{width:100%;display:flex;justify-content:space-between}.no_pass,.pass{padding:8px 20px;border-radius:5px;border:none}.pass{color:#ffffffff;background:#1677ff}.no_pass{background:#d9d9d9}`
  ];
}
__name(createAllCSS2, "createAllCSS");
var TAG3 = "multi-webview-comp-haptics";
var MultiWebviewCompHaptics = class extends n {
  constructor() {
    super(...arguments);
    this.text = "";
  }
  firstUpdated() {
    var _a2;
    (_a2 = this.shadowRoot) == null ? void 0 : _a2.host.addEventListener("click", this.cancel);
  }
  cancel() {
    var _a2;
    (_a2 = this.shadowRoot) == null ? void 0 : _a2.host.remove();
  }
  render() {
    return html`<div class="panel"><p>模拟: ${this.text}</p><div class="btn_group"><button class="btn" @click="${this.cancel}">取消</button></div></div>`;
  }
};
__name(MultiWebviewCompHaptics, "MultiWebviewCompHaptics");
MultiWebviewCompHaptics.styles = createAllCSS3();
__decorateClass([
  y5({ type: String })
], MultiWebviewCompHaptics.prototype, "text", 2);
MultiWebviewCompHaptics = __decorateClass([
  c4(TAG3)
], MultiWebviewCompHaptics);
function createAllCSS3() {
  return [
    css`:host{position:absolute;z-index:1;left:0;top:0;box-sizing:border-box;padding-bottom:100px;width:100%;height:100%;display:flex;justify-content:center;align-items:center;background:#00000033;cursor:pointer}.panel{padding:12px 20px;width:80%;border-radius:12px;background:#ffffffff}.btn_group{width:100%;display:flex;justify-content:flex-end}.btn{padding:8px 20px;border-radius:5px;border:none;color:#ffffffff;background:#1677ff}`
  ];
}
__name(createAllCSS3, "createAllCSS");
var TAG4 = "multi-webview-comp-mobile-shell";
var MultiWebViewCompMobileShell = class extends n {
  /**
   *
   * @param message
   * @param duration
   * @param position
   */
  toastShow(message, duration, position3) {
    var _a2;
    const multiWebviewCompToast = document.createElement("multi-webview-comp-toast");
    [
      ["_message", message],
      ["_duration", duration],
      ["_position", position3]
    ].forEach(([key, value]) => {
      multiWebviewCompToast.setAttribute(key, value);
    });
    (_a2 = this.shellContainer) == null ? void 0 : _a2.append(multiWebviewCompToast);
  }
  shareShare(options) {
    var _a2;
    const el = document.createElement("multi-webview-comp-share");
    const ui8 = options.body;
    const contentType = options.bodyType;
    const sparator = new TextEncoder().encode(contentType.split("boundary=")[1]).join();
    const file = this.getFileFromUin8Array(ui8, sparator, 1);
    let src2 = "";
    let filename = "";
    if (file !== void 0) {
      if (file.name.endsWith(".gif") || file.name.endsWith(".png") || file.name.endsWith(".jpg") || file.name.endsWith(".bmp") || file.name.endsWith(".svg") || file.name.endsWith(".webp")) {
        src2 = URL.createObjectURL(file);
      } else {
        filename = file.name;
      }
    }
    [
      ["_title", options.title],
      ["_text", options.text],
      ["_link", options.link],
      ["_src", src2],
      ["_filename", filename]
    ].forEach(([key, value]) => el.setAttribute(key, value));
    (_a2 = this.appContentContainer) == null ? void 0 : _a2.appendChild(el);
  }
  /**
   *  formData 原始 Uint8Array 数据
   *  separatorStr 在请求的headers里面的 multipart/form-data; boundary=----WebKitFormBoundarySLm2pLgOKCimWFjG boundary=后面的内容
   *  index file 数据保存在原始 formData 被分割后的位置
   *  这个位置会根据 formData参数的不同而不同
   */
  getFileFromUin8Array(rawUi8, separatorStr, index) {
    const ui8Str = rawUi8.join();
    const dubleLineBreak = new TextEncoder().encode("\r\n\r\n").join();
    const resultNoPeratorStrArr = ui8Str.split(separatorStr);
    let contentType = "";
    let filename = "";
    let file = void 0;
    const str = resultNoPeratorStrArr[index];
    const arr = str.slice(7, -7).split(dubleLineBreak);
    arr.forEach((str2, index2) => {
      if (str2.length === 0)
        return;
      if (index2 === 0) {
        const des = new TextDecoder().decode(new Uint8Array(str2.slice(0, -1).split(",")));
        des.split("\r\n").forEach((str3, index3) => {
          if (index3 === 0) {
            filename = str3.split("filename=")[1].slice(1, -1);
          } else if (index3 === 1) {
            contentType = str3.split(":")[1];
          }
        });
      } else {
        const s2 = str2.slice(1, -6);
        const a2 = new Uint8Array(s2.split(","));
        const blob = new Blob([a2], { type: contentType });
        file = new File([blob], filename);
      }
    });
    return file;
  }
  render() {
    return html`<div class="shell"><div class="shell_container"><slot name="status-bar"></slot><div class="app_content_container"><slot name="shell-content">... 桌面 ...</slot></div><slot name="bottom-bar"></slot></div></div>`;
  }
};
__name(MultiWebViewCompMobileShell, "MultiWebViewCompMobileShell");
MultiWebViewCompMobileShell.styles = createAllCSS4();
__decorateClass([
  y7(".app_content_container")
], MultiWebViewCompMobileShell.prototype, "appContentContainer", 2);
__decorateClass([
  y7(".shell_container")
], MultiWebViewCompMobileShell.prototype, "shellContainer", 2);
MultiWebViewCompMobileShell = __decorateClass([
  c4(TAG4)
], MultiWebViewCompMobileShell);
function createAllCSS4() {
  return [
    css`:host{display:block;height:100%;overflow:hidden;-webkit-app-region:resize}.shell{padding:.8em .8em .8em .8em;border-radius:2.6em;overflow:hidden;background:#000;height:100%;width:100%;box-sizing:border-box;-webkit-app-region:drag}.shell_container{-webkit-app-region:no-drag;position:relative;display:flex;background:#fff;flex-direction:column;box-sizing:content-box;width:100%;height:100%;overflow:hidden;border-radius:2em}@media (prefers-color-scheme:dark){.shell_container{background:#333}}.app_content_container{position:relative;box-sizing:border-box;width:100%;height:100%}`
  ];
}
__name(createAllCSS4, "createAllCSS");
var TAG5 = "multi-webview-comp-navigation-bar";
var MultiWebviewCompNavigationBar = class extends n {
  constructor() {
    super(...arguments);
    this._color = "#ccccccFF";
    this._style = "DEFAULT";
    this._overlay = false;
    this._visible = true;
    this._insets = {
      top: 0,
      right: 0,
      bottom: 20,
      left: 0
    };
  }
  updated(_changedProperties) {
    if (_changedProperties.has("_visible") || _changedProperties.has("_overlay")) {
      this.dispatchEvent(new Event("safe_area_need_update"));
    }
  }
  createBackgroundStyleMap() {
    return {
      backgroundColor: this._overlay ? "transparent" : this._color
    };
  }
  createContainerStyleMap() {
    const isLight = window.matchMedia("(prefers-color-scheme: light)");
    return {
      color: this._style === "LIGHT" ? "#000000FF" : this._style === "DARK" ? "#FFFFFFFF" : isLight ? "#000000FF" : "#FFFFFFFF"
    };
  }
  setHostStyle() {
    const host = this.renderRoot.host;
    host.style.position = this._overlay ? "absolute" : "relative";
    host.style.overflow = this._visible ? "visible" : "hidden";
    host.style.height = this._visible ? "auto" : "0px";
  }
  back() {
    this.dispatchEvent(new Event("back"));
  }
  home() {
    console.error("navigation-bar click home 但是还没有处理");
  }
  menu() {
    console.error(`navigation-bar 点击了menu 但是还没有处理`);
  }
  render() {
    this.setHostStyle();
    const backgroundStyleMap = this.createBackgroundStyleMap();
    const containerStyleMap = this.createContainerStyleMap();
    return html`<div class="container"><div class="background" style="${ut3(backgroundStyleMap)}"></div><div class="navigation_bar_container" style="${ut3(containerStyleMap)}"><div class="menu" @click="${this.menu}"><svg class="icon_svg menu_svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"/></svg></div><div class="home" @click="${this.home}"><svg class="icon_svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/></svg></div><div class="back" @click="${this.back}"><svg class="icon_svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M814.40768 119.93088a46.08 46.08 0 0 0-45.13792 2.58048l-568.07424 368.64a40.42752 40.42752 0 0 0-18.75968 33.71008c0 13.39392 7.00416 25.96864 18.75968 33.66912l568.07424 368.64c13.35296 8.68352 30.72 9.66656 45.13792 2.58048a40.67328 40.67328 0 0 0 23.38816-36.2496v-737.28a40.71424 40.71424 0 0 0-23.38816-36.29056zM750.3872 815.3088L302.81728 524.86144l447.61088-290.44736v580.89472z"></path></svg></div></div></div>`;
  }
};
__name(MultiWebviewCompNavigationBar, "MultiWebviewCompNavigationBar");
MultiWebviewCompNavigationBar.styles = createAllCSS5();
__decorateClass([
  y5({ type: String })
], MultiWebviewCompNavigationBar.prototype, "_color", 2);
__decorateClass([
  y5({ type: String })
], MultiWebviewCompNavigationBar.prototype, "_style", 2);
__decorateClass([
  y5({ type: Boolean })
], MultiWebviewCompNavigationBar.prototype, "_overlay", 2);
__decorateClass([
  y5({ type: Boolean })
], MultiWebviewCompNavigationBar.prototype, "_visible", 2);
__decorateClass([
  y5({ type: Object })
], MultiWebviewCompNavigationBar.prototype, "_insets", 2);
MultiWebviewCompNavigationBar = __decorateClass([
  c4(TAG5)
], MultiWebviewCompNavigationBar);
function createAllCSS5() {
  return [
    css`:host{position:relative;z-index:999999999;box-sizing:border-box;left:0;bottom:0;margin:0;width:100%;-webkit-app-region:drag;-webkit-user-select:none}.container{position:relative;box-sizing:border-box;width:100%;height:26px}.background{position:absolute;top:0;left:0;width:100%;height:100%;background:#ffffff00}.line-container{position:absolute;top:0;left:0;display:flex;justify-content:center;align-items:center;width:100%;height:100%}.line{width:50%;height:4px;border-radius:4px}.line-default{background:#ffffffff}.line-dark{background:#000000ff}.line-light{background:#ffffffff}.navigation_bar_container{position:absolute;top:0;left:0;display:flex;justify-content:space-around;align-items:center;width:100%;height:100%}.back,.home,.menu{display:flex;justify-content:center;align-items:center;cursor:pointer;-webkit-app-region:no-drag}.icon_svg{width:20px;height:20px}`
  ];
}
__name(createAllCSS5, "createAllCSS");
var TAG6 = "multi-webview-comp-share";
var MultiWebviewCompShare = class extends n {
  constructor() {
    super(...arguments);
    this._title = "标题 这里是超长的标题，这里是超长的标题这里是超长的，这里是超长的标题，这里是超长的标题";
    this._text = "文本内容 这里是超长的内容，这里是超长的内容，这里是超长的内容，这里是超长的内容，";
    this._link = "http://www.baidu.com?url=";
    this._src = "https://img.tukuppt.com/photo-big/00/00/94/6152bc0ce6e5d805.jpg";
    this._filename = "";
  }
  firstUpdated(_changedProperties) {
    var _a2;
    (_a2 = this.shadowRoot) == null ? void 0 : _a2.host.addEventListener("click", this.cancel);
  }
  cancel() {
    var _a2;
    (_a2 = this.shadowRoot) == null ? void 0 : _a2.host.remove();
  }
  render() {
    console.log("this._src: ", this._src);
    return html`<div class="panel">${t2(
      this._src,
      () => html`<img class="img" src="${this._src}">`,
      () => html`<div class="filename">${this._filename}</div>`
    )}<div class="text_container"><h2 class="h2">${this._title}</h2><p class="p">${this._text}</p><a class="a" href="${this._link}" target="_blank">${this._link}</a></div></div>`;
  }
};
__name(MultiWebviewCompShare, "MultiWebviewCompShare");
MultiWebviewCompShare.styles = createAllCSS6();
__decorateClass([
  y5({ type: String })
], MultiWebviewCompShare.prototype, "_title", 2);
__decorateClass([
  y5({ type: String })
], MultiWebviewCompShare.prototype, "_text", 2);
__decorateClass([
  y5({ type: String })
], MultiWebviewCompShare.prototype, "_link", 2);
__decorateClass([
  y5({ type: String })
], MultiWebviewCompShare.prototype, "_src", 2);
__decorateClass([
  y5({ type: String })
], MultiWebviewCompShare.prototype, "_filename", 2);
MultiWebviewCompShare = __decorateClass([
  c4(TAG6)
], MultiWebviewCompShare);
function createAllCSS6() {
  return [
    css`:host{position:absolute;z-index:1;left:0;top:0;box-sizing:border-box;padding-bottom:200px;width:100%;height:100%;display:flex;justify-content:center;align-items:center;background:#000000cc;cursor:pointer;backdrop-filter:blur(5px)}.panel{display:flex;flex-direction:column;justify-content:center;width:70%;border-radius:6px;background:#ffffffff;border-radius:6px;overflow:hidden}.img{display:block;box-sizing:border-box;padding:30px;max-width:100%;max-height:300px}.filename{display:flex;justify-content:center;align-items:center;box-sizing:border-box;padding:30px;max-width:100%;max-height:300px;font-size:18px}.text_container{box-sizing:border-box;padding:20px;width:100%;height:auto;background:#000000ff}.h2{margin:0;padding:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:16px;color:#fff}.p{margin:0;padding:0;font-size:13px;color:#666;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.a{display:block;font-size:12px;color:#999;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}`
  ];
}
__name(createAllCSS6, "createAllCSS");
var TAG7 = "multi-webview-comp-status-bar";
var MultiWebviewCompStatusBar = class extends n {
  constructor() {
    super(...arguments);
    this._color = "#FFFFFF80";
    this._style = "DEFAULT";
    this._overlay = false;
    this._visible = true;
    this._insets = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
    this._torchIsOpen = false;
  }
  updated(changedProperties) {
    if (changedProperties.has("_visible") || changedProperties.has("_overlay")) {
      this.dispatchEvent(new Event("safe_area_need_update"));
    }
    super.updated(changedProperties);
  }
  render() {
    return html`<div class="${at3({
      "comp-container": true,
      overlay: this._overlay,
      visible: this._visible,
      [this._style.toLowerCase()]: true
    })}" style="${ut3({
      "--bg-color": this._color,
      height: this._insets.top + "px"
    })}"><div class="background"></div><div class="container">${t2(this._visible, () => html`<div class="left_container">10:00</div>`)}<div class="center_container">${t2(this._torchIsOpen, () => html`<div class="torch_symbol"></div>`)}</div>${t2(
      this._visible,
      () => html`<div class="right_container"><svg t="1677291966287" class="icon icon-signal" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5745" width="32" height="32"><path fill="currentColor" d="M0 704h208v192H0zM272 512h208v384H272zM544 288h208v608H544zM816 128h208v768H816z" p-id="5746"></path></svg> <svg t="1677291873784" class="icon icon-wifi" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4699" width="32" height="32"><path fill="currentColor" d="M512 896 665.6 691.2C622.933333 659.2 569.6 640 512 640 454.4 640 401.066667 659.2 358.4 691.2L512 896M512 128C339.2 128 179.626667 185.173333 51.2 281.6L128 384C234.666667 303.786667 367.786667 256 512 256 656.213333 256 789.333333 303.786667 896 384L972.8 281.6C844.373333 185.173333 684.8 128 512 128M512 384C396.8 384 290.56 421.973333 204.8 486.4L281.6 588.8C345.6 540.586667 425.386667 512 512 512 598.613333 512 678.4 540.586667 742.4 588.8L819.2 486.4C733.44 421.973333 627.2 384 512 384Z" p-id="4700"></path></svg> <svg t="1677291736404" class="icon icon-electricity" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2796" width="32" height="32"><path fill="currentColor" d="M984.2 434.8c-5-2.9-8.2-8.2-8.2-13.9v-99.3c0-53.6-43.9-97.5-97.5-97.5h-781C43.9 224 0 267.9 0 321.5v380.9C0 756.1 43.9 800 97.5 800h780.9c53.6 0 97.5-43.9 97.5-97.5v-99.3c0-5.8 3.2-11 8.2-13.9 23.8-13.9 39.8-39.7 39.8-69.2v-16c0.1-29.6-15.9-55.5-39.7-69.3zM912 702.5c0 12-6.2 19.9-9.9 23.6-3.7 3.7-11.7 9.9-23.6 9.9h-781c-11.9 0-19.9-6.2-23.6-9.9-3.7-3.7-9.9-11.7-9.9-23.6v-381c0-11.9 6.2-19.9 9.9-23.6 3.7-3.7 11.7-9.9 23.6-9.9h780.9c11.9 0 19.9 6.2 23.6 9.9 3.7 3.7 9.9 11.7 9.9 23.6v381z" fill="#606266" p-id="2797"></path><path fill="currentColor" d="M736 344v336c0 8.8-7.2 16-16 16H112c-8.8 0-16-7.2-16-16V344c0-8.8 7.2-16 16-16h608c8.8 0 16 7.2 16 16z" fill="#606266" p-id="2798"></path></svg></div>`
    )}</div></div>`;
  }
};
__name(MultiWebviewCompStatusBar, "MultiWebviewCompStatusBar");
MultiWebviewCompStatusBar.styles = createAllCSS7();
__decorateClass([
  y5({ type: String })
], MultiWebviewCompStatusBar.prototype, "_color", 2);
__decorateClass([
  y5({ type: String })
], MultiWebviewCompStatusBar.prototype, "_style", 2);
__decorateClass([
  y5({ type: Boolean })
], MultiWebviewCompStatusBar.prototype, "_overlay", 2);
__decorateClass([
  y5({ type: Boolean })
], MultiWebviewCompStatusBar.prototype, "_visible", 2);
__decorateClass([
  y5({ type: Object })
], MultiWebviewCompStatusBar.prototype, "_insets", 2);
__decorateClass([
  y5({ type: Boolean })
], MultiWebviewCompStatusBar.prototype, "_torchIsOpen", 2);
MultiWebviewCompStatusBar = __decorateClass([
  c4(TAG7)
], MultiWebviewCompStatusBar);
function createAllCSS7() {
  return [
    css`:host{display:block;-webkit-app-region:drag;-webkit-user-select:none;--cell-width:80px}.comp-container{display:grid;grid-template-columns:1fr;grid-template-rows:1fr;gap:0 0;grid-template-areas:"view"}.comp-container.overlay{position:absolute;width:100%;z-index:1}.comp-container:not(.visible){display:none}.comp-container.light{--fg-color:#ffffffff}.comp-container.dark{--fg-color:#000000ff}.comp-container.default{--fg-color:#fff}.background{grid-area:view;background:var(--bg-color)}.container{grid-area:view;color:var(--fg-color);display:flex;justify-content:center;align-items:flex-end;font-family:PingFangSC-Light,sans-serif}.comp-container.default .left_container,.comp-container.default .right_container{mix-blend-mode:difference}.left_container{display:flex;justify-content:center;align-items:center;width:var(--cell-width);height:100%;font-size:15px;font-weight:900;height:2em}.center_container{position:relative;display:flex;justify-content:center;align-items:center;width:calc(100% - var(--cell-width) * 2);height:100%;border-bottom-left-radius:var(--border-radius);border-bottom-right-radius:var(--border-radius)}.center_container::after{content:"";width:50%;height:20px;border-radius:10px;background:#111}.torch_symbol{position:absolute;z-index:1;width:10px;height:10px;border-radius:20px;background:#fa541c}.right_container{display:flex;justify-content:flex-start;align-items:center;width:var(--cell-width);height:100%}.icon{margin-right:5px;width:18px;height:18px}`
  ];
}
__name(createAllCSS7, "createAllCSS");
var TAG8 = "multi-webview-comp-toast";
var MultiWebviewCompToast = class extends n {
  constructor() {
    super(...arguments);
    this._message = "test message";
    this._duration = `1000`;
    this._position = "top";
    this._beforeEntry = true;
  }
  firstUpdated() {
    setTimeout(() => {
      this._beforeEntry = false;
    }, 50);
  }
  transitionend(e2) {
    if (this._beforeEntry) {
      e2.target.remove();
      return;
    }
    setTimeout(
      () => {
        this._beforeEntry = true;
      },
      this._duration === "short" ? 2e3 : 3500
    );
  }
  render() {
    const containerClassMap = {
      container: true,
      before_entry: this._beforeEntry ? true : false,
      after_entry: this._beforeEntry ? false : true,
      container_bottom: this._position === "bottom" ? true : false,
      container_top: this._position === "bottom" ? false : true
    };
    return html`<div class="${at3(containerClassMap)}" @transitionend="${this.transitionend}"><p class="message">${this._message}</p></div>`;
  }
};
__name(MultiWebviewCompToast, "MultiWebviewCompToast");
MultiWebviewCompToast.styles = createAllCSS8();
MultiWebviewCompToast.properties = {
  _beforeEntry: { state: true }
};
__decorateClass([
  y5({ type: String })
], MultiWebviewCompToast.prototype, "_message", 2);
__decorateClass([
  y5({ type: String })
], MultiWebviewCompToast.prototype, "_duration", 2);
__decorateClass([
  y5({ type: String })
], MultiWebviewCompToast.prototype, "_position", 2);
__decorateClass([
  y6()
], MultiWebviewCompToast.prototype, "_beforeEntry", 2);
MultiWebviewCompToast = __decorateClass([
  c4(TAG8)
], MultiWebviewCompToast);
function createAllCSS8() {
  return [
    css`.container{position:absolute;left:0;box-sizing:border-box;padding:0 20px;width:100%;transition:all .25s ease-in-out}.container_bottom{bottom:16px}.container_top{top:26px}.before_entry{transform:translateX(-100vw)}.after_entry{transform:translateX(0)}.message{box-sizing:border-box;padding:0 6px;width:100%;height:38px;color:#fff;line-height:38px;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:#eee;border-radius:5px;background:#1677ff}`
  ];
}
__name(createAllCSS8, "createAllCSS");
var TAG9 = "multi-webview-comp-virtual-keyboard";
var MultiWebviewCompVirtualKeyboard = class extends n {
  constructor() {
    super(...arguments);
    this._visible = false;
    this._overlay = false;
    this._navigation_bar_height = 0;
    this.timer = 0;
    this.requestId = 0;
    this.insets = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    };
    this.maxHeight = 0;
    this.row1Keys = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
    this.row2Keys = ["a", "s", "d", "f", "g", "h", "j", "k", "l"];
    this.row3Keys = ["&#8679", "z", "x", "c", "v", "b", "n", "m", "&#10005"];
    this.row4Keys = ["123", "&#128512", "space", "search"];
  }
  setHostStyle() {
    const host = this.renderRoot.host;
    host.style.position = this._overlay ? "absolute" : "relative";
    host.style.overflow = this._visible ? "visible" : "hidden";
  }
  firstUpdated() {
    this.setCSSVar();
    this.dispatchEvent(new Event("first-updated"));
  }
  setCSSVar() {
    if (!this._elContainer)
      throw new Error(`this._elContainer === null`);
    const rowWidth = this._elContainer.getBoundingClientRect().width;
    const alphabetWidth = rowWidth / 11;
    const alphabetHeight = alphabetWidth * 1;
    const rowPaddingVertical = 3;
    const rowPaddingHorizontal = 2;
    this.maxHeight = (alphabetHeight + rowPaddingVertical * 2) * 4 + alphabetHeight;
    [
      ["--key-alphabet-width", alphabetWidth],
      ["--key-alphabet-height", alphabetHeight],
      ["--row-padding-vertical", rowPaddingVertical],
      ["--row-padding-horizontal", rowPaddingHorizontal],
      ["--height", this._navigation_bar_height]
    ].forEach(([propertyName, n2]) => {
      var _a2;
      (_a2 = this._elContainer) == null ? void 0 : _a2.style.setProperty(propertyName, n2 + "px");
    });
    return this;
  }
  repeatGetKey(item) {
    return item;
  }
  createElement(classname, key) {
    const div = document.createElement("div");
    div.setAttribute("class", classname);
    div.innerHTML = key;
    return div;
  }
  createElementForRow3(classNameSymbol, classNameAlphabet, key) {
    return this.createElement(key.startsWith("&") ? classNameSymbol : classNameAlphabet, key);
  }
  createElementForRow4(classNameSymbol, classNameSpace, classNameSearch, key) {
    return this.createElement(
      key.startsWith("1") || key.startsWith("&") ? classNameSymbol : key === "space" ? classNameSpace : classNameSearch,
      key
    );
  }
  transitionstart() {
    this.timer = setInterval(() => {
      this.dispatchEvent(new Event("height-changed"));
    }, 16);
  }
  transitionend() {
    this.dispatchEvent(new Event(this._visible ? "show-completed" : "hide-completed"));
    clearInterval(this.timer);
    this.dispatchEvent(new Event("height-changed"));
  }
  render() {
    this.setHostStyle();
    const containerClassMap = {
      container: true,
      container_active: this._visible
    };
    return html`<div class="${at3(containerClassMap)}" @transitionstart="${this.transitionstart}" @transitionend="${this.transitionend}"><div class="row line-1">${Ct2(this.row1Keys, this.repeatGetKey, this.createElement.bind(this, "key-alphabet"))}</div><div class="row line-2">${Ct2(this.row2Keys, this.repeatGetKey, this.createElement.bind(this, "key-alphabet"))}</div><div class="row line-3">${Ct2(
      this.row3Keys,
      this.repeatGetKey,
      this.createElementForRow3.bind(this, "key-symbol", "key-alphabet")
    )}</div><div class="row line-4">${Ct2(
      this.row4Keys,
      this.repeatGetKey,
      this.createElementForRow4.bind(this, "key-symbol", "key-space", "key-search")
    )}</div></div>`;
  }
};
__name(MultiWebviewCompVirtualKeyboard, "MultiWebviewCompVirtualKeyboard");
MultiWebviewCompVirtualKeyboard.styles = createAllCSS9();
__decorateClass([
  y7(".container")
], MultiWebviewCompVirtualKeyboard.prototype, "_elContainer", 2);
__decorateClass([
  y5({ type: Boolean })
], MultiWebviewCompVirtualKeyboard.prototype, "_visible", 2);
__decorateClass([
  y5({ type: Boolean })
], MultiWebviewCompVirtualKeyboard.prototype, "_overlay", 2);
__decorateClass([
  y5({ type: Number })
], MultiWebviewCompVirtualKeyboard.prototype, "_navigation_bar_height", 2);
MultiWebviewCompVirtualKeyboard = __decorateClass([
  c4(TAG9)
], MultiWebviewCompVirtualKeyboard);
function createAllCSS9() {
  return [
    css`:host{left:0;bottom:0;width:100%}.container{--key-alphabet-width:0px;--key-alphabet-height:0px;--row-padding-vertical:3px;--row-padding-horizontal:2px;--border-radius:3px;--height:0px;margin:0;height:var(--height);transition:all .25s ease-out;overflow:hidden;background:#999}.container_active{height:calc((var(--key-alphabet-height) + var(--row-padding-vertical) * 2) * 4 + var(--key-alphabet-height))}.row{display:flex;justify-content:space-between;align-items:center;padding:var(--row-padding-vertical) var(--row-padding-horizontal)}.key-alphabet{display:flex;justify-content:center;align-items:center;width:var(--key-alphabet-width);height:var(--key-alphabet-height);border-radius:var(--border-radius);background:#fff}.line-2{padding:var(--row-padding-vertical) calc(var(--row-padding-horizontal) + var(--key-alphabet-width)/ 2)}.key-symbol{--margin-horizontal:calc(var(--key-alphabet-width) * 0.3);display:flex;justify-content:center;align-items:center;width:calc(var(--key-alphabet-width) * 1.2);height:var(--key-alphabet-height);border-radius:var(--border-radius);background:#aaa}.key-symbol:first-child{margin-right:var(--margin-horizontal)}.key-symbol:last-child{margin-left:var(--margin-horizontal)}.line-4 .key-symbol:first-child{margin-right:0}.line-4 .key-symbol:nth-of-type(2){width:calc(var(--key-alphabet-width) * 1.3)}.key-space{display:flex;justify-content:center;align-items:center;border-radius:var(--border-radius);width:calc(var(--key-alphabet-width) * 6);height:var(--key-alphabet-height);background:#fff}.key-search{width:calc(var(--key-alphabet-width) * 2);height:var(--key-alphabet-height);display:flex;justify-content:center;align-items:center;border-radius:var(--border-radius);background:#4096ff;color:#fff}`
  ];
}
__name(createAllCSS9, "createAllCSS");
var TAG10 = "root-comp";
var RootComp = class extends n {
  constructor() {
    super(...arguments);
    this.src = "about:blank";
    this.controllers = /* @__PURE__ */ new Set();
    this._bindReloadShortcut = () => {
      var _a2, _b2;
      debugger;
      (_b2 = (_a2 = this.iframeEle) == null ? void 0 : _a2.contentWindow) == null ? void 0 : _b2.addEventListener("keydown", (e2) => {
        var _a3, _b3;
        e2 = e2 || window.event;
        if (e2.ctrlKey && e2.keyCode == 82 || //ctrl+R
        e2.keyCode == 116) {
          debugger;
          (_b3 = (_a3 = this.iframeEle) == null ? void 0 : _a3.contentWindow) == null ? void 0 : _b3.location.reload();
        }
      });
    };
    this._load = (event) => {
      if (event.target === null)
        throw new Error("event.target === null");
      const iframeWindow = event.target.contentWindow;
      if (iframeWindow === null)
        throw new Error("iframeWindow ==== null");
      function isMatch(t3) {
        return t3 === "email" || t3 === "number" || t3 === "password" || t3 === "search" || t3 === "tel" || t3 === "text" || t3 === "url";
      }
      __name(isMatch, "isMatch");
      iframeWindow.document.addEventListener("focusin", (event2) => {
        if (event2.target === null)
          throw new Error("event.target === null");
        const target2 = event2.target;
        const tagName = target2.tagName;
        if (tagName === "INPUT" && isMatch(Reflect.get(target2, "type"))) {
          this.virtualKeyboardController.virtualKeyboardSeVisiable(true);
        }
      });
      iframeWindow.document.addEventListener("focusout", (event2) => {
        if (event2.target === null)
          throw new Error("event.target === null");
        const target2 = event2.target;
        const tagName = target2.tagName;
        if (tagName === "INPUT" && isMatch(Reflect.get(target2, "type"))) {
          this.virtualKeyboardController.virtualKeyboardSeVisiable(false);
        }
      });
    };
    this.statusBarController = this._wc(new StatusBarController());
    this.navigationController = this._wc(new NavigationBarController());
    this.virtualKeyboardController = this._wc(new VirtualKeyboardController());
    this.safeAreaController = this._wc(new SafeAreaController());
    this.safeAreaControllerUpdateState = () => {
      this.safeAreaController.safgeAreaUpdateState(
        this.statusBarController.statusBarGetState(),
        this.navigationController.navigationBarGetState(),
        this.virtualKeyboardController.state,
        this.virtualKeyboardController.state.visible
      );
    };
    this.safeAreaControllerOnUpdate = () => {
      const targetState = { overlay: this.safeAreaController.state.overlay };
      if (targetState.overlay !== this.statusBarController.statusBarGetState().overlay) {
        this.statusBarController.statusBarSetState(targetState);
      }
      if (targetState.overlay !== this.navigationController.navigationBarGetState().overlay) {
        this.navigationController.navigationBarSetState(targetState);
      }
      if (targetState.overlay !== this.virtualKeyboardController.state.overlay) {
        this.virtualKeyboardController.virtualKeyboardSetOverlay(targetState.overlay);
      }
    };
    this.shareShare = (options) => {
      var _a2;
      (_a2 = this.shell) == null ? void 0 : _a2.shareShare(options);
    };
    this.shareController = this._wc(new ShareController(this.shareShare));
    this.toastShow = (message, duration, position3) => {
      var _a2;
      (_a2 = this.shell) == null ? void 0 : _a2.toastShow(message, duration, position3);
    };
    this.ToastController = this._wc(new ToastController(this.toastShow));
    this.torchController = this._wc(new TorchController());
    this.hapticsController = this._wc(new HapticsController());
    this.biometricsController = this._wc(new BiometricsController());
    this.navigationbarBack = () => {
      const code = `
      // 查询全部的 globalThis.__native_close_watcher_kit__
      const arr = Array.from(globalThis.__native_close_watcher_kit__._watchers.values());
      const len = arr.length;
      if(len > 0){
        arr[arr.length - 1].close()
      }else{
        history.back()
      }
    `;
      this.iframeElExcuteJavascript(code);
    };
    this.iframeElExcuteJavascript = (code) => {
      var _a2;
      const contentWindow = (_a2 = this.iframeEle) == null ? void 0 : _a2.contentWindow;
      if (!contentWindow)
        throw new Error("this.iframeEle?.contentWindow === null");
      const _eval = Reflect.get(contentWindow, "eval");
      _eval(code);
    };
  }
  _wc(c7) {
    c7.onUpdate(() => this.requestUpdate()).onInit((c8) => {
      this.controllers.add(c8);
      this.requestUpdate();
    }).onReady((c8) => {
      this.controllers.delete(c8);
      this.requestUpdate();
    });
    return c7;
  }
  get statusBarState() {
    return this.statusBarController.state;
  }
  get navigationBarState() {
    return this.navigationController.state;
  }
  get virtualKeyboardState() {
    return this.virtualKeyboardController.state;
  }
  get safeAreaState() {
    return this.safeAreaController.state;
  }
  get torchState() {
    return this.torchController.state;
  }
  connectedCallback() {
    this.statusBarController.onUpdate(this.safeAreaControllerUpdateState);
    this.navigationController.onUpdate(this.safeAreaControllerUpdateState);
    this.virtualKeyboardController.onUpdate(this.safeAreaControllerUpdateState);
    this.safeAreaController.onUpdate(this.safeAreaControllerOnUpdate);
    super.connectedCallback();
  }
  render() {
    return html`<div class="root"><emulator-toolbar .url="${this.src}"></emulator-toolbar><multi-webview-comp-mobile-shell class="main-view" id="shell">${t2(
      this.controllers.size === 0,
      () => html`<iframe referrerpolicy="no-referrer" slot="shell-content" style="width:100%;height:100%;border:0" src="${this.src}" @loadstart="${this._bindReloadShortcut}" @load="${this._load}"></iframe>`,
      () => html`<div class="boot-logo" slot="shell-content">开机中</div>`
    )}</multi-webview-comp-mobile-shell></div>`;
  }
};
__name(RootComp, "RootComp");
RootComp.styles = createAllCSS10();
__decorateClass([
  y5({ type: String })
], RootComp.prototype, "src", 2);
__decorateClass([
  y6()
], RootComp.prototype, "controllers", 2);
__decorateClass([
  y7("iframe")
], RootComp.prototype, "iframeEle", 2);
__decorateClass([
  y7("#shell")
], RootComp.prototype, "shell", 2);
RootComp = __decorateClass([
  c4(TAG10)
], RootComp);
function createAllCSS10() {
  return [
    css`:host{display:block}.root{display:flex;flex-direction:column;height:100%}.main-view{flex:1}.boot-logo{height:100%;display:grid;place-items:center;font-size:32px;color:rgba(255,255,255,.3);background:linear-gradient(-30deg,rgba(255,255,255,0) 100px,#fff 180px,#fff 240px,rgba(255,255,255,0) 300px) -300px 0 no-repeat;-webkit-background-clip:text;animation-name:boot-logo;animation-duration:6s;animation-iteration-count:infinite}@keyframes boot-logo{0%{background-position:-300px 0}100%{background-position:1000px 0}}`
  ];
}
__name(createAllCSS10, "createAllCSS");
var url = new URL(location.href);
url.searchParams.delete(
  "X-Plaoc-Emulator"
  /* EMULATOR */
);
var app = new RootComp();
app.src = url.href;
document.body.append(app);
//!此处为js ipc特有垫片，防止有些webview版本过低，出现无法支持的函数
//! use zod error: Relative import path "zod" not prefixed with / or ./ or ../ only remote
//! https://github.com/denoland/deno/issues/17598
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
/*! Bundled license information:

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
/*! Bundled license information:

lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
/*! Bundled license information:

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
/*! Bundled license information:

@lit/reactive-element/decorators/custom-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
/*! Bundled license information:

@lit/reactive-element/decorators/property.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
/*! Bundled license information:

@lit/reactive-element/decorators/property.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/state.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
/*! Bundled license information:

@lit/reactive-element/decorators/base.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/event-options.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
/*! Bundled license information:

@lit/reactive-element/decorators/base.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
/*! Bundled license information:

@lit/reactive-element/decorators/base.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-all.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
/*! Bundled license information:

@lit/reactive-element/decorators/base.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-async.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
/*! Bundled license information:

@lit/reactive-element/decorators/base.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
/*! Bundled license information:

@lit/reactive-element/decorators/base.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-nodes.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
/*! Bundled license information:

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/class-map.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
/*! Bundled license information:

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive-helpers.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/repeat.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
/*! Bundled license information:

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/style-map.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
/*! Bundled license information:

lit-html/directives/when.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
