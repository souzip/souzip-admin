import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const client = axios.create({
  baseURL: getBaseURL(),
  withCredentials: false,
})

let refreshState = createRefreshState()

client.interceptors.request.use((config) => {
  applyAccessToken(config)
  return config
})

client.interceptors.response.use(
  (res) => res,
  async (error) => handleUnauthorizedResponse(error)
)

export default client

function getBaseURL() {
  const value = import.meta.env.VITE_API_BASE_URL
  if (value) {
    return value
  }
  return ''
}

function createRefreshState() {
  return {
    isRefreshing: false,
    queue: [],
  }
}

function applyAccessToken(config) {
  const auth = useAuthStore()
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }
}

async function handleUnauthorizedResponse(error) {
  if (shouldHandleUnauthorized(error) === false) {
    throw error
  }

  const original = getOriginalConfig(error)
  if (original === null) {
    throw error
  }

  if (shouldSkipRetry(original) === true) {
    throw error
  }

  const auth = useAuthStore()
  if (canRefresh(auth) === false) {
    forceLogout(auth)
    throw error
  }

  if (refreshState.isRefreshing === true) {
    return waitForRefreshAndRetry(original)
  }

  return refreshAndRetry(auth, original)
}

function shouldHandleUnauthorized(error) {
  if (error && error.response && error.response.status === 401) {
    return true
  }
  return false
}

function getOriginalConfig(error) {
  if (error && error.config) {
    return error.config
  }
  return null
}

function shouldSkipRetry(original) {
  if (isAlreadyRetried(original) === true) {
    return true
  }

  if (isAuthRequest(original) === true) {
    return true
  }

  return false
}

function isAlreadyRetried(original) {
  if (original && original._retry === true) {
    return true
  }
  return false
}

function isAuthRequest(original) {
  const url = getRequestUrl(original)

  if (isLoginUrl(url) === true) {
    return true
  }

  if (isRefreshUrl(url) === true) {
    return true
  }

  if (isLogoutUrl(url) === true) {
    return true
  }

  return false
}

function getRequestUrl(original) {
  if (original && typeof original.url === 'string') {
    return original.url
  }
  return ''
}

function isLoginUrl(url) {
  if (url.includes('/api/admin/auth/login')) {
    return true
  }
  return false
}

function isRefreshUrl(url) {
  if (url.includes('/api/admin/auth/refresh')) {
    return true
  }
  return false
}

function isLogoutUrl(url) {
  if (url.includes('/api/admin/auth/logout')) {
    return true
  }
  return false
}

function canRefresh(auth) {
  if (auth && auth.refreshToken) {
    return true
  }
  return false
}

function waitForRefreshAndRetry(original) {
  return new Promise((resolve, reject) => {
    refreshState.queue.push({ resolve, reject })
  }).then((newAccessToken) => {
    applyNewAccessToken(original, newAccessToken)
    return client(original)
  })
}

async function refreshAndRetry(auth, original) {
  markRetry(original)
  startRefreshing()

  try {
    const tokens = await requestRefresh(auth)

    auth.setTokens(tokens.accessToken, tokens.refreshToken)
    resolveRefreshQueue(tokens.accessToken)

    applyNewAccessToken(original, tokens.accessToken)
    return client(original)
  } catch (refreshErr) {
    rejectRefreshQueue(refreshErr)
    forceLogout(auth)
    throw refreshErr
  } finally {
    stopRefreshing()
  }
}

function markRetry(original) {
  original._retry = true
}

function startRefreshing() {
  refreshState.isRefreshing = true
}

function stopRefreshing() {
  refreshState.isRefreshing = false
}

function resolveRefreshQueue(accessToken) {
  const queue = refreshState.queue
  refreshState.queue = []

  queue.forEach((item) => {
    item.resolve(accessToken)
  })
}

function rejectRefreshQueue(error) {
  const queue = refreshState.queue
  refreshState.queue = []

  queue.forEach((item) => {
    item.reject(error)
  })
}

function applyNewAccessToken(original, accessToken) {
  original.headers.Authorization = `Bearer ${accessToken}`
}

async function requestRefresh(auth) {
  const response = await axios.post(`${getBaseURL()}/api/admin/auth/refresh`, {
    refreshToken: auth.refreshToken,
  })

  const tokens = extractRefreshTokens(response)
  if (tokens) {
    return tokens
  }

  throw new Error('토큰 갱신 응답이 올바르지 않습니다.')
}

function extractRefreshTokens(response) {
  if (response && response.data && response.data.data && response.data.data.accessToken) {
    return response.data.data
  }
  return null
}

function forceLogout(auth) {
  auth.clearAuth()
  redirectToLogin()
}

function redirectToLogin() {
  window.location.href = '/login'
}
