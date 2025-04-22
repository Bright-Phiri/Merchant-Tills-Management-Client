<script setup>
import { ref } from 'vue'
import { showAlert, showToast } from '@/utils/utils'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

import api from '@/services/api'

const visible = ref(false)
const loading = ref(false)
const router = useRouter()
const auth = useAuthStore()
const user = ref({
  user_name: '',
  password: '',
})

const login = async () => {
  if (!user.value.user_name || !user.value.password) {
    showAlert('warning', 'Missing Fields', 'Please enter all required fields')
    return
  }

  try {
    loading.value = true
    const response = await api.post('authentication/login', user.value)
    if (response.status === 200) {
      auth.setToken(response.data.data.token)
      auth.setUserName(response.data.data.user.user_name)
      router.push({ path: '/dashboard' })
      showToast(`👋 Welcome back ${response.data.data.user.user_name}!!`)
    }
  } catch (err) {
    if (err.response) {
      showAlert('error', 'Failed to Login', err.response.data.message)
    } else {
      showAlert('error', 'Unable to Reach Server', err + ", Couldn't reach API")
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="d-flex flex-column align-center my-6">
    <v-card class="pa-12 pb-8 mt-6" elevation="8" max-width="448" rounded="lg">
      <div class="text-center text-h6 mt-2">Terminal Control | Sign In</div>
      <div class="text-subtitle-1 text-medium-emphasis mt-4">Account</div>

      <v-text-field
        density="compact"
        placeholder="User name"
        prepend-inner-icon="mdi-account-outline"
        variant="outlined"
        v-model="user.user_name"
      ></v-text-field>

      <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
        Password

        <a
          class="text-caption text-decoration-none text-blue"
          href="#"
          rel="noopener noreferrer"
          target="_blank"
        >
          Forgot login password?
        </a>
      </div>

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

      <v-card class="mb-12" color="surface-variant" variant="tonal">
        <v-card-text class="text-medium-emphasis text-caption">
          you can also click "Forgot login password?" to reset the login password.
        </v-card-text>
      </v-card>

      <v-btn
        class="mb-8"
        color="#01A1FF"
        size="large"
        variant="tonal"
        block
        :loading
        v-on:click="login"
      >
        Log In
      </v-btn>

      <v-card-text class="text-center">
        <router-link
          to="/sign-up"
          class="text-blue text-decoration-none d-inline-flex align-center"
        >
          Sign up now <v-icon icon="mdi-chevron-right" />
        </router-link>
      </v-card-text>
    </v-card>
  </div>
</template>
