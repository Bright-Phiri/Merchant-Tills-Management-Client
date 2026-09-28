<script setup>
defineProps({ loading: Boolean, error: String, empty: String })
defineEmits(['retry'])
</script>
<template>
  <div v-if="loading" class="portal-loading" role="status">
    <span class="portal-spinner"></span>
    <p>Getting everything ready…</p>
  </div>
  <div v-else-if="error" class="portal-empty" role="alert">
    <v-icon icon="mdi-wifi-alert" size="34" />
    <h2>We couldn’t load this page</h2>
    <p>{{ error }}</p>
    <button class="portal-btn portal-btn-primary" @click="$emit('retry')">
      Try again <v-icon icon="mdi-refresh" size="18" />
    </button>
  </div>
  <div v-else-if="empty" class="portal-empty">
    <v-icon icon="mdi-layers-outline" size="34" />
    <h2>{{ empty }}</h2>
    <p>
      Your account is ready. Please contact your POS provider for the available subscription
      options.
    </p>
  </div>
</template>
