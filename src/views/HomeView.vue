<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import cable from '@/lib/cable'
import DashboardCard from '@/components/DashboardCard.vue'
import RevenueCard from '@/components/RevenueCard.vue'

const value = [0, 2, 5, 9, 5, 10, 3, 5, 0, 0, 1, 8, 2, 9, 0]
const series = [
  {
    data: value,
  },
]

const series1 = [
  {
    data: [9, 5, 10, 3, 5, 7, 10, 5, 7, 9],
  },
]

const dashboardData = ref({})
const clients = ref(0)
const lastUpdated = ref('Waiting for live data...')

const revenueCards = [
  {
    label: 'Total Revenue',
    valueKey: 'total_payments',
    icon: 'mdi-cash',
    iconColor: '#ffA31F',
    avatarColor: '#FFF1CC',
    cardColor: '#EFF4FA',
  },
  {
    label: 'Total Revenue This Month',
    valueKey: 'monthly_revenue',
    icon: 'mdi-cash',
    iconColor: '#00cb36',
    avatarColor: '#D2F9F4',
    cardColor: '#EFF4FA',
  },
  {
    label: 'Total Revenue This Week',
    valueKey: 'weekly_revenue',
    icon: 'mdi-cash',
    iconColor: '#ff6692',
    avatarColor: '#FFE4EC',
    cardColor: '#EFF4FA',
  },
  {
    label: "Today's Revenue",
    valueKey: 'daily_revenue',
    icon: 'mdi-cash',
    iconColor: '#00A1FF',
    avatarColor: '#EFF5FF',
    cardColor: '#EFF4FA',
  },
]
const headers = [
  {
    align: 'start',
    key: 'owner',
    sortable: false,
    title: 'Client TIN',
  },
  { key: 'taxpayer', title: 'Client Name' },
  { key: 'payment_date', title: 'Payment Date' },
  { key: 'amount', title: 'Amount' },
  { key: 'payment_method', title: 'Payment Method' },
  { key: 'transaction_id', title: 'Transaction ID' },
]

const monthlySubscriptions = new Array(12).fill(0)
const monthlyPayments = new Array(12).fill(0)

const growthSeries = ref([
  {
    name: 'Subscriptions',
    data: monthlySubscriptions,
  },
  {
    name: 'Payments',
    data: monthlyPayments,
  },
])

const growthChartOptions = ref({
  chart: {
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: { enabled: true, delay: 150 },
      dynamicAnimation: { enabled: true, speed: 350 },
    },
    toolbar: { show: false },
  },
  stroke: { curve: 'smooth', width: 4 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.05, stops: [0, 100] },
  },
  colors: ['#01A1FF', '#8BCEFF'],
  dataLabels: { enabled: false },
  grid: {
    borderColor: '#e7eef8',
    strokeDashArray: 4,
  },
  xaxis: {
    categories: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
  },
  tooltip: { enabled: true },
})

const chartOptions = {
  chart: {
    sparkline: { enabled: true },
    toolbar: { show: false },
    animations: {
      enabled: false,
    },
  },
  stroke: {
    curve: 'smooth',
    width: 2,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.5,
      opacityTo: 0.05,
      stops: [0, 100],
    },
  },
  colors: ['#f72047'],
  tooltip: {
    enabled: false,
  },
}

const chartOptions1 = {
  chart: {
    sparkline: { enabled: true },
    toolbar: { show: false },
    animations: {
      enabled: false,
    },
  },
  stroke: {
    curve: 'smooth',
    width: 2,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.5,
      opacityTo: 0.05,
      stops: [0, 100],
    },
  },
  colors: ['#8565e9'],
  tooltip: {
    enabled: false,
  },
}

const markUpdated = () => {
  lastUpdated.value = new Date().toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  })
}

let subscription = null
onMounted(() => {
  subscription = cable.subscriptions.create(
    { channel: 'DashboardChannel' },
    {
      connected() {
        console.log('Connected to DashboardChannel')
      },
      disconnected() {
        console.log('Disconnected from DashboardChannel')
      },
      received(data) {
        console.log('Received:', data)
        dashboardData.value = data
        clients.value = data.total_clients
        markUpdated()

        const monthlySubscriptions = new Array(12).fill(0)
        const monthlyPayments = new Array(12).fill(0)

        data.subscription_trends.forEach((trend) => {
          const month = new Date(trend.created_at).getMonth()
          monthlySubscriptions[month] += trend.count
        })

        data.payment_trends.forEach((trend) => {
          const month = new Date(trend.created_at).getMonth()
          monthlyPayments[month] += trend.count
        })

        growthSeries.value[0].data = monthlySubscriptions
        growthSeries.value[1].data = monthlyPayments
      },
    },
  )
})

