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
    ],
    history: createWebHashHistory()
  })
}
