<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import { showToast } from '@/utils/utils'
import { useErrorHandler } from '@/composables/useErrorHandler'

const route = useRoute(),
  router = useRouter(),
  { handleError } = useErrorHandler()
const loading = ref(false),
  plans = ref([]),
  planId = ref(null)
const payment = reactive({
  payment_date: new Date().toISOString().slice(0, 10),
  amount: '',
  payment_method: '',
  transaction_id: '',
})
const selectedPlan = computed(() => plans.value.find((plan) => plan.id === planId.value))
const displayedAmount = computed(() => selectedPlan.value?.amount || '')
const paymentMethods = ['CASH', 'TNM MPAMBA', 'AIRTEL MONEY', 'VISA']
async function loadPlans() {
  try {
    plans.value = (await api.get('subscription_plans')).data.data.filter((plan) => plan.active)
  } catch (error) {
    handleError(error)
  }
}
async function renew() {
  if (!planId.value)
    return showToast('Select a subscription plan.', 'warning')
  if (!payment.payment_date || !payment.payment_method)
    return showToast('Complete the payment details.', 'warning')
  loading.value = true
  try {
    const response = await api.post(`/subscriptions/${route.params.id}/renew`, {
      subscription: {
        access_type: 'fixed_term',
        plan_id: planId.value,
      },
      payment: { ...payment, amount: displayedAmount.value },
    })
    showToast(response.data.message, 'success')
    await router.push(`/subscriptions/${route.params.id}`)
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}
onMounted(loadPlans)
</script>

<template>
  <div class="management-page">
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-3" @click="router.back()"
      >Back</v-btn
    >
    <v-card class="renew-subscription-card" rounded="xl" elevation="0" border>
      <v-card-title class="pa-6 pb-2 text-h5 font-weight-bold"
        >Renew subscription</v-card-title
      >
      <v-card-subtitle class="px-6 pb-4"
        >Choose a term plan and record the payment for this renewal.</v-card-subtitle
      >
      <v-card-text class="px-6">
        <v-select
          v-model="planId"
          :items="plans"
          item-title="name"
          item-value="id"
          label="Subscription plan"
          variant="outlined"
          class="mb-3"
        />
        <v-row>
          <v-col cols="12" md="6"
            ><v-text-field
              v-model="payment.payment_date"
              label="Payment date"
              type="date"
              variant="outlined"
          /></v-col>
          <v-col cols="12" md="6"
            ><v-text-field
              v-model="displayedAmount"
              label="Amount (MWK)"
              type="number"
              variant="outlined"
              readonly
          /></v-col>
          <v-col cols="12" md="6"
            ><v-select
              v-model="payment.payment_method"
              :items="paymentMethods"
              label="Payment method"
              variant="outlined"
          /></v-col>
          <v-col cols="12" md="6"
            ><v-text-field
              v-model="payment.transaction_id"
              label="Transaction ID"
              variant="outlined"
              hint="Optional for cash"
              persistent-hint
          /></v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="px-6 pb-6"
        ><v-spacer /><v-btn variant="text" @click="router.back()">Cancel</v-btn
        ><v-btn color="#087E70" variant="flat" :loading="loading" @click="renew"
          >Save access</v-btn
        ></v-card-actions
      >
    </v-card>
  </div>
</template>

<style scoped>
.renew-subscription-card {
  width: 100%;
}
</style>
