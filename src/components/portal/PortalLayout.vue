<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { useCustomerStore } from '@/stores/useCustomerStore'
import '@/assets/portal.css'

const customer = useCustomerStore()
const route = useRoute()
const router = useRouter()
const menuOpen = ref(false)
const helpOpen = ref(false)
const mobile = useMediaQuery('(max-width: 900px)')
const sidebar = ref(null)
const menuButton = ref(null)
const links = [
  { to: '/portal', label: 'Overview', icon: 'mdi-view-dashboard-outline' },
  { to: '/portal/plans', label: 'Subscription plans', icon: 'mdi-layers-outline' },
  { to: '/portal/payments', label: 'Payment history', icon: 'mdi-receipt-text-outline' },
]
function signOut() {
  customer.logout()
  router.push('/portal/login')
}
function sessionExpired() {
  if (route.meta.customer)
    router.replace({ path: '/portal/login', query: { redirect: route.fullPath, expired: '1' } })
}
watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
    helpOpen.value = false
  },
)
watch(menuOpen, async (open) => {
  await nextTick()
  if (mobile.value) {
    if (open) sidebar.value?.querySelector('a')?.focus()
    else menuButton.value?.focus()
  }
})
onMounted(() => window.addEventListener('portal:unauthorized', sessionExpired))
onBeforeUnmount(() => window.removeEventListener('portal:unauthorized', sessionExpired))
</script>

<template>
  <div class="portal-shell" @keydown.esc="menuOpen = false">
    <a class="portal-skip" href="#portal-content">Skip to content</a>
    <button
      v-if="menuOpen"
      class="portal-scrim"
      aria-label="Close navigation"
      @click="menuOpen = false"
    ></button>
    <aside
      ref="sidebar"
      class="portal-sidebar"
      :class="{ 'is-open': menuOpen }"
      :inert="mobile && !menuOpen"
      aria-label="Customer navigation"
    >
      <button
        v-if="mobile"
        class="portal-close-menu"
        aria-label="Close navigation"
        @click="menuOpen = false"
      >
        <v-icon icon="mdi-close" size="19" />
      </button>
      <RouterLink to="/portal" class="portal-brand"
        ><span class="portal-brand-mark"><v-icon icon="mdi-point-of-sale" size="23" /></span
        ><span>T-Control<span class="portal-brand-caption">MERCHANT PORTAL</span></span></RouterLink
      >
      <div class="portal-workspace">
        <span class="portal-workspace-icon"
          ><v-icon icon="mdi-storefront-outline" size="20"
        /></span>
        <div>
          <strong>{{ customer.taxpayer?.name }}</strong
          ><small>Your business workspace</small>
        </div>
        <v-icon icon="mdi-check-decagram" size="16" />
      </div>
      <p class="portal-nav-label">WORKSPACE</p>
      <nav>
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="portal-nav-link"
          :class="{
            selected:
              route.path === link.to ||
              (link.to.endsWith('plans') && route.path.includes('/checkout')),
          }"
          :aria-current="route.path === link.to ? 'page' : undefined"
          ><v-icon :icon="link.icon" size="21" />{{ link.label
          }}<span v-if="link.to.endsWith('plans')" class="portal-nav-dot"></span
        ></RouterLink>
      </nav>
      <div class="portal-sidebar-bottom">
        <div class="portal-help-card">
          <v-icon icon="mdi-lifebuoy" size="24" /><strong>A little help?</strong>
          <p>Find answers about payments and your subscription.</p>
          <button class="portal-help-link" @click="helpOpen = !helpOpen">
            Billing help <v-icon icon="mdi-arrow-top-right" size="17" />
          </button>
        </div>
        <button class="portal-signout" @click="signOut">
          <v-icon icon="mdi-logout" size="19" /> Sign out</button
        ><span class="portal-sidebar-foot">Built for your business.</span>
      </div>
    </aside>
    <div class="portal-main" :inert="mobile && menuOpen">
      <header class="portal-topbar">
        <div class="portal-topbar-left">
          <button
            ref="menuButton"
            class="portal-mobile-menu"
            aria-label="Toggle navigation"
            :aria-expanded="menuOpen"
            @click="menuOpen = !menuOpen"
          >
            <v-icon icon="mdi-menu" /></button
          ><span class="portal-breadcrumb"
            >Workspace <v-icon icon="mdi-chevron-right" size="16" />
            <strong>{{ route.meta.title || 'Billing' }}</strong></span
          >
        </div>
        <div class="portal-topbar-right">
          <span class="portal-private"
            ><v-icon icon="mdi-lock-outline" size="15" /> Customer workspace</span
          ><span class="portal-avatar">{{
            customer.taxpayer?.name?.slice(0, 2).toUpperCase()
          }}</span>
        </div>
      </header>
      <main id="portal-content" class="portal-content" tabindex="-1">
        <RouterView :key="route.fullPath" />
      </main>
      <footer class="portal-footer">
        <span>© {{ new Date().getFullYear() }} T-Control</span
        ><span>Terminal subscriptions, made simple.</span
        ><button @click="helpOpen = !helpOpen">
          Billing help <v-icon icon="mdi-arrow-top-right" size="14" />
        </button>
      </footer>
    </div>
    <v-dialog v-model="helpOpen" max-width="520"
      ><section class="portal-help-dialog">
        <div class="portal-section-heading">
          <h2>Billing help</h2>
          <button aria-label="Close help" @click="helpOpen = false">
            <v-icon icon="mdi-close" />
          </button>
        </div>
        <h3>How do I pay?</h3>
        <p>
          Choose a plan and OneKhusa creates a temporary account number. Send the exact amount from
          your bank or mobile money app before that account expires.
        </p>
        <h3>Paid but still waiting?</h3>
        <p>
          Open your pending payment from Overview and select “Check payment status”. Avoid paying
          again while confirmation is pending.
        </p>
        <h3>Need account help?</h3>
        <p>
          Contact the team that activated your POS terminal. Include your TIN and payment reference,
          but never your password or payment PIN.
        </p>
      </section></v-dialog
    >
  </div>
</template>
