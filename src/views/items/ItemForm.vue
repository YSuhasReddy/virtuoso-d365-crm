<template>
  <div class="item-form-view">
    <!-- Breadcrumb -->
    <div class="px-4 pt-3">
      <Breadcrumb :items="breadcrumbs" />
    </div>

    <!-- Page Header -->
    <div class="page-header px-4 pb-2">
      <h1 class="page-title">{{ isEditMode ? 'Edit Item' : 'New Item' }}</h1>
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
            <div class="section-header">General Information</div>
            <div class="section-body">

              <div class="d365-field-group">
                <label class="d365-field-label">Name <span class="required">*</span></label>
                <input
                  v-model="form.name"
                  type="text"
                  class="d365-field-input"
                  :class="{ 'input-error': !form.name && submitted }"
                  placeholder="Enter item name"
                />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Description</label>
                <textarea
                  v-model="form.description"
                  class="d365-field-input description-textarea"
                  rows="3"
                  placeholder="Enter item description..."
                ></textarea>
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Type <span class="required">*</span></label>
                <select v-model="form.type" class="d365-field-input">
                  <option value="Inventory">Inventory</option>
                  <option value="Service">Service</option>
                  <option value="Non-Inventory">Non-Inventory</option>
                </select>
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Category <span class="required">*</span></label>
                <select v-model="form.category" class="d365-field-input">
                  <option value="">-- Select Category --</option>
                  <option value="Software">Software</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Services">Services</option>
                  <option value="Training">Training</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Vendor</label>
                <input v-model="form.vendor" type="text" class="d365-field-input" placeholder="Vendor name" />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Blocked</label>
                <select v-model="form.blocked" class="d365-field-input">
                  <option :value="false">No</option>
                  <option :value="true">Yes</option>
                </select>
              </div>

            </div>
          </div>

          <!-- Inventory Section (Conditional) -->
          <div v-if="form.type === 'Inventory'" class="section-card d365-card mt-3">
            <div class="section-header">Inventory</div>
            <div class="section-body">

              <div class="d365-field-group">
                <label class="d365-field-label">Quantity on Hand</label>
                <input v-model.number="form.inventory.quantity" type="number" class="d365-field-input" min="0" placeholder="0" />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Reorder Point</label>
                <input v-model.number="form.inventory.reorderPoint" type="number" class="d365-field-input" min="0" placeholder="0" />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Reorder Quantity</label>
                <input v-model.number="form.inventory.reorderQuantity" type="number" class="d365-field-input" min="0" placeholder="0" />
              </div>

            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="form-column">
          <div class="section-card d365-card">
            <div class="section-header">Pricing</div>
            <div class="section-body">

              <div class="d365-field-group">
                <label class="d365-field-label">Unit Price <span class="required">*</span></label>
                <input
                  v-model.number="form.unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  class="d365-field-input"
                  :class="{ 'input-error': (form.unitPrice === '' || form.unitPrice < 0) && submitted }"
                  placeholder="0.00"
                />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Unit Cost</label>
                <input v-model.number="form.unitCost" type="number" step="0.01" min="0" class="d365-field-input" placeholder="0.00" />
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Unit of Measure</label>
                <select v-model="form.unitOfMeasure" class="d365-field-input">
                  <option value="Each">Each</option>
                  <option value="Hour">Hour</option>
                  <option value="License">License</option>
                  <option value="Pack">Pack</option>
                </select>
              </div>

              <div class="d365-field-group">
                <label class="d365-field-label">Tax Group</label>
                <select v-model="form.taxGroup" class="d365-field-input">
                  <option value="Standard">Standard</option>
                  <option value="Reduced">Reduced</option>
                  <option value="Zero">Zero</option>
                </select>
              </div>

              <!-- Computed Profit Margin (Read Only) -->
              <div v-if="form.unitPrice > 0" class="d365-field-group">
                <label class="d365-field-label">Profit Margin</label>
                <div class="computed-value">{{ profitMargin }}%</div>
              </div>

            </div>
          </div>

          <!-- Attributes Section -->
          <div class="section-card d365-card mt-3">
            <div class="section-header">
              <span>Custom Attributes</span>
            </div>
            <div class="section-body">
              <div v-for="(attr, index) in form.attributes" :key="'attr-' + index" class="attribute-row">
                <input
                  v-model="attr.name"
                  type="text"
                  class="d365-field-input attr-input"
                  placeholder="Attribute name"
                />
                <input
                  v-model="attr.value"
                  type="text"
                  class="d365-field-input attr-input"
                  placeholder="Value"
                />
                <button class="attr-remove-btn" title="Remove attribute" @click="removeAttribute(index)">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <path d="M3.5 2.086L7 5.586l3.5-3.5L11.914 3.5 8.414 7l3.5 3.5-1.414 1.414L7 8.414l-3.5 3.5L2.086 10.5l3.5-3.5-3.5-3.5L3.5 2.086z"/>
                  </svg>
                </button>
              </div>
              <button class="add-attr-btn" @click="addAttribute">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>
                Add Attribute
              </button>
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
import eventBus from '../../utils/eventBus'

