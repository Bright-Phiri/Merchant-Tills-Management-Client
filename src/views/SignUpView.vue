<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { showToast } from '@/utils/utils'
import { useErrorHandler } from '@/composables/useErrorHandler'

const router = useRouter()
const { handleError } = useErrorHandler()
const loading = ref(false)
const visiblePassword = ref(false)
const visibleConfirmation = ref(false)
const submitted = ref(false)
const user = ref({ user_name: '', email_address: '', password: '', password_confirmation: '' })
const passwordsMatch = computed(
  () => !user.value.password_confirmation || user.value.password === user.value.password_confirmation,
)

async function signUp() {
  submitted.value = true
  if (!user.value.user_name || !user.value.email_address || !user.value.password || !user.value.password_confirmation) {
    showToast('Complete all fields to create your account.', 'warning')
    return
  }
  if (!passwordsMatch.value) {
    showToast('Your passwords do not match.', 'warning')
    return
  }

  try {
    loading.value = true
    const response = await api.post('users/register', user.value)
    if (response.status === 201) {
      showToast(response.data.message, 'success')
      await router.push('/sign-in')
    }
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="staff-signup">
    <aside class="signup-story">
      <RouterLink to="/sign-in" class="signup-brand">
        <span class="signup-brand-mark"><v-icon icon="mdi-point-of-sale" size="23" /></span>
        <span>T-Control<small>MANAGEMENT</small></span>
      </RouterLink>

      <div class="signup-story-copy">
        <p class="signup-eyebrow">YOUR OPERATIONS WORKSPACE</p>
        <h1>Bring your team<br /><span>into control.</span></h1>
        <p>Set up secure access to the tools that keep your merchants and terminals moving.</p>
        <div class="signup-benefits">
          <div><v-icon icon="mdi-monitor-dashboard" size="20" /><span><strong>One clear view</strong><small>Manage terminals, subscriptions, and payments.</small></span></div>
          <div><v-icon icon="mdi-account-lock-outline" size="20" /><span><strong>Access you control</strong><small>Your account is protected from the start.</small></span></div>
        </div>
      </div>

      <footer><v-icon icon="mdi-shield-check-outline" size="15" /> Secure account setup</footer>
    </aside>

    <main class="signup-main">
      <form class="signup-form" @submit.prevent="signUp">
        <p class="signup-form-eyebrow">GET STARTED</p>
        <h2>Create your account.</h2>
        <p class="signup-lead">Add your details to set up your T-Control access.</p>

        <label for="signup-username">Username</label>
        <div class="signup-input-wrap">
          <v-icon icon="mdi-account-outline" size="19" />
          <input id="signup-username" v-model.trim="user.user_name" type="text" placeholder="Choose a username" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" required />
        </div>

        <label class="signup-spaced-label" for="signup-email">Email address</label>
        <div class="signup-input-wrap">
          <v-icon icon="mdi-email-outline" size="19" />
          <input id="signup-email" v-model.trim="user.email_address" type="email" placeholder="you@company.com" autocomplete="email" autocapitalize="off" autocorrect="off" spellcheck="false" required />
        </div>

        <label class="signup-spaced-label" for="signup-password">Password</label>
        <div class="signup-input-wrap">
          <v-icon icon="mdi-lock-outline" size="19" />
          <input id="signup-password" v-model="user.password" :type="visiblePassword ? 'text' : 'password'" placeholder="Create a password" autocomplete="new-password" required />
          <button type="button" class="signup-password-toggle" :aria-label="visiblePassword ? 'Hide password' : 'Show password'" @click="visiblePassword = !visiblePassword">
            <v-icon :icon="visiblePassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" size="19" />
          </button>
        </div>

        <label class="signup-spaced-label" for="signup-confirmation">Confirm password</label>
        <div class="signup-input-wrap" :class="{ 'signup-input-invalid': submitted && !passwordsMatch }">
          <v-icon icon="mdi-lock-check-outline" size="19" />
          <input id="signup-confirmation" v-model="user.password_confirmation" :type="visibleConfirmation ? 'text' : 'password'" placeholder="Enter your password again" autocomplete="new-password" :aria-invalid="submitted && !passwordsMatch" aria-describedby="password-match" required />
          <button type="button" class="signup-password-toggle" :aria-label="visibleConfirmation ? 'Hide password' : 'Show password'" @click="visibleConfirmation = !visibleConfirmation">
            <v-icon :icon="visibleConfirmation ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" size="19" />
          </button>
        </div>
        <p v-if="submitted && !passwordsMatch" id="password-match" class="signup-field-error">Passwords do not match. Check both entries and try again.</p>
        <p v-else class="signup-hint">Use a password you don’t use for another account.</p>

        <button class="signup-submit" type="submit" :disabled="loading" :aria-busy="loading">
          <span v-if="loading" class="signup-loader" aria-hidden="true"></span>
          <span>{{ loading ? 'Creating account…' : 'Create account' }}</span>
          <v-icon v-if="!loading" icon="mdi-arrow-right" size="18" />
        </button>

        <div class="signup-security-note"><v-icon icon="mdi-shield-lock-outline" size="17" /><span>Your account details are used to secure your management workspace.</span></div>
        <p class="signup-signin">Already have an account? <RouterLink to="/sign-in">Sign in</RouterLink></p>
      </form>
    </main>
  </div>
</template>

<style scoped>
.staff-signup{display:grid;grid-template-columns:minmax(380px,.95fr) minmax(460px,1.05fr);min-height:calc(100vh - 40px);overflow:hidden;border:1px solid #dce4e1;border-radius:16px;background:#f7f8f5;color:#172d35;font-family:'Segoe UI',Arial,sans-serif}.signup-story{display:flex;flex-direction:column;justify-content:space-between;padding:44px clamp(35px,6vw,90px);background:#122b32;color:#e8f0e9}.signup-brand{display:flex;align-items:center;gap:12px;color:#fff;font-size:24px;font-weight:650;letter-spacing:-.8px;text-decoration:none}.signup-brand-mark{display:grid;width:38px;height:42px;place-items:center;border-radius:10px;background:#b5e4ca;color:#174f42;transform:rotate(-3deg)}.signup-brand small{display:block;margin-top:5px;color:#93abab;font-size:8px;font-weight:600;letter-spacing:2.3px}.signup-eyebrow,.signup-form-eyebrow{margin:0 0 12px;color:#b8d9bb;font-size:10px;font-weight:750;letter-spacing:1.8px}.signup-story-copy h1{margin:0;font-size:clamp(36px,4vw,58px);font-weight:550;letter-spacing:-2.2px;line-height:1.1}.signup-story-copy h1 span{color:#b8d9bb}.signup-story-copy>p:not(.signup-eyebrow){max-width:420px;margin:24px 0 30px;color:#b3c7c4;font-size:14px;line-height:1.9}.signup-benefits{display:grid;gap:12px;max-width:440px}.signup-benefits>div{display:flex;gap:12px;padding:15px;border:1px solid #355159;border-radius:11px;background:#19363d}.signup-benefits .v-icon{color:#b5e4ca}.signup-benefits strong,.signup-benefits small{display:block}.signup-benefits strong{font-size:12px}.signup-benefits small{margin-top:3px;color:#9fb5b4;font-size:10px;line-height:1.4}.signup-story footer{display:flex;align-items:center;gap:7px;color:#93abab;font-size:10px}.signup-main{display:flex;align-items:center;justify-content:center;padding:42px 35px}.signup-form{width:100%;max-width:400px}.signup-form-eyebrow{color:#087e70}.signup-form h2{margin:0;font-size:34px;font-weight:620;letter-spacing:-1.3px}.signup-lead{margin:7px 0 24px;color:#66777b;font-size:13px}.signup-form label{display:block;margin-bottom:8px;color:#40565b;font-size:11px;font-weight:650}.signup-spaced-label{margin-top:16px}.signup-input-wrap{display:flex;align-items:center;height:46px;padding:0 12px;border:1px solid #ccd7d3;border-radius:9px;background:#fff;color:#718184;transition:border-color .18s,box-shadow .18s}.signup-input-wrap:focus-within{border-color:#087e70;box-shadow:0 0 0 3px #dceee8}.signup-input-wrap input{width:100%;height:100%;padding:0 10px;border:0;outline:0;background:transparent;color:#172d35;font:inherit;font-size:13px}.signup-input-wrap input::placeholder{color:#9aa8a7}.signup-input-invalid{border-color:#c53c37}.signup-password-toggle{display:grid;width:32px;height:32px;flex:0 0 auto;place-items:center;border:0;border-radius:50%;background:transparent;color:#718184;cursor:pointer}.signup-hint,.signup-field-error{margin:7px 0 0;font-size:10px;line-height:1.45}.signup-hint{color:#7b898b}.signup-field-error{color:#a52520}.signup-submit{display:flex;width:100%;height:48px;align-items:center;justify-content:center;gap:10px;margin-top:20px;border:0;border-radius:9px;background:#087e70;color:#fff;cursor:pointer;font:inherit;font-size:13px;font-weight:700}.signup-submit:hover:not(:disabled){background:#056859}.signup-submit:disabled{cursor:wait;opacity:.65}.signup-loader{width:14px;height:14px;border:2px solid #fff;border-right-color:transparent;border-radius:50%;animation:signup-spin .8s linear infinite}@keyframes signup-spin{to{transform:rotate(360deg)}}.signup-security-note{display:flex;align-items:flex-start;gap:9px;margin-top:15px;padding:11px;border-radius:9px;background:#eef3ef;color:#607276;font-size:10px;line-height:1.5}.signup-security-note .v-icon{flex:0 0 auto;color:#087e70}.signup-signin{margin:22px 0 0;padding-top:17px;border-top:1px solid #e0e6e4;color:#718184;text-align:center;font-size:11px}.signup-signin a{color:#087e70;font-weight:650;text-decoration:none}.signup-signin a:hover{text-decoration:underline}
@media(max-width:900px){.staff-signup{grid-template-columns:1fr}.signup-story{gap:25px;padding:24px}.signup-story-copy,.signup-story footer{display:none}.signup-main{padding:44px 30px}}
@media(max-width:600px){.staff-signup{min-height:calc(100vh - 28px);border:0;border-radius:0}.signup-main{align-items:flex-start;padding:38px 22px}.signup-form h2{font-size:31px}}
</style>
