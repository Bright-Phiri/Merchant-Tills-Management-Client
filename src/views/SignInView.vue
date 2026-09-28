<script setup>
import { ref } from 'vue'
import { showToast, encryptPassword } from '@/utils/utils'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useErrorHandler } from '@/composables/useErrorHandler'
import api from '@/services/api'

const { handleError } = useErrorHandler()
const visible = ref(false)
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const user = ref({ user_name: '', password: '' })

async function login() {
  if (!user.value.user_name || !user.value.password) {
    showToast('Please enter your username and password.', 'warning')
    return
  }
  try {
    loading.value = true
    const response = await api.post('authentication/login', user.value)
    if (response.status !== 200) return
    const account = response.data.data.user
    const { token, permissions } = response.data.data
    authStore.setToken(token)
    authStore.setUserId(account.id)
    authStore.setUserName(account.user_name)
    authStore.setEmail(account.email_address)
    authStore.setPermissions(permissions)
    authStore.setMustChangePassword(account.must_change_password)
    authStore.setSecret(await encryptPassword(user.value.password))
    user.value.password = ''
    await router.push(account.must_change_password ? '/change-password' : '/dashboard')
    showToast(
      account.must_change_password
        ? 'Create a new password to finish signing in.'
        : `Welcome back, ${account.user_name}.`,
      account.must_change_password ? 'warning' : 'success',
    )
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="staff-login">
    <aside class="staff-login-story">
      <RouterLink to="/sign-in" class="staff-brand">
        <span class="staff-brand-mark"><v-icon icon="mdi-point-of-sale" size="23" /></span>
        <span>T-Control<small>MANAGEMENT</small></span>
      </RouterLink>
      <div class="staff-story-copy">
        <p class="staff-eyebrow">BUILT FOR OPERATIONS</p>
        <h1>Control every terminal.<br /><span>Support every merchant.</span></h1>
        <p>One secure workspace for subscriptions, payments, terminal access, and your team.</p>
        <div class="staff-capabilities">
          <div>
            <v-icon icon="mdi-monitor-dashboard" size="20" />
            <span
              ><strong>Live oversight</strong><small>See the state of your operation</small></span
            >
          </div>
          <div>
            <v-icon icon="mdi-shield-check-outline" size="20" />
            <span
              ><strong>Controlled access</strong><small>Role-based staff permissions</small></span
            >
          </div>
        </div>
      </div>
      <footer><v-icon icon="mdi-lock-outline" size="14" /> Authorized staff access only</footer>
    </aside>

    <main class="staff-login-main">
      <form class="staff-login-form" @submit.prevent="login">
        <p class="staff-form-eyebrow">STAFF ACCESS</p>
        <h2>Welcome back.</h2>
        <p class="staff-form-lead">Sign in to your management workspace.</p>

        <label for="login-id">Email address or username</label>
        <div class="staff-input-wrap">
          <v-icon icon="mdi-account-outline" size="19" />
          <input
            id="login-id"
            v-model.trim="user.user_name"
            type="text"
            placeholder="Enter your email or username"
            autocomplete="username"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
            required
          />
        </div>

        <div class="staff-label-row">
          <label for="password">Password</label>
          <RouterLink to="/forgot-password">Forgot password?</RouterLink>
        </div>
        <div class="staff-input-wrap">
          <v-icon icon="mdi-lock-outline" size="19" />
          <input
            id="password"
            v-model.trim="user.password"
            :type="visible ? 'text' : 'password'"
            placeholder="Enter your password"
            autocomplete="current-password"
            required
          />
          <button
            type="button"
            class="staff-password-toggle"
            :aria-label="visible ? 'Hide password' : 'Show password'"
            @click="visible = !visible"
          >
            <v-icon :icon="visible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" size="19" />
          </button>
        </div>

        <button class="staff-submit" type="submit" :disabled="loading" :aria-busy="loading">
          <span v-if="loading" class="loader-dot" aria-hidden="true"></span>
          <span>{{ loading ? 'Signing in…' : 'Sign in to management' }}</span>
          <v-icon v-if="!loading" icon="mdi-arrow-right" size="18" />
        </button>

        <div class="staff-form-note">
          <v-icon icon="mdi-shield-lock-outline" size="17" />
          <span>Your protected session ends after 15 minutes of inactivity.</span>
        </div>
        <div class="staff-login-foot">
          <p>New staff member? <RouterLink to="/sign-up">Create an account</RouterLink></p>
          <p>
            Managing your POS subscription?
            <RouterLink to="/portal/login">Merchant sign in</RouterLink>
          </p>
        </div>
      </form>
    </main>
  </div>
</template>

<style scoped>
.staff-login {
  display: grid;
  grid-template-columns: minmax(380px, 0.95fr) minmax(460px, 1.05fr);
  min-height: calc(100vh - 40px);
  overflow: hidden;
  border: 1px solid #dce4e1;
  border-radius: 16px;
  background: #f7f8f5;
  color: #172d35;
  font-family: 'Segoe UI', Arial, sans-serif;
}
.staff-login-story {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 44px clamp(35px, 6vw, 90px);
  background: #122b32;
  color: #e8f0e9;
}
.staff-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  font-size: 24px;
  font-weight: 650;
  letter-spacing: -0.8px;
  text-decoration: none;
}
.staff-brand-mark {
  display: grid;
  width: 38px;
  height: 42px;
  place-items: center;
  border-radius: 10px;
  background: #b5e4ca;
  color: #174f42;
  transform: rotate(-3deg);
}
.staff-brand small {
  display: block;
  margin-top: 5px;
  color: #93abab;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 2.3px;
}
.staff-eyebrow,
.staff-form-eyebrow {
  margin: 0 0 12px;
  color: #b8d9bb;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 1.8px;
}
.staff-story-copy h1 {
  margin: 0;
  font-size: clamp(36px, 4vw, 58px);
  font-weight: 550;
  letter-spacing: -2.2px;
  line-height: 1.1;
}
.staff-story-copy h1 span {
  color: #b8d9bb;
}
.staff-story-copy > p:not(.staff-eyebrow) {
  max-width: 420px;
  margin: 24px 0 30px;
  color: #b3c7c4;
  font-size: 14px;
  line-height: 1.9;
}
.staff-capabilities {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  max-width: 480px;
}
.staff-capabilities > div {
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 1px solid #355159;
  border-radius: 11px;
  background: #19363d;
}
.staff-capabilities .v-icon {
  color: #b5e4ca;
}
.staff-capabilities strong,
.staff-capabilities small {
  display: block;
}
.staff-capabilities strong {
  font-size: 12px;
}
.staff-capabilities small {
  margin-top: 3px;
  color: #9fb5b4;
  font-size: 10px;
  line-height: 1.35;
}
.staff-login-story footer {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #93abab;
  font-size: 10px;
}
.staff-login-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 35px;
}
.staff-login-form {
  width: 100%;
  max-width: 400px;
}
.staff-form-eyebrow {
  color: #087e70;
}
.staff-login-form h2 {
  margin: 0;
  font-size: 36px;
  font-weight: 620;
  letter-spacing: -1.3px;
}
.staff-form-lead {
  margin: 7px 0 30px;
  color: #66777b;
  font-size: 13px;
}
.staff-login-form label {
  display: block;
  margin-bottom: 8px;
  color: #40565b;
  font-size: 11px;
  font-weight: 650;
}
.staff-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;
}
.staff-label-row a,
.staff-login-foot a {
  color: #087e70;
  font-size: 11px;
  font-weight: 650;
  text-decoration: none;
}
.staff-input-wrap {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 13px;
  border: 1px solid #ccd7d3;
  border-radius: 10px;
  background: #fff;
  color: #718184;
  transition:
    border-color 0.18s,
    box-shadow 0.18s;
}
.staff-input-wrap:focus-within {
  border-color: #087e70;
  box-shadow: 0 0 0 3px #dceee8;
}
.staff-input-wrap input {
  width: 100%;
  height: 100%;
  padding: 0 10px;
  border: 0;
  outline: 0;
  background: transparent;
  color: #172d35;
  font: inherit;
  font-size: 13px;
}
.staff-input-wrap input::placeholder {
  color: #9aa8a7;
}
.staff-password-toggle {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #718184;
  cursor: pointer;
}
.staff-submit {
  display: flex;
  width: 100%;
  height: 48px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
  border: 0;
  border-radius: 9px;
  background: #087e70;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
}
.staff-submit:hover:not(:disabled) {
  background: #056859;
}
.staff-submit:disabled {
  cursor: wait;
  opacity: 0.65;
}
.loader-dot {
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.staff-form-note {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 18px;
  padding: 12px;
  border-radius: 9px;
  background: #eef3ef;
  color: #607276;
  font-size: 10px;
  line-height: 1.5;
}
.staff-form-note .v-icon {
  color: #087e70;
}
.staff-login-foot {
  margin-top: 25px;
  padding-top: 19px;
  border-top: 1px solid #e0e6e4;
  color: #718184;
  font-size: 11px;
}
.staff-login-foot p {
  margin: 5px 0;
}
@media (max-width: 900px) {
  .staff-login {
    grid-template-columns: 1fr;
  }
  .staff-login-story {
    padding: 24px;
  }
  .staff-story-copy,
  .staff-login-story footer {
    display: none;
  }
}
@media (max-width: 600px) {
  .staff-login {
    min-height: calc(100vh - 28px);
    border: 0;
    border-radius: 0;
  }
  .staff-login-main {
    align-items: flex-start;
    padding: 40px 22px;
  }
  .staff-login-form h2 {
    font-size: 32px;
  }
}
</style>
