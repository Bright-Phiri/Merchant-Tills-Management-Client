<script setup>
import { ref, onMounted } from 'vue'
import ApexChart from 'vue3-apexcharts'
const value = [0, 2, 5, 9, 5, 10, 3, 5, 0, 0, 1, 8, 2, 9, 0]

const allClients = ref(0)
const allSubscriptions = ref(0)
const activeSubscriptions = ref(0)
const allTerminals = ref(0)
const activeTerminals = ref(0)

const totalRevenue = ref(0)
const monthlyRevenue = ref(0)
const todaysRevenue = ref(0)
const weekklyRevenue = ref(0)

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
    data: [0, 2, 5, 9, 5, 10, 3, 5, 0, 0, 1, 8],
  },
  {
    name: 'Subscriptions',
    data: [1, 3, 4, 6, 8, 9, 4, 6, 2, 1, 3, 7],
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

onMounted(() => {
  setTimeout(() => {
    growthSeries.value[0].data = [2, 4, 7, 12, 7, 13, 5, 6, 2, 1, 3, 10]
  }, 2000)
})
</script>

<template>
  <div class="Home">
    <v-row>
      <v-col cols="12" lg="9" md="8" sm="12" xs="12">
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

      <v-col cols="12" lg="3" md="4" sm="12" xs="12">
        <v-card rounded="xl" height="400">
          <v-card-text
            ><v-card rounded="xl" elevation="0" class="mt-1" color="#EFF4FA">
              <v-card-text class="d-flex">
                <v-avatar color="#FFF1CC" size="50" rounded="xl">
                  <v-icon icon="mdi-cash" size="28" color="#ffA31F"></v-icon>
                </v-avatar>
                <div class="d-flex flex-column justify-center">
                  <span class="ml-3 font-weight-medium text-h7 text-grey-darken-2"
                    >Total Revenue</span
                  >
                  <span class="ml-3 font-weight-medium text-h7 text-center text-grey-darken-2">{{
                    totalRevenue
                  }}</span>
                </div>
              </v-card-text>
            </v-card>

            <v-card rounded="xl" elevation="0" class="mt-2" color="#EFF4FA">
              <v-card-text class="d-flex">
                <v-avatar color="#D2F9F4" size="50" rounded="xl">
                  <v-icon icon="mdi-cash" size="28" color="#00cb36"></v-icon>
                </v-avatar>
                <div class="d-flex flex-column justify-center">
                  <span class="ml-3 font-weight-medium text-h7 text-grey-darken-2"
                    >Total Revenue This Month</span
                  >
                  <span class="ml-3 font-weight-medium text-h7 text-center text-grey-darken-2">{{
                    monthlyRevenue
                  }}</span>
                </div>
              </v-card-text>
            </v-card>

            <v-card rounded="xl" elevation="0" class="mt-2" color="#EFF4FA">
              <v-card-text class="d-flex">
                <v-avatar color="#FFE4EC" size="50" rounded="xl">
                  <v-icon icon="mdi-cash" size="28" color="#ff6692"></v-icon>
                </v-avatar>
                <div class="d-flex flex-column justify-center">
                  <span class="ml-3 font-weight-medium text-h7 text-grey-darken-2"
                    >Total Revenue This Week</span
                  >
                  <span class="ml-3 font-weight-medium text-h7 text-center text-grey-darken-2">{{
                    weekklyRevenue
                  }}</span>
                </div>
              </v-card-text>
            </v-card>

            <v-card rounded="xl" elevation="0" class="mt-2" color="#EFF4FA">
              <v-card-text class="d-flex">
                <v-avatar color="#EFF5FF" size="50" rounded="xl">
                  <v-icon icon="mdi-cash" size="28" color="#00A1FF"></v-icon>
                </v-avatar>
                <div class="d-flex flex-column justify-center">
                  <span class="ml-3 font-weight-medium text-h7 text-grey-darken-2"
                    >Today's Revenue</span
                  >
                  <span class="ml-3 font-weight-medium text-h7 text-center text-grey-darken-2">{{
                    todaysRevenue
                  }}</span>
                </div>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" lg="4" sm="12" xs="12">
        <v-card color="#FFE4EC" rounded="xl" height="200">
          <v-card-title class="d-flex justify-space-between py-6">
            <div class="d-flex align-center">
              <v-avatar color="#ff6692" size="50" rounded="xl" icon="mdi-account-multiple" />
              <span class="ml-3 font-weight-medium text-h6 text-grey-darken-2">All Clients</span>
            </div>
            <v-icon class="mt-2" icon="mdi-dots-vertical" />
          </v-card-title>

          <v-card-text class="d-flex justify-space-between align-end">
            <div>
              <span class="text-h6 text-md-h5 text-lg-h4">{{ allClients }}</span>
            </div>
            <div style="width: 200px; height: 60px">
              <apexchart type="area" :options="chartOptions" :series="series" height="60" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" lg="4" sm="12" xs="12">
        <v-card color="#E7E2F3" rounded="xl" height="200">
          <v-card-title class="d-flex justify-space-between py-6">
            <div class="d-flex align-center">
              <v-avatar color="#8565E9" size="50" rounded="xl" icon="mdi-playlist-check" />
              <span class="ml-3 font-weight-medium text-h6 text-grey-darken-2"
                >All Subscriptions</span
              >
            </div>
            <v-icon class="mt-2" icon="mdi-dots-vertical" />
          </v-card-title>

          <v-card-text class="d-flex justify-space-between align-end">
            <div>
              <span class="text-h6 text-md-h5 text-lg-h4">{{ allSubscriptions }}</span>
              <v-chip
                class="d-flex justify-center mt-3"
                size="small"
                style="width: 90px; border: 1px solid #526b7a; color: #8565e9"
                variant="outlined"
                color="#8565E9"
              >
                <span style="color: #526b7a"> {{ activeSubscriptions }} Active</span>
              </v-chip>
            </div>
            <div style="width: 200px; height: 60px">
              <apexchart type="area" :options="chartOptions1" :series="series1" height="60" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" lg="4" sm="12" xs="12">
        <v-card color="#D2F9F4" rounded="xl" height="200">
          <v-card-title class="d-flex justify-space-between align-center py-6">
            <div class="d-flex align-center">
              <v-avatar color="#00CEB6" size="50" rounded="xl">
                <v-icon color="white" icon="mdi-sitemap" />
              </v-avatar>

              <span class="ml-3 font-weight-medium text-h6 text-grey-darken-2">All Terminals</span>
            </div>
            <v-icon icon="mdi-dots-vertical" />
          </v-card-title>

          <v-card-text class="d-flex align-center justify-space-between px-4">
            <div>
              <span class="text-h4">{{ allTerminals }}</span>
              <v-chip
                class="d-flex justify-center"
                size="small"
                style="width: 90px; border: 1px solid #526b7a; color: #8565e9"
                variant="outlined"
                color="#8565E9"
              >
                <span style="color: #526b7a"> {{ activeTerminals }} Active</span>
              </v-chip>
            </div>
            <v-progress-circular :model-value="20" size="90" width="6" color="#00CBE6" rotate="-90">
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
