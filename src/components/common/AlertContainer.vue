<template>
  <div class="alert-container">
    <transition-group name="slide" tag="div">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="alert-item"
        :class="'alert-' + alert.type"
      >
        <div class="alert-icon">
          <svg v-if="alert.type === 'success'" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 110 14A7 7 0 018 1zm3.354 4.646a.5.5 0 00-.708 0L7 9.293 5.354 7.646a.5.5 0 10-.708.708l2 2a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z"/></svg>
          <svg v-else-if="alert.type === 'error'" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 110 14A7 7 0 018 1zM5.354 5.354a.5.5 0 00-.708.708L7.293 8l-2.647 2.646a.5.5 0 00.708.708L8 8.707l2.646 2.647a.5.5 0 00.708-.708L8.707 8l2.647-2.646a.5.5 0 00-.708-.708L8 7.293 5.354 4.646z"/></svg>
          <svg v-else-if="alert.type === 'warning'" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l7 14H1L8 1zm0 4a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 008 5zm0 8a1 1 0 100-2 1 1 0 000 2z"/></svg>
          <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 110 14A7 7 0 018 1zm0 3a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0v-4.5A.75.75 0 008 4zm0 8a1 1 0 100-2 1 1 0 000 2z"/></svg>
        </div>
        <div class="alert-content">
          <div v-if="alert.title" class="alert-title">{{ alert.title }}</div>
          <div v-if="alert.message" class="alert-message">{{ alert.message }}</div>
        </div>
        <button class="alert-close" @click="removeAlert(alert.id)">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M3.5 2.086L6 4.586l2.5-2.5L9.914 3.5 7.414 6l2.5 2.5-1.414 1.414L6 7.414l-2.5 2.5L2.086 8.5l2.5-2.5-2.5-2.5L3.5 2.086z"/></svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'AlertContainer',
  computed: {
    ...mapGetters('ui', ['alerts'])
  },
  methods: {
    ...mapActions('ui', ['removeAlert'])
  },
  watch: {
    alerts(newAlerts) {
      newAlerts.forEach(alert => {
        if (alert.duration && !alert._timerSet) {
          alert._timerSet = true
          setTimeout(() => {
            this.removeAlert(alert.id)
          }, alert.duration)
        }
      })
    }
  }
}
</script>

<style scoped>
.alert-container {
  position: fixed;
  top: 56px;
  right: 16px;
  z-index: 3000;
  width: 360px;
  max-width: calc(100vw - 32px);
}
.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: white;
  border-radius: 2px;
  border-left: 4px solid;
  box-shadow: 0 3.2px 7.2px rgba(0, 0, 0, 0.13);
}
.alert-success { border-left-color: #107C10; }
.alert-error { border-left-color: #D13438; }
.alert-warning { border-left-color: #FFB900; }
.alert-info { border-left-color: #0078D4; }

.alert-icon { flex-shrink: 0; margin-top: 1px; }
.alert-success .alert-icon { color: #107C10; }
.alert-error .alert-icon { color: #D13438; }
.alert-warning .alert-icon { color: #FFB900; }
.alert-info .alert-icon { color: #0078D4; }

.alert-content { flex: 1; }
.alert-title {
  font-size: 13px;
  font-weight: 600;
  color: #323130;
}
.alert-message {
  font-size: 12px;
  color: #605E5C;
  margin-top: 2px;
}
.alert-close {
  background: none;
  border: none;
  color: #A19F9D;
  cursor: pointer;
  padding: 2px;
  flex-shrink: 0;
}
.alert-close:hover { color: #323130; }

.slide-enter-active { transition: all 0.3s ease; }
.slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from { transform: translateX(100%); opacity: 0; }
.slide-leave-to { transform: translateX(100%); opacity: 0; }
</style>
