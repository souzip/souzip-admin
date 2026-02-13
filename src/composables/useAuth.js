import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import client from '@/api/Client'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const router = useRouter()
  const auth = useAuthStore()

  const form = reactive({
    username: '',
    password: '',
  })

  const loading = ref(false)
  const errorMessage = ref('')

  async function handleLogin() {
    errorMessage.value = ''
    loading.value = true

    try {
      const res = await client.post('/api/admin/auth/login', {
        username: form.username,
        password: form.password,
      })

      const { accessToken, refreshToken, id, username, role } = res.data.data

      auth.setTokens(accessToken, refreshToken)
      auth.setAdmin({ id, username, role })

      router.replace('/admin')
    } catch (error) {
      errorMessage.value = error?.response?.data?.message || '로그인에 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  async function handleLogout() {
    try {
      await client.post('/api/admin/auth/logout')
    } finally {
      auth.clearAuth()
      router.replace('/admin/login')
    }
  }

  return { form, loading, errorMessage, handleLogin, handleLogout }
}
