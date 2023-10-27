<script setup lang="ts">
import { onMounted, ref } from 'vue'
// import type { NetModuleList } from '@/types'
import { apiNetModuleList } from '@/api/user'
import type { NetList } from '@/types'

defineProps<{ msg: string }>()

const netModuleList = ref<NetList[]>([])
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
// const netModuleList = (values: NetModuleList[]) => {
//   apiNetModuleList(values)
// }
//offset = (pageNum - 1) * pageSize
// onMounted(async () => {
// }
// onMounted(async () => {
async function getList() {
  const res = await apiNetModuleList({
    page: page,
    domain: '',
    netID: '',
    isOnline: 0,
    limit: limit,
    offset: offset,
  })
  // 判断获取数据条数若等于0
  if (res.code != 0 && res.data.list.length === 0) {
    netModuleList.value = [] // 清空数组
    finished.value = true // 停止加载
  }
  if (res.code == 0 && res.data.list != null) {
    // netModuleList.value = res.data.list
    total = res.data.total
    netModuleList.value.push(...res.data.list)
    console.log('list.value', netModuleList.value)
    loading.value = false
  }
  if (netModuleList.value.length >= total) {
    finished.value = true
  }
}

const onLoad = () => {
  // 异步更新数据
  const timer = setTimeout(() => {
    // 定时器仅针对本地数据渲染动画效果,项目中axios请求不需要定时器
    getList() // 调用上面方法,请求数据
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
  getList()
})
methods: {
  // 上拉加载
  onLoad()
}

const onRefresh = () => {
  // 清空列表数据
  finished.value = false
  // 重新加载数据
  // 将 loading 设置为 true，表示处于加载状态
  loading.value = true
  page = 1 // 分页数赋值为1
  netModuleList.value = []
  onLoad()
}
</script>

<template>
  <div id="app">
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
        <van-cell v-for="(item, i) in netModuleList" :key="i">
          <span class="">{{ item.id }} </span>
          <!-- <span class="">{{ item.domain }}</span> -->
          <span class="">是否在线:{{ item.is_online }}</span>
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
