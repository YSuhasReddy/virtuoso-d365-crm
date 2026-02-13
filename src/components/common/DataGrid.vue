<template>
  <div class="data-grid" :class="{ 'data-grid--editable': editable }">
    <!-- Grid Header Bar (export button) -->
    <div v-if="exportable || showColumnChooser" class="grid-toolbar">
      <div class="grid-toolbar__left">
        <slot name="toolbar-left"></slot>
      </div>
      <div class="grid-toolbar__right">
        <button
          v-if="exportable"
          class="grid-export-btn"
          title="Export to CSV"
          @click="exportToCsv"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 1h8v2h-8V1zm-2 3h12v1H2V4zm1 2h10v9H3V6zm2 2v1h2V8H5zm3 0v1h2V8H8zm-3 2v1h2v-1H5zm3 0v1h2v-1H8zm-3 2v1h2v-1H5zm3 0v1h2v-1H8z"/>
          </svg>
          <span class="grid-export-btn__label">Export</span>
        </button>
      </div>
    </div>

    <!-- Grouping indicator bar -->
    <div v-if="effectiveGroupBy" class="grid-group-bar">
      <span class="grid-group-bar__label">Grouped by:</span>
      <span class="grid-group-bar__chip">
        {{ getColumnLabel(effectiveGroupBy) }}
        <button class="grid-group-bar__remove" title="Remove grouping" @click="handleRemoveGrouping">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>
        </button>
      </span>
    </div>

    <!-- Grid Table -->
    <div class="grid-table-wrapper" ref="tableWrapper">
      <table class="grid-table" ref="gridTable">
        <thead>
          <tr>
            <th v-if="selectable" class="col-checkbox grid-header">
              <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" />
            </th>
            <th
              v-for="(col, colIdx) in visibleColumns"
              :key="col.field"
              class="grid-header"
              :class="{
                sortable: col.sortable !== false,
                sorted: sortBy === col.field,
                'col-frozen': frozenFirstColumn && colIdx === 0
              }"
              :style="getHeaderStyle(col, colIdx)"
              @click="col.sortable !== false && handleSort(col.field)"
              @contextmenu.prevent="showColumnChooser ? openColumnMenu($event, col) : null"
            >
              <div class="header-content">
                <span class="header-label">{{ col.label }}</span>
                <span v-if="col.sortable !== false && sortBy === col.field" class="sort-indicator">
                  <svg v-if="sortDir === 'asc'" width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 2l4 6H1l4-6z"/></svg>
                  <svg v-else width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 8L1 2h8L5 8z"/></svg>
                </span>
              </div>
              <!-- Resize handle -->
              <div
                class="col-resize-handle"
                @mousedown.stop.prevent="startResize($event, col, colIdx)"
                @dblclick.stop.prevent="autoFitColumn(col)"
              ></div>
            </th>
            <th v-if="$scopedSlots.actions" class="col-actions grid-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, rowIndex) in groupedDisplayData"
            :key="item._isGroupHeader ? item._groupKey : (item.id || ('row-' + rowIndex))"
            :class="{
              'grid-row': !item._isGroupHeader,
              'grid-group-header-row': item._isGroupHeader,
              selected: !item._isGroupHeader && isSelected(item),
              'grid-row--alt': !item._isGroupHeader && getDataRowIndex(item) % 2 === 1
            }"
            @click="!item._isGroupHeader && handleRowClick(item)"
            @dblclick="!item._isGroupHeader && handleRowDblClick(item, $event)"
          >
            <!-- Group header row -->
            <template v-if="item._isGroupHeader">
              <td :colspan="groupHeaderColspan" class="group-header-cell" @click.stop="toggleGroup(item._groupKey)">
                <span class="group-chevron" :class="{ collapsed: isGroupCollapsed(item._groupKey) }">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="#605E5C">
                    <path d="M4 2l4 4-4 4"/>
                  </svg>
                </span>
                <span class="group-field-name">{{ getColumnLabel(effectiveGroupBy) }}:</span>
                <span class="group-value">{{ item._groupValue || '(empty)' }}</span>
                <span class="group-count">({{ item._groupCount }})</span>
              </td>
            </template>
            <!-- Normal data row -->
            <template v-else>
              <td v-if="selectable" class="col-checkbox" @click.stop>
                <input type="checkbox" :checked="isSelected(item)" @change="toggleSelect(item)" />
              </td>
              <td
                v-for="(col, colIdx) in visibleColumns"
                :key="col.field"
                class="grid-cell"
                :class="{
                  'cell-link': col.link,
                  'cell-editing': isEditingCell(item, col.field),
                  'cell-editable': isCellEditable(col.field),
                  'col-frozen': frozenFirstColumn && colIdx === 0
                }"
                :style="getCellStyle(col, colIdx)"
                @dblclick.stop="startCellEdit(item, getDataRowIndex(item), col)"
              >
                <!-- Edit Mode -->
                <template v-if="isEditingCell(item, col.field)">
                  <select
                    v-if="col.format === 'badge' && col.badgeOptions"
                    :ref="'edit-' + item.id + '-' + col.field"
                    class="cell-edit-select"
                    :value="editCellValue"
                    @input="editCellValue = $event.target.value"
                    @keydown.enter="saveCellEdit"
                    @keydown.escape="cancelCellEdit"
                    @keydown.tab.prevent="tabToNextCell($event)"
                    @blur="saveCellEdit"
                  >
                    <option v-for="opt in col.badgeOptions" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                  <input
                    v-else
                    :ref="'edit-' + item.id + '-' + col.field"
                    type="text"
                    class="cell-edit-input"
                    :class="{ 'cell-edit-input--error': editValidationError }"
                    :value="editCellValue"
                    @input="editCellValue = $event.target.value"
                    @keydown.enter="saveCellEdit"
                    @keydown.escape="cancelCellEdit"
                    @keydown.tab.prevent="tabToNextCell($event)"
                    @blur="saveCellEdit"
                  />
                </template>
                <!-- Display Mode -->
                <template v-else>
                  <slot :name="'cell-' + col.field" :row="item" :value="getCellValue(item, col)">
                    <span v-if="col.format === 'currency'">{{ getCellValue(item, col) | currency }}</span>
                    <span v-else-if="col.format === 'date'">{{ getCellValue(item, col) | date }}</span>
                    <StatusBadge v-else-if="col.format === 'badge'" :status="getCellValue(item, col) || ''" />
                    <span v-else>{{ getCellValue(item, col) }}</span>
                  </slot>
                </template>
              </td>
              <td v-if="$scopedSlots.actions" class="col-actions" @click.stop>
                <slot name="actions" :row="item"></slot>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="data.length === 0" class="grid-empty">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="#C8C6C4">
        <path d="M8 8h32v4H8V8zm0 8h32v4H8v-4zm0 8h20v4H8v-4z"/>
      </svg>
      <p class="empty-title">{{ emptyTitle || 'No records found' }}</p>
      <p class="empty-subtitle">{{ emptySubtitle || 'Try adjusting your filters or create a new record.' }}</p>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="grid-pagination">
      <div class="pagination-info">
        Showing {{ startItem }}-{{ endItem }} of {{ totalItems }} items
      </div>
      <div class="pagination-controls">
        <select class="per-page-select" :value="perPage" @change="$emit('per-page-change', parseInt($event.target.value))">
          <option v-for="opt in [10, 15, 25, 50]" :key="opt" :value="opt">{{ opt }} per page</option>
        </select>
        <button class="page-btn" :disabled="currentPage <= 1" @click="$emit('page-change', currentPage - 1)">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M8 2L4 6l4 4"/></svg>
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          class="page-btn"
          :class="{ active: page === currentPage, dots: page === '...' }"
          :disabled="page === '...'"
          @click="page !== '...' && $emit('page-change', page)"
        >{{ page }}</button>
        <button class="page-btn" :disabled="currentPage >= totalPages" @click="$emit('page-change', currentPage + 1)">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M4 2l4 4-4 4"/></svg>
        </button>
      </div>
    </div>

    <!-- Column Context Menu -->
    <transition name="ctx-menu-anim">
      <div
        v-if="columnMenuVisible"
        ref="columnMenu"
        class="column-context-menu"
        :style="columnMenuPosition"
        @mousedown.stop
      >
        <div class="ctx-menu__section-header">Show/Hide Columns</div>
        <div
          v-for="col in columns"
          :key="'ctx-' + col.field"
          class="ctx-menu__item"
          @click="toggleColumnVisibility(col.field)"
        >
          <span class="ctx-menu__check">
            <svg v-if="!hiddenColumns[col.field]" width="12" height="12" viewBox="0 0 12 12" fill="#0078D4"><path d="M2 6l3 3 5-5" stroke="#0078D4" stroke-width="2" fill="none"/></svg>
          </span>
          <span>{{ col.label }}</span>
        </div>
        <div class="ctx-menu__separator"></div>
        <div class="ctx-menu__item" @click="resetColumns">
          <span class="ctx-menu__check"></span>
          <span>Reset to Default</span>
        </div>
        <div class="ctx-menu__separator"></div>
        <div class="ctx-menu__item" @click="autoFitColumn(columnMenuTarget)">
          <span class="ctx-menu__check"></span>
          <span>Auto-fit Column</span>
        </div>
        <div class="ctx-menu__item" @click="autoFitAllColumns">
          <span class="ctx-menu__check"></span>
          <span>Auto-fit All Columns</span>
        </div>
        <!-- Grouping options -->
        <template v-if="groupable">
          <div class="ctx-menu__separator"></div>
          <div class="ctx-menu__item" @click="handleGroupBy(columnMenuTarget && columnMenuTarget.field)">
            <span class="ctx-menu__check">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="#605E5C"><path d="M1 2h10v2H1V2zm2 3h6v2H3V5zm2 3h4v2H5V8z"/></svg>
            </span>
            <span>Group by {{ columnMenuTarget ? columnMenuTarget.label : '' }}</span>
          </div>
          <div v-if="effectiveGroupBy" class="ctx-menu__item" @click="handleRemoveGrouping">
            <span class="ctx-menu__check">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="#A19F9D"><path d="M2 2l8 8M10 2l-8 8" stroke="#A19F9D" stroke-width="1.5" fill="none"/></svg>
            </span>
            <span>Remove Grouping</span>
          </div>
        </template>
      </div>
    </transition>

    <!-- Overlay for column menu click-outside -->
    <div v-if="columnMenuVisible" class="column-menu-overlay" @mousedown="closeColumnMenu"></div>
  </div>
