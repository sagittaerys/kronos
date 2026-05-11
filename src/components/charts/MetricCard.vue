<template>
  <div class="metric-card" ref="cardRef">
  
    
    <div class="metric-card__header">
      <div class="metric-icon" :style="{ background: iconBg }">
        <component :is="icon" :size="16" :style="{ color: color }" />
      </div>
      <div class="metric-delta" :class="deltaClass">
        <component :is="deltaIcon" :size="12" />
        <span>{{ Math.abs(delta).toFixed(1) }}%</span>
      </div>
    </div>

    <!-- value -->
    <div class="metric-card__value">
      <span class="metric-number" ref="numberRef">{{ displayValue }}</span>
      <span class="metric-unit">{{ unit }}</span>
    </div>

    <!-- label -->
    <div class="metric-card__label">{{ label }}</div>

    <!-- sparkline -->
    <div class="metric-card__spark">
      <svg :viewBox="`0 0 100 30`" preserveAspectRatio="none" class="spark-svg">
        <defs>
          <linearGradient :id="`spark-grad-${uid}`" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="color" stop-opacity="0.4" />
            <stop offset="100%" :stop-color="color" stop-opacity="0" />
          </linearGradient>
        </defs>
        <!-- fill -->
        <path :d="areaPath" :fill="`url(#spark-grad-${uid})`" />
        <!-- line -->
        <path :d="linePath" :stroke="color" stroke-width="1.5" fill="none" stroke-linecap="round" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { gsap } from 'gsap'
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'
import type { Component } from 'vue'

// uid
const uid = Math.random().toString(36).slice(2, 7)

const props = defineProps<{
  metric: string 
  label: string
  value: number        
  previous: number    
  unit: string
  color: string
  icon: Component
  history: number[]    
  decimals?: number
}>()

// const cardRef   = ref<HTMLElement | null>(null)
// const numberRef = ref<HTMLElement | null>(null)

const displayValue = ref(props.value.toFixed(props.decimals ?? 1))


const delta = computed(() => {
  if (!props.previous) return 0
  return ((props.value - props.previous) / props.previous) * 100
})

const deltaClass = computed(() => {
  if (Math.abs(delta.value) < 0.1) return 'delta--neutral'
  return delta.value > 0 ? 'delta--up' : 'delta--down'
})

const deltaIcon = computed(() => {
  if (Math.abs(delta.value) < 0.1) return Minus
  return delta.value > 0 ? TrendingUp : TrendingDown
})

const iconBg = computed(() =>
  props.color + '18'   
)


const buildPaths = (values: number[]) => {
  if (values.length < 2) return { linePath: '', areaPath: '' }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

 
  const points = values.map((v, i) => ({
    x: (i / (values.length - 1)) * 100,
    y: 30 - ((v - min) / range) * 26 + 2,  
  }))

  
  const line = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`
    const prev = points[i - 1]
    const cpx = (prev.x + pt.x) / 2
    return `${acc} C ${cpx} ${prev.y} ${cpx} ${pt.y} ${pt.x} ${pt.y}`
  }, '')


  const area = `${line} L 100 30 L 0 30 Z`

  return { linePath: line, areaPath: area }
}

const linePath = computed(() => buildPaths(props.history).linePath)
const areaPath = computed(() => buildPaths(props.history).areaPath)


watch(() => props.value, (newVal) => {
 
  const obj = { val: parseFloat(displayValue.value) }
  gsap.to(obj, {
    val: newVal,
    duration: 0.8,
    ease: 'power2.out',
    onUpdate: () => {
      displayValue.value = obj.val.toFixed(props.decimals ?? 1)
    },
  })
})

onMounted(() => {

  const obj = { val: 0 }
  gsap.to(obj, {
    val: props.value,
    duration: 1.2,
    ease: 'power3.out',
    delay: 0.3,
    onUpdate: () => {
      displayValue.value = obj.val.toFixed(props.decimals ?? 1)
    },
  })
})
</script>

<style scoped>
.metric-card {
  background: #141418;
  border: 1px solid #1e1e26;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s, transform 0.2s;
  cursor: default;
}

.metric-card:hover {
  border-color: #2a2a36;
  transform: translateY(-2px);
}

.metric-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metric-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}


.metric-delta {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
}

.delta--up      { color: #4fffb0; background: rgba(79,255,176,0.1);  }
.delta--down    { color: #ff4d6d; background: rgba(255,77,109,0.1);  }
.delta--neutral { color: #6b7280; background: rgba(107,114,128,0.1); }


.metric-card__value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 4px;
}

.metric-number {
  font-size: 28px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: #f0f0f0;
  line-height: 1;
  letter-spacing: -1px;
}

.metric-unit {
  font-size: 12px;
  color: #6b7280;
  font-family: 'JetBrains Mono', monospace;
}

.metric-card__label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}


.metric-card__spark {
  margin-top: 8px;
  height: 40px;
}

.spark-svg {
  width: 100%;
  height: 100%;
}

@media (max-width: 767px) {
  .metric-card {
    padding: 14px 12px;
    border-radius: 14px;
  }

  .metric-number {
    font-size: 22px;
  }

  .metric-card__label {
    font-size: 11px;
  }

  .metric-icon {
    width: 28px;
    height: 28px;
  }

  .metric-delta {
    font-size: 10px;
    padding: 2px 6px;
  }

  .metric-card__spark {
    margin-top: 4px;
    height: 32px;
  }
}
</style>