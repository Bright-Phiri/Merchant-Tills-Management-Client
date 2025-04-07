<script setup>
import { ref } from 'vue'
const loading = ref(true)
const headers = [
  {
    align: 'start',
    key: 'tin',
    sortable: false,
    title: 'TIN',
  },
  { key: 'name', title: 'Name' },
  { key: 'email_address', title: 'Email Address' },
  { key: 'phone_number', title: 'Phone Number' },
  { key: 'terminals_count', title: 'Terminals Count' },
  { key: 'action', title: 'Action' },
]
</script>
<template>
  <div class="Clients">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>All Clients</span>
            <v-col cols="3">
              <v-text-field
                prepend-inner-icon="mdi-magnify"
                clearable
                placeholder="Search client"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :search="search"
              :loading="loading"
              loading-text="Loading clients..."
            ></v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
