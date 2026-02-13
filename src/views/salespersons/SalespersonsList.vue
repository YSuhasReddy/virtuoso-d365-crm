<template>
  <div class="salespersons-list-view">
    <!-- Breadcrumb -->
    <div class="px-4 pt-3">
      <Breadcrumb />
    </div>

    <!-- Page Header -->
    <div class="page-header px-4 pb-2">
      <h1 class="page-title">Salespersons</h1>
      <span class="record-count text-sm text-gray-500">{{ filteredSalespersons.length }} records</span>
    </div>

    <!-- Command Bar -->
    <CommandBar
      :actions="commandActions"
      :show-view-switcher="false"
      :show-filter="false"
      @new="goToNew"
      @delete="confirmDelete"
      @refresh="handleRefresh"
    />

    <!-- Search Bar -->
    <div class="search-bar px-4 py-2">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="#A19F9D">
          <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85zm-5.242.656a5 5 0 110-10 5 5 0 010 10z"/>
        </svg>
        <input
          type="text"
          class="search-input"
          placeholder="Search by name, email, or role..."
          :value="$store.state.salespersons.searchQuery"
          @input="setSearch($event.target.value)"
        />
      </div>
    </div>

    <!-- Data Table -->
    <div class="px-4 pb-4">
      <div class="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="table-header-cell w-8">
                  <input
                    type="checkbox"
                    :checked="allSelected"
                    @change="toggleSelectAll"
                    class="cursor-pointer"
                  />
                </th>
                <th class="table-header-cell" @click="handleSort('id')">
                  Code
                  <span v-if="$store.state.salespersons.sortBy === 'id'" class="sort-indicator">{{ $store.state.salespersons.sortDir === 'asc' ? '&#9650;' : '&#9660;' }}</span>
                </th>
                <th class="table-header-cell" @click="handleSort('name')">
                  Name
                  <span v-if="$store.state.salespersons.sortBy === 'name'" class="sort-indicator">{{ $store.state.salespersons.sortDir === 'asc' ? '&#9650;' : '&#9660;' }}</span>
                </th>
                <th class="table-header-cell" @click="handleSort('email')">
                  Email
                  <span v-if="$store.state.salespersons.sortBy === 'email'" class="sort-indicator">{{ $store.state.salespersons.sortDir === 'asc' ? '&#9650;' : '&#9660;' }}</span>
                </th>
                <th class="table-header-cell">Phone</th>
                <th class="table-header-cell" @click="handleSort('role')">
                  Role
                  <span v-if="$store.state.salespersons.sortBy === 'role'" class="sort-indicator">{{ $store.state.salespersons.sortDir === 'asc' ? '&#9650;' : '&#9660;' }}</span>
                </th>
                <th class="table-header-cell text-right" @click="handleSort('target')">
                  Target
                  <span v-if="$store.state.salespersons.sortBy === 'target'" class="sort-indicator">{{ $store.state.salespersons.sortDir === 'asc' ? '&#9650;' : '&#9660;' }}</span>
                </th>
                <th class="table-header-cell text-right">Pipeline Value</th>
                <th class="table-header-cell text-right">Won Revenue</th>
                <th class="table-header-cell text-right">Win Rate</th>
                <th class="table-header-cell text-right">Target Achievement</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedSalespersons.length === 0">
                <td colspan="11" class="px-4 py-12 text-center text-gray-500">
                  <p class="text-base font-semibold text-gray-700">No salespersons found</p>
                  <p class="text-sm text-gray-500 mt-1">Try adjusting your search or create a new salesperson.</p>
                </td>
              </tr>
              <tr
                v-for="sp in paginatedSalespersons"
                :key="sp.id"
                class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                :class="{ 'bg-blue-50': isSelected(sp.id) }"
                @click="handleRowClick(sp)"
              >
                <td class="table-cell w-8">
                  <input
                    type="checkbox"
                    :checked="isSelected(sp.id)"
                    @click.stop
                    @change="toggleSelect(sp)"
                    class="cursor-pointer"
                  />
                </td>
                <td class="table-cell font-mono text-xs text-gray-500">{{ sp.id }}</td>
                <td class="table-cell">
                  <span class="cell-link-text" @click.stop="goToDetail(sp.id)">{{ sp.name }}</span>
                </td>
                <td class="table-cell text-gray-600">{{ sp.email }}</td>
                <td class="table-cell text-gray-600">{{ sp.phone }}</td>
                <td class="table-cell">
                  <span class="role-badge">{{ sp.role }}</span>
                </td>
                <td class="table-cell text-right">{{ sp.target | currency }}</td>
                <td class="table-cell text-right">{{ getStats(sp.id).pipelineValue | currency }}</td>
                <td class="table-cell text-right">{{ getStats(sp.id).wonRevenue | currency }}</td>
                <td class="table-cell text-right">
                  <span :class="winRateClass(getStats(sp.id).winRate)">
                    {{ getStats(sp.id).winRate }}%
                  </span>
                </td>
                <td class="table-cell text-right">
                  <div class="flex items-center justify-end gap-2">
                    <div class="w-16 h-2 bg-gray-200 rounded overflow-hidden">
                      <div
                        class="h-full rounded"
                        :class="achievementBarClass(getStats(sp.id).targetAchievement)"
                        :style="{ width: Math.min(getStats(sp.id).targetAchievement, 100) + '%' }"
                      ></div>
                    </div>
                    <span :class="achievementTextClass(getStats(sp.id).targetAchievement)" class="text-xs font-medium whitespace-nowrap">
                      {{ getStats(sp.id).targetAchievement }}%
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div class="text-xs text-gray-500">
            Showing {{ paginationStart }} - {{ paginationEnd }} of {{ filteredSalespersons.length }}
          </div>
          <div class="flex items-center gap-1">
            <button
              class="pagination-btn"
              :disabled="$store.state.salespersons.currentPage <= 1"
              @click="setPage($store.state.salespersons.currentPage - 1)"
            >
              &lsaquo;
            </button>
            <button
              v-for="page in totalPages"
              :key="page"
              class="pagination-btn"
              :class="{ 'pagination-btn-active': page === $store.state.salespersons.currentPage }"
              @click="setPage(page)"
            >
              {{ page }}
            </button>
            <button
              class="pagination-btn"
              :disabled="$store.state.salespersons.currentPage >= totalPages"
              @click="setPage($store.state.salespersons.currentPage + 1)"
            >
              &rsaquo;
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Salesperson"
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
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

