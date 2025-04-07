<script setup>
import { ref } from 'vue'
const loading = ref(true)
const headers = [
  {
    align: 'start',
    key: 'terminal_id',
    sortable: false,
    title: 'Terminal ID',
  },
  { key: 'terminal_label', title: 'Terminal Label' },
  { key: 'activation_date', title: 'Activation Date' },
  { key: 'phone_number', title: 'Phone Number' },
  { key: 'status', title: 'Status' },
  { key: 'taxpayer', title: 'Owner' },
]
</script>
<template>
  <div class="Terminals">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>All Terminals</span>
            <v-col cols="3">
              <v-text-field
                prepend-inner-icon="mdi-magnify"
                clearable
                placeholder="Search terminal"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
          </v-card-title>
          <v-card-text>
            <v-data-table
              class="elevation-1"
              :headers="headers"
              :search="search"
              :loading="loading"
              loading-text="Loading terminals..."
            ></v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
