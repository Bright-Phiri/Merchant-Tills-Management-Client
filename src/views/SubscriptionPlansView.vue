<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { showToast } from '@/utils/utils'

const auth = useAuthStore()
const { handleError } = useErrorHandler()
const plans = ref([])
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const form = reactive({
  id: null,
  name: '',
  billing_period: 'monthly',
  amount: '',
  currency: 'MWK',
  active: true,
  description: '',
})
const periods = [
  { title: 'Monthly', value: 'monthly' },
  { title: 'Quarterly', value: 'quarterly' },
  { title: 'Yearly', value: 'yearly' },
]
const canManage = computed(() => (auth.getPermissions.subscription_plans || []).includes('create'))

function reset(plan = null) {
  Object.assign(
    form,
    plan || {
      id: null,
      name: '',
      billing_period: 'monthly',
      amount: '',
      currency: 'MWK',
      active: true,
      description: '',
    },
  )
  dialog.value = true
}
async function load() {
  loading.value = true
  try {
    plans.value = (await api.get('subscription_plans')).data.data
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}
async function save() {
  if (!form.name || !form.billing_period || Number(form.amount) <= 0) {
    showToast('Enter a plan name, billing period, and positive price.', 'warning')
    return
  }
  saving.value = true
  try {
    const payload = { subscription_plan: { ...form, amount: Number(form.amount) } }
    if (form.id) await api.put(`subscription_plans/${form.id}`, payload)
    else await api.post('subscription_plans', payload)
    showToast(form.id ? 'Plan updated' : 'Plan created', 'success')
    dialog.value = false
    await load()
  } catch (error) {
    handleError(error)
  } finally {
    saving.value = false
  }
}
async function deactivate(plan) {
  try {
    await api.delete(`subscription_plans/${plan.id}`)
    showToast('Plan deactivated', 'success')
    await load()
  } catch (error) {
    handleError(error)
  }
}
onMounted(load)
</script>

<template>
  <div class="management-page">
    <div class="d-flex align-center justify-space-between mb-5">
      <div>
        <p class="text-overline text-medium-emphasis mb-1">BILLING CATALOGUE</p>
        <h1 class="text-h4 font-weight-bold">Subscription plans</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Configure the monthly, quarterly, and yearly offers shown in the customer portal.
        </p>
      </div>
      <v-btn v-if="canManage" color="#087E70" prepend-icon="mdi-plus" rounded="lg" @click="reset()">
        Add plan
      </v-btn>
    </div>

    <v-card rounded="xl" elevation="0" border>
      <v-data-table
        :headers="[
          { title: 'Plan', key: 'name' },
          { title: 'Billing period', key: 'billing_period' },
          { title: 'Price', key: 'amount' },
          { title: 'Portal status', key: 'active' },
          { title: '', key: 'actions', sortable: false },
        ]"
        :items="plans"
        :loading="loading"
      >
        <template #[`item.billing_period`]="{ item }"
          ><span class="text-capitalize">{{ item.billing_period }}</span></template
        >
        <template #[`item.amount`]="{ item }"
          >MK {{ Number(item.amount).toLocaleString('en-MW') }}</template
        >
        <template #[`item.active`]="{ item }">
          <v-chip :color="item.active ? 'success' : 'grey'" size="small" variant="tonal">
            {{ item.active ? 'Visible' : 'Inactive' }}
          </v-chip>
        </template>
        <template #[`item.actions`]="{ item }">
          <div v-if="canManage" class="d-flex ga-2 justify-end">
            <v-btn icon="mdi-pencil-outline" size="small" variant="text" @click="reset(item)" />
            <v-btn
              v-if="item.active"
              icon="mdi-eye-off-outline"
              size="small"
              color="error"
              variant="text"
              @click="deactivate(item)"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="560">
      <v-card rounded="xl" class="pa-2">
        <v-card-title>{{
          form.id ? 'Edit subscription plan' : 'Create subscription plan'
        }}</v-card-title>
        <v-card-text class="plan-form">
          <v-text-field v-model="form.name" label="Plan name" variant="outlined" />
          <div class="plan-form-row">
            <v-select
              v-model="form.billing_period"
              :items="periods"
              label="Billing period"
              variant="outlined"
            />
            <v-text-field
              v-model="form.amount"
              label="Price (MWK)"
              type="number"
              variant="outlined"
            />
          </div>
          <v-textarea v-model="form.description" label="Description" rows="3" variant="outlined" />
          <v-switch v-model="form.active" color="#087E70" label="Show this plan to customers" />
          <p class="plan-form-note text-caption text-medium-emphasis">
            Existing purchases keep their original price and duration when this plan changes.
          </p>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="#087E70" variant="flat" :loading="saving" @click="save">Save plan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.plan-form {
  display: grid;
  gap: 12px;
}

.plan-form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.plan-form :deep(.v-input),
.plan-form-note {
  margin: 0;
}

.plan-form :deep(.v-input__details) {
  padding-top: 4px;
}

@media (max-width: 480px) {
  .plan-form-row {
    grid-template-columns: 1fr;
  }
}
</style>
