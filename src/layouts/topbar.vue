<template>
  <header class="topbar" ref="topbarRef">
    <!--  greeting -->
    <div class="topbar__left">
      <h1 class="topbar__title">Dashboard</h1>
      <span class="topbar__sub">{{ currentTime }}</span>
    </div>

    <!-- controls -->
    <div class="topbar__right">
      <!-- Time range selector -->
      <div class="time-range">
        <button
          v-for="range in timeRanges"
          :key="range.value"
          class="time-btn"
          :class="{ 'time-btn--active': metricsStore.timeRange === range.value }"
          @click="metricsStore.setTimeRange(range.value)"
        >
          {{ range.label }}
        </button>
      </div>

      <!-- pause and resume -->
      <button class="control-btn" @click="emit('toggleStream')">
        <component
          :is="dashboardStore.status === 'live' ? Pause : Play"
          :size="15"
        />
        <span>{{ dashboardStore.status === 'live' ? 'Pause' : 'Resume' }}</span>
      </button>

      <!--  bell -->
      <button class="icon-btn" style="position:relative">
        <Bell :size="18" />
        <span v-if="activityStore.criticalCount > 0" class="alert-pip">
          {{ activityStore.criticalCount }}
        </span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { Bell, Pause, Play } from 'lucide-vue-next'
import { useMetricsStore } from "../stores/metricStore"
import { useActivityStore } from '../stores/activityStore'
import { useDashboardStore } from '../stores/dashboardStore'
import type { TimeRange } from '../types'

const emit = defineEmits<{ toggleStream: [] }>()

const metricsStore   = useMetricsStore()
const activityStore  = useActivityStore()
const dashboardStore = useDashboardStore()
const topbarRef      = ref<HTMLElement | null>(null)

const timeRanges: { label: string; value: TimeRange }[] = [
  { label: '1m',  value: '1m'  },
  { label: '5m',  value: '5m'  },
  { label: '15m', value: '15m' },
  { label: '1h',  value: '1h'  },
]

//  clock
const currentTime = ref('')
let clockInterval: ReturnType<typeof setInterval>

const updateClock = () => {
  currentTime.value = new Date().toLocaleTimeString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  })
}

onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)

  // slide down from top
  gsap.from(topbarRef.value, {
    y: -40,
    opacity: 0,
    duration: 0.6,
    ease: 'power3.out',
    delay: 0.2,
  })
})

onUnmounted(() => clearInterval(clockInterval))
</script>

<style scoped>
.topbar {
  height: 64px;
  border-bottom: 1px solid #1e1e26;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #0c0c0e;
  flex-shrink: 0;
}

.topbar__title {
  font-size: 16px;
  font-weight: 600;
  color: #f0f0f0;
}

.topbar__sub {
  font-size: 11px;
  color: #6b7280;
  font-family: 'JetBrains Mono', monospace;
}

.topbar__left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.topbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
}


.time-range {
  display: flex;
  background: #141418;
  border: 1px solid #1e1e26;
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}

.time-btn {
  padding: 4px 12px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.time-btn--active {
  background: #e8f542;
  color: #0c0c0e;
  font-weight: 700;
}


.control-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: #141418;
  border: 1px solid #1e1e26;
  border-radius: 10px;
  color: #f0f0f0;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  border-color: #e8f542;
  color: #e8f542;
}

.icon-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #141418;
  border: 1px solid #1e1e26;
  border-radius: 10px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover { color: #f0f0f0; }

.alert-pip {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ff4d6d;
  color: white;
  font-size: 9px;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>