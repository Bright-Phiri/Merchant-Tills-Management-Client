<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const loading = ref(false)
const clients = ref([])
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
    const response = await axios.get('')
    clients.value = response.data
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
              :search
              :loading
              loading-text="Loading clients..."
            >
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
