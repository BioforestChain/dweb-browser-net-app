<script setup lang="ts">
import { ref } from 'vue'
import Vue from 'vue'
import { Button } from 'vant'
import {
  PasswordInput,
  NumberKeyboard,
  closeToast,
  showLoadingToast
} from 'vant'
import useUserStore from '@/store/modules/user'
import { netModuleReg } from 'api/user'
import manifest from '../../manifest.json'

defineProps<{ msg: string }>()

const ipValue = ref('')
const portValue = ref('')
const keyValue = ref('')
const subDomainValue = ref('')
const newModulesValue = ref(`${manifest.id}`)

// formData:{
//   ipValue : ref(''),
//   portValue : ref(''),
//   keyValue : ref(''),
//   subDomainValue : ref('')
// };

const subDomainFormatter = (value: string) => {
  return value.replace(/[^a-z0-9]/gi, '')
}
const rootDomainFormatter = (value: string) => {
  // 匹配根域名正则
  const regex = /^[a-z0-9]+\.[a-z]+$/
  // if (!regex.test(value)) {
  if (/[^a-z\.\d]/i.test(value)) {
    return ''
  } else {
    return value
  }
}
// const patternRootDomain = /^[a-z0-9]+\.[a-z]+$/
// 校验函数返回 true 表示校验通过，false 表示不通过
// const patternRootDomain = (val:string) => /^[a-z0-9]+\.[a-z]+$/.test(val);
const patternRootDomain = (val: string) => {
  const regex = /^[a-z0-9]+\.[a-z]+$/
  if (!regex.test(val)) {
    return `${val} 不合法的根域名，请重新输入`
  }
}
// const patternRootDomain = (val:string) => /^[0-9]+$/.test(val);

const validatorMessage = (val: string) => `${val} 不合法，请重新输入`
const domain = /^[a-z0-9]+$/

const onSubmit = (values: any) => {
  console.log('submit', values)

  netModuleReg(values)
}
const onFailed = (errorInfo: any) => {
  console.log('failed', errorInfo)
}
</script>

<template>
  <div id="app">
    <p>配置:</p>
    <van-form @failed="onFailed" @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="ipValue"
          type="text"
          :formatter="rootDomainFormatter"
          @blur="ipValue = $event.target.value"
          label="服务地址(address):"
          placeholder="请输入网络服务地址"
          name="rootDomain"
          required
          :rules="[
            { required, patternRootDomain: true, validator: patternRootDomain }
          ]"
        />

        <van-field
          v-model="portValue"
          type="number"
          maxlength="5"
          :formatter="portFormatter"
          @blur="portValue = $event.target.value"
          label="端口(port):"
          placeholder="请输入端口"
          required
          :rules="[{ required: true, message: '请填写正确内容' }]"
        />
        <van-field
          v-model="keyValue"
          type="text"
          label="密钥:"
          @blur="keyValue = $event.target.value"
          placeholder="请输入密钥"
          name="secret"
          required
          :rules="[{ required: true, message: '请填写正确内容' }]"
        />
        <van-field
          v-model="subDomainValue"
          label="域名:"
          :formatter="subDomainFormatter"
          type="text"
          @blur="subDomainValue = $event.target.value"
          placeholder="请输入域名"
          name="domain"
          required
          :rules="[{ domain, required: true, message: '请填写正确内容' }]"
        />

        <van-field
          v-model="newModulesValue"
          label="网络模块id:"
          :formatter="rootDomainFormatter"
          type="text"
          placeholder="请输入"
          name="netId"
          required
          readonly
          disabled
          :rules="[{ net_id, required: true, message: '请填写正确内容' }]"
        />
      </van-cell-group>
      <div style="margin: 5rem">
        <van-button round block type="primary" native-type="submit">
          提交
        </van-button>
      </div>
    </van-form>
  </div>
  <!--  &lt;!&ndash; 密码输入框 &ndash;&gt;-->
  <!--  <van-password-input-->
  <!--      :value="value"-->
  <!--      info="密码为 6 位数字"-->
  <!--      :focused="showKeyboard"-->
  <!--      @focus="showKeyboard = true"-->
  <!--  />-->
  <!--  &lt;!&ndash; 数字键盘 &ndash;&gt;-->
  <!--  <van-number-keyboard-->
  <!--      :show="showKeyboard"-->
  <!--      @input="onInput"-->
  <!--      @delete="onDelete"-->
  <!--      @blur="showKeyboard = false"-->
  <!--  />-->
</template>

<style scoped>
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
