<template>
  <div class="chart-wrap">
    <div class="chart-header">
      <div>
        <h3 class="chart-title">{{ title }}</h3>
        <p class="chart-sub">{{ subtitle }}</p>
      </div>
    </div>
    <v-chart class="chart" :option="chartOption" :autoresize="true" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { BarChart as EBarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { formatTime } from '../../utils'
import type { MetricPoint, ChartSeries } from '../../types'

use([EBarChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps<{
  title: string
  subtitle: string
  data: MetricPoint[]
  series: ChartSeries[]
  maxBars?: number
}>()


const visibleData = computed(() =>
  props.data.slice(-(props.maxBars ?? 20))
)

const chartOption = computed(() => ({
  backgroundColor: 'transparent',
  grid: { top: 8, right: 8, bottom: 32, left: 56 },

  tooltip: {
    trigger: 'axis',
    backgroundColor: '#1a1a22',
    borderColor: '#1e1e26',
    textStyle: { color: '#f0f0f0', fontSize: 11 },
    formatter: (params: any[]) => {
      const p = params[0]
      return `<span style="color:#6b7280">${formatTime(p.axisValue)}</span><br/>
              <strong style="font-family:JetBrains Mono">${Number(p.value[1]).toFixed(1)}</strong>`
    },
  },

  xAxis: {
    type: 'value',
    min: 'dataMin', max: 'dataMax',
    axisLabel: {
      color: '#6b7280',
      fontSize: 10,
      formatter: (v: number) => formatTime(v),
      interval: 4,
    },
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
    type: 'bar',
    data: visibleData.value.map(p => [p.timestamp, p[s.key]]),
    barMaxWidth: 12,
    itemStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: s.color },
          { offset: 1, color: s.color + '44' },
        ],
      },
      borderRadius: [4, 4, 0, 0],  
    },
    animationDuration: 300,
    animationEasing: 'cubicOut',
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

.chart-header { display: flex; justify-content: space-between; }
.chart-title  { font-size: 14px; font-weight: 600; color: #f0f0f0; }
.chart-sub    { font-size: 11px; color: #6b7280; margin-top: 2px; }
.chart        { height: 200px; width: 100%; }
</style>