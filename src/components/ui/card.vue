<template>
  <div class="k-card" :class="[padding && 'k-card--padded', props.class]">
    <slot />
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  padding?: boolean
  class?: string
}>()
</script>

<style scoped>
.k-card {
  background: #141418;
  border: 1px solid #1e1e26;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.k-card--padded {
  padding: 20px;
}


.k-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #2a2a36, transparent);
}
</style>