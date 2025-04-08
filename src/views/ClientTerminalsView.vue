<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const loading = ref(true)
const terminals = ref([])
const search = ref('')
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

async function fetchTerminals() {
  loading.value = true
  try {
    const response = await axios.get('http://127.0.0.1:3000/api/v1/terminals')
    terminals.value = response.data.data.terminals
    loading.value = false
  } catch (err) {
    loading.value = false
    console.log(err)
  }
}

onMounted(() => {
  //fetchTerminals()
})
</script>
<template>
  <div class="Terminals">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>Terminals</span>
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
            <v-data-table
              density="comfortable"
              class="elevation-1"
              :headers
              :items="terminals"
              :search
              :loading
              items-per-page="7"
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
            ></v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
