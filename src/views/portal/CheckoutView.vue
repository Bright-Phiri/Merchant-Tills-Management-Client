<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCustomerStore } from '@/stores/useCustomerStore'
import customerApi from '@/services/customerApi'
import PortalState from '@/components/portal/PortalState.vue'
import { billingError, money, dateLabel, renewalEnd } from '@/utils/billing'
const route = useRoute()
const router = useRouter()
const customer = useCustomerStore()
const plan = ref(null)
const overview = ref(null)
const loading = ref(true)
const error = ref('')
const paymentError = ref('')
const busy = ref(false)
const accepted = ref(false)
const consentError = ref('')
const consentInput = ref(null)
const storageKey = `checkout:${customer.taxpayer.tin}:${route.params.planId}`
const purchase = ref(null)
try {
  purchase.value = JSON.parse(sessionStorage.getItem(storageKey))
} catch {
  /* A damaged entry is replaced on explicit checkout. */
}
const projectedEnd = computed(() => renewalEnd(overview.value, plan.value?.days))
async function load() {
  loading.value = true
  error.value = ''
  try {
    const [catalog, account] = await Promise.all([
      customerApi.get('billing/plans'),
      customerApi.get('billing/overview'),
    ])
    overview.value = account.data.data
    plan.value = catalog.data.data.find((item) => String(item.id) === route.params.planId)
    if (!plan.value)
      error.value =
        'This plan is no longer available. Return to subscription plans to choose another.'
  } catch (err) {
    error.value = billingError(err)
  } finally {
    loading.value = false
  }
}
async function pay() {
  if (
    busy.value ||
    !plan.value ||
    overview.value?.status === 'blocked'
  )
    return
  if (!accepted.value) {
    consentError.value = 'Confirm the one-time payment terms before continuing.'
    await nextTick()
    consentInput.value?.focus()
    return
  }
  busy.value = true
  paymentError.value = ''
  try {
    if (!purchase.value?.key) purchase.value = { key: crypto.randomUUID() }
    sessionStorage.setItem(storageKey, JSON.stringify(purchase.value))
    // Never send a new payment when a known order has not been checked.
    if (purchase.value.reference) {
      await router.push({ path: '/portal/payment', query: { tx_ref: purchase.value.reference } })
      return
    }
    const response = await customerApi.post(
      'billing/checkouts',
      { plan_id: plan.value.id },
      { headers: { 'Idempotency-Key': purchase.value.key } },
    )
    const order = response.data.data
    purchase.value.reference = order.reference
    sessionStorage.setItem(storageKey, JSON.stringify(purchase.value))
    if (order.status === 'paid') {
      await router.push({ path: '/portal/payment', query: { tx_ref: order.reference } })
    } else if (
      Number(order.amount) !== Number(plan.value.amount) ||
      order.days !== plan.value.days ||
      order.currency !== plan.value.currency
    ) {
      paymentError.value =
        'This plan has changed since you opened the page. View payment status to review the saved amount and duration before paying.'
    } else if (order.provider === 'onekhusa' && order.payment_account) {
      await router.push({ path: '/portal/payment', query: { tx_ref: order.reference } })
    } else {
      paymentError.value =
        'Payment instructions are unavailable. Open payment status to safely check this order.'
    }
  } catch (err) {
    paymentError.value = billingError(err)
  } finally {
    busy.value = false
  }
}
watch(accepted, (value) => {
  if (value) consentError.value = ''
})
onMounted(load)
</script>
<template>
  <RouterLink to="/portal/plans" class="portal-back"
    ><v-icon icon="mdi-arrow-left" size="16" /> Back to plans</RouterLink
  >
  <div>
    <p class="portal-eyebrow">ONE STEP CLOSER</p>
    <h1 class="portal-heading">Make it official.</h1>
    <p class="portal-lead">Review your subscription, then continue to secure payment.</p>
  </div>
  <div class="portal-steps" aria-label="Checkout progress">
    <span
      ><b><v-icon icon="mdi-check" size="14" /></b> Choose a plan</span
    ><i></i><span class="current" aria-current="step"><b>2</b> Review & pay</span><i></i
    ><span><b>3</b> Confirmation</span>
  </div>
  <PortalState :loading="loading" :error="error" @retry="load" />
  <div v-if="!loading && !error && plan" class="portal-checkout-grid">
    <div>
      <section class="portal-panel">
        <h2><v-icon icon="mdi-storefront-outline" size="21" /> Your business</h2>
        <dl class="portal-definition">
          <div>
            <dt>Business name</dt>
            <dd>{{ overview.taxpayer.name }}</dd>
          </div>
          <div>
            <dt>Taxpayer ID</dt>
            <dd>{{ overview.taxpayer.tin }}</dd>
          </div>
          <div>
            <dt>Account email</dt>
            <dd>{{ overview.taxpayer.email_address }}</dd>
          </div>
          <div>
            <dt>Coverage</dt>
            <dd>All {{ overview.terminal_count }} registered terminals</dd>
          </div>
        </dl>
      </section>
      <section class="portal-panel">
        <h2><v-icon icon="mdi-shield-lock-outline" size="21" /> A secure way to pay</h2>
        <div class="portal-provider">
          <span class="portal-provider-icon"><v-icon icon="mdi-lock-outline" size="22" /></span>
          <div>
            <strong>OneKhusa</strong>
            <p>Pay with a temporary account number</p>
          </div>
          <v-icon icon="mdi-check-circle" size="21" />
        </div>
        <div class="portal-payment-methods">
          <span class="portal-method"><v-icon icon="mdi-cellphone" size="15" /> Mobile money</span
          ><span class="portal-method"><v-icon icon="mdi-bank-outline" size="15" /> Bank</span>
        </div>
        <p class="portal-caption">
          OneKhusa creates a temporary account valid for 15 minutes. Use it in your bank or mobile
          money app and send the exact amount shown.
        </p>
        <div class="portal-note">
          <v-icon icon="mdi-information-outline" size="18" /><span
            >After payment, we’ll verify your transaction and update your subscription. Return here
            to see your confirmation.</span
          >
        </div>
      </section>
      <p class="portal-caption">
        <v-icon icon="mdi-refresh" size="16" /> Changed your mind? You can go back and choose a
        different plan before paying.
      </p>
    </div>
    <aside class="portal-panel portal-summary">
      <h2>Your order summary</h2>
      <div class="portal-summary-plan">
        <span class="portal-plan-icon"><v-icon icon="mdi-layers-outline" size="22" /></span>
        <div>
          <strong>{{ plan.name }}</strong>
          <p>{{ plan.days }} days · All registered terminals</p>
        </div>
      </div>
      <dl class="portal-order-lines">
        <div>
          <dt>Subscription</dt>
          <dd>{{ money(plan.amount, plan.currency) }}</dd>
        </div>
        <div>
          <dt>Payment frequency</dt>
          <dd>One time</dd>
        </div>
        <div>
          <dt>Term plan access through</dt>
          <dd>{{ dateLabel(projectedEnd) }}</dd>
        </div>
      </dl>
      <div class="portal-order-total">
        <span>Subscription total</span><strong>{{ money(plan.amount, plan.currency) }}</strong>
      </div>
      <p class="portal-caption">
        Send the exact total to the temporary account. Dates assume payment is verified today.
      </p>
      <div
        v-if="overview.status === 'blocked'"
        class="portal-inline-error"
        style="margin-top: 15px"
      >
        Your account is administratively blocked. Contact your POS provider before paying; payment
        will not remove the block.
      </div>
      <div
        v-if="overview.status === 'active' && overview.remaining_days == null"
        class="portal-note"
        style="margin-top: 15px"
      >
        Your lifetime access remains active. This purchase adds a separate {{ plan.days }}-day term
        and does not remove your existing access.
      </div>
      <div v-if="paymentError" class="portal-inline-error" role="alert" style="margin-top: 15px">
        <p>{{ paymentError }}</p>
        <RouterLink to="/portal" class="portal-text-link"
          >Check pending payments <v-icon icon="mdi-arrow-right" size="15"
        /></RouterLink>
      </div>
      <label class="portal-consent"
        ><input
          ref="consentInput"
          v-model="accepted"
          type="checkbox"
          :aria-invalid="Boolean(consentError)"
          aria-describedby="checkout-consent-error"
        /><span
          >I understand this is a one-time payment for {{ plan.days }} days. My subscription will
          update after payment is verified.</span
        ></label
      >
      <p v-if="consentError" id="checkout-consent-error" class="portal-field-error" role="alert">
        {{ consentError }}
      </p>
      <button
        class="portal-btn portal-btn-primary portal-btn-wide"
        :disabled="
          busy || overview.status === 'blocked'
        "
        :aria-busy="busy"
        @click="pay"
      >
        {{
          busy
            ? 'Preparing your payment…'
            : purchase?.reference
              ? 'View payment status'
              : 'Continue to payment'
        }}<v-icon icon="mdi-arrow-right" size="17" />
      </button>
      <p class="portal-plan-foot">
        <v-icon icon="mdi-lock-outline" size="13" />
        {{
          purchase?.reference
            ? 'Check your existing order before paying again'
            : 'OneKhusa will create your temporary payment account'
        }}
      </p>
    </aside>
  </div>
</template>
