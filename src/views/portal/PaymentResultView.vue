<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCustomerStore } from '@/stores/useCustomerStore'
import customerApi from '@/services/customerApi'
import { billingError, money, dateLabel } from '@/utils/billing'
const route = useRoute()
const customer = useCustomerStore()
const reference = typeof route.query.tx_ref === 'string' ? route.query.tx_ref : ''
const order = ref(null)
const overview = ref(null)
const busy = ref(false)
const error = ref('')
let timer,
  attempts = 0,
  disposed = false
const paid = computed(() => order.value?.status === 'paid')
const expired = computed(
  () => order.value?.payment_expires_at && new Date(order.value.payment_expires_at) <= new Date(),
)
async function copyAccount() {
  if (order.value?.payment_account) await navigator.clipboard.writeText(order.value.payment_account)
}
async function check() {
  if (busy.value || !reference) return
  clearTimeout(timer)
  error.value = ''
  busy.value = true
  try {
    // Read the saved order first so a provider outage still leaves a useful status page.
    order.value = (
      await customerApi.get(`billing/checkouts/${encodeURIComponent(reference)}`)
    ).data.data
    if (!paid.value)
      order.value = (
        await customerApi.post(`billing/checkouts/${encodeURIComponent(reference)}/verify`)
      ).data.data
    if (paid.value) {
      // Clear only the completed purchase. A later intentional renewal receives a new key.
      for (const key of Object.keys(sessionStorage)) {
        if (!key.startsWith(`checkout:${customer.taxpayer.tin}:`)) continue
        try {
          if (JSON.parse(sessionStorage.getItem(key))?.reference === reference)
            sessionStorage.removeItem(key)
        } catch {
          /* Ignore unrelated malformed state. */
        }
      }
      try {
        overview.value = (await customerApi.get('billing/overview')).data.data
      } catch {
        /* Payment remains confirmed even when the account refresh fails. */
      }
    } else if (expired.value) {
      // An expired TAN cannot be reused. Clear only its local retry key so a new order can be made.
      for (const key of Object.keys(sessionStorage)) {
        if (!key.startsWith(`checkout:${customer.taxpayer.tin}:`)) continue
        try {
          if (JSON.parse(sessionStorage.getItem(key))?.reference === reference)
            sessionStorage.removeItem(key)
        } catch {
          /* Ignore unrelated malformed state. */
        }
      }
    } else if (++attempts < 4 && !disposed) timer = setTimeout(check, 6000)
  } catch (err) {
    error.value =
      err.response?.status === 404
        ? 'We could not find this payment in your account. Check the reference or open Overview.'
        : billingError(err)
  } finally {
    busy.value = false
  }
}
async function simulateSandboxPayment() {
  if (busy.value || !reference) return
  error.value = ''
  busy.value = true
  try {
    order.value = (
      await customerApi.post(`billing/checkouts/${encodeURIComponent(reference)}/simulate`)
    ).data.data
    if (paid.value) overview.value = (await customerApi.get('billing/overview')).data.data
  } catch (err) {
    error.value = billingError(err)
  } finally {
    busy.value = false
  }
}
onMounted(check)
onBeforeUnmount(() => {
  disposed = true
  clearTimeout(timer)
})
</script>
<template>
  <RouterLink to="/portal" class="portal-back"
    ><v-icon icon="mdi-arrow-left" size="16" /> Back to overview</RouterLink
  >
  <section class="portal-result" aria-live="polite">
    <div class="portal-result-icon">
      <v-icon
        :icon="
          paid ? 'mdi-check' : !reference || error ? 'mdi-information-outline' : 'mdi-clock-outline'
        "
        size="37"
      />
    </div>
    <p class="portal-eyebrow" style="justify-content: center">
      {{ paid ? 'PAYMENT CONFIRMED' : 'PAYMENT STATUS' }}
    </p>
    <h1>
      {{
        paid
          ? 'You’re all set.'
          : !reference
            ? 'Let’s find your payment.'
            : busy && !order
              ? 'Checking your payment…'
              : 'Waiting for confirmation.'
      }}
    </h1>
    <p>
      {{
        paid
          ? 'Your payment has been verified and your subscription has been updated.'
          : !reference
            ? 'No payment reference was provided. Open Overview to find your pending payment.'
            : expired
              ? 'This temporary account has expired. If you already paid, check the status. Otherwise return to plans and create a new payment.'
              : 'Use the temporary account below in your bank or mobile money app. Your subscription updates after OneKhusa confirms the payment.'
      }}
    </p>
    <div v-if="order?.payment_account && !paid" class="portal-payment-account">
      <span>TEMPORARY PAYMENT ACCOUNT</span>
      <strong>{{ order.payment_account }}</strong>
      <button type="button" @click="copyAccount">
        <v-icon icon="mdi-content-copy" size="16" /> Copy account
      </button>
      <small :class="{ 'is-expired': expired }">
        {{ expired ? 'Expired' : `Valid until ${dateLabel(order.payment_expires_at, true)}` }}
      </small>
    </div>
    <ol v-if="order?.payment_account && !paid && !expired" class="portal-payment-steps">
      <template v-if="order.payment_mode === 'sandbox'">
        <li>This is a test payment. Do not send real Airtel Money or bank funds.</li>
        <li>Use the sandbox simulation button below to confirm the payment.</li>
      </template>
      <template v-else>
        <li>Open a supported bank or mobile money app.</li>
        <li>Choose its merchant or account-payment option and enter the temporary account above.</li>
        <li>
          Send exactly <strong>{{ money(order.amount, order.currency) }}</strong
          >.
        </li>
        <li>Return here and check the payment status.</li>
      </template>
    </ol>
    <dl v-if="order" class="portal-order-lines">
      <div>
        <dt>Amount</dt>
        <dd>{{ money(order.amount, order.currency) }}</dd>
      </div>
      <div>
        <dt>Subscription period</dt>
        <dd>{{ order.days }} days</dd>
      </div>
      <div v-if="paid && overview">
        <dt>Access through</dt>
        <dd>{{ dateLabel(overview.subscription?.end_date) }}</dd>
      </div>
      <div>
        <dt>Payment reference</dt>
        <dd style="font-size: 10px">{{ order.reference }}</dd>
      </div>
    </dl>
    <div v-if="error" class="portal-inline-error" role="alert">{{ error }}</div>
    <div v-if="paid" class="portal-note" style="text-align: left">
      <v-icon icon="mdi-monitor-cellphone" size="20" /><span>{{
        overview?.status === 'blocked'
          ? 'Your administrative block is still in place. Contact your POS provider to resolve it.'
          : 'Reconnect or restart your POS to refresh its terminal access. Any administrative block still needs to be resolved with your provider.'
      }}</span>
    </div>
    <div class="portal-result-actions">
      <button
        v-if="order?.payment_mode === 'sandbox' && !paid && !expired"
        class="portal-btn portal-btn-primary"
        :disabled="busy"
        @click="simulateSandboxPayment"
      >
        {{ busy ? 'Simulating…' : 'Simulate sandbox payment' }}
        <v-icon icon="mdi-flask-outline" size="17" />
      </button>
      <RouterLink v-if="paid || !reference" to="/portal" class="portal-btn portal-btn-primary"
        >Go to overview <v-icon icon="mdi-arrow-right" size="17" /></RouterLink
      ><button v-else class="portal-btn portal-btn-primary" :disabled="busy" @click="check">
        {{ busy ? 'Checking…' : 'Check payment status'
        }}<v-icon icon="mdi-refresh" size="17" /></button
      ><RouterLink v-if="!paid && expired" to="/portal/plans" class="portal-btn"
        >Choose a plan</RouterLink
      ><RouterLink v-if="paid" to="/portal/payments" class="portal-btn">Payment history</RouterLink>
    </div>
    <p v-if="!paid && reference" class="portal-caption" style="margin-top: 20px">
      Keep this reference if you need help from your POS provider.
    </p>
  </section>
</template>
