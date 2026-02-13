<template>
  <div class="items-list-view">
    <!-- Breadcrumb -->
    <div class="px-4 pt-3">
      <Breadcrumb />
    </div>

    <!-- Page Header -->
    <div class="page-header px-4 pb-2">
      <h1 class="page-title">Items</h1>
      <span class="record-count text-sm text-gray-500">{{ filteredItems.length }} records</span>
    </div>

    <!-- Command Bar -->
    <CommandBar
      :actions="commandActions"
      :show-view-switcher="false"
      :show-filter="true"
      :filter-active="showFilters"
      @new="goToNew"
      @delete="confirmDelete"
      @refresh="handleRefresh"
      @toggle-filter="showFilters = !showFilters"
    />

    <!-- Filter Panel -->
    <transition name="slide">
      <div v-if="showFilters" class="filter-panel">
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">Type</label>
            <select class="filter-select" :value="$store.state.items.filters.type" @change="setFilter({ key: 'type', value: $event.target.value })">
              <option value="">All Types</option>
              <option value="Inventory">Inventory</option>
              <option value="Service">Service</option>
              <option value="Non-Inventory">Non-Inventory</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Category</label>
            <select class="filter-select" :value="$store.state.items.filters.category" @change="setFilter({ key: 'category', value: $event.target.value })">
              <option value="">All Categories</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <button class="clear-filters-btn" @click="clearAllFilters">Clear Filters</button>
        </div>
      </div>
    </transition>

    <!-- Search Bar -->
    <div class="search-bar px-4 py-2">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="#A19F9D">
          <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85zm-5.242.656a5 5 0 110-10 5 5 0 010 10z"/>
        </svg>
        <input
          type="text"
          class="search-input"
          placeholder="Search by name, number, description, or vendor..."
          :value="$store.state.items.searchQuery"
          @input="setSearch($event.target.value)"
        />
      </div>
    </div>

    <!-- Data Grid -->
    <div class="px-4 pb-4">
      <DataGrid
        :columns="columns"
        :data="paginatedItems"
        :selectable="true"
        :sort-by="$store.state.items.sortBy"
        :sort-dir="$store.state.items.sortDir"
        :current-page="$store.state.items.currentPage"
        :per-page="$store.state.items.perPage"
        :total-items="filteredItems.length"
        :total-pages="totalPages"
        empty-title="No items found"
        empty-subtitle="Try adjusting your filters or create a new item."
        :show-column-chooser="true"
        :exportable="true"
        export-file-name="items"
        entity-name="Items"
        :all-data="filteredItems"
        @sort="handleSort"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
        @page-change="setPage"
        @per-page-change="handlePerPageChange"
      >
        <template #cell-number="{ row }">
          <span class="cell-link-text" @click.stop="goToDetail(row.id)">{{ row.number }}</span>
        </template>
        <template #cell-name="{ row }">
          <span class="cell-link-text" @click.stop="goToDetail(row.id)">{{ row.name }}</span>
        </template>
        <template #cell-type="{ row }">
          <StatusBadge :status="row.type" />
        </template>
        <template #cell-unitPrice="{ row }">
          {{ $filters.currency(row.unitPrice) }}
        </template>
        <template #cell-unitCost="{ row }">
          {{ $filters.currency(row.unitCost) }}
        </template>
        <template #cell-inventoryQty="{ row }">
          <span v-if="row.type === 'Inventory'" :class="{ 'low-stock': isLowStock(row) }">
            {{ row.inventory ? row.inventory.quantity : 0 }}
          </span>
          <span v-else class="text-gray-400">--</span>
        </template>
        <template #cell-blocked="{ row }">
          <StatusBadge v-if="row.blocked" status="Blocked" />
          <span v-else class="text-gray-400">Active</span>
        </template>
      </DataGrid>
    </div>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Item"
      :message="deleteMessage"
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
import DataGrid from '@/components/common/DataGrid.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import eventBus from '../../utils/eventBus'

