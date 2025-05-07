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
    title: 'Customer TIN',
  },
  { key: 'taxpayer', title: 'Customer Name' },
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
    data: monthlySubscriptions, // Dynamic array for subscriptions
  },
  {
    name: 'Payments',
    data: monthlyPayments, // Dynamic array for payments
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
  colors: ['#01A1FF', '#E3E9F1'],
  dataLabels: { enabled: false },
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
      enabled: false, // 🔥 disables all chart animations
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
      enabled: false, // 🔥 disables all chart animations
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
  <div class="Home">
    <v-row>
      <v-col cols="12" lg="9" md="8" sm="12" xs="12">
        <v-card rounded="xl" height="400">
          <v-card-title class="text-grey-darken-2 text-subtitle-1">
            Subscription and Payment Trends
          </v-card-title>

          <v-card-text class="px-4 pb-4">
            <apex-chart
              type="area"
              height="320"
              :options="growthChartOptions"
              :series="growthSeries"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="3" md="4" sm="12" xs="12">
        <v-card rounded="xl" height="400">
          <v-card-text>
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
            <v-chip
              class="d-flex justify-center mt-3"
              size="small"
              variant="outlined"
              color="#8565E9"
              style="width: 90px; border: 1px solid #526b7a"
            >
              <span style="color: #526b7a">{{ dashboardData.active_subscriptions }} Active</span>
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
            <v-chip
              class="d-flex justify-center mt-2"
              size="small"
              variant="outlined"
              color="#8565E9"
              style="width: 90px; border: 1px solid #526b7a"
            >
              <span style="color: #526b7a">{{ dashboardData.active_terminals }} Active</span>
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
        <v-card rounded="xl" to="/payments">
          <v-card-title class="text-subtitle-1">Recent Payments</v-card-title>
          <v-card-text>
            <v-data-table
              hide-default-footer
              density="comfortable"
              class="elevation-0 rounded-xl"
              :headers
              :items="dashboardData.recent_payments"
              hover
            >
              <template v-slot:item.amount="{ item }">
                {{ formatCurrency(item.amount) }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
