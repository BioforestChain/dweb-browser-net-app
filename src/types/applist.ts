import { GetNetModuleIdValue } from './netform'

export const GetAppModuleIdValue = GetNetModuleIdValue + '_appModuleList'
export interface GetAppModuleList {
  // length: number
  list: AppModuleDetail[]
  data: {
    last_page: number
    list: AppModuleDetail
    page: number
    total: number
  }
  last_page: number
  page: number
  total: number
}

export interface GetAppModuleData {
  data: any
}

//GetAppModuleDetailById
export interface GetAppModuleId {
  id: number
}

export interface AppModuleInfo {
  mmid: string
  name: string
  icons: string
  netId: string
  userName: string
  appId: string
  appName: string
}

export interface AppModuleDetail {
  id: number
  app_id: string
  app_name: string
  net_id: string
  user_name: string
  remark: string
  timestamp: number
  is_install: number
  is_online: number
  created_at: string
  update_at: string
}

export interface AppModuleList {
  app_name: string
  user_name: string
  net_id: string
  app_id: string
  is_online: number
  is_install: number
  page: number
  limit: number
  offset: number
}
