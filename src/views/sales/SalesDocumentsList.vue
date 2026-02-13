<template>
  <div class="sales-docs-list-view">
    <!-- Command Bar -->
    <CommandBar
      :actions="commandActions"
      :show-view-switcher="false"
      :show-filter="true"
      :filter-active="showFilters"
      @new="$router.push('/sales/' + routeType + '/new')"
      @delete="confirmDelete"
      @refresh="refreshData"
      @toggle-filter="showFilters = !showFilters"
    />

    <div class="page-content">
      <Breadcrumb />

      <h1 class="page-title">{{ pageTitle }}</h1>

      <!-- Advanced Filter Builder -->
      <transition name="slide">
        <FilterBuilder
          v-if="showFilters"
          :fields="filterFields"
          :value="filterConditions"
          @change="filterConditions = $event"
          @apply="applyAdvancedFilters"
          @clear="clearAllFilters"
          @close="showFilters = false"
        />
      </transition>

      <!-- Search Bar -->
      <div class="search-bar">
        <svg class="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="#A19F9D">
          <path d="M10 6.5a3.5 3.5 0 10-7 0 3.5 3.5 0 007 0zm1.5 0A5 5 0 111 6.5a5 5 0 0110.5 0zM9.354 10.06l3.293 3.293.707-.707-3.293-3.293a5.5 5.5 0 01-.707.707z"/>
        </svg>
        <input
          type="text"
          class="search-input"
          :placeholder="'Search ' + docTypePlural.toLowerCase() + '...'"
          v-model="searchQuery"
        />
      </div>

      <!-- Data Grid -->
      <DataGrid
        :columns="columns"
        :data="paginatedDocuments"
        :selectable="true"
        :sort-by="sortBy"
        :sort-dir="sortDir"
        :current-page="currentPage"
        :per-page="perPage"
        :total-items="filteredDocuments.length"
        :total-pages="totalPages"
        :empty-title="'No ' + docTypePlural.toLowerCase() + ' found'"
        empty-subtitle="Try adjusting your filters or create a new document."
        :show-column-chooser="true"
        :exportable="true"
        :export-file-name="docTypePlural"
        :entity-name="docTypePlural"
        :all-data="filteredDocuments"
        @row-click="onRowClick"
        @sort="onSort"
        @page-change="currentPage = $event"
        @per-page-change="onPerPageChange"
        @selection-change="onSelectionChange"
      >
        <template #cell-number="{ row }">
          <router-link
            :to="'/sales/' + routeType + '/' + row.id"
            class="cell-link"
            @click.stop
          >{{ row.number }}</router-link>
        </template>
        <template #cell-status="{ value }">
          <StatusBadge :status="value" />
        </template>
        <template #cell-subtotal="{ value }">
          {{ $filters.currency(value) }}
        </template>
        <template #cell-total="{ value }">
          <span class="total-value">{{ $filters.currency(value) }}</span>
        </template>
        <template #cell-createdAt="{ value }">
          {{ $filters.date(value) }}
        </template>
      </DataGrid>
    </div>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Documents"
      :message="'Are you sure you want to delete ' + selectedRows.length + ' selected document' + (selectedRows.length === 1 ? '' : 's') + '? This action cannot be undone.'"
      confirm-text="Delete"
      :danger="true"
      @confirm="deleteSelected"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import CommandBar from '@/components/layout/CommandBar.vue'
import DataGrid from '@/components/common/DataGrid.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import FilterBuilder from '@/components/common/FilterBuilder.vue'
import eventBus from '../../utils/eventBus'

