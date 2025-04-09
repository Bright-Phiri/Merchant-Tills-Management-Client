<script setup>
import { ref } from 'vue'
import api from '@/services/api'
import { showAlert } from '@/utils/alert'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const subscriptions = ref([])
const search = ref('')
const itemsPerPage = ref(20)
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
  { key: 'status', title: 'Status' },
  { key: 'action', title: 'Action' },
]

function getColor(status) {
  if (status === 'active') return 'success'
  else return 'red'
}

async function fetchSubscriptions({ page, itemsPerPage }) {
  loading.value = true
  try {
    const response = await api.get('subscriptions', {
      params: { page, per_page: itemsPerPage },
    })
    subscriptions.value = response.data.data.subscriptions
    totalItems.value = response.data.data.total
    loading.value = false
  } catch (err) {
    loading.value = false
    showAlert('error', 'Unable to Reach Server', err + ", Couldn't reach API")
  }
}

function viewSubscription(id) {
  router.push({ name: 'subscription-details', params: { id }, replace: true })
}

async function deleteSubscription(id) {
  try {
    const response = await api.delete(`subscriptions/${id}`)
    if (response.status === 204) {
      showAlert('success', 'Message', 'Subscription successfully deleted').then(() => {
        fetchSubscriptions(tableOptions.value)
      })
    }
  } catch (err) {
    loading.value = false
    showAlert('error', 'Unable to Reach Server', err + ", Couldn't reach API")
  }
}
</script>
<template>
  <div class="Clients">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <span>Subscriptions</span>
            <div class="d-flex justify-space-between mt-2">
              <v-col cols="3" class="pa-0">
                <v-text-field
                  append-inner-icon="mdi-magnify"
                  clearable
                  label="Search Subscription"
                  placeholder="Search subscription"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
            </div>
          </v-card-title>
          <v-card-text>
            <v-data-table-server
              density="comfortable"
              class="elevation-1"
              :headers
              :items="subscriptions"
              :items-length="totalItems"
              :search
              :loading
              :items-per-page="itemsPerPage"
              @update:options="fetchSubscriptions"
              loading-text="Loading subscriptions..."
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
                  {{ item.status === 'active' ? 'Active' : 'Expired' }}
                </v-chip>
              </template>
              <template v-slot:[`item.action`]="{ item }">
                <div class="d-flex">
                  <v-icon
                    color="blue"
                    icon="mdi-eye"
                    size="small"
                    @click="viewSubscription(item.id)"
                  ></v-icon>

                  <v-icon
                    class="ml-2"
                    color="red"
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
                  color="#365B73"
                ></v-progress-linear> </template
            ></v-data-table-server>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
