<script setup>
import { ref, watch, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import api from '@/services/api'
import { showToast, getColor } from '@/utils/utils'
import { useRouter } from 'vue-router'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
const router = useRouter()
const loading = ref(false)
const subscriptions = ref([])
const search = ref('')
const itemsPerPage = ref(14)
const totalItems = ref(0)
const tableOptions = ref({ page: 1, itemsPerPage: itemsPerPage.value, search: '' })
const hasSearch = computed(() => search.value.trim().length > 0)

const headers = [
  {
    align: 'start',
    key: 'owner',
    sortable: false,
    title: 'Client TIN',
  },
  { key: 'taxpayer', title: 'Client Name' },
  { key: 'start_date', title: 'Start Date' },
  { key: 'end_date', title: 'End Date' },
  { key: 'duration', title: 'Duration' },
  { key: 'created_at', title: 'Created On' },
  { key: 'status', title: 'Status' },
  { key: 'action', title: 'Action' },
]

const fetchSubscriptions = async ({ page, itemsPerPage, search }) => {
  loading.value = true
  tableOptions.value = { page, itemsPerPage, search }
  try {
    const response = await api.get('subscriptions', {
      params: { page, per_page: itemsPerPage, search },
    })
    subscriptions.value = response.data.data.subscriptions
    totalItems.value = response.data.data.total
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}

const onOptionsUpdate = (options) => {
  fetchSubscriptions({
    page: options.page,
    itemsPerPage: options.itemsPerPage,
    search: search.value,
  })
}

const debouncedSearch = useDebounceFn(() => {
  fetchSubscriptions({ page: 1, itemsPerPage: itemsPerPage.value, search: search.value })
}, 400)

watch(search, () => {
  debouncedSearch()
})

const viewSubscription = (id) => {
  router.push({ name: 'subscription-details', params: { id } })
}

const deleteSubscription = async (id) => {
  try {
    const response = await api.delete(`subscriptions/${id}`)
    if (response.status === 204) {
      showToast('Subscription successfully deleted', 'success')
      fetchSubscriptions(tableOptions.value)
    }
  } catch (err) {
    handleError(err)
  }
}
</script>

<template>
  <div class="subscriptions-view">
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl" class="view-card">
          <v-card-title class="view-header px-6 pt-6 pb-2">
            <div>
              <p class="view-eyebrow mb-1">Billing</p>
              <h2 class="view-title">Subscriptions</h2>
              <p class="view-subtitle mb-0">Manage client plans, lifecycle, and status.</p>
            </div>
            <v-text-field
              rounded="xl"
              prepend-inner-icon="mdi-magnify"
              clearable
              label="Search Subscription"
              placeholder="Search subscription"
              v-model="search"
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
                  {{ hasSearch ? `Results for "${search}"` : `${totalItems || 0} subscriptions` }}
                </span>
              </div>

              <v-data-table-server
                density="comfortable"
                :hide-default-body="subscriptions.length === 0 && !loading"
                :hide-default-footer="subscriptions.length === 0 && !loading"
                class="view-table elevation-0 rounded-xl"
                :headers="headers"
                :items="subscriptions"
                :items-length="totalItems"
                :loading="loading"
                :items-per-page="itemsPerPage"
                @update:options="onOptionsUpdate"
                loading-text="Loading subscriptions..."
                hover
              >
                <template v-slot:no-data></template>
                <template v-slot:[`item.status`]="{ item }">
                  <v-chip class="d-flex justify-center" size="small" variant="tonal" :color="getColor(item.status)">
                    <v-icon :icon="item.status === 'active' ? 'mdi-check-circle' : 'mdi-close-circle'" start></v-icon>
                    {{ item.status === 'active' ? 'Active' : 'Expired' }}
                  </v-chip>
                </template>
                <template v-slot:[`item.action`]="{ item }">
                  <div class="d-flex align-center action-wrap">
                    <v-btn
                      size="small"
                      variant="text"
                      color="primary"
                      prepend-icon="mdi-eye-outline"
                      @click="viewSubscription(item.id)"
                    >
                      View
                    </v-btn>

                    <v-btn
                      size="small"
                      variant="text"
                      color="error"
                      prepend-icon="mdi-delete-outline"
                      @click="deleteSubscription(item.id)"
                    >
                      Delete
                    </v-btn>
                  </div>
                </template>
                <template v-slot:loader>
                  <v-progress-linear height="3" indeterminate color="#01A1FF"></v-progress-linear>
                </template>
              </v-data-table-server>

              <v-empty-state
                v-if="!loading && subscriptions.length === 0 && search"
                icon="mdi-magnify"
                title="We couldn't find a match."
                text="Try adjusting your filters or search terms to find what you're looking for."
                class="mt-4"
              />

              <v-empty-state
                v-else-if="!loading && subscriptions.length === 0"
                icon="mdi-database-outline"
                title="No subscriptions yet"
                text="Subscriptions will show up here once you add some."
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
.subscriptions-view {
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

.action-wrap {
  gap: 8px;
  flex-wrap: wrap;
}

.view-table :deep(thead th) {
  color: #5e7490;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
