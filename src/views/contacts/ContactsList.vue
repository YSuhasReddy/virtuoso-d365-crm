<template>
  <div class="contacts-list-view">
    <!-- Breadcrumb -->
    <div class="px-4 pt-3">
      <Breadcrumb />
    </div>

    <!-- Page Header -->
    <div class="page-header px-4 pb-2">
      <h1 class="page-title">Contacts</h1>
      <span class="record-count text-sm text-gray-500">{{ filteredContacts.length }} records</span>
    </div>

    <!-- Command Bar -->
    <CommandBar
      :actions="commandActions"
      :show-view-switcher="false"
      :show-filter="true"
      :filter-active="showFilters"
      @new="goToNew"
      @delete="confirmDelete"
      @bulk-edit="showBulkEdit = true"
      @refresh="handleRefresh"
      @toggle-filter="showFilters = !showFilters"
    />

    <!-- FilterBuilder Panel (replaces old filter dropdowns) -->
    <transition name="slide">
      <div v-if="showFilters" class="filter-panel">
        <FilterBuilder
          :fields="filterFields"
          :value="filterConditions"
          @change="filterConditions = $event"
          @apply="applyAdvancedFilters"
          @clear="clearAllFilters"
          @close="showFilters = false"
        />
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
          placeholder="Search by name, email, phone, or city..."
          :value="$store.state.contacts.searchQuery"
          @input="setSearch($event.target.value)"
        />
      </div>
    </div>

    <!-- Data Grid with enhanced features -->
    <div class="px-4 pb-4">
      <DataGrid
        :columns="columns"
        :data="paginatedContacts"
        :selectable="true"
        :sort-by="$store.state.contacts.sortBy"
        :sort-dir="$store.state.contacts.sortDir"
        :current-page="$store.state.contacts.currentPage"
        :per-page="$store.state.contacts.perPage"
        :total-items="filteredContacts.length"
        :total-pages="totalPages"
        empty-title="No contacts found"
        empty-subtitle="Try adjusting your filters or create a new contact."
        :editable="true"
        :editable-columns="['name', 'email', 'phone']"
        :show-column-chooser="true"
        :exportable="true"
        export-file-name="contacts"
        entity-name="Contacts"
        :all-data="filteredContacts"
        @sort="handleSort"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
        @page-change="setPage"
        @per-page-change="handlePerPageChange"
        @cell-edit="handleCellEdit"
      >
        <template #cell-name="{ row }">
          <span class="cell-link-text" @click.stop="goToDetail(row.id)">{{ row.name }}</span>
        </template>
        <template #cell-type="{ row }">
          <StatusBadge :status="row.type" />
        </template>
        <template #cell-city="{ row }">
          {{ row.address ? row.address.city : '' }}
        </template>
        <template #cell-businessRelation="{ row }">
          <StatusBadge :status="row.businessRelation" />
        </template>
        <template #cell-salesperson="{ row }">
          {{ getSalespersonName(row.salesperson) }}
        </template>
      </DataGrid>
    </div>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Contact"
      :message="deleteMessage"
      confirm-text="Delete"
      :danger="true"
      @confirm="handleDelete"
      @cancel="showDeleteDialog = false"
    />

    <!-- Bulk Edit Panel -->
    <BulkEditPanel
      :show="showBulkEdit"
      :records="selectedContacts"
      :fields="bulkEditFields"
      entity-name="Contact"
      @close="showBulkEdit = false"
      @apply="handleBulkEdit"
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
import FilterBuilder from '@/components/common/FilterBuilder.vue'
import BulkEditPanel from '@/components/common/BulkEditPanel.vue'
import salespersons from '@/data/salespersons'

