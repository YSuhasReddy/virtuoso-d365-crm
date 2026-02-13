<template>
  <div class="campaign-detail-view">
    <!-- Breadcrumb -->
    <div class="px-4 pt-3">
      <Breadcrumb :items="breadcrumbs" />
    </div>

    <!-- Not Found -->
    <div v-if="!campaign" class="empty-state px-4 py-12 text-center">
      <p class="text-lg font-semibold text-gray-700">Campaign not found</p>
      <p class="text-sm text-gray-500 mt-1">The campaign you are looking for does not exist or has been deleted.</p>
      <button class="d365-cmd-btn primary mt-4" @click="$router.push('/campaigns')">Back to Campaigns</button>
    </div>

    <template v-if="campaign">
      <!-- Header Section -->
      <div class="detail-header px-4 pb-2">
        <div class="header-left">
          <button class="back-btn" @click="$router.push('/campaigns')" title="Back to Campaigns">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11 2L5 8l6 6" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
          </button>
          <div class="header-info">
            <h1 class="campaign-name">{{ campaign.name }}</h1>
            <div class="header-badges">
              <span class="status-badge" :class="statusClass(campaign.status)">{{ campaign.status }}</span>
              <StatusBadge :status="campaign.type" />
              <span class="campaign-number-text">{{ campaign.number }}</span>
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

        <!-- General Tab -->
        <div v-if="activeTab === 'general'" class="general-tab">
          <div class="detail-grid">
            <!-- Left Column -->
            <div class="detail-column">
              <!-- General Info Card -->
              <div class="section-card d365-card">
                <div class="section-header">General Information</div>
                <div class="section-body">
                  <div class="detail-field">
                    <span class="field-label">Number</span>
                    <span class="field-value">{{ campaign.number }}</span>
                  </div>
                  <div class="detail-field">
                    <span class="field-label">Name</span>
                    <span class="field-value">{{ campaign.name }}</span>
                  </div>
                  <div class="detail-field">
                    <span class="field-label">Type</span>
                    <span class="field-value"><StatusBadge :status="campaign.type" /></span>
                  </div>
                  <div class="detail-field">
                    <span class="field-label">Status</span>
                    <span class="field-value">
                      <span class="status-badge" :class="statusClass(campaign.status)">{{ campaign.status }}</span>
                    </span>
                  </div>
                  <div class="detail-field">
                    <span class="field-label">Start Date</span>
                    <span class="field-value">{{ $filters.date(campaign.startDate) }}</span>
                  </div>
                  <div class="detail-field">
                    <span class="field-label">End Date</span>
                    <span class="field-value">{{ $filters.date(campaign.endDate) }}</span>
                  </div>
                  <div class="detail-field">
                    <span class="field-label">Salesperson</span>
                    <span class="field-value">{{ campaign.salespersonName || '--' }}</span>
                  </div>
                  <div class="detail-field">
                    <span class="field-label">Target Segment</span>
                    <span class="field-value">{{ campaign.targetSegment || '--' }}</span>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div v-if="campaign.description" class="section-card d365-card mt-3">
                <div class="section-header">Description</div>
                <div class="section-body">
                  <p class="notes-text">{{ campaign.description }}</p>
                </div>
              </div>

              <!-- Notes -->
              <div v-if="campaign.notes" class="section-card d365-card mt-3">
                <div class="section-header">Notes</div>
                <div class="section-body">
                  <p class="notes-text">{{ campaign.notes }}</p>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="detail-column">
              <!-- Budget Card -->
              <div class="section-card d365-card">
                <div class="section-header">Budget</div>
                <div class="section-body">
                  <div class="detail-field">
                    <span class="field-label">Budget</span>
                    <span class="field-value font-semibold">{{ $filters.currency(campaign.budget) }}</span>
                  </div>
                  <div class="detail-field">
                    <span class="field-label">Actual Cost</span>
                    <span class="field-value font-semibold">{{ $filters.currency(campaign.actualCost) }}</span>
                  </div>
                  <div class="detail-field">
                    <span class="field-label">Remaining</span>
                    <span class="field-value" :class="remainingBudget < 0 ? 'text-red-600 font-semibold' : 'text-green-700 font-semibold'">
                      {{ $filters.currency(remainingBudget) }}
                    </span>
                  </div>
                  <!-- Budget progress bar -->
                  <div class="budget-bar-container mt-3">
                    <div class="budget-bar-label">
                      <span>Spend: {{ spendPercentage }}%</span>
                    </div>
                    <div class="budget-bar-track">
                      <div
                        class="budget-bar-fill"
                        :class="spendPercentage > 100 ? 'over-budget' : spendPercentage > 80 ? 'near-budget' : 'on-budget'"
                        :style="{ width: Math.min(spendPercentage, 100) + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Performance Card -->
              <div class="section-card d365-card mt-3">
                <div class="section-header">Performance</div>
                <div class="section-body">
                  <div class="detail-field">
                    <span class="field-label">Responses</span>
                    <span class="field-value font-semibold">{{ campaign.responses || 0 }}</span>
                  </div>
                  <div class="detail-field">
                    <span class="field-label">Success Rate</span>
                    <span class="field-value font-semibold">{{ campaign.successRate || 0 }}%</span>
                  </div>
                  <div class="detail-field">
                    <span class="field-label">Cost per Response</span>
                    <span class="field-value font-semibold">{{ $filters.currency(costPerResponse) }}</span>
                  </div>
                  <div class="detail-field">
                    <span class="field-label">Linked Opportunities</span>
                    <span class="field-value font-semibold">{{ (campaign.linkedOpportunities || []).length }}</span>
                  </div>
                  <div class="detail-field">
                    <span class="field-label">Target Contacts</span>
                    <span class="field-value font-semibold">{{ (campaign.targetContacts || []).length }}</span>
                  </div>
                </div>
              </div>

              <!-- Dates -->
              <div class="section-card d365-card mt-3">
                <div class="section-header">Record Info</div>
                <div class="section-body">
                  <div class="detail-field">
                    <span class="field-label">Created</span>
                    <span class="field-value">{{ $filters.date(campaign.createdAt) }}</span>
                  </div>
                  <div class="detail-field">
                    <span class="field-label">Last Modified</span>
                    <span class="field-value">{{ $filters.date(campaign.updatedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activities Tab -->
        <div v-if="activeTab === 'activities'" class="activities-tab">
          <div v-if="campaignActivities.length === 0" class="empty-tab-state">
            <p class="empty-title">No activities</p>
            <p class="empty-subtitle">There are no activities recorded for this campaign.</p>
          </div>
          <div v-else class="activity-timeline">
            <div
              v-for="(activity, idx) in campaignActivities"
              :key="activity.id"
              class="timeline-item"
            >
              <div class="timeline-marker">
                <div class="timeline-dot" :class="activityStatusClass(activity.status)"></div>
                <div v-if="idx < campaignActivities.length - 1" class="timeline-line"></div>
              </div>
              <div class="timeline-content d365-card">
                <div class="timeline-header">
                  <span class="timeline-type">{{ activity.type }}</span>
                  <span class="timeline-status" :class="activityStatusClass(activity.status)">{{ activity.status }}</span>
                </div>
                <p class="timeline-description">{{ activity.description }}</p>
                <span class="timeline-date">{{ $filters.date(activity.date) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Opportunities Tab -->
        <div v-if="activeTab === 'opportunities'" class="opportunities-tab">
          <div v-if="linkedOpportunityRecords.length === 0" class="empty-tab-state">
            <p class="empty-title">No linked opportunities</p>
            <p class="empty-subtitle">There are no opportunities linked to this campaign.</p>
          </div>
          <div v-else class="opp-list">
            <div
              v-for="opp in linkedOpportunityRecords"
              :key="opp.id"
              class="opp-card d365-card"
              @click="$router.push('/opportunities/' + opp.id)"
            >
              <div class="opp-card-header">
                <span class="opp-name">{{ opp.name }}</span>
                <StatusBadge :status="opp.status" />
              </div>
              <div class="opp-card-body">
                <div class="opp-meta">
                  <span class="opp-meta-item">
                    <strong>Stage:</strong> {{ opp.currentStage }}
                  </span>
                  <span class="opp-meta-item">
                    <strong>Value:</strong> {{ $filters.currency(opp.estimatedValue) }}
                  </span>
                  <span class="opp-meta-item">
                    <strong>Probability:</strong> {{ opp.probability }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contacts Tab -->
        <div v-if="activeTab === 'contacts'" class="contacts-tab">
          <div v-if="targetContactRecords.length === 0" class="empty-tab-state">
            <p class="empty-title">No target contacts</p>
            <p class="empty-subtitle">There are no contacts targeted by this campaign.</p>
          </div>
          <div v-else class="contact-list">
            <div
              v-for="contact in targetContactRecords"
              :key="contact.id"
              class="contact-card d365-card"
              @click="$router.push('/contacts/' + contact.id)"
            >
              <div class="contact-card-header">
                <span class="contact-card-name">{{ contact.name }}</span>
                <StatusBadge :status="contact.type" />
              </div>
              <div class="contact-card-body">
                <div class="contact-meta">
                  <span v-if="contact.email" class="contact-meta-item">
                    <strong>Email:</strong> {{ contact.email }}
                  </span>
                  <span v-if="contact.phone" class="contact-meta-item">
                    <strong>Phone:</strong> {{ contact.phone }}
                  </span>
                  <span v-if="contact.industry" class="contact-meta-item">
                    <strong>Industry:</strong> {{ contact.industry }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </template>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Campaign"
      :message="'Are you sure you want to delete &quot;' + (campaign ? campaign.name : '') + '&quot;? This action cannot be undone.'"
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
import StatusBadge from '@/components/common/StatusBadge.vue'
import eventBus from '../../utils/eventBus'

export default {
  name: 'CampaignDetail',
  components: {
    CommandBar,
    Breadcrumb,
    ConfirmDialog,
    StatusBadge
  },
  data: function () {
    return {
      activeTab: 'general',
      showDeleteDialog: false
    }
  },
  computed: {
    ...mapGetters('campaigns', ['getCampaignById']),
    ...mapGetters('opportunities', { allOpportunities: 'allOpportunities' }),
    ...mapGetters('contacts', { allContacts: 'allContacts' }),

    campaign: function () {
      return this.getCampaignById(this.$route.params.id)
    },

    breadcrumbs: function () {
      var crumbs = [
        { label: 'Home', path: '/dashboard' },
        { label: 'Campaigns', path: '/campaigns' }
      ]
      if (this.campaign) {
        crumbs.push({ label: this.campaign.name })
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

    campaignActivities: function () {
      if (!this.campaign || !this.campaign.activities) return []
      var activities = this.campaign.activities.slice()
      activities.sort(function (a, b) {
        return (a.date || '').localeCompare(b.date || '')
      })
      return activities
    },

    linkedOpportunityRecords: function () {
      if (!this.campaign || !this.campaign.linkedOpportunities) return []
      var opps = this.allOpportunities || []
      return this.campaign.linkedOpportunities
        .map(function (oppId) {
          return opps.find(function (o) { return o.id === oppId })
        })
        .filter(function (o) { return !!o })
    },

    targetContactRecords: function () {
      if (!this.campaign || !this.campaign.targetContacts) return []
      var contacts = this.allContacts || []
      return this.campaign.targetContacts
        .map(function (ctId) {
          return contacts.find(function (c) { return c.id === ctId })
        })
        .filter(function (c) { return !!c })
    },

    remainingBudget: function () {
      if (!this.campaign) return 0
      return (this.campaign.budget || 0) - (this.campaign.actualCost || 0)
    },

    spendPercentage: function () {
      if (!this.campaign || !this.campaign.budget) return 0
      return Math.round(((this.campaign.actualCost || 0) / this.campaign.budget) * 100)
    },

    costPerResponse: function () {
      if (!this.campaign || !this.campaign.responses || this.campaign.responses === 0) return 0
      return (this.campaign.actualCost || 0) / this.campaign.responses
    },

    tabs: function () {
      return [
        { id: 'general', label: 'General' },
        { id: 'activities', label: 'Activities', count: this.campaignActivities.length },
        { id: 'opportunities', label: 'Opportunities', count: this.linkedOpportunityRecords.length },
        { id: 'contacts', label: 'Target Contacts', count: this.targetContactRecords.length }
      ]
    }
  },
  created: function () {
    eventBus.on('shortcut-refresh', this.refreshData)
    eventBus.on('shortcut-save', this.handleSave)
  },
  beforeUnmount: function () {
    eventBus.off('shortcut-refresh', this.refreshData)
    eventBus.off('shortcut-save', this.handleSave)
  },
  methods: {
    ...mapActions('campaigns', ['deleteCampaign']),

    goToEdit: function () {
      this.$router.push('/campaigns/' + this.campaign.id + '/edit')
    },

    handleDelete: function () {
      var campaignName = this.campaign.name
      this.deleteCampaign(this.campaign.id)
      this.showDeleteDialog = false
      this.$store.dispatch('ui/addAlert', {
        type: 'success',
        title: 'Campaign deleted',
        message: '"' + campaignName + '" has been deleted.',
        duration: 3000
      })
      this.$router.push('/campaigns')
    },

    statusClass: function (status) {
      switch (status) {
        case 'Active': return 'status-active'
        case 'Planning': return 'status-planning'
        case 'Completed': return 'status-completed'
        case 'Cancelled': return 'status-cancelled'
        default: return ''
      }
    },

    activityStatusClass: function (status) {
      switch (status) {
        case 'Completed': return 'activity-completed'
        case 'In Progress': return 'activity-in-progress'
        case 'Scheduled': return 'activity-scheduled'
        case 'Planned': return 'activity-planned'
        default: return 'activity-planned'
      }
    },

    refreshData: function () {
      this.$store.dispatch('campaigns/initCampaigns')
    },

    handleSave: function () {
      this.goToEdit()
    }
  }
}
</script>

<style scoped>
.campaign-detail-view {
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

.campaign-name {
  font-size: 22px;
  font-weight: 600;
  color: #323130;
  margin: 0;
}

.header-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.campaign-number-text {
  font-size: 13px;
  color: #605E5C;
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

/* Tab Count */
.tab-count {
  font-size: 12px;
  color: #A19F9D;
  margin-left: 2px;
}

/* General Tab */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.section-card {
  overflow: hidden;
}

.section-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #323130;
  background: #FAFAFA;
  border-bottom: 1px solid #EDEBE9;
}

.section-body {
  padding: 12px 16px;
}

.detail-field {
  display: flex;
  padding: 6px 0;
  border-bottom: 1px solid #F3F2F1;
}
.detail-field:last-child {
  border-bottom: none;
}

.field-label {
  flex: 0 0 140px;
  font-size: 13px;
  font-weight: 600;
  color: #605E5C;
}

.field-value {
  flex: 1;
  font-size: 13px;
  color: #323130;
}

.notes-text {
  font-size: 13px;
  color: #323130;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

/* Budget Bar */
.budget-bar-container {
  padding-top: 4px;
}

.budget-bar-label {
  font-size: 12px;
  color: #605E5C;
  margin-bottom: 4px;
}

.budget-bar-track {
  width: 100%;
  height: 8px;
  background: #F3F2F1;
  border-radius: 4px;
  overflow: hidden;
}

.budget-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.budget-bar-fill.on-budget {
  background-color: #0B6A0B;
}

.budget-bar-fill.near-budget {
  background-color: #CA5010;
}

.budget-bar-fill.over-budget {
  background-color: #D13438;
}

/* Activity Timeline */
.activity-timeline {
  padding: 8px 0;
}

.timeline-item {
  display: flex;
  gap: 16px;
  min-height: 80px;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 20px;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid #C8C6C4;
  background: #FFFFFF;
}

.timeline-dot.activity-completed {
  background-color: #0B6A0B;
  border-color: #0B6A0B;
}

.timeline-dot.activity-in-progress {
  background-color: #0078D4;
  border-color: #0078D4;
}

.timeline-dot.activity-scheduled {
  background-color: #CA5010;
  border-color: #CA5010;
}

.timeline-dot.activity-planned {
  background-color: #FFFFFF;
  border-color: #C8C6C4;
}

.timeline-line {
  flex: 1;
  width: 2px;
  background: #EDEBE9;
  min-height: 20px;
}

.timeline-content {
  flex: 1;
  padding: 10px 14px;
  margin-bottom: 12px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.timeline-type {
  font-size: 14px;
  font-weight: 600;
  color: #323130;
}

.timeline-status {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.timeline-status.activity-completed {
  background-color: #DFF6DD;
  color: #0B6A0B;
}

.timeline-status.activity-in-progress {
  background-color: #DEECF9;
  color: #004578;
}

.timeline-status.activity-scheduled {
  background-color: #FFF4CE;
  color: #8A6914;
}

.timeline-status.activity-planned {
  background-color: #F3F2F1;
  color: #605E5C;
}

.timeline-description {
  font-size: 13px;
  color: #323130;
  margin: 0 0 4px;
  line-height: 1.5;
}

.timeline-date {
  font-size: 12px;
  color: #A19F9D;
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
  box-shadow: 0 3.2px 7.2px rgba(0,0,0,0.13);
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

/* Contact Cards */
.contact-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-card {
  padding: 12px 16px;
  cursor: pointer;
  transition: box-shadow 0.15s;
}
.contact-card:hover {
  box-shadow: 0 3.2px 7.2px rgba(0,0,0,0.13);
}

.contact-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.contact-card-name {
  font-size: 14px;
  font-weight: 600;
  color: #0078D4;
}

.contact-card-body .contact-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #605E5C;
}

.contact-meta-item strong {
  color: #323130;
}

/* Responsive */
@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
