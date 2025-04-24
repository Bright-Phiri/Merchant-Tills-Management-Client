<script setup>
import { formatCurrency } from '@/utils/utils'

defineProps({
  label: String,
  value: String,
  icon: String,
  iconColor: String,
  avatarColor: String,
  cardColor: String,
})
</script>

<template>
  <v-card rounded="xl" elevation="0" class="mt-2" :color="cardColor">
    <v-card-text class="d-flex align-center">
      <v-avatar :color="avatarColor" size="50" rounded="xl">
        <v-icon :icon="icon" :color="iconColor" size="28" />
      </v-avatar>
      <div class="d-flex flex-column justify-center ml-3">
        <span class="font-weight-medium text-h7 text-grey-darken-2">{{ label }}</span>
        <span class="font-weight-medium text-h7 text-grey-darken-2">
          {{ formatCurrency(value) }}
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>