</template>

<script>
import StatusBadge from './StatusBadge.vue'

export default {
  name: 'DataGrid',
  components: { StatusBadge },

  props: {
    columns: { type: Array, required: true },
    data: { type: Array, required: true },
    selectable: { type: Boolean, default: false },
    sortBy: { type: String, default: '' },
    sortDir: { type: String, default: 'asc' },
    currentPage: { type: Number, default: 1 },
    perPage: { type: Number, default: 15 },
    totalItems: { type: Number, default: 0 },
    totalPages: { type: Number, default: 1 },
    emptyTitle: { type: String, default: '' },
    emptySubtitle: { type: String, default: '' },
    // Editing props
    editable: { type: Boolean, default: false },
    editableColumns: {
      type: Array,
      default: function () { return [] }
    },
    showColumnChooser: { type: Boolean, default: false },
    exportable: { type: Boolean, default: false },
    exportFileName: { type: String, default: '' },
    frozenFirstColumn: { type: Boolean, default: false },
    entityName: { type: String, default: 'data' },
    allData: {
      type: Array,
      default: function () { return [] }
    },
    // Feature 1: Grid Grouping props
    groupBy: { type: String, default: '' },
    groupable: { type: Boolean, default: false },
    // Feature 2: Page Personalization props
    persistKey: { type: String, default: '' }
  },

  data: function () {
    return {
      selectedRows: [],
      // Inline editing
      editingCell: null, // { rowId, field }
      editCellValue: '',
      editCellOldValue: '',
      editValidationError: false,
      // Column chooser
      hiddenColumns: {},
      columnMenuVisible: false,
      columnMenuPosition: { top: '0px', left: '0px' },
      columnMenuTarget: null,
      // Column resize
      columnWidths: {},
      resizing: false,
      resizeCol: null,
      resizeStartX: 0,
      resizeStartWidth: 0,
      // Feature 1: Grid Grouping data
      internalGroupBy: '',
      collapsedGroups: {},
      // Feature 2: Page Personalization data
      savedPreferences: null,
      savePreferencesTimer: null
    }
  },

  computed: {
    visibleColumns: function () {
      var self = this
      return this.columns.filter(function (col) {
        return !self.hiddenColumns[col.field]
      })
    },

    allSelected: function () {
      return this.data.length > 0 && this.selectedRows.length === this.data.length
    },

    startItem: function () {
      return (this.currentPage - 1) * this.perPage + 1
    },

    endItem: function () {
      return Math.min(this.currentPage * this.perPage, this.totalItems)
    },

    visiblePages: function () {
      var pages = []
      var total = this.totalPages
      var current = this.currentPage
      if (total <= 7) {
        for (var i = 1; i <= total; i++) pages.push(i)
      } else {
        pages.push(1)
        if (current > 3) pages.push('...')
        for (var j = Math.max(2, current - 1); j <= Math.min(total - 1, current + 1); j++) {
          pages.push(j)
        }
        if (current < total - 2) pages.push('...')
        pages.push(total)
      }
      return pages
    },

    exportDataSource: function () {
      // Use allData prop if provided (for all filtered data across pages), otherwise current page data
      return this.allData && this.allData.length > 0 ? this.allData : this.data
    },

    // Feature 1: Effective group-by field (internal state falls back to prop)
    effectiveGroupBy: function () {
      return this.internalGroupBy || this.groupBy
    },

    // Feature 1: Colspan for group header cells
    groupHeaderColspan: function () {
      var count = this.visibleColumns.length
      if (this.selectable) count += 1
      if (this.$scopedSlots.actions) count += 1
      return count
    },

    // Feature 1: Grouped display data
    groupedDisplayData: function () {
      if (!this.effectiveGroupBy) {
        return this.data // no grouping, return as-is
      }

      var self = this
      var groupField = this.effectiveGroupBy

      // Group the current page data
      var groups = {}
      var groupOrder = []

      this.data.forEach(function (row) {
        // Support nested fields (dot notation)
        var key = self.getNestedValue(row, groupField)
        var keyStr = (key !== null && key !== undefined) ? String(key) : ''
        if (!groups[keyStr]) {
          groups[keyStr] = []
          groupOrder.push(keyStr)
        }
        groups[keyStr].push(row)
      })

      // Build flat array with group headers interleaved
      var result = []
      groupOrder.forEach(function (key) {
        result.push({
          _isGroupHeader: true,
          _groupKey: 'group-' + key,
          _groupValue: key,
          _groupCount: groups[key].length
        })
        if (!self.collapsedGroups[key]) {
          groups[key].forEach(function (row) {
            result.push(row)
          })
        }
      })

      return result
    }
  },

  methods: {
    // ===== Existing methods (backward compatible) =====
    getCellValue: function (row, col) {
      var fields = col.field.split('.')
      var val = row
      for (var i = 0; i < fields.length; i++) {
        if (val == null) return ''
        val = val[fields[i]]
      }
      return val !== null && val !== undefined ? val : ''
    },

    // Helper: get nested value from a row by dot-notation field
    getNestedValue: function (row, fieldPath) {
      if (!fieldPath) return ''
      var fields = fieldPath.split('.')
      var val = row
      for (var i = 0; i < fields.length; i++) {
        if (val == null) return ''
        val = val[fields[i]]
      }
      return val !== null && val !== undefined ? val : ''
    },

    handleSort: function (field) {
      if (this.sortBy === field) {
        this.$emit('sort', { field: field, dir: this.sortDir === 'asc' ? 'desc' : 'asc' })
      } else {
        this.$emit('sort', { field: field, dir: 'asc' })
      }
    },

    handleRowClick: function (row) {
      this.$emit('row-click', row)
    },

    isSelected: function (row) {
      return this.selectedRows.some(function (r) { return r.id === row.id })
    },

    toggleSelect: function (row) {
      var idx = this.selectedRows.findIndex(function (r) { return r.id === row.id })
      if (idx >= 0) {
        this.selectedRows.splice(idx, 1)
      } else {
        this.selectedRows.push(row)
      }
      this.$emit('selection-change', this.selectedRows)
    },

    toggleSelectAll: function () {
      if (this.allSelected) {
        this.selectedRows = []
      } else {
        this.selectedRows = [].concat(this.data)
      }
      this.$emit('selection-change', this.selectedRows)
    },

    // ===== Row double click handler =====
    handleRowDblClick: function (row) {
      // Only emit if we are not in editable mode (editable mode handles cell dblclick)
      if (!this.editable) {
        this.$emit('row-dblclick', row)
      }
    },

    // ===== Helper: get the original data index for a row (for alt-row striping) =====
    getDataRowIndex: function (row) {
      for (var i = 0; i < this.data.length; i++) {
        if (this.data[i] === row || (row.id && this.data[i].id === row.id)) {
          return i
        }
      }
      return 0
    },

    // ===== 3a. Inline Editing =====
    isCellEditable: function (field) {
      if (!this.editable) return false
      if (this.editableColumns.length === 0) return true
      return this.editableColumns.indexOf(field) !== -1
    },

    isEditingCell: function (row, field) {
      if (!this.editingCell) return false
      return this.editingCell.rowId === row.id && this.editingCell.field === field
    },

    startCellEdit: function (row, rowIndex, col) {
      if (!this.isCellEditable(col.field)) return
      var val = this.getCellValue(row, col)
      this.editingCell = { rowId: row.id, field: col.field, rowIndex: rowIndex }
      this.editCellValue = val !== null && val !== undefined ? String(val) : ''
      this.editCellOldValue = this.editCellValue
      this.editValidationError = false

      var self = this
      this.$nextTick(function () {
        var refKey = 'edit-' + row.id + '-' + col.field
        var els = self.$refs[refKey]
        if (els) {
          var el = Array.isArray(els) ? els[0] : els
          if (el) el.focus()
        }
      })
    },

    saveCellEdit: function () {
      if (!this.editingCell) return
      var newValue = this.editCellValue
      var oldValue = this.editCellOldValue

      // Find column config to check required
      var field = this.editingCell.field
      var col = null
      for (var i = 0; i < this.columns.length; i++) {
        if (this.columns[i].field === field) {
          col = this.columns[i]
          break
        }
      }

      // Validation: check required
      if (col && col.required && (!newValue || !newValue.trim())) {
        this.editValidationError = true
        return
      }

      if (newValue !== oldValue) {
        // Find the row
        var row = null
        for (var j = 0; j < this.data.length; j++) {
          if (this.data[j].id === this.editingCell.rowId) {
            row = this.data[j]
            break
          }
        }
        this.$emit('cell-edit', {
          row: row,
          field: field,
          oldValue: oldValue,
          newValue: newValue
        })
      }

      this.editingCell = null
      this.editCellValue = ''
      this.editCellOldValue = ''
      this.editValidationError = false
    },

    cancelCellEdit: function () {
      this.editingCell = null
      this.editCellValue = ''
      this.editCellOldValue = ''
      this.editValidationError = false
    },

    tabToNextCell: function (event) {
      if (!this.editingCell) return

      // Save current edit first
      var currentField = this.editingCell.field
      var currentRowIndex = this.editingCell.rowIndex
      var newValue = this.editCellValue
      var oldValue = this.editCellOldValue

      // Find the row for the emit
      var row = null
      for (var r = 0; r < this.data.length; r++) {
        if (this.data[r].id === this.editingCell.rowId) {
          row = this.data[r]
          break
        }
      }

      if (newValue !== oldValue) {
        this.$emit('cell-edit', {
          row: row,
          field: currentField,
          oldValue: oldValue,
          newValue: newValue
        })
      }

      // Find next editable cell in same row
      var editableCols = []
      for (var i = 0; i < this.visibleColumns.length; i++) {
        if (this.isCellEditable(this.visibleColumns[i].field)) {
          editableCols.push(this.visibleColumns[i])
        }
      }

      var currentEditableIdx = -1
      for (var j = 0; j < editableCols.length; j++) {
        if (editableCols[j].field === currentField) {
          currentEditableIdx = j
          break
        }
      }

      var nextIdx = event.shiftKey ? currentEditableIdx - 1 : currentEditableIdx + 1

      if (nextIdx >= 0 && nextIdx < editableCols.length) {
        // Next editable cell in same row
        this.editingCell = null
        var self = this
        this.$nextTick(function () {
          self.startCellEdit(self.data[currentRowIndex], currentRowIndex, editableCols[nextIdx])
        })
      } else if (!event.shiftKey && nextIdx >= editableCols.length && currentRowIndex + 1 < this.data.length) {
        // Move to first editable cell of next row
        this.editingCell = null
        var self2 = this
        this.$nextTick(function () {
          self2.startCellEdit(self2.data[currentRowIndex + 1], currentRowIndex + 1, editableCols[0])
        })
      } else if (event.shiftKey && nextIdx < 0 && currentRowIndex > 0) {
        // Move to last editable cell of previous row
        this.editingCell = null
        var self3 = this
        this.$nextTick(function () {
          self3.startCellEdit(self3.data[currentRowIndex - 1], currentRowIndex - 1, editableCols[editableCols.length - 1])
        })
      } else {
        this.editingCell = null
        this.editCellValue = ''
        this.editCellOldValue = ''
        this.editValidationError = false
      }
    },

    // ===== 3b. Column Chooser =====
    openColumnMenu: function (event, col) {
      this.columnMenuTarget = col
      this.columnMenuVisible = true

      var x = event.clientX
      var y = event.clientY
      var self = this

      this.$nextTick(function () {
        var menuEl = self.$refs.columnMenu
        if (menuEl) {
          var menuRect = menuEl.getBoundingClientRect()
          var viewportW = window.innerWidth
          var viewportH = window.innerHeight

          // Flip horizontally if needed
          if (x + menuRect.width > viewportW - 8) {
            x = viewportW - menuRect.width - 8
          }
          // Flip vertically if needed
          if (y + menuRect.height > viewportH - 8) {
            y = viewportH - menuRect.height - 8
          }

          if (x < 8) x = 8
          if (y < 8) y = 8

          self.columnMenuPosition = {
            top: y + 'px',
            left: x + 'px'
          }
        }
      })
    },

    closeColumnMenu: function () {
      this.columnMenuVisible = false
      this.columnMenuTarget = null
    },

    toggleColumnVisibility: function (field) {
      // Must have at least one column visible
      var visibleCount = 0
      for (var i = 0; i < this.columns.length; i++) {
        if (!this.hiddenColumns[this.columns[i].field]) visibleCount++
      }

      if (this.hiddenColumns[field]) {
        // Show the column
        this.$set(this.hiddenColumns, field, false)
      } else {
        // Hide the column, but only if more than 1 visible
        if (visibleCount > 1) {
          this.$set(this.hiddenColumns, field, true)
        }
      }
      // Feature 2: Persist preferences after column visibility change
      this.savePreferences()
    },

    resetColumns: function () {
      this.hiddenColumns = {}
      this.columnWidths = {}
      // Feature 2: Also reset persisted preferences
      this.resetPreferences()
      this.closeColumnMenu()
    },

    // ===== 3c. Export to CSV =====
    exportToCsv: function () {
      var cols = this.visibleColumns
      var rows = this.exportDataSource

      // Build CSV header
      var csvLines = []
      var headerLine = []
      for (var h = 0; h < cols.length; h++) {
        headerLine.push(this.escapeCsvField(cols[h].label))
      }
      csvLines.push(headerLine.join(','))

      // Build CSV data rows
      for (var r = 0; r < rows.length; r++) {
        var line = []
        for (var c = 0; c < cols.length; c++) {
          var val = this.getCellValue(rows[r], cols[c])
          line.push(this.escapeCsvField(val !== null && val !== undefined ? String(val) : ''))
        }
        csvLines.push(line.join(','))
      }

      var csvContent = csvLines.join('\n')
      var blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      var url = URL.createObjectURL(blob)

      var now = new Date()
      var dateStr = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0')
      var baseName = this.exportFileName || (this.entityName + '-export')
      var fileName = baseName + '-' + dateStr + '.csv'

      var link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },

    escapeCsvField: function (value) {
      if (value == null) return ''
      var str = String(value)
      if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1 || str.indexOf('\r') !== -1) {
        return '"' + str.replace(/"/g, '""') + '"'
      }
      return str
    },

    // ===== 3d. Column Resize =====
    getHeaderStyle: function (col, colIdx) {
      var style = {}
      var field = col.field
      if (this.columnWidths[field]) {
        style.width = this.columnWidths[field] + 'px'
        style.minWidth = this.columnWidths[field] + 'px'
        style.maxWidth = this.columnWidths[field] + 'px'
      } else {
        style.width = col.width || 'auto'
        style.minWidth = col.minWidth || '100px'
      }
      if (this.frozenFirstColumn && colIdx === 0) {
        style.position = 'sticky'
        style.left = this.selectable ? '40px' : '0px'
        style.zIndex = '3'
      }
      return style
    },

    getCellStyle: function (col, colIdx) {
      var style = {}
      var field = col.field
      if (this.columnWidths[field]) {
        style.width = this.columnWidths[field] + 'px'
        style.minWidth = this.columnWidths[field] + 'px'
        style.maxWidth = this.columnWidths[field] + 'px'
      }
      if (this.frozenFirstColumn && colIdx === 0) {
        style.position = 'sticky'
        style.left = this.selectable ? '40px' : '0px'
        style.zIndex = '2'
        style.background = 'inherit'
      }
      return style
    },

    startResize: function (event, col, colIdx) {
      this.resizing = true
      this.resizeCol = col

      // Get current width of the column header
      var headerEls = this.$refs.gridTable
        ? this.$refs.gridTable.querySelectorAll('thead th.grid-header')
        : []
      var thIndex = this.selectable ? colIdx + 1 : colIdx
      var th = headerEls[thIndex]
      var startWidth = th ? th.getBoundingClientRect().width : 150

      this.resizeStartX = event.clientX
      this.resizeStartWidth = startWidth

      var self = this
      var onMouseMove = function (e) {
        var diff = e.clientX - self.resizeStartX
        var newWidth = Math.max(60, self.resizeStartWidth + diff)
        self.$set(self.columnWidths, self.resizeCol.field, newWidth)
      }
      var onMouseUp = function () {
        self.resizing = false
        self.resizeCol = null
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        // Feature 2: Save preferences after resize completes (debounced)
        self.debouncedSavePreferences()
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },

    autoFitColumn: function (col) {
      if (!col) return
      var table = this.$refs.gridTable
      if (!table) return

      // Find the column index among visible columns
      var visIdx = -1
      for (var i = 0; i < this.visibleColumns.length; i++) {
        if (this.visibleColumns[i].field === col.field) {
          visIdx = i
          break
        }
      }
      if (visIdx === -1) return

      var cellIndex = this.selectable ? visIdx + 1 : visIdx

      // Measure all cells in this column (skip group header rows)
      var rows = table.querySelectorAll('tbody tr:not(.grid-group-header-row)')
      var maxWidth = 60
      for (var r = 0; r < rows.length; r++) {
        var cells = rows[r].querySelectorAll('td')
        if (cells[cellIndex]) {
          // Temporarily remove width constraints to measure natural width
          var cell = cells[cellIndex]
          var oldStyle = cell.style.cssText
          cell.style.width = 'auto'
          cell.style.minWidth = 'auto'
          cell.style.maxWidth = 'none'
          cell.style.whiteSpace = 'nowrap'
          var w = cell.scrollWidth + 24 // padding
          cell.style.cssText = oldStyle
          if (w > maxWidth) maxWidth = w
        }
      }

      // Also check header
      var headerCells = table.querySelectorAll('thead th')
      if (headerCells[cellIndex]) {
        var hCell = headerCells[cellIndex]
        var oldH = hCell.style.cssText
        hCell.style.width = 'auto'
        hCell.style.minWidth = 'auto'
        hCell.style.maxWidth = 'none'
        hCell.style.whiteSpace = 'nowrap'
        var hw = hCell.scrollWidth + 24
        hCell.style.cssText = oldH
        if (hw > maxWidth) maxWidth = hw
      }

      this.$set(this.columnWidths, col.field, Math.min(maxWidth, 500))
      this.closeColumnMenu()
      // Feature 2: Save after auto-fit
      this.debouncedSavePreferences()
    },

    autoFitAllColumns: function () {
      for (var i = 0; i < this.visibleColumns.length; i++) {
        this.autoFitColumn(this.visibleColumns[i])
      }
      this.closeColumnMenu()
    },

    // ===== Feature 1: Grid Grouping Methods =====
    getColumnLabel: function (field) {
      if (!field) return ''
      for (var i = 0; i < this.columns.length; i++) {
        if (this.columns[i].field === field) {
          return this.columns[i].label
        }
      }
      // Fallback: capitalize the field name
      return field.charAt(0).toUpperCase() + field.slice(1)
    },

    toggleGroup: function (groupKey) {
      var value = groupKey.replace('group-', '')
      this.$set(this.collapsedGroups, value, !this.collapsedGroups[value])
    },

    isGroupCollapsed: function (groupKey) {
      var value = groupKey.replace('group-', '')
      return !!this.collapsedGroups[value]
    },

    handleGroupBy: function (field) {
      if (!field) return
      this.internalGroupBy = field
      this.collapsedGroups = {}
      this.columnMenuVisible = false
      this.columnMenuTarget = null
      // Feature 2: Save preferences after grouping change
      this.savePreferences()
    },

    handleRemoveGrouping: function () {
      this.internalGroupBy = ''
      this.collapsedGroups = {}
      this.columnMenuVisible = false
      this.columnMenuTarget = null
      // Feature 2: Save preferences after grouping removal
      this.savePreferences()
    },

    // ===== Feature 2: Page Personalization Methods =====
    loadPreferences: function () {
      if (!this.persistKey) return
      try {
        var saved = localStorage.getItem('d365-grid-' + this.persistKey)
        if (saved) {
          var prefs = JSON.parse(saved)
          this.savedPreferences = prefs
          if (prefs.hiddenColumns && typeof prefs.hiddenColumns === 'object') {
            this.hiddenColumns = prefs.hiddenColumns
          }
          if (prefs.columnWidths && typeof prefs.columnWidths === 'object') {
            this.columnWidths = prefs.columnWidths
          }
          if (prefs.groupBy && typeof prefs.groupBy === 'string') {
            this.internalGroupBy = prefs.groupBy
          }
        }
      } catch (e) {
        // Ignore localStorage errors (quota, parse errors, etc.)
      }
    },

    savePreferences: function () {
      if (!this.persistKey) return
      try {
        var prefs = {
          hiddenColumns: this.hiddenColumns,
          columnWidths: this.columnWidths,
          groupBy: this.internalGroupBy || ''
        }
        localStorage.setItem('d365-grid-' + this.persistKey, JSON.stringify(prefs))
      } catch (e) {
        // Ignore localStorage errors
      }
    },

    debouncedSavePreferences: function () {
      if (!this.persistKey) return
      var self = this
      if (this.savePreferencesTimer) {
        clearTimeout(this.savePreferencesTimer)
      }
      this.savePreferencesTimer = setTimeout(function () {
        self.savePreferences()
        self.savePreferencesTimer = null
      }, 500)
    },

    resetPreferences: function () {
      if (this.persistKey) {
        try {
          localStorage.removeItem('d365-grid-' + this.persistKey)
        } catch (e) {
          // Ignore
        }
      }
      this.hiddenColumns = {}
      this.columnWidths = {}
      this.internalGroupBy = ''
      this.collapsedGroups = {}
    }
  },

  watch: {
    data: function () {
      this.selectedRows = []
      this.$emit('selection-change', [])
      // Cancel any active edit
      this.cancelCellEdit()
    },

    // Watch for external groupBy prop changes
    groupBy: function (newVal) {
      if (newVal && !this.internalGroupBy) {
        this.collapsedGroups = {}
      }
    }
  },

  mounted: function () {
    var self = this
    this._handleKeydown = function (e) {
      if (e.key === 'Escape') {
        if (self.columnMenuVisible) {
          self.closeColumnMenu()
        }
        if (self.editingCell) {
          self.cancelCellEdit()
        }
      }
    }
    document.addEventListener('keydown', this._handleKeydown)

    // Feature 2: Load persisted preferences on mount
    this.loadPreferences()
  },

  beforeDestroy: function () {
    if (this._handleKeydown) {
      document.removeEventListener('keydown', this._handleKeydown)
    }
    // Clean up debounce timer
    if (this.savePreferencesTimer) {
      clearTimeout(this.savePreferencesTimer)
    }
  }
}
</script>

<style scoped>
.data-grid {
  background: white;
  border: 1px solid #EDEBE9;
  border-radius: 2px;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
}

/* ===== Grid Toolbar ===== */
.grid-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid #EDEBE9;
  background: #FAFAFA;
  min-height: 36px;
}
.grid-toolbar__left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.grid-toolbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.grid-export-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid #C8C6C4;
  border-radius: 2px;
  background: white;
  color: #323130;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s;
}
.grid-export-btn:hover {
  background: #F3F2F1;
  border-color: #8A8886;
}
.grid-export-btn:active {
  background: #EDEBE9;
}
.grid-export-btn__label {
  white-space: nowrap;
}

