import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import client from '@/api/Client'
import { useAuthStore } from '@/stores/auth'

function extractErrorMessage(error) {
  if (error && error.response && error.response.data && error.response.data.message) {
    return error.response.data.message
  }

  return '로그인에 실패했습니다.'
}

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

      const payload = res && res.data ? res.data.data : null
      if (payload === null) {
        throw new Error('로그인 응답이 올바르지 않습니다.')
      }

      auth.setTokens(payload.accessToken, payload.refreshToken)
      auth.setAdmin({
        id: payload.id,
        username: payload.username,
        role: payload.role,
      })

      router.replace('/admin')
    } catch (e) {
      errorMessage.value = extractErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  async function handleLogout() {
    try {
      await client.post('/api/admin/auth/logout')
    } finally {
      auth.clearAuth()
      router.replace('/login')
    }
  }

  return { form, loading, errorMessage, handleLogin, handleLogout }
}
