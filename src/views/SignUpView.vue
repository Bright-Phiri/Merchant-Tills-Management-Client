<script setup>
import { ref } from 'vue'
import { showToast } from '@/utils/utils'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
const visible = ref(false)
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
  <div class="d-flex flex-column align-center my-6">
    <v-card class="pa-12 pb-8 mt-6" elevation="8" width="448" rounded="lg">
      <v-img class="mx-auto my-1" max-width="70" src="/LOGO.png" />
      <div class="text-subtitle-1 text-medium-emphasis mt-4">Account</div>

      <v-text-field
        density="compact"
        placeholder="User name"
        prepend-inner-icon="mdi-account-outline"
        variant="outlined"
        v-model="user.user_name"
      ></v-text-field>

      <div class="text-subtitle-1 text-medium-emphasis">Email Address</div>

      <v-text-field
        density="compact"
        placeholder="Email Address"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
        v-model="user.email_address"
      ></v-text-field>

      <div class="text-subtitle-1 text-medium-emphasis">Password</div>

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

      <div class="text-subtitle-1 text-medium-emphasis">Password Confirmation</div>

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

      <v-btn
        class="mb-8 text-uppercase"
        color="#01A1FF"
        size="large"
        variant="tonal"
        block
        :loading
        v-on:click="signUp"
      >
        Create Account
      </v-btn>

      <v-card-text class="text-center">
        <span>Already have and account? </span>
        <router-link
          to="/sign-in"
          class="text-blue text-decoration-none d-inline-flex align-center"
        >
          Sign in<v-icon icon="mdi-chevron-right" />
        </router-link>
      </v-card-text>
    </v-card>
  </div>
</template>
