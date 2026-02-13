<template>
  <transition name="fade">
    <div v-if="show" class="confirm-overlay" @click.self="cancel">
      <div class="confirm-dialog d365-card">
        <div class="confirm-header">
          <h3 class="confirm-title">{{ title }}</h3>
          <button class="confirm-close" @click="cancel">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M3.5 2.086L7 5.586l3.5-3.5L11.914 3.5 8.414 7l3.5 3.5-1.414 1.414L7 8.414l-3.5 3.5L2.086 10.5l3.5-3.5-3.5-3.5L3.5 2.086z"/>
            </svg>
          </button>
        </div>
        <div class="confirm-body">
          <p>{{ message }}</p>
        </div>
        <div class="confirm-footer">
          <button class="btn-secondary" @click="cancel">Cancel</button>
          <button class="btn-primary" :class="{ 'btn-danger': danger }" @click="confirm">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  props: {
    show: { type: Boolean, default: false },
    title: { type: String, default: 'Confirm' },
    message: { type: String, default: 'Are you sure?' },
    confirmText: { type: String, default: 'Confirm' },
    danger: { type: Boolean, default: false }
  },
  methods: {
    confirm() {
      this.$emit('confirm')
    },
    cancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.confirm-dialog {
  width: 420px;
  max-width: 90vw;
}
.confirm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #EDEBE9;
}
.confirm-title {
  font-size: 18px;
  font-weight: 600;
  color: #323130;
  margin: 0;
}
.confirm-close {
  background: none;
  border: none;
  color: #605E5C;
  cursor: pointer;
  padding: 4px;
  border-radius: 2px;
}
.confirm-close:hover {
  background: #F3F2F1;
}
.confirm-body {
  padding: 20px;
  font-size: 14px;
  color: #323130;
}
.confirm-body p { margin: 0; }
.confirm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #EDEBE9;
}
.btn-primary {
  padding: 6px 20px;
  background: #0078D4;
  color: white;
  border: none;
  border-radius: 2px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}
.btn-primary:hover { background: #106EBE; }
.btn-primary.btn-danger { background: #D13438; }
.btn-primary.btn-danger:hover { background: #A4262C; }
.btn-secondary {
  padding: 6px 20px;
  background: white;
  color: #323130;
  border: 1px solid #8A8886;
  border-radius: 2px;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
}
.btn-secondary:hover { background: #F3F2F1; }
</style>
