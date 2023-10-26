import request from '@/utils/http'
import type { NetForm } from '@/types'
// api枚举
enum Api {
  Login = '/login',
  NetModuleReg = '/proxy/user/net-module-reg',
}

// 用户信息
interface UserInfo {
  userName: string
}
interface NetModuleRegInfo {
  domain: string
  net_id: string
  secret: string
}

/**
 * 登录
 */
export const accountLogin = () => {
  return request<UserInfo>({
    url: Api.Login,
    method: 'get',
  })
}

export const netModuleReg = (values: NetForm[]) => {
  return request<NetModuleRegInfo>({
    url: Api.NetModuleReg,
    method: 'post',
    data: values,
  })
}
