<script setup lang="ts">
import { ref } from 'vue'
import type { AppForm, AppModuleDetail } from '@/types'
import { apiAppModuleReg } from '@/api/user'
import router from '@/router'
import {
  GetNetModuleIdFromCfg,
  GetAppModuleIdValue,
  GetUseUserStore,
} from '@/types'
import { GetDateStr, $toast } from '@/types'
import { del, get, set } from 'idb-keyval'

defineProps<{ msg: string }>()
const idValue = ref(0)

const userNameValue = GetUseUserStore.currentNetMoudleDomain

const addTmpAppIdNameList: any = [
  { appId: 'helloworld123', appName: '123.bagen.com' },
  { appId: 'helloworld456', appName: '456.bagen.com' },
  { appId: 'helloworld789', appName: '789.bagen.com' },
  { appId: 'helloworld001', appName: '001.bagen.com' },
  { appId: 'helloworld002', appName: '002.bagen.com' },
  { appId: 'helloworld003', appName: '003.bagen.com' },
  { appId: 'helloworld005', appName: '005.bagen.com' },
]
// 匹配根域名正则
const netIdValueFormatter = (value: string) => {
  if (/[^a-z.\d]/i.test(value)) {
    return ''
  } else {
    return value
  }
}

let app_list: AppModuleDetail[] = []
async function postAppModuleForm(values: AppForm['arrayAppIdInfo']) {
  const res = await apiAppModuleReg({
    arrayAppIdInfo: values,
  })
  if (res.code == 0 && res.data.id > 0) {
    console.log('GetAppModuleIdValue', GetAppModuleIdValue)
    get(GetAppModuleIdValue).then((existingValue) => {
      if (existingValue === undefined || existingValue === null) {
        del(GetAppModuleIdValue)
      } else {
        app_list = existingValue
        const index = app_list.findIndex((item) => item.id == res.data.id)
        //遍历存在的 然后当下提交的是最新的，若有相同的id覆盖之
        if (index !== -1) {
          app_list[index] = res.data
        } else {
          //否则新增
          app_list.push(res.data)
        }
        console.log(GetDateStr.value + 'postAppModuleForm app_list', app_list)
        set(GetAppModuleIdValue, app_list)
      }
    })

    $toast.open({
      message: '提交成功!',
      type: 'success',
      position: 'top',
    })
    router.push({
      name: 'app-module-list',
    })
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
//新增
const onSubmit = (values: AppForm[]) => {
  values = arrLastChoosedCont.value
  console.log('postAppModuleForm values', values)
  postAppModuleForm(values)
}

const onFailed = (errorInfo: AppForm[]) => {
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
//下拉列表
const showBottom = ref(false)
const showPopup = () => {
  showBottom.value = true
}

// 选中处理
const appIdNameCheckResult: any = ref({})
const arrLastChoosedIdx: any = []
const arrLastChoosedCont: any = []
function onClickSelected() {
  arrLastChoosedIdx.value = []
  arrLastChoosedCont.value = []
  console.log('appIdNameCheckResult.value', appIdNameCheckResult.value)
  Object.keys(appIdNameCheckResult.value).forEach((key) => {
    //模拟选中的时候数据中的第几项
    if (appIdNameCheckResult.value[key].length > 0) {
      const index: any = appIdNameCheckResult.value[key][0]
      if (index >= 0) {
        arrLastChoosedIdx.value.push(parseInt(index))
      }
    }
  })
  console.log('arrLastChoosedIdx', arrLastChoosedIdx)
  arrLastChoosedIdx.value.forEach((item: number) => {
    addTmpAppIdNameList[item]['netId'] = GetAppModuleIdValue
    addTmpAppIdNameList[item]['userName'] = userNameValue
    arrLastChoosedCont.value.push(addTmpAppIdNameList[item])
  })
  console.log('arrLastChoosedCont', arrLastChoosedCont)
}
</script>

<!--页面-->
<template>
  <div id="app">
    <van-form @failed="onFailed" @submit="onSubmit">
      <van-nav-bar
        title="App模块配置"
        left-text="返回"
        left-arrow
        @click-left="onClickLeft"
      />

      <van-cell-group inset>
        <van-field v-model="idValue" type="hidden" name="id" />

        <van-cell title="获取App模块配置信息" is-link @click="showPopup" />

        <van-popup
          v-model:show="showBottom"
          round
          position="bottom"
          class="popup-list"
        >
          <div class="menu">
            <!-- <span class=""> 编号</span> -->
            <span class=""> appId</span>
            <span class=""> appName</span>
          </div>
          <van-checkbox-group
            v-for="(item, i) in addTmpAppIdNameList"
            :key="i"
            v-model="appIdNameCheckResult[i]"
            height="50rem"
            :items="item"
            @click="onClickSelected"
          >
            <van-checkbox class="checkbox-app" :title="i" :name="i">
              <!-- <span class="">{{ i }} </span> -->
              <span class="">{{ item.appId }} </span>
              <span class="">{{ item.appName }}</span>
            </van-checkbox>
          </van-checkbox-group>
        </van-popup>

        <!-- (网络模块的域名) -->
        <van-field
          v-model="userNameValue"
          type="text"
          label="用户名:"
          placeholder="请输入用户名"
          name="user_name"
          disabled
          readonly
          required
          :rules="[{ required: true, message: '请填写正确内容' }]"
          @blur="userNameValue = $event.target.value"
        />
        <van-field
          v-model="GetNetModuleIdFromCfg"
          label="网络模块id:"
          :formatter="netIdValueFormatter"
          placeholder="请输入网络模块id"
          name="net_id"
          required
          readonly
          disabled
          :rules="[{ required: true, message: '请填写正确内容' }]"
          @blur="GetNetModuleIdFromCfg = $event.target.value"
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
.popup-list {
  height: 50%;
  padding-left: 1rem;
  padding: 1rem;
}
.menu {
  padding-left: rem;
  padding: 0.3rem;
}
.checkbox-app {
  padding: 0.1rem;
}
.checkbox-app span {
  margin-left: 1rem;
}
.menu span {
  padding-left: 2rem;
  margin-left: 2rem;
}
</style>
