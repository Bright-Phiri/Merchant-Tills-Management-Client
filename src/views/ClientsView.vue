<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'

const loading = ref(false)
const clients = ref([])
const search = ref('')
const itemsPerPage = ref(20)
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

async function fetchClients({ page, itemsPerPage }) {
  loading.value = true
  try {
    const response = await axios.get('http://127.0.0.1:3000/api/v1/taxpayers', {
      params: { page, per_page: itemsPerPage },
    })
    clients.value = response.data.data.taxpayers
    totalItems.value = response.data.data.total
    loading.value = false
  } catch (err) {
    loading.value = false
    Swal.fire({
      icon: 'error',
      title: 'Unable to Reach Server',
      text: err + ", Couldn't reach API",
    })
  }
}

function loadNewSubscriptionForm(id) {
  router.push({ name: 'new-subscription', params: { id }, replace: true })
}

function loadClientTerminalsView(id, name) {
  router.push({ name: 'client-terminals', params: { id, name }, replace: true })
}
</script>

<template>
  <div class="Clients">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>Clients</span>
            <v-col cols="3">
              <v-text-field
                append-inner-icon="mdi-magnify"
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
              class="elevation-1"
              v-model:items-per-page="itemsPerPage"
              :headers
              :items="clients"
              :items-length="totalItems"
              :search
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
                    color="#365B73"
                    v-on:click="loadClientTerminalsView(item.id, item.name)"
                    >View Terminals</v-btn
                  >

                  <v-btn
                    variant="text"
                    prepend-icon="mdi-plus-circle-multiple-outline"
                    class="text-capitalize ml-2"
                    color="#365B73"
                    v-on:click="loadNewSubscriptionForm(item.id)"
                    >Create Subscription</v-btn
                  >
                </div>
              </template>
              <template v-slot:loader>
                <v-progress-linear height="3" indeterminate color="#365B73"></v-progress-linear>
              </template>
            </v-data-table-server>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
