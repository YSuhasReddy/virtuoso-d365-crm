<template>
  <div class="kpi-card d365-card" @click="$emit('click')">
    <div class="kpi-header">
      <span class="kpi-label">{{ label }}</span>
      <span v-if="icon" class="kpi-icon" v-html="icon"></span>
    </div>
    <div class="kpi-value" :class="valueClass">{{ formattedValue }}</div>
    <div v-if="subtitle" class="kpi-subtitle">{{ subtitle }}</div>
    <div v-if="trend !== null" class="kpi-trend" :class="trendClass">
      <svg v-if="trend > 0" width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 2l4 4H7v4H5V6H2l4-4z"/></svg>
      <svg v-else-if="trend < 0" width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 10L2 6h3V2h2v4h3l-4 4z"/></svg>
      <span>{{ Math.abs(trend) }}%</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KpiCard',
  props: {
    label: { type: String, required: true },
    value: { type: [Number, String], required: true },
    format: { type: String, default: 'number' },
    subtitle: { type: String, default: '' },
    icon: { type: String, default: '' },
    trend: { type: Number, default: null },
    valueClass: { type: String, default: '' }
  },
  computed: {
    formattedValue() {
      if (this.format === 'currency') {
        return '$' + parseFloat(this.value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
      }
      if (this.format === 'percent') {
        return this.value + '%'
      }
      if (typeof this.value === 'number') {
        return this.value.toLocaleString()
      }
      return this.value
    },
    trendClass() {
      if (this.trend > 0) return 'trend-up'
      if (this.trend < 0) return 'trend-down'
      return ''
    }
  }
}
</script>

<style scoped>
.kpi-card {
  padding: 16px 20px;
  cursor: pointer;
  transition: box-shadow 0.15s ease;
}
.kpi-card:hover {
  box-shadow: 0 3.2px 7.2px rgba(0, 0, 0, 0.18);
}
.kpi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.kpi-label {
  font-size: 12px;
  font-weight: 600;
  color: #605E5C;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.kpi-icon {
  color: #0078D4;
}
.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: #323130;
  line-height: 1.2;
}
.kpi-subtitle {
  font-size: 12px;
  color: #605E5C;
  margin-top: 4px;
}
.kpi-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px;
  padding: 2px 6px;
  border-radius: 2px;
}
.trend-up {
  color: #107C10;
  background: #DFF6DD;
}
.trend-down {
  color: #D13438;
  background: #FDE7E9;
}
</style>
