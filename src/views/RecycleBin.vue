<template>
  <div class="recycle-bin-view">
    <!-- Breadcrumb -->
    <div class="px-4 pt-3">
      <Breadcrumb :items="breadcrumbs" />
    </div>

    <!-- Page Header -->
    <div class="page-header px-4 pb-2">
      <h1 class="page-title">
        Recycle Bin
        <span v-if="totalCount > 0" class="count-badge">{{ totalCount }}</span>
      </h1>
    </div>

    <!-- Info Banner -->
    <div class="info-banner mx-4 mb-3">
      <svg class="info-icon" width="16" height="16" viewBox="0 0 16 16" fill="#605E5C">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a1 1 0 110 2 1 1 0 010-2zm-1 4h2v4H7V8z"/>
      </svg>
      <span>Items are automatically permanently deleted after 30 days.</span>
    </div>

    <!-- Command Bar -->
    <div class="command-bar">
      <div class="command-bar-left">
        <button
          class="d365-cmd-btn primary"
          :disabled="selectedItems.length === 0"
          @click="confirmRestore"
          title="Restore"
        >
          <span class="cmd-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 8a6 6 0 0110.89-3.477l.71-.71A7 7 0 101 8h2zm5-3v4l3.5 2.1.75-1.23L9 8.5V5H7z"/>
            </svg>
          </span>
          <span class="cmd-label">Restore</span>
        </button>

        <button
          class="d365-cmd-btn danger-btn"
          :disabled="selectedItems.length === 0"
          @click="confirmPermanentDelete"
          title="Delete Permanently"
        >
          <span class="cmd-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5 2V1h6v1h4v1H1V2h4zm1 3v8h1V5H6zm3 0v8h1V5H9zM3 4v10h10V4H3z"/>
            </svg>
          </span>
          <span class="cmd-label">Delete Permanently</span>
        </button>

        <span class="cmd-separator"></span>

        <button
          class="d365-cmd-btn danger-btn"
          :disabled="totalCount === 0"
          @click="confirmEmpty"
          title="Empty Recycle Bin"
        >
          <span class="cmd-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5 2V1h6v1h4v1H1V2h4zm1 3v8h1V5H6zm3 0v8h1V5H9zM3 4v10h10V4H3z"/>
            </svg>
          </span>
          <span class="cmd-label">Empty Recycle Bin</span>
        </button>

        <button
          class="d365-cmd-btn"
          @click="refresh"
          title="Refresh"
        >
          <span class="cmd-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.65 2.35A7.958 7.958 0 008 0C3.58 0 .01 3.58.01 8S3.58 16 8 16c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 018 14 6 6 0 012 8a6 6 0 016-6c1.66 0 3.14.69 4.22 1.78L9 7h7V0l-2.35 2.35z"/>
            </svg>
          </span>
          <span class="cmd-label">Refresh</span>
        </button>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs px-4 py-2">
      <button
        v-for="tab in filterTabs"
        :key="tab.key"
        class="filter-tab"
        :class="{ active: activeFilter === tab.key }"
        @click="activeFilter = tab.key"
      >
        {{ tab.label }}
        <span v-if="tab.count > 0" class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Data Table -->
    <div class="table-container px-4 pb-4">
      <table v-if="filteredItems.length > 0" class="data-table">
        <thead>
          <tr>
            <th class="th-checkbox">
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate.prop="someSelected && !allSelected"
                @change="toggleSelectAll"
              />
            </th>
            <th class="th-type">Type</th>
            <th class="th-name">Name / Title</th>
            <th class="th-entity">Entity</th>
            <th class="th-deleted">Deleted</th>
            <th class="th-deletedby">Deleted By</th>
            <th class="th-actions"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in paginatedItems"
            :key="item.id"
            class="data-row"
            :class="{ selected: isSelected(item.id), expanded: expandedItem === item.id }"
            @click="toggleExpand(item.id)"
          >
            <td class="td-checkbox" @click.stop>
              <input
                type="checkbox"
                :checked="isSelected(item.id)"
                @change="toggleSelect(item)"
              />
            </td>
            <td class="td-type">
              <span class="type-badge" :class="'type-' + item.entityType">{{ entityLabel(item.entityType) }}</span>
            </td>
            <td class="td-name">{{ itemDisplayName(item) }}</td>
            <td class="td-entity">{{ entityLabel(item.entityType) }}</td>
            <td class="td-deleted">{{ formatDate(item.deletedAt) }}</td>
            <td class="td-deletedby">{{ item.deletedBy }}</td>
            <td class="td-actions" @click.stop>
              <button class="row-action-btn restore-btn" @click="restoreSingle(item)" title="Restore">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 8a6 6 0 0110.89-3.477l.71-.71A7 7 0 101 8h2zm5-3v4l3.5 2.1.75-1.23L9 8.5V5H7z"/>
                </svg>
              </button>
              <button class="row-action-btn delete-btn" @click="deleteSingle(item)" title="Delete permanently">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M5 2V1h6v1h4v1H1V2h4zm1 3v8h1V5H6zm3 0v8h1V5H9zM3 4v10h10V4H3z"/>
                </svg>
              </button>
            </td>
          </tr>
          <!-- Expanded detail row -->
          <tr v-for="item in paginatedItems" :key="'detail-' + item.id" v-if="expandedItem === item.id" class="detail-row">
            <td colspan="7">
              <div class="detail-panel">
                <h4 class="detail-title">Deleted Record Details</h4>
                <div class="detail-grid">
                  <div v-for="(value, key) in getDisplayableFields(item.data)" :key="key" class="detail-field">
                    <span class="detail-label">{{ formatFieldLabel(key) }}</span>
                    <span class="detail-value">{{ formatFieldValue(value) }}</span>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <svg class="empty-icon" width="48" height="48" viewBox="0 0 48 48" fill="#C8C6C4">
          <path d="M20 6V4h8v2h8v2H12V6h8zM14 12v28h20V12H14zm4 4h2v20h-2V16zm6 0h2v20h-2V16zm6 0h2v20h-2V16z"/>
        </svg>
        <h3 class="empty-title">Recycle bin is empty</h3>
        <p class="empty-subtitle">Deleted items will appear here for 30 days before being permanently removed.</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalFilteredPages > 1" class="pagination px-4 pb-4">
      <span class="pagination-info">{{ paginationInfo }}</span>
      <div class="pagination-controls">
        <button class="page-btn" :disabled="currentPage === 1" @click="currentPage = 1" title="First page">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M1 1v10h1V1H1zm2 5l5 5V1L3 6z"/></svg>
        </button>
        <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--" title="Previous page">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M8 1L3 6l5 5V1z"/></svg>
        </button>
        <span class="page-indicator">Page {{ currentPage }} of {{ totalFilteredPages }}</span>
        <button class="page-btn" :disabled="currentPage === totalFilteredPages" @click="currentPage++" title="Next page">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M4 1l5 5-5 5V1z"/></svg>
        </button>
        <button class="page-btn" :disabled="currentPage === totalFilteredPages" @click="currentPage = totalFilteredPages" title="Last page">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M9 1v10h1V1H9zM7 6L2 1v10l5-5z"/></svg>
        </button>
      </div>
    </div>

    <!-- Confirm Restore Dialog -->
    <ConfirmDialog
      :show="showRestoreDialog"
      title="Restore Items"
      :message="restoreMessage"
      confirm-text="Restore"
      @confirm="handleRestore"
      @cancel="showRestoreDialog = false"
    />

    <!-- Confirm Permanent Delete Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Permanently Delete"
      :message="deleteMessage"
      confirm-text="Delete Permanently"
      :danger="true"
      @confirm="handlePermanentDelete"
      @cancel="showDeleteDialog = false"
    />

    <!-- Confirm Empty Recycle Bin Dialog -->
    <ConfirmDialog
      :show="showEmptyDialog"
      title="Empty Recycle Bin"
      :message="emptyMessage"
      confirm-text="Empty Recycle Bin"
      :danger="true"
      @confirm="handleEmpty"
      @cancel="showEmptyDialog = false"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

