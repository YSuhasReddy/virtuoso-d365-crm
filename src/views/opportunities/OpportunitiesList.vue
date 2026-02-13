<template>
  <div class="opportunities-list">
    <!-- Breadcrumb -->
    <div class="page-header">
      <Breadcrumb :items="breadcrumbs" />
      <h1 class="page-title">Opportunities</h1>
    </div>

    <!-- Command Bar -->
    <CommandBar
      :actions="commandActions"
      :show-view-switcher="false"
      :show-filter="true"
      :filter-active="showFilters"
      @new="handleNew"
      @delete="handleDeleteSelected"
      @bulk-edit="showBulkEdit = true"
      @pipeline="handlePipelineView"
      @refresh="handleRefresh"
      @toggle-filter="showFilters = !showFilters"
    />

    <!-- Search Bar -->
    <div class="search-bar">
      <div class="search-wrapper">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="#605E5C">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
        </svg>
        <input
          type="text"
          class="d365-field-input search-input"
          placeholder="Search opportunities..."
          :value="searchQuery"
          @input="handleSearch($event.target.value)"
        />
        <button v-if="searchQuery" class="search-clear" @click="handleSearch('')">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M3.5 2.086L6 4.586l2.5-2.5L9.914 3.5 7.414 6l2.5 2.5-1.414 1.414L6 7.414l-2.5 2.5L2.086 8.5l2.5-2.5-2.5-2.5L3.5 2.086z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Legacy Filter Panel (kept as quick filters) -->
    <transition name="slide">
      <div v-if="showFilters && !showAdvancedFilters" class="filter-panel">
        <div class="filter-panel-header">
          <span class="filter-panel-title">Quick Filters</span>
          <button class="d365-cmd-btn" @click="showAdvancedFilters = true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M1 1h12l-5 6v4l-2 1V7L1 1z"/></svg>
            Advanced Filters
          </button>
        </div>
        <div class="filter-grid">
          <div class="filter-group">
            <label class="d365-field-label">Status</label>
            <select
              class="d365-field-input"
              :value="filters.status"
              @change="applyFilter('status', $event.target.value)"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="d365-field-label">Stage</label>
            <select
              class="d365-field-input"
              :value="filters.stage"
              @change="applyFilter('stage', $event.target.value)"
            >
              <option value="">All Stages</option>
              <option value="Qualification">Qualification</option>
              <option value="Development">Development</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="d365-field-label">Priority</label>
            <select
              class="d365-field-input"
              :value="filters.priority"
              @change="applyFilter('priority', $event.target.value)"
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="d365-field-label">Salesperson</label>
            <select
              class="d365-field-input"
              :value="filters.salesperson"
              @change="applyFilter('salesperson', $event.target.value)"
            >
              <option value="">All Salespersons</option>
              <option v-for="sp in salespersons" :key="sp.id" :value="sp.id">{{ sp.name }}</option>
            </select>
          </div>
        </div>
        <div class="filter-actions">
          <button class="d365-cmd-btn" @click="clearAllFilters">Clear All Filters</button>
        </div>
      </div>
    </transition>

    <!-- Advanced FilterBuilder -->
    <FilterBuilder
      v-if="showAdvancedFilters"
      :fields="filterFields"
      :value="filterConditions"
      @change="filterConditions = $event"
      @apply="applyAdvancedFilters"
      @clear="clearAdvancedFilters"
      @close="showAdvancedFilters = false"
    />

    <!-- Data Grid with enhanced features -->
    <DataGrid
      :columns="columns"
      :data="displayedOpportunities"
      :selectable="true"
      :sort-by="sortBy"
      :sort-dir="sortDir"
      :current-page="currentPage"
      :per-page="perPage"
      :total-items="effectiveFilteredOpportunities.length"
      :total-pages="effectiveTotalPages"
      :editable="true"
      :editable-columns="['estimatedValue', 'probability']"
      :show-column-chooser="true"
      :exportable="true"
      export-file-name="opportunities"
      entity-name="Opportunities"
      :all-data="effectiveFilteredOpportunities"
      empty-title="No opportunities found"
      empty-subtitle="Try adjusting your filters or create a new opportunity."
      @row-click="handleRowClick"
      @sort="handleSort"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
      @selection-change="handleSelectionChange"
      @cell-edit="handleCellEdit"
    />

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Opportunities"
      :message="deleteMessage"
      confirm-text="Delete"
      :danger="true"
      @confirm="confirmDelete"
      @cancel="showDeleteDialog = false"
    />

    <!-- Bulk Edit Panel -->
    <BulkEditPanel
      :show="showBulkEdit"
      :records="selectedRows"
      :fields="bulkEditFields"
      entity-name="Opportunity"
      @close="showBulkEdit = false"
      @apply="handleBulkEdit"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import CommandBar from '@/components/layout/CommandBar.vue'
