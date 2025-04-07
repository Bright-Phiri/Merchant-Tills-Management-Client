<script setup>
import { ref } from 'vue'
const fetchUsesLoading = ref(true)
const payments = ref([])
const headers = [
  {
    align: 'start',
    key: 'owner',
    sortable: false,
    title: 'Customer TIN',
  },
  { key: 'taxpayer', title: 'Customer Name' },
  { key: 'payment_date', title: 'Payment Date' },
  { key: 'amount', title: 'Amount (MK)' },
  { key: 'payment_method', title: 'Payment Method' },
  { key: 'transaction_id', title: 'Transaction ID' },
]
</script>
<template>
  <div class="Clients">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>Payments</span>
            <v-col cols="3">
              <v-text-field
                append-inner-icon="mdi-magnify"
                clearable
                placeholder="Search payment"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
          </v-card-title>
          <v-card-text>
            <v-data-table
              class="elevation-1"
              :headers
              :search
              :loading="fetchUsesLoading"
              loading-text="Loading payments..."
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