export default {
  name: 'RecycleBin',
  components: {
    Breadcrumb,
    ConfirmDialog
  },
  data() {
    return {
      breadcrumbs: [
        { label: 'Home', path: '/dashboard' },
        { label: 'Recycle Bin' }
      ],
      activeFilter: 'all',
      selectedItems: [],
      expandedItem: null,
      showRestoreDialog: false,
      showDeleteDialog: false,
      showEmptyDialog: false,
      currentPage: 1,
      perPage: 20,
      // For single-item actions from row buttons
      pendingAction: null,
      pendingItems: []
    }
  },
  computed: {
    ...mapGetters('recycleBin', [
      'allItems',
      'contacts',
      'opportunities',
      'activities',
      'salesDocuments',
      'totalCount'
    ]),

    filterTabs() {
      return [
        { key: 'all', label: 'All', count: this.totalCount },
        { key: 'contact', label: 'Contacts', count: this.contacts.length },
        { key: 'opportunity', label: 'Opportunities', count: this.opportunities.length },
        { key: 'activity', label: 'Activities', count: this.activities.length },
        { key: 'salesDocument', label: 'Documents', count: this.salesDocuments.length }
      ]
    },

    filteredItems() {
      if (this.activeFilter === 'all') {
        return this.allItems
      }
      return this.allItems.filter(i => i.entityType === this.activeFilter)
    },

    totalFilteredPages() {
      return Math.max(1, Math.ceil(this.filteredItems.length / this.perPage))
    },

    paginatedItems() {
      var start = (this.currentPage - 1) * this.perPage
      var end = start + this.perPage
      return this.filteredItems.slice(start, end)
    },

    paginationInfo() {
      var start = (this.currentPage - 1) * this.perPage + 1
      var end = Math.min(this.currentPage * this.perPage, this.filteredItems.length)
      return start + '-' + end + ' of ' + this.filteredItems.length + ' items'
    },

    allSelected() {
      return this.paginatedItems.length > 0 && this.paginatedItems.every(i => this.isSelected(i.id))
    },

    someSelected() {
      return this.paginatedItems.some(i => this.isSelected(i.id))
    },

    restoreMessage() {
      var count = this.pendingItems.length
      if (count === 1) {
        return 'Restore "' + this.itemDisplayName(this.pendingItems[0]) + '"? It will be added back to its original location.'
      }
      return 'Restore ' + count + ' items? They will be added back to their original locations.'
    },

    deleteMessage() {
      var count = this.pendingItems.length
      if (count === 1) {
        return 'Permanently delete "' + this.itemDisplayName(this.pendingItems[0]) + '"? This action cannot be undone.'
      }
      return 'Permanently delete ' + count + ' items? This action cannot be undone.'
    },

    emptyMessage() {
      return 'Empty the entire recycle bin? All ' + this.totalCount + ' items will be permanently deleted. This action cannot be undone.'
    }
  },
  watch: {
    activeFilter() {
      this.currentPage = 1
      this.selectedItems = []
    },
    filteredItems() {
      // Reset to page 1 if current page is now out of bounds
      if (this.currentPage > this.totalFilteredPages) {
        this.currentPage = 1
      }
    }
  },
  created() {
    // Purge old items on load
    this.$store.dispatch('recycleBin/purgeOldItems')
  },
  methods: {
    ...mapActions('recycleBin', [
      'restore',
      'permanentDelete',
      'emptyRecycleBin',
      'purgeOldItems'
    ]),

    entityLabel(type) {
      var labels = {
        contact: 'Contact',
        opportunity: 'Opportunity',
        activity: 'Activity',
        salesDocument: 'Document'
      }
      return labels[type] || type
    },

    itemDisplayName(item) {
      if (!item || !item.data) return 'Unknown'
      var d = item.data
      return d.name || d.subject || d.number || d.title || d.id || 'Untitled'
    },

    formatDate(isoString) {
      if (!isoString) return ''
      var date = new Date(isoString)
      var now = new Date()
      var diff = now - date
      var minutes = Math.floor(diff / 60000)
      var hours = Math.floor(diff / 3600000)
      var days = Math.floor(diff / 86400000)

      if (minutes < 1) return 'Just now'
      if (minutes < 60) return minutes + ' min ago'
      if (hours < 24) return hours + 'h ago'
      if (days < 7) return days + 'd ago'

      // Fallback to formatted date
      var month = date.toLocaleString('en-US', { month: 'short' })
      var day = date.getDate()
      var year = date.getFullYear()
      if (year === now.getFullYear()) {
        return month + ' ' + day
      }
      return month + ' ' + day + ', ' + year
    },

    formatFieldLabel(key) {
      // Convert camelCase to Title Case
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, function (s) { return s.toUpperCase() })
        .trim()
    },

    formatFieldValue(value) {
      if (value === null || value === undefined) return '--'
      if (typeof value === 'object') {
        if (Array.isArray(value)) return value.length + ' items'
        return JSON.stringify(value)
      }
      if (typeof value === 'boolean') return value ? 'Yes' : 'No'
      return String(value)
    },

    getDisplayableFields(data) {
      if (!data) return {}
      var result = {}
      var skipFields = ['lines', 'updatedAt'] // Skip complex nested arrays
      var self = this
      Object.keys(data).forEach(function (key) {
        if (skipFields.indexOf(key) !== -1) return
        var value = data[key]
        // Skip deeply nested objects other than address
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          if (key === 'address') {
            // Flatten address
            Object.keys(value).forEach(function (addrKey) {
              result['address ' + self.formatFieldLabel(addrKey)] = value[addrKey]
            })
          }
          return
        }
        result[key] = value
      })
      return result
    },

    isSelected(itemId) {
      return this.selectedItems.some(function (i) { return i.id === itemId })
    },

    toggleSelect(item) {
      var index = this.selectedItems.findIndex(function (i) { return i.id === item.id })
      if (index === -1) {
        this.selectedItems.push(item)
      } else {
        this.selectedItems.splice(index, 1)
      }
    },

    toggleSelectAll() {
      var self = this
      if (this.allSelected) {
        // Deselect all on current page
        var pageIds = this.paginatedItems.map(function (i) { return i.id })
        this.selectedItems = this.selectedItems.filter(function (i) {
          return pageIds.indexOf(i.id) === -1
        })
      } else {
        // Select all on current page
        this.paginatedItems.forEach(function (item) {
          if (!self.isSelected(item.id)) {
            self.selectedItems.push(item)
          }
        })
      }
    },

    toggleExpand(itemId) {
      this.expandedItem = this.expandedItem === itemId ? null : itemId
    },

    // Restore actions
    confirmRestore() {
      if (this.selectedItems.length === 0) return
      this.pendingItems = this.selectedItems.slice()
      this.showRestoreDialog = true
    },

    restoreSingle(item) {
      this.pendingItems = [item]
      this.showRestoreDialog = true
    },

    handleRestore() {
      var self = this
      var count = this.pendingItems.length
      this.pendingItems.forEach(function (item) {
        self.restore(item.id)
      })
      this.selectedItems = []
      this.pendingItems = []
      this.showRestoreDialog = false
      this.expandedItem = null
      this.$store.dispatch('ui/addAlert', {
        type: 'success',
        title: 'Restored',
        message: count + ' item' + (count > 1 ? 's' : '') + ' restored successfully.',
        duration: 3000
      })
    },

    // Permanent delete actions
    confirmPermanentDelete() {
      if (this.selectedItems.length === 0) return
      this.pendingItems = this.selectedItems.slice()
      this.showDeleteDialog = true
    },

    deleteSingle(item) {
      this.pendingItems = [item]
      this.showDeleteDialog = true
    },

    handlePermanentDelete() {
      var self = this
      var count = this.pendingItems.length
      this.pendingItems.forEach(function (item) {
        self.permanentDelete(item.id)
      })
      this.selectedItems = []
      this.pendingItems = []
      this.showDeleteDialog = false
      this.expandedItem = null
      this.$store.dispatch('ui/addAlert', {
        type: 'success',
        title: 'Permanently Deleted',
        message: count + ' item' + (count > 1 ? 's' : '') + ' permanently deleted.',
        duration: 3000
      })
    },

    // Empty recycle bin
    confirmEmpty() {
      if (this.totalCount === 0) return
      this.showEmptyDialog = true
    },

    handleEmpty() {
      this.emptyRecycleBin()
      this.selectedItems = []
      this.showEmptyDialog = false
      this.expandedItem = null
      this.$store.dispatch('ui/addAlert', {
        type: 'success',
        title: 'Recycle Bin Emptied',
        message: 'All items have been permanently deleted.',
        duration: 3000
      })
    },

    refresh() {
      this.purgeOldItems()
      this.$store.dispatch('ui/addAlert', {
        type: 'success',
        title: 'Refreshed',
        message: 'Recycle bin has been refreshed.',
        duration: 2000
      })
    }
  }
}
</script>

