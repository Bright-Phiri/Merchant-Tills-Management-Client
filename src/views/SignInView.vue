<script setup>
import { ref } from 'vue'
import { showToast } from '@/utils/utils'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useErrorHandler } from '@/composables/useErrorHandler'
import api from '@/services/api'

const { handleError } = useErrorHandler()
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
    showToast('⚠️ Please enter all required fields.', 'warning')
    return
  }

  try {
    loading.value = true
    const response = await api.post('authentication/login', user.value)

    if (response.status === 200) {
      const user_name = response.data.data.user.user_name
      const user_Id = response.data.data.user.id
      const { token, role } = response.data.data

      auth.setToken(token)
      auth.setUserId(user_Id)
      auth.setUserName(user_name)
      auth.setUserRole(role)

      await router.push({ path: '/dashboard' })
      showToast(`👋 Welcome back ${response.data.data.user.user_name}!!`, 'success')
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
    <v-card class="pa-12 pb-8 mt-6" elevation="8" max-width="448" rounded="lg">
      <v-img class="mx-auto my-1" max-width="70" src="/LOGO.png" />
      <div class="text-subtitle-1 text-medium-emphasis mt-4">Account</div>

      <v-text-field
        density="compact"
        placeholder="User name"
        prepend-inner-icon="mdi-account-outline"
        variant="outlined"
        v-model.trim="user.user_name"
      ></v-text-field>

      <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
        Password

        <router-link class="text-caption text-decoration-none text-blue" to="/forgot-password">
          Forgot login password?
        </router-link>
      </div>

      <v-text-field
        :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visible ? 'text' : 'password'"
        density="compact"
        placeholder="Enter your password"
        prepend-inner-icon="mdi-lock-outline"
        variant="outlined"
        @click:append-inner="visible = !visible"
        @keyup.enter="login"
        v-model.trim="user.password"
      ></v-text-field>

      <v-card class="mb-12" color="surface-variant" variant="tonal">
        <v-card-text class="text-medium-emphasis text-caption">
          you can also click "Forgot login password?" to reset the login password.
        </v-card-text>
      </v-card>

      <v-btn
        class="mb-8 text-uppercase"
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
