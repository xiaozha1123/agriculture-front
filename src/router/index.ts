import { createRouter, createWebHistory } from 'vue-router'
import homePage from '@/views/homePage.vue'
import TestPage from '@/views/TestPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: homePage,
    },
    {
      path:'/test',
      name:'test',
      component: TestPage
    }
  ],
})

export default router
