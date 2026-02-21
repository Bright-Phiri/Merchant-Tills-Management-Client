<script setup>
import { ref } from 'vue'
import { showToast, encryptPassword, showPersistentToast, closeToast } from '@/utils/utils'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useErrorHandler } from '@/composables/useErrorHandler'
import api from '@/services/api'

const { handleError } = useErrorHandler()
const visible = ref(false)
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const user = ref({
  user_name: '',
  password: '',
})

const login = async () => {
  if (!user.value.user_name || !user.value.password) {
    showToast('⚠️ Please enter all required fields.', 'warning')
    return
  }

  let toastRef = null
  try {
    loading.value = true
    toastRef = showPersistentToast('Signing in…', 'info')
    const response = await api.post('authentication/login', user.value)

    if (response.status === 200) {
      const secret = await encryptPassword(user.value.password)

      const user_name = response.data.data.user.user_name
      const email = response.data.data.user.email_address
      const user_Id = response.data.data.user.id
      const { token, permissions } = response.data.data

      authStore.setToken(token)
      authStore.setUserId(user_Id)
      authStore.setUserName(user_name)
      authStore.setEmail(email)
      authStore.setPermissions(permissions)
      authStore.setSecret(secret)

      await router.push({ path: '/dashboard' })
      // Close the persistent 'Signing in…' toast before showing the success toast
      if (toastRef) closeToast()
      showToast(`👋 Welcome back ${response.data.data.user.user_name}!!`, 'success')
    }
  } catch (err) {
    // Close persistent toast before showing error handling toasts
    if (toastRef) closeToast()
    handleError(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="sign-in-page">
    <div class="sign-in-glow sign-in-glow--top"></div>
    <div class="sign-in-glow sign-in-glow--bottom"></div>

    <v-card class="sign-in-card" elevation="0" max-width="480" rounded="xl">
      <v-img class="mx-auto my-1" height="54" src="/images/LOGO.png" />
      <p class="text-center text-h6 font-weight-bold mt-3">Welcome to T-Control</p>
      <p class="text-center text-body-2 text-medium-emphasis mb-6">Sign in to continue</p>

      <div class="text-subtitle-2 text-medium-emphasis mb-2">Account</div>
      <v-text-field
        density="comfortable"
        placeholder="User name"
        prepend-inner-icon="mdi-account-outline"
        variant="solo-filled"
        rounded="lg"
        flat
        bg-color="white"
        hide-details="auto"
        v-model.trim="user.user_name"
      ></v-text-field>

      <div class="text-subtitle-2 text-medium-emphasis d-flex align-center justify-space-between mt-4 mb-2">
        Password
        <router-link class="text-caption forgot-link" to="/forgot-password">
          Forgot password?
        </router-link>
      </div>

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
        @keyup.enter="login"
        v-model.trim="user.password"
      ></v-text-field>

      <v-card class="hint-card mt-4 mb-7" variant="tonal" rounded="lg">
        <v-card-text class="text-caption text-medium-emphasis">
          Use "Forgot password?" if you need to reset your login credentials.
        </v-card-text>
      </v-card>

      <v-btn
        class="mb-6 text-none font-weight-bold"
        color="#01A1FF"
        size="large"
        rounded="lg"
        block
        :loading
        v-on:click="login"
      >
        Log in
      </v-btn>

      <v-card-text class="text-center pt-0">
        Don't have an account?
        <router-link to="/sign-up" class="signup-link text-decoration-none ml-1">
          Sign up
          <v-icon icon="mdi-chevron-right" size="18"></v-icon>
        </router-link>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.sign-in-page {
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

.sign-in-glow {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 999px;
  filter: blur(50px);
  opacity: 0.55;
  pointer-events: none;
}

.sign-in-glow--top {
  top: -120px;
  right: -80px;
  background: #b8e7ff;
}

.sign-in-glow--bottom {
  bottom: -150px;
  left: -90px;
  background: #7dd8ff;
}

.sign-in-card {
  width: 100%;
  padding: 36px 32px 28px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 44px rgba(2, 61, 112, 0.12);
  z-index: 1;
}

.hint-card {
  background: rgba(1, 161, 255, 0.1);
}

.forgot-link,
.signup-link {
  color: #0078c2;
  font-weight: 600;
  transition: color 0.2s ease;
}

.forgot-link:hover,
.signup-link:hover {
  color: #005f99;
}

@media (max-width: 600px) {
  .sign-in-page {
    padding: 20px 10px;
  }

  .sign-in-card {
    padding: 26px 18px 20px;
  }
}
</style>