/* ===== Table ===== */
.grid-table-wrapper {
  overflow-x: auto;
}

.grid-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;
}

/* ===== Header ===== */
.grid-header {
  padding: 0 12px;
  height: 36px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  color: #605E5C;
  background: #FAFAFA;
  border-bottom: 1px solid #EDEBE9;
  user-select: none;
  white-space: nowrap;
  position: relative;
  box-sizing: border-box;
}
.grid-header.sortable {
  cursor: pointer;
}
.grid-header.sortable:hover {
  background: #F3F2F1;
  color: #323130;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 100%;
}
.header-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.sort-indicator {
  color: #0078D4;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

/* ===== Column Resize Handle ===== */
.col-resize-handle {
  position: absolute;
  top: 0;
  right: -2px;
  width: 5px;
  height: 100%;
  cursor: col-resize;
  z-index: 4;
}
.col-resize-handle:hover {
  background: #0078D4;
  opacity: 0.3;
}

/* ===== Rows ===== */
.grid-row {
  height: 42px;
  border-bottom: 1px solid #EDEBE9;
  transition: background-color 0.1s;
  cursor: pointer;
}
.grid-row--alt {
  background-color: #FAFAFA;
}
.grid-row:hover {
  background-color: #F3F2F1;
}
.grid-row.selected {
  background-color: #DEECF9;
  border-left: 3px solid #0078D4;
}

/* ===== Cells ===== */
.grid-cell {
  padding: 0 12px;
  height: 42px;
  color: #323130;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
  box-sizing: border-box;
  position: relative;
}
.grid-cell.cell-link {
  color: #0078D4;
  cursor: pointer;
}
.grid-cell.cell-link:hover {
  text-decoration: underline;
}
.grid-cell.cell-editable {
  cursor: text;
}
.grid-cell.cell-editing {
  padding: 0 2px;
  overflow: visible;
}

/* ===== Inline Edit ===== */
.cell-edit-input,
.cell-edit-select {
  width: 100%;
  height: 34px;
  padding: 0 8px;
  border: 2px solid #0078D4;
  border-radius: 2px;
  font-size: 13px;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #323130;
  background: white;
  outline: none;
  box-sizing: border-box;
}
.cell-edit-input:focus,
.cell-edit-select:focus {
  border-color: #0078D4;
  box-shadow: 0 0 0 1px #0078D4;
}
.cell-edit-input--error {
  border-color: #D13438;
  box-shadow: 0 0 0 1px #D13438;
}

/* ===== Checkbox Column ===== */
.col-checkbox {
  width: 40px;
  min-width: 40px;
  max-width: 40px;
  padding: 0 12px;
  text-align: center;
  vertical-align: middle;
}
.col-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #0078D4;
}

