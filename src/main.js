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
  defaults: {
    VBtn: { class: 'text-capitalize' },
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
  .component('apexchart', VueApexCharts)
  .mount('#app')
