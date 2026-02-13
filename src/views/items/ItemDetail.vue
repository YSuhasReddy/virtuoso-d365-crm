<template>
  <div class="item-detail-view">
    <!-- Breadcrumb -->
    <div class="px-4 pt-3">
      <Breadcrumb :items="breadcrumbs" />
    </div>

    <!-- Loading / Not Found -->
    <div v-if="!item" class="empty-state px-4 py-12 text-center">
      <p class="text-lg font-semibold text-gray-700">Item not found</p>
      <p class="text-sm text-gray-500 mt-1">The item you are looking for does not exist or has been deleted.</p>
      <button class="d365-cmd-btn primary mt-4" @click="$router.push('/items')">Back to Items</button>
    </div>

    <template v-if="item">
      <!-- Header Section -->
      <div class="detail-header px-4 pb-2">
        <div class="header-left">
          <button class="back-btn" @click="$router.push('/items')" title="Back to Items">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11 2L5 8l6 6" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
          </button>
          <div class="header-info">
            <h1 class="item-name">{{ item.name }}</h1>
            <div class="header-badges">
              <StatusBadge :status="item.type" />
              <StatusBadge :status="item.category" :label="item.category" />
              <span class="item-number-text">{{ item.number }}</span>
              <StatusBadge v-if="item.blocked" status="Blocked" />
            </div>
          </div>
        </div>
        <div class="header-right">
          <RecordNavigation
            :current-index="currentItemIndex"
            :total-count="allItems.length"
            entity-name="Item"
            @navigate="handleRecordNav"
          />
        </div>
      </div>

      <!-- Command Bar -->
      <CommandBar
        :actions="commandActions"
        :show-view-switcher="false"
        :show-filter="false"
        @edit="goToEdit"
        @delete="showDeleteDialog = true"
      />

      <!-- Detail Layout: main content + FactBox -->
      <div class="detail-layout">
        <div class="detail-main" :class="{ 'factbox-open': !factBoxCollapsed }">
          <!-- Detail Content -->
          <div class="tab-content px-4 pb-4">
            <div class="detail-grid">
              <!-- Left Column -->
              <div class="detail-column">
                <div class="section-card d365-card">
                  <div class="section-header">General</div>
                  <div class="section-body">
                    <div class="detail-field">
                      <span class="field-label">Number</span>
                      <span class="field-value">{{ item.number }}</span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Name</span>
                      <span class="field-value">{{ item.name }}</span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Description</span>
                      <span class="field-value">{{ item.description || '--' }}</span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Type</span>
                      <span class="field-value"><StatusBadge :status="item.type" /></span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Category</span>
                      <span class="field-value">{{ item.category || '--' }}</span>
                    </div>
                  </div>
                </div>

                <div class="section-card d365-card mt-3">
                  <div class="section-header">Pricing</div>
                  <div class="section-body">
                    <div class="detail-field">
                      <span class="field-label">Unit Price</span>
                      <span class="field-value price-value">{{ item.unitPrice | currency }}</span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Unit Cost</span>
                      <span class="field-value">{{ item.unitCost | currency }}</span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Profit Margin</span>
                      <span class="field-value" :class="profitMarginClass">{{ profitMargin }}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column -->
              <div class="detail-column">
                <!-- Inventory Section (only for Inventory type) -->
                <div v-if="item.type === 'Inventory'" class="section-card d365-card">
                  <div class="section-header">Inventory</div>
                  <div class="section-body">
                    <div class="detail-field">
                      <span class="field-label">Quantity on Hand</span>
                      <span class="field-value" :class="{ 'low-stock-value': isLowStock }">
                        {{ item.inventory ? item.inventory.quantity : 0 }}
                        <span v-if="isLowStock" class="low-stock-badge">Low Stock</span>
                      </span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Reorder Point</span>
                      <span class="field-value">{{ item.inventory ? item.inventory.reorderPoint : 0 }}</span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Reorder Quantity</span>
                      <span class="field-value">{{ item.inventory ? item.inventory.reorderQuantity : 0 }}</span>
                    </div>
                  </div>
                </div>

                <div class="section-card d365-card" :class="{ 'mt-3': item.type === 'Inventory' }">
                  <div class="section-header">Other Details</div>
                  <div class="section-body">
                    <div class="detail-field">
                      <span class="field-label">Unit of Measure</span>
                      <span class="field-value">{{ item.unitOfMeasure || '--' }}</span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Tax Group</span>
                      <span class="field-value">{{ item.taxGroup || '--' }}</span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Vendor</span>
                      <span class="field-value">{{ item.vendor || '--' }}</span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Status</span>
                      <span class="field-value">
                        <StatusBadge v-if="item.blocked" status="Blocked" />
                        <span v-else>Active</span>
                      </span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Created</span>
                      <span class="field-value">{{ item.createdAt | date }}</span>
                    </div>
                    <div class="detail-field">
                      <span class="field-label">Last Modified</span>
                      <span class="field-value">{{ item.updatedAt | date }}</span>
                    </div>
                  </div>
                </div>

                <!-- Attributes Section -->
                <div v-if="item.attributes && item.attributes.length > 0" class="section-card d365-card mt-3">
                  <div class="section-header">Custom Attributes</div>
                  <div class="section-body">
                    <div v-for="(attr, index) in item.attributes" :key="'attr-' + index" class="detail-field">
                      <span class="field-label">{{ attr.name }}</span>
                      <span class="field-value">{{ attr.value }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- FactBox Right Panel -->
        <FactBox
          :sections="factBoxSections"
          :collapsed="factBoxCollapsed"
          @toggle="factBoxCollapsed = $event"
        />
      </div>
    </template>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Item"
      :message="'Are you sure you want to delete &quot;' + (item ? item.name : '') + '&quot;? This action cannot be undone.'"
      confirm-text="Delete"
      :danger="true"
      @confirm="handleDelete"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import CommandBar from '@/components/layout/CommandBar.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import FactBox from '@/components/common/FactBox.vue'
import RecordNavigation from '@/components/common/RecordNavigation.vue'

export default {
  name: 'ItemDetail',
  components: {
    CommandBar,
    Breadcrumb,
    ConfirmDialog,
    StatusBadge,
    FactBox,
    RecordNavigation
  },
  data: function () {
    return {
      showDeleteDialog: false,
      factBoxCollapsed: false
    }
  },
  computed: {
    ...mapGetters('items', ['getItemById', 'allItems']),

    item: function () {
      return this.getItemById(this.$route.params.id)
    },

    currentItemIndex: function () {
      if (!this.item) return 0
      var self = this
      var idx = this.allItems.findIndex(function (i) { return i.id === self.item.id })
      return idx >= 0 ? idx : 0
    },

    breadcrumbs: function () {
      var crumbs = [
        { label: 'Home', path: '/dashboard' },
        { label: 'Items', path: '/items' }
      ]
      if (this.item) {
        crumbs.push({ label: this.item.name })
      } else {
        crumbs.push({ label: 'Details' })
      }
      return crumbs
    },

    commandActions: function () {
      return [
        {
          id: 'edit',
          label: 'Edit',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M12.146.854a.5.5 0 01.708 0l2.292 2.292a.5.5 0 010 .708L5.854 13.146a.5.5 0 01-.233.131l-4 1a.5.5 0 01-.611-.611l1-4a.5.5 0 01.131-.233L12.146.854z"/></svg>',
          primary: true,
          event: 'edit'
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M5 2V1h6v1h4v1H1V2h4zm1 3v8h1V5H6zm3 0v8h1V5H9zM3 4v10h10V4H3z"/></svg>',
          event: 'delete'
        }
      ]
    },

    profitMargin: function () {
      if (!this.item || !this.item.unitPrice || this.item.unitPrice === 0) return '0.0'
      var margin = ((this.item.unitPrice - this.item.unitCost) / this.item.unitPrice) * 100
      return margin.toFixed(1)
    },

    profitMarginClass: function () {
      var margin = parseFloat(this.profitMargin)
      if (margin >= 50) return 'margin-high'
      if (margin >= 20) return 'margin-medium'
      return 'margin-low'
    },

    isLowStock: function () {
      if (!this.item || this.item.type !== 'Inventory' || !this.item.inventory) return false
      return this.item.inventory.quantity <= this.item.inventory.reorderPoint
    },

    factBoxSections: function () {
      if (!this.item) return []
      var sections = [
        {
          id: 'pricing',
          title: 'Pricing Summary',
          items: [
            {
              label: 'Unit Price',
              value: this.formatCurrency(this.item.unitPrice),
              type: 'text'
            },
            {
              label: 'Unit Cost',
              value: this.formatCurrency(this.item.unitCost),
              type: 'text'
            },
            {
              label: 'Profit Margin',
              value: this.profitMargin + '%',
              type: 'text'
            }
          ]
        },
        {
          id: 'details',
          title: 'Details',
          items: [
            {
              label: 'Type',
              value: this.item.type || '-',
              type: 'badge'
            },
            {
              label: 'Category',
              value: this.item.category || '-',
              type: 'text'
            },
            {
              label: 'UoM',
              value: this.item.unitOfMeasure || '-',
              type: 'text'
            },
            {
              label: 'Tax Group',
              value: this.item.taxGroup || '-',
              type: 'text'
            },
            {
              label: 'Vendor',
              value: this.item.vendor || '-',
              type: 'text'
            }
          ]
        }
      ]

      // Add inventory section for inventory items
      if (this.item.type === 'Inventory' && this.item.inventory) {
        sections.splice(1, 0, {
          id: 'inventory',
          title: 'Inventory',
          items: [
            {
              label: 'On Hand',
              value: String(this.item.inventory.quantity || 0),
              type: 'text'
            },
            {
              label: 'Reorder Point',
              value: String(this.item.inventory.reorderPoint || 0),
              type: 'text'
            },
            {
              label: 'Reorder Qty',
              value: String(this.item.inventory.reorderQuantity || 0),
              type: 'text'
            }
          ]
        })
      }

      return sections
    }
  },
  created: function () {
    var self = this
    this._refreshData = function () { self.$store.dispatch('items/initItems') }
    this._handleSave = function () { self.goToEdit() }
    this.$root.$on('shortcut-refresh', this._refreshData)
    this.$root.$on('shortcut-save', this._handleSave)
  },
  beforeDestroy: function () {
    this.$root.$off('shortcut-refresh', this._refreshData)
    this.$root.$off('shortcut-save', this._handleSave)
  },
  methods: {
    ...mapActions('items', ['deleteItem']),

    goToEdit: function () {
      this.$router.push('/items/' + this.item.id + '/edit')
    },

    handleDelete: function () {
      var itemName = this.item.name
      this.deleteItem(this.item.id)
      this.showDeleteDialog = false
      this.$store.dispatch('ui/addAlert', {
        type: 'success',
        title: 'Item deleted',
        message: '"' + itemName + '" has been deleted.',
        duration: 3000
      })
      this.$router.push('/items')
    },

    handleRecordNav: function (direction) {
      var items = this.allItems
      if (!items.length) return
      var idx = this.currentItemIndex
      var targetIdx = idx
      if (direction === 'first') {
        targetIdx = 0
      } else if (direction === 'prev') {
        targetIdx = Math.max(0, idx - 1)
      } else if (direction === 'next') {
        targetIdx = Math.min(items.length - 1, idx + 1)
      } else if (direction === 'last') {
        targetIdx = items.length - 1
      }
      if (targetIdx !== idx && items[targetIdx]) {
        this.$router.push('/items/' + items[targetIdx].id)
      }
    },

    formatCurrency: function (value) {
      if (value === null || value === undefined) return '$0.00'
      return '$' + parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  }
}
</script>

<style scoped>
.item-detail-view {
  min-height: 100%;
}

/* Detail Layout: flex container for main + FactBox */
.detail-layout {
  display: flex;
  min-height: calc(100vh - 88px);
}
.detail-main {
  flex: 1;
  min-width: 0;
  transition: margin-right 0.2s ease;
}
.detail-main.factbox-open {
  margin-right: 0;
}

/* Header */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid #C8C6C4;
  border-radius: 2px;
  color: #605E5C;
  cursor: pointer;
}
.back-btn:hover {
  background: #F3F2F1;
  color: #323130;
}

.item-name {
  font-size: 22px;
  font-weight: 600;
  color: #323130;
  margin: 0;
}

.header-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.item-number-text {
  font-size: 13px;
  color: #605E5C;
}

/* General Tab */
.detail-grid {
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
  padding: 12px 16px;
}

.detail-field {
  display: flex;
  padding: 6px 0;
  border-bottom: 1px solid #F3F2F1;
}
.detail-field:last-child {
  border-bottom: none;
}

.field-label {
  flex: 0 0 140px;
  font-size: 13px;
  font-weight: 600;
  color: #605E5C;
}

.field-value {
  flex: 1;
  font-size: 13px;
  color: #323130;
}

.price-value {
  font-weight: 600;
  color: #107C10;
}

/* Profit Margin Colors */
.margin-high {
  color: #107C10;
  font-weight: 600;
}
.margin-medium {
  color: #797673;
  font-weight: 600;
}
.margin-low {
  color: #D13438;
  font-weight: 600;
}

/* Low Stock */
.low-stock-value {
  color: #D13438;
  font-weight: 600;
}

.low-stock-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 6px;
  font-size: 11px;
  font-weight: 600;
  background: #FDE7E9;
  color: #D13438;
  border-radius: 2px;
}

/* Responsive */
@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .detail-layout {
    flex-direction: column;
  }
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .header-right {
    align-self: flex-end;
  }
}
</style>
