<script setup lang="ts">
import router from '@/router'
const targetNetModule = () => {
  router.push({
    name: 'net-module-reg',
  })
}
const targetAppModule = () => {
  router.push({
    name: 'app-module-list',
  })
}
</script>

<!--页面-->
<template>
  <div id="app">
    <div class="button-container">
      <van-button type="primary" round block @click="targetNetModule">
        网络模块
      </van-button>
      <van-button
        round
        block
        class="button-margin"
        type="primary"
        @click="targetAppModule"
      >
        应用模块
      </van-button>
    </div>
  </div>
</template>

<style scoped>
#app {
  width: 100%;
  height: 100%;
}

.button-container {
  margin: 5rem;
  width: 15rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.button-container button {
  margin-right: 2rem;
}
.button-margin {
  margin-right: 2rem;
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
