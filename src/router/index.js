import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import LoginView from '@/views/admin/auth/LoginView.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import DashboardView from '@/views/admin/DashboardView.vue'
import AdminManagement from '@/views/admin/management/AdminManagement.vue'

const routes = [
  { path: '/', redirect: '/admin/dashboard' },

  {
    path: '/admin/login',
    name: 'admin-login',
    component: LoginView,
  },

  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: DashboardView,
      },
      {
        path: 'management',
        name: 'admin-management',
        component: AdminManagement,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

function isLoginPath(path) {
  if (path === '/admin/login') {
    return true
  }

  return false
}

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (isLoginPath(to.path) === true) {
    return true
  }

  if (auth.accessToken) {
    return true
  }

  return { path: '/admin/login' }
})

export default router
