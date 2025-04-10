<script setup>
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import api from '@/services/api'
import { showAlert, getColor } from '@/utils/utils'

const loading = ref(true)
const terminals = ref([])
const search = ref('')
const itemsPerPage = ref(20)
const totalItems = ref(0)
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

const fetchTerminals = async ({ page, itemsPerPage, search }) => {
  loading.value = true
  try {
    const response = await api.get('terminals', {
      params: { page, per_page: itemsPerPage, search },
    })
    terminals.value = response.data.data.terminals
    totalItems.value = response.data.data.total
  } catch (err) {
    showAlert('error', 'Unable to Reach Server', err + ", Couldn't reach API")
  } finally {
    loading.value = false
  }
}

const debouncedSearch = useDebounceFn(() => {
  fetchTerminals({ page: 1, itemsPerPage: itemsPerPage.value, search: search.value })
}, 400)

watch(search, () => {
  debouncedSearch()
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
            <v-data-table-server
              density="comfortable"
              class="elevation-1"
              :headers
              :items="terminals"
              :items-length="totalItems"
              :loading
              :items-per-page="itemsPerPage"
              @update:options="fetchTerminals"
              loading-text="Loading terminals..."
              hover
            >
              <template v-slot:[`item.status`]="{ item }">
                <v-chip
                  class="d-flex justify-center"
                  size="small"
                  style="width: 80px"
                  variant="tonal"
                  :color="getColor(item.status)"
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
