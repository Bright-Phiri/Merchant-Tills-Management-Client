<script setup>
import { onMounted, ref } from 'vue'
import api from '@/services/api'
import { formatCurrency, getColor } from '@/utils/utils'
import { useRoute, useRouter } from 'vue-router'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
const route = useRoute()
const router = useRouter()
const subscriptionId = ref(0)
const subscription = ref(null)
const loading = ref(true)
const search = ref('')
const payments = ref([])

const headers = [
  { align: 'start', key: 'payment_date', sortable: false, title: 'Payment Date' },
  { key: 'amount', title: 'Amount' },
  { key: 'payment_method', title: 'Payment Method' },
  { key: 'transaction_id', title: 'Transaction ID' },
]

const fetchSubscriptionDetails = async () => {
  try {
    loading.value = true
    const response = await api.get(`subscriptions/${route.params.id}`)
    subscriptionId.value = route.params.id
    subscription.value = response.data.data
    payments.value = response.data.data.payments
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}

const loadRenewSubPage = () => {
  router.push({ name: 'renew-subscription', params: { id: subscriptionId.value } })
}

onMounted(() => {
  fetchSubscriptionDetails()
})
</script>

<template>
  <div class="subscription-details">
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl" class="detail-card pa-6" v-if="!loading && subscription">
          <v-card-title class="px-0 d-flex justify-space-between align-center">
            <div>
              <p class="detail-eyebrow mb-1">Billing</p>
              <h2 class="detail-title">Subscription Details</h2>
            </div>
            <v-btn color="#01A1FF" rounded="lg" variant="flat" @click="loadRenewSubPage" prepend-icon="mdi-refresh">
              Renew Subscription
            </v-btn>
          </v-card-title>

          <v-divider class="my-3" />

          <v-row>
            <v-col cols="12" md="3" sm="6">
              <p class="meta-label mb-1">Client Name</p>
              <p class="meta-value mb-0">{{ subscription.taxpayer }}</p>
            </v-col>

            <v-col cols="12" md="3" sm="6">
              <p class="meta-label mb-1">Start Date</p>
              <p class="meta-value mb-0">{{ subscription.start_date }}</p>
            </v-col>

            <v-col cols="12" md="3" sm="6">
              <p class="meta-label mb-1">End Date</p>
              <p class="meta-value mb-0">{{ subscription.end_date }}</p>
            </v-col>

            <v-col cols="12" md="3" sm="6">
              <p class="meta-label mb-1">Status</p>
              <v-chip size="small" variant="tonal" :color="getColor(subscription.status)">
                <v-icon :icon="subscription.status === 'active' ? 'mdi-check-circle' : 'mdi-close-circle'" start></v-icon>
                {{ subscription.status === 'expired' ? 'Expired' : 'Active' }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card>

        <v-card rounded="xl" class="detail-card mt-5" v-if="!loading && subscription">
          <v-card-title class="d-flex justify-space-between align-center px-6 pt-6 pb-2">
            <span class="text-subtitle-1 font-weight-bold">Payments</span>
            <v-text-field
              rounded="xl"
              prepend-inner-icon="mdi-magnify"
              clearable
              label="Search Payment"
              v-model="search"
              placeholder="Search payment"
              variant="solo-filled"
              density="comfortable"
              hide-details
              bg-color="white"
              flat
              class="view-search"
            ></v-text-field>
          </v-card-title>

          <v-card-text class="px-6 pb-6 pt-3">
            <div class="table-shell">
              <v-data-table
                density="comfortable"
                class="view-table elevation-0 rounded-xl"
                :headers="headers"
                :items="payments"
                :search="search"
                :loading="loading"
                loading-text="Loading payments..."
                hover
              >
                <template v-slot:item.amount="{ item }">
                  {{ formatCurrency(item.amount) }}
                </template>
                <template v-slot:loader>
                  <v-progress-linear height="3" indeterminate color="#01A1FF"></v-progress-linear>
                </template>
              </v-data-table>
            </div>
          </v-card-text>
        </v-card>

        <v-skeleton-loader type="card" v-if="loading" />
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.subscription-details {
  padding: 6px 2px 18px;
}

.detail-card {
  border: 1px solid #e7eef8;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  box-shadow: 0 14px 28px rgba(18, 56, 91, 0.06);
}

.detail-eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6f8199;
  font-weight: 700;
}

.detail-title {
  margin: 0;
  font-size: clamp(1.25rem, 1.8vw, 1.65rem);
  color: #263d59;
}

.meta-label {
  color: #6f8199;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}

.meta-value {
  color: #24384f;
  font-size: 0.95rem;
  font-weight: 600;
}

.view-search {
  width: 280px;
  max-width: 100%;
}

.table-shell {
  border: 1px solid #e6edf8;
  border-radius: 16px;
  padding: 12px;
  background: #fcfeff;
}

.view-table :deep(thead th) {
  color: #5e7490;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
