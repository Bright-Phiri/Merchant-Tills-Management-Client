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
  <div class="auth-page">
    <div class="auth-glow auth-glow--top"></div>
    <div class="auth-glow auth-glow--bottom"></div>

    <v-card class="auth-card" elevation="0" width="480" rounded="xl">
      <v-img class="mx-auto my-1" height="54" src="/images/LOGO.png" />
      <p class="text-center text-h6 font-weight-bold mt-3">Create Your T-Control Account</p>
      <p class="text-center text-body-2 text-medium-emphasis mb-6">Fill in your details to get started</p>

      <div class="text-subtitle-2 text-medium-emphasis mb-2">Account</div>
      <v-text-field density="comfortable" placeholder="User name" prepend-inner-icon="mdi-account-outline" variant="solo-filled" rounded="lg" flat bg-color="white" hide-details="auto" v-model="user.user_name"></v-text-field>

      <div class="text-subtitle-2 text-medium-emphasis mt-4 mb-2">Email Address</div>
      <v-text-field density="comfortable" placeholder="Email Address" prepend-inner-icon="mdi-email-outline" variant="solo-filled" rounded="lg" flat bg-color="white" hide-details="auto" v-model="user.email_address"></v-text-field>

      <div class="text-subtitle-2 text-medium-emphasis mt-4 mb-2">Password</div>
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

      <div class="text-subtitle-2 text-medium-emphasis mt-4 mb-2">Password Confirmation</div>
      <v-text-field
        :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visible ? 'text' : 'password'"
        density="comfortable"
        placeholder="Password confirmation"
        prepend-inner-icon="mdi-lock-outline"
        variant="solo-filled"
        rounded="lg"
        flat
        bg-color="white"
        hide-details="auto"
        @click:append-inner="visible = !visible"
        v-model="user.password_confirmation"
      ></v-text-field>

      <v-btn class="mt-6 mb-6 text-none font-weight-bold" color="#01A1FF" size="large" rounded="lg" block :loading="loading" @click="signUp">
        Create Account
      </v-btn>

      <v-card-text class="text-center pt-0">
        Already have an account?
        <router-link to="/sign-in" class="signin-link text-decoration-none ml-1">
          Sign in
          <v-icon icon="mdi-chevron-right" size="18"></v-icon>
        </router-link>
      </v-card-text>
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
  padding: 36px 32px 28px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 44px rgba(2, 61, 112, 0.12);
  z-index: 1;
}

.signin-link {
  color: #0078c2;
  font-weight: 600;
}

.signin-link:hover {
  color: #005f99;
}

@media (max-width: 600px) {
  .auth-page {
    padding: 20px 10px;
  }

  .auth-card {
    padding: 26px 18px 20px;
  }
}
</style>
