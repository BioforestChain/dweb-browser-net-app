import { defineStore } from 'pinia'
import manifest from '../../manifest.json'

export const useManifestStore = defineStore('manifest', {
  state: () => ({
    mmid: manifest.id,
  }),
  getters: {
    // mmid: (state) => state.mmid,
  },
  actions: {},
  persist: {
    storage: localStorage,
  },
})
