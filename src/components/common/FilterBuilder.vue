<template>
  <div class="filter-builder">
    <!-- Header -->
    <div class="filter-header">
      <span class="filter-title">Filter</span>
      <button class="filter-close-btn" @click="$emit('close')" aria-label="Close filter panel">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- Conditions -->
    <div class="filter-conditions">
      <!-- Empty state -->
      <div v-if="!conditions.length" class="filter-empty">
        No filters applied. Click 'Add condition' to start filtering.
      </div>

      <!-- Condition rows -->
      <div v-for="(condition, index) in conditions" :key="index" class="condition-wrapper">
        <!-- Conjunction toggle (between rows, not before first) -->
        <div v-if="index > 0" class="conjunction-row">
          <div class="conjunction-toggle">
            <button
              class="conjunction-btn"
              :class="{ 'conjunction-btn-active': condition.conjunction === 'AND' }"
              @click="setConjunction(index, 'AND')"
            >AND</button>
            <button
              class="conjunction-btn"
              :class="{ 'conjunction-btn-active': condition.conjunction === 'OR' }"
              @click="setConjunction(index, 'OR')"
            >OR</button>
          </div>
        </div>

        <!-- Condition row -->
        <div class="condition-row">
          <!-- Field select -->
          <select
            class="condition-select condition-field"
            :value="condition.field"
            @change="updateCondition(index, 'field', $event.target.value)"
            aria-label="Filter field"
          >
            <option value="" disabled>Select field...</option>
            <option
              v-for="field in safeFields"
              :key="field.field"
              :value="field.field"
            >{{ field.label }}</option>
          </select>

          <!-- Operator select -->
          <select
            class="condition-select condition-operator"
            :value="condition.operator"
            @change="updateCondition(index, 'operator', $event.target.value)"
            :disabled="!condition.field"
            aria-label="Filter operator"
          >
            <option value="" disabled>Operator...</option>
            <option
              v-for="op in getOperatorsForField(condition.field)"
              :key="op.value"
              :value="op.value"
            >{{ op.label }}</option>
          </select>

          <!-- Value input (varies by type and operator) -->
          <template v-if="!isNoValueOperator(condition.operator)">
            <!-- Select type: dropdown -->
            <select
              v-if="getFieldType(condition.field) === 'select'"
              class="condition-select condition-value"
              :value="condition.value"
              @change="updateCondition(index, 'value', $event.target.value)"
              :disabled="!condition.operator"
              aria-label="Filter value"
            >
              <option value="" disabled>Select...</option>
              <option
                v-for="opt in getFieldOptions(condition.field)"
                :key="opt"
                :value="opt"
              >{{ opt }}</option>
            </select>

            <!-- Date type: date input -->
            <input
              v-else-if="getFieldType(condition.field) === 'date' && !isRelativeDateOperator(condition.operator)"
              type="date"
              class="condition-input condition-value"
              :value="condition.value"
              @input="updateCondition(index, 'value', $event.target.value)"
              :disabled="!condition.operator"
              aria-label="Filter value"
            />

            <!-- Number type: number input -->
            <input
              v-else-if="getFieldType(condition.field) === 'number'"
              type="number"
              class="condition-input condition-value"
              :value="condition.value"
              @input="updateCondition(index, 'value', $event.target.value)"
              :disabled="!condition.operator"
              placeholder="Value..."
              aria-label="Filter value"
            />

            <!-- String type (default): text input -->
            <input
              v-else-if="!isRelativeDateOperator(condition.operator)"
              type="text"
              class="condition-input condition-value"
              :value="condition.value"
              @input="updateCondition(index, 'value', $event.target.value)"
              :disabled="!condition.operator"
              placeholder="Value..."
              aria-label="Filter value"
            />

            <!-- Relative date operators (today, this week, etc) need no value -->
            <span v-else class="condition-no-value"></span>
          </template>
          <span v-else class="condition-no-value"></span>

          <!-- Remove button -->
          <button
            class="condition-remove-btn"
            @click="removeCondition(index)"
            aria-label="Remove condition"
            title="Remove condition"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Add condition -->
    <div class="filter-add-row">
      <button
        class="filter-add-btn"
        :disabled="isMaxReached"
        @click="addCondition"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        </svg>
        Add condition
      </button>
      <span v-if="isMaxReached" class="filter-max-msg">Maximum {{ maxConditions }} conditions reached</span>
    </div>

    <!-- Action buttons -->
    <div class="filter-actions">
      <button class="filter-apply-btn" @click="handleApply" :disabled="!hasValidConditions">
        Apply
      </button>
      <button class="filter-clear-btn" @click="handleClear" :disabled="!conditions.length">
        Clear all
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilterBuilder',

  props: {
    fields: {
      type: Array,
      default: function () { return [] }
    },
    value: {
      type: Array,
      default: function () { return [] }
    },
    maxConditions: {
      type: Number,
      default: 10
    }
  },

  data: function () {
    return {
      conditions: this.initConditions()
    }
  },

  computed: {
    safeFields: function () {
      return Array.isArray(this.fields) ? this.fields : []
    },

    isMaxReached: function () {
      return this.conditions.length >= this.maxConditions
    },

    hasValidConditions: function () {
      return this.conditions.some(function (c) {
        return c.field && c.operator
      })
    }
  },

  watch: {
    value: {
      deep: true,
      handler: function (newVal) {
        if (Array.isArray(newVal)) {
          this.conditions = newVal.map(function (c) {
            return {
              field: c.field || '',
              operator: c.operator || '',
              value: c.value != null ? c.value : '',
              conjunction: c.conjunction || 'AND'
            }
          })
        }
      }
    }
  },

  methods: {
    initConditions: function () {
      if (!Array.isArray(this.value) || this.value.length === 0) return []
      return this.value.map(function (c) {
        return {
          field: c.field || '',
          operator: c.operator || '',
          value: c.value != null ? c.value : '',
          conjunction: c.conjunction || 'AND'
        }
      })
    },

    addCondition: function () {
      if (this.isMaxReached) return
      this.conditions.push({
        field: '',
        operator: '',
        value: '',
        conjunction: 'AND'
      })
    },

    removeCondition: function (index) {
      this.conditions.splice(index, 1)
      this.emitChange()
    },

    updateCondition: function (index, key, val) {
      var condition = this.conditions[index]
      if (!condition) return

      condition[key] = val

      // Reset operator and value when field changes
      if (key === 'field') {
        condition['operator'] = ''
        condition['value'] = ''
      }

      // Reset value when operator changes to a no-value or relative-date operator
      if (key === 'operator') {
        if (this.isNoValueOperator(val) || this.isRelativeDateOperator(val)) {
          condition['value'] = ''
        }
      }

      this.emitChange()
    },

    setConjunction: function (index, val) {
      if (this.conditions[index]) {
        this.conditions[index]['conjunction'] = val
        this.emitChange()
      }
    },

    emitChange: function () {
      var output = this.conditions.map(function (c) {
        return {
          field: c.field,
          operator: c.operator,
          value: c.value,
          conjunction: c.conjunction
        }
      })
      this.$emit('change', output)
    },

    handleApply: function () {
      this.emitChange()
      this.$emit('apply')
    },

    handleClear: function () {
      this.conditions = []
      this.$emit('change', [])
      this.$emit('clear')
    },

    getFieldConfig: function (fieldName) {
      if (!fieldName) return null
      var fields = this.safeFields
      for (var i = 0; i < fields.length; i++) {
        if (fields[i].field === fieldName) return fields[i]
      }
      return null
    },

    getFieldType: function (fieldName) {
      var config = this.getFieldConfig(fieldName)
      return config ? (config.type || 'string') : 'string'
    },

    getFieldOptions: function (fieldName) {
      var config = this.getFieldConfig(fieldName)
      return config && Array.isArray(config.options) ? config.options : []
    },

    getOperatorsForField: function (fieldName) {
      var type = this.getFieldType(fieldName)

      var operatorSets = {
        'string': [
          { value: 'equals', label: 'Equals' },
          { value: 'contains', label: 'Contains' },
          { value: 'begins_with', label: 'Begins with' },
          { value: 'ends_with', label: 'Ends with' },
          { value: 'is_empty', label: 'Is empty' },
          { value: 'is_not_empty', label: 'Is not empty' }
        ],
        'number': [
          { value: 'equals', label: 'Equals' },
          { value: 'greater_than', label: 'Greater than' },
          { value: 'less_than', label: 'Less than' },
          { value: 'between', label: 'Between' },
          { value: 'is_empty', label: 'Is empty' }
        ],
        'date': [
          { value: 'equals', label: 'Equals' },
          { value: 'before', label: 'Before' },
          { value: 'after', label: 'After' },
          { value: 'between', label: 'Between' },
          { value: 'today', label: 'Today' },
          { value: 'this_week', label: 'This week' },
          { value: 'this_month', label: 'This month' },
          { value: 'is_empty', label: 'Is empty' }
        ],
        'select': [
          { value: 'equals', label: 'Equals' },
          { value: 'not_equals', label: 'Not equals' },
          { value: 'is_empty', label: 'Is empty' }
        ]
      }

      return operatorSets[type] || operatorSets['string']
    },

    isNoValueOperator: function (operator) {
      var noValueOps = ['is_empty', 'is_not_empty']
      return noValueOps.indexOf(operator) !== -1
    },

    isRelativeDateOperator: function (operator) {
      var relativeOps = ['today', 'this_week', 'this_month']
      return relativeOps.indexOf(operator) !== -1
    }
  }
}
</script>

