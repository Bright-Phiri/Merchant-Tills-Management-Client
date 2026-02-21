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
  <v-card
    :color="cardColor"
    rounded="xl"
    height="200"
    :to="to"
    :aria-label="`${title} card`"
    class="dashboard-card"
  >
    <v-card-title class="d-flex justify-space-between py-6">
      <div class="d-flex align-center">
        <v-avatar :color="avatarColor" size="50" rounded="xl">
          <v-icon v-if="icon" :icon="icon" :color="iconColor" />
        </v-avatar>
        <span class="ml-3 font-weight-medium text-h6 text-grey-darken-2">{{ title }}</span>
      </div>
      <v-icon class="mt-2 text-medium-emphasis" icon="mdi-arrow-top-right" size="20" />
    </v-card-title>

    <v-card-text class="d-flex justify-space-between align-end px-4">
      <div>
        <slot name="value">
          <span class="text-h6 text-md-h5 text-lg-h4">
            <AnimatedCounter v-if="value" :key="value" :value="value" :duration="duration" />
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
  border: 1px solid rgba(255, 255, 255, 0.72);
  box-shadow: 0 14px 28px rgba(20, 49, 86, 0.08);
  transition:
    box-shadow 160ms ease,
    transform 160ms ease;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 34px rgba(20, 49, 86, 0.12);
}

.dashboard-card:focus-visible {
  outline: 3px solid rgba(1, 161, 255, 0.25);
  outline-offset: 2px;
}
</style>
