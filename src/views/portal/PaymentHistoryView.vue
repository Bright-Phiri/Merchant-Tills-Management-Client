<script setup>
import { onMounted, ref } from 'vue'
import customerApi from '@/services/customerApi'
import PortalState from '@/components/portal/PortalState.vue'
import { billingError, money, dateLabel } from '@/utils/billing'
const payments = ref([])
const loading = ref(true)
const error = ref('')
const page = ref(1)
const totalPages = ref(0)
async function load(next = page.value) {
  loading.value = true
  error.value = ''
  try {
    const data = (await customerApi.get('billing/history', { params: { page: next } })).data.data
    payments.value = data.payments
    totalPages.value = data.total_pages
    page.value = next
  } catch (err) {
    error.value = billingError(err)
  } finally {
    loading.value = false
  }
}
onMounted(() => load())
</script>
<template>
  <div class="portal-page-head">
    <div>
      <p class="portal-eyebrow">YOUR PAYMENT RECORD</p>
      <h1 class="portal-heading">Every payment, accounted for.</h1>
      <p class="portal-lead">View confirmed subscription payments for your business.</p>
    </div>
    <RouterLink to="/portal" class="portal-text-link"
      >Check pending payments <v-icon icon="mdi-arrow-right" size="16"
    /></RouterLink>
  </div>
  <PortalState :loading="loading" :error="error" @retry="load()" />
  <section v-if="!loading && !error" class="portal-panel">
    <template v-if="payments.length"
      ><div class="portal-table-wrap">
        <table class="portal-table">
          <thead>
            <tr>
              <th>Payment date</th>
              <th>Reference</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in payments" :key="payment.id">
              <td style="white-space: nowrap">{{ dateLabel(payment.payment_date) }}</td>
              <td style="overflow-wrap: anywhere">
                {{ payment.transaction_id || `Payment #${payment.id}` }}
              </td>
              <td>
                {{
                  payment.payment_method === 'ONEKHUSA'
                    ? 'OneKhusa'
                    : payment.payment_method === 'PAYCHANGU'
                      ? 'PayChangu'
                      : payment.payment_method
                }}
              </td>
              <td style="white-space: nowrap">{{ money(payment.amount) }}</td>
              <td>
                <span class="portal-pill"
                  ><v-icon icon="mdi-check-circle-outline" size="13" /> Recorded</span
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="portal-section-heading" style="margin: 20px 0 0">
        <button class="portal-btn" :disabled="page <= 1" @click="load(page - 1)">Previous</button
        ><span>Page {{ page }} of {{ totalPages }}</span
        ><button class="portal-btn" :disabled="page >= totalPages" @click="load(page + 1)">
          Next
        </button>
      </div></template
    >
    <div v-else class="portal-empty" style="border: 0">
      <v-icon icon="mdi-receipt-text-outline" size="35" />
      <h2>A fresh start.</h2>
      <p>Your subscription payments will appear here once recorded.</p>
      <RouterLink to="/portal/plans" class="portal-btn portal-btn-primary"
        >Find your plan <v-icon icon="mdi-arrow-right" size="17"
      /></RouterLink>
    </div>
  </section>
</template>
