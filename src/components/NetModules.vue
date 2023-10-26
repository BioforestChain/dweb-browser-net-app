<script setup lang="ts">
// import { ref } from 'vue'
// import { netModuleReg } from '@/api/user'
// import manifest from 'manifest.json'

// defineProps<{ msg: string }>()

// const ipValue = ref('')
// const portValue = ref('')
// const keyValue = ref('')
// const subDomainValue = ref('')
// const newModulesValue = ref(`${manifest.id}`)

// // formData:{
// //   ipValue : ref(''),
// //   portValue : ref(''),
// //   keyValue : ref(''),
// //   subDomainValue : ref('')
// // };

// const subDomainFormatter = (value: string) => {
//   return value.replace(/[^a-z0-9]/gi, '')
// }
// const rootDomainFormatter = (value: string) => {
//   // 匹配根域名正则
//   // const regex = /^[a-z0-9]+\.[a-z]+$/
//   // if (!regex.test(value)) {
//   if (/[^a-z\.\d]/i.test(value)) {
//     return ''
//   } else {
//     return value
//   }
// }
// // const patternRootDomain = /^[a-z0-9]+\.[a-z]+$/
// // 校验函数返回 true 表示校验通过，false 表示不通过
// // const patternRootDomain = (val:string) => /^[a-z0-9]+\.[a-z]+$/.test(val);
// const patternRootDomain = (val: string) => {
//   const regex = /^[a-z0-9]+\.[a-z]+$/
//   if (!regex.test(val)) {
//     return `${val} 不合法的根域名，请重新输入`
//   }
// }
// // const patternRootDomain = (val:string) => /^[0-9]+$/.test(val);

// // const validatorMessage = (val: string) => `${val} 不合法，请重新输入`
// const domain = /^[a-z0-9]+$/

// const onSubmit = (values: any) => {
//   console.log('submit', values)

//   netModuleReg(values)
// }
// const onFailed = (errorInfo: any) => {
//   console.log('failed', errorInfo)
// }
</script>

<template>
  <div id="app">
    <p>配置:</p>
  </div>
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
