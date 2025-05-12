<script setup>
import { ref, watch } from 'vue'
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
const tableOptions = ref({ page: 1, itemsPerPage: itemsPerPage.value })
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
  { key: 'created_at', title: 'Created On' },
  { key: 'status', title: 'Status' },
  { key: 'action', title: 'Action' },
]

const fetchSubscriptions = async ({ page, itemsPerPage, search }) => {
  loading.value = true
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
  <div class="Clients">
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl">
          <v-card-title class="d-flex justify-space-between">
            <span class="text-black font-weight-bold">Subscriptions</span>
            <v-col cols="3" class="pa-0">
              <v-text-field
                rounded="xl"
                prepend-inner-icon="mdi-magnify"
                clearable
                label="Search Subscription"
                placeholder="Search subscription"
                v-model="search"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
          </v-card-title>
          <v-card-text>
            <v-data-table-server
              density="compact"
              class="elevation-1 rounded-xl"
              :headers
              :items="subscriptions"
              :items-length="totalItems"
              :loading
              :items-per-page="itemsPerPage"
              @update:options="fetchSubscriptions"
              loading-text="Loading subscriptions..."
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
                  <v-icon
                    :icon="item.status === 'active' ? 'mdi-check-circle' : 'mdi-close-circle'"
                    start
                  ></v-icon>
                  {{ item.status === 'active' ? 'Active' : 'Expired' }}
                </v-chip>
              </template>
              <template v-slot:[`item.action`]="{ item }">
                <div class="d-flex">
                  <v-icon
                    color="#01A1FF"
                    icon="mdi-eye"
                    size="small"
                    @click="viewSubscription(item.id)"
                  ></v-icon>

                  <v-icon
                    class="ml-2"
                    color="#ff6692"
                    icon="mdi-delete"
                    size="small"
                    @click="deleteSubscription(item.id)"
                  ></v-icon>
                </div>
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