export default {
  name: 'SalesDocumentsList',
  components: { CommandBar, DataGrid, Breadcrumb, StatusBadge, ConfirmDialog, FilterBuilder },
  data() {
    return {
      showFilters: false,
      showDeleteDialog: false,
      selectedRows: [],
      searchQuery: '',
      statusFilter: '',
      sortBy: 'createdAt',
      sortDir: 'desc',
      currentPage: 1,
      perPage: 15,
      filterConditions: [],
      advancedFiltersApplied: false,
      columns: [
        { field: 'number', label: 'Number', link: true, width: '130px' },
        { field: 'contactName', label: 'Contact Name', minWidth: '160px' },
        { field: 'status', label: 'Status', format: 'badge', width: '120px' },
        { field: 'subtotal', label: 'Subtotal', format: 'currency', width: '130px' },
        { field: 'total', label: 'Total', format: 'currency', width: '130px' },
        { field: 'createdAt', label: 'Date', format: 'date', width: '130px' }
      ]
    }
  },
  computed: {
    ...mapGetters('sales', ['allDocuments', 'getDocumentsByType']),
    docType() {
      return this.$route.meta.docType || 'Quote'
    },
    routeType() {
      const typeMap = { 'Quote': 'quotes', 'Order': 'orders', 'Invoice': 'invoices' }
      return typeMap[this.docType] || 'quotes'
    },
    docTypePlural() {
      const pluralMap = { 'Quote': 'Quotes', 'Order': 'Orders', 'Invoice': 'Invoices' }
      return pluralMap[this.docType] || 'Documents'
    },
    pageTitle() {
      return 'Sales ' + this.docTypePlural
    },
    statusOptions() {
      const statusMap = {
        'Quote': ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'],
        'Order': ['Processing', 'Shipped', 'Delivered'],
        'Invoice': ['Paid', 'Unpaid', 'Overdue']
      }
      return statusMap[this.docType] || []
    },
    filterFields() {
      var statusOpts = this.statusOptions
      return [
        { field: 'number', label: 'Document Number', type: 'string' },
        { field: 'contactName', label: 'Contact', type: 'string' },
        { field: 'status', label: 'Status', type: 'select', options: statusOpts },
        { field: 'total', label: 'Total Amount', type: 'number' },
        { field: 'createdAt', label: 'Created Date', type: 'date' }
      ]
    },
    documentsOfType() {
      if (this.getDocumentsByType) {
        return this.getDocumentsByType(this.docType) || []
      }
      return (this.allDocuments || []).filter(d => d.type === this.docType)
    },
    filteredDocuments() {
      let docs = [...this.documentsOfType]

      // Apply search
      const query = this.searchQuery.trim().toLowerCase()
      if (query) {
        docs = docs.filter(d => {
          const number = (d.number || '').toLowerCase()
          const contactName = (d.contactName || '').toLowerCase()
          const notes = (d.notes || '').toLowerCase()
          return number.includes(query) || contactName.includes(query) || notes.includes(query)
        })
      }

      // Apply simple status filter (backward compat)
      if (this.statusFilter && !this.advancedFiltersApplied) {
        docs = docs.filter(d => d.status === this.statusFilter)
      }

      // Apply advanced filter conditions
      if (this.advancedFiltersApplied && this.filterConditions.length > 0) {
        docs = this.applyFilterConditions(docs, this.filterConditions)
      }

      // Apply sort
      const dir = this.sortDir === 'asc' ? 1 : -1
      docs.sort((a, b) => {
        let valA = a[this.sortBy]
        let valB = b[this.sortBy]
        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()
        if (valA == null) return 1
        if (valB == null) return -1
        if (valA < valB) return -1 * dir
        if (valA > valB) return 1 * dir
        return 0
      })

      return docs
    },
    totalPages() {
      return Math.ceil(this.filteredDocuments.length / this.perPage)
    },
    paginatedDocuments() {
      const start = (this.currentPage - 1) * this.perPage
      const end = start + this.perPage
      return this.filteredDocuments.slice(start, end)
    },
    commandActions() {
      return [
        {
          id: 'new',
          label: 'New',
          event: 'new',
          primary: true,
          icon: '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" fill="none"/></svg>'
        },
        {
          id: 'delete',
          label: 'Delete',
          event: 'delete',
          disabled: this.selectedRows.length === 0,
          extra: true,
          icon: '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M5 1h4v1H5V1zM2 3h10v1H2V3zm1 1v8a1 1 0 001 1h6a1 1 0 001-1V4H3z"/></svg>'
        },
        {
          id: 'refresh',
          label: 'Refresh',
          event: 'refresh',
          extra: true,
          icon: '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 1a6 6 0 015.917 5H14l-3 3-3-3h1.917A4.002 4.002 0 003 7a4 4 0 007.874 1H12.92A6.002 6.002 0 017 13 6 6 0 017 1z"/></svg>'
        }
      ]
    }
  },
  methods: {
    ...mapActions('sales', ['deleteDocument', 'initDocuments']),
    onRowClick(row) {
      this.$router.push('/sales/' + this.routeType + '/' + row.id)
    },
    onSort({ field, dir }) {
      this.sortBy = field
      this.sortDir = dir
    },
    onPerPageChange(val) {
      this.perPage = val
      this.currentPage = 1
    },
    onSelectionChange(rows) {
      this.selectedRows = rows
    },
    confirmDelete() {
      if (this.selectedRows.length > 0) {
        this.showDeleteDialog = true
      }
    },
    deleteSelected() {
      this.selectedRows.forEach(row => {
        this.deleteDocument(row.id)
      })
      this.selectedRows = []
      this.showDeleteDialog = false
      this.$store.dispatch('ui/showInfo', { title: 'Deleted', message: 'Documents have been deleted.' })
    },
    clearFilters() {
      this.statusFilter = ''
      this.searchQuery = ''
    },
    refreshData() {
      this.initDocuments()
      this.$store.dispatch('ui/showInfo', { title: 'Refreshed', message: this.docTypePlural + ' data has been refreshed.' })
    },
    applyAdvancedFilters() {
      this.advancedFiltersApplied = true
      this.statusFilter = ''
      this.currentPage = 1
    },
    clearAllFilters() {
      this.filterConditions = []
      this.advancedFiltersApplied = false
      this.statusFilter = ''
      this.searchQuery = ''
      this.currentPage = 1
    },
    applyFilterConditions(docs, conditions) {
      var validConditions = conditions.filter(function (c) {
        return c.field && c.operator
      })
      if (validConditions.length === 0) return docs

      return docs.filter(function (doc) {
        var result = true
        for (var i = 0; i < validConditions.length; i++) {
          var cond = validConditions[i]
          var fieldValue = doc[cond.field]
          var match = false

          // Normalize values for comparison
          var docVal = fieldValue != null ? String(fieldValue).toLowerCase() : ''
          var filterVal = cond.value != null ? String(cond.value).toLowerCase() : ''

          switch (cond.operator) {
            case 'equals':
              match = docVal === filterVal
              break
            case 'not_equals':
              match = docVal !== filterVal
              break
            case 'contains':
              match = docVal.indexOf(filterVal) !== -1
              break
            case 'begins_with':
              match = docVal.indexOf(filterVal) === 0
              break
            case 'ends_with':
              match = docVal.lastIndexOf(filterVal) === (docVal.length - filterVal.length) && filterVal.length > 0
              break
            case 'greater_than':
              match = parseFloat(fieldValue) > parseFloat(cond.value)
              break
            case 'less_than':
              match = parseFloat(fieldValue) < parseFloat(cond.value)
              break
            case 'is_empty':
              match = !fieldValue || String(fieldValue).trim() === ''
              break
            case 'is_not_empty':
              match = !!fieldValue && String(fieldValue).trim() !== ''
              break
            case 'before':
              match = docVal < filterVal
              break
            case 'after':
              match = docVal > filterVal
              break
            case 'today':
              var todayStr = new Date().toISOString().split('T')[0]
              var dueDateStr = fieldValue ? new Date(fieldValue).toISOString().split('T')[0] : ''
              match = dueDateStr === todayStr
              break
            case 'this_week':
              var now = new Date()
              var startOfWeek = new Date(now)
              startOfWeek.setDate(now.getDate() - now.getDay())
              startOfWeek.setHours(0, 0, 0, 0)
              var endOfWeek = new Date(startOfWeek)
              endOfWeek.setDate(startOfWeek.getDate() + 6)
              endOfWeek.setHours(23, 59, 59, 999)
              var fieldDate = fieldValue ? new Date(fieldValue) : null
              match = fieldDate ? (fieldDate >= startOfWeek && fieldDate <= endOfWeek) : false
              break
            case 'this_month':
              var thisMonth = new Date()
              var fieldDt = fieldValue ? new Date(fieldValue) : null
              match = fieldDt ? (fieldDt.getMonth() === thisMonth.getMonth() && fieldDt.getFullYear() === thisMonth.getFullYear()) : false
              break
            default:
              match = true
          }

          // Apply conjunction logic
          if (i === 0) {
            result = match
          } else if (cond.conjunction === 'OR') {
            result = result || match
          } else {
            result = result && match
          }
        }
        return result
      })
    },
    handleRefresh() {
      this.refreshData()
    },
    handleNew() {
      this.$router.push('/sales/' + this.routeType + '/new')
    }
  },
  mounted() {
    eventBus.on('shortcut-refresh', this.handleRefresh)
    eventBus.on('shortcut-new', this.handleNew)
  },
  beforeUnmount() {
    eventBus.off('shortcut-refresh', this.handleRefresh)
    eventBus.off('shortcut-new', this.handleNew)
  },
  watch: {
    docType() {
      // Reset local state when navigating between different document types
      this.statusFilter = ''
      this.searchQuery = ''
      this.currentPage = 1
      this.selectedRows = []
      this.filterConditions = []
      this.advancedFiltersApplied = false
    }
  }
}
</script>

<style scoped>
.sales-docs-list-view {
  min-height: 100%;
}

.page-content {
  padding: 0 24px 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #323130;
  margin: 0 0 12px 0;
}

/* Search Bar */
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #FFFFFF;
  border: 1px solid #EDEBE9;
  border-radius: 2px;
  margin-bottom: 12px;
}
.search-icon {
  flex-shrink: 0;
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  font-family: inherit;
  color: #323130;
  background: transparent;
}
.search-input::placeholder {
  color: #A19F9D;
}

/* Cell Styles */
.cell-link {
  color: #0078D4;
  text-decoration: none;
  cursor: pointer;
}
.cell-link:hover {
  text-decoration: underline;
}
.total-value {
  font-weight: 600;
  color: #323130;
}

/* Transitions */
.slide-enter-active, .slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 768px) {
  .page-content {
    padding: 0 12px 12px;
  }
}
</style>
