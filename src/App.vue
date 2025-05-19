<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { showToast } from '@/utils/utils'

const authStore = useAuthStore()
const router = useRouter()

let idleTimeout
const idleLimit = 15 * 60 * 1000 // 15 minutes

function resetIdleTimer() {
  clearTimeout(idleTimeout)
  if (!authStore.isUserLoggedIn) return

  idleTimeout = setTimeout(() => {
    authStore.logout()
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
      <!-- FAB in bottom-right corner -->
      <v-fab
        v-if="authStore.isUserLoggedIn"
        color="#01A1FF"
        icon="mdi-cog"
        size="large"
        class="fab"
        to="/settings"
      ></v-fab>
    </v-main>
  </v-app>
</template>

<style scoped>
.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 10;
}
</style>