export default {
  name: 'ItemsList',
  components: {
    CommandBar,
    DataGrid,
    Breadcrumb,
    ConfirmDialog,
    StatusBadge
  },
  data: function () {
    return {
      showFilters: false,
      showDeleteDialog: false,
      selectedItems: []
    }
  },
  computed: {
    ...mapGetters('items', ['filteredItems', 'totalPages', 'paginatedItems', 'allItems']),

    hasSelection: function () {
      return this.selectedItems.length > 0
    },

    commandActions: function () {
      return [
        {
          id: 'new',
          label: 'New',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
          primary: true,
          event: 'new'
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M5 2V1h6v1h4v1H1V2h4zm1 3v8h1V5H6zm3 0v8h1V5H9zM3 4v10h10V4H3z"/></svg>',
          disabled: !this.hasSelection,
          event: 'delete'
        },
        {
          id: 'refresh',
          label: 'Refresh',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.65 2.35A7.958 7.958 0 008 0C3.58 0 .01 3.58.01 8S3.58 16 8 16c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 018 14 6 6 0 012 8a6 6 0 016-6c1.66 0 3.14.69 4.22 1.78L9 7h7V0l-2.35 2.35z"/></svg>',
          extra: true,
          event: 'refresh'
        }
      ]
    },

    columns: function () {
      return [
        { field: 'number', label: 'Number', link: true, width: '120px', sortable: true },
        { field: 'name', label: 'Name', link: true, minWidth: '200px', sortable: true },
        { field: 'type', label: 'Type', width: '120px', format: 'badge', sortable: true },
        { field: 'category', label: 'Category', width: '120px', sortable: true },
        { field: 'unitPrice', label: 'Unit Price', width: '120px', format: 'currency', sortable: true },
        { field: 'unitCost', label: 'Unit Cost', width: '110px', format: 'currency', sortable: true },
        { field: 'inventoryQty', label: 'Inventory Qty', width: '120px', sortable: false },
        { field: 'unitOfMeasure', label: 'UoM', width: '80px', sortable: true },
        { field: 'blocked', label: 'Status', width: '100px', sortable: true }
      ]
    },

    categories: function () {
      var set = {}
      this.allItems.forEach(function (item) {
        if (item.category) set[item.category] = true
      })
      return Object.keys(set).sort()
    },

    deleteMessage: function () {
      if (this.selectedItems.length === 1) {
        return 'Are you sure you want to delete "' + this.selectedItems[0].name + '"? This action cannot be undone.'
      }
      return 'Are you sure you want to delete ' + this.selectedItems.length + ' selected items? This action cannot be undone.'
    }
  },
  created: function () {
    var self = this
    this._toggleFilters = function () { self.showFilters = !self.showFilters }
    this._handleRefresh = function () { self.handleRefresh() }
    eventBus.on('shortcut-toggle-filter', this._toggleFilters)
    eventBus.on('shortcut-refresh', this._handleRefresh)
  },
  beforeUnmount: function () {
    eventBus.off('shortcut-toggle-filter', this._toggleFilters)
    eventBus.off('shortcut-refresh', this._handleRefresh)
  },
  methods: {
    ...mapActions('items', ['setFilter', 'setSearch', 'setSort', 'setPage', 'setPerPage', 'deleteItem']),

    goToNew: function () {
      this.$router.push('/items/new')
    },

    goToDetail: function (id) {
      this.$router.push('/items/' + id)
    },

    handleRowClick: function (row) {
      this.$router.push('/items/' + row.id)
    },

    handleSort: function (payload) {
      this.setSort({ sortBy: payload.field, sortDir: payload.dir })
    },

    handleSelectionChange: function (selected) {
      this.selectedItems = selected
    },

    handlePerPageChange: function (perPage) {
      this.setPerPage(perPage)
    },

    handleRefresh: function () {
      this.$store.dispatch('items/initItems')
    },

    confirmDelete: function () {
      if (this.selectedItems.length > 0) {
        this.showDeleteDialog = true
      }
    },

    handleDelete: function () {
      var self = this
      this.selectedItems.forEach(function (item) {
        self.deleteItem(item.id)
      })
      this.selectedItems = []
      this.showDeleteDialog = false
      this.$store.dispatch('ui/addAlert', {
        type: 'success',
        title: 'Item(s) deleted',
        message: 'The selected items have been removed.',
        duration: 3000
      })
    },

    clearAllFilters: function () {
      this.setFilter({ key: 'type', value: '' })
      this.setFilter({ key: 'category', value: '' })
      this.setSearch('')
    },

    isLowStock: function (item) {
      return item.type === 'Inventory' &&
        item.inventory &&
        item.inventory.quantity <= item.inventory.reorderPoint
    }
  }
}
</script>

<style scoped>
.items-list-view {
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
}

.record-count {
  font-size: 13px;
  color: #605E5C;
}

/* Filter Panel */
.filter-panel {
  padding: 12px 16px;
  background: #FAFAFA;
  border-bottom: 1px solid #EDEBE9;
}

.filter-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: #605E5C;
}

.filter-select {
  padding: 5px 28px 5px 8px;
  font-size: 13px;
  font-family: inherit;
  border: 1px solid #C8C6C4;
  border-radius: 2px;
  outline: none;
  background: #FFFFFF;
  color: #323130;
  min-width: 160px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23605E5C' d='M2.5 4.5l3.5 3.5 3.5-3.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
}
.filter-select:focus {
  border-color: #0078D4;
}

.clear-filters-btn {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  font-size: 13px;
  font-family: inherit;
  color: #0078D4;
  background: transparent;
  border: 1px solid #C8C6C4;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.1s;
}
.clear-filters-btn:hover {
  background: #DEECF9;
  border-color: #0078D4;
}

/* Search Bar */
.search-input-wrapper {
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
  width: 100%;
  padding: 6px 10px 6px 32px;
  font-size: 13px;
  font-family: inherit;
  color: #323130;
  background: #FFFFFF;
  border: 1px solid #C8C6C4;
  border-radius: 2px;
  outline: none;
  transition: border-color 0.1s;
}
.search-input:focus {
  border-color: #0078D4;
}

.cell-link-text {
  color: #0078D4;
  cursor: pointer;
}
.cell-link-text:hover {
  text-decoration: underline;
}

.low-stock {
  color: #D13438;
  font-weight: 600;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
  max-height: 500px;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}
</style>
