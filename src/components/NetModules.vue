<script setup lang="ts">
import { ref } from 'vue'
import type { NetForm, NetModuleDetail } from '@/types'
import {
  apiNetModuleReg,
  apiNetModuleDetail,
  setCache,
  getCache,
  reconnect,
  shutdown,
  health,
} from '@/api/user'
import { useRoute } from 'vue-router'
import { GetNetModuleIdValue, GetUseUserStore } from '@/types'
import { GetDateStr, $toast } from '@/types'
import { showConfirmDialog } from 'vant'
import { priPubCacheKey } from '@/utils/crypto'

defineProps<{ msg: string }>()

const tagType = ref(GetUseUserStore.currentNetModuleConnectionStatus)
const useRouteObj = useRoute()

const idValue = ref(0)
const serverAddrValue = ref('') //服务地址
const portValue = ref(80)
const keyValue = ref('')
const prefixBroadcastAddressValue = ref('')
const suffixBroadcastAddressValue = ref('')
const broadcastAddressValue = ref('')
//broadcast_address
const regexDomain =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/
const prefixBroadcastAddressFormatter = (value: string) => {
  // return value.replace(/[^a-z0-9]/gi, '')
  if (/[^a-z.\d]/i.test(value)) {
    return ''
  } else {
    return value
  }
}
const portFormatter = (value: string) => {
  return value.replace(/[^0-9]/gi, '')
}
// 服务地址格式化
const serverAddrFormatter = (value: string) => {
  if (/[^a-z.\d]/i.test(value)) {
    return ''
  } else {
    return value
  }
}
// 服务地址校验 校验函数返回 true 表示校验通过，false 表示不通过
const patternRootDomain = (val: string) => {
  if (!regexDomain.test(val)) {
    return `${val} 不合法的域名，请重新输入`
  }
}

if (GetUseUserStore.currentNetModuleId.length === 0) {
  GetUseUserStore.currentNetModuleId = GetNetModuleIdValue
}
const net_list: NetModuleDetail[] = []
/*Tips 提示语*/
function showConnStatusMsg(wsRes: { success: boolean; message: string }) {
  showLoading(true)
  const span = document.getElementById('showConnStatusMsg')!
  console.log(GetDateStr + ' showConnStatusMsg ', wsRes)
  if (wsRes.success) {
    span.className = 'green'
  } else {
    span.className = 'red'
  }
  showLoading(false)
  setTimeout(() => {
    showMask(false)
  }, 1000)
  span.innerText = wsRes.message
}
//回填
getCache(GetNetModuleIdValue).then(async (existingValue: any) => {
  console.log(GetDateStr + ' init existingValue: ', existingValue)
  if (!existingValue.success && typeof existingValue[0] !== 'undefined') {
    if (GetUseUserStore.currentNetModulePrimaryId == 0) {
      GetUseUserStore.currentNetModulePrimaryId = existingValue[0].id
    }

    if (existingValue[0].hasOwnProperty('id') && existingValue[0].id)
      paddingDataForm(existingValue[0], existingValue[0].id)
  }
})

async function postNetModuleForm(values: NetForm) {
  const res = await apiNetModuleReg(values)
  if (res.code == 0 && res.data.id > 0) {
    console.log(GetDateStr + ' postNetModuleForm res', res)
    res.data.secret = keyValue.value
    if (GetUseUserStore.currentNetModulePrimaryId == 0) {
      GetUseUserStore.currentNetModulePrimaryId = res.data.id
    }
    GetUseUserStore.currentNetModuleDomain = res.data.domain
    getCache(GetNetModuleIdValue)
      .then(async (existingValue) => {
        if (existingValue === undefined || existingValue === null) {
          console.log(GetDateStr + ' post existingValue ', existingValue)
          net_list.push(res.data)
        } else {
          const index = net_list.findIndex((item) => item.id == res.data.id)
          //遍历存在的 然后当下提交的是最新的，若有相同的id覆盖之 //否则新增
          index !== -1 ? (net_list[index] = res.data) : net_list.push(res.data)
        }
        //启动连接  onConnectNet
        onConnectNet()
      })
      .catch((err) => console.error(err))

    //TODO 后期视体验升级 跳列表页面
    // router.push({
    //   name: 'net-module-list',
    // })
  } else if (res.code > 0 && res.message.length > 0) {
    $toast.open({
      message: res.message,
      type: 'error',
      position: 'top',
    })
  } else {
    $toast.open({
      message: '请稍后再试!',
      type: 'error',
      position: 'top',
    })
  }
}

