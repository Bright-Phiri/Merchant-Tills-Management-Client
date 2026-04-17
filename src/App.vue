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
    router.push('/sign-in')
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
    <v-main class="gmail-main">
      <v-container fluid class="gmail-content">
        <router-view />
      </v-container>
      <v-fab
        v-if="authStore.isUserLoggedIn"
        color="primary"
        icon="mdi-cog"
        size="large"
        class="fab"
        to="/settings"
      ></v-fab>
    </v-main>
  </v-app>
</template>

<style scoped>
.gmail-main {
  background-color: #f6f8fc;
}

.gmail-content {
  padding: 20px 24px;
}

.fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10;
  box-shadow: 0 3px 10px #00000026;
}

@media (max-width: 960px) {
  .gmail-content {
    padding: 14px 12px;
  }
}
</style>
