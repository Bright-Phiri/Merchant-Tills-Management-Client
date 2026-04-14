<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { showToast, getColor } from '@/utils/utils'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
const router = useRouter()
const fetchUsesLoading = ref(false)
const users = ref([])
const search = ref('')
const headers = [
  {
    align: 'start',
    key: 'first_name',
    sortable: false,
    title: 'First Name',
  },
  { key: 'last_name', title: 'Last Name' },
  { key: 'user_name', title: 'User Name' },
  { key: 'role', title: 'Role' },
  { key: 'email_address', title: 'Email Address' },
  { key: 'phone_number', title: 'Phone Number' },
  { key: 'status', title: 'Status' },
  { key: 'action', title: 'Action' },
]

const fetchSystemUsers = async () => {
  fetchUsesLoading.value = true
  try {
    const response = await api.get('users')
    users.value = response.data.data
  } catch (err) {
    handleError(err)
  } finally {
    fetchUsesLoading.value = false
  }
}

const activateUser = async (id) => {
  try {
    const response = await api.patch(`users/${id}/activate`)
    if (response.status === 200) {
      showToast('The user has been successfully activated', 'success')
      fetchSystemUsers()
    }
  } catch (err) {
    handleError(err)
  }
}

const disableUser = async (id) => {
  try {
    const response = await api.patch(`users/${id}/disable`)
    if (response.status === 200) {
      showToast('Use has been sucessfully disabled', 'success')
      fetchSystemUsers()
    }
  } catch (err) {
    handleError(err)
  }
}

const loadEditUserForm = (id) => {
  router.push({ name: 'edit-user', params: { id } })
}

onMounted(() => {
  fetchSystemUsers()
})
</script>
<template>
  <div class="Clients">
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl">
          <v-card-title>
            <span class="text-black font-weight-bold">Users</span>
            <div class="d-flex justify-space-between mt-2">
              <v-col cols="3" class="pa-0">
                <v-text-field
                  rounded="xl"
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  v-model="search"
                  label="Search User"
                  placeholder="Search user"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-btn
                color="#01A1FF"
                class="text-capitalize"
                rounded="xl"
                variant="outlined"
                to="/new-user"
                prepend-icon="mdi-account-plus"
                >New User</v-btn
              >
            </div>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :header-props="{ class: 'text-black font-weight-bold' }"
              density="compact"
              class="elevation-1 rounded-xl"
              :headers
              :items="users"
              :search
              :loading="fetchUsesLoading"
              loading-text="Loading users..."
              hover
            >
              <template v-slot:[`item.action`]="{ item }">
                <v-icon small class="mr-0" v-on:click="loadEditUserForm(item.id)" color="#01A1FF"
                  >mdi-pencil
                </v-icon>
                <v-tooltip bottom v-if="item.status === 'disabled'">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      small
                      class="mr-0"
                      color="#01A1FF"
                      v-on:click="activateUser(item.id)"
                      v-bind="attrs"
                      >mdi-account-off</v-icon
                    >
                  </template>
                  <span>Activate</span>
                </v-tooltip>
                <v-tooltip bottom v-if="item.status === 'active'">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      small
                      class="mr-0"
                      color="#ff6692"
                      v-on:click="disableUser(item.id)"
                      v-bind="attrs"
                      >mdi-account-lock</v-icon
                    >
                  </template>
                  <span>Disable</span>
                </v-tooltip>
              </template>
              <template v-slot:[`item.status`]="{ item }">
                <v-chip
                  class="d-flex justify-center"
                  size="small"
                  style="width: 80px"
                  variant="tonal"
                  :color="getColor(item.status)"
                >
                  <v-icon
                    :icon="item.status === 'active' ? 'mdi-check-circle' : 'mdi-alert-circle'"
                    start
                  />
                  {{ item.status === 'active' ? 'Active' : 'Inactive' }}
                </v-chip>
              </template>
              <template v-slot:loader>
                <v-progress-linear
                  height="3"
                  indeterminate
                  color="#01A1FF"
                ></v-progress-linear> </template
            ></v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
