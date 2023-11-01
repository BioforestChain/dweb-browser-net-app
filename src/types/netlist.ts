// export interface GetNetModuleList {
//   // length: number
//   list: NetList[]
//   data: {
//     last_page: number
//     list: NetList
//     page: number
//     total: number
//   }
//   last_page: number
//   page: number
//   total: number
// }

export interface GetNetModuleList {
  // length: number
  list: NetList[]
  data: {
    last_page: number
    list: NetList
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
  remark: string
  timestamp: number
  is_online: number
  created_at: string
  update_at: string
}

export interface NetList {
  id: number
  net_id: string
  domain: string
  remark: string
  timestamp: number
  is_online: number
  created_at: string
  update_at: string
}

export interface NetModuleList {
  domain: string
  netID: string
  isOnline: number
  page: number
  limit: number
  offset: number
}
