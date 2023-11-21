<script setup lang="ts">
import { onMounted, ref } from 'vue'
// import type { NetModuleList } from '@/types'
import { apiNetModuleList, getCache, setCache, delCache } from '@/api/user'
import type { NetModuleDetail } from '@/types'
import { GetNetModuleIdValue, GetDateStr, $toast } from '@/types'
import router from '@/router'

defineProps<{ msg: string }>()
const selectedIndex = ref(-1)
const netModuleList = ref<NetModuleDetail[]>([])
// const netModuleList = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const error = ref(false) // 是否加载失败
let page = 1 // 当前页
let total = 0 // 总条数
const page_size = 10 // 每页大小
const offset = (page - 1) * page_size //偏移量
const limit = 30
function removeDuplicates(items: NetModuleDetail[]): NetModuleDetail[] {
  const map = new Map<number, NetModuleDetail>()
  items.forEach((item) => {
    const existing = map.get(item.id)
    if (existing) {
      if (existing.timestamp < item.timestamp) {
        map.set(item.id, item)
      }
    } else {
      map.set(item.id, item)
    }
  })
  return Array.from(map.values())
}
async function getModuleList() {
  const res = await apiNetModuleList({
    page: page,
    domain: '',
    netID: '',
    isOnline: 0,
    limit: limit,
    offset: offset,
  })
  let net_list: NetModuleDetail[] = []
  // 判断获取数据条数若等于0
  if (res.code != 0 && res.data.list.length === 0) {
    netModuleList.value = [] // 清空数组
    finished.value = true // 停止加载
  }
  // const existingValue = localStorage.getItem(GetNetModuleIdValue)
  type NetModuleDetails = NetModuleDetail[] | undefined | null
  getCache<NetModuleDetails>(GetNetModuleIdValue).then((existingValue) => {
    if (existingValue != null || existingValue != undefined) {
      // 解析成数组
      const cleanedData = removeDuplicates(existingValue)
      console.log('cleanedData data', cleanedData)
      // 1. 提取id
      const ids = cleanedData.map((item: any) => item.id)
      // 2. 去重
      const uniqueIds = [...new Set(ids)]
      // 3. 获取数量
      const count = uniqueIds.length
      if (res.code == 0 && res.data.list != null) {
        total = res.data.total
        if (total == count) {
          netModuleList.value.push(...cleanedData)
          setCache(GetNetModuleIdValue, cleanedData)
          // localStorage.setItem(GetNetModuleIdValue, JSON.stringify(cleanedData))
        } else {
          netModuleList.value.push(...res.data.list)
        }
        loading.value = false
      } else {
        $toast.open({
          message: '已全部加载完!',
          type: 'success',
          position: 'top',
        })
        if (netModuleList.value.length >= total) {
          finished.value = true
        }
      }
    } else {
      if (res.code == 0 && res.data.list != null) {
        if (
          existingValue === undefined ||
          existingValue === null ||
          existingValue === '[]'
        ) {
          // localStorage.removeItem(GetNetModuleIdValue)
          delCache(GetNetModuleIdValue)
        } else {
          net_list = existingValue
        }
        net_list.push(...res.data.list)
        console.log(GetDateStr.value + ' net_list', net_list)
        setCache(GetNetModuleIdValue, net_list)
        // localStorage.setItem(GetNetModuleIdValue, JSON.stringify(net_list))
        netModuleList.value.push(...res.data.list)
      }
    }
  })
}
const onLoad = () => {
  // 异步更新数据
  const timer = setTimeout(() => {
    // 定时器仅针对本地数据渲染动画效果,项目中axios请求不需要定时器
    getModuleList() // 调用上面方法,请求数据
    page++ // 分页数加一
    if (refreshing.value) {
      netModuleList.value = []
      refreshing.value = false
    }
    // 加载状态结束
    loading.value = false
    // 数据全部加载完成
    if (netModuleList.value.length >= total) {
      finished.value = true
    }

    finished.value && clearTimeout(timer) //清除计时器
  }, 1500)
}

onMounted(async () => {
  // getModuleList()
})
// methods: {
//   // 上拉加载
//   onLoad()
// }

const onRefresh = () => {
  // 清空列表数据
  // localStorage.removeItem(getNetModuleId)
  delCache(GetNetModuleIdValue)
  finished.value = false
  // 重新加载数据
  // 将 loading 设置为 true，表示处于加载状态
  loading.value = true
  page = 1 // 分页数赋值为1
  netModuleList.value = []
  onLoad()
}
function handleAdd() {
  router.push({
    path: '/',
    // query: {
    //   id,
    // },
  })
}

//handleEdit
function handleEdit(id: number) {
  router.push({
    path: '/',
    query: {
      id,
    },
  })
}
//cell selected
function onClickSelected() {
  // selected.value = 1
  return (selectedIndex.value = 1)
  //van-cell--no-selected
}
// function selectedClasses() {
//   return selectedIndex.value > -1 ? [selectedIndex.value] : []
// }
</script>

<template>
  <div id="app">
    <van-nav-bar
      title="网络模块配置列表"
      right-text="新增"
      @click-right="handleAdd"
    />
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        v-model:error="error"
        :finished="finished"
        finished-text="没有更多了"
        offset="300"
        error-text="请求失败，点击重新加载"
        @load="onLoad"
      >
        <!-- <van-cell v-for="item in list" :key="item" :title="item" /> -->
        <van-cell
          v-for="(item, i) in netModuleList"
          :key="i"
          :selected="item.is_selected"
          @click="onClickSelected"
        >
          <span
            class="selectedIndex.value === i ? 'van-cell--selected' : 'van-cell--no-selected'"
          >
            &nbsp;
          </span>
          <span class="">{{ item.domain }},</span>
          <span class="">是否在线:{{ item.is_online }}</span>
          <van-button type="default" @click="handleEdit(item.id)">
            修改
          </van-button>
        </van-cell>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<style scoped>
.van-cell {
  padding: 0.1rem 0.2rem 0.1rem 0;
  border-bottom: 1px solid #ccc;
  font-size: 1rem;
}
.van-cell--selected {
  background-color: #00a508;
}

#app {
  width: 100%;
  height: 100%;
}

a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  padding: 2px 4px;
  color: #304455;
  background-color: #eee;
  border-radius: 4px;
}
</style>
