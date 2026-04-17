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
const rail = ref(false)

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
  const result = []
  let pendingHeader = null
  const perms = authStore.getPermissions || {}

  for (const link of links) {
    if (link.header) {
      pendingHeader = link
      continue
    }

    const isPublic = !link.resource
    const allowedActions = perms[link.resource] || []
    const isAllowed = isPublic || allowedActions.includes(link.action)

    if (!isAllowed) continue

    if (pendingHeader) {
      result.push(pendingHeader)
      pendingHeader = null
    }

    result.push(link)
  }

  return result
})

const composeTarget = computed(() => {
  const firstItem = filteredLinks.value.find((link) => !link.header)
  return firstItem?.to || '/dashboard'
})

const isRailMode = computed(() => !mdAndDown.value && rail.value)

const userInitial = computed(() => {
  const name = authStore.getUserName || ''
  return name ? name.charAt(0).toUpperCase() : '?'
})

const toggleDrawer = () => {
  if (mdAndDown.value) {
    drawer.value = !drawer.value
    return
  }

  rail.value = !rail.value
}

const isActive = (to) => {
  return route.path === to || route.path.startsWith(`${to}/`)
}

const navigateTo = async (to) => {
  if (route.path !== to) {
    await router.push({ path: to })
  }

  if (mdAndDown.value) {
    drawer.value = false
  }
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
      app
      class="gmail-drawer"
      color="#f8fafd"
      :width="280"
      :rail-width="84"
      :rail="isRailMode"
      :permanent="!mdAndDown"
      :temporary="mdAndDown"
      :elevation="0"
      border="0"
    >
      <div class="drawer-top" :class="{ compact: isRailMode }">
        <div class="brand-wrap" :class="{ compact: isRailMode }">
          <v-img class="brand-logo" max-width="130" src="/images/LOGO.png" />
        </div>
      </div>

      <div class="drawer-scroll" :class="{ compact: isRailMode }">
        <template v-for="(link, index) in filteredLinks" :key="index">
          <p v-if="link.header && !isRailMode" class="nav-group-title">
            {{ link.header }}
          </p>

          <button
            v-else
            type="button"
            class="gmail-nav-item"
            :class="{ active: isActive(link.to), compact: isRailMode }"
            :title="isRailMode ? link.text : undefined"
            @click="navigateTo(link.to)"
          >
            <v-icon class="nav-icon" :icon="link.icon" size="20" />
            <span v-if="!isRailMode" class="nav-label">{{ link.text }}</span>
          </button>
        </template>
      </div>

      <template v-slot:append>
        <div class="drawer-footer" :class="{ compact: isRailMode }">
          <div class="account-chip">
            <v-avatar size="34" color="#1a73e8">
              <span class="avatar-text">{{ userInitial }}</span>
            </v-avatar>

            <div v-if="!isRailMode" class="account-text">
              <span class="account-name">{{ authStore.getUserName }}</span>
              <span class="account-caption">Signed in</span>
            </div>
          </div>

          <v-btn
            class="logout-btn"
            :icon="isRailMode ? 'mdi-logout' : undefined"
            :variant="isRailMode ? 'text' : 'flat'"
            @click="logout"
          >
            <template v-if="!isRailMode">
              <v-icon icon="mdi-logout" size="18" class="mr-2" />
              Sign out
            </template>
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar :elevation="0" color="#f8fafd">
      <template v-slot:prepend>
        <v-app-bar-nav-icon
          class="menu-toggle-btn"
          size="large"
          variant="text"
          @click.stop="toggleDrawer"
        />
      </template>
      <v-app-bar-title class="app-title">Terminal Control</v-app-bar-title>

      <template v-slot:append>
        <v-avatar size="34" color="#1a73e8" class="mr-2">
          <span class="text-white text-subtitle-2">
            {{ authStore.getUserName ? authStore.getUserName.charAt(0).toUpperCase() : '' }}
          </span>
        </v-avatar>
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
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from {
  transform: translateX(15px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-15px);
  opacity: 0;
}

.nav-shell {
  font-family:
    'Google Sans',
    'Segoe UI',
    'Helvetica Neue',
    Arial,
    sans-serif;
}

.gmail-drawer {
  border-right: none !important;
}

.gmail-drawer :deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8fafd;
}

