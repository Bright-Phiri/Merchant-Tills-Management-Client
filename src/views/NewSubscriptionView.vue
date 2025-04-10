<script setup>
import { ref, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { showAlert } from '@/utils/utils'
import api from '@/services/api'

const route = useRoute()
const loading = ref(false)
const subscriptionForm = useTemplateRef('subscriptionForm')
const paymentMethods = ref(['CASH', 'TNM MPAMBA', 'AIRTEL MONEY', 'VISA'])
const subscription = ref({
  months: '',
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
    subscription.value.months,
    payment.value.payment_date,
    payment.value.amount,
    payment.value.payment_method,
  ]

  const allFieldsFilled = requiredFields.every((field) => !!field)

  if (!allFieldsFilled) {
    showAlert('warning', 'Missing Fields', 'Please enter all required fields')
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
      showAlert('success', 'Subscription Created', response.data.message)
      subscriptionForm.value.reset()
    }
  } catch (err) {
    if (err.response.status === 422 || err.response.status === 400) {
      const data = err.response.data
      const errorText = data.errors || data.message || 'An unknown error occurred'
      showAlert(
        'error',
        'Failed to create subscription',
        Array.isArray(errorText) ? errorText.join(', ') : errorText,
      )
    }
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <div class="NewSubscription">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Create New Subscription</v-card-title>
          <v-card-text>
            <v-form ref="subscriptionForm" v-on:submit.prevent="createSubscription">
              <v-col sm="12" lg="6" md="6">
                <v-text-field
                  label="Duration (Months)"
                  v-model="subscription.months"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                ></v-text-field>
              </v-col>

              <v-col sm="12" lg="6" md="6">
                <v-text-field
                  label="Payment Date"
                  v-model="payment.payment_date"
                  variant="outlined"
                  density="comfortable"
                  type="date"
                ></v-text-field>
              </v-col>

              <v-col sm="12" lg="6" md="6">
                <v-text-field
                  label="Amount (MW)"
                  v-model="payment.amount"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                ></v-text-field>
              </v-col>

              <v-col sm="12" lg="6" md="6">
                <v-select
                  :items="paymentMethods"
                  v-model="payment.payment_method"
                  label="Payment Method"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <v-col sm="12" lg="6" md="6">
                <v-text-field
                  label="Transaction ID"
                  v-model="payment.transaction_id"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col sm="12" lg="6" md="6">
                <div>
                  <v-btn color="black" variant="flat" v-on:click="cancelCreateSubscription"
                    >Cancel</v-btn
                  >
                  <v-btn color="#365B73" variant="outlined" class="ml-2" type="submit" :loading
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
