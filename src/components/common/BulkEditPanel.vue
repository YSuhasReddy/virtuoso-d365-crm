<template>
  <transition name="slide-right">
    <div v-if="show" class="bulk-edit-backdrop" @click.self="$emit('close')">
      <div class="bulk-edit-panel">
        <div class="panel-header">
          <h3 class="panel-title">Bulk Edit &mdash; {{ records.length }} {{ entityName }}{{ records.length !== 1 ? 's' : '' }}</h3>
          <button class="panel-close" @click="$emit('close')">&times;</button>
        </div>

        <div class="panel-body">
          <p class="panel-description">
            Select the fields you want to update. The new values will be applied to all {{ records.length }} selected record{{ records.length !== 1 ? 's' : '' }}.
          </p>

          <div class="bulk-fields">
            <div v-for="field in fields" :key="field.field" class="bulk-field-row">
              <label class="bulk-field-check">
                <input type="checkbox" v-model="enabledFields" :value="field.field" />
                <span class="bulk-field-label">{{ field.label }}</span>
              </label>

              <div v-if="isEnabled(field.field)" class="bulk-field-input">
                <!-- text input -->
                <input
                  v-if="field.type === 'text'"
                  type="text"
                  class="d365-field-input"
                  v-model="fieldValues[field.field]"
                  :placeholder="'New ' + field.label"
                />
                <!-- select -->
                <select
                  v-else-if="field.type === 'select'"
                  class="d365-field-input"
                  v-model="fieldValues[field.field]"
                >
                  <option value="">Select {{ field.label }}</option>
                  <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
                </select>
                <!-- number -->
                <input
                  v-else-if="field.type === 'number'"
                  type="number"
                  class="d365-field-input"
                  v-model.number="fieldValues[field.field]"
                  :placeholder="'New ' + field.label"
                />
                <!-- date -->
                <input
                  v-else-if="field.type === 'date'"
                  type="date"
                  class="d365-field-input"
                  v-model="fieldValues[field.field]"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="panel-footer">
          <button
            class="d365-cmd-btn primary"
            :disabled="enabledFields.length === 0"
            @click="applyChanges"
          >
            Apply to {{ records.length }} Record{{ records.length !== 1 ? 's' : '' }}
          </button>
          <button class="d365-cmd-btn" @click="$emit('close')">Cancel</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'BulkEditPanel',

  props: {
    show: {
      type: Boolean,
      default: false
    },
    records: {
      type: Array,
      default: function () { return [] }
    },
    fields: {
      type: Array,
      default: function () { return [] }
    },
    entityName: {
      type: String,
      default: 'Record'
    }
  },

  data: function () {
    return {
      enabledFields: [],
      fieldValues: {}
    }
  },

  watch: {
    show: function (val) {
      if (val) {
        // Reset state when panel opens
        this.enabledFields = []
        this.fieldValues = {}
        this.initFieldValues()
      }
    }
  },

  methods: {
    initFieldValues: function () {
      var values = {}
      this.fields.forEach(function (field) {
        values[field.field] = ''
      })
      this.fieldValues = values
    },

    isEnabled: function (fieldName) {
      return this.enabledFields.indexOf(fieldName) !== -1
    },

    applyChanges: function () {
      var updates = {}
      var self = this
      this.enabledFields.forEach(function (field) {
        if (self.fieldValues[field] !== undefined && self.fieldValues[field] !== '') {
          updates[field] = self.fieldValues[field]
        }
      })

      if (Object.keys(updates).length > 0) {
        self.$emit('apply', {
          updates: updates,
          recordIds: self.records.map(function (r) { return r.id })
        })
      }
    }
  }
}
</script>

<style scoped>
/* Backdrop overlay */
.bulk-edit-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

/* Slide-in panel */
.bulk-edit-panel {
  width: 400px;
  max-width: 100vw;
  height: 100vh;
  background: #FFFFFF;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  min-height: 48px;
  padding: 0 16px;
  background: #FAFAFA;
  border-bottom: 1px solid #EDEBE9;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: #323130;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panel-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #605E5C;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 2px;
  line-height: 1;
  flex-shrink: 0;
}
.panel-close:hover {
  background: #EDEBE9;
  color: #323130;
}

/* Body */
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.panel-description {
  font-size: 13px;
  color: #605E5C;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

/* Bulk edit fields */
.bulk-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bulk-field-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #FAFAFA;
  border: 1px solid #EDEBE9;
  border-radius: 4px;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.bulk-field-row:hover {
  border-color: #C8C6C4;
}

.bulk-field-check {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.bulk-field-check input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #0078D4;
  cursor: pointer;
  flex-shrink: 0;
}

.bulk-field-label {
  font-size: 13px;
  font-weight: 600;
  color: #323130;
}

.bulk-field-input {
  padding-left: 24px;
}

.bulk-field-input .d365-field-input {
  width: 100%;
  padding: 6px 10px;
  font-size: 13px;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #323130;
  background: #FFFFFF;
  border: 1px solid #C8C6C4;
  border-radius: 2px;
  outline: none;
  transition: border-color 0.15s ease;
  box-sizing: border-box;
}

.bulk-field-input .d365-field-input:focus {
  border-color: #0078D4;
  box-shadow: 0 0 0 1px #0078D4;
}

.bulk-field-input select.d365-field-input {
  appearance: auto;
  cursor: pointer;
}

/* Footer */
.panel-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #EDEBE9;
  background: #FFFFFF;
  flex-shrink: 0;
}

.panel-footer .d365-cmd-btn {
  padding: 6px 16px;
  font-size: 13px;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  border: 1px solid #C8C6C4;
  border-radius: 2px;
  cursor: pointer;
  background: #FFFFFF;
  color: #323130;
  transition: background-color 0.1s ease, border-color 0.1s ease;
  white-space: nowrap;
}

.panel-footer .d365-cmd-btn:hover {
  background: #F3F2F1;
}

.panel-footer .d365-cmd-btn.primary {
  background: #0078D4;
  border-color: #0078D4;
  color: #FFFFFF;
}

.panel-footer .d365-cmd-btn.primary:hover {
  background: #106EBE;
  border-color: #106EBE;
}

.panel-footer .d365-cmd-btn.primary:disabled {
  background: #C8C6C4;
  border-color: #C8C6C4;
  color: #FFFFFF;
  cursor: not-allowed;
}

/* Slide-right transition */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: opacity 0.3s ease;
}
.slide-right-enter-active .bulk-edit-panel,
.slide-right-leave-active .bulk-edit-panel {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
}

.slide-right-enter-from .bulk-edit-panel,
.slide-right-leave-to .bulk-edit-panel {
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 480px) {
  .bulk-edit-panel {
    width: 100vw;
  }
}
</style>