.gmail-drawer :deep(.v-navigation-drawer__append) {
  background: #f8fafd;
}

.drawer-top {
  padding: 10px 12px 0 12px;
}

.drawer-top.compact {
  padding: 10px 8px 0;
}

.brand-wrap {
  display: flex;
  align-items: center;
  min-height: 42px;
  padding: 2px 0 8px 10px;
}

.brand-wrap.compact {
  justify-content: center;
  padding: 2px 0 8px 0;
}

.brand-logo {
  opacity: 0.95;
}

.compose-btn {
  width: 146px;
  min-width: 146px;
  border-radius: 16px;
  padding-inline: 16px 18px;
  justify-content: flex-start;
  text-transform: none;
  letter-spacing: 0;
  font-size: 14px;
  font-weight: 600;
  color: #001d35;
  background: #c2e7ff;
  box-shadow: 0 1px 2px #00000024;
  gap: 12px;
}

.drawer-top.compact .compose-btn {
  width: 56px;
  min-width: 56px;
  margin-inline: auto;
  padding-inline: 0;
  justify-content: center;
  gap: 0;
}

.compose-btn:hover {
  background: #b7ddff;
}

.compose-label {
  white-space: nowrap;
}

.drawer-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 14px 0 0;
}

.drawer-scroll.compact {
  padding-top: 10px;
}

.nav-group-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: #5f6368;
  margin: 14px 0 8px;
  padding-left: 28px;
  text-transform: uppercase;
}

.gmail-nav-item {
  width: calc(100% - 10px);
  border: none;
  background: transparent;
  min-height: 34px;
  border-radius: 0 17px 17px 0;
  margin: 0 10px 2px 0;
  padding: 0 12px 0 26px;
  display: flex;
  align-items: center;
  gap: 15px;
  text-align: left;
  cursor: pointer;
  color: #202124;
  transition:
    background-color 0.16s ease,
    color 0.16s ease;
}

.gmail-nav-item:hover {
  background: #eaedf3;
}

.gmail-nav-item.active {
  background: #d3e3fd;
  color: #001d35;
}

.gmail-nav-item.active .nav-label {
  font-weight: 700;
}

.gmail-nav-item.compact {
  width: 56px;
  min-height: 56px;
  border-radius: 16px;
  margin: 0 auto 6px;
  padding: 0;
  justify-content: center;
  gap: 0;
}

.gmail-nav-item.compact:hover {
  background: #eaedf3;
}

.gmail-nav-item.compact.active {
  background: #d3e3fd;
}

.nav-icon {
  color: inherit;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
}

.drawer-footer {
  padding: 10px 12px 14px;
  border-top: 1px solid #e4e8f1;
}

.drawer-footer.compact {
  padding: 10px 8px 14px;
}

.account-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 18px;
  background: #edf2fa;
  padding: 8px 10px;
  min-height: 50px;
}

.drawer-footer.compact .account-chip {
  justify-content: center;
  padding: 8px;
}

.avatar-text {
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}

.account-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.account-name {
  font-size: 13px;
  font-weight: 600;
  line-height: 16px;
  color: #1f1f1f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-caption {
  font-size: 11px;
  color: #5f6368;
  line-height: 14px;
}

.logout-btn {
  width: 100%;
  margin-top: 10px;
  border-radius: 12px;
  text-transform: none;
  letter-spacing: 0;
  font-size: 13px;
  font-weight: 600;
  color: #001d35;
  background: #d3e3fd;
}

.drawer-footer.compact .logout-btn {
  margin-top: 8px;
  width: 100%;
}

.menu-toggle-btn {
  border-radius: 50%;
}

.menu-toggle-btn:hover {
  background: #e9eef6;
}

.app-title {
  font-size: 16px;
  font-weight: 600;
  color: #2e3135;
}

@media (max-width: 960px) {
  .drawer-top {
    padding-inline: 10px;
  }

  .compose-btn {
    width: 100%;
    min-width: 0;
  }

  .nav-group-title {
    padding-left: 22px;
  }

  .gmail-nav-item {
    width: calc(100% - 8px);
    padding-left: 20px;
  }
}
</style>
