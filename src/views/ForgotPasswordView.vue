<script setup>
import { ref, watch, computed } from 'vue'
import { showToast } from '@/utils/utils'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
const step = ref(1)
const passwordVisible = ref(false)
const confirmPasswordVisible = ref(false)
const loading = ref(false)
const verifyingToken = ref(false)
const router = useRouter()

const user = ref({
  email_address: '',
  reset_password_token: '',
  password: '',
  password_confirmation: '',
})

const stepTitle = computed(() => {
  if (step.value === 1) return 'Recover your account'
  if (step.value === 2) return 'Verify reset code'
  return 'Create a new password'
})

const stepDescription = computed(() => {
  if (step.value === 1) return 'Enter your account email and we will send an 8-digit reset code.'
  if (step.value === 2) return `We sent a code to ${maskedEmail.value}. Enter it below to continue.`
  return 'Choose a strong password you have not used before.'
})

const progressValue = computed(() => {
  if (step.value === 1) return 34
  if (step.value === 2) return 67
  return 100
})

const maskedEmail = computed(() => {
  const email = user.value.email_address?.trim()
  if (!email || !email.includes('@')) return 'your email'

  const [name, domain] = email.split('@')
  const safeName = name.length <= 2 ? `${name[0] ?? '*'}*` : `${name.slice(0, 2)}${'*'.repeat(name.length - 2)}`
  return `${safeName}@${domain}`
})

const passwordStrength = computed(() => {
  const password = user.value.password
  if (!password) return { label: 'No password yet', color: '#94a3b8', score: 0 }

  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  if (score <= 1) return { label: 'Weak password', color: '#ef4444', score: 25 }
  if (score <= 2) return { label: 'Fair password', color: '#f59e0b', score: 55 }
  if (score === 3) return { label: 'Good password', color: '#0ea5e9', score: 80 }
  return { label: 'Strong password', color: '#22c55e', score: 100 }
})

