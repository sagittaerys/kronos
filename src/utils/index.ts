import { type EventSeverity, type EventCategory, type ActivityEvent } from '../types'


export const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max)


export const randomWalk = (
  current: number,
  min: number,
  max: number,
  step: number = 5
): number => {
  const delta = (Math.random() - 0.5) * 2 * step
  return clamp(current + delta, min, max)
}

// generate unique id's for events
export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`


// order of priority map
export const severityConfig: Record<EventSeverity, { color: string; bg: string; label: string }> = {
  critical: { color: '#ff4d6d', bg: 'rgba(255,77,109,0.12)', label: 'Critical' },
  warning:  { color: '#f5a623', bg: 'rgba(245,166,35,0.12)',  label: 'Warning'  },
  info:     { color: '#4fffb0', bg: 'rgba(79,255,176,0.12)', label: 'Info'     },
  success:  { color: '#e8f542', bg: 'rgba(232,245,66,0.12)', label: 'Success'  },
}


export const categoryIcon: Record<EventCategory, string> = {
  security:    'shield-alert',
  performance: 'zap',
  deployment:  'rocket',
  network:     'wifi',
  system:      'cpu',
}

// time stamp
export const formatTime = (ts: number): string => {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

// the format relative to time 
export const formatRelative = (ts: number): string => {
  const diff = Date.now() - ts
  if (diff < 5000)   return 'just now'
  if (diff < 60000)  return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return `${Math.floor(diff / 3600000)}h ago`
}

// time
export const timeRangeToPoints: Record<string, number> = {
  '1m':  60,
  '5m':  300,
  '15m': 900,
  '1h':  3600,
}


// activity event generation logic for simulating realistic events in the feed
const eventMessages: Record<EventCategory, Array<{ severity: EventSeverity; template: string }>> = {
  security: [
    { severity: 'critical', template: 'Brute force attempt detected on {source}' },
    { severity: 'warning',  template: 'Unusual login pattern from {source}' },
    { severity: 'info',     template: 'SSL certificate renewed on {source}' },
  ],
  performance: [
    { severity: 'warning',  template: 'CPU spike to {value}% on {source}' },
    { severity: 'info',     template: 'Cache hit rate improved on {source}' },
    { severity: 'success',  template: 'Response time normalized on {source}' },
  ],
  deployment: [
    { severity: 'success',  template: 'Build deployed successfully to {source}' },
    { severity: 'critical', template: 'Deployment rollback triggered on {source}' },
    { severity: 'info',     template: 'Health check passed on {source}' },
  ],
  network: [
    { severity: 'warning',  template: 'Packet loss detected on {source}' },
    { severity: 'critical', template: 'Node unreachable: {source}' },
    { severity: 'info',     template: 'Bandwidth optimized on {source}' },
  ],
  system: [
    { severity: 'warning',  template: 'Memory pressure on {source}' },
    { severity: 'success',  template: 'Garbage collection completed on {source}' },
    { severity: 'info',     template: 'Config reload on {source}' },
  ],
}

const sources = [
  'server-01', 'server-02', 'server-03',
  'cdn-edge-1', 'cdn-edge-2',
  'db-primary', 'db-replica',
  'api-gateway', 'auth-service', 'worker-pool',
]

const categories = Object.keys(eventMessages) as EventCategory[]

export const generateEvent = (): ActivityEvent => {
  const category = categories[Math.floor(Math.random() * categories.length)]
  const options = eventMessages[category]
  const option = options[Math.floor(Math.random() * options.length)]
  const source = sources[Math.floor(Math.random() * sources.length)]
  const value = Math.floor(Math.random() * 100)

  return {
    id: generateId(),
    timestamp: Date.now(),
    severity: option.severity,
    category,
    source,
    value,
    message: option.template
      .replace('{source}', source)
      .replace('{value}', String(value)),
  }
}