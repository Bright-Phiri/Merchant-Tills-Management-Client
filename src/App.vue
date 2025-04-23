<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { showToast } from '@/utils/utils'

const auth = useAuthStore()
const router = useRouter()

let idleTimeout
const idleLimit = 15 * 60 * 1000 // 15 minutes

function resetIdleTimer() {
  clearTimeout(idleTimeout)
  if (!auth.isUserLoggedIn) return

  idleTimeout = setTimeout(() => {
    auth.logout()
    router.push('/login')
    showToast('🔒 You were logged out due to inactivity.', 'info')
  }, idleLimit)
}

const events = ['mousemove', 'keydown', 'click', 'scroll']

onMounted(() => {
  events.forEach((event) => window.addEventListener(event, resetIdleTimer))
  resetIdleTimer()
})

onBeforeUnmount(() => {
  events.forEach((event) => window.removeEventListener(event, resetIdleTimer))
  clearTimeout(idleTimeout)
})
</script>

<template>
  <v-app>
    <v-main style="background-color: #f9fafe">
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>
