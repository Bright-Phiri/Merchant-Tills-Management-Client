<script setup>
import { ref } from 'vue'
import api from '@/services/api'
import { useRoute } from 'vue-router'
import { getColor } from '@/utils/utils'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
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

const fetchClientTerminals = async ({ page, itemsPerPage }) => {
  loading.value = true
  try {
    const response = await api.get(`taxpayers/${route.params.id}/show_terminals`, {
      params: { page, per_page: itemsPerPage },
    })
    terminals.value = response.data.data.terminals
    totalItems.value = response.data.data.total
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <div class="Terminals">
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl">
          <v-card-title class="d-flex justify-space-between">
            <span class="text-black font-weight-bold">{{ route.params.name }} Terminals</span>
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
              :search
              :loading
              :items-per-page="itemsPerPage"
              @update:options="fetchClientTerminals"
              loading-text="Loading client's terminals..."
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
                ></v-progress-linear></template
            ></v-data-table-server>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
