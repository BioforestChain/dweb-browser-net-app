import { useLocalStorage } from '@vueuse/core'

interface NetInfo {
  url: string
  port: number
  secret: string
  domain: string
  net_id: string
}

const cache = {
  config: {
    url: 'ws://127.0.0.1',
    port: 8000,
    secret: 'test',
    domain: 'test',
    net_id: '',
  },
  whiteList: [],
}

type CacheVaueType = typeof cache
type Keys = keyof CacheVaueType

export function useLocalCache() {
  function getCache<T extends Keys>(key: T): CacheVaueType[T] {
    return useLocalStorage(key, cache[key]).value
  }

  function setCache<T extends Keys>(key: T, value: CacheVaueType[T]) {
    useLocalStorage(key, cache[key]).value = value
  }

  function removeCache(key: Keys) {
    useLocalStorage(key, cache[key]).value = null
  }

  function clearCache() {
    localStorage.clear()
  }

  return { getCache, setCache, removeCache, clearCache }
}
