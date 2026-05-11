import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { StreamStatus } from '../types'

export const useDashboardStore = defineStore('dashboard', () => {
  const status       = ref<StreamStatus>('paused')
  const sidebarOpen  = ref(true)
  const errorMessage = ref<string | null>(null)

  const setStatus       = (s: StreamStatus)     => { status.value = s }
  const setErrorMessage = (m: string | null)    => { errorMessage.value = m }
  const toggleSidebar   = ()                    => { sidebarOpen.value = !sidebarOpen.value }

return { status, sidebarOpen, errorMessage, setStatus, setErrorMessage, toggleSidebar }
})