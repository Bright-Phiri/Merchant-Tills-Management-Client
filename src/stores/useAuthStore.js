import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user_name: null,
    role: null,
    isUserLoggedIn: false,
  }),
  actions: {
    setToken(token) {
      this.token = token
      this.isUserLoggedIn = !!token
    },
    setUserName(name) {
      this.user_name = name
    },
    setUserRole(role) {
      this.role = role
    },
    logout() {
      this.token = null
      this.user_name = null
      this.role = null
      this.isUserLoggedIn = false
    },
  },
  persist: true,
})
