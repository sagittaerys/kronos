import { randomWalk, generateEvent } from '../utils'
import type { MetricPoint, StreamPayload, WorkerError } from '../types'

let current: MetricPoint = {
  timestamp: Date.now(),
  cpu:       35,
  memory:    52,
  network:   180,
  requests:  420,
  errorRate: 2,
  latency:   45,
}

let intervalId: ReturnType<typeof setInterval> | null = null

const tick = () => {
  try {
    current = {
      timestamp:  Date.now(),
      cpu:        randomWalk(current.cpu,       0,    100,  8),
      memory:     randomWalk(current.memory,    20,   95,   3),
      network:    randomWalk(current.network,   0,    1000, 80),
      requests:   randomWalk(current.requests,  100,  2000, 120),
      errorRate:  randomWalk(current.errorRate, 0,    25,   2),
      latency:    randomWalk(current.latency,   5,    500,  30),
    }

    const eventCount = Math.random() < 0.6 ? 1 : Math.random() < 0.3 ? 2 : 0
    const events = Array.from({ length: eventCount }, generateEvent)

    const payload: StreamPayload = { type: 'tick', metric: current, events }
    self.postMessage(payload)

  } catch (err) {
   
    const error: WorkerError = {
      type: 'error',
      message: err instanceof Error ? err.message : 'Unknown worker error',
    }
    self.postMessage(error)
  }
}

self.addEventListener('message', (e: MessageEvent<{ command: 'start' | 'stop' }>) => {
  if (e.data.command === 'start') {
    if (intervalId !== null) return
    intervalId = setInterval(tick, 1000)
    tick()
  }

  if (e.data.command === 'stop') {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }
})