function onConnectNet() {
  //启动连接操作
  setCache(GetNetModuleIdValue, net_list).then(async () => {
    const wsRes = await reconnect<{ success: boolean; message: string }>()
    console.log(GetDateStr.value + ' ws res: ', wsRes)
    showConnStatusMsg(wsRes)
    GetUseUserStore.currentNetModuleConnectionStatus = 'warning'
    if (wsRes.success) {
      $toast.open({
        message: '启动成功!',
        type: 'success',
        position: 'top',
      })
      GetUseUserStore.currentNetModuleConnectionStatus = 'success'
      // tagType.value = GetUseUserStore.currentNetModuleConnectionStatus
    } else {
      $toast.open({
        message: '启动失败!',
        type: 'error',
        position: 'top',
      })
      GetUseUserStore.currentNetModuleConnectionStatus = 'danger'
    }
    tagType.value = GetUseUserStore.currentNetModuleConnectionStatus
  })
}

// TODO 编辑
// 获取地址栏参数
let queryId: any = useRouteObj.query.id
console.log('queryId,', queryId)
if (queryId != null) {
  editNetForm(queryId)
} else {
  queryId = 0
}

async function editNetForm(queryId: any) {
  const existingValue: any = localStorage.getItem(GetNetModuleIdValue)
  if (
    existingValue === undefined ||
    existingValue === null ||
    existingValue === '[]' ||
    (Array.isArray(existingValue) && existingValue.length)
  ) {
    //api detail by id
    const res = GetNetModuleDetail(queryId)
    console.log('GetNetModuleDetail1', res)
    // const dataDetail = res.data
  } else {
    const editFormArr: NetModuleDetail[] = JSON.parse(existingValue)
    editFormArr.forEach((element) => {
      if (element.id == queryId) {
        paddingDataForm(element, queryId)
      } else {
        // GetNetModuleDetail(queryId)
      }
    })
    // editFormArr.forEach((element) => {
    //   if (element.id == queryId) {
    //     //如果有原list存在,原基础更新
    //     //  const existingValue = localStorage.getItem(GetNetModuleIdValue)
    //     net_list = JSON.parse(existingValue)
    //     const index = editFormArr.findIndex((item) => item.id == queryId)
    //     //遍历存在的 然后当下提交的是最新的，若有相同的id覆盖之
    //     if (index !== -1) {
    //       net_list[index] = element
    //     } else {
    //       //否则新增
    //       net_list.push(element)
    //     }
    //     // net_list.push(getModulesDetail.data)
    //     console.log(
    //       GetDateStr.value + 'editNetForm existing net_list',
    //       net_list,
    //     )
    //   }
    // })
    // localStorage.setItem(GetNetModuleIdValue, JSON.stringify(net_list))
    // const res = GetNetModuleDetail(queryId)
    // console.log('GetNetModuleDetail2', res)
  }
}
async function GetNetModuleDetail(queryId: any) {
  //本地没有
  const getModulesDetail = await apiNetModuleDetail({
    id: queryId,
  })
  console.log('getModulesDetail', getModulesDetail)
  if (getModulesDetail.code == 0 && getModulesDetail.data.id == queryId) {
    paddingDataForm(getModulesDetail.data, queryId)
  }
  return getModulesDetail
}
//填充到form里
function paddingDataForm(element: any, queryId: any) {
  const targetItem = element
  idValue.value = queryId
  serverAddrValue.value = targetItem.domain
  portValue.value = targetItem.port
  keyValue.value = targetItem.secret
  prefixBroadcastAddressValue.value = targetItem.prefix_broadcast_address
  suffixBroadcastAddressValue.value = getSuffixDomain(serverAddrValue.value)
  broadcastAddressValue.value =
    prefixBroadcastAddressValue.value + suffixBroadcastAddressValue.value
}

