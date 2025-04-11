<script setup>
import { ref } from 'vue'
import ApexChart from 'vue3-apexcharts'
const value = [0, 2, 5, 9, 5, 10, 3, 5, 0, 0, 1, 8, 2, 9, 0]

const headers = [
  {
    align: 'start',
    key: 'owner',
    sortable: false,
    title: 'Customer TIN',
  },
  { key: 'taxpayer', title: 'Customer Name' },
  { key: 'payment_date', title: 'Payment Date' },
  { key: 'amount', title: 'Amount (MK)' },
  { key: 'payment_method', title: 'Payment Method' },
  { key: 'transaction_id', title: 'Transaction ID' },
]

const series = [
  {
    name: 'Clients',
    data: value,
  },
]

const series1 = [
  {
    name: 'Clients',
    data: [9, 5, 10, 3, 5, 7, 10, 5, 7, 9],
  },
]

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

const growthSeries = ref([
  {
    name: 'Clients',
    data: [0, 2, 5, 9, 5, 10, 3, 5, 0, 0, 1, 8], // 12 months of data
  },
])

const growthChartOptions = ref({
  chart: {
    toolbar: { show: false },
    animations: {
      enabled: true,
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
      opacityFrom: 0.6,
      opacityTo: 0.05,
      stops: [0, 100],
    },
  },
  colors: ['#E3E9F1'],
  dataLabels: {
    enabled: false, // ✅ don't show values by default
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
    labels: {
      style: {
        colors: '#6B7280', // optional: makes labels soft gray
        fontSize: '12px',
      },
    },
    axisTicks: { show: false },
    axisBorder: { show: false },
  },
  yaxis: {
    labels: {
      style: {
        colors: '#6B7280',
        fontSize: '12px',
      },
    },
  },
  grid: {
    strokeDashArray: 4,
  },
  tooltip: {
    enabled: true,
  },
})
</script>

<template>
  <div class="Home">
    <v-row>
      <v-col cols="8">
        <v-card rounded="xl" height="400">
          <v-card-title class="text-grey-darken-2">
            Client Subscription Growth (Monthly)
          </v-card-title>

          <v-card-text class="px-4 pb-4">
            <apexchart
              type="area"
              height="320"
              :options="growthChartOptions"
              :series="growthSeries"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="4">
        <v-card rounded="xl" height="400" color="#00A1FF" variant="tonal"> </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-card color="#FFE4EC" rounded="xl" height="210">
          <v-card-title class="d-flex justify-space-between py-8">
            <div class="d-flex align-center">
              <v-avatar color="#ff6692" size="50" rounded="xl" icon="mdi-account-multiple" />
              <span class="ml-3 font-weight-medium text-h6 text-grey-darken-2">All Clients</span>
            </div>
            <v-icon class="mt-2" icon="mdi-dots-vertical" />
          </v-card-title>

          <v-card-text class="d-flex justify-space-between align-end">
            <div>
              <span class="text-h6 text-md-h5 text-lg-h4">4,000</span>
            </div>
            <div style="width: 200px; height: 60px">
              <apexchart type="area" :options="chartOptions" :series="series" height="60" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card color="#E7E2F3" rounded="xl" height="210">
          <v-card-title class="d-flex justify-space-between py-8">
            <div class="d-flex align-center">
              <v-avatar color="#8565E9" size="50" rounded="xl" icon="mdi-playlist-check" />
              <span class="ml-3 font-weight-medium text-h6 text-grey-darken-2"
                >Active Subscriptions</span
              >
            </div>
            <v-icon class="mt-2" icon="mdi-dots-vertical" />
          </v-card-title>

          <v-card-text class="d-flex justify-space-between align-end">
            <div>
              <span class="text-h6 text-md-h5 text-lg-h4">2,000</span>
            </div>
            <div style="width: 200px; height: 60px">
              <apexchart type="area" :options="chartOptions1" :series="series1" height="60" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card color="#D2F9F4" rounded="xl" height="210">
          <v-card-title class="d-flex justify-space-between align-center py-6">
            <div class="d-flex align-center">
              <v-avatar color="#00CEB6" size="50" rounded="xl">
                <v-icon color="white" icon="mdi-sitemap" />
              </v-avatar>

              <span class="ml-3 font-weight-medium text-h6 text-grey-darken-2"
                >Terminals Count</span
              >
            </div>
            <v-icon icon="mdi-dots-vertical" />
          </v-card-title>

          <v-card-text class="d-flex align-center justify-space-between px-4 py-2">
            <div>
              <span class="text-h6 text-md-h5 text-lg-h4">20</span>
            </div>
            <v-progress-circular
              :model-value="20"
              size="100"
              width="6"
              color="#00CBE6"
              rotate="-90"
            >
            </v-progress-circular>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl">
          <v-card-title>Recent Payments</v-card-title>
          <v-card-text>
            <v-data-table
              hide-default-footer
              density="comfortable"
              class="elevation-0 rounded-xl"
              :headers
              hover
            ></v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
