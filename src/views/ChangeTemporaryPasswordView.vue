<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import customerApi from '@/services/customerApi'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCustomerStore } from '@/stores/useCustomerStore'
import { showToast } from '@/utils/utils'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const customer = useCustomerStore()
const isCustomer = computed(() => route.meta.portal === true)
const currentPassword = ref('')
const password = ref('')
const confirmation = ref('')
const showCurrent = ref(false)
const showNew = ref(false)
const busy = ref(false)
const error = ref('')
const strongEnough = computed(
  () => password.value.length >= 8 && /[A-Za-z]/.test(password.value) && /\d/.test(password.value),
)
const canSubmit = computed(
  () => currentPassword.value && strongEnough.value && password.value === confirmation.value && !busy.value,
)

async function submit() {
  if (!canSubmit.value) return
  error.value = ''
  busy.value = true
  try {
    const client = isCustomer.value ? customerApi : api
    const endpoint = isCustomer.value ? 'taxpayer_account/password' : 'account/password'
    await client.patch(endpoint, {
      current_password: currentPassword.value,
      password: password.value,
      password_confirmation: confirmation.value,
    })
    if (isCustomer.value) customer.passwordChanged()
    else {
      auth.setMustChangePassword(false)
      auth.setSecret(null)
    }
    showToast('Password updated. Your account is now secure.', 'success')
    await router.replace(isCustomer.value ? '/portal' : '/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'We could not update your password. Please try again.'
  } finally {
    busy.value = false
  }
}

async function signOut() {
  if (isCustomer.value) customer.logout()
  else auth.logout()
  await router.replace(isCustomer.value ? '/portal/login' : '/sign-in')
}
</script>

<template>
  <main class="password-gate">
    <section class="password-card">
      <div class="password-mark"><v-icon icon="mdi-shield-key-outline" size="28" /></div>
      <p class="password-eyebrow">FIRST SIGN-IN</p>
      <h1>Secure your account.</h1>
      <p class="password-lead">
        The password sent by email is temporary. Create a private password before continuing.
      </p>

      <div v-if="error" class="password-error" role="alert">{{ error }}</div>
      <form @submit.prevent="submit">
        <label for="temporary-password">Temporary password</label>
        <div class="password-input">
          <v-icon icon="mdi-lock-outline" size="19" />
          <input
            id="temporary-password"
            v-model="currentPassword"
            :type="showCurrent ? 'text' : 'password'"
            autocomplete="current-password"
            required
          />
          <button type="button" :aria-label="showCurrent ? 'Hide temporary password' : 'Show temporary password'" @click="showCurrent = !showCurrent">
            <v-icon :icon="showCurrent ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" size="19" />
          </button>
        </div>

        <label for="new-password">New password</label>
        <div class="password-input">
          <v-icon icon="mdi-key-outline" size="19" />
          <input
            id="new-password"
            v-model="password"
            :type="showNew ? 'text' : 'password'"
            autocomplete="new-password"
            required
          />
          <button type="button" :aria-label="showNew ? 'Hide new password' : 'Show new password'" @click="showNew = !showNew">
            <v-icon :icon="showNew ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" size="19" />
          </button>
        </div>
        <p class="password-hint" :class="{ valid: strongEnough }">
          <v-icon :icon="strongEnough ? 'mdi-check-circle' : 'mdi-information-outline'" size="16" />
          Use at least 8 characters with a letter and a number.
        </p>

        <label for="confirm-password">Confirm new password</label>
        <div class="password-input">
          <v-icon icon="mdi-check-decagram-outline" size="19" />
          <input id="confirm-password" v-model="confirmation" type="password" autocomplete="new-password" required />
        </div>
        <p v-if="confirmation && confirmation !== password" class="password-mismatch">Passwords do not match.</p>

        <button class="password-submit" type="submit" :disabled="!canSubmit" :aria-busy="busy">
          {{ busy ? 'Updating password…' : 'Update password and continue' }}
          <v-icon v-if="!busy" icon="mdi-arrow-right" size="18" />
        </button>
      </form>
      <button class="password-signout" type="button" @click="signOut">Sign out</button>
    </section>
  </main>
</template>

<style scoped>
.password-gate { min-height: 100vh; display: grid; place-items: center; padding: 32px 20px; background: radial-gradient(circle at 20% 10%, #e4f1e9, transparent 32%), #f7f8f5; color: #172d35; font-family: 'Segoe UI', Arial, sans-serif; }
.password-card { width: min(100%, 470px); padding: 42px; border: 1px solid #dce4e1; border-radius: 20px; background: #fff; box-shadow: 0 24px 70px rgba(18, 43, 50, .1); }
.password-mark { display: grid; width: 52px; height: 52px; place-items: center; border-radius: 14px; background: #dceee8; color: #087e70; }
.password-eyebrow { margin: 24px 0 8px; color: #087e70; font-size: 10px; font-weight: 800; letter-spacing: 1.8px; }
h1 { margin: 0; font-size: 34px; letter-spacing: -1.2px; }
.password-lead { margin: 10px 0 28px; color: #66777b; font-size: 13px; line-height: 1.7; }
label { display: block; margin: 18px 0 8px; color: #40565b; font-size: 11px; font-weight: 700; }
.password-input { display: flex; height: 49px; align-items: center; padding: 0 13px; border: 1px solid #ccd7d3; border-radius: 10px; color: #718184; }
.password-input:focus-within { border-color: #087e70; box-shadow: 0 0 0 3px #dceee8; }
.password-input input { width: 100%; height: 100%; padding: 0 10px; border: 0; outline: 0; color: #172d35; font: inherit; }
.password-input button { display: grid; place-items: center; border: 0; background: transparent; color: #718184; cursor: pointer; }
.password-hint, .password-mismatch { display: flex; align-items: center; gap: 6px; margin: 8px 0 0; color: #7a898b; font-size: 10px; }
.password-hint.valid { color: #087e70; }
.password-mismatch { color: #b42318; }
.password-error { padding: 11px 13px; border-radius: 9px; background: #fff0ee; color: #9d241b; font-size: 12px; }
.password-submit { display: flex; width: 100%; height: 49px; align-items: center; justify-content: center; gap: 9px; margin-top: 25px; border: 0; border-radius: 10px; background: #087e70; color: #fff; cursor: pointer; font: inherit; font-size: 13px; font-weight: 750; }
.password-submit:disabled { cursor: not-allowed; opacity: .5; }
.password-signout { display: block; margin: 18px auto 0; border: 0; background: transparent; color: #66777b; cursor: pointer; font: inherit; font-size: 11px; font-weight: 650; }
@media (max-width: 520px) { .password-card { padding: 30px 22px; border-radius: 15px; } h1 { font-size: 29px; } }
</style>
