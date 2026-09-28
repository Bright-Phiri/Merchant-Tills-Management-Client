import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useCustomerStore = defineStore(
  'customer',
  () => {
    const token = ref(null)
    const taxpayer = ref(null)
    const subscription = ref(null)
    const authenticated = computed(() => Boolean(token.value && taxpayer.value?.tin))
    const mustChangePassword = computed(() => Boolean(taxpayer.value?.must_change_password))
    function signIn(data) {
      token.value = data.token
      taxpayer.value = data.taxpayer
      subscription.value = data.subscription
    }
    function logout() {
      token.value = null
      taxpayer.value = null
      subscription.value = null
    }
    function passwordChanged() {
      if (taxpayer.value) taxpayer.value.must_change_password = false
    }
    return { token, taxpayer, subscription, authenticated, mustChangePassword, signIn, passwordChanged, logout }
  },
  { persist: { key: 'taxpayer-session', storage: sessionStorage } },
)
