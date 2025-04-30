import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref(null)
    const user_id = ref(null)
    const user_name = ref(null)
    const role = ref(null)
    const isUserLoggedIn = ref(false)

    function setUserId(new_userId) {
      user_id.value = new_userId
    }

    function setToken(new_token) {
      token.value = new_token
      isUserLoggedIn.value = true
    }

    function setUserName(name) {
      user_name.value = name
    }

    function setUserRole(userRole) {
      role.value = userRole
    }

    function logout() {
      token.value = null
      user_name.value = null
      role.value = null
      isUserLoggedIn.value = false
    }

    return {
      token,
      user_id,
      user_name,
      role,
      isUserLoggedIn,
      setUserId,
      setToken,
      setUserName,
      setUserRole,
      logout,
    }
  },
  {
    persist: true,
  },
)
