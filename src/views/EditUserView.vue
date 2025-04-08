<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, useTemplateRef, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

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
const user_id = ref(0)
const router = useRouter()
const route = useRoute()
const roles = ref(['Officer', 'Admin'])
const userForm = useTemplateRef('UserForm')
const loading = ref(false)

async function fetchUserDetails(id) {
  try {
    const response = await axios.get(`http://127.0.0.1:3000/api/v1/users/${id}`)
    if (response.status == 200) {
      user.value = response.data.data
    }
  } catch (err) {}
}

async function updateUser() {
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
    Swal.fire({
      icon: 'warning',
      title: 'Missing Fields',
      text: 'Please enter all required fields',
    })
    return
  }

  if (user.value.password !== user.value.password_confirmation) {
    Swal.fire({
      icon: 'warning',
      title: 'Password Mismatch',
      text: 'Password and confirmation do not match.',
    })
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
    const response = await axios.put(`http://127.0.0.1:3000/api/v1/users/${user_id.value}`, payload)

    if (response.status === 200) {
      loading.value = false
      await Swal.fire({
        icon: 'success',
        title: 'User Updated',
        text: 'The user was successfully updated!',
      }).then(() => {
        userForm.value.reset()
        router.push({ name: 'users' })
      })
    }
  } catch (error) {
    loading.value = false
    const message = error?.response?.data?.message || "Couldn't reach API"
    const errors = error?.response?.data?.errors || ''

    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: `${message}${errors ? `: ${errors}` : ''}`,
    })
  }
}

function cancelEditUser() {
  router.push({ name: 'users' })
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
          <v-card-title>Edit User</v-card-title>
          <v-card-text>
            <v-form ref="UserForm">
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
                      <v-btn color="black" variant="flat" v-on:click="cancelEditUser">Cancel</v-btn>
                      <v-btn
                        color="#365B73"
                        variant="outlined"
                        class="ml-2"
                        v-on:click="updateUser"
                        :loading
                        >Update</v-btn
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
