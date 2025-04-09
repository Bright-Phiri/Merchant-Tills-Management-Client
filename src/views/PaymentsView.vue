<script setup>
import { ref } from 'vue'
import api from '@/services/api'
import { showAlert } from '@/utils/alert'

const loading = ref(false)
const payments = ref([])
const itemsPerPage = ref(20)
const totalItems = ref(0)
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

async function fetchPayments({ page, itemsPerPage }) {
  loading.value = true
  try {
    const response = await api.get('payments', {
      params: { page, per_page: itemsPerPage },
    })
    payments.value = response.data.data.payments
    totalItems.value = response.data.data.total
    loading.value = false
  } catch (err) {
    loading.value = false
    showAlert('error', 'Unable to Reach Server', err + ", Couldn't reach API")
  }
}
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
                label="Search Payment"
                placeholder="Search payment"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
          </v-card-title>
          <v-card-text>
            <v-data-table-server
              density="comfortable"
              class="elevation-1"
              :headers
              :items="payments"
              :items-length="totalItems"
              :search
              :loading
              :items-per-page="itemsPerPage"
              @update:options="fetchPayments"
              loading-text="Loading payments..."
              hover
            >
              <template v-slot:loader>
                <v-progress-linear
                  height="3"
                  indeterminate
                  color="#365B73"
                ></v-progress-linear> </template
            ></v-data-table-server>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