//新增
let throttleBool = true //全局变量
const onSubmit = async (values: NetForm) => {
  // TODO 公钥不应该从缓存里取，后续要从dweb_browser的秘钥管理器里取
  // 这里只是为了测试
  const priPubKey = await getCache<string[]>(priPubCacheKey)
  if (priPubKey.length != 2) {
    showConfirmDialog({
      title: '提醒',
      message: '公私钥未生成',
      theme: 'round-button',
      closeOnPopstate: true,
    })
    return
  }

  values.publicKey = priPubKey[1]

  showConfirmDialog({
    title: '提醒',
    message: '是否启动连接？',
    theme: 'round-button',
    closeOnPopstate: true,
  })
    .then(async () => {
      showLoading(true)
      if (throttleBool) {
        //第一次执行，之后1秒内不再执行
        idValue.value = GetUseUserStore.currentNetModulePrimaryId
        values.id = GetUseUserStore.currentNetModulePrimaryId
        postNetModuleForm(values)
        throttleBool = false
        setTimeout(() => {
          showLoading(false)
          throttleBool = true
        }, 1000)
      } else {
        console.log('不执行')
      }
    })
    .catch(() => {
      //
      $toast.open({
        message: '取消!',
        type: 'error',
        position: 'top',
      })
      showLoading(false)
    })
}

const onFailed = (errorInfo: NetForm[]) => {
  $toast.open({
    message: '请查看相关提示!',
    type: 'error',
    position: 'top',
    // all of other options may go here
  })
  console.log('failed', errorInfo)
}
//nav-bar
const onClickLeft = () => history.back()

const onDisconnectNet = () => {
  showConfirmDialog({
    title: '提醒',
    message: '是否断开连接？',
    theme: 'round-button',
    closeOnPopstate: true,
  })
    .then(async () => {
      const shutdownRes = await shutdown<{
        success: boolean
        message: string
      }>()
      console.log(GetDateStr.value + ' shutdownRes', shutdownRes)
      $toast.open({
        message: '断开!',
        type: 'success',
        position: 'top',
      })
      // 判断connect状态
      GetUseUserStore.currentNetModuleConnectionStatus = 'danger'
      console.log('btnonDisconnectNet on confirm')

      showConnStatusMsg(shutdownRes)
      tagType.value = GetUseUserStore.currentNetModuleConnectionStatus
    })
    .catch(() => {
      //
      $toast.open({
        message: '取消!',
        type: 'error',
        position: 'top',
      })
      showLoading(false)
      // tagType.value = 'success'
      console.log('btnonDisconnectNet on cancel')
    })
}
async function getHealthState() {
  const healthRes = await health<{
    success: boolean
    data: { code: number }
    message: string
  }>()
  // console.log(GetDateStr.value + ' health res: ', healthRes)
  const span = document.getElementById('showConnStatusMsg')!
  if (healthRes.success) {
    span.innerText = healthRes.message
    switch (healthRes.data.code) {
      case 0:
        GetUseUserStore.currentNetModuleConnectionStatus = 'warning'
        span.className = 'orange'
        return (tagType.value = 'warning')
      case 1:
        GetUseUserStore.currentNetModuleConnectionStatus = 'success'
        span.className = 'green'
        return (tagType.value = 'success')
      case 2:
        GetUseUserStore.currentNetModuleConnectionStatus = 'danger'
        span.className = 'red'
        return (tagType.value = 'danger')
    }
  }
}
// light state
setInterval(getHealthState, 3000)

// TODO
// function handleEdit(id: number) {
//   router.push({
//     path: '/',
//     query: {
//       id,
//     },
//   })

function showMask(display: boolean) {
  const mask = document.getElementById('mask')!
  display ? (mask.style.display = 'block') : (mask.style.display = 'none')
}

function showLoading(display: boolean) {
  showMask(true)
  const load = document.getElementById('loading')!
  display ? (load.style.display = 'block') : (load.style.display = 'none')
}

//suffixBroadcastAddressValue
function getSuffixDomain(hostname: string): string {
  if (regexDomain.test(hostname)) {
    const parts = hostname.split('.')
    suffixBroadcastAddressValue.value =
      '.' + parts[parts.length - 2] + '.' + parts[parts.length - 1]
    const span = document.getElementById('mySpan')!
    span.innerText = suffixBroadcastAddressValue.value
    return suffixBroadcastAddressValue.value
  }
  return ''
}

function onBlurInputPrefixBA() {
  return (broadcastAddressValue.value =
    prefixBroadcastAddressValue.value + suffixBroadcastAddressValue.value)
}
</script>

