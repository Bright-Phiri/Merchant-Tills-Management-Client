<script setup>
import { ref, watch } from 'vue'
import { showToast } from '@/utils/utils'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
const step = ref(1)
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
  <div class="d-flex flex-column align-center my-6">
    <v-card class="pa-12 pb-8 mt-6" elevation="8" width="448" rounded="lg">
      <v-img class="mx-auto my-1" max-width="70" src="/LOGO.png" />
      <v-window v-model="step">
        <v-window-item :value="1">
          <v-card-text class="px-0">
            <div class="text-subtitle-1 text-medium-emphasis mb-2">Email Address</div>
            <v-text-field
              density="compact"
              placeholder="Email Address"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              v-on:keyup.enter="submitEmailAddress"
              v-model="user.email_address"
            ></v-text-field>
            <span class="text-caption text-grey-darken-1">
              Please enter the email address associated with your account. We'll send you a link to
              create a new password.
            </span>
          </v-card-text>
        </v-window-item>

        <v-window-item :value="2">
          <v-card-text class="px-0">
            <div class="text-subtitle-1 text-medium-emphasis mb-2">Reset Token</div>
            <v-text-field
              density="compact"
              placeholder="Reset Token"
              prepend-inner-icon="mdi-key-chain"
              variant="outlined"
              v-model="user.reset_password_token"
            ></v-text-field>
          </v-card-text>
        </v-window-item>

        <v-window-item :value="3">
          <v-card-text class="px-0">
            <div class="text-subtitle-1 text-medium-emphasis mb-2">Password</div>
            <v-text-field
              :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="visible ? 'text' : 'password'"
              density="compact"
              placeholder="Enter your password"
              prepend-inner-icon="mdi-lock-outline"
              variant="outlined"
              @click:append-inner="visible = !visible"
              v-model="user.password"
            ></v-text-field>

            <div class="text-subtitle-1 text-medium-emphasis mb-2">Confirmation Password</div>
            <v-text-field
              :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="visible ? 'text' : 'password'"
              density="compact"
              placeholder="Enter your password"
              prepend-inner-icon="mdi-lock-outline"
              variant="outlined"
              @click:append-inner="visible = !visible"
              v-model="user.password_confirmation"
            ></v-text-field>
            <span class="text-caption text-grey-darken-1">
              Please enter a new password for your account and confirm it by entering it again."
            </span>
          </v-card-text>
        </v-window-item>
      </v-window>
      <v-card-actions class="mx-o">
        <v-spacer></v-spacer>
        <v-btn
          v-if="step < 4"
          color="primary"
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
