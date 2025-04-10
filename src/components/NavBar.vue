<script setup>
import { ref } from 'vue'
const drawer = ref(true)
const navBarItems = [
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
    text: 'Settings',
    icon: 'mdi-cog-outline',
    to: '/settings',
  },
]
</script>

<template>
  <div class="NavBar">
    <v-navigation-drawer color="#365B73" theme="dark" :width="270" permanent v-model="drawer">
      <v-list>
        <v-list-item
          v-for="link in navBarItems"
          :prepend-icon="link.icon"
          :title="link.text"
          :key="link.text"
          :to="link.to"
          nav
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn block> Logout </v-btn>
        </div>
      </template>
    </v-navigation-drawer>
    <v-app-bar :elevation="1">
      <template v-slot:prepend>
        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title>Terminal Control</v-app-bar-title>
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
