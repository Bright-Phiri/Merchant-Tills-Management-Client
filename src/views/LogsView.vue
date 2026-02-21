<script setup>
import { ref, watch, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import api from '@/services/api'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
const loading = ref(false)
const logs = ref([])
const search = ref('')
const itemsPerPage = ref(14)
const totalItems = ref(0)
const hasSearch = computed(() => search.value.trim().length > 0)

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
  <div class="logs-view">
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl" class="view-card">
          <v-card-title class="view-header px-6 pt-6 pb-2">
            <div>
              <p class="view-eyebrow mb-1">Audit</p>
              <h2 class="view-title">Activity Logs</h2>
              <p class="view-subtitle mb-0">Trace all user actions and resource changes.</p>
            </div>
            <v-text-field
              rounded="xl"
              prepend-inner-icon="mdi-magnify"
              clearable
              v-model="search"
              label="Search"
              placeholder="Search logs"
              variant="solo-filled"
              density="comfortable"
              hide-details
              bg-color="white"
              flat
              class="view-search"
            ></v-text-field>
          </v-card-title>

          <v-card-text class="px-6 pb-6 pt-3">
            <div class="table-shell">
              <div class="table-toolbar mb-3">
                <span class="toolbar-text">
                  {{ hasSearch ? `Results for "${search}"` : `${totalItems || 0} log entries` }}
                </span>
              </div>

              <v-data-table-server
                density="comfortable"
                :hide-default-body="logs.length === 0 && !loading"
                :hide-default-footer="logs.length === 0 && !loading"
                class="view-table elevation-0 rounded-xl"
                v-model:items-per-page="itemsPerPage"
                :headers="headers"
                :items="logs"
                :items-length="totalItems"
                :loading="loading"
                :items-per-page="itemsPerPage"
                @update:options="fetchLogs"
                loading-text="Loading logs..."
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
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.logs-view {
  padding: 6px 2px 18px;
}

.view-card {
  border: 1px solid #e7eef8;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  box-shadow: 0 14px 28px rgba(18, 56, 91, 0.06);
}

.view-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.view-eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6f8199;
  font-weight: 700;
}

.view-title {
  margin: 0;
  font-size: clamp(1.25rem, 1.8vw, 1.65rem);
  color: #263d59;
  line-height: 1.2;
}

.view-subtitle {
  color: #74889f;
  font-size: 0.9rem;
}

.view-search {
  width: 320px;
  max-width: 100%;
}

.table-shell {
  border: 1px solid #e6edf8;
  border-radius: 16px;
  padding: 12px;
  background: #fcfeff;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.toolbar-text {
  color: #5e7490;
  font-size: 0.84rem;
  font-weight: 600;
}

.view-table :deep(thead th) {
  color: #5e7490;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
