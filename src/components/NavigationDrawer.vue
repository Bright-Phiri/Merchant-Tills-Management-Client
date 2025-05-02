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
    text: 'Logs',
    icon: 'mdi-history',
    to: '/logs',
  },
  {
    text: 'Settings',
    icon: 'mdi-cog-outline',
    to: '/settings',
  },
]

const isAdmin = authStore.getRole === 'Admin'

const filteredLinks = isAdmin ? links : links.filter((link) => link.text !== 'Users')

const logout = () => {
  authStore.logout()
  router.push({ path: '/sign-in' })
}
</script>

<template>
  <div class="NavBar">
    <v-navigation-drawer color="#ffffff" :width="280" v-model="drawer">
      <v-list nav>
        <v-list-item
          v-for="link in filteredLinks"
          :prepend-icon="link.icon"
          :title="link.text"
          :key="link.text"
          :to="link.to"
          rounded="xl"
          color="#01A1FF"
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-1">
          <v-btn color="#01A1FF" block v-on:click="logout"> Logout </v-btn>
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

      <v-app-bar-title>Terminal Control</v-app-bar-title>
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
