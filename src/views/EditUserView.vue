<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, useTemplateRef, onMounted } from 'vue'
import api from '@/services/api'
import { showAlert } from '@/utils/utils'
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
const user_id = ref(0)
const router = useRouter()
const route = useRoute()
const roles = ref(['Officer', 'Admin'])
const userForm = useTemplateRef('userForm')
const loading = ref(false)

const fetchUserDetails = async (id) => {
  try {
    const response = await api.get(`users/${id}`)
    if (response.status == 200) {
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
    const response = await api.put(`users/${user_id.value}`, payload)

    if (response.status === 200) {
      loading.value = false

      showAlert('success', 'User Updated', response.data.message).then(() => {
        userForm.value.reset()
        router.push({ name: 'users' })
      })
    }
  } catch (error) {
    handleError(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const id = route.params.id
  user_id.value = id
  fetchUserDetails(id)
})
</script>

<template>
  <div class="EditUser">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-black font-weight-bold">Edit User</v-card-title>
          <v-card-text>
            <v-form ref="userForm">
              <v-container fluid>
                <v-row>
                  <v-col cols="12" sm="6" class="px-0">
                    <v-text-field
                      v-model="user.first_name"
                      label="First Name"
                      variant="outlined"
                      density="comfortable"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="user.last_name"
                      label="Last Name"
                      variant="outlined"
                      density="comfortable"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6" class="px-0">
                    <v-text-field
                      v-model="user.user_name"
                      label="Username"
                      variant="outlined"
                      density="comfortable"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="user.role"
                      label="Select Role"
                      :items="roles"
                      variant="outlined"
                      density="comfortable"
                    ></v-select>
                  </v-col>

                  <v-col cols="12" sm="6" class="px-0">
                    <v-text-field
                      v-model="user.email_address"
                      label="Email Address"
                      variant="outlined"
                      density="comfortable"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="user.phone_number"
                      label="Phone Number"
                      variant="outlined"
                      density="comfortable"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12">
                    <div class="d-flex">
                      <v-btn
                        color="#01A1FF"
                        rounded="xl"
                        variant="flat"
                        class="text-capitalize"
                        v-on:click="updateUser"
                        :loading
                        >Update</v-btn
                      >
                      <v-btn
                        color="#ff6692"
                        class="ml-2 text-capitalize"
                        rounded="xl"
                        variant="tonal"
                        to="/users"
                        >Cancel</v-btn
                      >
                    </div>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
