<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCustomerStore } from '@/stores/useCustomerStore'
import customerApi from '@/services/customerApi'
import { safePortalReturn, billingError } from '@/utils/billing'
import '@/assets/portal.css'
const route = useRoute()
const router = useRouter()
const customer = useCustomerStore()
const tin = ref('')
const password = ref('')
const visible = ref(false)
const busy = ref(false)
const error = ref('')
async function login() {
  if (busy.value) return
  error.value = ''
  busy.value = true
  try {
    const response = await customerApi.post('taxpayers/login', {
      tin: tin.value,
      password: password.value,
    })
    customer.signIn(response.data.data)
    password.value = ''
    await router.replace(safePortalReturn(route.query.redirect))
  } catch (err) {
    error.value = [400, 404].includes(err.response?.status)
      ? 'Your TIN or password is incorrect. Please check and try again.'
      : billingError(err)
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <div class="portal-login">
    <aside class="portal-login-story">
      <div class="portal-brand">
        <span class="portal-brand-mark"><v-icon icon="mdi-point-of-sale" /></span
        ><span>T-Control<span class="portal-brand-caption">MERCHANT PORTAL</span></span>
      </div>
      <div>
        <p class="portal-eyebrow" style="color: #b8d9bb">MORE TIME FOR WHAT MATTERS</p>
        <h1>Your business.<br />Your terminals.<br /><span>All in your hands.</span></h1>
        <p>
          A simpler way to manage your POS subscription. Choose a plan, pay securely, and get back
          to business.
        </p>
        <div class="portal-login-illustration">
          <v-icon icon="mdi-storefront-outline" size="40" />
          <div>
            <strong>One account. Every terminal.</strong
            ><small>Built around your business, under your TIN.</small>
          </div>
        </div>
      </div>
      <footer>Terminal subscriptions, made simple.</footer>
    </aside>
    <div class="portal-login-form-wrap">
      <form class="portal-login-form" @submit.prevent="login">
        <p class="portal-eyebrow">WELCOME BACK</p>
        <h2>Let’s get you signed in.</h2>
        <p>Use the taxpayer account provided when your POS terminal was activated.</p>
        <div v-if="route.query.expired" class="portal-note" style="margin-bottom: 20px">
          Your session ended. Sign in to continue where you left off.
        </div>
        <div v-if="error" class="portal-inline-error" role="alert">{{ error }}</div>
        <label class="portal-input-label" for="customer-tin"
          >Taxpayer identification number (TIN)</label
        ><input
          id="customer-tin"
          v-model.trim="tin"
          class="portal-input"
          autocomplete="username"
          inputmode="numeric"
          placeholder="Enter your TIN"
          required
        /><label class="portal-input-label" for="customer-password">Password</label>
        <div class="portal-password">
          <input
            id="customer-password"
            v-model="password"
            class="portal-input"
            :type="visible ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="Enter your password"
            required
          /><button
            type="button"
            :aria-label="visible ? 'Hide password' : 'Show password'"
            @click="visible = !visible"
          >
            <v-icon :icon="visible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" size="20" />
          </button>
        </div>
        <button
          class="portal-btn portal-btn-primary portal-btn-wide"
          type="submit"
          :disabled="busy"
        >
          {{ busy ? 'Signing you in…' : 'Sign in to your account'
          }}<v-icon icon="mdi-arrow-right" size="18" />
        </button>
        <p class="portal-caption" style="margin-top: 20px">
          Can’t sign in? Contact the team that activated your POS for help with your taxpayer
          account.
        </p>
        <div class="portal-login-foot">
          Managing merchant accounts?
          <RouterLink to="/sign-in" class="portal-text-link"
            >Staff sign in <v-icon icon="mdi-arrow-top-right" size="14"
          /></RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>
