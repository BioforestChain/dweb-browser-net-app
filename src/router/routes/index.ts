import type { RouteRecordRaw } from 'vue-router'

/**
 * 路由配置
 * @description 所有路由都在这里集中管理
 */
const routes: RouteRecordRaw[] = [
  /**
   * 首页
   * Nav
   * 网络模块
   */
  {
    path: '/index.html',
    name: 'index',
    component: () => import('@/components/Nav.vue'),
    meta: {
      title: '网络应用',
    },
  },
  {
    path: '/net-module-reg',
    name: 'net-module-reg',
    component: () => import('@/components/NetModules.vue'),
    meta: {
      title: '网络配置',
    },
  },
  /**
   * 网络模块列表
   */
  {
    path: '/net-module-list',
    name: 'net-module-list',
    component: () => import('@/components/NetModulesLists.vue'),
    meta: {
      title: 'NetModulesLists',
    },
  },
  /**
   * App模块
   *
   */
  {
    path: '/app-module-reg',
    name: 'app-module-reg',
    component: () => import('@/components/AppModules.vue'),
    meta: {
      title: '访问控制设置',
    },
  },
  /**
   * App模块列表
   */
  {
    path: '/app-module-list',
    name: 'app-module-list',
    component: () => import('@/components/AppModulesLists.vue'),
    meta: {
      title: '访问控制列表',
    },
  },
  {
    path: '/app-module-del',
    name: 'app-module-del',
    component: () => import('@/components/AppModulesLists.vue'),
    meta: {
      title: 'AppModules',
    },
  },
]

export default routes
