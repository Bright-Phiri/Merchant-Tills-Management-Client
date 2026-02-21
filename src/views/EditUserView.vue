<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, useTemplateRef, onMounted } from 'vue'
import api from '@/services/api'
import { showToast } from '@/utils/utils'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
const user = ref({
  first_name: '',
  last_name: '',
  user_name: '',
  role: '',
  email_address: '',
  phone_number: '',
})

const userId = ref(0)
const router = useRouter()
const route = useRoute()
const roles = ref(['Officer', 'Admin'])
const userForm = useTemplateRef('userForm')
const loading = ref(false)

const fetchUserDetails = async (id) => {
  try {
    const response = await api.get(`users/${id}`)
    if (response.status === 200) {
      user.value = response.data.data
    }
  } catch (err) {
    handleError(err)
  }
}

const updateUser = async () => {
  const requiredFields = [
    'first_name',
    'last_name',
    'user_name',
    'role',
    'email_address',
    'phone_number',
  ]

  const missingField = requiredFields.find((field) => !user.value[field])

  if (missingField) {
    showToast('⚠️ Please enter all required fields.', 'warning')
    return
  }

  const payload = {
    first_name: user.value.first_name,
    last_name: user.value.last_name,
    user_name: user.value.user_name,
    role: user.value.role,
    email_address: user.value.email_address,
    phone_number: user.value.phone_number,
  }

  try {
    loading.value = true
    const response = await api.put(`users/${userId.value}`, payload)

    if (response.status === 200) {
      showToast(response.data.message, 'success')
      userForm.value.reset()
      router.push({ name: 'users' })
    }
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const id = route.params.id
  userId.value = id
  fetchUserDetails(id)
})
</script>

<template>
  <div class="form-view">
    <v-row>
      <v-col cols="12" lg="10">
        <v-card rounded="xl" class="form-card">
          <v-card-title class="form-header px-6 pt-6 pb-2">
            <div>
              <p class="form-eyebrow mb-1">Management</p>
              <h2 class="form-title">Edit User</h2>
              <p class="form-subtitle mb-0">Update user information and role assignment.</p>
            </div>
          </v-card-title>

          <v-card-text class="px-6 pb-6 pt-3">
            <v-form ref="userForm">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field v-model="user.first_name" label="First Name" variant="outlined" density="comfortable" rounded="lg"/>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field v-model="user.last_name" label="Last Name" variant="outlined" density="comfortable" rounded="lg"/>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field v-model="user.user_name" label="Username" variant="outlined" density="comfortable" rounded="lg"/>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-select v-model="user.role" label="Select Role" :items="roles" variant="outlined" density="comfortable" rounded="lg"/>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field v-model="user.email_address" label="Email Address" variant="outlined" density="comfortable" rounded="lg"/>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field v-model="user.phone_number" label="Phone Number" variant="outlined" density="comfortable" rounded="lg"/>
                </v-col>

                <v-col cols="12" class="d-flex flex-wrap action-wrap">
                  <v-btn color="#01A1FF" rounded="lg" variant="flat" class="text-none" @click="updateUser" :loading="loading">Update</v-btn>
                  <v-btn color="#ff6692" rounded="lg" variant="tonal" class="text-none" to="/users">Cancel</v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.form-view {
  padding: 6px 2px 18px;
}

.form-card {
  border: 1px solid #e7eef8;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  box-shadow: 0 14px 28px rgba(18, 56, 91, 0.06);
}

.form-eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6f8199;
  font-weight: 700;
}

.form-title {
  margin: 0;
  font-size: clamp(1.25rem, 1.8vw, 1.65rem);
  color: #263d59;
}

.form-subtitle {
  color: #74889f;
  font-size: 0.9rem;
}

.action-wrap {
  gap: 10px;
}
</style>
