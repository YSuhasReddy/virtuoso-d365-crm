<template>
  <div class="campaigns-list-view">
    <!-- Breadcrumb -->
    <div class="px-4 pt-3">
      <Breadcrumb />
    </div>

    <!-- Page Header -->
    <div class="page-header px-4 pb-2">
      <h1 class="page-title">Campaigns</h1>
      <span class="record-count text-sm text-gray-500">{{ filteredCampaigns.length }} records</span>
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

    <!-- Filters Panel -->
    <transition name="slide">
      <div v-if="showFilters" class="filter-panel">
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">Status</label>
            <select class="filter-select" :value="$store.state.campaigns.filters.status" @change="setFilter({ key: 'status', value: $event.target.value })">
              <option value="">All Statuses</option>
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Type</label>
            <select class="filter-select" :value="$store.state.campaigns.filters.type" @change="setFilter({ key: 'type', value: $event.target.value })">
              <option value="">All Types</option>
              <option value="Email">Email</option>
              <option value="Event">Event</option>
              <option value="Social Media">Social Media</option>
              <option value="Direct Mail">Direct Mail</option>
              <option value="Webinar">Webinar</option>
              <option value="Trade Show">Trade Show</option>
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
          placeholder="Search by name, number, description, or salesperson..."
          :value="$store.state.campaigns.searchQuery"
          @input="setSearch($event.target.value)"
        />
      </div>
    </div>

    <!-- Data Grid -->
    <div class="px-4 pb-4">
      <DataGrid
        :columns="columns"
        :data="paginatedCampaigns"
        :selectable="true"
        :sort-by="$store.state.campaigns.sortBy"
        :sort-dir="$store.state.campaigns.sortDir"
        :current-page="$store.state.campaigns.currentPage"
        :per-page="$store.state.campaigns.perPage"
        :total-items="filteredCampaigns.length"
        :total-pages="totalPages"
        empty-title="No campaigns found"
        empty-subtitle="Try adjusting your filters or create a new campaign."
        entity-name="Campaigns"
        :all-data="filteredCampaigns"
        @sort="handleSort"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
        @page-change="setPage"
        @per-page-change="handlePerPageChange"
      >
        <template #cell-name="{ row }">
          <span class="cell-link-text" @click.stop="goToDetail(row.id)">{{ row.name }}</span>
        </template>
        <template #cell-status="{ row }">
          <span class="status-badge" :class="statusClass(row.status)">{{ row.status }}</span>
        </template>
        <template #cell-type="{ row }">
          <StatusBadge :status="row.type" />
        </template>
        <template #cell-startDate="{ row }">
          {{ $filters.date(row.startDate) }}
        </template>
        <template #cell-endDate="{ row }">
          {{ $filters.date(row.endDate) }}
        </template>
        <template #cell-budget="{ row }">
          {{ $filters.currency(row.budget) }}
        </template>
        <template #cell-actualCost="{ row }">
          {{ $filters.currency(row.actualCost) }}
        </template>
        <template #cell-successRate="{ row }">
          {{ row.successRate }}%
        </template>
      </DataGrid>
    </div>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Campaign"
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
  name: 'CampaignsList',
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
      selectedCampaigns: []
    }
  },
  computed: {
    ...mapGetters('campaigns', ['filteredCampaigns', 'totalPages', 'paginatedCampaigns']),

    hasSelection: function () {
      return this.selectedCampaigns.length > 0
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
        { field: 'number', label: 'Number', width: '120px', sortable: true },
        { field: 'name', label: 'Name', link: true, minWidth: '200px', sortable: true },
        { field: 'status', label: 'Status', width: '120px', format: 'badge', sortable: true },
        { field: 'type', label: 'Type', width: '130px', format: 'badge', sortable: true },
        { field: 'startDate', label: 'Start Date', width: '130px', sortable: true },
        { field: 'endDate', label: 'End Date', width: '130px', sortable: true },
        { field: 'budget', label: 'Budget', width: '120px', sortable: true },
        { field: 'actualCost', label: 'Actual Cost', width: '120px', sortable: true },
        { field: 'responses', label: 'Responses', width: '110px', sortable: true },
        { field: 'successRate', label: 'Success Rate', width: '120px', sortable: true }
      ]
    },

    deleteMessage: function () {
      if (this.selectedCampaigns.length === 1) {
        return 'Are you sure you want to delete "' + this.selectedCampaigns[0].name + '"? This action cannot be undone.'
      }
      return 'Are you sure you want to delete ' + this.selectedCampaigns.length + ' selected campaigns? This action cannot be undone.'
    }
  },
  created: function () {
    eventBus.on('shortcut-toggle-filter', this.toggleFilters)
    eventBus.on('shortcut-refresh', this.handleRefresh)
  },
  beforeUnmount: function () {
    eventBus.off('shortcut-toggle-filter', this.toggleFilters)
    eventBus.off('shortcut-refresh', this.handleRefresh)
  },
  methods: {
    ...mapActions('campaigns', ['setFilter', 'setSearch', 'setSort', 'setPage', 'setPerPage', 'deleteCampaign']),

    goToNew: function () {
      this.$router.push('/campaigns/new')
    },

    goToDetail: function (id) {
      this.$router.push('/campaigns/' + id)
    },

    handleRowClick: function (row) {
      this.$router.push('/campaigns/' + row.id)
    },

    handleSort: function ({ field, dir }) {
      this.setSort({ sortBy: field, sortDir: dir })
    },

    handleSelectionChange: function (selected) {
      this.selectedCampaigns = selected
    },

    handlePerPageChange: function (perPage) {
      this.setPerPage(perPage)
    },

    handleRefresh: function () {
      this.$store.dispatch('campaigns/initCampaigns')
    },

    toggleFilters: function () {
      this.showFilters = !this.showFilters
    },

    confirmDelete: function () {
      if (this.selectedCampaigns.length > 0) {
        this.showDeleteDialog = true
      }
    },

    handleDelete: function () {
      var self = this
      this.selectedCampaigns.forEach(function (campaign) {
        self.deleteCampaign(campaign.id)
      })
      this.selectedCampaigns = []
      this.showDeleteDialog = false
      this.$store.dispatch('ui/addAlert', {
        type: 'success',
        title: 'Campaign(s) deleted',
        message: 'The selected campaigns have been removed.',
        duration: 3000
      })
    },

    clearAllFilters: function () {
      this.setFilter({ key: 'status', value: '' })
      this.setFilter({ key: 'type', value: '' })
      this.setSearch('')
    },

    statusClass: function (status) {
      switch (status) {
        case 'Active': return 'status-active'
        case 'Planning': return 'status-planning'
        case 'Completed': return 'status-completed'
        case 'Cancelled': return 'status-cancelled'
        default: return ''
      }
    }
  }
}
</script>

<style scoped>
.campaigns-list-view {
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
  padding: 5px 8px;
  font-size: 13px;
  font-family: inherit;
  color: #323130;
  background: #FFFFFF;
  border: 1px solid #C8C6C4;
  border-radius: 2px;
  outline: none;
  min-width: 160px;
}
.filter-select:focus {
  border-color: #0078D4;
}

.clear-filters-btn {
  padding: 5px 12px;
  font-size: 13px;
  font-family: inherit;
  color: #0078D4;
  background: transparent;
  border: 1px solid #C8C6C4;
  border-radius: 2px;
  cursor: pointer;
}
.clear-filters-btn:hover {
  background: #F3F2F1;
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

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
}

.status-active {
  background-color: #DFF6DD;
  color: #0B6A0B;
}

.status-planning {
  background-color: #DEECF9;
  color: #004578;
}

.status-completed {
  background-color: #F3F2F1;
  color: #605E5C;
}

.status-cancelled {
  background-color: #FDE7E9;
  color: #D13438;
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
