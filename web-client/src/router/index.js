// Composables
import { createRouter as createVueRouter, createWebHashHistory } from "vue-router";
import { createAuthGuard } from "@auth0/auth0-vue";

export function createRouter(app) {
  return createVueRouter({
    routes: [
      {
        path: '/',
        component: () => import('@/views/Home.vue')
      },
      {
        path: '/home',
        component: () => import('@/views/Home.vue'),
        beforeEnter: createAuthGuard(app)
      },
      {
        path: '/categories',
        component: () => import('@/views/Categories.vue'),
        beforeEnter: createAuthGuard(app)
      },
      {
        path: '/transactions',
        component: () => import('@/views/Transactions.vue'),
        beforeEnter: createAuthGuard(app)
      },
      {
        path: '/reports',
        component: () => import('@/views/Reports.vue'),
        beforeEnter: createAuthGuard(app)
      },
    ],
    history: createWebHashHistory()
  })
}
