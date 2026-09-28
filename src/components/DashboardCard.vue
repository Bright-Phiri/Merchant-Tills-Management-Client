<script setup>
defineProps({
  to: String,
  title: String,
  icon: String,
  iconColor: String,
  avatarColor: String,
  cardColor: String,
  value: Number,
  helper: String,
  duration: {
    type: Number,
    default: 500,
  },
})
</script>

<template>
  <v-card :color="cardColor" class="dashboard-card" height="184" :to>
    <div class="dashboard-card-head">
      <v-avatar :color="avatarColor" size="42" rounded="lg">
        <v-icon v-if="icon" :icon :color="iconColor" size="21" />
      </v-avatar>
      <v-icon class="dashboard-menu-icon" icon="mdi-arrow-top-right" size="18" />
    </div>
    <div class="dashboard-card-body">
      <div class="metric-copy">
        <span class="dashboard-title">{{ title }}</span>
        <slot name="value">
          <span class="metric-value">
            <AnimatedCounter v-if="value" :key="value" :value :duration />
            <span v-else>0</span>
          </span>
        </slot>
        <span class="metric-helper">{{ helper }}</span>
      </div>
      <div class="metric-visual" aria-hidden="true">
        <slot name="chart" />
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.dashboard-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #e0e6e4 !important;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease;
}

.dashboard-card::after {
  position: absolute;
  right: -38px;
  bottom: -55px;
  width: 140px;
  height: 140px;
  border: 24px solid #f2f6f2;
  border-radius: 50%;
  content: '';
  pointer-events: none;
}

.dashboard-card:hover {
  border-color: #9fcabd !important;
  transform: translateY(-2px);
}

.dashboard-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 20px 0;
}

.dashboard-card-body {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px 18px;
}

.metric-copy {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.dashboard-title {
  color: #66777b;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.25px;
}

.dashboard-menu-icon {
  color: #087e70;
}

.metric-value {
  margin-top: 2px;
  color: #172d35;
  font-size: 31px;
  font-weight: 620;
  letter-spacing: -1px;
  line-height: 1.15;
}

.metric-helper {
  margin-top: 5px;
  color: #718184;
  font-size: 10px;
  line-height: 1.35;
}

.metric-visual {
  position: relative;
  z-index: 1;
  max-width: 55%;
  overflow: hidden;
}
</style>
