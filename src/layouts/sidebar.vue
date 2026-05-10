<template>
 <aside 
  class="sidebar" 
  ref="sidebarRef"
  :style="{ width: collapsed ? '64px' : '240px' }"
>
    <!-- logo -->
    <div class="sidebar__logo">
      <img
        src="/kronos-logo.png"
        alt="KRONOS"
        class="logo-img"
        :class="{ 'logo-img--collapsed': collapsed }"
      />
    </div>

    <!-- nav -->
    <nav class="sidebar__nav">
      <span class="nav-section-label" v-if="!collapsed">MONITOR</span>
      <button
        v-for="item in navItems"
        :key="item.id"
        class="nav-item"
        :class="{ 'nav-item--active': activeNav === item.id }"
        @click="activeNav = item.id"
      >
        <!-- dynamic icon -->
        <component :is="item.icon" :size="18" />
        <span v-if="!collapsed" class="nav-item__label">{{ item.label }}</span>
        <!-- notif badge -->
        <span v-if="item.badge && !collapsed" class="nav-badge">
          {{ item.badge }}
        </span>
      </button>
    </nav>

    <!-- bottom section -->
    <div class="sidebar__bottom">
      <div class="stream-status" v-if="!collapsed">
        <KStatusDot :status="dashboardStore.status" />
        <span class="status-label">
          {{ statusLabel }}
        </span>
      </div>

      <!-- collapse toggle -->
      <button class="collapse-btn" @click="emit('toggle')">
        <PanelLeftClose v-if="!collapsed" :size="16" />
        <PanelLeftOpen v-else :size="16" />
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { gsap } from "gsap";
import {
  LayoutDashboard,
  Activity,
  Wifi,
  Shield,
  Cpu,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-vue-next";
import KStatusDot from "../components/ui/status-dot.vue";
import { useDashboardStore } from "../stores/dashboardStore";

defineProps<{ collapsed: boolean }>();
const emit = defineEmits<{ toggle: [] }>();

const dashboardStore = useDashboardStore();
const sidebarRef = ref<HTMLElement | null>(null);
const activeNav = ref("dashboard");

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null },
  { id: "activity", label: "Activity", icon: Activity, badge: null },
  { id: "network", label: "Network", icon: Wifi, badge: null },
  { id: "security", label: "Security", icon: Shield, badge: 3 },
  { id: "compute", label: "Compute", icon: Cpu, badge: null },
  { id: "analytics", label: "Analytics", icon: BarChart3, badge: null },
  { id: "settings", label: "Settings", icon: Settings, badge: null },
];

const statusLabel = computed(
  () =>
    ({
      live: "Streaming live",
      paused: "Stream paused",
      reconnecting: "Reconnecting...",
      error: "Stream error",
    })[dashboardStore.status],
);

// gsap
onMounted(() => {
  gsap.from(sidebarRef.value, {
    x: -80,
    opacity: 0,
    duration: 0.7,
    ease: "power3.out",
  });
});
</script>

<style scoped>
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: #0f0f13;
  border-right: 1px solid #1e1e26;
  display: flex;
  flex-direction: column;
  padding: 24px 12px;
  gap: 8px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.logo-img {
  height: 55px;
  width: 100%;
  /* border: 1px solid red; */
  object-fit: contain;
  transition: all 0.3s ease;
}

.logo-img--collapsed {
  height: 32px;
  width: 32px;
  /* border: 1px solid red; */
  object-fit: cover;
  object-position: left center;
}

/* Logo */
.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px 24px;
  border-bottom: 1px solid #1e1e26;
  margin-bottom: 16px;
}

/* Nav */
.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.nav-section-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #6b7280;
  padding: 0 12px;
  margin-bottom: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  position: relative;
}

.nav-item:hover {
  background: #1a1a22;
  color: #f0f0f0;
}

.nav-item--active {
  background: rgba(232, 245, 66, 0.08);
  color: #e8f542;
}

.nav-item--active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 20%;
  height: 60%;
  width: 3px;
  background: #e8f542;
  border-radius: 0 3px 3px 0;
}

.nav-badge {
  margin-left: auto;
  background: rgba(255, 77, 109, 0.15);
  color: #ff4d6d;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 999px;
}

/* Bottom */
.sidebar__bottom {
  border-top: 1px solid #1e1e26;
  padding-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 8px;
}

.stream-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  font-size: 12px;
  color: #6b7280;
}

.collapse-btn {
  background: #1a1a22;
  border: 1px solid #1e1e26;
  color: #6b7280;
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  transition: all 0.2s;
}

.collapse-btn:hover {
  color: #f0f0f0;
  background: #22222e;
}
</style>
