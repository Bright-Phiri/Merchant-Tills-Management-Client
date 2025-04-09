<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import Swal from 'sweetalert2'

const loading = ref(true)
const terminals = ref([])
const search = ref('')
const itemsPerPage = ref(20)
const totalItems = ref(0)
const route = useRoute()
const headers = [
  {
    align: 'start',
    key: 'terminal_id',
    sortable: false,
    title: 'Terminal ID',
  },
  { key: 'terminal_label', title: 'Terminal Label' },
  { key: 'activation_date', title: 'Activation Date' },
  { key: 'taxpayer', title: 'Owner' },
  { key: 'status', title: 'Status' },
]

function getColor(status) {
  if (status === 'active') return 'success'
  else return 'red'
}

async function fetchClientTerminals({ page, itemsPerPage }) {
  loading.value = true
  try {
    const response = await axios.get(
      `http://127.0.0.1:3000/api/v1/taxpayers/${route.params.id}/show_terminals`,
      {
        params: { page, per_page: itemsPerPage },
      },
    )
    terminals.value = response.data.data.terminals
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
</script>
<template>
  <div class="Terminals">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>{{ route.params.name }} Terminals</span>
            <v-col cols="3">
              <v-text-field
                append-inner-icon="mdi-magnify"
                clearable
                v-model="search"
                label="Search Terminal"
                placeholder="Search terminal"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
          </v-card-title>
          <v-card-text>
            <v-data-table-server
              density="comfortable"
              class="elevation-1"
              :headers
              :items="terminals"
              :items-length="totalItems"
              :search
              :loading
              :items-per-page="itemsPerPage"
              @update:options="fetchClientTerminals"
              loading-text="Loading client's terminals..."
              hover
            >
              <template v-slot:[`item.status`]="{ item }">
                <v-chip
                  class="text-center"
                  small
                  style="width: 65px"
                  outlined
                  :color="getColor(item.status)"
                  dark
                >
                  {{ item.status === 'active' ? 'Active' : 'Blocked' }}
                </v-chip>
              </template>
              <template v-slot:loader>
                <v-progress-linear
                  height="3"
                  indeterminate
                  color="#365B73"
                ></v-progress-linear> </template
            ></v-data-table-server>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
