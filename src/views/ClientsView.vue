<script setup>
import { computed, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useAuthStore } from '@/stores/useAuthStore'
import { showToast } from '@/utils/utils'

const { handleError } = useErrorHandler()
const loading = ref(false)
const clients = ref([])
const search = ref('')
const itemsPerPage = ref(14)
const totalItems = ref(0)
const router = useRouter()
const auth = useAuthStore()
const licenseDialog = ref(false)
const licenseSaving = ref(false)
const selectedClient = ref(null)
const selectedLicense = ref('subscription')
const canManageLicenses = computed(() => (auth.getPermissions.taxpayers || []).includes('update'))
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
  { key: 'license_type', title: 'License Type' },
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

const openLicenseDialog = (client) => {
  selectedClient.value = client
  selectedLicense.value = client.license_type || 'subscription'
  licenseDialog.value = true
}

const saveLicenseType = async () => {
  if (!selectedClient.value) return
  licenseSaving.value = true
  try {
    const response = await api.patch(`taxpayers/${selectedClient.value.id}/license_type`, {
      license_type: selectedLicense.value,
    })
    selectedClient.value.license_type = response.data.data.license_type
    showToast('Customer license type updated', 'success')
    licenseDialog.value = false
  } catch (err) {
    handleError(err)
  } finally {
    licenseSaving.value = false
  }
}
</script>

<template>
  <div class="Clients">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span class="text-black font-weight-bold">Clients</span>
            <v-col cols="3">
              <v-text-field
                rounded="xl"
                prepend-inner-icon="mdi-magnify"
                clearable
                v-model="search"
                label="Search Client"
                placeholder="Search client"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
          </v-card-title>
          <v-card-text>
            <v-data-table-server
              density="compact"
              :hide-default-body="clients.length === 0 && !loading"
              :hide-default-footer="clients.length === 0 && !loading"
              :header-props="{ class: 'text-black font-weight-bold' }"
              class="elevation-1 rounded-xl"
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
              <template v-slot:item.license_type="{ item }">
                <v-chip
                  size="small"
                  variant="tonal"
                  :color="item.license_type === 'once_off' ? 'indigo' : 'teal'"
                >
                  {{ item.license_type === 'once_off' ? 'Once-Off' : 'Subscription' }}
                </v-chip>
              </template>
              <template v-slot:item.action="{ item }">
                <div class="d-flex">
                  <v-btn
                    variant="text"
                    prepend-icon="mdi-eye"
                    class="text-capitalize"
                    color="#087E70"
                    density="compact"
                    v-on:click="loadClientTerminalsView(item.id, item.name)"
                    >View Terminals</v-btn
                  >

                  <v-btn
                    variant="text"
                    prepend-icon="mdi-plus-circle-multiple-outline"
                    class="text-capitalize ml-2"
                    color="#087E70"
                    density="compact"
                    v-on:click="loadNewSubscriptionForm(item.id)"
                    >Manage Access</v-btn
                  >
                  <v-btn
                    v-if="canManageLicenses"
                    variant="text"
                    prepend-icon="mdi-license"
                    class="text-capitalize ml-2"
                    color="#087E70"
                    density="compact"
                    @click="openLicenseDialog(item)"
                    >License Type</v-btn
                  >
                </div>
              </template>
              <template v-slot:loader>
                <v-progress-linear height="3" indeterminate color="#087E70"></v-progress-linear>
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
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="licenseDialog" max-width="520">
      <v-card rounded="xl" class="pa-2">
        <v-card-title>Customer license type</v-card-title>
        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-4">
            {{ selectedClient?.name }} · TIN {{ selectedClient?.tin }}
          </p>
          <v-select
            v-model="selectedLicense"
            :items="[
              { title: 'Subscription', value: 'subscription' },
              { title: 'Once-Off', value: 'once_off' },
            ]"
            label="License type"
            variant="outlined"
          />
          <v-alert
            v-if="selectedLicense === 'once_off'"
            type="warning"
            variant="tonal"
            class="mt-3"
          >
            Once-Off bypasses subscription expiry validation. Use Manage Access when you also need
            to record the negotiated payment.
          </v-alert>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="licenseDialog = false">Cancel</v-btn>
          <v-btn color="#087E70" variant="flat" :loading="licenseSaving" @click="saveLicenseType">
            Save license type
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