<style scoped>
.filter-builder {
  background: #FFFFFF;
  border: 1px solid #EDEBE9;
  border-radius: 2px;
  box-shadow: 0 1.6px 3.6px rgba(0, 0, 0, 0.132), 0 0.3px 0.9px rgba(0, 0, 0, 0.108);
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  min-width: 320px;
  max-width: 720px;
}

/* Header */
.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #EDEBE9;
}
.filter-title {
  font-size: 14px;
  font-weight: 600;
  color: #323130;
}
.filter-close-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  color: #605E5C;
  transition: background-color 0.1s ease;
}
.filter-close-btn:hover {
  background: #F3F2F1;
}
.filter-close-btn:focus {
  outline: 2px solid #0078D4;
  outline-offset: -2px;
}

/* Conditions area */
.filter-conditions {
  padding: 12px 16px;
  max-height: 360px;
  overflow-y: auto;
}

/* Empty state */
.filter-empty {
  font-size: 13px;
  color: #A19F9D;
  text-align: center;
  padding: 16px 0;
  line-height: 1.5;
}

/* Conjunction toggle */
.conjunction-row {
  display: flex;
  align-items: center;
  padding: 6px 0;
}
.conjunction-toggle {
  display: inline-flex;
  border: 1px solid #EDEBE9;
  border-radius: 2px;
  overflow: hidden;
}
.conjunction-btn {
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #605E5C;
  background: #FFFFFF;
  border: none;
  cursor: pointer;
  transition: all 0.1s ease;
  font-family: inherit;
}
.conjunction-btn:first-child {
  border-right: 1px solid #EDEBE9;
}
.conjunction-btn:hover {
  background: #F3F2F1;
}
.conjunction-btn-active {
  background: #0078D4;
  color: #FFFFFF;
}
.conjunction-btn-active:hover {
  background: #106EBE;
}