export default {
  name: 'SalespersonsList',
  components: {
    CommandBar,
    Breadcrumb,
    ConfirmDialog
  },
  data: function () {
    return {
      selectedSalespersons: [],
      showDeleteDialog: false
    }
  },
  computed: {
    ...mapGetters('salespersons', ['filteredSalespersons', 'totalPages', 'paginatedSalespersons', 'salespersonStats']),

    hasSelection: function () {
      return this.selectedSalespersons.length > 0
    },

    allSelected: function () {
      if (this.paginatedSalespersons.length === 0) return false
      var self = this
      return this.paginatedSalespersons.every(function (sp) {
        return self.selectedSalespersons.some(function (s) { return s.id === sp.id })
      })
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

    paginationStart: function () {
      var page = this.$store.state.salespersons.currentPage
      var perPage = this.$store.state.salespersons.perPage
      return (page - 1) * perPage + 1
    },

    paginationEnd: function () {
      var page = this.$store.state.salespersons.currentPage
      var perPage = this.$store.state.salespersons.perPage
      var end = page * perPage
      return Math.min(end, this.filteredSalespersons.length)
    },

    deleteMessage: function () {
      if (this.selectedSalespersons.length === 1) {
        return 'Are you sure you want to delete "' + this.selectedSalespersons[0].name + '"? This action cannot be undone.'
      }
      return 'Are you sure you want to delete ' + this.selectedSalespersons.length + ' selected salespersons? This action cannot be undone.'
    }
  },
  created: function () {
    this.$root.$on('shortcut-refresh', this.handleRefresh)
  },
  beforeDestroy: function () {
    this.$root.$off('shortcut-refresh', this.handleRefresh)
  },
  methods: {
    ...mapActions('salespersons', ['setSearch', 'setSort', 'setPage', 'deleteSalesperson']),

    getStats: function (spId) {
      var stats = this.salespersonStats[spId]
      if (stats) return stats
      return {
        contactCount: 0,
        opportunityCount: 0,
        openOpportunities: 0,
        wonOpportunities: 0,
        lostOpportunities: 0,
        pipelineValue: 0,
        wonRevenue: 0,
        winRate: 0,
        targetAchievement: 0
      }
    },

    winRateClass: function (rate) {
      if (rate >= 80) return 'text-green-600 font-medium'
      if (rate >= 50) return 'text-yellow-600 font-medium'
      return 'text-red-600 font-medium'
    },

    achievementBarClass: function (pct) {
      if (pct >= 80) return 'bg-green-500'
      if (pct >= 50) return 'bg-yellow-500'
      return 'bg-red-500'
    },

    achievementTextClass: function (pct) {
      if (pct >= 80) return 'text-green-600'
      if (pct >= 50) return 'text-yellow-600'
      return 'text-red-600'
    },

    goToNew: function () {
      this.$router.push('/salespersons/new')
    },

    goToDetail: function (id) {
      this.$router.push('/salespersons/' + id)
    },

    handleRowClick: function (row) {
      this.$router.push('/salespersons/' + row.id)
    },

    handleSort: function (field) {
      var currentSortBy = this.$store.state.salespersons.sortBy
      var currentSortDir = this.$store.state.salespersons.sortDir
      var newDir = 'asc'
      if (currentSortBy === field) {
        newDir = currentSortDir === 'asc' ? 'desc' : 'asc'
      }
      this.setSort({ sortBy: field, sortDir: newDir })
    },

    isSelected: function (id) {
      return this.selectedSalespersons.some(function (sp) { return sp.id === id })
    },

    toggleSelect: function (sp) {
      var index = this.selectedSalespersons.findIndex(function (s) { return s.id === sp.id })
      if (index === -1) {
        this.selectedSalespersons.push(sp)
      } else {
        this.selectedSalespersons.splice(index, 1)
      }
    },

    toggleSelectAll: function () {
      var self = this
      if (this.allSelected) {
        this.selectedSalespersons = this.selectedSalespersons.filter(function (s) {
          return !self.paginatedSalespersons.some(function (sp) { return sp.id === s.id })
        })
      } else {
        this.paginatedSalespersons.forEach(function (sp) {
          if (!self.isSelected(sp.id)) {
            self.selectedSalespersons.push(sp)
          }
        })
      }
    },

    confirmDelete: function () {
      if (this.selectedSalespersons.length > 0) {
        this.showDeleteDialog = true
      }
    },

    handleDelete: function () {
      var self = this
      this.selectedSalespersons.forEach(function (sp) {
        self.deleteSalesperson(sp.id)
      })
      this.selectedSalespersons = []
      this.showDeleteDialog = false
      this.$store.dispatch('ui/addAlert', {
        type: 'success',
        title: 'Salesperson(s) deleted',
        message: 'The selected salespersons have been removed.',
        duration: 3000
      })
    },

    handleRefresh: function () {
      this.$store.dispatch('salespersons/initSalespersons')
    }
  }
}
</script>

<style scoped>
.salespersons-list-view {
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

/* Table Styles */
.table-header-cell {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #605E5C;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
}
.table-header-cell:hover {
  background: #EDEBE9;
}

.table-cell {
  padding: 8px 12px;
  font-size: 13px;
  color: #323130;
  white-space: nowrap;
}

.cell-link-text {
  color: #0078D4;
  cursor: pointer;
}
.cell-link-text:hover {
  text-decoration: underline;
}

.sort-indicator {
  font-size: 10px;
  margin-left: 4px;
  color: #0078D4;
}

.role-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #323130;
  background: #F3F2F1;
  border-radius: 2px;
}

/* Pagination */
.pagination-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  font-size: 12px;
  color: #323130;
  background: #FFFFFF;
  border: 1px solid #C8C6C4;
  border-radius: 2px;
  cursor: pointer;
}
.pagination-btn:hover:not(:disabled) {
  background: #F3F2F1;
}
.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pagination-btn-active {
  background: #0078D4;
  border-color: #0078D4;
  color: #FFFFFF;
}
.pagination-btn-active:hover {
  background: #106EBE;
}
</style>
