import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { timeRangeToPoints } from "../utils"
import type { MetricPoint, TimeRange } from "../types"

export const useMetricsStore = defineStore('metrics', () => {
  // ---------------------------
  // State — ref() is like useState() in React
  // ---------------------------
  const buffer = ref<MetricPoint[]>([])   // circular buffer of all points
  const timeRange = ref<TimeRange>('5m')

  // ---------------------------
  // Computed — like useMemo() in React
  // Auto-recalculates when buffer or timeRange changes
  // ---------------------------
  const maxPoints = computed(() => timeRangeToPoints[timeRange.value])

  // Only return the points that fit in the selected time range
  const visiblePoints = computed(() =>
    buffer.value.slice(-maxPoints.value)
  )

  // Latest single reading — for MetricCards
  const latest = computed(() =>
    buffer.value[buffer.value.length - 1] ?? null
  )

  // Previous reading — for delta calculation (↑↓ arrows on cards)
  const previous = computed(() =>
    buffer.value[buffer.value.length - 2] ?? null
  )

  // ---------------------------
  // Actions — equivalent to store reducers/actions
  // ---------------------------
  const pushMetric = (point: MetricPoint) => {
    buffer.value.push(point)

    // Circular buffer — trim oldest data beyond max capacity
    // This prevents memory from growing forever
    const hardCap = timeRangeToPoints['1h']  // never store more than 1h
    if (buffer.value.length > hardCap) {
      buffer.value = buffer.value.slice(-hardCap)
    }
  }

  const setTimeRange = (range: TimeRange) => {
    timeRange.value = range
  }

  return {
    buffer,
    timeRange,
    visiblePoints,
    latest,
    previous,
    maxPoints,
    pushMetric,
    setTimeRange,
  }
})