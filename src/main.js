import { createApp } from 'vue'
import router from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import './assets/management.css'

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import VueApexCharts from 'vue3-apexcharts'
import AnimatedCounter from 'vue-animated-counter'

// Components
import App from './App.vue'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'tControlLight',
    themes: {
      tControlLight: {
        dark: false,
        colors: {
          primary: '#087E70',
          secondary: '#174F42',
          background: '#F7F8F5',
          surface: '#FFFFFF',
          'surface-variant': '#EEF3EF',
          error: '#A33A2B',
          success: '#247A58',
          warning: '#B97918',
          info: '#31716B',
        },
      },
    },
  },
  defaults: {
    VAppBar: {
      color: '#FFFFFF',
      elevation: 0,
    },
    VBtn: {
      class: 'text-none',
      rounded: 'pill',
      color: 'primary',
      style: 'letter-spacing:0;font-weight:600;',
    },
    VCard: {
      rounded: 'lg',
      elevation: 0,
    },
    VChip: {
      rounded: 'pill',
    },
    VDataTable: {
      density: 'comfortable',
    },
    VDataTableServer: {
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
      hideDetails: 'auto',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
      hideDetails: 'auto',
    },
    VProgressLinear: {
      color: 'primary',
      height: 3,
    },
  },
})

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App)
  .use(VueAxios, axios)
  .use(pinia)
  .use(router)
  .use(VueSweetalert2)
  .use(vuetify)
  .component('AnimatedCounter', AnimatedCounter)
  .component('ApexChart', VueApexCharts)
  .mount('#app')