import DataGrid from '@/components/common/DataGrid.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import FilterBuilder from '@/components/common/FilterBuilder.vue'
import BulkEditPanel from '@/components/common/BulkEditPanel.vue'
import salespersons from '@/data/salespersons'

export default {
  name: 'OpportunitiesList',

  components: {
    CommandBar,
    DataGrid,
    Breadcrumb,
    ConfirmDialog,
    FilterBuilder,
    BulkEditPanel
  },

  data() {
    return {
      showFilters: false,
      showAdvancedFilters: false,
      showDeleteDialog: false,
      showBulkEdit: false,
      selectedRows: [],
      salespersons: salespersons,
      filterConditions: [],
      breadcrumbs: [
        { label: 'Home', path: '/dashboard' },
        { label: 'Opportunities' }
      ],
      columns: [
        { field: 'name', label: 'Name', link: true, sortable: true, minWidth: '200px' },
        { field: 'contactName', label: 'Contact', sortable: true, minWidth: '140px' },
        { field: 'currentStage', label: 'Stage', format: 'badge', sortable: true, minWidth: '120px' },
        { field: 'estimatedValue', label: 'Estimated Value', format: 'currency', sortable: true, minWidth: '130px' },
        { field: 'probability', label: 'Probability (%)', sortable: true, minWidth: '110px' },
        { field: 'estimatedCloseDate', label: 'Close Date', format: 'date', sortable: true, minWidth: '110px' },
        { field: 'priority', label: 'Priority', format: 'badge', sortable: true, minWidth: '90px' },
        { field: 'status', label: 'Status', format: 'badge', sortable: true, minWidth: '80px' }
      ],
      filterFields: [
        { field: 'name', label: 'Name', type: 'string' },
        { field: 'status', label: 'Status', type: 'select', options: ['Open', 'Won', 'Lost'] },
        { field: 'currentStage', label: 'Stage', type: 'select', options: ['Qualification', 'Development', 'Proposal', 'Negotiation'] },
        { field: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
        { field: 'estimatedValue', label: 'Estimated Value', type: 'number' },
        { field: 'estimatedCloseDate', label: 'Close Date', type: 'date' },
        { field: 'probability', label: 'Probability %', type: 'number' }
      ]
    }
  },

  computed: {
    ...mapState('opportunities', {
      searchQuery: function (state) { return state.searchQuery },
      sortBy: function (state) { return state.sortBy },
      sortDir: function (state) { return state.sortDir },
      currentPage: function (state) { return state.currentPage },
      perPage: function (state) { return state.perPage },
      filters: function (state) { return state.filters }
    }),
    ...mapGetters('opportunities', [
      'paginatedOpportunities',
      'filteredOpportunities',
      'totalPages'
    ]),

    // Apply advanced filter conditions on top of store-filtered data
    advancedFilteredOpportunities: function () {
      if (!this.filterConditions || this.filterConditions.length === 0) {
        return this.filteredOpportunities
      }

      var conditions = this.filterConditions
      return this.filteredOpportunities.filter(function (opp) {
        return conditions.every(function (cond) {
          if (!cond.field || !cond.operator) return true
          var val = opp[cond.field]
          var condVal = cond.value

          // Normalize for comparison
          var strVal = val !== null && val !== undefined ? String(val).toLowerCase() : ''
          var strCondVal = condVal !== null && condVal !== undefined ? String(condVal).toLowerCase() : ''

          switch (cond.operator) {
            case 'contains':
              return strVal.indexOf(strCondVal) !== -1
            case 'equals':
              return strVal === strCondVal
            case 'not_equals':
              return strVal !== strCondVal
            case 'starts_with':
              return strVal.indexOf(strCondVal) === 0
            case 'ends_with':
              return strVal.indexOf(strCondVal, strVal.length - strCondVal.length) !== -1
            case 'greater_than':
              return parseFloat(val) > parseFloat(condVal)
            case 'less_than':
              return parseFloat(val) < parseFloat(condVal)
            case 'greater_equal':
              return parseFloat(val) >= parseFloat(condVal)
            case 'less_equal':
              return parseFloat(val) <= parseFloat(condVal)
            case 'is_empty':
              return !val || String(val).trim() === ''
            case 'is_not_empty':
              return val && String(val).trim() !== ''
            case 'before':
              return val && condVal && new Date(val) < new Date(condVal)
            case 'after':
              return val && condVal && new Date(val) > new Date(condVal)
            default:
              return true
          }
        })
      })
    },

    // Use advanced filtered results when conditions exist, otherwise use store-filtered
    effectiveFilteredOpportunities: function () {
      if (this.filterConditions && this.filterConditions.length > 0) {
        return this.advancedFilteredOpportunities
      }
      return this.filteredOpportunities
    },

    effectiveTotalPages: function () {
      return Math.ceil(this.effectiveFilteredOpportunities.length / this.perPage)
    },

    displayedOpportunities: function () {
      if (this.filterConditions && this.filterConditions.length > 0) {
        var start = (this.currentPage - 1) * this.perPage
        var end = start + this.perPage
        return this.advancedFilteredOpportunities.slice(start, end)
      }
      return this.paginatedOpportunities
    },

    commandActions: function () {
      return [
        {
          id: 'new',
          label: 'New',
          event: 'new',
          primary: true,
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" fill="none"/></svg>'
        },
        {
          id: 'delete',
          label: 'Delete',
          event: 'delete',
          disabled: this.selectedRows.length === 0,
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1z"/></svg>'
        },
        {
          id: 'bulk-edit',
          label: 'Bulk Edit',
          event: 'bulk-edit',
          disabled: this.selectedRows.length === 0,
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M0 2h16v2H0V2zm0 4h10v2H0V6zm0 4h12v2H0v-2zm14-3l2 2-5 5h-2v-2l5-5z"/></svg>'
        },
        {
          id: 'pipeline',
          label: 'Pipeline View',
          event: 'pipeline',
          extra: true,
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h3v12H2V2zm4.5 2h3v10h-3V4zM11 6h3v8h-3V6z"/></svg>'
        },
        {
          id: 'refresh',
          label: 'Refresh',
          event: 'refresh',
          extra: true,
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 1 1 .908-.418A6 6 0 1 1 8 2v1z"/><path d="M8 1v4l3-2-3-2z"/></svg>'
        }
      ]
    },

    bulkEditFields: function () {
      return [
        { field: 'status', label: 'Status', type: 'select', options: ['Open', 'Won', 'Lost'] },
        { field: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
        { field: 'currentStage', label: 'Stage', type: 'select', options: ['Qualification', 'Development', 'Proposal', 'Negotiation'] },
        { field: 'probability', label: 'Probability (%)', type: 'number' },
        { field: 'estimatedCloseDate', label: 'Close Date', type: 'date' }
      ]
    },

    deleteMessage: function () {
      var count = this.selectedRows.length
      if (count === 1) {
        return 'Are you sure you want to delete "' + this.selectedRows[0].name + '"? This action cannot be undone.'
      }
      return 'Are you sure you want to delete ' + count + ' opportunities? This action cannot be undone.'
    }
  },

  mounted: function () {
    var self = this
    this._shortcutRefresh = function () {
      self.handleRefresh()
    }
    this._shortcutSave = function () {
      // No save action on list view; treat as no-op
    }
    this.$root.$on('shortcut-refresh', this._shortcutRefresh)
    this.$root.$on('shortcut-save', this._shortcutSave)
  },

  beforeDestroy: function () {
    this.$root.$off('shortcut-refresh', this._shortcutRefresh)
    this.$root.$off('shortcut-save', this._shortcutSave)
  },

  methods: {
    ...mapActions('opportunities', [
      'setFilter',
      'setSearch',
      'setSort',
      'setPage',
      'deleteOpportunity',
      'updateOpportunity'
    ]),

    handleNew: function () {
      this.$router.push('/opportunities/new')
    },

    handlePipelineView: function () {
      this.$router.push('/opportunities/pipeline')
    },

    handleRefresh: function () {
      this.$store.dispatch('opportunities/initOpportunities')
    },

    handleRowClick: function (row) {
      this.$router.push('/opportunities/' + row.id)
    },

    handleSearch: function (query) {
      this.setSearch(query)
    },

    handleSort: function (payload) {
      this.setSort({ sortBy: payload.field, sortDir: payload.dir })
    },

    handlePageChange: function (page) {
      this.setPage(page)
    },

    handlePerPageChange: function () {
      this.$store.commit('opportunities/SET_PAGE', 1)
      this.$store.commit('opportunities/SET_SORT', { sortBy: this.sortBy, sortDir: this.sortDir })
      this.setPage(1)
    },

    handleSelectionChange: function (rows) {
      this.selectedRows = rows
    },

    applyFilter: function (key, value) {
      this.setFilter({ key: key, value: value })
    },

    clearAllFilters: function () {
      this.setFilter({ key: 'status', value: '' })
      this.setFilter({ key: 'stage', value: '' })
      this.setFilter({ key: 'priority', value: '' })
      this.setFilter({ key: 'salesperson', value: '' })
      this.filterConditions = []
    },

    // Advanced FilterBuilder methods
    applyAdvancedFilters: function () {
      // filterConditions are already set reactively via @change
      // Reset to page 1 when applying new filters
      this.setPage(1)
    },

    clearAdvancedFilters: function () {
      this.filterConditions = []
      this.setPage(1)
    },

    handleDeleteSelected: function () {
      if (this.selectedRows.length > 0) {
        this.showDeleteDialog = true
      }
    },

    confirmDelete: function () {
      var self = this
      this.selectedRows.forEach(function (row) {
        self.deleteOpportunity(row.id)
      })
      this.selectedRows = []
      this.showDeleteDialog = false
    },

    handleBulkEdit: function (payload) {
      var self = this
      var updates = payload.updates
      var recordIds = payload.recordIds
      recordIds.forEach(function (id) {
        var updateData = { id: id }
        Object.keys(updates).forEach(function (key) {
          updateData[key] = updates[key]
        })
        self.updateOpportunity(updateData)
      })
      this.showBulkEdit = false
      this.selectedRows = []
      this.$store.dispatch('ui/showSuccess', {
        title: 'Bulk Edit Complete',
        message: recordIds.length + ' opportunit' + (recordIds.length !== 1 ? 'ies have' : 'y has') + ' been updated.'
      })
    },

    // Inline cell edit handler for DataGrid
    handleCellEdit: function (payload) {
      if (!payload || !payload.row || !payload.field) return

      var updateData = {
        id: payload.row.id
      }

      // Parse numeric values for number fields
      if (payload.field === 'estimatedValue') {
        var numVal = parseFloat(payload.newValue)
        if (isNaN(numVal) || numVal < 0) return
        updateData.estimatedValue = numVal
      } else if (payload.field === 'probability') {
        var probVal = parseFloat(payload.newValue)
        if (isNaN(probVal) || probVal < 0 || probVal > 100) return
        updateData.probability = probVal
      } else {
        updateData[payload.field] = payload.newValue
      }

      this.updateOpportunity(updateData)
    }
  }
}
</script>

<style scoped>
.opportunities-list {
  padding: 0 24px 24px;
}

.page-header {
  padding: 16px 0 8px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #323130;
  margin: 4px 0 12px;
}

/* Search Bar */
.search-bar {
  padding: 12px 0;
}
.search-wrapper {
  position: relative;
  max-width: 400px;
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.search-input {
  padding-left: 34px;
  padding-right: 32px;
}
.search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #605E5C;
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
  display: flex;
  align-items: center;
}
.search-clear:hover {
  background: #F3F2F1;
  color: #323130;
}

/* Filter Panel */
.filter-panel {
  background: #FFFFFF;
  border: 1px solid #EDEBE9;
  border-radius: 2px;
  padding: 16px;
  margin-bottom: 12px;
}
.filter-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.filter-panel-title {
  font-size: 13px;
  font-weight: 600;
  color: #323130;
}
.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.filter-group {
  display: flex;
  flex-direction: column;
}
.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #EDEBE9;
}

/* Slide transition */
.slide-enter-active, .slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-enter, .slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-bottom: 0;
}
</style>
