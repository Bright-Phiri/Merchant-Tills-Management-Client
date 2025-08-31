import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref(null)
    const user_id = ref(null)
    const user_name = ref(null)
    const email = ref(null)
    const secret = ref(null)
    const permissions = ref({})
    const isUserLoggedIn = ref(false)

    function setUserId(userId) {
      user_id.value = userId
    }

    function setToken(tokenValue) {
      token.value = tokenValue
      isUserLoggedIn.value = true
    }

    function setUserName(userName) {
      user_name.value = userName
    }

    function setEmail(emailValue) {
      email.value = emailValue
    }

    function setSecret(secretValue) {
      secret.value = secretValue
    }

    function setPermissions(perms) {
      permissions.value = perms
    }

    const getPermissions = computed(() => permissions.value)
    const getToken = computed(() => token.value)
    const getUserId = computed(() => user_id.value)
    const getEmail = computed(() => email.value)
    const getSecret = computed(() => secret.value)
    const getUserName = computed(() => user_name.value)
    const getIsUserLoggedIn = computed(() => isUserLoggedIn.value)

    function logout() {
      token.value = null
      user_name.value = null
      user_id.value = null
      secret.value = null
      permissions.value = {}
      isUserLoggedIn.value = false
    }

    return {
      token,
      user_id,
      user_name,
      email,
      secret,
      permissions,
      isUserLoggedIn,

      getUserId,
      getToken,
      getUserName,
      getEmail,
      getSecret,
      getPermissions,
      getIsUserLoggedIn,

      setUserId,
      setToken,
      setUserName,
      setEmail,
      setSecret,
      setPermissions,
      logout,
    }
  },
  {
    persist: true,
  },
)