function formatCurrency(amount) {
  if (!amount) return 'MW 0.00'
  return `MW${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

onBeforeUnmount(() => {
  if (subscription) {
    subscription.unsubscribe()
  }
})
</script>

<template>
  <div class="home">
    <v-row class="mb-2" align="center" justify="space-between">
      <v-col cols="12" md="8">
        <div class="hero-copy">
          <p class="hero-eyebrow mb-1">Live Operations</p>
          <h2 class="hero-title">Dashboard Overview</h2>
          <p class="hero-subtitle mb-0">Track subscriptions, payments, and activity in real time.</p>
        </div>
      </v-col>
      <v-col cols="12" md="4" class="d-flex justify-md-end">
        <div class="live-status">
          <v-chip color="success" size="small" variant="tonal" class="mr-2">
            <v-icon start size="14" icon="mdi-access-point" />
            Live
          </v-chip>
          <span class="live-text">Updated {{ lastUpdated }}</span>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="9" md="8" sm="12">
        <v-card
          rounded="xl"
          class="trend-card"
          aria-live="polite"
          aria-label="Subscription and Payment Trends"
        >
          <v-card-title class="trend-title d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              Subscription and Payment Trends
              <v-tooltip location="right">
                <template v-slot:activator="{ props }">
                  <v-icon
                    v-bind="props"
                    size="small"
                    color="grey-darken-1"
                    icon="mdi-information-outline"
                    class="ml-2"
                  />
                </template>
                <span>Data updates in real-time via ActionCable</span>
              </v-tooltip>
            </div>
            <v-chip variant="outlined" size="small" color="primary">{{ clients || 0 }} Clients</v-chip>
          </v-card-title>

          <v-card-text class="pt-1">
            <apex-chart type="area" height="320" :options="growthChartOptions" :series="growthSeries" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="3" md="4" sm="12">
        <v-card rounded="xl" class="revenue-panel" aria-live="polite">
          <v-card-title class="text-subtitle-2 text-medium-emphasis pb-0">Revenue Snapshot</v-card-title>
          <v-card-text class="pt-2">
            <v-row no-gutters>
              <v-col v-for="(card, index) in revenueCards" :key="index" cols="12">
                <RevenueCard
                  :label="card.label"
                  :value="dashboardData[card.valueKey]"
                  :icon="card.icon"
                  :iconColor="card.iconColor"
                  :avatarColor="card.avatarColor"
                  :cardColor="card.cardColor"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="4">
        <DashboardCard
          to="/clients"
          title="All Clients"
          icon="mdi-account-multiple"
          iconColor="white"
          avatarColor="#ff6692"
          cardColor="#FFE4EC"
          :value="dashboardData.total_clients"
        >
          <template #chart>
            <apex-chart
              type="area"
              :options="chartOptions"
              :series="series"
              height="60"
              style="width: 200px"
            />
          </template>
        </DashboardCard>
      </v-col>

      <v-col cols="12" lg="4">
        <DashboardCard
          to="/subscriptions"
          title="All Subscriptions"
          icon="mdi-playlist-check"
          iconColor="white"
          avatarColor="#8565E9"
          cardColor="#E7E2F3"
          :value="dashboardData.total_subscriptions"
          :duration="700"
        >
          <template #extra>
            <v-chip class="status-chip" size="small" variant="outlined" color="#8565E9">
              {{ dashboardData.active_subscriptions || 0 }} Active
            </v-chip>
          </template>
          <template #chart>
            <ApexChart
              type="area"
              :options="chartOptions1"
              :series="series1"
              height="60"
              style="width: 200px"
            />
          </template>
        </DashboardCard>
      </v-col>

      <v-col cols="12" lg="4">
        <DashboardCard
          to="/terminals"
          title="All Terminals"
          icon="mdi-sitemap"
          icon-color="#ffffff"
          avatarColor="#00CEB6"
          cardColor="#D2F9F4"
          :value="dashboardData.total_terminals"
          :duration="800"
        >
          <template #extra>
            <v-chip class="status-chip" size="small" variant="outlined" color="#00a88f">
              {{ dashboardData.active_terminals || 0 }} Active
            </v-chip>
          </template>
          <template #chart>
            <v-progress-circular
              :model-value="dashboardData.active_terminals"
              size="90"
              width="6"
              color="#00CBE6"
              rotate="-90"
            />
          </template>
        </DashboardCard>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card rounded="xl" class="payments-card" to="/payments">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-subtitle-1">Recent Payments</span>
            <v-btn size="small" variant="text" color="primary" append-icon="mdi-arrow-right">View all</v-btn>
          </v-card-title>
          <v-card-text>
            <div v-if="!dashboardData || Object.keys(dashboardData).length === 0">
              <v-skeleton-loader type="table" />
            </div>
            <div v-else>
              <v-data-table
                hide-default-footer
                density="comfortable"
                class="elevation-0 rounded-xl payments-table"
                :headers="headers"
                :items="dashboardData.recent_payments"
                hover
              >
                <template v-slot:item.amount="{ item }">
                  {{ formatCurrency(item.amount) }}
                </template>
              </v-data-table>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.home {
  padding: 6px 2px 18px;
}

.hero-eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6f8199;
  font-weight: 700;
}

.hero-title {
  margin: 0;
  font-size: clamp(1.35rem, 2.1vw, 1.9rem);
  line-height: 1.2;
  color: #243b56;
}

.hero-subtitle {
  color: #74889f;
  font-size: 0.95rem;
}

.live-status {
  display: inline-flex;
  align-items: center;
  background: #f3f8ff;
  border: 1px solid #e2ebf8;
  border-radius: 999px;
  padding: 5px 10px;
}

.live-text {
  color: #5f748e;
  font-size: 0.77rem;
  font-weight: 500;
}

.trend-card,
.revenue-panel,
.payments-card {
  border: 1px solid #e7eef8;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  box-shadow: 0 14px 28px rgba(18, 56, 91, 0.06);
}

.trend-title {
  color: #2f4a68;
  font-weight: 600;
}

.revenue-panel {
  min-height: 400px;
}

.status-chip {
  border-width: 1px;
  font-weight: 600;
  margin-top: 10px;
}

.payments-table :deep(thead th) {
  color: #5e7490;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

@media (max-width: 960px) {
  .live-status {
    margin-top: 6px;
  }
}
</style>
