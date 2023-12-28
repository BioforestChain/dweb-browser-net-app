import { BasePlugin, $MMID } from '@plaoc/plugins'
import { useManifestStore } from '@/stores'

class IDB extends BasePlugin {
  get<T>(keyVal: string) {
    const s = new URLSearchParams()
    s.set('key', keyVal)
    return this.fetchApi('/cache', { method: 'GET', search: s }).object<T>()
  }

  set<T>(key: string, val: any) {
    return this.fetchApi('/cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: val }),
    }).object<T>()
  }

  del<T>(keyVal: string) {
    const s = new URLSearchParams()
    s.set('key', keyVal)

    return this.fetchApi('/cache', { method: 'DELETE', search: s }).object<T>()
  }

  getApps<T>() {
    return this.fetchApi('/apps', { method: 'GET' }).object<T>()
  }

  reconnect<T>() {
    return this.fetchApi('/reconnection', { method: 'POST' }).object<T>()
  }

  shutdown<T>() {
    return this.fetchApi('/reconnection', { method: 'PUT' }).object<T>()
  }

  health<T>() {
    return this.fetchApi('/health', { method: 'GET' }).object<T>()
  }
}

// const m = useManifestStore()
// console.log("useManifestStore().mmid: ", useManifestStore().mmid, m.mmid)

const iDB = new IDB(useManifestStore().mmid as $MMID)

export default iDB
