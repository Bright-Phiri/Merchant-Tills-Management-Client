<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useDisplay } from 'vuetify'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { mdAndDown } = useDisplay()

const drawer = ref(true)

const links = [
  { header: 'MAIN' },
  { text: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dashboard', resource: null, action: null },
  { header: 'MANAGEMENT' },
  {
    text: 'Clients',
    icon: 'mdi-account-multiple',
    to: '/clients',
    resource: 'taxpayers',
    action: 'read', // <-- match backend permission
  },
  {
    text: 'Terminals',
    icon: 'mdi-sitemap',
    to: '/terminals',
    resource: 'terminals',
    action: 'read',
  },
  {
    text: 'Subscriptions',
    icon: 'mdi-playlist-check',
    to: '/subscriptions',
    resource: 'subscriptions',
    action: 'read',
  },
  {
    text: 'Payments',
    icon: 'mdi-credit-card-outline',
    to: '/payments',
    resource: 'payments',
    action: 'read',
  },
  {
    text: 'Users',
    icon: 'mdi-account-multiple',
    to: '/users',
    resource: 'users',
    action: 'read',
  },
  {
    text: 'Activity Logs',
    icon: 'mdi-history',
    to: '/logs',
    resource: 'logs',
    action: 'read',
  },
  { header: 'OTHER' },
  { text: 'Settings', icon: 'mdi-cog-outline', to: '/settings', resource: null, action: null },
]

const filteredLinks = computed(() => {
  const perms = authStore.getPermissions
  return links.filter((link) => {
    if (!link.resource) return true
    const allowedActions = perms[link.resource] || []
    return allowedActions.includes(link.action)
  })
})

const drawerMode = computed(() => (mdAndDown.value ? 'temporary' : 'permanent'))

const isActiveRoute = (to) => {
  if (to === '/dashboard') return route.path === to
  return route.path.startsWith(to)
}

const onNavigate = () => {
  if (mdAndDown.value) drawer.value = false
}

const logout = () => {
  authStore.logout()
  router.push({ path: '/sign-in' })
}
</script>

<template>
  <div class="nav-shell">
    <v-navigation-drawer
      v-model="drawer"
      :location="$vuetify.display.xs ? 'left' : undefined"
      :temporary="drawerMode === 'temporary'"
      :permanent="drawerMode === 'permanent'"
      :width="296"
      color="transparent"
      app
      class="modern-drawer pa-3"
    >
      <div class="brand-wrap d-flex align-center">
        <v-img alt="T-Control logo" max-width="148" src="/images/LOGO.png" class="mr-2" />
      </div>

      <v-list nav class="nav-list px-1 mt-2">
        <template v-for="(link, index) in filteredLinks" :key="index">
          <v-list-subheader v-if="link.header" class="nav-subheader">
            {{ link.header }}
          </v-list-subheader>

          <v-list-item
            v-else
            :prepend-icon="link.icon"
            :title="link.text"
            :to="link.to"
            rounded="lg"
            class="nav-item mb-1"
            :class="{ 'nav-item--active': isActiveRoute(link.to) }"
            @click="onNavigate"
          />
        </template>
      </v-list>

      <template v-slot:append>
        <div class="drawer-footer pa-2">
          <div class="profile-card d-flex align-center mb-3">
            <v-avatar size="38" color="#01A1FF" class="mr-3">
              <span class="text-white text-body-2 font-weight-bold">
                {{ authStore.getUserName ? authStore.getUserName.charAt(0).toUpperCase() : '' }}
              </span>
            </v-avatar>
            <div class="profile-copy">
              <p class="profile-name mb-0">{{ authStore.getUserName }}</p>
              <p class="profile-label mb-0">Active session</p>
            </div>
          </div>

          <v-btn block variant="tonal" color="error" prepend-icon="mdi-logout" @click="logout">
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar elevation="0" color="transparent" class="modern-appbar px-2">
      <template v-slot:prepend>
        <v-app-bar-nav-icon size="large" variant="text" @click.stop="drawer = !drawer" />
      </template>
      <v-app-bar-title class="appbar-title">Terminal Control</v-app-bar-title>

      <template v-slot:append>
        <v-avatar size="34" color="#01A1FF" class="mr-2">
          <span class="text-white text-body-2">
            {{ authStore.getUserName ? authStore.getUserName.charAt(0).toUpperCase() : '' }}
          </span>
        </v-avatar>
        <span class="mr-4 text-body-2 text-medium-emphasis">{{ authStore.getUserName }}</span>
      </template>
    </v-app-bar>

    <router-view v-slot="{ Component, route: currentRoute }">
      <Transition name="slide-fade" mode="out-in">
        <component :is="Component" :key="currentRoute.fullPath" />
      </Transition>
    </router-view>
  </div>
</template>

<style scoped>
.nav-shell {
  position: relative;
}

.modern-drawer :deep(.v-navigation-drawer__content) {
  border-radius: 20px;
  margin: 10px;
  padding: 8px;
  background: linear-gradient(180deg, #ffffff 0%, #f6faff 100%);
  border: 1px solid #e7eef8;
  box-shadow: 0 18px 34px rgba(16, 67, 110, 0.08);
}

.brand-wrap {
  min-height: 56px;
  padding: 6px 8px 10px;
}

.nav-subheader {
  color: #7a8aa0;
  font-size: 0.69rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  font-weight: 700;
  padding-top: 16px;
  padding-bottom: 6px;
}

.nav-item {
  min-height: 44px;
  color: #3b4d65;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
}

.nav-item:hover {
  background: #eef6ff;
  transform: translateX(1px);
}

.nav-item :deep(.v-list-item__prepend > .v-icon) {
  opacity: 0.9;
}

.nav-item--active {
  background: linear-gradient(90deg, rgba(1, 161, 255, 0.14), rgba(1, 161, 255, 0.08));
  color: #016ba7;
  font-weight: 600;
}

.nav-item--active :deep(.v-list-item__prepend > .v-icon) {
  color: #0186d3;
  opacity: 1;
}

.drawer-footer {
  border-top: 1px solid #e8eef6;
}

.profile-card {
  border: 1px solid #e8eef6;
  background: #f8fbff;
  border-radius: 12px;
  padding: 10px;
}

.profile-name {
  color: #24384f;
  font-size: 0.9rem;
  font-weight: 600;
}

.profile-label {
  color: #7890ac;
  font-size: 0.75rem;
}

.modern-appbar {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.55) 100%);
  backdrop-filter: blur(8px);
}

.appbar-title {
  font-weight: 600;
  color: #2f455e;
}

.slide-fade-enter-active {
  transition: all 0.24s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.16s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(8px);
  opacity: 0;
}
</style>
