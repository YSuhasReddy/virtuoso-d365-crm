<template>
  <div class="activities-list-view">
    <!-- Command Bar -->
    <CommandBar
      :actions="commandActions"
      :show-view-switcher="false"
      :show-filter="true"
      :filter-active="showFilters"
      @new="$router.push('/activities/new')"
      @complete="completeSelected"
      @delete="confirmDelete"
      @bulk-edit="showBulkEdit = true"
      @refresh="refreshData"
      @toggle-filter="showFilters = !showFilters"
    />

    <div class="page-content">
      <Breadcrumb />

      <h1 class="page-title">Activities</h1>

      <!-- Summary Bar -->
      <div class="summary-bar">
        <div class="summary-item summary-overdue">
          <span class="summary-count">{{ overdueActivities.length }}</span>
          <span class="summary-label">overdue</span>
        </div>
        <span class="summary-sep">|</span>
        <div class="summary-item summary-today">
          <span class="summary-count">{{ todayActivities.length }}</span>
          <span class="summary-label">due today</span>
        </div>
        <span class="summary-sep">|</span>
        <div class="summary-item summary-upcoming">
          <span class="summary-count">{{ upcomingActivities.length }}</span>
          <span class="summary-label">upcoming</span>
        </div>
      </div>

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
          placeholder="Search activities..."
          :value="searchQuery"
          @input="setSearch($event.target.value)"
        />
      </div>

      <!-- Data Grid -->
      <DataGrid
        :columns="columns"
        :data="paginatedActivities"
        :selectable="true"
        :sort-by="sortBy"
        :sort-dir="sortDir"
        :current-page="currentPage"
        :per-page="perPage"
        :total-items="filteredActivities.length"
        :total-pages="totalPages"
        empty-title="No activities found"
        empty-subtitle="Try adjusting your filters or create a new activity."
        :editable="true"
        :editable-columns="['subject', 'priority']"
        :show-column-chooser="true"
        :exportable="true"
        export-file-name="activities"
        entity-name="Activities"
        :all-data="filteredActivities"
        @row-click="onRowClick"
        @sort="onSort"
        @page-change="setPage"
        @per-page-change="setPerPage"
        @selection-change="onSelectionChange"
        @cell-edit="handleCellEdit"
      >
        <template #cell-type="{ value }">
          <StatusBadge :status="value" />
        </template>
        <template #cell-contactName="{ row }">
          <router-link
            v-if="row.contactId"
            :to="'/contacts/' + row.contactId"
            class="cell-link"
            @click.stop
          >{{ row.contactName || row.contactId }}</router-link>
          <span v-else class="text-muted">--</span>
        </template>
        <template #cell-dueDate="{ row }">
          <span :class="{ 'overdue-text': isOverdue(row) }">
            {{ $filters.date(row.dueDate) }}
          </span>
        </template>
        <template #cell-priority="{ value }">
          <StatusBadge :status="value" />
        </template>
        <template #cell-status="{ value }">
          <StatusBadge :status="value" />
        </template>
      </DataGrid>
    </div>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Activities"
      :message="'Are you sure you want to delete ' + selectedRows.length + ' selected activit' + (selectedRows.length === 1 ? 'y' : 'ies') + '? This action cannot be undone.'"
      confirm-text="Delete"
      :danger="true"
      @confirm="deleteSelected"
      @cancel="showDeleteDialog = false"
    />

    <!-- Bulk Edit Panel -->
    <BulkEditPanel
      :show="showBulkEdit"
      :records="selectedRows"
      :fields="bulkEditFields"
      entity-name="Activity"
      @close="showBulkEdit = false"
      @apply="handleBulkEdit"
    />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import CommandBar from '@/components/layout/CommandBar.vue'
import DataGrid from '@/components/common/DataGrid.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import FilterBuilder from '@/components/common/FilterBuilder.vue'
import BulkEditPanel from '@/components/common/BulkEditPanel.vue'
import salespersons from '@/data/salespersons'
import eventBus from '../../utils/eventBus'

