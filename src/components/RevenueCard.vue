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
  <v-card
    rounded="xl"
    elevation="0"
    class="mt-2 revenue-card"
    :color="cardColor"
    tabindex="0"
    :aria-label="label"
  >
    <v-card-text class="d-flex align-center">
      <v-avatar :color="avatarColor" size="50" rounded="xl">
        <v-icon :icon="icon" :color="iconColor" size="28" />
      </v-avatar>
      <div class="d-flex flex-column justify-center ml-3">
        <span class="font-weight-medium text-h7 text-grey-darken-2">{{ label }}</span>
        <span class="font-weight-bold text-subtitle-1 text-grey-darken-3">
          {{ formatCurrency(value) }}
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.revenue-card {
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition:
    transform 140ms ease,
    box-shadow 140ms ease;
}

.revenue-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(20, 49, 86, 0.08);
}

.revenue-card:focus-visible {
  outline: 3px solid rgba(1, 161, 255, 0.18);
  outline-offset: 2px;
}
</style>
