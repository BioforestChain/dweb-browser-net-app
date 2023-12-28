import manifest from '../../manifest.json'
import { useDateFormat, useNow } from '@vueuse/core'
import { useUserStore } from '@/stores'
export const GetNetModuleIdFromCfg = ref(`${manifest.id}`)
export const GetDateStr = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm:ss')
import { useToast } from 'vue-toast-notification'
export const $toast = useToast()
export const GetNetModuleIdValue = GetNetModuleIdFromCfg.value
export const GetUseUserStore: any = useUserStore()
export interface NetForm {
  id: number
  serverAddr: string
  netID: string
  rootDomain: string
  secret: string
  port: string
  publicKey: string
}

export interface NetModuleRegInfo {
  domain: string
  net_id: string
  secret: string
}
