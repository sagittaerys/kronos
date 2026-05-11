<template>
  <Transition name="banner">
    <div v-if="show" class="banner" :class="`banner--${store.status}`">
      <div class="banner__icon">
        <component :is="icon" :size="15" />
      </div>
      <span class="banner__msg">{{ store.errorMessage }}</span>
      <button
        v-if="store.status === 'error'"
        class="banner__retry"
        @click="emit('retry')"
      >
        Retry now
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-vue-next'
import { useDashboardStore } from '../../stores/dashboardStore'

const emit  = defineEmits<{ retry: [] }>()
const store = useDashboardStore()

const show = computed(() =>
  store.status === 'reconnecting' || store.status === 'error'
)

const icon = computed(() => ({
  reconnecting: RefreshCw,
  error:        WifiOff,
  live:         AlertTriangle,
  paused:       AlertTriangle,
}[store.status]))
</script>

<style scoped>
.banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
}

.banner--reconnecting {
  background: rgba(245, 166, 35, 0.08);
  border-color: rgba(245, 166, 35, 0.2);
  color: #f5a623;
}

.banner--error {
  background: rgba(255, 77, 109, 0.08);
  border-color: rgba(255, 77, 109, 0.2);
  color: #ff4d6d;
}

/* spinning icon */
.banner--reconnecting .banner__icon {
  animation: spin 1.2s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.banner__msg { flex: 1; }

.banner__retry {
  background: rgba(255, 77, 109, 0.15);
  border: 1px solid rgba(255, 77, 109, 0.3);
  color: #ff4d6d;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.banner__retry:hover {
  background: rgba(255, 77, 109, 0.25);
}


.banner-enter-active,
.banner-leave-active {
  transition: all 0.3s ease;
}
.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>