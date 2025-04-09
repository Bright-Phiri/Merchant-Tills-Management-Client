<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import Swal from 'sweetalert2'

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

function getColor(status) {
  if (status === 'active') return 'success'
  else return 'red'
}

function loadAddUserPage() {
  router.push({ path: '/new-user', replace: true })
}

async function fetchSystemUsers() {
  fetchUsesLoading.value = true
  try {
    const response = await api.get('users')
    users.value = response.data.data
    fetchUsesLoading.value = false
  } catch (err) {
    fetchUsesLoading.value = false
    Swal.fire({
      icon: 'error',
      title: 'Unable to Reach Server',
      text: err + ", Couldn't reach API",
    })
  }
}

async function activateUser(id) {
  try {
    const response = await api.patch(`users/${id}/activate`)
    if (response.status === 200) {
      Swal.fire({
        icon: 'success',
        title: 'User Activated',
        text: 'The user has been successfully activated.',
      }).then(() => {
        fetchSystemUsers()
      })
    }
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Unable to Reach Server',
      text: err + ", Couldn't reach API",
    })
  }
}

async function disableUser(id) {
  try {
    const response = await api.patch(`users/${id}/disable`)
    if (response.status === 200) {
      Swal.fire({
        icon: 'success',
        title: 'User Disabled',
        text: 'The user has been successfully disabled.',
      }).then(() => {
        fetchSystemUsers()
      })
    }
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Unable to Reach Server',
      text: err + ", Couldn't reach API",
    })
  }
}

function loadEditUserForm(id) {
  router.push({ name: 'edit-user', params: { id }, replace: true })
}

onMounted(() => {
  fetchSystemUsers()
})
</script>
<template>
  <div class="Clients">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <span>Users</span>
            <div class="d-flex justify-space-between mt-2">
              <v-col cols="3" class="pa-0">
                <v-text-field
                  append-inner-icon="mdi-magnify"
                  clearable
                  v-model="search"
                  label="Search User"
                  placeholder="Search user"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-btn
                color="#365B73"
                class="text-capitalize"
                variant="outlined"
                v-on:click="loadAddUserPage"
                >New User</v-btn
              >
            </div>
          </v-card-title>
          <v-card-text>
            <v-data-table
              density="comfortable"
              class="elevation-1"
              :headers
              :items="users"
              :search
              :loading="fetchUsesLoading"
              loading-text="Loading users..."
              hover
            >
              <template v-slot:[`item.action`]="{ item }">
                <v-icon small class="mr-0" v-on:click="loadEditUserForm(item.id)" color="blue"
                  >mdi-pencil
                </v-icon>
                <v-tooltip bottom v-if="item.status === 'disabled'">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      small
                      class="mr-0"
                      color="green"
                      v-on:click="activateUser(item.id)"
                      v-bind="attrs"
                      v-on="on"
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
                      color="red"
                      v-on:click="disableUser(item.id)"
                      v-bind="attrs"
                      v-on="on"
                      >mdi-account-lock</v-icon
                    >
                  </template>
                  <span>Disable</span>
                </v-tooltip>
              </template>
              <template v-slot:[`item.status`]="{ item }">
                <v-chip
                  class="text-center"
                  small
                  style="width: 65px"
                  outlined
                  :color="getColor(item.status)"
                  dark
                >
                  {{ item.status === 'active' ? 'Active' : 'Inactive' }}
                </v-chip>
              </template>
              <template v-slot:loader>
                <v-progress-linear
                  height="3"
                  indeterminate
                  color="#365B73"
                ></v-progress-linear> </template
            ></v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
