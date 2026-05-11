import { ref, onUnmounted } from 'vue'
import { useMetricsStore   } from "../stores/metricStore"
import { useActivityStore  } from '../stores/activityStore'
import { useDashboardStore } from '../stores/dashboardStore'
import type { WorkerMessage } from '../types'

// Exponential backoff config
const BASE_DELAY  = 1000   // 1s first retry
const MAX_DELAY   = 30000  // cap at 30s
const MAX_RETRIES = 5

export const useStreamWorker = () => {
  const metricsStore   = useMetricsStore()
  const activityStore  = useActivityStore()
  const dashboardStore = useDashboardStore()

  const worker       = ref<Worker | null>(null)
  const retryCount   = ref(0)
  const retryTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

  // ---------------------------
  // Exponential backoff delay
  // 1s → 2s → 4s → 8s → 16s → capped at 30s
  // ---------------------------
  const getBackoffDelay = () =>
    Math.min(BASE_DELAY * Math.pow(2, retryCount.value), MAX_DELAY)

  const clearRetry = () => {
    if (retryTimeout.value) {
      clearTimeout(retryTimeout.value)
      retryTimeout.value = null
    }
  }

  const scheduleReconnect = () => {
    if (retryCount.value >= MAX_RETRIES) {
      dashboardStore.setStatus('error')
      dashboardStore.setErrorMessage(
        `Stream failed after ${MAX_RETRIES} attempts. Refresh to retry.`
      )
      return
    }

    dashboardStore.setStatus('reconnecting')
    const delay = getBackoffDelay()
    dashboardStore.setErrorMessage(
      `Reconnecting in ${Math.round(delay / 1000)}s... (attempt ${retryCount.value + 1}/${MAX_RETRIES})`
    )

    retryTimeout.value = setTimeout(() => {
      retryCount.value++
      boot()   // try again
    }, delay)
  }

  const boot = () => {
    
    if (worker.value) {
      worker.value.terminate()
      worker.value = null
    }

    worker.value = new Worker(
      new URL('../workers/dataStream.worker.ts', import.meta.url),
      { type: 'module' }
    )

    worker.value.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const data = e.data

      if (data.type === 'tick') {
        // Successful tick — reset retry counter
        if (retryCount.value > 0) retryCount.value = 0
        if (dashboardStore.status === 'reconnecting') {
          dashboardStore.setStatus('live')
          dashboardStore.setErrorMessage(null)
        }
        metricsStore.pushMetric(data.metric)
        activityStore.pushEvents(data.events)
      }

      if (data.type === 'error') {
        console.error('[KRONOS Worker]', data.message)
        dashboardStore.setErrorMessage(data.message)
        scheduleReconnect()
      }
    }

    worker.value.onerror = (e) => {
      console.error('[KRONOS Worker fatal]', e.message)
      scheduleReconnect()
    }

    worker.value.postMessage({ command: 'start' })
    dashboardStore.setStatus('live')
  }

  const start = () => {
    retryCount.value = 0
    boot()
  }

  const stop = () => {
    clearRetry()
    worker.value?.postMessage({ command: 'stop' })
    dashboardStore.setStatus('paused')
  }

  const toggle = () => {
    dashboardStore.status === 'live' ? stop() : start()
  }

  onUnmounted(() => {
    clearRetry()
    worker.value?.postMessage({ command: 'stop' })
    worker.value?.terminate()
    worker.value = null
  })

  return { start, stop, toggle }
}