/* Condition row */
.condition-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 4px 0;
}

/* Shared input/select styling */
.condition-select,
.condition-input {
  height: 32px;
  padding: 4px 8px;
  font-size: 13px;
  font-family: inherit;
  color: #323130;
  background: #FFFFFF;
  border: 1px solid #EDEBE9;
  border-radius: 2px;
  outline: none;
  transition: border-color 0.1s ease;
}
.condition-select:hover:not(:disabled),
.condition-input:hover:not(:disabled) {
  border-color: #C8C6C4;
}
.condition-select:focus,
.condition-input:focus {
  border-color: #0078D4;
}
.condition-select:disabled,
.condition-input:disabled {
  background: #F3F2F1;
  border-color: #EDEBE9;
  color: #A19F9D;
  cursor: not-allowed;
}

.condition-field {
  min-width: 120px;
  flex: 1;
  max-width: 180px;
}
.condition-operator {
  min-width: 100px;
  flex: 0.8;
  max-width: 150px;
}
.condition-value {
  min-width: 100px;
  flex: 1;
  max-width: 180px;
}
.condition-no-value {
  flex: 1;
  min-width: 100px;
  max-width: 180px;
}

/* Select dropdown arrow */
.condition-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23605E5C' d='M2.5 4.5l3.5 3.5 3.5-3.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 28px;
}

/* Remove button */
.condition-remove-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  color: #A19F9D;
  flex-shrink: 0;
  transition: all 0.1s ease;
}
.condition-remove-btn:hover {
  background: #FDE7E9;
  color: #D13438;
}
.condition-remove-btn:focus {
  outline: 2px solid #0078D4;
  outline-offset: -2px;
}

/* Add condition */
.filter-add-row {
  padding: 4px 16px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  font-size: 13px;
  color: #0078D4;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  transition: color 0.1s ease;
}
.filter-add-btn:hover:not(:disabled) {
  color: #106EBE;
  text-decoration: underline;
}
.filter-add-btn:disabled {
  color: #A19F9D;
  cursor: not-allowed;
}
.filter-add-btn:disabled:hover {
  text-decoration: none;
}
.filter-max-msg {
  font-size: 11px;
  color: #A19F9D;
}

/* Action buttons */
.filter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid #EDEBE9;
}
.filter-apply-btn {
  padding: 6px 20px;
  font-size: 13px;
  font-weight: 600;
  color: #FFFFFF;
  background: #0078D4;
  border: 1px solid #0078D4;
  border-radius: 2px;
  cursor: pointer;
  font-family: inherit;
  transition: background-color 0.1s ease;
}
.filter-apply-btn:hover:not(:disabled) {
  background: #106EBE;
  border-color: #106EBE;
}
.filter-apply-btn:active:not(:disabled) {
  background: #005A9E;
}
.filter-apply-btn:disabled {
  background: #F3F2F1;
  border-color: #EDEBE9;
  color: #A19F9D;
  cursor: not-allowed;
}
.filter-apply-btn:focus {
  outline: 2px solid #0078D4;
  outline-offset: 2px;
}

.filter-clear-btn {
  padding: 6px 12px;
  font-size: 13px;
  color: #605E5C;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.1s ease;
}
.filter-clear-btn:hover:not(:disabled) {
  color: #323130;
  text-decoration: underline;
}
.filter-clear-btn:disabled {
  color: #C8C6C4;
  cursor: not-allowed;
}
.filter-clear-btn:disabled:hover {
  text-decoration: none;
}
</style>
