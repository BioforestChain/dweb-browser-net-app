import { priPubCacheKey, sign } from '@/utils/crypto'
import iDB from '@/utils/cache'

// for test
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

const getPriPubKey = async () => {
  let keys: [] | undefined
  try {
    keys = await iDB.get<[]>(priPubCacheKey)
  } catch (error) {
    console.error(error)
  }

  return keys ? keys : []
}