<style scoped>
.recycle-bin-view {
  min-height: 100%;
}

.page-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #323130;
  display: flex;
  align-items: center;
  gap: 10px;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  font-size: 12px;
  font-weight: 700;
  color: #FFFFFF;
  background: #605E5C;
  border-radius: 11px;
}

/* Info Banner */
.info-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #FFF4CE;
  border: 1px solid #FFE7A0;
  border-radius: 2px;
  font-size: 13px;
  color: #323130;
}

.info-icon {
  flex-shrink: 0;
}

/* Command Bar */
.command-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 16px;
  background: #FFFFFF;
  border-bottom: 1px solid #EDEBE9;
}

.command-bar-left {
  display: flex;
  align-items: center;
  gap: 2px;
}

.d365-cmd-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: transparent;
  border: none;
  font-size: 13px;
  font-family: inherit;
  color: #323130;
  cursor: pointer;
  border-radius: 2px;
  white-space: nowrap;
  transition: background 0.1s;
}

.d365-cmd-btn:hover:not(:disabled) {
  background: #F3F2F1;
}

.d365-cmd-btn:disabled {
  color: #A19F9D;
  cursor: not-allowed;
}

.d365-cmd-btn.primary {
  background: #0078D4;
  color: #FFFFFF;
  font-weight: 600;
}

