<script setup>
import { ref } from 'vue'
const fetchUsesLoading = ref(true)
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
</script>
<template>
  <div class="Clients">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>System Users</span>
            <v-col cols="3">
              <v-text-field
                prepend-inner-icon="mdi-magnify"
                clearable
                placeholder="Search user"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
          </v-card-title>
          <v-card-text>
            <v-data-table
              class="elevation-1"
              :headers="headers"
              :search="search"
              :loading="fetchUsesLoading"
              loading-text="Loading users..."
            ></v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
