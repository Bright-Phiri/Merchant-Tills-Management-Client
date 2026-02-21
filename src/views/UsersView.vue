<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'
import { showToast, getColor } from '@/utils/utils'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
const router = useRouter()
const fetchUsersLoading = ref(false)
const users = ref([])
const search = ref('')
const hasSearch = computed(() => search.value.trim().length > 0)

const headers = [
  {
    align: 'start',
    key: 'first_name',
    sortable: false,
    title: 'First Name',
  },
  { key: 'last_name', title: 'Last Name' },
  { key: 'user_name', title: 'User Name' },
  { key: 'role', title: 'Role' },
  { key: 'email_address', title: 'Email Address' },
  { key: 'phone_number', title: 'Phone Number' },
  { key: 'status', title: 'Status' },
  { key: 'action', title: 'Action' },
]

const fetchSystemUsers = async () => {
  fetchUsersLoading.value = true
  try {
    const response = await api.get('users')
    users.value = response.data.data
  } catch (err) {
    handleError(err)
  } finally {
    fetchUsersLoading.value = false
  }
}

const activateUser = async (id) => {
  try {
    const response = await api.patch(`users/${id}/activate`)
    if (response.status === 200) {
      showToast('The user has been successfully activated', 'success')
      fetchSystemUsers()
    }
  } catch (err) {
    handleError(err)
  }
}

const disableUser = async (id) => {
  try {
    const response = await api.patch(`users/${id}/disable`)
    if (response.status === 200) {
      showToast('User has been successfully disabled', 'success')
      fetchSystemUsers()
    }
  } catch (err) {
    handleError(err)
  }
}

const loadEditUserForm = (id) => {
  router.push({ name: 'edit-user', params: { id } })
}

onMounted(() => {
  fetchSystemUsers()
})
</script>

<template>
  <div class="users-view">
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl" class="view-card">
          <v-card-title class="view-header px-6 pt-6 pb-2">
            <div>
              <p class="view-eyebrow mb-1">Management</p>
              <h2 class="view-title">Users</h2>
              <p class="view-subtitle mb-0">Manage system users, status, and access.</p>
            </div>
            <div class="header-tools">
              <v-btn
                color="#01A1FF"
                class="text-none"
                rounded="lg"
                variant="flat"
                to="/new-user"
                prepend-icon="mdi-account-plus"
              >
                New User
              </v-btn>

              <v-text-field
                rounded="xl"
                prepend-inner-icon="mdi-magnify"
                clearable
                v-model="search"
                label="Search User"
                placeholder="Search user"
                variant="solo-filled"
                density="comfortable"
                hide-details
                bg-color="white"
                flat
                class="view-search"
              ></v-text-field>
            </div>
          </v-card-title>

          <v-card-text class="px-6 pb-6 pt-3">
            <div class="table-shell">
              <div class="table-toolbar mb-3">
                <span class="toolbar-text">
                  {{ hasSearch ? `Filtered users for "${search}"` : `${users.length} users loaded` }}
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

              <v-data-table
                :header-props="{ class: 'table-header' }"
                density="comfortable"
                class="view-table elevation-0 rounded-xl"
                :headers="headers"
                :items="users"
                :search="search"
                :loading="fetchUsersLoading"
                loading-text="Loading users..."
                hover
              >
                <template v-slot:[`item.action`]="{ item }">
                  <div class="d-flex align-center action-wrap">
                    <v-btn
                      size="small"
                      variant="text"
                      color="primary"
                      prepend-icon="mdi-pencil-outline"
                      @click="loadEditUserForm(item.id)"
                    >
                      Edit
                    </v-btn>

                    <v-btn
                      v-if="item.status === 'disabled'"
                      size="small"
                      variant="tonal"
                      color="success"
                      prepend-icon="mdi-account-check"
                      @click="activateUser(item.id)"
                    >
                      Activate
                    </v-btn>

                    <v-btn
                      v-else
                      size="small"
                      variant="tonal"
                      color="error"
                      prepend-icon="mdi-account-lock"
                      @click="disableUser(item.id)"
                    >
                      Disable
                    </v-btn>
                  </div>
                </template>

                <template v-slot:[`item.status`]="{ item }">
                  <v-chip class="d-flex justify-center" size="small" variant="tonal" :color="getColor(item.status)">
                    <v-icon :icon="item.status === 'active' ? 'mdi-check-circle' : 'mdi-alert-circle'" start />
                    {{ item.status === 'active' ? 'Active' : 'Inactive' }}
                  </v-chip>
                </template>

                <template v-slot:loader>
                  <v-progress-linear height="3" indeterminate color="#01A1FF"></v-progress-linear>
                </template>
              </v-data-table>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.users-view {
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

.header-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.view-search {
  width: 300px;
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

@media (max-width: 760px) {
  .view-search {
    width: 100%;
  }

  .header-tools {
    width: 100%;
  }
}
</style>