.d365-cmd-btn.primary:hover:not(:disabled) {
  background: #106EBE;
}

.d365-cmd-btn.primary:disabled {
  background: #C8C6C4;
  color: #FFFFFF;
}

.danger-btn {
  color: #D13438;
}

.danger-btn:hover:not(:disabled) {
  background: #FDE7E9;
}

.danger-btn:disabled {
  color: #A19F9D;
}

.cmd-icon {
  display: inline-flex;
  align-items: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.cmd-label {
  white-space: nowrap;
}

.cmd-separator {
  display: inline-block;
  width: 1px;
  height: 24px;
  background: #EDEBE9;
  margin: 0 4px;
  flex-shrink: 0;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #EDEBE9;
  background: #FFFFFF;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 13px;
  font-family: inherit;
  color: #605E5C;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-tab:hover {
  color: #323130;
  background: #F3F2F1;
}

.filter-tab.active {
  color: #0078D4;
  border-bottom-color: #0078D4;
  font-weight: 600;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 600;
  color: #605E5C;
  background: #EDEBE9;
  border-radius: 9px;
}

.filter-tab.active .tab-count {
  color: #0078D4;
  background: #DEECF9;
}

/* Data Table */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  background: #FFFFFF;
  border: 1px solid #EDEBE9;
}

