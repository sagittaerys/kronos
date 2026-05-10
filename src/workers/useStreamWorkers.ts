import { ref, onUnmounted } from 'vue'
import { useMetricsStore } from "../stores/metricStore"
import { useActivityStore } from "../stores/activityStore"
import { useDashboardStore } from "../stores/dashboardStore"
import type { WorkerMessage } from "../types"


export const useStreamWorker = () => {
  const metricsStore   = useMetricsStore()
  const activityStore  = useActivityStore()
  const dashboardStore = useDashboardStore()


  const worker = ref<Worker | null>(null)

  const start = () => {
    if (worker.value) return   

  
    worker.value = new Worker(
      new URL('../workers/dataStream.worker.ts', import.meta.url),
      { type: 'module' }
    )

  
    worker.value.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const data = e.data

      // chart and field updates 
      if (data.type === 'tick') {
        metricsStore.pushMetric(data.metric)      
        activityStore.pushEvents(data.events)    
      }

      if (data.type === 'error') {
        dashboardStore.setStatus('error')
        console.error('[KRONOS Worker]', data.message)
      }
    }

    worker.value.onerror = () => {
      dashboardStore.setStatus('reconnecting')
    }

    worker.value.postMessage({ command: 'start' })
    dashboardStore.setStatus('live')
  }

  const stop = () => {
    worker.value?.postMessage({ command: 'stop' })
    dashboardStore.setStatus('paused')
  }

  const toggle = () => {
    dashboardStore.status === 'live' ? stop() : start()
  }

  
  onUnmounted(() => {
    worker.value?.postMessage({ command: 'stop' })
    worker.value?.terminate()   
    worker.value = null
  })

  return { start, stop, toggle }
}