const canSubmit = computed(() => {
  if (step.value === 1) return Boolean(user.value.email_address.trim())
  if (step.value === 2) return user.value.reset_password_token.trim().length === 8
  return Boolean(user.value.password && user.value.password_confirmation)
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
  const email = user.value.email_address.trim()
  if (!email) {
    showToast('⚠️ Please enter the email address.', 'warning')
    return
  }

  await makeApiRequest('users/forgot_password', { email_address: email }, () => {
    if (step.value < 2) step.value = 2
  })
}

const verifyToken = async () => {
  const token = user.value.reset_password_token.trim()

  if (!token) {
    showToast('⚠️ Please enter the reset token.', 'warning')
    return
  }

  if (token.length !== 8) {
    showToast('⚠️ Reset token must be 8 digits.', 'warning')
    return
  }

  if (verifyingToken.value) return

  try {
    verifyingToken.value = true
    await makeApiRequest('users/verify_password_reset_token', { reset_password_token: token }, () => {
      step.value = 3
    })
  } finally {
    verifyingToken.value = false
  }
}

watch(
  () => user.value.reset_password_token,
  (newToken) => {
    if (step.value !== 2) return

    const normalizedToken = newToken.replace(/\s/g, '')
    if (normalizedToken !== newToken) {
      user.value.reset_password_token = normalizedToken
      return
    }

    if (normalizedToken.length === 8) {
      verifyToken()
    }
  },
)

const goBack = () => {
  if (step.value > 1) {
    step.value -= 1
    return
  }

  router.push({ path: '/sign-in' })
}

const resetAccountPassword = async () => {
  if (step.value === 1) {
    await submitEmailAddress()
    return
  }

  if (step.value === 2) {
    await verifyToken()
    return
  }

  if (!user.value.password || !user.value.password_confirmation) {
    showToast('⚠️ Please enter all required fields.', 'warning')
    return
  }

  if (user.value.password !== user.value.password_confirmation) {
    showToast('⚠️ Passwords do not match.', 'warning')
    return
  }

  await makeApiRequest(
    'users/reset_password',
    {
      email_address: user.value.email_address.trim(),
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

    <v-card class="auth-card" elevation="0" width="520" rounded="xl">
      <v-img class="mx-auto my-1" height="54" src="/images/LOGO.png" />

      <div class="step-header mt-4">
        <p class="text-subtitle-2 text-medium-emphasis mb-2">Password recovery</p>
        <v-progress-linear :model-value="progressValue" color="#01A1FF" height="7" rounded></v-progress-linear>
        <div class="step-markers mt-2">
          <span :class="['marker', { active: step >= 1 }]">Email</span>
          <span :class="['marker', { active: step >= 2 }]">Code</span>
          <span :class="['marker', { active: step >= 3 }]">Password</span>
        </div>
      </div>

      <v-window v-model="step" class="mt-4" :touch="false">
        <v-window-item :value="1">
          <v-card-text class="px-0">
            <p class="text-h6 font-weight-bold">{{ stepTitle }}</p>
            <p class="text-body-2 text-medium-emphasis">{{ stepDescription }}</p>

            <v-text-field
              class="mt-5"
              density="comfortable"
              placeholder="Email address"
              prepend-inner-icon="mdi-email-outline"
              variant="solo-filled"
              rounded="lg"
              flat
              bg-color="white"
              hide-details="auto"
              @keyup.enter="resetAccountPassword"
              v-model="user.email_address"
            ></v-text-field>
          </v-card-text>
        </v-window-item>

        <v-window-item :value="2">
          <v-card-text class="px-0">
            <p class="text-h6 font-weight-bold">{{ stepTitle }}</p>
            <p class="text-body-2 text-medium-emphasis">{{ stepDescription }}</p>

            <v-text-field
              class="mt-5"
              density="comfortable"
              placeholder="8-digit reset code"
              prepend-inner-icon="mdi-shield-key-outline"
              variant="solo-filled"
              rounded="lg"
              flat
              bg-color="white"
              hide-details="auto"
              maxlength="8"
              v-model="user.reset_password_token"
            ></v-text-field>

            <div class="d-flex justify-space-between align-center mt-3">
              <span class="text-caption text-medium-emphasis">Did not receive it?</span>
              <v-btn variant="text" color="#0078C2" size="small" class="text-none px-1" :loading="loading" @click="submitEmailAddress">
                Resend code
              </v-btn>
            </div>
          </v-card-text>
        </v-window-item>

        <v-window-item :value="3">
          <v-card-text class="px-0">
            <p class="text-h6 font-weight-bold">{{ stepTitle }}</p>
            <p class="text-body-2 text-medium-emphasis">{{ stepDescription }}</p>

            <div class="text-subtitle-2 text-medium-emphasis my-2">New password</div>
            <v-text-field
              :append-inner-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="passwordVisible ? 'text' : 'password'"
              density="comfortable"
              placeholder="Enter your new password"
              prepend-inner-icon="mdi-lock-outline"
              variant="solo-filled"
              rounded="lg"
              flat
              bg-color="white"
              hide-details="auto"
              @click:append-inner="passwordVisible = !passwordVisible"
              v-model="user.password"
            ></v-text-field>

            <div class="strength-wrap mt-2">
              <v-progress-linear
                :model-value="passwordStrength.score"
                :color="passwordStrength.color"
                height="6"
                rounded
              ></v-progress-linear>
              <p class="text-caption mt-1" :style="{ color: passwordStrength.color }">{{ passwordStrength.label }}</p>
            </div>

            <div class="text-subtitle-2 text-medium-emphasis my-2">Confirm password</div>
            <v-text-field
              :append-inner-icon="confirmPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="confirmPasswordVisible ? 'text' : 'password'"
              density="comfortable"
              placeholder="Confirm your new password"
              prepend-inner-icon="mdi-lock-check-outline"
              variant="solo-filled"
              rounded="lg"
              flat
              bg-color="white"
              hide-details="auto"
              @keyup.enter="resetAccountPassword"
              @click:append-inner="confirmPasswordVisible = !confirmPasswordVisible"
              v-model="user.password_confirmation"
            ></v-text-field>
          </v-card-text>
        </v-window-item>
      </v-window>

      <div class="action-row pt-4">
        <v-btn variant="text" class="text-none" color="#4b5e72" @click="goBack">
          {{ step > 1 ? 'Back' : 'Return to sign in' }}
        </v-btn>

        <v-btn
          color="#01A1FF"
          variant="flat"
          rounded="lg"
          min-width="180"
          class="text-none font-weight-bold"
          :loading="loading"
          :disabled="!canSubmit"
          @click="resetAccountPassword"
        >
          {{ step < 3 ? 'Continue' : 'Update password' }}
        </v-btn>
      </div>
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

.step-markers {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.marker {
  font-size: 12px;
  color: #93a6b9;
  letter-spacing: 0.02em;
}

.marker.active {
  color: #0078c2;
  font-weight: 600;
}

.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

@media (max-width: 600px) {
  .auth-page {
    padding: 20px 10px;
  }

  .auth-card {
    padding: 24px 18px 18px;
  }

  .action-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
