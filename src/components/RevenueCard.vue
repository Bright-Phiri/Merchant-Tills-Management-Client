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
  <v-card rounded="xl" elevation="0" class="mt-2 revenue-card" :color="cardColor">
    <v-card-text class="d-flex align-center">
      <v-avatar :color="avatarColor" size="50" rounded="lg">
        <v-icon :icon :color="iconColor" size="28" />
      </v-avatar>
      <div class="d-flex flex-column justify-center ml-3">
        <span class="revenue-label">{{ label }}</span>
        <span class="revenue-value">
          {{ formatCurrency(value) }}
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.revenue-card {
  border: 1px solid #e1e6f0 !important;
}

.revenue-label {
  font-size: 12px;
  color: #5f6368;
  font-weight: 600;
  line-height: 18px;
}

.revenue-value {
  font-size: 15px;
  color: #202124;
  font-weight: 700;
  line-height: 20px;
}
</style>
