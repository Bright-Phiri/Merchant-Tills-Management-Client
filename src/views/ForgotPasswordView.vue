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
    if (response.status == 200) {
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
  const payloadStep1 = {
    email_address: user.value.email_address,
  }
  makeApiRequest('passwords/forgot_password', payloadStep1, () => {
    step.value++
  })
}

watch(
  () => user.value.reset_password_token,
  (newToken) => {
    if (newToken.length === 8) {
      const payloadStep2 = {
        reset_password_token: newToken,
      }
      makeApiRequest('passwords/verify_password_reset_token', payloadStep2, () => {
        step.value++
      })
    }
  },
)

const resetAccountPassword = async () => {
  switch (step.value) {
    case 1:
      if (!user.value.email_address) {
        showToast('⚠️ Please enter the email address.', 'warning')
        return
      }
      const payloadStep1 = {
        email_address: user.value.email_address,
      }
      makeApiRequest('passwords/forgot_password', payloadStep1, () => {
        step.value++
      })
      break

    case 2:
      if (!user.value.reset_password_token) {
        showToast('⚠️ Please enter the reset token.', 'warning')
        return
      }
      const payloadStep2 = {
        reset_password_token: user.value.reset_password_token,
      }
      makeApiRequest('passwords/verify_password_reset_token', payloadStep2, () => {
        step.value++
      })
      break

    default:
      if (!user.value.password || !user.value.password_confirmation) {
        showToast('⚠️ Please enter all required fields.', 'warning')
        return
      }

      if (user.value.password !== user.value.password_confirmation) {
        showToast('⚠️ Passwords don’t match.', 'warning')
        return
      }
      const payloadStep3 = {
        email_address: user.value.email_address,
        password: user.value.password,
        password_confirmation: user.value.password_confirmation,
      }
      makeApiRequest('passwords/reset_password', payloadStep3, () => {
        router.push({ path: '/sign-in' })
      })
      break
  }
}
</script>

<template>
  <div class="forgot-page">
    <v-card class="forgot-card pa-10 pb-8 mt-6" width="468" rounded="xl">
      <v-img class="mx-auto my-1" height="50" src="/images/LOGO.png" />
      <v-window v-model="step">
        <v-window-item :value="1">
          <v-card-text class="px-0">
            <p class="mx-auto text-center text-h7 font-weight-bold">Reset Your Password</p>
            <p class="mx-auto text-center text-body-2">
              Enter the email linked to your account, and we’ll send you instructions to reset your
              password.
            </p>
            <v-text-field
              class="mt-2"
              placeholder="Email Address"
              prepend-inner-icon="mdi-email-outline"
              v-on:keyup.enter="submitEmailAddress"
              v-model="user.email_address"
            ></v-text-field>
          </v-card-text>
        </v-window-item>

        <v-window-item :value="2">
          <v-card-text class="px-0">
            <p class="mx-auto text-center text-h7 font-weight-bold">Enter Reset Token</p>
            <p class="mx-auto text-center text-body-2">
              Please enter the reset token you received to continue. This helps us verify your
              request before setting a new password.
            </p>
            <v-text-field
              class="mt-2"
              placeholder="Reset Token"
              prepend-inner-icon="mdi-key-chain"
              v-model="user.reset_password_token"
            ></v-text-field>
          </v-card-text>
        </v-window-item>

        <v-window-item :value="3">
          <v-card-text class="px-0">
            <p class="mx-auto text-center text-h7 font-weight-bold">Set a New Password</p>
            <p class="mx-auto text-center text-body-2">
              Please enter your new password below. Make sure it’s strong and something you’ll
              remember.
            </p>
            <div class="text-subtitle-1 text-medium-emphasis my-2">Password</div>
            <v-text-field
              :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="visible ? 'text' : 'password'"
              placeholder="Enter your password"
              prepend-inner-icon="mdi-lock-outline"
              @click:append-inner="visible = !visible"
              v-model="user.password"
            ></v-text-field>

            <div class="text-subtitle-1 text-medium-emphasis mb-2">Confirmation Password</div>
            <v-text-field
              :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="visible ? 'text' : 'password'"
              placeholder="Enter your password"
              prepend-inner-icon="mdi-lock-outline"
              @click:append-inner="visible = !visible"
              v-model="user.password_confirmation"
            ></v-text-field>
          </v-card-text>
        </v-window-item>
      </v-window>
      <v-card-actions class="mx-0">
        <v-spacer></v-spacer>
        <v-btn
          v-if="step < 4"
          variant="flat"
          :loading
          @click="resetAccountPassword"
        >
          Next
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<style scoped>
.forgot-page {
  min-height: calc(100vh - 40px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 24px;
}

.forgot-card {
  border: 1px solid #dfe3eb !important;
  box-shadow: 0 2px 14px #00000014 !important;
}

@media (max-width: 600px) {
  .forgot-page {
    padding-top: 10px;
  }

  .forgot-card {
    width: 100% !important;
    padding: 26px 22px 22px !important;
  }
}
</style>
