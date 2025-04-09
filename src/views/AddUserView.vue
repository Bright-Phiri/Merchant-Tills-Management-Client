<script setup>
import { ref, useTemplateRef, onMounted } from 'vue'
import api from '@/services/api'
import { showAlert } from '@/utils/alert'

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

async function addUser() {
  const requiredFields = [
    'first_name',
    'last_name',
    'user_name',
    'role',
    'email_address',
    'phone_number',
    'password',
    'password_confirmation',
  ]

  const missingField = requiredFields.find((field) => !user.value[field])

  if (missingField) {
    showAlert('warning', 'Missing Fields', 'Please enter all required fields')
    return
  }

  if (user.value.password !== user.value.password_confirmation) {
    showAlert('warning', 'Password Mismatch', 'Password and confirmation do not match.')
    return
  }

  const payload = {
    first_name: user.value.first_name,
    last_name: user.value.last_name,
    user_name: user.value.user_name,
    role: user.value.role,
    email_address: user.value.email_address,
    phone_number: user.value.phone_number,
    password: user.value.password,
    password_confirmation: user.value.password_confirmation,
  }

  try {
    loading.value = true
    const response = await api.post('users', payload)

    if (response.status === 201) {
      loading.value = false
      showAlert('success', 'User Created', response.data.message)
      userForm.value.reset()
    }
  } catch (error) {
    loading.value = false
    const message = error?.response?.data?.message || "Couldn't reach API"
    const errors = error?.response?.data?.errors || ''
    showAlert('error', 'Error', `${message}${errors ? `: ${errors}` : ''}`)
  }
}

function cancelAddUser() {
  userForm.value.reset()
}
</script>

<template>
  <div class="AddUser">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Add New User</v-card-title>
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

                  <v-col cols="12" sm="6" class="px-0">
                    <v-text-field
                      type="password"
                      v-model="user.password"
                      label="Password"
                      variant="outlined"
                      density="comfortable"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      type="password"
                      v-model="user.password_confirmation"
                      label="Password Confirmation"
                      variant="outlined"
                      density="comfortable"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <div class="d-flex justify-end">
                      <v-btn color="black" variant="flat" v-on:click="cancelAddUser">Cancel</v-btn>
                      <v-btn
                        color="#365B73"
                        variant="outlined"
                        class="ml-2"
                        v-on:click="addUser"
                        :loading
                        >Save</v-btn
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
