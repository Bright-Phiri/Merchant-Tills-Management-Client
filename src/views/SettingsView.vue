<script setup>
import { ref, onMounted, useTemplateRef } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import api from '@/services/api'
import { showToast, decryptPassword } from '@/utils/utils'
import { useErrorHandler } from '@/composables/useErrorHandler'

const authStore = useAuthStore()
const passwordForm = useTemplateRef('passwordForm')
const { handleError } = useErrorHandler()
const tab = ref('Profile Information')
const user = ref({
  first_name: '',
  last_name: '',
  user_name: '',
  email_address: '',
  phone_number: '',
  old_password: '',
  password: '',
  password_confirmation: '',
})
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

const updatePassword = async () => {
  const requiredFields = ['old_password', 'password', 'password_confirmation']

  const missingField = requiredFields.find((field) => !user.value[field])
  if (missingField) {
    showToast('⚠️ Please enter all required fields.', 'warning')
    return
  }
  const password = await decryptPassword(authStore.getSecret)

  if (password !== user.value.old_password) {
    showToast('❌ Old password is incorrect.', 'error')
    return
  }

  if (user.value.password !== user.value.password_confirmation) {
    showToast('❌ Oops! Your passwords don’t match.', 'error')
    return
  }

  const payload = {
    email_address: authStore.getEmail,
    password: user.value.password,
    password_confirmation: user.value.password_confirmation,
  }
  try {
    loading.value = true
    const response = await api.post('passwords/reset_password', payload)

    if (response.status == 200) {
      showToast(response.data.message, 'success')
      passwordForm.value.reset()
    }
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}

const updateUserDetails = async () => {
  const requiredFields = ['first_name', 'last_name', 'user_name', 'email_address', 'phone_number']

  const missingField = requiredFields.find((field) => !user.value[field])

  if (missingField) {
    showToast('⚠️ Please enter all required fields.', 'warning')
    return
  }

  const payload = {
    first_name: user.value.first_name,
    last_name: user.value.last_name,
    user_name: user.value.user_name,
    email_address: user.value.email_address,
    phone_number: user.value.phone_number,
  }

  try {
    loading.value = true
    const response = await api.put(`users/${authStore.getUserId}`, payload)

    if (response.status === 200) {
      const user_name = response.data.data.user_name
      authStore.setUserName(user_name)

      showToast(response.data.message, 'success')
      fetchUserDetails(authStore.getUserId)
    }
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUserDetails(authStore.getUserId)
})
</script>

<template>
  <div class="Settings">
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl">
          <v-card-title class="text-black font-weight-bold">Settings</v-card-title>
          <v-card-text>
            <div class="d-flex flex-row">
              <v-tabs v-model="tab" color="primary" direction="vertical">
                <v-tab
                  prepend-icon="mdi-account"
                  text="Profile Information"
                  value="Profile Information"
                ></v-tab>
                <v-tab
                  prepend-icon="mdi-lock"
                  text="Password & Security"
                  value="Password & Security"
                ></v-tab>
              </v-tabs>

              <v-tabs-window v-model="tab">
                <v-tabs-window-item value="Profile Information">
                  <v-card>
                    <v-card-title class="text-black">Edit Profile</v-card-title>
                    <v-card-text class="mt-2">
                      <v-form ref="userForm">
                        <v-row no-gutters>
                          <v-col cols="12" class="px-0">
                            <v-text-field
                              v-model="user.first_name"
                              label="First Name"
                              variant="outlined"
                              density="comfortable"
                            ></v-text-field>
                          </v-col>

                          <v-col cols="12">
                            <v-text-field
                              v-model="user.last_name"
                              label="Last Name"
                              variant="outlined"
                              density="comfortable"
                            ></v-text-field>
                          </v-col>

                          <v-col cols="12" class="px-0">
                            <v-text-field
                              v-model="user.user_name"
                              label="Username"
                              variant="outlined"
                              density="comfortable"
                            ></v-text-field>
                          </v-col>

                          <v-col cols="12" class="px-0">
                            <v-text-field
                              v-model="user.email_address"
                              label="Email Address"
                              variant="outlined"
                              density="comfortable"
                            ></v-text-field>
                          </v-col>

                          <v-col cols="12">
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
                                v-on:click="fetchUserDetails(authStore.getUserId)"
                                color="#ff6692"
                                class="text-capitalize"
                                rounded="xl"
                                variant="tonal"
                                >Cancel</v-btn
                              >
                              <v-btn
                                color="#01A1FF"
                                rounded="xl"
                                variant="flat"
                                class="ml-2 text-capitalize"
                                v-on:click="updateUserDetails"
                                :loading
                                >Update</v-btn
                              >
                            </div>
                          </v-col>
                        </v-row>
                      </v-form>
                    </v-card-text>
                  </v-card>
                </v-tabs-window-item>

                <v-tabs-window-item value="Password & Security">
                  <v-card>
                    <v-card-title class="text-black">Change Password</v-card-title>
                    <v-card-text class="mt-2">
                      <v-form ref="passwordForm">
                        <v-row>
                          <v-col cols="12" md="8">
                            <v-row no-gutters>
                              <v-col cols="12">
                                <v-text-field
                                  label="Old Password"
                                  v-model="user.old_password"
                                  variant="outlined"
                                  density="comfortable"
                                  type="password"
                                ></v-text-field>
                              </v-col>

                              <v-col cols="12">
                                <v-text-field
                                  label="New Password"
                                  v-model="user.password"
                                  variant="outlined"
                                  density="comfortable"
                                  type="password"
                                ></v-text-field>
                              </v-col>

                              <v-col cols="12">
                                <v-text-field
                                  label="Password Confirmation"
                                  v-model="user.password_confirmation"
                                  variant="outlined"
                                  density="comfortable"
                                  type="password"
                                ></v-text-field>
                              </v-col>

                              <v-col cols="12">
                                <div class="d-flex">
                                  <v-btn
                                    color="#ff6692"
                                    class="text-capitalize"
                                    rounded="xl"
                                    variant="tonal"
                                    >Cancel</v-btn
                                  >
                                  <v-btn
                                    color="#01A1FF"
                                    rounded="xl"
                                    variant="flat"
                                    class="ml-2 text-capitalize"
                                    v-on:click="updatePassword"
                                    :loading
                                    >Update</v-btn
                                  >
                                </div>
                              </v-col>
                            </v-row>
                          </v-col>
                          <v-col cols="12" md="4">
                            <v-card color="bg-surface" variant="flat" class="pa-4">
                              <h3 class="text-subtitle-1 font-weight-medium mb-3">
                                Password Requirements
                              </h3>
                              <div class="d-flex flex-column gap-2">
                                <div class="d-flex align-center text-caption">
                                  <v-icon
                                    icon="mdi-check"
                                    size="small"
                                    color="success"
                                    class="mr-2"
                                  />
                                  Minimum 8 characters
                                </div>
                                <div class="d-flex align-center text-caption">
                                  <v-icon
                                    icon="mdi-check"
                                    size="small"
                                    color="success"
                                    class="mr-2"
                                  />
                                  At least one uppercase letter
                                </div>
                                <div class="d-flex align-center text-caption">
                                  <v-icon
                                    icon="mdi-check"
                                    size="small"
                                    color="success"
                                    class="mr-2"
                                  />
                                  At least one number
                                </div>
                              </div>
                            </v-card>
                          </v-col>
                        </v-row>
                      </v-form>
                    </v-card-text>
                  </v-card>
                </v-tabs-window-item>
              </v-tabs-window>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
