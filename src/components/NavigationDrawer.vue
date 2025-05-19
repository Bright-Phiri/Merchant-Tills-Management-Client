<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()
const drawer = ref(true)
const links = [
  {
    text: 'Dashboard',
    icon: 'mdi-view-dashboard',
    to: '/dashboard',
  },
  {
    text: 'Clients',
    icon: 'mdi-account-multiple',
    to: '/clients',
  },
  {
    text: 'Terminals',
    icon: 'mdi-sitemap',
    to: '/terminals',
  },
  {
    text: 'Subscriptions',
    icon: 'mdi-playlist-check',
    to: '/subscriptions',
  },
  {
    text: 'Payments',
    icon: 'mdi-credit-card-outline',
    to: '/payments',
  },
  {
    text: 'Users',
    icon: 'mdi-account-multiple',
    to: '/users',
  },
  {
    text: 'Activity Logs',
    icon: 'mdi-history',
    to: '/logs',
  },
  {
    divider: true, // <--- add this
  },
  {
    text: 'Settings',
    icon: 'mdi-cog-outline',
    to: '/settings',
  },
]

const isAdmin = authStore.getRole === 'Admin'

const filteredLinks = links.filter((link) => {
  if (!isAdmin && (link.text === 'Users' || link.text === 'Activity Logs')) return false
  return true
})

const logout = () => {
  authStore.logout()
  router.push({ path: '/sign-in' })
}
</script>

<template>
  <div class="NavBar">
    <v-navigation-drawer color="#ffffff" :width="280" v-model="drawer">
      <div class="d-flex justify-start">
        <v-img class="my-2 ml-2" max-width="40" src="/LOGO.png" />
        <span class="text-h5 mt-2 ml-1" style="color: #01a1ff">T-Control</span>
      </div>

      <v-list nav>
        <template v-for="link in filteredLinks" :key="link.text || 'divider'">
          <v-divider v-if="link.divider" class="my-2" />
          <v-list-item
            v-else
            :prepend-icon="link.icon"
            :title="link.text"
            :to="link.to"
            rounded="xl"
            color="#01A1FF"
          />
        </template>
      </v-list>

      <template v-slot:append>
        <div class="pa-1">
          <v-btn color="#01A1FF" prepend-icon="mdi-logout" block v-on:click="logout">
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar :elevation="0" color="#f9fafe">
      <template v-slot:prepend>
        <v-app-bar-nav-icon
          size="large"
          variant="text"
          @click.stop="drawer = !drawer"
        ></v-app-bar-nav-icon>
      </template>
      <v-app-bar-title class="text-subtitle-1">Terminal Control</v-app-bar-title>

      <template v-slot:append>
        <v-icon icon="mdi-account-circle"></v-icon>
        <span class="mr-5 ml-1">{{ authStore.getUserName }}</span>
      </template>
    </v-app-bar>

    <router-view v-slot="{ Component, route }">
      <Transition name="slide-fade" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </Transition>
    </router-view>
  </div>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
