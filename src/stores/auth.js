import { defineStore } from 'pinia'

const ACCESS_KEY = 'admin_access_token'
const REFRESH_KEY = 'admin_refresh_token'

function readStorage(key) {
  const value = localStorage.getItem(key)
  if (value) {
    return value
  }
  return ''
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: readStorage(ACCESS_KEY),
    refreshToken: readStorage(REFRESH_KEY),
    admin: null,
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
    },

    clearAuth() {
      this.accessToken = ''
      this.refreshToken = ''
      this.admin = null
      localStorage.removeItem(ACCESS_KEY)
      localStorage.removeItem(REFRESH_KEY)
    },
  },
})