export default {
  name: 'ActivitiesList',
  components: { CommandBar, DataGrid, Breadcrumb, StatusBadge, ConfirmDialog, FilterBuilder, BulkEditPanel },
  data() {
    return {
      showFilters: false,
      showDeleteDialog: false,
      showBulkEdit: false,
      selectedRows: [],
      salespersons,
      filterConditions: [],
      advancedFiltersApplied: false,
      columns: [
        { field: 'type', label: 'Type', format: 'badge', width: '100px' },
        { field: 'subject', label: 'Subject', minWidth: '200px' },
        { field: 'contactName', label: 'Contact', minWidth: '140px' },
        { field: 'dueDate', label: 'Due Date', format: 'date', width: '130px' },
        { field: 'priority', label: 'Priority', format: 'badge', width: '100px' },
        { field: 'status', label: 'Status', format: 'badge', width: '110px' },
        { field: 'salespersonName', label: 'Salesperson', minWidth: '130px' }
      ]
    }
  },
  computed: {
    ...mapState('activities', {
      filters: state => state.filters,
      searchQuery: state => state.searchQuery,
      sortBy: state => state.sortBy,
      sortDir: state => state.sortDir,
      currentPage: state => state.currentPage,
      perPage: state => state.perPage
    }),
    ...mapGetters('activities', [
      'filteredActivities',
      'paginatedActivities',
      'totalPages',
      'overdue',
      'todayActivities',
      'upcoming'
    ]),
    ...mapGetters('contacts', ['getContactById']),
    overdueActivities() {
      return this.overdue || []
    },
    upcomingActivities() {
      return this.upcoming || []
    },
    filterFields() {
      return [
        { field: 'subject', label: 'Subject', type: 'string' },
        { field: 'type', label: 'Type', type: 'select', options: ['Task', 'Call', 'Email', 'Meeting'] },
        { field: 'status', label: 'Status', type: 'select', options: ['Open', 'Completed', 'Cancelled'] },
        { field: 'priority', label: 'Priority', type: 'select', options: ['High', 'Normal', 'Low'] },
        { field: 'dueDate', label: 'Due Date', type: 'date' }
      ]
    },
    bulkEditFields() {
      return [
        { field: 'status', label: 'Status', type: 'select', options: ['Open', 'Completed', 'Cancelled'] },
        { field: 'priority', label: 'Priority', type: 'select', options: ['High', 'Normal', 'Low'] },
        { field: 'type', label: 'Type', type: 'select', options: ['Task', 'Call', 'Email', 'Meeting'] }
      ]
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
          id: 'complete',
          label: 'Complete',
          event: 'complete',
          disabled: this.selectedRows.length === 0,
          icon: '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M2 7l3.5 3.5L12 3" stroke="currentColor" stroke-width="2" fill="none"/></svg>'
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
          id: 'bulk-edit',
          label: 'Bulk Edit',
          event: 'bulk-edit',
          disabled: this.selectedRows.length === 0,
          extra: true,
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M0 2h16v2H0V2zm0 4h10v2H0V6zm0 4h12v2H0v-2zm14-3l2 2-5 5h-2v-2l5-5z"/></svg>'
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
    ...mapActions('activities', [
      'setFilter',
      'setSearch',
      'setSort',
      'setPage',
      'setPerPage',
      'completeActivity',
      'deleteActivity',
      'updateActivity',
      'initActivities'
    ]),
    isOverdue(row) {
      if (row.status !== 'Open') return false
      const today = new Date().toISOString().split('T')[0]
      const dueStr = row.dueDate ? new Date(row.dueDate).toISOString().split('T')[0] : ''
      return dueStr < today
    },
    onSort({ field, dir }) {
      this.setSort({ sortBy: field, sortDir: dir })
    },
    onRowClick() {
      // Highlight selected row (handled by DataGrid selection)
    },
    onSelectionChange(rows) {
      this.selectedRows = rows
    },
    completeSelected() {
      this.selectedRows.forEach(row => {
        if (row.status === 'Open') {
          this.completeActivity(row.id)
        }
      })
      this.selectedRows = []
      this.$store.dispatch('ui/showInfo', { title: 'Success', message: 'Activities marked as completed.' })
    },
    confirmDelete() {
      if (this.selectedRows.length > 0) {
        this.showDeleteDialog = true
      }
    },
    deleteSelected() {
      this.selectedRows.forEach(row => {
        this.deleteActivity(row.id)
      })
      this.selectedRows = []
      this.showDeleteDialog = false
      this.$store.dispatch('ui/showInfo', { title: 'Deleted', message: 'Activities have been deleted.' })
    },
    handleBulkEdit({ updates, recordIds }) {
      var self = this
      recordIds.forEach(function (id) {
        var updateData = { id: id }
        Object.keys(updates).forEach(function (key) {
          updateData[key] = updates[key]
        })
        self.updateActivity(updateData)
      })
      this.showBulkEdit = false
      this.selectedRows = []
      this.$store.dispatch('ui/showSuccess', {
        title: 'Bulk Edit Complete',
        message: recordIds.length + ' activit' + (recordIds.length !== 1 ? 'ies have' : 'y has') + ' been updated.'
      })
    },
    clearFilters() {
      this.setFilter({ key: 'type', value: '' })
      this.setFilter({ key: 'status', value: '' })
      this.setFilter({ key: 'salesperson', value: '' })
      this.setSearch('')
    },
    refreshData() {
      this.initActivities()
      this.$store.dispatch('ui/showInfo', { title: 'Refreshed', message: 'Activities data has been refreshed.' })
    },
    getSalespersonName(spId) {
      const sp = this.salespersons.find(s => s.id === spId)
      return sp ? sp.name : spId || ''
    },
    getContactName(contactId) {
      if (!contactId) return ''
      const contact = this.getContactById(contactId)
      return contact ? contact.name : contactId
    },
    handleCellEdit(editData) {
      if (!editData || !editData.row || !editData.field) return
      var updatedActivity = {
        id: editData.row.id
      }
      updatedActivity[editData.field] = editData.value
      this.updateActivity(updatedActivity)
      this.$store.dispatch('ui/showInfo', { title: 'Updated', message: 'Activity ' + editData.field + ' has been updated.' })
    },
    applyAdvancedFilters() {
      this.advancedFiltersApplied = true
      // Clear the store-level filters when using advanced filter builder
      this.setFilter({ key: 'type', value: '' })
      this.setFilter({ key: 'status', value: '' })
      this.setFilter({ key: 'salesperson', value: '' })
    },
    clearAllFilters() {
      this.filterConditions = []
      this.advancedFiltersApplied = false
      this.clearFilters()
    },
    handleRefresh() {
      this.refreshData()
    },
    handleNew() {
      this.$router.push('/activities/new')
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
  created() {
    // Enrich paginated activities with resolved names
  },
  watch: {
    paginatedActivities: {
      handler(activities) {
        // Enrich data with contact and salesperson names for display
        activities.forEach(a => {
          if (!a.contactName && a.contactId) {
            a.contactName = this.getContactName(a.contactId)
          }
          if (!a.salespersonName) {
            a.salespersonName = this.getSalespersonName(a.salesperson)
          }
        })
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.activities-list-view {
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

/* Summary Bar */
.summary-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #FFFFFF;
  border: 1px solid #EDEBE9;
  border-radius: 2px;
  margin-bottom: 16px;
  font-size: 13px;
}
.summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.summary-count {
  font-weight: 700;
  font-size: 15px;
}
.summary-label {
  color: #605E5C;
}
.summary-overdue .summary-count {
  color: #D13438;
}
.summary-today .summary-count {
  color: #FF8C00;
}
.summary-upcoming .summary-count {
  color: #0078D4;
}
.summary-sep {
  color: #C8C6C4;
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
.text-muted {
  color: #A19F9D;
}
.overdue-text {
  color: #D13438;
  font-weight: 600;
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
  .summary-bar {
    flex-wrap: wrap;
  }
}
</style>
