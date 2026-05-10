<template>
  <div class="app-shell">
    <KSidebar
      :collapsed="sidebarCollapsed"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />

    <div class="app-main" :class="{ 'app-main--expanded': sidebarCollapsed }">
      <KTopbar @toggle-stream="streamWorker.toggle()" />

      <main class="app-content" ref="contentRef">
        <!-- Cards animate in on mount via GSAP stagger -->
        <div class="placeholder-grid">
          <div
            v-for="n in 6"
            :key="n"
            class="placeholder-card"
            ref="cardRefs"
          >
            <span style="color:#6b7280;font-size:13px;">Chart {{ n }} coming in Step 4</span>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import KSidebar from './layouts/sidebar.vue'
import KTopbar from './layouts/topbar.vue'
import { useStreamWorker } from  "../src/workers/useStreamWorkers"

const sidebarCollapsed = ref(false)
const cardRefs = ref<HTMLElement[]>([])
const streamWorker = useStreamWorker()

onMounted(() => {
  // Start the data stream immediately
  streamWorker.start()

  // GSAP staggered card entrance — the Finomic effect
  // Each card scales up from 0.92 and fades in, 80ms apart
  gsap.from(cardRefs.value, {
    opacity: 0,
    scale: 0.92,
    y: 20,
    duration: 0.6,
    ease: 'power3.out',
    stagger: 0.08,   // 80ms between each card
    delay: 0.4,      // wait for sidebar + topbar to animate first
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
  min-width: 0;   /* prevents flex overflow */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* Placeholder grid — replaced with real charts in Step 4 */
.placeholder-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.placeholder-card {
  background: #141418;
  border: 1px solid #1e1e26;
  border-radius: 16px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>