export default {
  name: 'ItemForm',
  components: {
    CommandBar,
    Breadcrumb
  },
  data: function () {
    return {
      form: {
        name: '',
        description: '',
        type: 'Service',
        category: '',
        unitPrice: 0,
        unitCost: 0,
        unitOfMeasure: 'Each',
        taxGroup: 'Standard',
        blocked: false,
        vendor: '',
        inventory: {
          quantity: 0,
          reorderPoint: 0,
          reorderQuantity: 0
        },
        attributes: []
      },
      submitted: false,
      validationError: '',
      saving: false
    }
  },
  computed: {
    ...mapGetters('items', ['getItemById']),

    isEditMode: function () {
      return !!this.$route.params.id
    },

    existingItem: function () {
      if (this.isEditMode) {
        return this.getItemById(this.$route.params.id)
      }
      return null
    },

    breadcrumbs: function () {
      var crumbs = [
        { label: 'Home', path: '/dashboard' },
        { label: 'Items', path: '/items' }
      ]
      if (this.isEditMode && this.existingItem) {
        crumbs.push({ label: this.existingItem.name, path: '/items/' + this.existingItem.id })
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
    },

    profitMargin: function () {
      if (this.form.unitPrice > 0) {
        var margin = ((this.form.unitPrice - this.form.unitCost) / this.form.unitPrice) * 100
        return margin.toFixed(1)
      }
      return '0.0'
    }
  },
  created: function () {
    if (this.isEditMode && this.existingItem) {
      this.loadExistingItem()
    }
    // Keyboard shortcut listeners
    var self = this
    this._handleSave = function () { self.handleSave() }
    this._handleEscape = function (e) {
      if (e.key === 'Escape') {
        self.handleDiscard()
      }
    }
    eventBus.on('shortcut-save', this._handleSave)
    document.addEventListener('keydown', this._handleEscape)
  },
  beforeUnmount: function () {
    eventBus.off('shortcut-save', this._handleSave)
    if (this._handleEscape) {
      document.removeEventListener('keydown', this._handleEscape)
    }
  },
  watch: {
    existingItem: function (newVal) {
      if (newVal && this.isEditMode) {
        this.loadExistingItem()
      }
    }
  },
  methods: {
    ...mapActions('items', ['addItem', 'updateItem']),

    loadExistingItem: function () {
      var item = this.existingItem
      if (!item) return
      this.form = {
        name: item.name || '',
        description: item.description || '',
        type: item.type || 'Service',
        category: item.category || '',
        unitPrice: item.unitPrice || 0,
        unitCost: item.unitCost || 0,
        unitOfMeasure: item.unitOfMeasure || 'Each',
        taxGroup: item.taxGroup || 'Standard',
        blocked: item.blocked || false,
        vendor: item.vendor || '',
        inventory: {
          quantity: (item.inventory && item.inventory.quantity) || 0,
          reorderPoint: (item.inventory && item.inventory.reorderPoint) || 0,
          reorderQuantity: (item.inventory && item.inventory.reorderQuantity) || 0
        },
        attributes: item.attributes ? item.attributes.map(function (a) { return { name: a.name, value: a.value } }) : []
      }
    },

    addAttribute: function () {
      this.form.attributes.push({ name: '', value: '' })
    },

    removeAttribute: function (index) {
      this.form.attributes.splice(index, 1)
    },

    validate: function () {
      this.validationError = ''
      if (!this.form.name || !this.form.name.trim()) {
        this.validationError = 'Name is required.'
        return false
      }
      if (!this.form.category) {
        this.validationError = 'Category is required.'
        return false
      }
      if (this.form.unitPrice === '' || this.form.unitPrice === null || this.form.unitPrice < 0) {
        this.validationError = 'Unit Price must be 0 or greater.'
        return false
      }
      return true
    },

    generateId: function () {
      var timestamp = Date.now()
      var random = Math.floor(Math.random() * 1000)
      return 'ITM-' + timestamp.toString().slice(-5) + random
    },

    handleSave: function () {
      if (this.saving) return

      var self = this
      this.submitted = true

      if (!this.validate()) {
        return
      }

      this.saving = true

      // Filter out empty attributes
      var filteredAttrs = this.form.attributes.filter(function (a) {
        return a.name && a.name.trim()
      })

      var itemData = {
        name: this.form.name.trim(),
        description: this.form.description.trim(),
        type: this.form.type,
        category: this.form.category,
        unitPrice: parseFloat(this.form.unitPrice) || 0,
        unitCost: parseFloat(this.form.unitCost) || 0,
        unitOfMeasure: this.form.unitOfMeasure,
        taxGroup: this.form.taxGroup,
        blocked: this.form.blocked,
        vendor: this.form.vendor.trim(),
        inventory: this.form.type === 'Inventory' ? {
          quantity: parseInt(this.form.inventory.quantity) || 0,
          reorderPoint: parseInt(this.form.inventory.reorderPoint) || 0,
          reorderQuantity: parseInt(this.form.inventory.reorderQuantity) || 0
        } : { quantity: 0, reorderPoint: 0, reorderQuantity: 0 },
        attributes: filteredAttrs
      }

      // Brief delay to show saving indicator
      setTimeout(function () {
        if (self.isEditMode) {
          itemData.id = self.existingItem.id
          itemData.number = self.existingItem.number
          itemData.createdAt = self.existingItem.createdAt
          itemData.updatedAt = new Date().toISOString()
          self.updateItem(itemData)
          self.$store.dispatch('ui/addAlert', {
            type: 'success',
            title: 'Item updated',
            message: '"' + itemData.name + '" has been updated successfully.',
            duration: 3000
          })
          self.saving = false
          self.$router.push('/items/' + itemData.id)
        } else {
          itemData.id = self.generateId()
          itemData.number = itemData.id
          itemData.createdAt = new Date().toISOString()
          itemData.updatedAt = new Date().toISOString()
          self.addItem(itemData)
          self.$store.dispatch('ui/addAlert', {
            type: 'success',
            title: 'Item created',
            message: '"' + itemData.name + '" has been created successfully.',
            duration: 3000
          })
          self.saving = false
          self.$router.push('/items/' + itemData.id)
        }
      }, 300)
    },

    handleDiscard: function () {
      if (this.isEditMode && this.existingItem) {
        this.$router.push('/items/' + this.existingItem.id)
      } else {
        this.$router.push('/items')
      }
    }
  }
}
</script>

<style scoped>
.item-form-view {
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

.description-textarea {
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
  line-height: 1.5;
}

.computed-value {
  padding: 6px 8px;
  font-size: 14px;
  color: #323130;
  background: #F3F2F1;
  border: 1px solid #EDEBE9;
  border-radius: 2px;
  font-weight: 600;
}

/* Attributes */
.attribute-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.attr-input {
  flex: 1;
}

.attr-remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 2px;
  color: #A19F9D;
  cursor: pointer;
  flex-shrink: 0;
}
.attr-remove-btn:hover {
  background: #FDE7E9;
  color: #D13438;
}

.add-attr-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-family: inherit;
  color: #0078D4;
  background: transparent;
  border: 1px dashed #C8C6C4;
  border-radius: 2px;
  cursor: pointer;
  margin-top: 4px;
  transition: all 0.1s;
}
.add-attr-btn:hover {
  background: #DEECF9;
  border-color: #0078D4;
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
