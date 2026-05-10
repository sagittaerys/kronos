import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { StreamStatus } from "../types"

export const useDashboardStore = defineStore('dashboard', () => {
  const status = ref<StreamStatus>('paused')
  const sidebarOpen = ref(true)

  const setStatus = (s: StreamStatus) => { status.value = s }
  const toggleSidebar = () => { sidebarOpen.value = !sidebarOpen.value }

  return { status, sidebarOpen, setStatus, toggleSidebar }
})