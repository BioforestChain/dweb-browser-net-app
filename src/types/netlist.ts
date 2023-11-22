export interface GetNetModuleList {
  // length: number
  list: NetModuleDetail[]
  data: {
    last_page: number
    list: NetModuleDetail
    page: number
    total: number
  }
  last_page: number
  page: number
  total: number
}

//GetNetModuleDetailById
export interface GetNetModuleId {
  id: number
}
export interface NetModuleDetail {
  id: number
  net_id: string
  domain: string
  root_domain: string
  prefix_domain: string
  port: number
  remark: string
  timestamp: number
  is_online: number
  created_at: string
  update_at: string
  is_selected: number
  secret: string
}

export interface NetModuleList {
  domain: string
  netID: string
  isOnline: number
  page: number
  limit: number
  offset: number
}
