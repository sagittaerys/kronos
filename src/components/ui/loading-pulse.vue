<template>
  <div class="loading-wrap">
    <div class="pulse-grid">
      <div v-for="n in 6" :key="n" class="pulse-block" :style="{ animationDelay: `${n * 0.1}s` }" />
    </div>
    <p class="loading-label">Connecting to stream...</p>
  </div>
</template>

<style scoped>
.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 60px 0;
}

.pulse-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 180px;
}

.pulse-block {
  height: 48px;
  border-radius: 10px;
  background: #1a1a22;
  animation: shimmer 1.4s ease-in-out infinite alternate;
}

@keyframes shimmer {
  0%   { opacity: 0.3; }
  100% { opacity: 0.8; }
}

.loading-label {
  font-size: 12px;
  color: #6b7280;
  font-family: 'JetBrains Mono', monospace;
}
</style>