<template>
  <div class="chart-wrap">
    <div class="chart-header">
      <div>
        <h3 class="chart-title">{{ title }}</h3>
        <p class="chart-sub">{{ subtitle }}</p>
      </div>
      <!-- Dataset toggles -->
      <div class="chart-legend">
        <button
          v-for="s in series"
          :key="s.key"
          class="legend-btn"
          :class="{ 'legend-btn--off': hiddenSeries.has(s.key) }"
          @click="toggleSeries(s.key)"
        >
          <span class="legend-dot" :style="{ background: s.color }" />
          {{ s.label }}
        </button>
      </div>
    </div>

    <v-chart
      class="chart"
      :option="chartOption"
      :autoresize="true"
      @click="onChartClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { LineChart as ELineChart } from 'echarts/charts'
import {
  GridComponent, TooltipComponent,
  LegendComponent, DataZoomComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { formatTime } from '../../utils'
import type { MetricPoint, ChartSeries } from '../../types'


use([ELineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer])

const props = defineProps<{
  title: string
  subtitle: string
  data: MetricPoint[]      
  series: ChartSeries[]   
}>()

const hiddenSeries = ref(new Set<string>())

const toggleSeries = (key: string) => {
  if (hiddenSeries.value.has(key)) {
    hiddenSeries.value.delete(key)
  } else {
    hiddenSeries.value.add(key)
  }

  hiddenSeries.value = new Set(hiddenSeries.value)
}

const onChartClick = (params: any) => {
  console.log('[KRONOS] Chart click:', params)
}

// echart
const chartOption = computed(() => ({
  backgroundColor: 'transparent',

  grid: {
    top: 16, right: 16, bottom: 40, left: 56,
  },

  tooltip: {
    trigger: 'axis',
    backgroundColor: '#1a1a22',
    borderColor: '#1e1e26',
    borderWidth: 1,
    textStyle: { color: '#f0f0f0', fontSize: 12 },
    axisPointer: {
      type: 'cross',
      lineStyle: { color: '#2a2a36' },
      crossStyle: { color: '#2a2a36' },
    },
    formatter: (params: any[]) => {
      const time = formatTime(params[0]?.axisValue)
      const rows = params
        .filter(p => !hiddenSeries.value.has(p.seriesId))
        .map(p => `
          <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
            <span style="width:8px;height:8px;border-radius:50%;background:${p.color};display:inline-block"></span>
            <span style="color:#6b7280">${p.seriesName}</span>
            <span style="margin-left:auto;font-family:JetBrains Mono;font-weight:600">${Number(p.value[1]).toFixed(1)}</span>
          </div>
        `).join('')
      return `<div style="font-size:11px;color:#6b7280;margin-bottom:2px">${time}</div>${rows}`
    },
  },

  xAxis: {
    type: 'value',
    min: 'dataMin',
    max: 'dataMax',
    axisLabel: {
      color: '#6b7280',
      fontSize: 10,
      formatter: (val: number) => formatTime(val),
      interval: 'auto',
    },
    axisLine:  { lineStyle: { color: '#1e1e26' } },
    splitLine: { lineStyle: { color: '#1a1a22' } },
  },

  yAxis: {
    type: 'value',
    axisLabel: {
      color: '#6b7280',
      fontSize: 10,
      formatter: (val: number) => {
        const s = props.series[0]
        return s ? `${val}${s.unit}` : val
      },
    },
    axisLine:  { show: false },
    splitLine: { lineStyle: { color: '#1a1a22', type: 'dashed' } },
  },


  series: props.series.map(s => ({
    id: s.key,
    name: s.label,
    type: 'line',
    data: hiddenSeries.value.has(s.key)
      ? []
      : props.data.map(p => [p.timestamp, p[s.key]]),
    smooth: 0.4,         
    symbol: 'none',      
    lineStyle: { color: s.color, width: 2 },
    itemStyle: { color: s.color },
   
    areaStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: s.color + '30' },
          { offset: 1, color: s.color + '00' },
        ],
      },
    },

    animation: true,
    animationDuration: 0,          
    animationEasing: 'linear',
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
  gap: 16px;
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
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

.chart-legend {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.legend-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #1e1e26;
  background: transparent;
  color: #f0f0f0;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.legend-btn--off {
  opacity: 0.35;
  text-decoration: line-through;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.chart {
  height: 220px;
  width: 100%;
}
</style>