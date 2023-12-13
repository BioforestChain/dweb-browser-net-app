import { defineStore } from 'pinia'
import { UserInfo } from '@/types/store'

interface State {
  userInfo: UserInfo
  token: string
  currentNetModulePrimaryId: number
  currentNetModuleDomain: string
  currentNetModuleId: string
  currentNetModuleConnectionStatus: string
}

export const useUserStore = defineStore('userStore', {
  state(): State {
    return {
      userInfo: {
        userName: '',
        userId: '',
      },
      token: '',
      currentNetModulePrimaryId: 0,
      currentNetModuleDomain: '',
      currentNetModuleId: '',
      currentNetModuleConnectionStatus: 'warning',
    }
  },
  actions: {
    /**
     * 修改用户信息
     * @param {UserInfo} userInfo 用户信息
     */
    changeUserName(userInfo: UserInfo) {
      this.userInfo = userInfo
    },
  },
  persist: {
    storage: localStorage,
  },
})