.col-actions {
  width: 80px;
  padding: 0 12px;
  text-align: right;
  vertical-align: middle;
}

/* ===== Frozen Column ===== */
.col-frozen {
  background: white;
  z-index: 2;
}
.grid-row:hover .col-frozen {
  background: #F3F2F1;
}
.grid-row.selected .col-frozen {
  background: #DEECF9;
}
.grid-row--alt .col-frozen {
  background: #FAFAFA;
}
.grid-row--alt:hover .col-frozen {
  background: #F3F2F1;
}
.grid-header.col-frozen {
  background: #FAFAFA;
  z-index: 3;
}

/* ===== Empty State ===== */
.grid-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  text-align: center;
}
.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #323130;
  margin: 12px 0 4px;
}
.empty-subtitle {
  font-size: 13px;
  color: #605E5C;
  margin: 0;
}

/* ===== Pagination ===== */
.grid-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-top: 1px solid #EDEBE9;
  font-size: 13px;
  color: #605E5C;
}

.pagination-info {
  white-space: nowrap;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.per-page-select {
  padding: 4px 8px;
  border: 1px solid #C8C6C4;
  border-radius: 2px;
  font-size: 12px;
  font-family: inherit;
  color: #323130;
  background: white;
  margin-right: 8px;
  cursor: pointer;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border: 1px solid transparent;
  border-radius: 2px;
  background: transparent;
  color: #323130;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
}
.page-btn:hover:not(:disabled):not(.dots) {
  background: #F3F2F1;
  border-color: #C8C6C4;
}
.page-btn.active {
  background: #0078D4;
  color: white;
  border-color: #0078D4;
}
.page-btn:disabled {
  color: #C8C6C4;
  cursor: not-allowed;
}
.page-btn.dots {
  cursor: default;
}

/* ===== Column Context Menu ===== */
.column-context-menu {
  position: fixed;
  z-index: 10000;
  background: white;
  border: 1px solid #EDEBE9;
  border-radius: 2px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  max-height: 400px;
  overflow-y: auto;
  padding: 4px 0;
  font-size: 13px;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
}

.ctx-menu__section-header {
  font-size: 11px;
  font-weight: 600;
  color: #605E5C;
  text-transform: uppercase;
  padding: 8px 12px 4px;
  user-select: none;
}

.ctx-menu__item {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  cursor: pointer;
  color: #323130;
  user-select: none;
  white-space: nowrap;
  transition: background-color 0.08s;
}
.ctx-menu__item:hover {
  background: #F3F2F1;
}

.ctx-menu__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  flex-shrink: 0;
}

.ctx-menu__separator {
  height: 0;
  border-top: 1px solid #EDEBE9;
  margin: 4px 0;
}

.column-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
}

/* Context menu transition */
.ctx-menu-anim-enter-active,
.ctx-menu-anim-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.ctx-menu-anim-enter,
.ctx-menu-anim-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
