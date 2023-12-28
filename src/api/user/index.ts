import request from '@/utils/http'
import iDB from '@/utils/cache'

import type {
  NetForm,
  NetModuleList,
  GetNetModuleList,
  GetNetModuleId,
  NetModuleDetail,
  AppForm,
  AppModuleList,
  GetAppModuleList,
  GetAppModuleId,
  AppModuleDetail,
  GetAppModuleData,
} from '@/types'

// api枚举
enum Api {
  NetModuleReg = '/proxy/user/net-module-reg',
  NetModuleList = '/proxy/user/net-module-list',
  NetModuleDetail = '/proxy/user/net-module-detail',

  AppModuleReg = '/proxy/user/app-module-reg',
  AppModuleDel = '/proxy/user/app-module-del',
  AppModuleList = '/proxy/user/app-module-list',
  AppModuleDetail = '/proxy/user/app-module-detail',
}

export const apiNetModuleReg = (values: NetForm) => {
  return request<NetModuleDetail>({
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

export const apiNetModuleList = (values: NetModuleList) => {
  return request<GetNetModuleList>({
    url: Api.NetModuleList,
    method: 'get',
    params: values,
  })
}

export const apiAppModuleReg = (values: AppForm['arrayAppIdInfo']) => {
  return request<AppModuleDetail>({
    url: Api.AppModuleReg,
    method: 'post',
    data: values,
  })
}

export const apiAppModuleDetail = (values: GetAppModuleId) => {
  return request<AppModuleDetail>({
    url: Api.AppModuleDetail,
    method: 'get',
    params: values,
  })
}

export const apiAppModuleList = (values: AppModuleList) => {
  return request<GetAppModuleList>({
    url: Api.AppModuleList,
    method: 'get',
    params: values,
  })
}

export const apiAppModuleDel = (values: GetAppModuleId) => {
  return request<GetAppModuleData>({
    url: Api.AppModuleDel,
    method: 'post',
    data: values,
  })
}

export function getApps<T>(): Promise<T> {
  return iDB.getApps<T>()
}

export function reconnect<T>(): Promise<T> {
  return iDB.reconnect<T>()
}

export function shutdown<T>(): Promise<T> {
  return iDB.shutdown<T>()
}
export function health<T>(): Promise<T> {
  return iDB.health<T>()
}

export function getCache<T>(keyVal: string): Promise<T> {
  return iDB.get<T>(keyVal)
}

export function setCache<T>(key: string, val: object): Promise<T> {
  return iDB.set(key, val)
}

export function delCache<T>(key: string): Promise<T> {
  return iDB.del(key)
}
