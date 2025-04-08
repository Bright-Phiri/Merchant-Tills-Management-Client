<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const loading = ref(false)
const clients = ref([])
const search = ref('')
const headers = [
  {
    align: 'start',
    key: 'tin',
    sortable: false,
    title: 'TIN',
  },
  { key: 'name', title: 'Name' },
  { key: 'email_address', title: 'Email Address' },
  { key: 'phone_number', title: 'Phone Number' },
  { key: 'terminals_count', title: 'Terminals Count' },
  { key: 'action', title: 'Action' },
]

async function fetchClients() {
  loading.value = true
  try {
    const response = await axios.get('http://127.0.0.1:3000/api/v1/taxpayers')
    clients.value = response.data.data.taxpayers
    loading.value = false
  } catch (err) {
    loading.value = false
    console.log(err)
  }
}

onMounted(() => {
  fetchClients()
})
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
            <v-data-table
              class="elevation-1"
              :headers
              :items="clients"
              :search
              :loading
              items-per-page="7"
              loading-text="Loading clients..."
            >
              <template v-slot:item.action="{ item }">
                <div class="d-flex">
                  <v-btn
                    variant="outlined"
                    prepend-icon="mdi-eye"
                    class="text-capitalize"
                    color="#365B73"
                    >View Terminals</v-btn
                  >
                </div>
              </template>
              <template v-slot:loader>
                <v-progress-linear height="3" indeterminate color="#365B73"></v-progress-linear>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
