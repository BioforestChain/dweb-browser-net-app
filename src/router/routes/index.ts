import type { RouteRecordRaw } from 'vue-router'

/**
 * 路由配置
 * @description 所有路由都在这里集中管理
 */
const routes: RouteRecordRaw[] = [
  /**
   * 首页
   */
  {
    path: '/',
    name: 'home',
    component: () => import('@/components/NetModules.vue'),
    meta: {
      title: 'NetModules',
    },
  },
  /**
   * 列表
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
