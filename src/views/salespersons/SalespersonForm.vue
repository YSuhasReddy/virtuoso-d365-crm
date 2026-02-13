<template>
  <div class="salesperson-form-view">
    <!-- Breadcrumb -->
    <div class="px-4 pt-3">
      <Breadcrumb :items="breadcrumbs" />
    </div>

    <!-- Page Header -->
    <div class="page-header px-4 pb-2">
      <h1 class="page-title">{{ isEditMode ? 'Edit Salesperson' : 'New Salesperson' }}</h1>
    </div>

    <!-- Command Bar -->
    <CommandBar
      :actions="commandActions"
      :show-view-switcher="false"
      :show-filter="false"
      @save="handleSave"
      @discard="handleDiscard"
    />

    <!-- Form Content -->
    <div class="form-content px-4 py-4">
      <!-- Validation Error -->
      <div v-if="validationError" class="validation-error">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#D13438">
          <path d="M8 1a7 7 0 110 14A7 7 0 018 1zM5.354 5.354a.5.5 0 00-.708.708L7.293 8l-2.647 2.646a.5.5 0 00.708.708L8 8.707l2.646 2.647a.5.5 0 00.708-.708L8.707 8l2.647-2.646a.5.5 0 00-.708-.708L8 7.293 5.354 4.646z"/>
        </svg>
        <span>{{ validationError }}</span>
      </div>

      <div class="form-grid">
        <!-- Left Column -->
        <div class="form-column">
          <div class="section-card d365-card">
            <div class="section-header">Salesperson Information</div>
            <div class="section-body">

              <div v-if="isEditMode" class="d365-field-group">
                <label class="d365-field-label">Code</label>
                <input
                  :value="form.id"
                  type="text"
                  class="d365-field-input"
                  disabled
                />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Name <span class="required">*</span></label>
                <input
                  v-model="form.name"
                  type="text"
                  class="d365-field-input"
                  :class="{ 'input-error': !form.name && submitted }"
                  placeholder="Enter salesperson name"
                />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Email <span class="required">*</span></label>
                <input
                  v-model="form.email"
                  type="email"
                  class="d365-field-input"
                  :class="{ 'input-error': !form.email && submitted }"
                  placeholder="email@virtuoso.com"
                />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Phone</label>
                <input
                  v-model="form.phone"
                  type="text"
                  class="d365-field-input"
                  placeholder="+1-555-0000"
                />
              </div>

            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="form-column">
          <div class="section-card d365-card">
            <div class="section-header">Role &amp; Target</div>
            <div class="section-body">

              <div class="d365-field-group">
                <label class="d365-field-label">Role <span class="required">*</span></label>
                <select
                  v-model="form.role"
                  class="d365-field-input"
                  :class="{ 'input-error': !form.role && submitted }"
                >
                  <option value="">-- Select Role --</option>
                  <option value="Sales Manager">Sales Manager</option>
                  <option value="Senior Sales Rep">Senior Sales Rep</option>
                  <option value="Sales Representative">Sales Representative</option>
                  <option value="Junior Sales Rep">Junior Sales Rep</option>
                </select>
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Sales Target <span class="required">*</span></label>
                <div class="currency-input-wrapper">
                  <span class="currency-prefix">$</span>
                  <input
                    v-model.number="form.target"
                    type="number"
                    class="d365-field-input currency-input"
                    :class="{ 'input-error': (!form.target && form.target !== 0) && submitted }"
                    placeholder="0.00"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Saving Overlay -->
    <div v-if="saving" class="saving-overlay">
      <div class="saving-indicator">
        <div class="saving-spinner"></div>
        <span class="saving-text">Saving...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import CommandBar from '@/components/layout/CommandBar.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'

