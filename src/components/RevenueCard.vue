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
  <v-card elevation="0" class="revenue-card" :color="cardColor">
    <v-card-text class="d-flex align-center">
      <v-avatar :color="avatarColor" size="38" rounded="lg">
        <v-icon :icon :color="iconColor" size="21" />
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
  margin-bottom: 7px;
  border: 1px solid #e0e6e4 !important;
  box-shadow: none !important;
}

.revenue-card :deep(.v-card-text) {
  padding: 10px 12px !important;
}

.revenue-label {
  font-size: 12px;
  color: #66777b;
  font-weight: 600;
  line-height: 18px;
}

.revenue-value {
  font-size: 15px;
  color: #172d35;
  font-weight: 700;
  line-height: 20px;
}
</style>
