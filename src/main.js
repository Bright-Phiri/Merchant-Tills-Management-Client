import { createApp } from 'vue'
import router from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

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
    defaultTheme: 'gmailLight',
    themes: {
      gmailLight: {
        dark: false,
        colors: {
          primary: '#1A73E8',
          secondary: '#185ABC',
          background: '#F6F8FC',
          surface: '#FFFFFF',
          'surface-variant': '#F1F3F4',
          error: '#D93025',
          success: '#188038',
          warning: '#F9AB00',
          info: '#1A73E8',
        },
      },
    },
  },
  defaults: {
    VAppBar: {
      color: '#F6F8FC',
      elevation: 0,
    },
    VBtn: {
      class: 'text-none',
      rounded: 'pill',
      color: 'primary',
      style: 'letter-spacing:0;font-weight:600;',
    },
    VCard: {
      rounded: 'xl',
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
  .use(router)
  .use(VueSweetalert2)
  .use(vuetify)
  .use(pinia)
  .component('AnimatedCounter', AnimatedCounter)
  .component('ApexChart', VueApexCharts)
  .mount('#app')
