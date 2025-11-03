import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/homePage.vue'
import TestPage from '@/views/TestPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path:'/login',
      name:'Login',
      component: () => import('@/views/LoginPage.vue')
    },
    {
      path:'/register',
      name:'Register',
      component: () => import('@/views/RegisterPage.vue')
    },
    {
      path:'/apply',
      name:'ApplyShop',
      component: () => import('@/views/farmer/ApplyShop.vue'),
      meta: { requiresAuth: false }
    },
    {
      path:'/test',
      component: TestPage
    },
    {
      path:'/customer',
      component: () => import('@/views/customer/LayoutPage.vue'),
      children:[
        {
          path:'',
          component: () => import('@/views/customer/HomeLogin.vue')
        },
        {
          path:'cart',
          component: () => import('@/views/customer/CartPage.vue')
        },
        {
          path:'orders',
          component: () => import('@/views/customer/OrderPage.vue')
        },
        {
          path:'comment',
          component: () => import('@/views/customer/CommentPage.vue')
        },
        {
          path:'profile',
          component: () => import('@/views/customer/ProfileCenter.vue')
        }
      ]
    },
    {
      path:'/farmer',
      component: () => import('@/views/farmer/FarmerHome.vue'),
      children:[
        {
          path:'sale',
          component: () => import('@/views/farmer/SaleDetail.vue')
        },
        {
          path:'product',
          component: () => import('@/views/farmer/ProductFarmer.vue')
        },
        {
          path:'order',
          component: () => import('@/views/farmer/OrderFarmer.vue')
        },
        {
          path:'comment',
          component: () => import('@/views/farmer/CommentList.vue')
        },
        {
          path:'profile',
          component: () => import('@/views/farmer/ProfileFarmer.vue')
        },
      ]
    },
    {
      path:'/admin',
      component: () => import('@/views/admin/AdminHome.vue'),
      children:[
        {
          path:'user/list',
          component: () => import('@/views/admin/UserList.vue')
        },
        {
          path:'product/operation',
          component: () => import('@/views/admin/ProductAdmin.vue')
        },
        {
          path:'product/category',
          component: () => import('@/views/admin/CategoryAdmin.vue')
        },
        {
          path:'order',
          component: () => import('@/views/admin/OrderManagement.vue')
        },
        {
          path:'announcement',
          component: () => import('@/views/admin/AnnouncementPage.vue')
        },
        {
          path:'review',
          component: () => import('@/views//admin/SellerReview.vue')
        }
      ]
    }
  ],
})

export default router
