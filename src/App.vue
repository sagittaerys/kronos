<template>
  <div class="app-shell">
    <!-- Mobile backdrop overlay -->
    <Transition name="overlay">
      <div
        v-if="mobileMenuOpen"
        class="mobile-overlay"
        @click="mobileMenuOpen = false"
      />
    </Transition>

    <KSidebar
      :collapsed="sidebarCollapsed"
      :mobile-open="mobileMenuOpen"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />

    <div class="app-main">
      <KTopbar
        @toggle-stream="streamWorker.toggle()"
        @open-sidebar="mobileMenuOpen = true"
      />

      <main class="app-content">
        <!-- metric cards -->
        <div class="metrics-grid" ref="cardsRef">
          <MetricCard
            v-for="card in metricCards"
            :key="card.metric"
            v-bind="card"
            :value="latest?.[card.metric] ?? 0"
            :previous="previous?.[card.metric] ?? 0"
            :history="history(card.metric)"
          />
        </div>

        <!-- charts row 1 -->
        <div class="charts-row" ref="chartsRef">
          <LineChart
            title="System Performance"
            subtitle="CPU & Memory over time"
            :data="visiblePoints"
            :series="[
              {
                key: 'cpu',
                label: 'CPU',
                color: '#e8f542',
                unit: '%',
                max: 100,
              },
              {
                key: 'memory',
                label: 'Memory',
                color: '#4fffb0',
                unit: '%',
                max: 100,
              },
            ]"
            class="chart-wide"
          />
          <AreaChart
            title="Network Throughput"
            subtitle="MB/s live"
            :data="visiblePoints"
            :series="[
              {
                key: 'network',
                label: 'Network',
                color: '#4fffb0',
                unit: 'MB/s',
                max: 1000,
              },
            ]"
            class="chart-narrow"
          />
        </div>

        <!-- charts row 2 -->
        <div class="charts-row charts-row--reverse">
          <AreaChart
            title="Request Rate"
            subtitle="Requests per second"
            :data="visiblePoints"
            :series="[
              {
                key: 'requests',
                label: 'Req/s',
                color: '#e8f542',
                unit: 'req/s',
                max: 2000,
              },
            ]"
            class="chart-narrow"
          />
          <BarChart
            title="Latency Distribution"
            subtitle="Response time ms"
            :data="visiblePoints"
            :series="[
              {
                key: 'latency',
                label: 'Latency',
                color: '#f5a623',
                unit: 'ms',
                max: 500,
              },
            ]"
            class="chart-wide"
          />
        </div>

        <!-- activity feed -->
        <ActivityFeed />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { gsap } from "gsap";
import {
  Cpu,
  MemoryStick,
  Wifi,
  Zap,
  AlertTriangle,
  Timer,
} from "lucide-vue-next";
import KSidebar from "./layouts/sidebar.vue";
import KTopbar from "./layouts/topbar.vue";
import MetricCard from "./components/charts/MetricCard.vue";
import LineChart from "./components/charts/LineChart.vue";
import AreaChart from "./components/charts/AreaChart.vue";
import BarChart from "./components/charts/BarChart.vue";
// import ActivityFeed  from './components/feed/ActivityFeed.vue'
import { useStreamWorker } from "../src/workers/useStreamWorkers";
import { useMetricsStore } from "../src/stores/metricStore";

const streamWorker = useStreamWorker();
const metricsStore = useMetricsStore();

const sidebarCollapsed = ref(false);
const mobileMenuOpen = ref(false); // ← this was missing entirely
const cardsRef = ref<HTMLElement | null>(null);
const chartsRef = ref<HTMLElement | null>(null);

const visiblePoints = computed(() => metricsStore.visiblePoints);
const latest = computed(() => metricsStore.latest);
const previous = computed(() => metricsStore.previous);

const history = (metric: string) =>
  metricsStore.buffer
    .slice(-20)
    .map((p) => p[metric as keyof typeof p] as number);

const metricCards = [
  {
    metric: "cpu" as const,
    label: "CPU Usage",
    unit: "%",
    color: "#e8f542",
    icon: Cpu,
    decimals: 1,
  },
  {
    metric: "memory" as const,
    label: "Memory",
    unit: "%",
    color: "#4fffb0",
    icon: MemoryStick,
    decimals: 1,
  },
  {
    metric: "network" as const,
    label: "Network",
    unit: "MB/s",
    color: "#4fffb0",
    icon: Wifi,
    decimals: 0,
  },
  {
    metric: "requests" as const,
    label: "Requests/s",
    unit: "req/s",
    color: "#e8f542",
    icon: Zap,
    decimals: 0,
  },
  {
    metric: "errorRate" as const,
    label: "Error Rate",
    unit: "%",
    color: "#ff4d6d",
    icon: AlertTriangle,
    decimals: 2,
  },
  {
    metric: "latency" as const,
    label: "Latency",
    unit: "ms",
    color: "#f5a623",
    icon: Timer,
    decimals: 0,
  },
];

onMounted(() => {
  streamWorker.start();

  gsap.from(".metrics-grid > *", {
    opacity: 0,
    scale: 0.92,
    y: 16,
    duration: 0.6,
    ease: "power3.out",
    stagger: 0.07,
    delay: 0.3,
  });

  gsap.from(".charts-row", {
    opacity: 0,
    y: 24,
    duration: 0.7,
    ease: "power3.out",
    stagger: 0.12,
    delay: 0.6,
  });

  gsap.from(".feed-wrap", {
    opacity: 0,
    y: 24,
    duration: 0.7,
    ease: "power3.out",
    delay: 0.9,
  });
});
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


.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

@media (max-width: 767px) {
  .app-content {
    padding: 12px 10px;
    gap: 10px;
  }

  .metrics-grid {
    gap: 8px;
  }
}

/* Chart rows — stacked on mobile */
.charts-row {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}

/* Mobile overlay backdrop */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 40;
  backdrop-filter: blur(2px);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Tablet */
@media (min-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Desktop */
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
</style>
