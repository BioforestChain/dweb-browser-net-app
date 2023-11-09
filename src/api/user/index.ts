import request from '@/utils/http'
import type {
  NetForm,
  NetModuleRegInfo,
  GetNetModuleList,
  NetModuleList,
  GetNetModuleId,
  NetModuleDetail,
} from '@/types'

import { ConfigPlugin } from '@plaoc/plugins'

interface T {
  name: string
  age: number
}

class Test extends ConfigPlugin {
  async getNetInfo() {
    const url = '/test'
    return this.fetchApi(url).object<T>
  }
}

// api枚举
enum Api {
  NetModuleReg = '/proxy/user/net-module-reg',
  NetModuleList = '/proxy/user/net-module-list',
  NetModuleDetail = '/proxy/user/net-module-detail',
}

export const apiNetModuleReg = (values: NetForm[]) => {
  return request<NetModuleRegInfo>({
    url: Api.NetModuleReg,
    method: 'post',
    data: values,
  })
}

export const apiNetModuleDetail = (values: GetNetModuleId) => {
  return request<NetModuleDetail>({
    url: Api.NetModuleDetail,
    method: 'get',
    params: values,
  })
}

// export const apiNetModuleList = (values: NetModuleList[]) => {
export const apiNetModuleList = (values: NetModuleList) => {
  return request<GetNetModuleList>({
    url: Api.NetModuleList,
    method: 'get',
    params: values,
  })
}
