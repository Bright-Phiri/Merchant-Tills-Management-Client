<script setup>
import { ref, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import axios from 'axios'

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

function cancelCreateSubscription() {
  subscriptionForm.value.reset()
}

async function createSubscription() {
  const requiredFields = [
    subscription.value.months,
    payment.value.payment_date,
    payment.value.amount,
    payment.value.payment_method,
  ]

  const allFieldsFilled = requiredFields.every((field) => !!field)

  if (!allFieldsFilled) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Fields',
      text: 'Please enter all required fields',
    })
    return
  }

  const payload = {
    subscription: subscription.value,
    payment: payment.value,
  }

  try {
    loading.value = true
    const response = await axios.post(
      `http://127.0.0.1:3000/api/v1/taxpayers/${route.params.id}/subscriptions`,
      payload,
    )
    if (response.status === 201) {
      loading.value = false
      await Swal.fire({
        icon: 'success',
        title: 'Subscription Created',
        text: response.data.message,
      })
      subscriptionForm.value.reset()
    }
  } catch (err) {
    if (err.response.status === 422 || err.response.status === 400) {
      const data = err.response.data
      const errorText = data.errors || data.message || 'An unknown error occurred'

      await Swal.fire({
        icon: 'error',
        title: 'Failed to create subscription',
        text: Array.isArray(errorText) ? errorText.join(', ') : errorText,
      })
    }

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
