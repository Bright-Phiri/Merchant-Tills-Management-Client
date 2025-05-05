<script setup>
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
const loading = ref(false)
const clients = ref([])
const search = ref('')
const itemsPerPage = ref(16)
const totalItems = ref(0)
const router = useRouter()
const headers = [
  {
    align: 'start',
    key: 'tin',
    sortable: false,
    title: 'Client TIN',
  },
  { key: 'name', title: 'Client Name' },
  { key: 'email_address', title: 'Email Address' },
  { key: 'phone_number', title: 'Phone Number' },
  { key: 'terminals_count', title: 'Terminals Count' },
  { key: 'action', title: 'Action' },
]

const fetchClients = async ({ page, itemsPerPage, search }) => {
  loading.value = true
  try {
    const response = await api.get('taxpayers', {
      params: { page, per_page: itemsPerPage, search },
    })
    clients.value = response.data.data.taxpayers
    totalItems.value = response.data.data.total
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = useDebounceFn(() => {
  fetchClients({ page: 1, itemsPerPage: itemsPerPage.value, search: search.value })
}, 400)

watch(search, () => {
  debouncedSearch()
})

const loadNewSubscriptionForm = (id) => {
  router.push({ name: 'new-subscription', params: { id }, replace: true })
}

const loadClientTerminalsView = (id, name) => {
  router.push({ name: 'client-terminals', params: { id, name }, replace: true })
}
</script>

<template>
  <div class="Clients">
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl">
          <v-card-title class="d-flex justify-space-between">
            <span class="text-black font-weight-bold">Clients</span>
            <v-col cols="3">
              <v-text-field
                rounded="xl"
                prepend-inner-icon="mdi-magnify"
                clearable
                v-model="search"
                label="Search Client"
                placeholder="Search client"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
          </v-card-title>
          <v-card-text>
            <v-data-table-server
              density="comfortable"
              :header-props="{ class: 'text-black font-weight-bold' }"
              class="elevation-1 rounded-xl"
              v-model:items-per-page="itemsPerPage"
              :headers
              :items="clients"
              :items-length="totalItems"
              :loading
              :items-per-page="itemsPerPage"
              @update:options="fetchClients"
              loading-text="Loading clients..."
              hover
            >
              <template v-slot:item.action="{ item }">
                <div class="d-flex">
                  <v-btn
                    variant="text"
                    prepend-icon="mdi-eye"
                    class="text-capitalize"
                    color="#01A1FF"
                    v-on:click="loadClientTerminalsView(item.id, item.name)"
                    >View Terminals</v-btn
                  >

                  <v-btn
                    variant="text"
                    prepend-icon="mdi-plus-circle-multiple-outline"
                    class="text-capitalize ml-2"
                    color="#01A1FF"
                    v-on:click="loadNewSubscriptionForm(item.id)"
                    >Create Subscription</v-btn
                  >
                </div>
              </template>
              <template v-slot:loader>
                <v-progress-linear height="3" indeterminate color="#01A1FF"></v-progress-linear>
              </template>
            </v-data-table-server>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
