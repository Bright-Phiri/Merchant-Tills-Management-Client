<script setup>
import { onMounted, ref } from 'vue'
import customerApi from '@/services/customerApi'
import PortalState from '@/components/portal/PortalState.vue'
import { billingError, money, dateLabel } from '@/utils/billing'
const overview = ref(null)
const loading = ref(true)
const error = ref('')
const labels = {
  active: 'Active',
  expired: 'Expired',
  cancelled: 'Cancelled',
  unsubscribed: 'Not subscribed',
  blocked: 'Account blocked',
  scheduled: 'Scheduled',
}
const hasLifetimeAccess = () =>
  overview.value?.status === 'active' && overview.value?.remaining_days == null
async function load() {
  loading.value = true
  error.value = ''
  try {
    overview.value = (await customerApi.get('billing/overview')).data.data
  } catch (err) {
    error.value = billingError(err)
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>
<template>
  <div class="portal-page-head">
    <div>
      <p class="portal-eyebrow">YOUR BUSINESS AT A GLANCE</p>
      <h1 class="portal-heading">A clear view of what’s next.</h1>
      <p class="portal-lead">Your subscription, terminals, and payments. All in one place.</p>
    </div>
    <RouterLink to="/portal/plans" class="portal-btn portal-btn-primary"
      >Explore plans <v-icon icon="mdi-arrow-right" size="17"
    /></RouterLink>
  </div>
  <PortalState :loading="loading" :error="error" @retry="load" />
  <template v-if="!loading && !error && overview"
    ><div class="portal-status-banner" :class="{ 'is-warning': overview.status !== 'active' }">
      <span class="status-icon"
        ><v-icon
          :icon="
            overview.status === 'active' ? 'mdi-check-circle-outline' : 'mdi-information-outline'
          "
          size="24"
      /></span>
      <div>
        <strong>{{
          overview.status === 'active'
            ? 'You’re ready for business.'
            : overview.status === 'blocked'
              ? 'Your account needs attention.'
              : 'Let’s get your terminals ready.'
        }}</strong>
        <p>
          {{
            overview.status === 'active'
              ? hasLifetimeAccess()
                ? 'Your once-off licence provides ongoing access for all registered terminals.'
                : 'Your subscription is active. Renew early to keep things running smoothly.'
              : overview.status === 'blocked'
                ? 'Please contact your POS provider. A subscription payment will not remove this block.'
                : 'Choose a subscription plan to enable access for your registered terminals.'
          }}
        </p>
      </div>
    </div>
    <div class="portal-stat-grid">
      <div class="portal-stat">
        <small>Subscription status</small><strong>{{ labels[overview.status] }}</strong>
      </div>
      <div class="portal-stat">
        <small>{{ hasLifetimeAccess() ? 'Access type' : 'Access through' }}</small
        ><strong>{{
          hasLifetimeAccess() ? 'Lifetime access' : dateLabel(overview.subscription?.end_date)
        }}</strong>
      </div>
      <div class="portal-stat">
        <small>Current plan</small
        ><strong>{{
          overview.subscription?.plan?.name || (hasLifetimeAccess() ? 'Negotiated once-off' : '—')
        }}</strong>
      </div>
      <div class="portal-stat">
        <small>Registered terminals</small><strong>{{ overview.terminal_count }}</strong>
      </div>
    </div>
    <section v-if="overview.pending_orders.length" class="portal-panel">
      <div class="portal-section-heading">
        <h2 style="margin: 0">Pending payments</h2>
        <span>Check an existing payment before paying again</span>
      </div>
      <div
        v-for="order in overview.pending_orders"
        :key="order.reference"
        class="portal-pending-row"
      >
        <div>
          <strong>{{ money(order.amount, order.currency) }} · {{ order.days }} days</strong
          ><small>Awaiting payment confirmation</small>
        </div>
        <RouterLink
          :to="{ path: '/portal/payment', query: { tx_ref: order.reference } }"
          class="portal-text-link"
          >View payment <v-icon icon="mdi-arrow-right" size="16"
        /></RouterLink>
      </div>
    </section>
    <section class="portal-panel">
      <div class="portal-section-heading">
        <h2 style="margin: 0">Your terminals</h2>
        <span>Registered under TIN {{ overview.taxpayer.tin }}</span>
      </div>
      <div v-if="overview.terminals.length" class="portal-table-wrap">
        <table class="portal-table">
          <thead>
            <tr>
              <th>Terminal</th>
              <th>Terminal ID</th>
              <th>Access status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="terminal in overview.terminals" :key="terminal.terminal_id">
              <td>{{ terminal.terminal_label }}</td>
              <td>{{ terminal.terminal_id }}</td>
              <td>
                <span class="portal-pill" :class="{ warning: terminal.blocked }"
                  ><v-icon
                    :icon="terminal.blocked ? 'mdi-lock-outline' : 'mdi-check-circle-outline'"
                    size="13"
                  />{{ terminal.blocked ? 'Blocked' : 'Active' }}</span
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="portal-caption">
        Your terminals will appear here after activation by your POS provider.
      </p>
      <p class="portal-caption" style="margin-top: 17px">
        {{ overview.terminal_count > 100 ? 'Showing the first 100 terminals. ' : '' }}After
        renewing, reconnect or restart your POS to refresh its subscription status.
      </p>
    </section></template
  >
</template>
