<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { showToast } from '@/utils/utils'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

let idleTimeout
const idleLimit = 15 * 60 * 1000 // 15 minutes

function resetIdleTimer() {
  clearTimeout(idleTimeout)
  if (!authStore.isUserLoggedIn || route.meta.portal) return

  idleTimeout = setTimeout(() => {
    authStore.logout()
    router.push('/sign-in')
    showToast('🔒 You were logged out due to inactivity.', 'info')
  }, idleLimit)
}

const events = ['mousemove', 'keydown', 'click', 'scroll']
watch(() => route.meta.portal, resetIdleTimer)

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
    <v-main
      class="app-main"
      :class="{
        'customer-main': route.meta.portal,
        'management-main': authStore.isUserLoggedIn && !route.meta.portal,
      }"
    >
      <v-container
        fluid
        class="app-content"
        :class="{
          'customer-content': route.meta.portal,
          'management-content': authStore.isUserLoggedIn && !route.meta.portal,
        }"
      >
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.customer-content {
  padding: 0 !important;
}
.customer-main {
  background: #f7f8f5 !important;
}
.app-main {
  background-color: #f7f8f5;
}

.app-content {
  padding: 20px 24px;
}

@media (max-width: 960px) {
  .app-content {
    padding: 14px 12px;
  }
}
</style>