export default {
  name: 'ContactsList',
  components: {
    CommandBar,
    DataGrid,
    Breadcrumb,
    ConfirmDialog,
    StatusBadge,
    FilterBuilder,
    BulkEditPanel
  },
  data() {
    return {
      showFilters: false,
      showDeleteDialog: false,
      showBulkEdit: false,
      selectedContacts: [],
      salespersons,
      filterConditions: []
    }
  },
  computed: {
    ...mapGetters('contacts', ['filteredContacts', 'totalPages', 'paginatedContacts', 'allContacts']),

    hasSelection() {
      return this.selectedContacts.length > 0
    },

    commandActions() {
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
          id: 'bulk-edit',
          label: 'Bulk Edit',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M0 2h16v2H0V2zm0 4h10v2H0V6zm0 4h12v2H0v-2zm14-3l2 2-5 5h-2v-2l5-5z"/></svg>',
          disabled: !this.hasSelection,
          event: 'bulk-edit'
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

    columns() {
      return [
        { field: 'name', label: 'Name', link: true, minWidth: '180px', sortable: true },
        { field: 'type', label: 'Type', width: '110px', format: 'badge', sortable: true },
        { field: 'email', label: 'Email', minWidth: '200px', sortable: true },
        { field: 'phone', label: 'Phone', width: '140px', sortable: true },
        { field: 'city', label: 'City', width: '130px', sortable: true },
        { field: 'businessRelation', label: 'Business Relation', width: '150px', format: 'badge', sortable: true },
        { field: 'salesperson', label: 'Salesperson', width: '140px', sortable: true }
      ]
    },

    industries() {
      const set = new Set()
      this.allContacts.forEach(c => {
        if (c.industry) set.add(c.industry)
      })
      return Array.from(set).sort()
    },

    filterFields() {
      return [
        { field: 'name', label: 'Name', type: 'string' },
        { field: 'type', label: 'Type', type: 'select', options: ['Company', 'Person'] },
        { field: 'email', label: 'Email', type: 'string' },
        { field: 'businessRelation', label: 'Business Relation', type: 'select', options: ['Prospect', 'Customer', 'Vendor', 'Partner'] },
        { field: 'industry', label: 'Industry', type: 'select', options: this.industries },
        { field: 'salesperson', label: 'Salesperson', type: 'select', options: this.salespersons.map(function (sp) { return sp.name }) },
        { field: 'createdAt', label: 'Created Date', type: 'date' }
      ]
    },

    bulkEditFields() {
      return [
        { field: 'businessRelation', label: 'Business Relation', type: 'select', options: ['Prospect', 'Customer', 'Vendor', 'Partner'] },
        { field: 'industry', label: 'Industry', type: 'select', options: this.industries },
        { field: 'type', label: 'Type', type: 'select', options: ['Company', 'Person'] },
        { field: 'notes', label: 'Notes', type: 'text' }
      ]
    },

    deleteMessage() {
      if (this.selectedContacts.length === 1) {
        return 'Are you sure you want to delete "' + this.selectedContacts[0].name + '"? This action cannot be undone.'
      }
      return 'Are you sure you want to delete ' + this.selectedContacts.length + ' selected contacts? This action cannot be undone.'
    }
  },
  created() {
    this.$root.$on('shortcut-toggle-filter', this.toggleFilters)
    this.$root.$on('shortcut-refresh', this.handleRefresh)
  },
  beforeDestroy() {
    this.$root.$off('shortcut-toggle-filter', this.toggleFilters)
    this.$root.$off('shortcut-refresh', this.handleRefresh)
  },
  methods: {
    ...mapActions('contacts', ['setFilter', 'setSearch', 'setSort', 'setPage', 'setPerPage', 'deleteContact', 'updateContact']),

    goToNew() {
      this.$router.push('/contacts/new')
    },

    goToDetail(id) {
      this.$router.push('/contacts/' + id)
    },

    handleRowClick(row) {
      this.$router.push('/contacts/' + row.id)
    },

    handleSort({ field, dir }) {
      this.setSort({ sortBy: field, sortDir: dir })
    },

    handleSelectionChange(selected) {
      this.selectedContacts = selected
    },

    handlePerPageChange(perPage) {
      this.setPerPage(perPage)
    },

    handleRefresh() {
      this.$store.dispatch('contacts/initContacts')
    },

    toggleFilters() {
      this.showFilters = !this.showFilters
    },

    confirmDelete() {
      if (this.selectedContacts.length > 0) {
        this.showDeleteDialog = true
      }
    },

    handleDelete() {
      this.selectedContacts.forEach(contact => {
        this.deleteContact(contact.id)
      })
      this.selectedContacts = []
      this.showDeleteDialog = false
      this.$store.dispatch('ui/addAlert', {
        type: 'success',
        title: 'Contact(s) deleted',
        message: 'The selected contacts have been removed.',
        duration: 3000
      })
    },

    getSalespersonName(spId) {
      const sp = this.salespersons.find(s => s.id === spId)
      return sp ? sp.name : spId || ''
    },

    handleCellEdit({ row, field, value }) {
      // Create an updated contact object with the edited field
      var updatedContact = { id: row.id }
      updatedContact[field] = value
      this.updateContact(updatedContact)
      this.$store.dispatch('ui/addAlert', {
        type: 'success',
        title: 'Contact updated',
        message: 'The "' + field + '" field has been updated.',
        duration: 2000
      })
    },

    handleBulkEdit({ updates, recordIds }) {
      var self = this
      recordIds.forEach(function (id) {
        var updateData = { id: id }
        Object.keys(updates).forEach(function (key) {
          updateData[key] = updates[key]
        })
        self.updateContact(updateData)
      })
      this.showBulkEdit = false
      this.selectedContacts = []
      this.$store.dispatch('ui/showSuccess', {
        title: 'Bulk Edit Complete',
        message: recordIds.length + ' contact' + (recordIds.length !== 1 ? 's have' : ' has') + ' been updated.'
      })
    },

    applyAdvancedFilters() {
      var self = this
      // Clear existing store-level filters first
      this.setFilter({ key: 'type', value: '' })
      this.setFilter({ key: 'businessRelation', value: '' })
      this.setFilter({ key: 'industry', value: '' })
      this.setFilter({ key: 'salesperson', value: '' })

      // Apply each condition to the corresponding store filter
      // For simple select/equals conditions, we can map them directly to store filters.
      // For more complex conditions, we apply them locally.
      this.filterConditions.forEach(function (condition) {
        if (!condition.field || !condition.operator) return

        // Map simple equals conditions directly to store filters
        if (condition.operator === 'equals' && condition.value) {
          if (condition.field === 'type') {
            self.setFilter({ key: 'type', value: condition.value })
          } else if (condition.field === 'businessRelation') {
            self.setFilter({ key: 'businessRelation', value: condition.value })
          } else if (condition.field === 'industry') {
            self.setFilter({ key: 'industry', value: condition.value })
          } else if (condition.field === 'salesperson') {
            // The salesperson filter uses id, need to find matching salesperson
            var sp = self.salespersons.find(function (s) { return s.name === condition.value })
            if (sp) {
              self.setFilter({ key: 'salesperson', value: sp.id })
            }
          } else if (condition.field === 'name' || condition.field === 'email') {
            // Use search for name/email equals/contains as a fallback
            self.setSearch(condition.value)
          }
        } else if (condition.operator === 'contains' && condition.value) {
          if (condition.field === 'name' || condition.field === 'email') {
            self.setSearch(condition.value)
          }
        }
      })
    },

    clearAllFilters() {
      this.filterConditions = []
      this.setFilter({ key: 'type', value: '' })
      this.setFilter({ key: 'businessRelation', value: '' })
      this.setFilter({ key: 'industry', value: '' })
      this.setFilter({ key: 'salesperson', value: '' })
      this.setSearch('')
    }
  }
}
</script>

<style scoped>
.contacts-list-view {
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

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
  max-height: 500px;
  overflow: hidden;
}
.slide-enter,
.slide-leave-to {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}
</style>
