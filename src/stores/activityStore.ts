import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ActivityEvent, EventSeverity, EventCategory } from "../types"

// i dont want more than 200 in memory
const MAX_EVENTS = 200   

export const useActivityStore = defineStore('activity', () => {
  const events = ref<ActivityEvent[]>([])
  const filterSeverity = ref<EventSeverity | 'all'>('all')
  const filterCategory = ref<EventCategory | 'all'>('all')
  const searchQuery = ref('')

 
  const filteredEvents = computed(() => {
    return events.value.filter(e => {
      if (filterSeverity.value !== 'all' && e.severity !== filterSeverity.value) return false
      if (filterCategory.value !== 'all' && e.category !== filterCategory.value) return false
      if (searchQuery.value && !e.message.toLowerCase().includes(searchQuery.value.toLowerCase())) return false
      return true
    })
  })

  const criticalCount = computed(() =>
    events.value.filter(e => e.severity === 'critical').length
  )

  const pushEvents = (newEvents: ActivityEvent[]) => {
    if (!newEvents.length) return
   
    events.value = [...newEvents, ...events.value].slice(0, MAX_EVENTS)
  }

  const clearEvents = () => { events.value = [] }

  return {
    events,
    filteredEvents,
    filterSeverity,
    filterCategory,
    searchQuery,
    criticalCount,
    pushEvents,
    clearEvents,
  }
})