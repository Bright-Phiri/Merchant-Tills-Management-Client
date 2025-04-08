<script setup>
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
const roles = ref(['Officer', 'Admin'])
const userForm = useTemplateRef('UserForm')

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
    await Swal.fire({
      icon: 'warning',
      title: 'Missing Fields',
      text: 'Please enter all required fields',
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
    const response = await axios.post('http://127.0.0.1:3000/api/v1/users', payload)

    if (response.status === 201) {
      await Swal.fire({
        icon: 'success',
        title: 'User Created',
        text: 'The user was successfully created!',
      })
      userForm.value.reset()
    }
  } catch (error) {
    if (!error.status) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error + ", Couldn't reach API",
      })
    }
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.response.data.message + ', ' + error.response.data.errors,
    })
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
                      <v-btn color="black" variant="flat" v-on:click="cancelAddUser">Cancel</v-btn>
                      <v-btn color="#365B73" variant="outlined" class="ml-2" v-on:click="addUser"
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
