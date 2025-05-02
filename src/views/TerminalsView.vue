<script setup>
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import api from '@/services/api'
import { getColor } from '@/utils/utils'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
const loading = ref(true)
const terminals = ref([])
const search = ref('')
const itemsPerPage = ref(16)
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
  { key: 'posted_on', title: 'Posted On' },
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
    handleError(err)
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
        <v-card rounded="xl">
          <v-card-title class="d-flex justify-space-between">
            <span class="text-black font-weight-bold">Terminals</span>
            <v-col cols="3">
              <v-text-field
                rounded="xl"
                prepend-inner-icon="mdi-magnify"
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
              :header-props="{ class: 'text-black font-weight-bold' }"
              density="comfortable"
              class="elevation-1 rounded-xl"
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
                  color="#01A1FF"
                ></v-progress-linear> </template
            ></v-data-table-server>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
