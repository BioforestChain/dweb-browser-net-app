import manifest from '../manifest.json'
import { get, set } from 'idb-keyval'

// 生成 RSA 密钥对
// 填充方案使用RSASSA-PKCS1-v1_5而不是RSA-OAEP，这里的密钥对只是用来数字签名的
// 要进行数据加解密，要使用RSA-OAEP，但我们这个场景里是客户端生成公私钥，用私钥签名，服务端用公钥验证
async function generateRSAKeyPair() {
  try {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['sign', 'verify'],
    )

    // 导出公钥和私钥的值
    const publicKeyData = await crypto.subtle.exportKey(
      'spki',
      keyPair.publicKey,
    )
    const privateKeyData = await crypto.subtle.exportKey(
      'pkcs8',
      keyPair.privateKey,
    )

    // 将值转换为 Base64 编码的字符串
    const publicKeyText = arrayBufferToBase64(publicKeyData)
    const privateKeyText = arrayBufferToBase64(privateKeyData)
    return { publicKey: publicKeyText, privateKey: privateKeyText }
  } catch (error) {
    console.error('Error generating RSA key pair: ', error)
    throw error
  }
}

// 使用私钥签名
async function sign(privateKeyText: string, data: Uint8Array) {
  try {
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      base64ToArrayBuffer(privateKeyText),
      { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
      true,
      ['sign'],
    )

    const signature = await crypto.subtle.sign(
      { name: 'RSASSA-PKCS1-v1_5' },
      privateKey,
      data,
    )

    const signatureText = arrayBufferToBase64(signature)
    return signatureText
  } catch (error) {
    console.error('Error signing data with private key: ', error)
    throw error
  }
}

// 使用公钥验证签名
async function verify(
  publicKeyText: string,
  signatureText: string,
  data: Uint8Array,
) {
  try {
    const signature = base64ToArrayBuffer(signatureText)
    const publickKey = await crypto.subtle.importKey(
      'spki',
      base64ToArrayBuffer(publicKeyText),
      { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
      true,
      ['verify'],
    )

    const isValid = await crypto.subtle.verify(
      { name: 'RSASSA-PKCS1-v1_5' },
      publickKey,
      signature,
      data,
    )

    return isValid
  } catch (error) {
    console.error('Error verify data with publick key: ', error)
    throw error
  }
}

// TODO 由于桌面版的file.std.dweb没开发，所以公私钥暂时放indexedDB，仅用于开发目的
const priPubCacheKey = `${manifest.id}_tmp`

export const checkOrCreateKey = async () => {
  const data = await getPriPubKey()

  if (data.length == 0) {
    // 不存在，则重新生成
    const { privateKey, publicKey } = await generateRSAKeyPair()
    try {
      await set(priPubCacheKey, [privateKey, publicKey])
    } catch (error) {
      console.error('save private public key err: ', error)
    }
  }
}

const getPriPubKey = async () => {
  let keys: [] | undefined
  try {
    keys = await get(priPubCacheKey)
  } catch (error) {
    console.error(error)
  }

  return keys ? keys : []
}

export const makeSignature = async (data: string) => {
  const priPubKey = await getPriPubKey()
  if (priPubKey.length == 0) {
    console.error('getSign error')
    return
  }

  // 消息转ArrayBuffer
  const encodedData = new TextEncoder().encode(data)

  const signatureText = await sign(priPubKey[0], encodedData)
  return signatureText
}

// for test
export const testCodec = async () => {
  const priPubKey = await getPriPubKey()
  if (priPubKey.length == 0) {
    console.error('codec error')
    return
  }

  console.log('get priKey from cache:', priPubKey[0])
  console.log('get pubKey from cache:', priPubKey[1])

  // 消息转ArrayBuffer
  const data = new TextEncoder().encode('Message to sign')

  const signatureText = await sign(priPubKey[0], data)
  const isValid = await verify(priPubKey[1], signatureText, data)
  console.log('codec result: ', isValid)
}

// 将 ArrayBuffer 转换为 Base64 字符串
function arrayBufferToBase64(buffer: ArrayBuffer) {
  const binary = String.fromCharCode(...new Uint8Array(buffer))
  return btoa(binary)
}

// 将 Base64 字符串转换为 ArrayBuffer
function base64ToArrayBuffer(base64String: string) {
  const binaryString = atob(base64String)
  const byteArray = new Uint8Array(binaryString.length)

  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i)
  }

  return byteArray.buffer
}