.data-table th {
  padding: 8px 12px;
  text-align: left;
  font-weight: 600;
  color: #605E5C;
  background: #FAFAFA;
  border-bottom: 1px solid #EDEBE9;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.data-table td {
  padding: 8px 12px;
  color: #323130;
  border-bottom: 1px solid #F3F2F1;
  vertical-align: middle;
}

.data-row {
  cursor: pointer;
  transition: background 0.1s;
}

.data-row:hover {
  background: #F3F2F1;
}

.data-row.selected {
  background: #DEECF9;
}

.data-row.expanded {
  background: #F3F2F1;
}

.th-checkbox,
.td-checkbox {
  width: 40px;
  text-align: center;
}

.th-checkbox input,
.td-checkbox input {
  cursor: pointer;
}

.th-type { width: 110px; }
.th-name { min-width: 180px; }
.th-entity { width: 110px; }
.th-deleted { width: 130px; }
.th-deletedby { width: 130px; }
.th-actions { width: 80px; }

.td-name {
  font-weight: 600;
  color: #0078D4;
}

.td-actions {
  text-align: center;
}

/* Type badges */
.type-badge {
  display: inline-block;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 2px;
  white-space: nowrap;
}

.type-contact {
  background: #DEECF9;
  color: #0078D4;
}

.type-opportunity {
  background: #DFF6DD;
  color: #107C10;
}

.type-activity {
  background: #FFF4CE;
  color: #C19C00;
}

.type-salesDocument {
  background: #F3E8FD;
  color: #8764B8;
}

/* Row action buttons */
.row-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  color: #605E5C;
  transition: all 0.1s;
}

.row-action-btn:hover {
  background: #EDEBE9;
}

.restore-btn:hover {
  color: #0078D4;
  background: #DEECF9;
}

.delete-btn:hover {
  color: #D13438;
  background: #FDE7E9;
}

/* Detail Panel */
.detail-row {
  background: #FAFAFA;
}

.detail-row td {
  padding: 0;
}

.detail-panel {
  padding: 16px 20px;
  border-top: 1px solid #EDEBE9;
}

.detail-title {
  font-size: 14px;
  font-weight: 600;
  color: #323130;
  margin: 0 0 12px 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px 24px;
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 11px;
  font-weight: 600;
  color: #605E5C;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.detail-value {
  font-size: 13px;
  color: #323130;
  word-break: break-word;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #323130;
  margin: 0 0 8px 0;
}

.empty-subtitle {
  font-size: 14px;
  color: #605E5C;
  margin: 0;
  max-width: 400px;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #605E5C;
}

.pagination-info {
  font-size: 13px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid #C8C6C4;
  border-radius: 2px;
  cursor: pointer;
  color: #323130;
  transition: all 0.1s;
}

.page-btn:hover:not(:disabled) {
  background: #F3F2F1;
  border-color: #8A8886;
}

.page-btn:disabled {
  color: #C8C6C4;
  cursor: not-allowed;
  border-color: #EDEBE9;
}

.page-indicator {
  padding: 0 8px;
  font-size: 13px;
  color: #323130;
}

/* Responsive */
@media (max-width: 768px) {
  .command-bar-left {
    flex-wrap: wrap;
  }
  .filter-tabs {
    overflow-x: auto;
  }
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
