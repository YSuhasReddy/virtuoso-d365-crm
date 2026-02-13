<template>
  <div class="salesperson-detail-view">
    <!-- Breadcrumb -->
    <div class="px-4 pt-3">
      <Breadcrumb :items="breadcrumbs" />
    </div>

    <!-- Not Found -->
    <div v-if="!salesperson" class="empty-state px-4 py-12 text-center">
      <p class="text-lg font-semibold text-gray-700">Salesperson not found</p>
      <p class="text-sm text-gray-500 mt-1">The salesperson you are looking for does not exist or has been deleted.</p>
      <button class="d365-cmd-btn primary mt-4" @click="$router.push('/salespersons')">Back to Salespersons</button>
    </div>

    <template v-if="salesperson">
      <!-- Header Section -->
      <div class="detail-header px-4 pb-2">
        <div class="header-left">
          <button class="back-btn" @click="$router.push('/salespersons')" title="Back to Salespersons">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11 2L5 8l6 6" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
          </button>
          <div class="header-info">
            <h1 class="sp-name">{{ salesperson.name }}</h1>
            <div class="header-meta">
              <span class="role-badge">{{ salesperson.role }}</span>
              <span class="header-contact-info">
                <a v-if="salesperson.email" :href="'mailto:' + salesperson.email" class="field-link">{{ salesperson.email }}</a>
                <span v-if="salesperson.phone" class="text-gray-400 mx-2">|</span>
                <span v-if="salesperson.phone" class="text-gray-600">{{ salesperson.phone }}</span>
              </span>
            </div>
          </div>
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

      <!-- KPI Cards -->
      <div class="kpi-section px-4 py-4">
        <div class="kpi-grid">
          <!-- Pipeline Value -->
          <div class="kpi-card border-l-4 border-blue-500">
            <div class="kpi-value text-blue-700">{{ stats.pipelineValue | currency }}</div>
            <div class="kpi-label">Pipeline Value</div>
            <div class="kpi-sub">{{ stats.openOpportunities }} open opportunit{{ stats.openOpportunities === 1 ? 'y' : 'ies' }}</div>
          </div>

          <!-- Won Revenue -->
          <div class="kpi-card border-l-4 border-green-500">
            <div class="kpi-value text-green-700">{{ stats.wonRevenue | currency }}</div>
            <div class="kpi-label">Won Revenue</div>
            <div class="kpi-sub">{{ stats.wonOpportunities }} won deal{{ stats.wonOpportunities === 1 ? '' : 's' }}</div>
          </div>

          <!-- Win Rate -->
          <div class="kpi-card border-l-4 border-purple-500">
            <div class="kpi-value text-purple-700">{{ stats.winRate }}%</div>
            <div class="kpi-label">Win Rate</div>
            <div class="kpi-sub">{{ stats.wonOpportunities }}W / {{ stats.lostOpportunities }}L</div>
          </div>

          <!-- Target Achievement -->
          <div class="kpi-card border-l-4" :class="targetBorderClass">
            <div class="kpi-value" :class="targetTextClass">{{ stats.targetAchievement }}%</div>
            <div class="kpi-label">Target Achievement</div>
            <div class="kpi-sub">Target: {{ salesperson.target | currency }}</div>
            <div class="mt-2">
              <div class="h-2 bg-gray-200 rounded overflow-hidden">
                <div
                  class="h-full rounded"
                  :class="targetBarClass"
                  :style="{ width: Math.min(stats.targetAchievement, 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Bar -->
      <div class="d365-tabs px-4">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="d365-tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span v-if="tab.count !== undefined" class="tab-count">({{ tab.count }})</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content px-4 pb-4">

        <!-- Contacts Tab -->
        <div v-if="activeTab === 'contacts'">
          <div v-if="assignedContacts.length === 0" class="empty-tab-state">
            <p class="empty-title">No assigned contacts</p>
            <p class="empty-subtitle">There are no contacts assigned to this salesperson.</p>
          </div>
          <div v-else class="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="table-header-cell">Name</th>
                  <th class="table-header-cell">Type</th>
                  <th class="table-header-cell">Email</th>
                  <th class="table-header-cell">Industry</th>
                  <th class="table-header-cell">Business Relation</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="contact in assignedContacts"
                  :key="contact.id"
                  class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  @click="$router.push('/contacts/' + contact.id)"
                >
                  <td class="table-cell">
                    <span class="cell-link-text">{{ contact.name }}</span>
                  </td>
                  <td class="table-cell">
                    <span class="type-badge" :class="contact.type === 'Company' ? 'type-company' : 'type-person'">{{ contact.type }}</span>
                  </td>
                  <td class="table-cell text-gray-600">{{ contact.email || '--' }}</td>
                  <td class="table-cell text-gray-600">{{ contact.industry || '--' }}</td>
                  <td class="table-cell text-gray-600">{{ contact.businessRelation || '--' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Opportunities Tab -->
        <div v-if="activeTab === 'opportunities'">
          <div v-if="spOpportunities.length === 0" class="empty-tab-state">
            <p class="empty-title">No opportunities</p>
            <p class="empty-subtitle">There are no opportunities assigned to this salesperson.</p>
          </div>
          <div v-else class="opp-list">
            <div
              v-for="opp in spOpportunities"
              :key="opp.id"
              class="opp-card d365-card"
              @click="$router.push('/opportunities/' + opp.id)"
            >
              <div class="opp-card-header">
                <span class="opp-name">{{ opp.name }}</span>
                <span class="opp-status-badge" :class="oppStatusClass(opp.status)">{{ opp.status }}</span>
              </div>
              <div class="opp-card-body">
                <div class="opp-meta">
                  <span class="opp-meta-item">
                    <strong>Stage:</strong> {{ opp.currentStage }}
                  </span>
                  <span class="opp-meta-item">
                    <strong>Value:</strong> {{ opp.estimatedValue | currency }}
                  </span>
                  <span class="opp-meta-item">
                    <strong>Close Date:</strong> {{ opp.estimatedCloseDate | date }}
                  </span>
                  <span class="opp-meta-item">
                    <strong>Probability:</strong> {{ opp.probability }}%
                  </span>
                </div>
                <p v-if="opp.description" class="opp-description">{{ opp.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Activities Tab -->
        <div v-if="activeTab === 'activities'">
          <div v-if="recentActivities.length === 0" class="empty-tab-state">
            <p class="empty-title">No recent activities</p>
            <p class="empty-subtitle">There are no activities linked to this salesperson's contacts or opportunities.</p>
          </div>
          <div v-else class="activity-list">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="activity-card d365-card"
            >
              <div class="activity-card-header">
                <div class="activity-type-subject">
                  <span class="activity-type-icon" :class="activityTypeClass(activity.type)">
                    {{ activityTypeIcon(activity.type) }}
                  </span>
                  <span class="activity-subject">{{ activity.subject }}</span>
                </div>
                <span class="activity-status-badge" :class="activityStatusClass(activity.status)">{{ activity.status }}</span>
              </div>
              <div class="activity-card-body">
                <div class="activity-meta">
                  <span><strong>Type:</strong> {{ activity.type }}</span>
                  <span><strong>Due:</strong> {{ activity.dueDate | date }}</span>
                  <span v-if="activity.duration"><strong>Duration:</strong> {{ activity.duration }} min</span>
                  <span v-if="activity.contactId"><strong>Contact:</strong> {{ getContactName(activity.contactId) }}</span>
                </div>
                <p v-if="activity.description" class="activity-description">{{ activity.description }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </template>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Salesperson"
      :message="'Are you sure you want to delete &quot;' + (salesperson ? salesperson.name : '') + '&quot;? This action cannot be undone.'"
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
  name: 'SalespersonDetail',
  components: {
    CommandBar,
    Breadcrumb,
    ConfirmDialog
  },
  data: function () {
    return {
      activeTab: 'contacts',
      showDeleteDialog: false
    }
  },
  computed: {
    ...mapGetters('salespersons', ['getSalespersonById', 'salespersonStats']),

    salesperson: function () {
      return this.getSalespersonById(this.$route.params.id)
    },

    stats: function () {
      if (!this.salesperson) {
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
      }
      return this.salespersonStats[this.salesperson.id] || {
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

    assignedContacts: function () {
      if (!this.salesperson) return []
      var spId = this.salesperson.id
      var contacts = this.$store.state.contacts.all || []
      return contacts.filter(function (c) { return c.salesperson === spId })
    },

    spOpportunities: function () {
      if (!this.salesperson) return []
      var spId = this.salesperson.id
      var opportunities = this.$store.state.opportunities.all || []
      return opportunities.filter(function (o) { return o.salesperson === spId })
    },

    recentActivities: function () {
      if (!this.salesperson) return []
      var spId = this.salesperson.id
      var activities = this.$store.state.activities.all || []

      // Get activities directly assigned to this salesperson
      var directActivities = activities.filter(function (a) { return a.salesperson === spId })

      // Also include activities linked to this salesperson's contacts
      var contactIds = {}
      this.assignedContacts.forEach(function (c) { contactIds[c.id] = true })

      var contactActivities = activities.filter(function (a) {
        return a.contactId && contactIds[a.contactId] && a.salesperson !== spId
      })

      var allActivities = directActivities.concat(contactActivities)

      // Remove duplicates by id
      var seen = {}
      var unique = []
      allActivities.forEach(function (a) {
        if (!seen[a.id]) {
          seen[a.id] = true
          unique.push(a)
        }
      })

      // Sort by due date descending
      unique.sort(function (a, b) {
        var dateA = a.dueDate || ''
        var dateB = b.dueDate || ''
        return dateB.localeCompare(dateA)
      })

      return unique
    },

    breadcrumbs: function () {
      var crumbs = [
        { label: 'Home', path: '/dashboard' },
        { label: 'Salespersons', path: '/salespersons' }
      ]
      if (this.salesperson) {
        crumbs.push({ label: this.salesperson.name })
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

    tabs: function () {
      return [
        { id: 'contacts', label: 'Assigned Contacts', count: this.assignedContacts.length },
        { id: 'opportunities', label: 'Opportunities', count: this.spOpportunities.length },
        { id: 'activities', label: 'Recent Activities', count: this.recentActivities.length }
      ]
    },

    targetBorderClass: function () {
      if (this.stats.targetAchievement >= 80) return 'border-green-500'
      if (this.stats.targetAchievement >= 50) return 'border-yellow-500'
      return 'border-red-500'
    },

    targetTextClass: function () {
      if (this.stats.targetAchievement >= 80) return 'text-green-700'
      if (this.stats.targetAchievement >= 50) return 'text-yellow-700'
      return 'text-red-700'
    },

    targetBarClass: function () {
      if (this.stats.targetAchievement >= 80) return 'bg-green-500'
      if (this.stats.targetAchievement >= 50) return 'bg-yellow-500'
      return 'bg-red-500'
    }
  },
  created: function () {
    this.$root.$on('shortcut-refresh', this.refreshData)
  },
  beforeDestroy: function () {
    this.$root.$off('shortcut-refresh', this.refreshData)
  },
  methods: {
    ...mapActions('salespersons', ['deleteSalesperson']),

    goToEdit: function () {
      this.$router.push('/salespersons/' + this.salesperson.id + '/edit')
    },

    handleDelete: function () {
      var spName = this.salesperson.name
      this.deleteSalesperson(this.salesperson.id)
      this.showDeleteDialog = false
      this.$store.dispatch('ui/addAlert', {
        type: 'success',
        title: 'Salesperson deleted',
        message: '"' + spName + '" has been deleted.',
        duration: 3000
      })
      this.$router.push('/salespersons')
    },

    getContactName: function (contactId) {
      var contacts = this.$store.state.contacts.all || []
      var contact = contacts.find(function (c) { return c.id === contactId })
      return contact ? contact.name : contactId || '--'
    },

    oppStatusClass: function (status) {
      if (status === 'Open') return 'status-open'
      if (status === 'Won') return 'status-won'
      if (status === 'Lost') return 'status-lost'
      return ''
    },

    activityTypeClass: function (type) {
      if (type === 'Call') return 'type-call'
      if (type === 'Email') return 'type-email'
      if (type === 'Meeting') return 'type-meeting'
      if (type === 'Task') return 'type-task'
      return ''
    },

    activityTypeIcon: function (type) {
      if (type === 'Call') return '\u260E'
      if (type === 'Email') return '\u2709'
      if (type === 'Meeting') return '\u{1F465}'
      if (type === 'Task') return '\u2713'
      return '\u2022'
    },

    activityStatusClass: function (status) {
      if (status === 'Completed') return 'act-status-completed'
      if (status === 'Open') return 'act-status-open'
      if (status === 'Cancelled') return 'act-status-cancelled'
      return ''
    },

    refreshData: function () {
      this.$store.dispatch('salespersons/initSalespersons')
    }
  }
}
</script>

<style scoped>
.salesperson-detail-view {
  min-height: 100%;
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

.sp-name {
  font-size: 22px;
  font-weight: 600;
  color: #323130;
  margin: 0;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.role-badge {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #323130;
  background: #F3F2F1;
  border-radius: 2px;
}

.header-contact-info {
  font-size: 13px;
  color: #605E5C;
}

.field-link {
  color: #0078D4;
  text-decoration: none;
}
.field-link:hover {
  text-decoration: underline;
}

/* KPI Cards */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  background: #FFFFFF;
  border: 1px solid #EDEBE9;
  border-radius: 4px;
  padding: 16px 20px;
  box-shadow: 0 1.6px 3.6px rgba(0, 0, 0, 0.06);
}

.kpi-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.kpi-label {
  font-size: 13px;
  font-weight: 600;
  color: #605E5C;
  margin-top: 4px;
}

.kpi-sub {
  font-size: 12px;
  color: #A19F9D;
  margin-top: 2px;
}

/* Tab Count */
.tab-count {
  font-size: 12px;
  color: #A19F9D;
  margin-left: 2px;
}

/* Table Styles */
.table-header-cell {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #605E5C;
  text-align: left;
  white-space: nowrap;
}

.table-cell {
  padding: 8px 12px;
  font-size: 13px;
  color: #323130;
}

.cell-link-text {
  color: #0078D4;
  cursor: pointer;
}
.cell-link-text:hover {
  text-decoration: underline;
}

.type-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 2px;
}
.type-company {
  background: #E1DFDD;
  color: #323130;
}
.type-person {
  background: #DEECF9;
  color: #0078D4;
}

/* Empty Tab State */
.empty-tab-state {
  text-align: center;
  padding: 48px 24px;
}
.empty-tab-state .empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #323130;
  margin: 0 0 4px;
}
.empty-tab-state .empty-subtitle {
  font-size: 13px;
  color: #605E5C;
  margin: 0;
}

/* Opportunity Cards */
.opp-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.opp-card {
  padding: 12px 16px;
  cursor: pointer;
  transition: box-shadow 0.15s;
}
.opp-card:hover {
  box-shadow: 0 3.2px 7.2px rgba(0, 0, 0, 0.13);
}

.opp-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.opp-name {
  font-size: 14px;
  font-weight: 600;
  color: #0078D4;
}

.opp-status-badge {
  display: inline-block;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 2px;
}
.status-open {
  background: #DEECF9;
  color: #0078D4;
}
.status-won {
  background: #DFF6DD;
  color: #107C10;
}
.status-lost {
  background: #FDE7E9;
  color: #D13438;
}

.opp-card-body .opp-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #605E5C;
}

.opp-meta-item strong {
  color: #323130;
}

.opp-description {
  margin: 8px 0 0;
  font-size: 13px;
  color: #605E5C;
  line-height: 1.5;
}

/* Activity Cards */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-card {
  padding: 12px 16px;
}

.activity-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.activity-type-subject {
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-type-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 14px;
}
.type-call {
  background: #DEECF9;
  color: #0078D4;
}
.type-email {
  background: #FFF4CE;
  color: #797673;
}
.type-meeting {
  background: #E8DAEF;
  color: #8E44AD;
}
.type-task {
  background: #DFF6DD;
  color: #107C10;
}

.activity-subject {
  font-size: 14px;
  font-weight: 600;
  color: #323130;
}

.activity-status-badge {
  display: inline-block;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 2px;
}
.act-status-completed {
  background: #DFF6DD;
  color: #107C10;
}
.act-status-open {
  background: #DEECF9;
  color: #0078D4;
}
.act-status-cancelled {
  background: #F3F2F1;
  color: #605E5C;
}

.activity-card-body .activity-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #605E5C;
}
.activity-meta strong {
  color: #323130;
}

.activity-description {
  margin: 8px 0 0;
  font-size: 13px;
  color: #605E5C;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 1100px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
