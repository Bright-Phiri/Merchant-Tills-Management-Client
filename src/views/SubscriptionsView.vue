<script setup>
import { ref } from 'vue'

const fetchSubscriptionsLoading = ref(true)
const subscription = ref([])
const headers = [
  {
    align: 'start',
    key: 'owner',
    sortable: false,
    title: 'Customer TIN',
  },
  { key: 'taxpayer', title: 'Client Name' },
  { key: 'start_date', title: 'Start Date' },
  { key: 'end_date', title: 'End Date' },
  { key: 'action', title: 'Action' },
]
</script>
<template>
  <div class="Clients">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <span>Subscriptions</span>
            <div class="d-flex justify-space-between mt-2">
              <v-col cols="3" class="pa-0">
                <v-text-field
                  append-inner-icon="mdi-magnify"
                  clearable
                  label="Search Subscription"
                  placeholder="Search subscription"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-btn color="#365B73" class="text-capitalize" variant="outlined"
                >New Subscription</v-btn
              >
            </div>
          </v-card-title>
          <v-card-text>
            <v-data-table
              density="comfortable"
              class="elevation-1"
              :headers
              :search
              :loading="fetchSubscriptionsLoading"
              loading-text="Loading subscriptions..."
              hover
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
