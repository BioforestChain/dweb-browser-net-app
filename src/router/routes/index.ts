import type { RouteRecordRaw } from 'vue-router'

/**
 * 路由配置
 * @description 所有路由都在这里集中管理
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/index.html',
    name: 'index',
    component: () => import('@/components/NetModules.vue'),
    meta: {
      title: 'NetModules',
    },
  },
  /**
   * 首页
   * 网络模块
   */
  {
    path: '/index.html',
    name: 'index',
    component: () => import('@/components/NetModules.vue'),
    meta: {
      title: 'NetModules',
    },
  },
  {
    path: '/',
    name: 'home',
    component: () => import('@/components/NetModules.vue'),
    meta: {
      title: 'NetModules',
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
      title: 'AppModules',
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
      title: 'AppModulesLists',
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
  /**
   * 子路由示例
   */
  {
    path: '/foo',
    name: 'foo',
    component: () => import('@/components/TransferStation.vue'),
    meta: {
      title: 'Foo',
    },
    redirect: {
      name: 'bar',
    },
    children: [
      {
        path: 'bar',
        name: 'bar',
        component: () => import('@/views/foo/bar.vue'),
        meta: {
          title: 'Bar',
        },
      },
    ],
  },
]

export default routes
