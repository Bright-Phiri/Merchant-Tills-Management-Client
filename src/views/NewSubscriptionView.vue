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
const paymentMethods = ref(['CASH', 'TNM MPAMBA', 'AIRTEL MONEY', 'VISA'])
const subscription = ref({
  days: '',
})

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
  <div class="NewSubscription">
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl">
          <v-card-title class="text-black font-weight-bold">Subscription Details</v-card-title>
          <v-card-text>
            <v-form ref="subscriptionForm" v-on:submit.prevent="createSubscription">
              <v-col sm="12" lg="6" md="6">
                <v-text-field
                  rounded="lg"
                  label="Duration (Days)"
                  v-model="subscription.days"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                ></v-text-field>
              </v-col>

              <v-col sm="12" lg="6" md="6">
                <v-text-field
                  rounded="lg"
                  label="Payment Date"
                  v-model="payment.payment_date"
                  variant="outlined"
                  density="comfortable"
                  type="date"
                ></v-text-field>
              </v-col>

              <v-col sm="12" lg="6" md="6">
                <v-text-field
                  rounded="lg"
                  label="Amount (MW)"
                  v-model="payment.amount"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                ></v-text-field>
              </v-col>

              <v-col sm="12" lg="6" md="6">
                <v-select
                  rounded="lg"
                  :items="paymentMethods"
                  v-model="payment.payment_method"
                  label="Payment Method"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <v-col sm="12" lg="6" md="6">
                <v-text-field
                  rounded="lg"
                  label="Transaction ID"
                  v-model="payment.transaction_id"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col sm="12" lg="6" md="6">
                <div>
                  <v-btn
                    variant="tonal"
                    color="#ff6692"
                    rounded="xl"
                    v-on:click="cancelCreateSubscription"
                    >Cancel</v-btn
                  >
                  <v-btn
                    color="#01A1FF"
                    class="ml-2"
                    variant="flat"
                    rounded="xl"
                    type="submit"
                    :loading
                    >Submit</v-btn
                  >
                </div>
              </v-col>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
