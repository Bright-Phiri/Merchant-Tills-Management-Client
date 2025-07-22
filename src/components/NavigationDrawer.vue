<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()

const drawer = ref(true)

const isAdmin = authStore.getRole === 'Admin'

const links = [
  { header: 'MAIN' },
  {
    text: 'Dashboard',
    icon: 'mdi-view-dashboard',
    to: '/dashboard',
  },
  { header: 'MANAGEMENT' },
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
  { header: 'OTHER' },
  {
    text: 'Settings',
    icon: 'mdi-cog-outline',
    to: '/settings',
  },
]

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
    <v-navigation-drawer v-model="drawer" color="white" :width="280" elevation="1" app class="pa-4">
      <!-- Logo -->
      <div class="d-flex justify-start">
        <v-img max-width="177" src="/images/LOGO.png" />
      </div>

      <!-- Navigation Links -->
      <v-list nav dense>
        <template v-for="(link, index) in filteredLinks" :key="index">
          <v-list-subheader
            v-if="link.header"
            class="text-grey text-uppercase text-caption font-weight-bold"
          >
            {{ link.header }}
          </v-list-subheader>

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

      <!-- Footer User Info & Logout -->
      <template v-slot:append>
        <div class="mt-auto pa-2">
          <v-divider class="mb-2" />

          <v-btn block color="#01A1FF" prepend-icon="mdi-logout" @click="logout"> Logout </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar :elevation="0" color="#f9fafe">
      <template v-slot:prepend>
        <v-app-bar-nav-icon size="large" variant="text" @click.stop="drawer = !drawer" />
      </template>
      <v-app-bar-title class="text-subtitle-1">Terminal Control</v-app-bar-title>

      <template v-slot:append>
        <v-avatar size="35" color="blue" class="mr-2">
          <span class="text-white text-subtitle-2">
            {{ authStore.getUserName ? authStore.getUserName.charAt(0).toUpperCase() : '' }}
          </span>
        </v-avatar>
        <span class="mr-5 ml-1">{{ authStore.getUserName }}</span>
      </template>
    </v-app-bar>

    <!-- Main Content -->
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
