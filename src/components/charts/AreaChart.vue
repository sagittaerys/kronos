<template>
  <div class="chart-wrap">
    <div class="chart-header">
      <div>
        <h3 class="chart-title">{{ title }}</h3>
        <p class="chart-sub">{{ subtitle }}</p>
      </div>
      <div class="chart-live-val">
        <span class="live-number" :style="{ color: series[0]?.color }">
          {{ currentVal }}
        </span>
        <span class="live-unit">{{ series[0]?.unit }}</span>
      </div>
    </div>

    <v-chart class="chart" :option="chartOption" :autoresize="true" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { formatTime } from '../../utils'
import type { MetricPoint, ChartSeries } from '../../types'

use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps<{
  title: string
  subtitle: string
  data: MetricPoint[]
  series: ChartSeries[]
}>()

const currentVal = computed(() => {
  const last = props.data[props.data.length - 1]
  if (!last || !props.series[0]) return '—'
  return (last[props.series[0].key] as number).toFixed(1)
})

const chartOption = computed(() => ({
  backgroundColor: 'transparent',
  grid: { top: 8, right: 8, bottom: 32, left: 48 },

  tooltip: {
    trigger: 'axis',
    backgroundColor: '#1a1a22',
    borderColor: '#1e1e26',
    textStyle: { color: '#f0f0f0', fontSize: 11 },
    formatter: (params: any[]) => {
      const p = params[0]
      return `<span style="color:#6b7280">${formatTime(p.axisValue)}</span><br/>
              <strong style="font-family:JetBrains Mono">${Number(p.value[1]).toFixed(2)}</strong>
              <span style="color:#6b7280"> ${props.series[0]?.unit}</span>`
    },
  },

  xAxis: {
    type: 'value',
    min: 'dataMin', max: 'dataMax',
    axisLabel: { show: false },
    axisLine: { lineStyle: { color: '#1e1e26' } },
    splitLine: { show: false },
  },

  yAxis: {
    type: 'value',
    axisLabel: { color: '#6b7280', fontSize: 10 },
    splitLine: { lineStyle: { color: '#1a1a22', type: 'dashed' } },
    axisLine: { show: false },
  },

  series: props.series.map(s => ({
    name: s.label,
    type: 'line',
    data: props.data.map(p => [p.timestamp, p[s.key]]),
    smooth: 0.6,
    symbol: 'none',
    lineStyle: { color: s.color, width: 2 },
    areaStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0,   color: s.color + '55' },
          { offset: 0.6, color: s.color + '11' },
          { offset: 1,   color: s.color + '00' },
        ],
      },
    },
    animationDuration: 0,
  })),
}))
</script>

<style scoped>
.chart-wrap {
  background: #141418;
  border: 1px solid #1e1e26;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #f0f0f0;
}

.chart-sub {
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
}

.chart-live-val {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.live-number {
  font-size: 22px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: -1px;
}

.live-unit {
  font-size: 11px;
  color: #6b7280;
}

.chart { height: 180px; width: 100%; }
</style>