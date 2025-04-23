<script setup>
import { ref, useTemplateRef } from 'vue'
import api from '@/services/api'
import { showAlert, showToast } from '@/utils/utils'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
const user = ref({
  first_name: '',
  last_name: '',
  user_name: '',
  role: '',
  email_address: '',
  phone_number: '',
  password: '',
  password_confirmation: '',
})
const roles = ref(['Officer', 'Admin'])
const userForm = useTemplateRef('userForm')
const loading = ref(false)

const addUser = async () => {
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
    const response = await api.post('users', payload)

    if (response.status === 201) {
      showAlert('success', 'User Created', response.data.message)
      userForm.value.reset()
    }
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}

const cancelAddUser = () => {
  userForm.value.reset()
}
</script>

<template>
  <div class="AddUser">
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl">
          <v-card-title class="text-black font-weight-bold">User Details</v-card-title>
          <v-card-text>
            <v-form ref="userForm">
              <v-container fluid>
                <v-row>
                  <v-col cols="12" sm="6" class="px-0">
                    <v-text-field
                      rounded="lg"
                      v-model="user.first_name"
                      label="First Name"
                      variant="outlined"
                      density="comfortable"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      rounded="lg"
                      v-model="user.last_name"
                      label="Last Name"
                      variant="outlined"
                      density="comfortable"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6" class="px-0">
                    <v-text-field
                      rounded="lg"
                      v-model="user.user_name"
                      label="Username"
                      variant="outlined"
                      density="comfortable"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-select
                      rounded="lg"
                      v-model="user.role"
                      label="Select Role"
                      :items="roles"
                      variant="outlined"
                      density="comfortable"
                    ></v-select>
                  </v-col>

                  <v-col cols="12" sm="6" class="px-0">
                    <v-text-field
                      rounded="lg"
                      v-model="user.email_address"
                      label="Email Address"
                      variant="outlined"
                      density="comfortable"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      rounded="lg"
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
                        v-on:click="addUser"
                        :loading
                        >Submit</v-btn
                      >
                      <v-btn
                        color="#ff6692"
                        class="ml-2"
                        rounded="xl"
                        variant="tonal"
                        v-on:click="cancelAddUser"
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
