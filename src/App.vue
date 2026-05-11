<template>
  <div class="app-shell">
    <KSidebar
      :collapsed="sidebarCollapsed"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />

    <div class="app-main">
      <KTopbar @toggle-stream="streamWorker.toggle()" />

      <main class="app-content">

  
        <StreamStatusBanner @retry="streamWorker.start()" />

        
        <KLoadingPulse v-if="!latest" />

        <template v-else>

          <!-- metric cards -->
          <div class="metrics-grid">
            <MetricCard
              v-for="card in metricCards"
              :key="card.metric"
              v-bind="card"
              :value="latest?.[card.metric] ?? 0"
              :previous="previous?.[card.metric] ?? 0"
              :history="history(card.metric)"
            />
          </div>

         
          <div class="charts-row">
            <LineChart
              title="System Performance"
              subtitle="CPU & Memory over time"
              :data="visiblePoints"
              :series="[
                { key: 'cpu',    label: 'CPU',    color: '#e8f542', unit: '%',  max: 100 },
                { key: 'memory', label: 'Memory', color: '#4fffb0', unit: '%',  max: 100 },
              ]"
            />
            <AreaChart
              title="Network Throughput"
              subtitle="MB/s live"
              :data="visiblePoints"
              :series="[
                { key: 'network', label: 'Network', color: '#4fffb0', unit: 'MB/s', max: 1000 },
              ]"
            />
          </div>

          <div class="charts-row charts-row--reverse">
            <AreaChart
              title="Request Rate"
              subtitle="Requests per second"
              :data="visiblePoints"
              :series="[
                { key: 'requests', label: 'Req/s', color: '#e8f542', unit: 'req/s', max: 2000 },
              ]"
            />
            <BarChart
              title="Latency Distribution"
              subtitle="Response time ms"
              :data="visiblePoints"
              :series="[
                { key: 'latency', label: 'Latency', color: '#f5a623', unit: 'ms', max: 500 },
              ]"
            />
          </div>

          <!-- activity feed -->
          <ActivityFeed />

        </template>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { gsap } from 'gsap'
import { Cpu, MemoryStick, Wifi, Zap, AlertTriangle, Timer } from 'lucide-vue-next'

import KSidebar            from './layouts/sidebar.vue'
import KTopbar             from './layouts/topbar.vue'
import MetricCard          from './components/charts/MetricCard.vue'
import LineChart           from './components/charts/LineChart.vue'
import AreaChart           from './components/charts/AreaChart.vue'
import BarChart            from './components/charts/BarChart.vue'
// import ActivityFeed        from './components/feed/ActivityFeed.vue'
import StreamStatusBanner  from './components/ui/stream-banner.vue'
import KLoadingPulse       from './components/ui/loading-pulse.vue'

import { useStreamWorker }   from './workers/useStreamWorkers'
import { useMetricsStore }   from './stores/metricStore'
import { useDashboardStore } from './stores/dashboardStore'

const streamWorker   = useStreamWorker()
const metricsStore   = useMetricsStore()
const dashboardStore = useDashboardStore()

const sidebarCollapsed = computed({
  get: () => !dashboardStore.sidebarOpen,
  set: () => dashboardStore.toggleSidebar(),
})

const visiblePoints = computed(() => metricsStore.visiblePoints)
const latest        = computed(() => metricsStore.latest)
const previous      = computed(() => metricsStore.previous)

const history = (metric: string) =>
  metricsStore.buffer.slice(-20).map(p => p[metric as keyof typeof p] as number)

const metricCards = [
  { metric: 'cpu'       as const, label: 'CPU Usage',  unit: '%',     color: '#e8f542', icon: Cpu,           decimals: 1 },
  { metric: 'memory'    as const, label: 'Memory',     unit: '%',     color: '#4fffb0', icon: MemoryStick,   decimals: 1 },
  { metric: 'network'   as const, label: 'Network',    unit: 'MB/s',  color: '#4fffb0', icon: Wifi,          decimals: 0 },
  { metric: 'requests'  as const, label: 'Requests/s', unit: 'req/s', color: '#e8f542', icon: Zap,           decimals: 0 },
  { metric: 'errorRate' as const, label: 'Error Rate', unit: '%',     color: '#ff4d6d', icon: AlertTriangle, decimals: 2 },
  { metric: 'latency'   as const, label: 'Latency',    unit: 'ms',    color: '#f5a623', icon: Timer,         decimals: 0 },
]

onMounted(() => {
  streamWorker.start()

  // wait for v-else to mount before animating
  // nextTick isn't needed here — GSAP targets by class so
  // it will pick them up whenever they appear in the DOM
  gsap.from('.metrics-grid > *', {
    opacity: 0, scale: 0.92, y: 16,
    duration: 0.6, ease: 'power3.out',
    stagger: 0.07, delay: 0.5,
  })

  gsap.from('.charts-row', {
    opacity: 0, y: 24,
    duration: 0.7, ease: 'power3.out',
    stagger: 0.12, delay: 0.8,
  })

  gsap.from('.feed-wrap', {
    opacity: 0, y: 24,
    duration: 0.7, ease: 'power3.out',
    delay: 1.1,
  })
})
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background: #0c0c0e;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.app-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Metric cards ── */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

/* ── Chart rows ── */
.charts-row {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}

/* ── Tablet ── */
@media (min-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* ── Desktop ── */
@media (min-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(6, 1fr);
  }

  .charts-row {
    grid-template-columns: 2fr 1fr;
  }

  .charts-row--reverse {
    grid-template-columns: 1fr 2fr;
  }
}

/* ── Mobile ── */
@media (max-width: 767px) {
  .app-content {
    padding: 10px 8px;
    gap: 8px;
  }

  .metrics-grid {
    gap: 6px;
  }
}
</style>