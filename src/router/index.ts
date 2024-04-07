import { createRouter, createWebHistory } from 'vue-router'
import TopBarFront from '@/components/topBar/TopBarFront.vue'
import { useAdminStore } from '@/stores/admin'

const mainTitle = '我的商城後台'

declare module 'vue-router' {
  interface RouteMeta {
    title: string
    login: Boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: {
        title: `${mainTitle} | 登入`,
        login: false,
        admin: false
      }
    },
    {
      path: '/',
      component: TopBarFront,
      children: [
        {
          path: 'overview',
          name: 'overview',
          component: () => import('../views/OverView.vue'),
          meta: {
            title: `${mainTitle} | 首頁`,
            login: true,
            admin: false
          }
        },
        {
          path: 'staff',
          name: 'staff',
          component: () => import('../views/StaffManagement.vue'),
          meta: {
            title: `${mainTitle} | 員工管理`,
            login: true,
            admin: true
          }
        },
        {
          path: 'user',
          name: 'user',
          component: () => import('../views/UserManagement.vue'),
          meta: {
            title: `${mainTitle} | 使用者管理`,
            login: true,
            admin: true
          }
        },
        {
          path: 'product',
          name: 'product',
          component: () => import('../views/ProductManagement.vue'),
          meta: {
            title: `${mainTitle} | 商品管理`,
            login: true,
            admin: true
          }
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/ProfileView.vue'),
          meta: {
            title: `${mainTitle} | 個人資訊`,
            login: true,
            admin: false
          }
        }
      ]
    },
    {
      path: '/404',
      name: '404',
      component: () => import('../views/NotFound.vue'),
      meta: {
        title: `${mainTitle} | 404`,
        login: false,
        admin: false
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      redirect: '/404'
    }
  ]
})

router.afterEach((to, from) => {
  document.title = to.meta.title
})

router.beforeEach((to, from, next) => {
  const admin = useAdminStore()

  if (admin.isLogin && (to.path === '/login' || to.path === '/')) {
    next('/overview')
  } else if (to.meta.login && !admin.isLogin) {
    next('/login')
  } else {
    next()
  }
})

export default router