export default {
  name: 'SalespersonForm',
  components: {
    CommandBar,
    Breadcrumb
  },
  data: function () {
    return {
      form: {
        id: '',
        name: '',
        email: '',
        phone: '',
        role: '',
        target: 0
      },
      submitted: false,
      validationError: '',
      saving: false
    }
  },
  computed: {
    ...mapGetters('salespersons', ['getSalespersonById', 'allSalespersons']),

    isEditMode: function () {
      return !!this.$route.params.id
    },

    existingSalesperson: function () {
      if (this.isEditMode) {
        return this.getSalespersonById(this.$route.params.id)
      }
      return null
    },

    breadcrumbs: function () {
      var crumbs = [
        { label: 'Home', path: '/dashboard' },
        { label: 'Salespersons', path: '/salespersons' }
      ]
      if (this.isEditMode && this.existingSalesperson) {
        crumbs.push({ label: this.existingSalesperson.name, path: '/salespersons/' + this.existingSalesperson.id })
        crumbs.push({ label: 'Edit' })
      } else {
        crumbs.push({ label: 'New' })
      }
      return crumbs
    },

    commandActions: function () {
      return [
        {
          id: 'save',
          label: this.saving ? 'Saving...' : 'Save',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M12.5 1H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V3.5L12.5 1zM8 13a2 2 0 110-4 2 2 0 010 4zM11 5H3V2h8v3z"/></svg>',
          primary: true,
          disabled: this.saving,
          event: 'save'
        },
        {
          id: 'discard',
          label: 'Discard',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 2.086L8 6.586l4.5-4.5L13.914 3.5 9.414 8l4.5 4.5-1.414 1.414L8 9.414l-4.5 4.5L2.086 12.5l4.5-4.5-4.5-4.5L3.5 2.086z"/></svg>',
          disabled: this.saving,
          event: 'discard'
        }
      ]
    }
  },
  created: function () {
    if (this.isEditMode && this.existingSalesperson) {
      this.loadExistingSalesperson()
    }
    this.$root.$on('shortcut-save', this.handleSave)
    this._escHandler = this.handleEscape.bind(this)
    document.addEventListener('keydown', this._escHandler)
  },
  beforeDestroy: function () {
    this.$root.$off('shortcut-save', this.handleSave)
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler)
    }
  },
  watch: {
    existingSalesperson: function (newVal) {
      if (newVal && this.isEditMode) {
        this.loadExistingSalesperson()
      }
    }
  },
  methods: {
    ...mapActions('salespersons', ['addSalesperson', 'updateSalesperson']),

    loadExistingSalesperson: function () {
      var sp = this.existingSalesperson
      if (!sp) return
      this.form = {
        id: sp.id || '',
        name: sp.name || '',
        email: sp.email || '',
        phone: sp.phone || '',
        role: sp.role || '',
        target: sp.target || 0
      }
    },

    validate: function () {
      this.validationError = ''
      if (!this.form.name || !this.form.name.trim()) {
        this.validationError = 'Name is required.'
        return false
      }
      if (!this.form.email || !this.form.email.trim()) {
        this.validationError = 'Email is required.'
        return false
      }
      if (!this.form.role) {
        this.validationError = 'Role is required.'
        return false
      }
      if (this.form.target === null || this.form.target === undefined || this.form.target === '') {
        this.validationError = 'Sales target is required.'
        return false
      }
      return true
    },

    generateId: function () {
      // Find the highest existing SP number and increment
      var maxNum = 0
      this.allSalespersons.forEach(function (sp) {
        var match = (sp.id || '').match(/SP-(\d+)/)
        if (match) {
          var num = parseInt(match[1], 10)
          if (num > maxNum) {
            maxNum = num
          }
        }
      })
      var nextNum = maxNum + 1
      var padded = ('000' + nextNum).slice(-3)
      return 'SP-' + padded
    },

    handleSave: function () {
      var self = this
      if (this.saving) return

      this.submitted = true

      if (!this.validate()) {
        return
      }

      this.saving = true

      var spData = {
        name: this.form.name.trim(),
        email: this.form.email.trim(),
        phone: this.form.phone.trim(),
        role: this.form.role,
        target: parseFloat(this.form.target) || 0
      }

      // Brief delay to show the saving indicator
      setTimeout(function () {
        if (self.isEditMode) {
          spData.id = self.existingSalesperson.id
          self.updateSalesperson(spData)
          self.$store.dispatch('ui/addAlert', {
            type: 'success',
            title: 'Salesperson updated',
            message: '"' + spData.name + '" has been updated successfully.',
            duration: 3000
          })
          self.saving = false
          self.$router.push('/salespersons/' + spData.id)
        } else {
          spData.id = self.generateId()
          spData.createdAt = new Date().toISOString()
          spData.updatedAt = new Date().toISOString()
          self.addSalesperson(spData)
          self.$store.dispatch('ui/addAlert', {
            type: 'success',
            title: 'Salesperson created',
            message: '"' + spData.name + '" has been created successfully.',
            duration: 3000
          })
          self.saving = false
          self.$router.push('/salespersons/' + spData.id)
        }
      }, 300)
    },

    handleDiscard: function () {
      if (this.isEditMode && this.existingSalesperson) {
        this.$router.push('/salespersons/' + this.existingSalesperson.id)
      } else {
        this.$router.push('/salespersons')
      }
    },

    handleEscape: function (e) {
      if (e.key === 'Escape') {
        this.handleDiscard()
      }
    }
  }
}
</script>

<style scoped>
.salesperson-form-view {
  min-height: 100%;
  position: relative;
}

.page-header {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #323130;
}

/* Validation Error */
.validation-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin-bottom: 12px;
  background: #FDE7E9;
  border: 1px solid #F1BBBC;
  border-radius: 2px;
  color: #D13438;
  font-size: 13px;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.section-card {
  overflow: hidden;
}

.section-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #323130;
  background: #FAFAFA;
  border-bottom: 1px solid #EDEBE9;
}

.section-body {
  padding: 16px;
}

.required {
  color: #D13438;
}

.input-error {
  border-color: #D13438 !important;
}

/* Currency Input */
.currency-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-prefix {
  position: absolute;
  left: 10px;
  font-size: 13px;
  color: #605E5C;
  pointer-events: none;
  z-index: 1;
}

.currency-input {
  padding-left: 24px !important;
}

/* Hide number input spinners */
.currency-input::-webkit-outer-spin-button,
.currency-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.currency-input[type=number] {
  -moz-appearance: textfield;
}

/* Saving Overlay */
.saving-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.saving-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: #FFFFFF;
  border: 1px solid #EDEBE9;
  border-radius: 4px;
  box-shadow: 0 3.2px 7.2px rgba(0, 0, 0, 0.13);
}

.saving-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #EDEBE9;
  border-top-color: #0078D4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.saving-text {
  font-size: 14px;
  font-weight: 600;
  color: #323130;
}

/* Responsive */
@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
