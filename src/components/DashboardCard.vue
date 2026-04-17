<script setup>
defineProps({
  to: String,
  title: String,
  icon: String,
  iconColor: String,
  avatarColor: String,
  cardColor: String,
  value: Number,
  duration: {
    type: Number,
    default: 500,
  },
})
</script>

<template>
  <v-card :color="cardColor" class="dashboard-card" rounded="xl" height="200" :to>
    <v-card-title class="d-flex justify-space-between py-6">
      <div class="d-flex align-center">
        <v-avatar :color="avatarColor" size="50" rounded="lg">
          <v-icon v-if="icon" :icon :color="iconColor" />
        </v-avatar>
        <span class="ml-3 dashboard-title">{{ title }}</span>
      </div>
      <v-icon class="mt-2 dashboard-menu-icon" icon="mdi-dots-vertical" />
    </v-card-title>

    <v-card-text class="d-flex justify-space-between align-end px-4">
      <div>
        <slot name="value">
          <span class="metric-value text-h6 text-md-h5 text-lg-h4">
            <AnimatedCounter v-if="value" :key="value" :value :duration />
            <span v-else>0</span>
          </span>
        </slot>
        <slot name="extra" />
      </div>
      <div>
        <slot name="chart" />
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.dashboard-card {
  border: 1px solid #e1e6f0 !important;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease;
}

.dashboard-card:hover {
  border-color: #cdd5e5 !important;
}

.dashboard-title {
  color: #3c4043;
  font-size: 16px;
  font-weight: 600;
}

.dashboard-menu-icon {
  color: #8a9098;
}

.metric-value {
  color: #202124;
  font-weight: 700;
}
</style>
