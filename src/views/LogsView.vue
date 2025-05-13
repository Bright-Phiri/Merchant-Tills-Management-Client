<script setup>
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import api from '@/services/api'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
const loading = ref(false)
const logs = ref([])
const search = ref('')
const itemsPerPage = ref(14)
const totalItems = ref(0)
const headers = [
  {
    align: 'start',
    key: 'user',
    sortable: false,
    title: 'User',
  },
  { key: 'action', title: 'Action' },
  { key: 'resource_type', title: 'Resource Type' },
  { key: 'description', title: 'Description' },
  { key: 'created_at', title: 'Performed At' },
]

const fetchLogs = async ({ page, itemsPerPage, search }) => {
  loading.value = true
  try {
    const response = await api.get('activity_logs', {
      params: { page, per_page: itemsPerPage, search },
    })
    logs.value = response.data.data.logs
    totalItems.value = response.data.data.total
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = useDebounceFn(() => {
  fetchLogs({ page: 1, itemsPerPage: itemsPerPage.value, search: search.value })
}, 400)

watch(search, () => {
  debouncedSearch()
})
</script>

<template>
  <div class="Logs">
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl">
          <v-card-title class="d-flex justify-space-between">
            <span class="text-black font-weight-bold">Activity Logs</span>
            <v-col cols="3">
              <v-text-field
                rounded="xl"
                prepend-inner-icon="mdi-magnify"
                clearable
                v-model="search"
                label="Search"
                placeholder="Search.."
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
          </v-card-title>
          <v-card-text>
            <v-data-table-server
              density="compact"
              :header-props="{ class: 'text-black font-weight-bold' }"
              :hide-default-body="logs.length === 0 && !loading"
              :hide-default-footer="logs.length === 0 && !loading"
              class="elevation-1 rounded-xl"
              v-model:items-per-page="itemsPerPage"
              :headers
              :items="logs"
              :items-length="totalItems"
              :loading
              :items-per-page="itemsPerPage"
              @update:options="fetchLogs"
              loading-text="Loading clients..."
              hover
            >
              <template v-slot:loader>
                <v-progress-linear height="3" indeterminate color="#01A1FF"></v-progress-linear>
              </template>
            </v-data-table-server>
            <v-empty-state
              v-if="!loading && logs.length === 0 && search"
              icon="mdi-magnify"
              title="We couldn't find a match."
              text="Try adjusting your filters or search terms to find what you're looking for."
              class="mt-4"
            />

            <v-empty-state
              v-else-if="!loading && logs.length === 0"
              icon="mdi-database-outline"
              title="No logs yet"
              text="Logs will show up here."
              class="mt-4"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
