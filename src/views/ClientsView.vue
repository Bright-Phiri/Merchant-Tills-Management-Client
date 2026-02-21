<script setup>
import { ref, watch, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
const loading = ref(false)
const clients = ref([])
const search = ref('')
const itemsPerPage = ref(14)
const totalItems = ref(0)
const router = useRouter()
const hasSearch = computed(() => search.value.trim().length > 0)
const headers = [
  {
    align: 'start',
    key: 'tin',
    sortable: false,
    title: 'Client TIN',
  },
  { key: 'name', title: 'Client Name' },
  { key: 'email_address', title: 'Email Address' },
  { key: 'phone_number', title: 'Phone Number' },
  { key: 'terminals_count', title: 'Terminals Count' },
  { key: 'action', title: 'Action' },
]

const fetchClients = async ({ page, itemsPerPage, search }) => {
  loading.value = true
  try {
    const response = await api.get('taxpayers', {
      params: { page, per_page: itemsPerPage, search },
    })
    clients.value = response.data.data.taxpayers
    totalItems.value = response.data.data.total
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = useDebounceFn(() => {
  fetchClients({ page: 1, itemsPerPage: itemsPerPage.value, search: search.value })
}, 400)

watch(search, () => {
  debouncedSearch()
})

const loadNewSubscriptionForm = (id) => {
  router.push({ name: 'new-subscription', params: { id }, replace: true })
}

const loadClientTerminalsView = (id, name) => {
  router.push({ name: 'client-terminals', params: { id, name }, replace: true })
}
</script>

<template>
  <div class="clients">
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl" class="clients-card">
          <v-card-title class="clients-header px-6 pt-6 pb-2">
            <div>
              <p class="clients-eyebrow mb-1">Directory</p>
              <h2 class="clients-title">Clients</h2>
              <p class="clients-subtitle mb-0">Search, review terminals, and create subscriptions.</p>
            </div>
            <div class="header-tools">
              <v-chip color="primary" variant="tonal" class="mr-3" size="small">
                <v-icon start icon="mdi-account-group-outline" size="16" />
                {{ totalItems || 0 }} Total
              </v-chip>

              <v-text-field
                rounded="xl"
                prepend-inner-icon="mdi-magnify"
                clearable
                v-model="search"
                label="Search Client"
                placeholder="Search by name, TIN, email..."
                variant="solo-filled"
                density="comfortable"
                hide-details
                bg-color="white"
                flat
                class="clients-search"
              ></v-text-field>
            </div>
          </v-card-title>

          <v-card-text class="px-6 pb-6 pt-3">
            <div class="table-shell">
              <div class="table-toolbar mb-3">
                <span class="toolbar-text">
                  {{ hasSearch ? `Results for "${search}"` : 'All clients' }}
                </span>
                <v-btn
                  v-if="hasSearch"
                  size="small"
                  variant="text"
                  color="primary"
                  prepend-icon="mdi-close-circle-outline"
                  @click="search = ''"
                >
                  Clear search
                </v-btn>
              </div>

            <v-data-table-server
              density="comfortable"
              :hide-default-body="clients.length === 0 && !loading"
              :hide-default-footer="clients.length === 0 && !loading"
              :header-props="{ class: 'table-header' }"
              class="clients-table elevation-0 rounded-xl"
              v-model:items-per-page="itemsPerPage"
              :headers
              :items="clients"
              :items-length="totalItems"
              :loading
              :items-per-page="itemsPerPage"
              @update:options="fetchClients"
              loading-text="Loading clients..."
              hover
            >
              <template v-slot:no-data></template>
              <template v-slot:item.action="{ item }">
                <div class="d-flex align-center action-wrap">
                  <v-btn
                    variant="tonal"
                    prepend-icon="mdi-eye"
                    class="text-capitalize"
                    color="#01A1FF"
                    size="small"
                    v-on:click="loadClientTerminalsView(item.id, item.name)"
                  >
                    View Terminals
                  </v-btn>

                  <v-btn
                    variant="outlined"
                    prepend-icon="mdi-plus-circle-multiple-outline"
                    class="text-capitalize"
                    color="#01A1FF"
                    size="small"
                    v-on:click="loadNewSubscriptionForm(item.id)"
                  >
                    Create Subscription
                  </v-btn>
                </div>
              </template>
              <template v-slot:loader>
                <v-progress-linear height="3" indeterminate color="#01A1FF"></v-progress-linear>
              </template>
            </v-data-table-server>
            <v-empty-state
              v-if="!loading && clients.length === 0 && search"
              icon="mdi-magnify"
              title="We couldn't find a match."
              text="Try adjusting your filters or search terms to find what you're looking for."
              class="mt-4"
            />

            <v-empty-state
              v-else-if="!loading && clients.length === 0"
              icon="mdi-database-outline"
              title="No clients yet"
              text="Clients will show up here."
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
.clients {
  padding: 6px 2px 18px;
}

.clients-card {
  border: 1px solid #e7eef8;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  box-shadow: 0 14px 28px rgba(18, 56, 91, 0.06);
}

.clients-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.clients-eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6f8199;
  font-weight: 700;
}

.clients-title {
  margin: 0;
  font-size: clamp(1.25rem, 1.8vw, 1.65rem);
  color: #263d59;
  line-height: 1.2;
}

.clients-subtitle {
  color: #74889f;
  font-size: 0.9rem;
}

.header-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.clients-search {
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

.clients-table :deep(thead th) {
  color: #5e7490;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

@media (max-width: 760px) {
  .clients-search {
    width: 100%;
  }

  .header-tools {
    width: 100%;
  }
}
</style>
