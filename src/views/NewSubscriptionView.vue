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
  customer = ref(null),
  accessType = ref('fixed_term'),
  planId = ref(null)
const payment = reactive({
  payment_date: new Date().toISOString().slice(0, 10),
  amount: '',
  payment_method: '',
  transaction_id: '',
})
const selectedPlan = computed(() => plans.value.find((plan) => plan.id === planId.value))
const activeTermSubscription = computed(
  () =>
    customer.value?.subscription?.status === 'active' &&
    customer.value?.subscription?.access_type !== 'perpetual',
)
const displayedAmount = computed({
  get: () =>
    accessType.value === 'fixed_term' ? selectedPlan.value?.amount || '' : payment.amount,
  set: (value) => {
    if (accessType.value === 'perpetual') payment.amount = value
  },
})
const paymentMethods = ['CASH', 'TNM MPAMBA', 'AIRTEL MONEY', 'VISA']

async function loadPlans() {
  try {
    const [catalog, account] = await Promise.all([
      api.get('subscription_plans'),
      api.get(`taxpayers/${route.params.id}`),
    ])
    plans.value = catalog.data.data.filter((plan) => plan.active)
    customer.value = account.data.data
    if (
      customer.value.subscription?.status === 'active' &&
      customer.value.subscription?.access_type !== 'perpetual'
    )
      accessType.value = 'perpetual'
  } catch (error) {
    handleError(error)
  }
}
async function createSubscription() {
  if (accessType.value === 'fixed_term' && !planId.value)
    return showToast('Select a subscription plan.', 'warning')
  if (accessType.value === 'perpetual' && Number(payment.amount) <= 0)
    return showToast('Enter the negotiated once-off amount.', 'warning')
  if (!payment.payment_date || !payment.payment_method)
    return showToast('Complete the payment details.', 'warning')
  loading.value = true
  try {
    const response = await api.post(`taxpayers/${route.params.id}/subscriptions`, {
      subscription: {
        access_type: accessType.value,
        plan_id: accessType.value === 'fixed_term' ? planId.value : null,
      },
      payment: { ...payment, amount: displayedAmount.value },
    })
    showToast(response.data.message, 'success')
    await router.push('/subscriptions')
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
    <div class="management-page-intro">
      <div>
        <p class="management-eyebrow">SUBSCRIPTIONS</p>
        <h1 class="management-heading">Create customer access</h1>
        <p class="management-lead">Choose an access term and record the customer’s payment.</p>
      </div>
      <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="router.back()">Back</v-btn>
    </div>

    <v-card class="subscription-create-card" rounded="xl" elevation="0" border>
      <v-card-title class="subscription-card-title">Access and payment details</v-card-title>
      <v-card-text class="subscription-card-content">
        <div
          v-if="customer"
          class="customer-summary"
        >
          <div class="customer-identity">
            <span class="customer-icon"><v-icon icon="mdi-storefront-outline" size="21" /></span>
            <span>
              <strong>{{ customer.name }}</strong>
              <small>TIN {{ customer.tin }}</small>
            </span>
          </div>
          <v-chip variant="tonal" :color="customer.license_type === 'once_off' ? 'indigo' : 'teal'">
            {{ customer.license_type === 'once_off' ? 'Lifetime license' : 'Term license' }}
          </v-chip>
        </div>
        <v-alert v-if="activeTermSubscription" type="info" variant="tonal" class="mb-5">
          This customer already has an active term subscription. Renew it from its details, or
          grant a separate once-off lifetime purchase below.
        </v-alert>
        <v-btn-toggle v-model="accessType" mandatory color="#087E70" divided class="mb-6">
          <v-btn value="fixed_term" :disabled="activeTermSubscription" prepend-icon="mdi-calendar-range">Term subscription</v-btn>
          <v-btn value="perpetual" prepend-icon="mdi-infinity">Negotiated once-off</v-btn>
        </v-btn-toggle>
        <v-alert v-if="accessType === 'perpetual'" type="info" variant="tonal" class="mb-5">
          This grants lifetime access to every terminal under the customer’s TIN. Enter the amount
          agreed with this customer.
        </v-alert>
        <v-select
          v-if="accessType === 'fixed_term'"
          v-model="planId"
          :items="plans"
          item-title="name"
          item-value="id"
          label="Subscription plan"
          variant="outlined"
          :hint="
            selectedPlan
              ? `${selectedPlan.days} days · MK ${Number(selectedPlan.amount).toLocaleString('en-MW')}`
              : 'Managed under Plan configuration'
          "
          persistent-hint
          class="mb-4"
        />
        <div class="payment-section-heading">
          <span class="section-icon"><v-icon icon="mdi-credit-card-outline" size="19" /></span>
          <span><strong>Payment details</strong><small>Record how and when the customer paid.</small></span>
        </div>
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
              :readonly="accessType === 'fixed_term'"
              :hint="
                accessType === 'fixed_term'
                  ? 'Price comes from the selected plan'
                  : 'Customer-specific agreed price'
              "
              persistent-hint
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
      <v-card-actions class="subscription-card-actions"
        ><v-spacer /><v-btn variant="text" @click="router.back()">Cancel</v-btn
        ><v-btn color="#087E70" variant="flat" :loading="loading" @click="createSubscription">{{
          accessType === 'perpetual' ? 'Grant lifetime access' : 'Create subscription'
        }}</v-btn></v-card-actions
      >
    </v-card>
  </div>
</template>

<style scoped>
.subscription-create-card {
  width: 100%;
}

.subscription-card-title {
  min-height: 62px;
  padding: 20px 24px 14px;
  color: #172d35;
  font-size: 16px;
  font-weight: 700;
}

.subscription-card-content {
  padding: 0 24px 8px;
}

.customer-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 4px 0 24px;
  padding: 16px;
  border: 1px solid #dce8e2;
  border-radius: 12px;
  background: #f5f9f5;
}

.customer-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  color: #172d35;
}

.customer-icon,
.section-icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 10px;
  background: #dceee8;
  color: #087e70;
}

.customer-icon {
  width: 42px;
  height: 42px;
}

.customer-identity strong,
.customer-identity small,
.payment-section-heading strong,
.payment-section-heading small {
  display: block;
}

.customer-identity strong {
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.customer-identity small,
.payment-section-heading small {
  margin-top: 4px;
  color: #718184;
  font-size: 11px;
}

.payment-section-heading {
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 4px 0 14px;
  padding-top: 6px;
}

.section-icon {
  width: 36px;
  height: 36px;
}

.payment-section-heading strong {
  color: #263e43;
  font-size: 13px;
}

.subscription-card-actions {
  gap: 8px;
  padding: 12px 24px 22px;
}

@media (max-width: 600px) {
  .subscription-card-content {
    padding: 0 16px 6px;
  }

  .subscription-card-title {
    padding-inline: 16px;
  }

  .customer-summary {
    align-items: flex-start;
    flex-direction: column;
    margin-bottom: 20px;
  }

  .subscription-card-actions {
    flex-wrap: wrap;
    padding: 10px 16px 18px;
  }
}
</style>
