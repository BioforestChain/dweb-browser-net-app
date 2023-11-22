import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import router from '@/router'
import ToastPlugin from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
// 全局样式
import 'virtual:uno.css'
import '@/styles/var.less'
import '@/styles/mixin.less'
import '@/styles/global.less'

// 创建 Pinia 实例
const pinia = createPinia()
import Vant from 'vant'
import {
  NavBar,
  Tabbar,
  TabbarItem,
  Button,
  List,
  Switch,
  Tag,
  Popup,
  CheckboxGroup,
  Checkbox,
  Loading,
} from 'vant'
import 'vant/lib/index.css'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

/**
 * Pinia 支持功能扩展，例如本地持久化功能
 *
 * 在命令行运行 `npm i pinia-plugin-persistedstate` 安装持久化插件
 * 在本文件里导入 `import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'`
 * 取消注释下方的这行 `pinia.use` 代码启用插件，并根据文档对单个 Store 启用配置
 *
 * @see https://prazdevs.github.io/pinia-plugin-persistedstate/zh/guide/
 */
pinia.use(piniaPluginPersistedstate)

createApp(App)
  .use(pinia) // 启用 Pinia
  .use(router)
  .use(Vant)
  .use(NavBar)
  .use(Button)
  .use(Switch)
  .use(List)
  .use(Tabbar)
  .use(Tag)
  .use(Popup)
  .use(CheckboxGroup)
  .use(Checkbox)
  .use(TabbarItem)
  .use(ToastPlugin)
  .use(Loading)
  .mount('#app')