<!--页面-->
<template>
  <div id="app">
    <van-nav-bar
      title="网络模块配置"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />
    <!-- 遮罩层 -->
    <div id="mask" />
    <van-form id="net-form" @failed="onFailed" @submit="onSubmit">
      <van-cell-group inset>
        <div class="van-tag--mini tag-div">
          <!-- <van-tag round type="success"> 连接 </van-tag>
          <van-tag round type="danger"> 断开 </van-tag> -->
          <van-tag
            class="show-on-connect-net-status"
            round
            color="grep"
            :type="tagType"
          />&nbsp;&nbsp;&nbsp;
        </div>

        <van-field v-model="idValue" type="hidden" name="id" />
        <van-field
          v-model="broadcastAddressValue"
          type="hidden"
          name="broadcast_address"
        />
        <van-field
          v-model="serverAddrValue"
          type="text"
          :formatter="serverAddrFormatter"
          label="服务地址(address):"
          placeholder="请输入网络服务地址"
          name="server_addr"
          required
          :rules="[{ required: true, validator: patternRootDomain }]"
          @blur="getSuffixDomain(serverAddrValue)"
        />
        <van-field
          v-model="portValue"
          type="number"
          maxlength="5"
          :formatter="portFormatter"
          label="端口(port):"
          placeholder="请输入端口"
          name="port"
          required
          :rules="[{ required: true, message: '请填写正确内容' }]"
          @blur="portValue = $event.target.value"
        />
        <van-field
          v-model="keyValue"
          type="text"
          label="密钥:"
          placeholder="请输入密钥"
          name="secret"
          required
          :rules="[{ required: true, message: '请填写正确内容' }]"
          @blur="keyValue = $event.target.value"
        />
        <van-field
          v-model="prefixBroadcastAddressValue"
          label="广播地址:"
          :formatter="prefixBroadcastAddressFormatter"
          type="text"
          placeholder="请输入广播地址前缀"
          required
          :rules="[{ required: true, message: '请填写正确内容' }]"
          label-width="mini"
          @blur="onBlurInputPrefixBA"
        >
          <template #button>
            <span id="mySpan" size="small" type="text" readonly disabled />
          </template>
        </van-field>

        <van-field
          v-model="GetNetModuleIdValue"
          label="网络模块id:"
          :formatter="serverAddrFormatter"
          type="text"
          placeholder="请输入"
          name="netId"
          required
          readonly
          disabled
          :rules="[{ required: true, message: '请填写正确内容' }]"
          @blur="GetNetModuleIdValue = $event.target.value"
        />
      </van-cell-group>
      <div id="loading-div">
        <van-loading id="loading" type="spinner" color="#1989fa" />
      </div>
      <div class="button-container">
        <van-button type="danger" round block @click="onDisconnectNet">
          断开连接
        </van-button>
        <van-button
          round
          block
          class="button-margin"
          type="primary"
          native-type="submit"
        >
          启动连接
        </van-button>
      </div>
      <div>
        <span
          id="showConnStatusMsg"
          size="small"
          type="text"
          readonly
          disabled
        />
      </div>
    </van-form>
  </div>
</template>

<style scoped>
#app {
  width: 100%;
  height: 100%;
}
.tag-div {
  float: right;
  display: flex;
  padding-top: 0.8rem;
}
.button-container {
  margin: 5rem;
  display: flex;
  justify-content: space-between;
}
.button-margin {
  margin-right: 10px;
}
a {
  color: #42b983;
}
.switch-check {
  margin-top: 0.5rem;
  float: right;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}
#loading-div {
  text-align: center; /*让div内部文字居中*/
  border-radius: 1rem;
  position: relative;
  display: flex;
  align-items: center;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
}
#loading {
  display: none;
}
#net-form {
  z-index: 1000;
}
#mask {
  position: absolute;
  top: 5%;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #00000080;
  z-index: 999;
  display: none;
}

code {
  padding: 2px 4px;
  color: #304455;
  background-color: #eee;
  border-radius: 4px;
}
#showConnStatusMsg {
  text-align: center; /*让div内部文字居中*/
  border-radius: 1rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -999;
}
.green {
  color: #00a508;
}
.red {
  color: #ef4444;
}
.orange {
  color: orange;
}
</style>
