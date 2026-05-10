<template>
  <span class="status-wrap">
    <span class="dot" :class="`dot--${status}`" />
    <span v-if="status === 'live'" class="ring" />
  </span>
</template>

<script setup lang="ts">
import type { StreamStatus } from '../../types'
defineProps<{ status: StreamStatus }>()
</script>

<style scoped>
.status-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 10px;
  height: 10px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: relative;
  z-index: 1;
}

.dot--live         { background: #4fffb0; }
.dot--paused       { background: #6b7280; }
.dot--reconnecting { background: #f5a623; }
.dot--error        { background: #ff4d6d; }


.ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: #4fffb0;
  animation: pulse-ring 1.5s ease-out infinite;
}

@keyframes pulse-ring {
  0%   { transform: scale(1);   opacity: 0.6; }
  100% { transform: scale(2.5); opacity: 0;   }
}
</style>