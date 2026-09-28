<script setup>
import { computed, onMounted, ref } from 'vue'
import customerApi from '@/services/customerApi'
import PortalState from '@/components/portal/PortalState.vue'
import { billingError, money, dateLabel } from '@/utils/billing'

const plans = ref([])
const overview = ref(null)
const loading = ref(true)
const error = ref('')
const bestValue = computed(() => {
  if (plans.value.length < 2) return null
  const sorted = [...plans.value].sort(
    (a, b) => Number(a.amount) / a.days - Number(b.amount) / b.days,
  )
  return Number(sorted[0].amount) / sorted[0].days <
    Number(sorted.at(-1).amount) / sorted.at(-1).days
    ? sorted[0].id
    : null
})
const active = computed(() => overview.value?.status === 'active')
const lifetimeAccess = computed(
  () => active.value && overview.value?.remaining_days == null,
)
async function load() {
  loading.value = true
  error.value = ''
  try {
    const [catalog, account] = await Promise.all([
      customerApi.get('billing/plans'),
      customerApi.get('billing/overview'),
    ])
    plans.value = [...catalog.data.data].sort((a, b) => a.days - b.days)
    overview.value = account.data.data
  } catch (err) {
    error.value = billingError(err)
  } finally {
    loading.value = false
  }
}
onMounted(load)
const faqs = [
  [
    'What happens when I renew early?',
    'Your new subscription period is added after your current end date. You keep all the days you have already paid for.',
  ],
  [
    'Does one subscription cover all my terminals?',
    'Yes. Your subscription belongs to your taxpayer account and covers the terminals registered under your TIN.',
  ],
  [
    'Will I be charged automatically?',
    'No. This is a one-time payment for the period you choose. You decide when to renew.',
  ],
  [
    'When can I use my POS after paying?',
    'Your subscription updates after payment verification. Reconnect or restart your POS so it can check its latest status. An administrative account block needs to be resolved with your POS provider.',
  ],
]
</script>
<template>
  <div class="portal-page-head">
    <div>
      <p class="portal-eyebrow"><v-icon icon="mdi-layers-outline" size="15" /> PLANS & PRICING</p>
      <h1 class="portal-heading">Keep your business moving.</h1>
      <p class="portal-lead">Choose the time you need. One subscription for all your terminals.</p>
    </div>
    <span class="portal-pill"
      ><v-icon icon="mdi-check-circle-outline" size="13" /> No automatic renewals</span
    >
  </div>
  <PortalState
    :loading="loading"
    :error="error"
    :empty="!plans.length ? 'Your plans are on their way' : ''"
    @retry="load"
  />
  <template v-if="!loading && !error && plans.length">
    <div class="portal-status-banner" :class="{ 'is-warning': overview.status === 'blocked' }">
      <span class="status-icon"
        ><v-icon
          :icon="active ? 'mdi-check-decagram-outline' : 'mdi-information-outline'"
          size="23"
      /></span>
      <div>
        <strong>{{
          active
            ? lifetimeAccess
              ? 'You have lifetime terminal access.'
              : 'You’re covered. Renew whenever you’re ready.'
            : overview.status === 'blocked'
              ? 'Your account needs attention'
              : 'Your next chapter starts with a plan.'
        }}</strong>
        <p>
          {{
            active
              ? lifetimeAccess
              ? 'Your existing lifetime access remains active. You may still purchase a term plan; it will not remove that access.'
                : `Your subscription is active until ${dateLabel(overview.subscription.end_date)}. Extra days are added to your current period.`
              : overview.status === 'blocked'
                ? 'Contact your POS provider to resolve the block. A payment will not remove it.'
                : 'Subscribe to enable your registered POS terminals. Your paid period starts after verification.'
          }}
        </p>
      </div>
      <div v-if="active && !lifetimeAccess" class="portal-status-detail">
        <strong>{{ overview.remaining_days }} days</strong
        ><span>remaining on your subscription</span>
      </div>
    </div>
    <div class="portal-section-heading">
      <h2>A little flexibility. A lot of possibility.</h2>
      <span>One-time payments · Prices in Malawi kwacha</span>
    </div>
    <div class="portal-plans">
      <article
        v-for="(plan, index) in plans"
        :key="plan.id"
        class="portal-plan"
        :class="{ featured: plan.id === bestValue }"
      >
        <span v-if="plan.id === bestValue" class="portal-plan-badge">BEST DAILY RATE</span
        ><span class="portal-plan-icon"
          ><v-icon
            :icon="
              ['mdi-sprout-outline', 'mdi-storefront-outline', 'mdi-white-balance-sunny'][index % 3]
            "
            size="23"
        /></span>
        <h3>{{ plan.name }}</h3>
        <p class="portal-plan-subtitle">
          {{ plan.description || `${plan.days} days of terminal access` }}
        </p>
        <p class="portal-price">{{ money(plan.amount, plan.currency) }}</p>
        <p class="portal-price-caption">
          One payment · {{ money(Number(plan.amount) / plan.days, plan.currency) }} per day
        </p>
        <hr class="portal-plan-rule" />
        <ul class="portal-feature-list">
          <li><v-icon icon="mdi-check" size="16" /> All terminals under your TIN</li>
          <li><v-icon icon="mdi-check" size="16" /> {{ plan.days }} days of subscription access</li>
          <li><v-icon icon="mdi-check" size="16" /> Renew early, keep remaining days</li>
          <li><v-icon icon="mdi-check" size="16" /> One-time payment, no auto-charge</li>
        </ul>
        <RouterLink
          :to="`/portal/checkout/${plan.id}`"
          class="portal-btn portal-btn-wide"
          :class="{ 'portal-btn-primary': plan.id === bestValue }"
          >Choose {{ plan.days }} days <v-icon icon="mdi-arrow-right" size="17"
        /></RouterLink>
        <p class="portal-plan-foot">Pay securely with OneKhusa</p>
      </article>
    </div>
    <div class="portal-trust-row">
      <span><v-icon icon="mdi-shield-check-outline" size="16" /> Verified OneKhusa payments</span
      ><span><v-icon icon="mdi-credit-card-outline" size="16" /> Payment options at checkout</span
      ><span><v-icon icon="mdi-refresh" size="16" /> Renew on your terms</span>
    </div>
    <section class="portal-included">
      <div>
        <p class="portal-eyebrow">EVERY PLAN. THE SAME PEACE OF MIND.</p>
        <h2>Your terminals. One simple subscription.</h2>
        <p>
          Spend less time managing access and more time running your business. Choose your period;
          we take care of the subscription.
        </p>
      </div>
      <div class="portal-included-features">
        <div><v-icon icon="mdi-monitor-cellphone" size="21" /> All registered terminals</div>
        <div><v-icon icon="mdi-shield-check-outline" size="21" /> Verified payments</div>
        <div><v-icon icon="mdi-calendar-check-outline" size="21" /> Clear renewal dates</div>
        <div><v-icon icon="mdi-receipt-text-outline" size="21" /> Payment history</div>
      </div>
    </section>
    <section>
      <div class="portal-section-heading"><h2>A few things you might be wondering</h2></div>
      <div class="portal-faq">
        <details v-for="[question, answer] in faqs" :key="question">
          <summary>{{ question }}<v-icon icon="mdi-plus" size="18" /></summary>
          <p>{{ answer }}</p>
        </details>
      </div>
    </section>
  </template>
</template>
