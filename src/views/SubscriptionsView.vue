<script setup>
import { ref } from 'vue'
const fetchSubscriptionsLoading = ref(true)
const headers = [
  {
    align: 'start',
    key: 'owner',
    sortable: false,
    title: 'Owner',
  },
  { key: 'taxpayer', title: 'Client Name' },
  { key: 'start_date', title: 'Start Date' },
  { key: 'end_date', title: 'End Date' },
]
</script>
<template>
  <div class="Clients">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>Subscriptions</span>
            <v-col cols="3">
              <v-text-field
                prepend-inner-icon="mdi-magnify"
                clearable
                placeholder="Search subscription"
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
              :loading="fetchSubscriptionsLoading"
              loading-text="Loading subscriptions..."
            ></v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
