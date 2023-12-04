<script setup lang="ts">
import { ref } from 'vue'
import { apiAppModuleList, apiAppModuleDel } from '@/api/user'
import type { AppModuleDetail, GetAppModuleId } from '@/types'
import { GetAppModuleIdValue, GetDateStr, $toast } from '@/types'
import router from '@/router'
// import { get, set, del } from 'idb-keyval'
import { setCache, getCache, delCache } from '@/api/user'
defineProps<{ msg: string }>()
const selectedIndex = ref(-1)
const appModuleList = ref<AppModuleDetail[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const error = ref(false) // 是否加载失败
let page = 1 // 当前页
let total = 0 // 总条数
const page_size = 10 // 每页大小
const offset = (page - 1) * page_size //偏移量
const limit = 30

const className1 = 'red-text'
const className2 = 'blue-text'
const className3 = 'green-text'

function removeDuplicates(items: AppModuleDetail[]): AppModuleDetail[] {
  const map = new Map<number, AppModuleDetail>()
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
  const res = await apiAppModuleList({
    app_name: '',
    user_name: '',
    app_id: '',
    net_id: '',
    is_online: 0,
    is_install: 1,
    page: page,
    limit: limit,
    offset: offset,
  })
  const app_list: AppModuleDetail[] = []
  // 判断获取数据条数若等于0
  if (res.code != 0 && res.data.list.length === 0) {
    appModuleList.value = [] // 清空数组
    finished.value = true // 停止加载
  }
  getCache(GetAppModuleIdValue).then((existingValue: any) => {
    console.log('app mod list existValue:', existingValue)
    if (existingValue.length > 0 && existingValue.success !== false) {
      // 解析成数组
      const cleanedData = removeDuplicates(existingValue)
      // 1. 提取id
      const ids = cleanedData.map((item: any) => item.id)
      // 2. 去重
      const uniqueIds = [...new Set(ids)]
      // 3. 获取数量
      const count = uniqueIds.length
      total = res.data.total
      if (total == count) {
        appModuleList.value.push(...cleanedData)
        app_list.push(...cleanedData)
      } else if (total < count) {
        appModuleList.value.push(...res.data.list)
        app_list.push(...res.data.list)
      }
      loading.value = false
      console.log(GetDateStr.value + ' app_list1', app_list)
      setCache(GetAppModuleIdValue, app_list)
      $toast.open({
        message: '已全部加载完!',
        type: 'success',
        position: 'top',
      })
      if (appModuleList.value.length >= total) {
        finished.value = true
      }
    } else {
      if (res.code == 0 && res.data.list != null) {
        delCache(GetAppModuleIdValue).then((existingValue: any) => {
          console.log(
            GetDateStr.value + ' getModuleList  delCache existingValue ',
            existingValue,
          )
          if (existingValue.success) {
            app_list.push(...res.data.list)
            console.log(
              GetDateStr.value + ' getModuleList  delCache app_list: ',
              app_list,
            )
            setCache(GetAppModuleIdValue, app_list).then((existingValue) => {
              console.log(
                GetDateStr.value + ' getModuleList  setCache existingValue: ',
                existingValue,
              )
            })
            appModuleList.value.push(...res.data.list)
          }
        })
      }
    }
  })

  // const existingValue = localStorage.getItem(GetAppModuleIdValue)
}
const onLoad = () => {
  // 异步更新数据
  const timer = setTimeout(() => {
    // 定时器仅针对本地数据渲染动画效果,项目中axios请求不需要定时器
    getModuleList() // 调用上面方法,请求数据
    page++ // 分页数加一
    if (refreshing.value) {
      appModuleList.value = []
      refreshing.value = false
    }
    // 加载状态结束
    loading.value = false
    // 数据全部加载完成
    if (appModuleList.value.length >= total) {
      finished.value = true
    }

    finished.value && clearTimeout(timer) //清除计时器
  }, 1500)
}

const onRefresh = () => {
  finished.value = false
  // 重新加载数据
  // 将 loading 设置为 true，表示处于加载状态
  loading.value = true
  page = 1 // 分页数赋值为1
  appModuleList.value = []
  onLoad()
}
function handleAdd() {
  router.push({
    path: 'app-module-reg',
  })
}

async function delAppById(values: GetAppModuleId['id']): Promise<boolean> {
  const res = await apiAppModuleDel({
    id: values,
  })
  if (res.code == 0) {
    getCache(GetAppModuleIdValue).then((existingValue: any) => {
      if (existingValue.success) {
        const data: any = existingValue
        const newItems = data.filter(
          (item: { id: number }) => item.id !== values,
        )
        console.log(GetDateStr.value + ' newItems: ', newItems)
        delCache(GetAppModuleIdValue).then((existingValue) => {
          console.log(
            GetDateStr.value + ' delAppById delCache existingValue1: ',
            existingValue,
          )
          setCache(GetAppModuleIdValue, newItems.value)
        })
      } else {
        delCache(GetAppModuleIdValue).then((existingValue) => {
          console.log(
            GetDateStr.value + ' delAppById delCache existingValue2: ',
            existingValue,
          )
        })
        onRefresh()
      }
    })
    return true
  }
  return false
}

function handleDel(id: number) {
  const res = delAppById(id)
  console.log(GetDateStr.value + ' handleDel res ', res)
}

function onClickSelected() {
  return (selectedIndex.value = 1)
}
//nav-bar
const onClickLeft = () => history.back()
</script>

<template>
  <div id="app">
    <van-nav-bar
      title="App模块配置列表"
      right-text="新增"
      left-text="返回"
      left-arrow
      @click-right="handleAdd"
      @click-left="onClickLeft"
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
          v-for="(item, i) in appModuleList"
          :key="i"
          :title="`${item.id}_appName:${item.app_name}`"
          class="van-cell__title"
          @click="onClickSelected"
        >
          <span :class="className1">{{ item.app_id }} &nbsp;&nbsp;</span>
          <span :class="className2">{{ item.user_name }}</span>
          <span :class="className3" />&nbsp;
          <van-button size="small" type="danger" @click="handleDel(item.id)">
            删除
          </van-button>
        </van-cell>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<style scoped>
.van-cell__title {
  font-size: 0.15rem;
  overflow: hidden;
  text-overflow: ellipsis;
}
.van-cell__title span {
  white-space: pre-wrap;
  word-break: break-all;
  font-size: smaller;
}
.red-text {
  color: red;
  font: 0.8em sans-serif;
}

.blue-text {
  color: blue;
}

.green-text {
  color: green;
}
.van-cell {
  padding: 0.1rem 0.2rem 0.1rem 0;
  border-bottom: 1px solid #ccc;
  font-size: 1rem;
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
