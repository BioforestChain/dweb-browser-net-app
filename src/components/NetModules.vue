<script setup lang="ts">
import { ref } from 'vue'
import type { NetForm, NetModuleDetail } from '@/types'
import {
  apiNetModuleReg,
  apiNetModuleDetail,
  setCache,
  getCache,
  reconnect,
} from '@/api/user'
import { useRoute } from 'vue-router'
import { GetNetModuleIdValue, GetUseUserStore } from '@/types'
import { GetDateStr, $toast } from '@/types'
import { showConfirmDialog } from 'vant'
// import { del, get, set } from 'idb-keyval'

defineProps<{ msg: string }>()

const checked = ref(false)
const tagType = ref('warning')
const useRouteObj = useRoute()

const idValue = ref(0)
const domainValue = ref('') //服务地址
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
const rootDomainFormatter = (value: string) => {
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
function showConnStatusMsg(wsRes: object) {
  wsRes.message = '恭喜连接成功!!!'
  const span = document.getElementById('showConnStatusMsg')
  if (wsRes.success) {
    span.className = 'green'
  } else {
    wsRes.message = '您已断开连接!!!'
    span.className = 'red'
  }
  span.innerText = wsRes.message
}
//回填
getCache(GetNetModuleIdValue).then(async (existingValue) => {
  console.log(GetDateStr + ' init existingValue: ', existingValue)
  if (existingValue[0].id > 0) {
    paddingDataForm(existingValue[0], existingValue[0].id)
  }
})

async function postNetModuleForm(values: NetForm) {
  const res = await apiNetModuleReg(values)
  if (res.code == 0 && res.data.id > 0) {
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
          console.log(
            GetDateStr.value + ' postNetModuleForm net_list1 ',
            net_list,
          )
        } else {
          const index = net_list.findIndex((item) => item.id == res.data.id)
          //遍历存在的 然后当下提交的是最新的，若有相同的id覆盖之
          if (index !== -1) {
            net_list[index] = res.data
          } else {
            //否则新增
            net_list.push(res.data)
          }
          console.log(
            GetDateStr.value + ' postNetModuleForm net_list2 ',
            net_list,
          )
        }
        //Tips
        setCache(GetNetModuleIdValue, net_list).then(async () => {
          const wsRes = await reconnect<{ success: boolean; message: string }>()
          console.log('ws res: ', wsRes)
          showConnStatusMsg(wsRes)
        })

        $toast.open({
          message: '提交成功!',
          type: 'success',
          position: 'top',
        })
        tagType.value = 'success'
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
        // GetNetModuleDetail(queryId)
      } else {
        // GetNetModuleDetail(queryId)
      }
      // paddingDataForm(element, queryId)
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
  domainValue.value = targetItem.domain
  portValue.value = targetItem.port
  keyValue.value = targetItem.secret
  prefixBroadcastAddressValue.value = targetItem.prefix_broadcast_address
  suffixBroadcastAddressValue.value = getSuffixDomain(domainValue.value)
  broadcastAddressValue.value =
    prefixBroadcastAddressValue.value + suffixBroadcastAddressValue.value
}

//新增
const onSubmit = (values: NetForm) => {
  idValue.value = GetUseUserStore.currentNetModulePrimaryId
  values.id = GetUseUserStore.currentNetModulePrimaryId
  postNetModuleForm(values)
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

const onConnectNet = (newValue: any) => {
  console.log('btnOnConnectNet newV', newValue)
  showConfirmDialog({
    title: '提醒',
    message: '是否断开连接？',
    theme: 'round-button',
    closeOnPopstate: true,
  })
    .then(() => {
      $toast.open({
        message: '断开!',
        type: 'success',
        position: 'top',
      })
      // 判断connect状态
      tagType.value = 'danger'
      console.log('btnOnConnectNet on confirm')
      const wsRes = {
        success: false,
        message: '',
      }
      showConnStatusMsg(wsRes)

      if (newValue) {
        console.log('btnOnConnectNet checked.value', checked.value)
        checked.value = newValue
      }
    })
    .catch(() => {
      //
      $toast.open({
        message: '取消!',
        type: 'error',
        position: 'top',
      })

      // tagType.value = 'success'
      console.log('btnOnConnectNet on cancel')
    })
}
// TODO
// function handleEdit(id: number) {
//   router.push({
//     path: '/',
//     query: {
//       id,
//     },
//   })

//suffixBroadcastAddressValue
function getSuffixDomain(hostname: string): string {
  if (regexDomain.test(hostname)) {
    const parts = hostname.split('.')
    suffixBroadcastAddressValue.value =
      '.' + parts[parts.length - 2] + '.' + parts[parts.length - 1]
    const span = document.getElementById('mySpan')
    span.innerText = suffixBroadcastAddressValue.value
    return suffixBroadcastAddressValue.value
  }
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
    <van-form @failed="onFailed" @submit="onSubmit">
      <van-nav-bar title="网络模块配置" @click-left="onClickLeft" />
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
          v-model="domainValue"
          type="text"
          :formatter="rootDomainFormatter"
          label="服务地址(address):"
          placeholder="请输入网络服务地址"
          name="domain"
          required
          :rules="[{ required: true, validator: patternRootDomain }]"
          @blur="getSuffixDomain(domainValue)"
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
            <span
              id="mySpan"
              size="small"
              type="text"
              readonly
              disabled
              @blur="suffixBroadcastAddressValue = $event.target.value"
            />
          </template>
        </van-field>

        <van-field
          v-model="GetNetModuleIdValue"
          label="网络模块id:"
          :formatter="rootDomainFormatter"
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
      <div class="button-container">
        <van-button type="danger" round block @click="onConnectNet">
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
</style>
