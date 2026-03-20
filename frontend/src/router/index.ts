import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getAuthToken } from '@/utils/request'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //       path: '/',
    //   redirect: '/home',
    //   meta: { requiresAuth: true },
    // },
    // {
    //   path: '/home',
    //   name: 'home',
    //   component: () => import('@/views/home/index.vue'),
    //   meta: { requiresAuth: true },
    // },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/index.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/register/index.vue'),
      meta: { guest: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/Layout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: '首页', requiresAuth: true },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/profile/index.vue'),
          meta: { title: '个人中心', requiresAuth: true },
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/settings/index.vue'),
          meta: { title: '设置', requiresAuth: true },
        },
      ],
    },
  ],
})

const WHITE_LIST = new Set(['/login', '/register'])

router.beforeEach(async (to, from, next) => {
  const token = getAuthToken() || localStorage.getItem('token')
  const isLoggedIn = !!token

  if (to.meta.requiresAuth || !WHITE_LIST.has(to.path)) {
    if (!isLoggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }

    const userStore = useUserStore()
    if (!userStore.currentUser) {
      try {
        const success = await userStore.fetchUserInfo()
        if (!success) {
          next({
            path: '/login',
            query: { redirect: to.fullPath },
          })
          return
        }
      } catch (error) {
        next({
          path: '/login',
          query: { redirect: to.fullPath },
        })
        return
      }
    }
  }

  if (to.meta.guest && isLoggedIn) {
    next('/')
    return
  }

  next()
})

export default router
