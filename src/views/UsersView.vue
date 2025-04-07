<script>
import { ref } from 'vue'
export default {
  setup() {
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

    return {
      fetchUsesLoading,
      headers,
    }
  },
}
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
                  placeholder="Search user"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-btn color="#365B73" class="text-capitalize" variant="outlined">New User</v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            <v-data-table
              class="elevation-1"
              :headers
              :search
              :loading="fetchUsesLoading"
              loading-text="Loading users..."
            >
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
