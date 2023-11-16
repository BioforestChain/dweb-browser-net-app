<script setup lang="ts">
import { ref } from 'vue'
import type { NetForm, NetModuleDetail } from '@/types'
import { apiNetModuleReg, apiNetModuleDetail } from '@/api/user'
import { useRoute } from 'vue-router'
import router from '@/router'
import { GetNetModuleIdValue, GetUseUserStore } from '@/types'
import { GetDateStr, $toast } from '@/types'
import { showConfirmDialog } from 'vant'
import { get, set } from 'idb-keyval'

defineProps<{ msg: string }>()

const checked = ref(false)
const tagType = ref('warning')
const useRouteObj = useRoute()

const rootDomainValue = ref('')
const idValue = ref(0)
const portValue = ref(80)
const keyValue = ref('')
const subDomainValue = ref('')

const subDomainFormatter = (value: string) => {
  return value.replace(/[^a-z0-9]/gi, '')
}
const portFormatter = (value: string) => {
  return value.replace(/[^0-9]/gi, '')
}

const rootDomainFormatter = (value: string) => {
  // 匹配根域名正则
  if (/[^a-z.\d]/i.test(value)) {
    return ''
  } else {
    return value
  }
}
// 校验函数返回 true 表示校验通过，false 表示不通过
const patternRootDomain = (val: string) => {
  const regex = /^[a-z0-9]+\.[a-z]+$/
  if (!regex.test(val)) {
    return `${val} 不合法的根域名，请重新输入`
  }
}
if (GetUseUserStore.currentNetModuleId.length === 0) {
  GetUseUserStore.currentNetModuleId = GetNetModuleIdValue
}
const net_list: NetModuleDetail[] = []

async function postNetModuleForm(values: NetForm) {
  const res = await apiNetModuleReg(values)
  if (res.code == 0 && res.data.id > 0) {
    if (GetUseUserStore.currentNetModulePrimaryId == 0) {
      GetUseUserStore.currentNetModulePrimaryId = res.data.id
    }
    GetUseUserStore.currentNetModuleDomain = res.data.domain
    get(GetNetModuleIdValue).then((existingValue) => {
      if (existingValue === undefined || existingValue === null) {
        console.log(GetDateStr + ' existingValue ', existingValue)
        net_list.push(res.data)
        console.log(
          GetDateStr.value + ' postNetModuleForm net_list1 ',
          net_list,
        )
        set(GetNetModuleIdValue, net_list)
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
        set(GetNetModuleIdValue, net_list)
      }
    })

    $toast.open({
      message: '提交成功!',
      type: 'success',
      position: 'top',
    })
    tagType.value = 'success'
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
  rootDomainValue.value = targetItem.root_domain
  portValue.value = targetItem.port
  subDomainValue.value = targetItem.prefix_domain
  idValue.value = queryId
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
// const onClickLeft = () => history.back()
const onClickLeft = () => {
  // 执行路由跳转
  router.push({
    name: 'net-module-list',
  })
  // router.push('/path/to/route')
}
// function tagType() {
//   return is_connected.value ? 'success' : 'danger'
// }

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
      // 获取tag元素
      // const tag = document.querySelector(
      //   '.show-on-connect-net-status',
      // ) as HTMLElement
      // console.log('onConnectNet tag', tag?.setAttribute)
      // 判断connect状态
      tagType.value = 'danger'
      console.log('btnOnConnectNet on confirm')
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
      tagType.value = 'success'
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
// }
</script>

<!--页面-->
<template>
  <div id="app">
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
          v-model="rootDomainValue"
          type="text"
          :formatter="rootDomainFormatter"
          label="服务地址(address):"
          placeholder="请输入网络服务地址"
          name="rootDomain"
          required
          :rules="[
            {
              required: true,
              validator: patternRootDomain,
            },
          ]"
          @blur="rootDomainValue = $event.target.value"
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
          v-model="subDomainValue"
          label="广播:"
          :formatter="subDomainFormatter"
          type="text"
          placeholder="请输入广播地址前缀"
          name="domain"
          required
          :rules="[{ required: true, message: '请填写正确内容' }]"
          @blur="subDomainValue = $event.target.value"
        />

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
        <van-button
          round
          block
          class="button-margin"
          type="primary"
          native-type="submit"
        >
          提交配置
        </van-button>
        <van-button type="danger" round block @click="onConnectNet">
          断开连接
        </van-button>
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
</style>
