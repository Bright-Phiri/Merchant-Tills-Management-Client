<script setup>
import { ref, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from '@/utils/utils'
import api from '@/services/api'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
const route = useRoute()
const loading = ref(false)
const subscriptionForm = useTemplateRef('subscriptionForm')

const subscription = ref({
  days: '',
})

const srcs = {
  0: '/images/cash-logo.jpg',
  1: '/images/tnm-logo.png',
  2: '/images/airtel-logo.jpg',
  3: '/images/visa-logo.png',
}

const paymentMethods = ref([
  { name: 'CASH', src: srcs[0] },
  { name: 'TNM MPAMBA', src: srcs[1] },
  { name: 'AIRTEL MONEY', src: srcs[2] },
  { name: 'VISA', src: srcs[3] },
])

const payment = ref({
  payment_date: '',
  amount: '',
  payment_method: '',
  transaction_id: '',
})

const cancelCreateSubscription = () => {
  subscriptionForm.value.reset()
}

const createSubscription = async () => {
  const requiredFields = [
    subscription.value.days,
    payment.value.payment_date,
    payment.value.amount,
    payment.value.payment_method,
  ]

  const allFieldsFilled = requiredFields.every((field) => !!field)

  if (!allFieldsFilled) {
    showToast('⚠️ Please enter all required fields.', 'warning')
    return
  }

  const payload = {
    subscription: subscription.value,
    payment: payment.value,
  }

  try {
    loading.value = true
    const response = await api.post(`taxpayers/${route.params.id}/subscriptions`, payload)

    if (response.status === 201) {
      showToast(response.data.message, 'success')
      subscriptionForm.value.reset()
    }
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="form-view">
    <v-row>
      <v-col cols="12" lg="10">
        <v-card rounded="xl" class="form-card">
          <v-card-title class="form-header px-6 pt-6 pb-2">
            <div>
              <p class="form-eyebrow mb-1">Billing</p>
              <h2 class="form-title">Create Subscription</h2>
              <p class="form-subtitle mb-0">Register a new subscription and payment record.</p>
            </div>
          </v-card-title>

          <v-card-text class="px-6 pb-6 pt-3">
            <v-form ref="subscriptionForm" @submit.prevent="createSubscription">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field label="Duration (Days)" v-model="subscription.days" variant="outlined" density="comfortable" type="number" rounded="lg"/>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field label="Payment Date" v-model="payment.payment_date" variant="outlined" density="comfortable" type="date" rounded="lg"/>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field label="Amount (MW)" v-model="payment.amount" variant="outlined" density="comfortable" type="number" rounded="lg"/>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-select
                    :items="paymentMethods"
                    item-title="name"
                    item-value="name"
                    v-model="payment.payment_method"
                    label="Payment Method"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    chips
                    closable-chips
                  >
                    <template v-slot:chip="{ props, item }">
                      <v-chip v-bind="props" :prepend-avatar="item.raw.src" :text="item.raw.name"></v-chip>
                    </template>
                  </v-select>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field label="Transaction ID" v-model="payment.transaction_id" variant="outlined" density="comfortable" rounded="lg"/>
                </v-col>

                <v-col cols="12" class="d-flex flex-wrap action-wrap">
                  <v-btn variant="tonal" color="#ff6692" rounded="lg" class="text-none" @click="cancelCreateSubscription">Cancel</v-btn>
                  <v-btn color="#01A1FF" variant="flat" rounded="lg" type="submit" class="text-none" :loading="loading">Submit</v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.form-view {
  padding: 6px 2px 18px;
}

.form-card {
  border: 1px solid #e7eef8;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  box-shadow: 0 14px 28px rgba(18, 56, 91, 0.06);
}

.form-eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6f8199;
  font-weight: 700;
}

.form-title {
  margin: 0;
  font-size: clamp(1.25rem, 1.8vw, 1.65rem);
  color: #263d59;
}

.form-subtitle {
  color: #74889f;
  font-size: 0.9rem;
}

.action-wrap {
  gap: 10px;
}
</style>
