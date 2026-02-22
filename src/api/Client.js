import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useGlobalModal } from '@/stores/globalModal'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false,
})

let refreshState = {
  isRefreshing: false,
  queue: [],
}

client.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const auth = useAuthStore()
    const status = error?.response?.status

    // 403 에러 처리 - 접근 권한 없음
    if (status === 403) {
      const globalModal = useGlobalModal()

      // 인증 정보 클리어
      auth.clearAuth()

      // 알림 표시
      globalModal.showAlert('접근 권한이 없습니다. 다시 로그인해주세요.')

      // 1.5초 후 로그인 페이지로 리다이렉트
      setTimeout(() => {
        window.location.href = '/admin/login'
      }, 1500)

      throw error
    }

    // 401이 아니면 에러 던지기
    if (status !== 401) {
      throw error
    }

    const original = error.config
    if (!original || original._retry) {
      throw error
    }

    const url = original.url || ''
    if (
      url.includes('/api/admin/auth/login') ||
      url.includes('/api/admin/auth/refresh') ||
      url.includes('/api/admin/auth/logout')
    ) {
      throw error
    }

    if (!auth.refreshToken) {
      auth.clearAuth()
      window.location.href = '/admin/login'
      throw error
    }

    if (refreshState.isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshState.queue.push({ resolve, reject })
      }).then((accessToken) => {
        original.headers.Authorization = `Bearer ${accessToken}`
        return client(original)
      })
    }

    original._retry = true
    refreshState.isRefreshing = true

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/auth/refresh`, {
        refreshToken: auth.refreshToken,
      })

      const { accessToken, refreshToken } = res.data.data
      auth.setTokens(accessToken, refreshToken)

      refreshState.queue.forEach((promise) => promise.resolve(accessToken))
      refreshState.queue = []

      original.headers.Authorization = `Bearer ${accessToken}`
      return client(original)
    } catch (err) {
      refreshState.queue.forEach((promise) => promise.reject(err))
      refreshState.queue = []
      auth.clearAuth()
      window.location.href = '/admin/login'
      throw err
    } finally {
      refreshState.isRefreshing = false
    }
  }
)

export default client
