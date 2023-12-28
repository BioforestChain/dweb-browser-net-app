import { useManifestStore } from '@/stores'

// TODO 由于桌面版的file.std.dweb没开发，所以公私钥暂时放indexedDB，仅用于开发目的
export const priPubCacheKey = `${useManifestStore().mmid}_tmp`

// 使用私钥签名
export async function sign(privateKeyText: string, data: Uint8Array) {
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
export async function verify(
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
