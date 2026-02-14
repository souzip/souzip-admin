import { defineStore } from 'pinia'

const ACCESS_KEY = 'admin_access_token'
const REFRESH_KEY = 'admin_refresh_token'
const ADMIN_KEY = 'admin_info'

function readStorage(key) {
  const value = localStorage.getItem(key)
  if (value) {
    return value
  }
  return ''
}

function readAdminStorage() {
  const value = localStorage.getItem(ADMIN_KEY)
  if (value) {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }
  return null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: readStorage(ACCESS_KEY),
    refreshToken: readStorage(REFRESH_KEY),
    admin: readAdminStorage(),
  }),

  getters: {
    isLoggedIn: (state) => {
      if (state.accessToken) {
        return true
      }
      return false
    },
  },

  actions: {
    setTokens(accessToken, refreshToken) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
      localStorage.setItem(ACCESS_KEY, accessToken)
      localStorage.setItem(REFRESH_KEY, refreshToken)
    },

    setAdmin(admin) {
      this.admin = admin
      localStorage.setItem(ADMIN_KEY, JSON.stringify(admin)) // ← 추가
    },

    clearAuth() {
      this.accessToken = ''
      this.refreshToken = ''
      this.admin = null
      localStorage.removeItem(ACCESS_KEY)
      localStorage.removeItem(REFRESH_KEY)
      localStorage.removeItem(ADMIN_KEY) // ← 추가
    },
  },
})
