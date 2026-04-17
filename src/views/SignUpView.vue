<script setup>
import { ref } from 'vue'
import { showToast } from '@/utils/utils'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
const visiblePassword = ref(false)
const visibleConfirmation = ref(false)
const loading = ref(false)
const router = useRouter()
const user = ref({
  user_name: '',
  email_address: '',
  password: '',
  password_confirmation: '',
})

const signUp = async () => {
  if (!user.value.user_name || !user.value.password) {
    showToast('⚠️ Please enter all required fields.', 'warning')
    return
  }

  try {
    loading.value = true
    const response = await api.post('users/register', user.value)
    if (response.status === 201) {
      showToast(response.data.message, 'success')
      router.push({ path: '/sign-in' })
    }
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="gmail-signup-page">
    <div class="bg-one"></div>

    <section class="signup-container" aria-label="Sign up panel">
      <div class="signup-box">
        <v-img class="service-logo" src="/images/LOGO.png" alt="T-Control logo" />

        <form class="signup-form" @submit.prevent="signUp">
          <div class="signup-head">
            <h1 id="headtitle">Sign up</h1>
            <p class="service-name">Create your <span>T-Control</span> account</p>
          </div>

          <div class="field-container">
            <label class="textbox-label" for="signup-username">User name</label>
            <div class="textbox-div">
              <input
                id="signup-username"
                v-model.trim="user.user_name"
                class="textbox"
                type="text"
                placeholder="Enter user name"
                autocomplete="username"
                autocapitalize="off"
                autocorrect="off"
                spellcheck="false"
              />
            </div>

            <label class="textbox-label" for="signup-email">Email address</label>
            <div class="textbox-div">
              <input
                id="signup-email"
                v-model.trim="user.email_address"
                class="textbox"
                type="email"
                placeholder="Enter email address"
                autocomplete="email"
                autocapitalize="off"
                autocorrect="off"
                spellcheck="false"
              />
            </div>

            <label class="textbox-label" for="signup-password">Password</label>
            <div class="textbox-div">
              <input
                id="signup-password"
                v-model.trim="user.password"
                :type="visiblePassword ? 'text' : 'password'"
                class="textbox password-input"
                placeholder="Enter password"
                autocomplete="new-password"
                autocapitalize="off"
                autocorrect="off"
              />
              <button
                type="button"
                class="toggle-password"
                :aria-label="visiblePassword ? 'Hide password' : 'Show password'"
                @click="visiblePassword = !visiblePassword"
              >
                <v-icon size="20">
                  {{ visiblePassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
                </v-icon>
              </button>
            </div>

            <label class="textbox-label" for="signup-password-confirmation"
              >Password confirmation</label
            >
            <div class="textbox-div">
              <input
                id="signup-password-confirmation"
                v-model.trim="user.password_confirmation"
                :type="visibleConfirmation ? 'text' : 'password'"
                class="textbox password-input"
                placeholder="Confirm password"
                autocomplete="new-password"
                autocapitalize="off"
                autocorrect="off"
                @keyup.enter="signUp"
              />
              <button
                type="button"
                class="toggle-password"
                :aria-label="visibleConfirmation ? 'Hide password' : 'Show password'"
                @click="visibleConfirmation = !visibleConfirmation"
              >
                <v-icon size="20">
                  {{ visibleConfirmation ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
                </v-icon>
              </button>
            </div>
          </div>

          <button id="nextbtn" class="signup-btn blue" type="submit" :disabled="loading">
            <span v-if="loading" class="loader-dot" aria-hidden="true"></span>
            <span>{{ loading ? 'Creating account...' : 'Create account' }}</span>
          </button>
        </form>

        <div id="signinlink">
          Already have an account?
          <router-link to="/sign-in" class="signintrigger">Sign in</router-link>
        </div>
      </div>

      <aside class="rightside-box">
        <div class="mfa-panel">
          <div class="product-img" aria-hidden="true"></div>
          <div class="product-head">Secure onboarding</div>
          <div class="product-text">
            Start with a verified email and a strong password to protect terminals, users, and
            billing actions from day one.
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<style scoped>
.gmail-signup-page {
  position: relative;
  min-height: calc(100vh - 32px);
  padding: 36px 16px 20px;
  font-family:
    'Avenir Next',
    'Segoe UI',
    'Trebuchet MS',
    sans-serif;
}

.bg-one {
  display: block;
  position: fixed;
  inset: 0;
  background: linear-gradient(180deg, #f8fafd 0%, #edf2fb 100%);
  z-index: -1;
}

.signup-container {
  display: flex;
  width: min(890px, 100%);
  min-height: 520px;
  background-color: #fff;
  box-shadow: 0 2px 18px #00000014;
  border: 1px solid #dfe3eb;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border-radius: 6px;
}

.signup-box {
  display: flex;
  flex-direction: column;
  width: 500px;
  min-height: 540px;
  background: #fff;
  box-sizing: border-box;
  padding: 50px;
  overflow-y: auto;
  border-right: 1px solid #e7ebf3;
}

.service-logo {
  height: 40px;
  max-width: 170px;
  margin-bottom: 20px;
}

.signup-form {
  flex: 1;
}

.signup-head {
  margin-bottom: 24px;
}

#headtitle {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  line-height: 30px;
  color: #000;
}

.service-name {
  margin: 4px 0 0;
  display: block;
  font-size: 16px;
  color: #000;
  font-weight: 400;
  line-height: 28px;
}

.service-name span {
  font-weight: 600;
}

.textbox-label {
  display: block;
  font-size: 14px;
  color: #626262;
  padding-bottom: 10px;
}

.textbox-div {
  display: block;
  margin-bottom: 22px;
  position: relative;
}

.textbox {
  display: block;
  width: 100%;
  height: 44px;
  border-radius: 2px;
  font-size: 16px;
  outline: none;
  background: #f8f8f8;
  border: 1px solid #e4e4e4;
  padding: 0 12px;
  transition: border-color 0.2s ease-in-out;
}

.textbox::placeholder {
  color: #aab2bb;
  letter-spacing: 0.3px;
  font-weight: 400;
}

.textbox:focus {
  border-color: #1a73e8;
  background: #fff;
}

.password-input {
  padding-right: 52px;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 8px;
  height: 28px;
  width: 28px;
  border: none;
  background: transparent;
  color: #8f8f8f;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.signup-btn {
  cursor: pointer;
  display: inline-flex;
  width: 100%;
  height: 44px;
  border-radius: 4px;
  letter-spacing: 0.5px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  margin: 14px auto 0;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.signup-btn:disabled {
  cursor: not-allowed;
  opacity: 0.75;
}

.blue {
  background-color: #1a73e8;
  color: #fff;
}

.blue:hover:not(:disabled) {
  background-color: #185abc;
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
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

#signinlink {
  width: 100%;
  display: inline-block;
  margin: auto auto 0;
  padding-top: 26px;
  line-height: 20px;
  font-weight: 400;
  font-size: 14px;
  color: #555;
  text-align: center;
}

#signinlink .signintrigger {
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;
  color: #1a73e8;
  margin-left: 4px;
}

.rightside-box {
  width: 390px;
  box-sizing: border-box;
  padding: 40px;
  background-color: #f8fafd;
  border-left: 1px solid #e7ebf3;
  overflow: hidden;
}

.mfa-panel {
  overflow: hidden;
}

.product-img {
  display: block;
  height: 180px;
  width: 180px;
  border-radius: 22px;
  border: 1px solid #d7deeb;
  background:
    radial-gradient(circle at 24% 24%, #e8f0fe 0 26%, transparent 27%),
    radial-gradient(circle at 76% 28%, #e6f4ea 0 24%, transparent 25%),
    radial-gradient(circle at 50% 78%, #fce8e6 0 26%, transparent 27%),
    linear-gradient(145deg, #f6f9ff, #eef3fb);
  margin: 0 auto 50px;
}

.product-head {
  display: block;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 10px;
  text-align: center;
  color: #3c4043;
}

.product-text {
  display: block;
  font-size: 14px;
  line-height: 24px;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}

@media (max-width: 1024px) {
  .signup-container {
    width: min(500px, 100%);
    box-shadow: none;
  }

  .signup-box {
    width: 100%;
    border-right: none;
  }

  .rightside-box {
    display: none;
  }
}

@media (max-width: 600px) {
  .gmail-signup-page {
    padding-top: 40px;
  }

  .signup-container {
    width: 100%;
    box-shadow: none;
    min-height: auto;
  }

  .signup-box {
    padding: 0 30px 30px;
  }

  .service-logo {
    margin: 0 auto 24px;
  }

  .signup-head {
    margin-bottom: 30px;
  }
}
</style>
