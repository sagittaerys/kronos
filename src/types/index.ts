// core metric data
export interface MetricPoint {
  timestamp: number      
  cpu: number            
  memory: number        
  network: number        
  requests: number      
  errorRate: number     
  latency: number        
}


export type EventSeverity = 'critical' | 'warning' | 'info' | 'success'
export type EventCategory = 'security' | 'performance' | 'deployment' | 'network' | 'system'

export interface ActivityEvent {
  id: string
  timestamp: number
  severity: EventSeverity
  category: EventCategory
  message: string
  source: string        
  value?: number        
}


export interface StreamPayload {
  type: 'tick'
  metric: MetricPoint
  events: ActivityEvent[]  
}


export interface WorkerError {
  type: 'error'
  message: string
}


export type WorkerMessage = StreamPayload | WorkerError

// ui state
export type TimeRange = '1m' | '5m' | '15m' | '1h'
export type StreamStatus = 'live' | 'paused' | 'reconnecting' | 'error'

export interface DashboardState {
  status: StreamStatus
  timeRange: TimeRange
  selectedMetrics: Array<keyof Omit<MetricPoint, 'timestamp'>>
}

// chart series configuration -- this is basically what the chart component needs to know about each metric
export interface ChartSeries {
  key: keyof Omit<MetricPoint, 'timestamp'>
  label: string
  color: string
  unit: string
  max: number
}