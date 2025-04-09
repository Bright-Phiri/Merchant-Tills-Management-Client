<script setup>
import { onMounted, ref } from 'vue'
import api from '@/services/api'
import { showAlert } from '@/utils/alert'
import { useRoute } from 'vue-router'

const route = useRoute()
const subscription = ref(null)
const loading = ref(true)
const search = ref('')
const payments = ref([])

const headers = [
  { align: 'start', key: 'payment_date', sortable: false, title: 'Payment Date' },
  { key: 'amount', title: 'Amount (MK)' },
  { key: 'payment_method', title: 'Payment Method' },
  { key: 'transaction_id', title: 'Transaction ID' },
]

async function fetchSubscriptionDetails() {
  try {
    loading.value = true
    const response = await api.get(`subscriptions/${route.params.id}`)
    subscription.value = response.data.data
    payments.value = response.data.data.payments
    loading.value = false
  } catch (err) {
    loading.value = false
    showAlert('error', 'Unable to Reach Server', err + ", Couldn't reach API")
  }
}

onMounted(() => {
  fetchSubscriptionDetails()
})
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-card class="pa-4" elevation="2" v-if="!loading && subscription">
        <v-card-title class="text-h6 px-0 d-flex justify-space-between"
          >Subscription Details
          <v-btn color="#365B73" class="text-capitalize" variant="outlined" v-on:click=""
            >Renew Subscription</v-btn
          >
        </v-card-title>
        <v-divider class="my-2" />

        <v-row>
          <v-col cols="12" lg="3" sm="6" md="2">
            <strong>Client Name</strong>
            <div>{{ subscription.taxpayer }}</div>
          </v-col>

          <v-col cols="12" lg="3" sm="6" md="2">
            <strong>Start Date</strong>
            <div>{{ subscription.start_date }}</div>
          </v-col>

          <v-col cols="12" lg="3" sm="6" md="2">
            <strong>End Date</strong>
            <div>{{ subscription.end_date }}</div>
          </v-col>

          <v-col cols="12" lg="3" sm="6" md="2">
            <strong>Status</strong>
            <br />
            <v-chip
              class="mt-1"
              :color="subscription.status === 'active' ? 'success' : 'red'"
              small
              dark
            >
              {{ subscription.status }}
            </v-chip>
          </v-col>
        </v-row>
        <v-divider class="my-2" />
        <v-row>
          <v-col cols="12">
            <div class="d-flex column">
              <div class="d-flex justify-space-between w-100">
                <h2 class="font-weight-light">Payments</h2>
                <v-col cols="3">
                  <v-text-field
                    append-inner-icon="mdi-magnify"
                    clearable
                    label="Search Payment"
                    v-model="search"
                    placeholder="Search payment"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-col>
              </div>
            </div>
            <v-data-table
              density="comfortable"
              class="elevation-1"
              :headers
              :items="payments"
              :search
              :loading
              loading-text="Loading payments..."
              hover
            >
              <template v-slot:loader>
                <v-progress-linear
                  height="3"
                  indeterminate
                  color="#365B73"
                ></v-progress-linear> </template
            ></v-data-table>
          </v-col>
        </v-row>
      </v-card>

      <v-skeleton-loader type="card" v-if="loading" />
    </v-col>
  </v-row>
</template>
