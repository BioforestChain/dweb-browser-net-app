<script setup lang="ts">
import { ref } from 'vue'
import type { NetForm } from '@/types'
import { netModuleReg } from '@/api/user'
import manifest from 'manifest.json'

defineProps<{ msg: string }>()

const ipValue = ref('')
const portValue = ref('')
const keyValue = ref('')
const subDomainValue = ref('')
const newModulesValue = ref(`${manifest.id}`)

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

const domain = /^[a-z0-9]+$/

const onSubmit = (values: NetForm[]) => {
  console.log('submit', values)

  netModuleReg(values)
}
const onFailed = (errorInfo: NetForm[]) => {
  console.log('failed', errorInfo)
}
</script>

<template>
  <div id="app">
    <van-form @failed="onFailed" @submit="onSubmit">
      <van-nav-bar
        title="配置:"
        left-text="返回"
        right-text="按钮"
        left-arrow
        @click-left="onClickLeft"
        @click-right="onClickRight"
      />
      <van-cell-group inset>
        <van-field
          v-model="ipValue"
          type="text"
          :formatter="rootDomainFormatter"
          label="服务地址(address):"
          placeholder="请输入网络服务地址"
          name="rootDomain"
          required
          :rules="[
            {
              required: true,
              patternRootDomain: true,
              validator: patternRootDomain,
            },
          ]"
          @blur="ipValue = $event.target.value"
        />

        <van-field
          v-model="portValue"
          type="number"
          maxlength="5"
          :formatter="portFormatter"
          label="端口(port):"
          placeholder="请输入端口"
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
          label="域名:"
          :formatter="subDomainFormatter"
          type="text"
          placeholder="请输入域名"
          name="domain"
          required
          :rules="[{ domain, required: true, message: '请填写正确内容' }]"
          @blur="subDomainValue = $event.target.value"
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
          :rules="[{ required: true, message: '请填写正确内容' }]"
          @blur="newModulesValue = $event.target.value"
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
