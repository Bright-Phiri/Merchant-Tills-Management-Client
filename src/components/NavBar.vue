<script setup>
import { ref } from 'vue'
const drawer = ref(false)
const navBarItems = [
  {
    text: 'Dashboard',
    icon: 'mdi-view-dashboard',
    to: '/dashbaord',
  },
  {
    text: 'Clients',
    icon: 'mdi-account-multiple',
    to: '/clients',
  },
  {
    text: 'Users',
    icon: 'mdi-account-multiple',
    to: '/users',
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
    text: 'Settings',
    icon: 'mdi-cog-outline',
    to: '/settings',
  },
]
</script>

<template>
  <div class="NavBar">
    <v-navigation-drawer class="bg-deep-purple" theme="dark" permanent v-model="drawer">
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
    <router-view />
  </div>
</template>
