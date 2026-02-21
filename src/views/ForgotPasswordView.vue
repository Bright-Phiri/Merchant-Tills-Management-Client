<script setup>
import { ref, watch } from 'vue'
import { showToast } from '@/utils/utils'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
const step = ref(1)
const visible = ref(false)
const loading = ref(false)
const router = useRouter()

const user = ref({
  email_address: '',
  reset_password_token: '',
  password: '',
  password_confirmation: '',
})

const makeApiRequest = async (url, payload, successCallback) => {
  try {
    loading.value = true
    const response = await api.post(url, payload)
    if (response.status === 200) {
      showToast(response.data.message, 'success')
      successCallback()
    }
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}

const submitEmailAddress = async () => {
  if (!user.value.email_address) {
    showToast('⚠️ Please enter the email address.', 'warning')
    return
  }

  makeApiRequest('passwords/forgot_password', { email_address: user.value.email_address }, () => {
    step.value++
  })
}

watch(
  () => user.value.reset_password_token,
  (newToken) => {
    if (newToken.length === 8) {
      makeApiRequest('passwords/verify_password_reset_token', { reset_password_token: newToken }, () => {
        step.value++
      })
    }
  },
)

const resetAccountPassword = async () => {
  if (step.value === 1) {
    if (!user.value.email_address) {
      showToast('⚠️ Please enter the email address.', 'warning')
      return
    }

    makeApiRequest('passwords/forgot_password', { email_address: user.value.email_address }, () => {
      step.value++
    })
    return
  }

  if (step.value === 2) {
    if (!user.value.reset_password_token) {
      showToast('⚠️ Please enter the reset token.', 'warning')
      return
    }

    makeApiRequest(
      'passwords/verify_password_reset_token',
      { reset_password_token: user.value.reset_password_token },
      () => {
        step.value++
      },
    )
    return
  }

  if (!user.value.password || !user.value.password_confirmation) {
    showToast('⚠️ Please enter all required fields.', 'warning')
    return
  }

  if (user.value.password !== user.value.password_confirmation) {
    showToast('⚠️ Passwords don’t match.', 'warning')
    return
  }

  makeApiRequest(
    'passwords/reset_password',
    {
      email_address: user.value.email_address,
      password: user.value.password,
      password_confirmation: user.value.password_confirmation,
    },
    () => {
      router.push({ path: '/sign-in' })
    },
  )
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-glow auth-glow--top"></div>
    <div class="auth-glow auth-glow--bottom"></div>

    <v-card class="auth-card" elevation="0" width="480" rounded="xl">
      <v-img class="mx-auto my-1" height="54" src="/images/LOGO.png" />

      <v-window v-model="step" class="mt-2">
        <v-window-item :value="1">
          <v-card-text class="px-0">
            <p class="text-center text-h6 font-weight-bold">Reset Your Password</p>
            <p class="text-center text-body-2 text-medium-emphasis">Enter your email to receive a reset code.</p>
            <v-text-field
              class="mt-4"
              density="comfortable"
              placeholder="Email Address"
              prepend-inner-icon="mdi-email-outline"
              variant="solo-filled"
              rounded="lg"
              flat
              bg-color="white"
              hide-details="auto"
              @keyup.enter="submitEmailAddress"
              v-model="user.email_address"
            ></v-text-field>
          </v-card-text>
        </v-window-item>

        <v-window-item :value="2">
          <v-card-text class="px-0">
            <p class="text-center text-h6 font-weight-bold">Enter Reset Token</p>
            <p class="text-center text-body-2 text-medium-emphasis">Type the token sent to your email.</p>
            <v-text-field
              class="mt-4"
              density="comfortable"
              placeholder="Reset Token"
              prepend-inner-icon="mdi-key-chain"
              variant="solo-filled"
              rounded="lg"
              flat
              bg-color="white"
              hide-details="auto"
              v-model="user.reset_password_token"
            ></v-text-field>
          </v-card-text>
        </v-window-item>

        <v-window-item :value="3">
          <v-card-text class="px-0">
            <p class="text-center text-h6 font-weight-bold">Set a New Password</p>
            <p class="text-center text-body-2 text-medium-emphasis">Choose a strong password for your account.</p>

            <div class="text-subtitle-2 text-medium-emphasis my-2">Password</div>
            <v-text-field
              :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="visible ? 'text' : 'password'"
              density="comfortable"
              placeholder="Enter your password"
              prepend-inner-icon="mdi-lock-outline"
              variant="solo-filled"
              rounded="lg"
              flat
              bg-color="white"
              hide-details="auto"
              @click:append-inner="visible = !visible"
              v-model="user.password"
            ></v-text-field>

            <div class="text-subtitle-2 text-medium-emphasis my-2">Confirm Password</div>
            <v-text-field
              :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="visible ? 'text' : 'password'"
              density="comfortable"
              placeholder="Confirm your password"
              prepend-inner-icon="mdi-lock-outline"
              variant="solo-filled"
              rounded="lg"
              flat
              bg-color="white"
              hide-details="auto"
              @click:append-inner="visible = !visible"
              v-model="user.password_confirmation"
            ></v-text-field>
          </v-card-text>
        </v-window-item>
      </v-window>

      <v-card-actions class="px-0 pt-4">
        <v-btn color="#01A1FF" variant="flat" rounded="lg" block :loading="loading" @click="resetAccountPassword" class="text-none font-weight-bold">
          {{ step < 3 ? 'Next' : 'Reset Password' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - 48px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 15% 15%, rgba(1, 161, 255, 0.2), transparent 40%),
    radial-gradient(circle at 85% 80%, rgba(56, 189, 248, 0.2), transparent 35%),
    linear-gradient(135deg, #f4f8ff 0%, #eef6ff 55%, #f9fcff 100%);
}

.auth-glow {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 999px;
  filter: blur(50px);
  opacity: 0.55;
  pointer-events: none;
}

.auth-glow--top {
  top: -120px;
  right: -80px;
  background: #b8e7ff;
}

.auth-glow--bottom {
  bottom: -150px;
  left: -90px;
  background: #7dd8ff;
}

.auth-card {
  width: 100%;
  padding: 34px 30px 24px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 44px rgba(2, 61, 112, 0.12);
  z-index: 1;
}

@media (max-width: 600px) {
  .auth-page {
    padding: 20px 10px;
  }

  .auth-card {
    padding: 24px 18px 18px;
  }
}
</style>
