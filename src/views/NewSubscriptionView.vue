<script setup>
import { ref, useTemplateRef } from 'vue'

const subscriptionForm = useTemplateRef('subscriptionForm')
const paymentMethods = ref(['CASH', 'TNM MPAMBA', 'AIRTEL MONEY', 'VISA'])

function cancelCreateSubscription() {
  subscriptionForm.value.reset()
}
</script>
<template>
  <div class="NewSubscription">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Create New Subscription</v-card-title>
          <v-card-text>
            <v-form ref="subscriptionForm">
              <v-col sm="12" lg="6" md="6">
                <v-text-field
                  label="Duration (Months)"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                ></v-text-field>
              </v-col>

              <v-col sm="12" lg="6" md="6">
                <v-text-field
                  label="Payment Date"
                  variant="outlined"
                  density="comfortable"
                  type="date"
                ></v-text-field>
              </v-col>

              <v-col sm="12" lg="6" md="6">
                <v-text-field
                  label="Amount (MW)"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                ></v-text-field>
              </v-col>

              <v-col sm="12" lg="6" md="6">
                <v-select
                  :items="paymentMethods"
                  label="Payment Method"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <v-col sm="12" lg="6" md="6">
                <v-text-field
                  label="Transaction ID"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col sm="12" lg="6" md="6">
                <div>
                  <v-btn color="black" variant="flat" v-on:click="cancelCreateSubscription"
                    >Cancel</v-btn
                  >
                  <v-btn color="#365B73" variant="outlined" class="ml-2">Submit</v-btn>
                </div>
              </v-col>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
