<template>
  <span class="k-badge" :style="{ color: config.color, background: config.bg }">
    {{ config.label }}
  </span>
</template>

<script setup lang="ts">
import type { EventSeverity } from '../../types'
import { severityConfig } from '../../utils'

const props = defineProps<{ severity: EventSeverity }>()


const config = severityConfig[props.severity]
</script>

<style scoped>
.k-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
</style>