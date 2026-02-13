<template>
  <div class="opportunity-detail" v-if="opportunity">
    <!-- Breadcrumb -->
    <div class="page-header">
      <Breadcrumb :items="breadcrumbs" />
    </div>

    <!-- Detail Header with RecordNavigation -->
    <div class="detail-header">
      <div class="header-info">
        <h1 class="detail-title">{{ opportunity.name }}</h1>
        <div class="header-badges">
          <StatusBadge :status="opportunity.status" />
          <StatusBadge :status="opportunity.priority" :label="opportunity.priority + ' Priority'" />
        </div>
      </div>
      <div class="header-right">
        <RecordNavigation
          :current-index="currentOppIndex"
          :total-count="allOpportunities.length"
          entity-name="Opportunity"
          @navigate="handleRecordNav"
        />
        <div class="header-value">
          <span class="value-label">Estimated Value</span>
          <span class="value-amount">{{ opportunity.estimatedValue | currency }}</span>
        </div>
      </div>
    </div>

    <!-- Command Bar -->
    <CommandBar
      :actions="commandActions"
      :show-view-switcher="false"
      :show-filter="false"
      @edit="handleEdit"
      @advance="handleAdvanceStage"
      @won="handleSetWon"
      @lost="handleSetLost"
      @delete="showDeleteDialog = true"
      @new-activity="handleNewActivity"
    />

    <!-- Business Process Flow (replaces old stage progression bar) -->
    <BusinessProcessFlow
      :stages="bpfStages"
      :current-stage="opportunity.currentStage"
      :completed-stages="completedStages"
      :entity-status="opportunity.status"
      @stage-click="handleBpfStageClick"
      @advance="handleAdvanceStage"
    />

    <!-- Two-column layout: main + factbox -->
    <div class="detail-layout">
      <div class="detail-main">
        <!-- Tab Bar -->
        <div class="d365-tabs">
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
        <div class="tab-content">
          <!-- General Tab -->
          <div v-if="activeTab === 'general'" class="general-tab">
            <div class="detail-card d365-card">
              <div class="card-section">
                <h3 class="section-title">Opportunity Information</h3>
                <div class="field-grid">
                  <div class="field-row">
                    <label class="field-label">Name</label>
                    <span class="field-value">{{ opportunity.name }}</span>
                  </div>
                  <div class="field-row">
                    <label class="field-label">Contact</label>
                    <router-link
                      v-if="opportunity.contactId"
                      :to="'/contacts/' + opportunity.contactId"
                      class="field-value field-link"
                    >{{ opportunity.contactName }}</router-link>
                    <span v-else class="field-value">-</span>
                  </div>
                  <div class="field-row">
                    <label class="field-label">Salesperson</label>
                    <span class="field-value">{{ salespersonName }}</span>
                  </div>
                  <div class="field-row">
                    <label class="field-label">Sales Cycle</label>
                    <span class="field-value">{{ opportunity.salesCycle }}</span>
                  </div>
                  <div class="field-row">
                    <label class="field-label">Current Stage</label>
                    <span class="field-value">
                      <StatusBadge :status="opportunity.currentStage" />
                    </span>
                  </div>
                  <div class="field-row">
                    <label class="field-label">Estimated Value</label>
                    <span class="field-value">{{ opportunity.estimatedValue | currency }}</span>
                  </div>
                  <div class="field-row">
                    <label class="field-label">Estimated Close Date</label>
                    <span class="field-value">{{ opportunity.estimatedCloseDate | date }}</span>
                  </div>
                  <div class="field-row">
                    <label class="field-label">Probability</label>
                    <span class="field-value">{{ opportunity.probability }}%</span>
                  </div>
                  <div class="field-row">
                    <label class="field-label">Priority</label>
                    <span class="field-value">
                      <StatusBadge :status="opportunity.priority" />
                    </span>
                  </div>
                  <div class="field-row">
                    <label class="field-label">Status</label>
                    <span class="field-value">
                      <StatusBadge :status="opportunity.status" />
                    </span>
                  </div>
                </div>
              </div>
              <div class="card-section" v-if="opportunity.description">
                <h3 class="section-title">Description</h3>
                <p class="description-text">{{ opportunity.description }}</p>
              </div>
              <div class="card-section">
                <h3 class="section-title">Timeline</h3>
                <div class="field-grid">
                  <div class="field-row">
                    <label class="field-label">Created</label>
                    <span class="field-value">{{ opportunity.createdAt | date }}</span>
                  </div>
                  <div class="field-row">
                    <label class="field-label">Last Updated</label>
                    <span class="field-value">{{ opportunity.updatedAt | date }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Activities Tab (replaced with ActivityTimeline) -->
          <div v-if="activeTab === 'activities'" class="activities-tab">
            <div class="detail-card d365-card">
              <div class="card-section">
                <div class="section-header">
                  <h3 class="section-title">Activities</h3>
                  <button class="d365-cmd-btn primary" @click="handleNewActivity">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" fill="none"/></svg>
                    New Activity
                  </button>
                </div>
                <ActivityTimeline
                  v-if="timelineActivities.length > 0"
                  :activities="timelineActivities"
                  :show-filters="true"
                  @activity-click="handleActivityClick"
                />
                <div v-else class="empty-section">
                  <p class="empty-text">No activities linked to this opportunity.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Documents Tab -->
          <div v-if="activeTab === 'documents'" class="documents-tab">
            <div class="detail-card d365-card">
              <div class="card-section">
                <h3 class="section-title">Sales Documents</h3>
                <div v-if="relatedDocuments.length === 0" class="empty-section">
                  <p class="empty-text">No sales documents linked to this opportunity.</p>
                </div>
                <div v-else class="document-list">
                  <div
                    v-for="doc in relatedDocuments"
                    :key="doc.id"
                    class="document-item d365-grid-row"
                    @click="navigateToDocument(doc)"
                  >
                    <div class="doc-info">
                      <span class="doc-number">{{ doc.number }}</span>
                      <span class="doc-type">{{ doc.type }}</span>
                    </div>
                    <div class="doc-meta">
                      <span class="doc-amount">{{ doc.total | currency }}</span>
                      <StatusBadge :status="doc.status" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes Tab -->
          <div v-if="activeTab === 'notes'" class="notes-tab">
            <div class="detail-card d365-card">
              <div class="card-section">
                <h3 class="section-title">Notes</h3>
                <textarea
                  class="d365-field-input notes-textarea"
                  placeholder="Add notes about this opportunity..."
                  :value="notesText"
                  @input="notesText = $event.target.value"
                  @blur="saveNotes"
                  rows="8"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FactBox right panel -->
      <FactBox
        :sections="factBoxSections"
        :collapsed="factBoxCollapsed"
        @toggle="factBoxCollapsed = $event"
        @item-click="handleFactBoxClick"
      />
    </div>

    <!-- Confirm Dialogs -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Opportunity"
      :message="'Are you sure you want to delete &quot;' + opportunity.name + '&quot;? This action cannot be undone.'"
      confirm-text="Delete"
      :danger="true"
      @confirm="confirmDelete"
      @cancel="showDeleteDialog = false"
    />

    <ConfirmDialog
      :show="showAdvanceDialog"
      title="Advance Stage"
      :message="advanceMessage"
      confirm-text="Advance"
      @confirm="confirmAdvanceStage"
      @cancel="showAdvanceDialog = false"
    />

    <ConfirmDialog
      :show="showWonDialog"
      title="Set as Won"
      :message="'Mark &quot;' + opportunity.name + '&quot; as Won? This will move the opportunity to Closed Won.'"
      confirm-text="Set Won"
      @confirm="confirmSetWon"
      @cancel="showWonDialog = false"
    />

    <ConfirmDialog
      :show="showLostDialog"
      title="Set as Lost"
      :message="'Mark &quot;' + opportunity.name + '&quot; as Lost? This will move the opportunity to Closed Lost.'"
      confirm-text="Set Lost"
      :danger="true"
      @confirm="confirmSetLost"
      @cancel="showLostDialog = false"
    />
  </div>

  <!-- Not Found -->
  <div v-else class="not-found">
    <div class="page-header">
      <Breadcrumb :items="[{ label: 'Home', path: '/dashboard' }, { label: 'Opportunities', path: '/opportunities' }, { label: 'Not Found' }]" />
    </div>
    <div class="not-found-content d365-card">
      <h2>Opportunity Not Found</h2>
      <p>The opportunity you are looking for does not exist or has been deleted.</p>
      <button class="d365-cmd-btn primary" @click="$router.push('/opportunities')">Back to Opportunities</button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import CommandBar from '@/components/layout/CommandBar.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import BusinessProcessFlow from '@/components/common/BusinessProcessFlow.vue'
import FactBox from '@/components/common/FactBox.vue'
import ActivityTimeline from '@/components/common/ActivityTimeline.vue'
import RecordNavigation from '@/components/common/RecordNavigation.vue'
import salespersons from '@/data/salespersons'

const OPEN_STAGES = ['Qualification', 'Development', 'Proposal', 'Negotiation']

export default {
  name: 'OpportunityDetail',

  components: {
    CommandBar,
    Breadcrumb,
    ConfirmDialog,
    StatusBadge,
    BusinessProcessFlow,
    FactBox,
    ActivityTimeline,
    RecordNavigation
  },

  data() {
    return {
      activeTab: 'general',
      showDeleteDialog: false,
      showAdvanceDialog: false,
      showWonDialog: false,
      showLostDialog: false,
      notesText: '',
      openStages: OPEN_STAGES,
      factBoxCollapsed: false
    }
  },

  computed: {
    ...mapGetters('opportunities', ['getOpportunityById', 'allOpportunities']),
    ...mapGetters('activities', { allActivities: 'allActivities' }),
    ...mapGetters('sales', { allDocuments: 'allDocuments' }),

    opportunity() {
      return this.getOpportunityById(this.$route.params.id)
    },

    breadcrumbs() {
      return [
        { label: 'Home', path: '/dashboard' },
        { label: 'Opportunities', path: '/opportunities' },
        { label: this.opportunity ? this.opportunity.name : 'Details' }
      ]
    },

    salespersonName() {
      if (!this.opportunity) return '-'
      var sp = salespersons.find(function (s) { return s.id === this.opportunity.salesperson }.bind(this))
      return sp ? sp.name : this.opportunity.salesperson || '-'
    },

    currentStageIndex() {
      if (!this.opportunity) return -1
      if (this.opportunity.status === 'Won' || this.opportunity.status === 'Lost') return OPEN_STAGES.length
      return OPEN_STAGES.indexOf(this.opportunity.currentStage)
    },

    progressWidth() {
      if (!this.opportunity) return '0%'
      if (this.opportunity.status === 'Won' || this.opportunity.status === 'Lost') return '100%'
      var idx = OPEN_STAGES.indexOf(this.opportunity.currentStage)
      if (idx < 0) return '0%'
      return ((idx / OPEN_STAGES.length) * 100) + '%'
    },

    nextStage() {
      if (!this.opportunity || this.opportunity.status !== 'Open') return null
      var idx = OPEN_STAGES.indexOf(this.opportunity.currentStage)
      if (idx < 0 || idx >= OPEN_STAGES.length - 1) return null
      return OPEN_STAGES[idx + 1]
    },

    advanceMessage() {
      if (!this.opportunity || !this.nextStage) return ''
      return 'Advance "' + this.opportunity.name + '" from ' + this.opportunity.currentStage + ' to ' + this.nextStage + '?'
    },

    relatedActivities() {
      if (!this.opportunity || !this.allActivities) return []
      return this.allActivities.filter(function (a) { return a.opportunityId === this.opportunity.id }.bind(this))
    },

    relatedDocuments() {
      if (!this.opportunity || !this.allDocuments) return []
      return this.allDocuments.filter(function (d) { return d.opportunityId === this.opportunity.id }.bind(this))
    },

    // ActivityTimeline formatted activities
    timelineActivities() {
      return this.relatedActivities.map(function (a) {
        return {
          id: a.id,
          type: a.type || 'task',
          subject: a.subject || a.name || 'Activity',
          description: a.description || '',
          date: a.dueDate || a.date || a.createdAt || '',
          status: a.status || 'Open',
          user: a.assignedTo || a.user || '',
          duration: a.duration || null
        }
      })
    },

    // BPF stages
    bpfStages() {
      return [
        { id: 'Qualification', name: 'Qualification' },
        { id: 'Development', name: 'Development' },
        { id: 'Proposal', name: 'Proposal' },
        { id: 'Negotiation', name: 'Negotiation' },
        { id: 'Closed', name: 'Closed' }
      ]
    },

    completedStages() {
      var stageOrder = ['Qualification', 'Development', 'Proposal', 'Negotiation', 'Closed']
      var currentIdx = stageOrder.indexOf(this.opportunity ? this.opportunity.currentStage : '')
      if (currentIdx < 0) {
        // If Won or Lost, all stages are completed
        if (this.opportunity && (this.opportunity.status === 'Won' || this.opportunity.status === 'Lost')) {
          return stageOrder.slice(0, stageOrder.length)
        }
        return []
      }
      return stageOrder.slice(0, currentIdx)
    },

    // Record navigation: current index in full list
    currentOppIndex() {
      if (!this.opportunity || !this.allOpportunities) return 0
      var idx = -1
      for (var i = 0; i < this.allOpportunities.length; i++) {
        if (this.allOpportunities[i].id === this.opportunity.id) {
          idx = i
          break
        }
      }
      return idx >= 0 ? idx : 0
    },

    // FactBox sections
    factBoxSections() {
      if (!this.opportunity) return []
      return [
        {
          id: 'key-info',
          title: 'Key Info',
          icon: 'info',
          collapsed: false,
          items: [
            { label: 'Estimated Value', value: this.$options.filters.currency ? this.$options.filters.currency(this.opportunity.estimatedValue) : this.opportunity.estimatedValue, type: 'currency' },
            { label: 'Probability', value: (this.opportunity.probability || 0) + '%', type: 'text' },
            { label: 'Close Date', value: this.opportunity.estimatedCloseDate || '-', type: 'date' }
          ]
        },
        {
          id: 'related',
          title: 'Related',
          icon: 'link',
          collapsed: false,
          items: [
            {
              label: 'Contact',
              value: this.opportunity.contactName || '-',
              link: this.opportunity.contactId ? '/contacts/' + this.opportunity.contactId : null,
              type: 'text'
            },
            { label: 'Activities', value: String(this.relatedActivities.length), type: 'text' },
            { label: 'Documents', value: String(this.relatedDocuments.length), type: 'text' }
          ]
        },
        {
          id: 'sales-team',
          title: 'Sales Team',
          icon: 'people',
          collapsed: false,
          items: [
            { label: 'Salesperson', value: this.salespersonName, type: 'text' },
            { label: 'Sales Cycle', value: this.opportunity.salesCycle || '-', type: 'text' }
          ]
        }
      ]
    },

    tabs() {
      return [
        { id: 'general', label: 'General' },
        { id: 'activities', label: 'Activities', count: this.relatedActivities.length },
        { id: 'documents', label: 'Documents', count: this.relatedDocuments.length },
        { id: 'notes', label: 'Notes' }
      ]
    },

    commandActions() {
      var isOpen = this.opportunity && this.opportunity.status === 'Open'
      var canAdvance = isOpen && this.nextStage !== null

      return [
        {
          id: 'edit',
          label: 'Edit',
          event: 'edit',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M12.146.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-9.5 9.5a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l9.5-9.5z"/></svg>'
        },
        {
          id: 'advance',
          label: canAdvance ? 'Advance to ' + this.nextStage : 'Advance Stage',
          event: 'advance',
          primary: true,
          disabled: !canAdvance,
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/></svg>'
        },
        {
          id: 'won',
          label: 'Set Won',
          event: 'won',
          disabled: !isOpen,
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="#107C10"><path d="M6.5 12.5L2 8l1.5-1.5L6.5 9.5 12.5 3.5 14 5l-7.5 7.5z"/></svg>'
        },
        {
          id: 'lost',
          label: 'Set Lost',
          event: 'lost',
          disabled: !isOpen,
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="#D13438"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>'
        },
        {
          id: 'delete',
          label: 'Delete',
          event: 'delete',
          extra: true,
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1z"/></svg>'
        },
        {
          id: 'new-activity',
          label: 'New Activity',
          event: 'new-activity',
          extra: true,
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/></svg>'
        }
      ]
    }
  },

  watch: {
    opportunity: {
      immediate: true,
      handler: function (opp) {
        if (opp) {
          this.notesText = opp.notes || opp.description || ''
        }
      }
    }
  },

  mounted: function () {
    var self = this
    this._shortcutRefresh = function () {
      self.$store.dispatch('opportunities/initOpportunities')
    }
    this._shortcutSave = function () {
      self.saveNotes()
    }
    this.$root.$on('shortcut-refresh', this._shortcutRefresh)
    this.$root.$on('shortcut-save', this._shortcutSave)
  },

  beforeDestroy: function () {
    this.$root.$off('shortcut-refresh', this._shortcutRefresh)
    this.$root.$off('shortcut-save', this._shortcutSave)
  },

  methods: {
    ...mapActions('opportunities', ['advanceStage', 'setWon', 'setLost', 'deleteOpportunity', 'updateOpportunity']),

    getStageIndex: function (stage) {
      return OPEN_STAGES.indexOf(stage)
    },

    handleEdit: function () {
      this.$router.push('/opportunities/' + this.opportunity.id + '/edit')
    },

    handleBpfStageClick: function () {
      // BPF stage clicks are informational
    },

    handleAdvanceStage: function () {
      if (this.nextStage) {
        this.showAdvanceDialog = true
      }
    },

    confirmAdvanceStage: function () {
      this.advanceStage(this.opportunity.id)
      this.showAdvanceDialog = false
    },

    handleSetWon: function () {
      if (this.opportunity.status === 'Open') {
        this.showWonDialog = true
      }
    },

    confirmSetWon: function () {
      this.setWon(this.opportunity.id)
      this.showWonDialog = false
    },

    handleSetLost: function () {
      if (this.opportunity.status === 'Open') {
        this.showLostDialog = true
      }
    },

    confirmSetLost: function () {
      this.setLost(this.opportunity.id)
      this.showLostDialog = false
    },

    confirmDelete: function () {
      var id = this.opportunity.id
      this.deleteOpportunity(id)
      this.showDeleteDialog = false
      this.$router.push('/opportunities')
    },

    handleNewActivity: function () {
      this.$router.push({
        path: '/activities/new',
        query: { opportunityId: this.opportunity.id }
      })
    },

    navigateToDocument: function (doc) {
      var typeMap = { 'Quote': 'quotes', 'Order': 'orders', 'Invoice': 'invoices', 'Credit Memo': 'credit-memos' }
      var type = typeMap[doc.type] || 'quotes'
      this.$router.push('/sales/' + type + '/' + doc.id)
    },

    saveNotes: function () {
      if (this.opportunity) {
        this.updateOpportunity({
          id: this.opportunity.id,
          notes: this.notesText
        })
      }
    },

    // RecordNavigation handler
    handleRecordNav: function (direction) {
      var opps = this.allOpportunities
      if (!opps || opps.length === 0) return
      var currentIdx = this.currentOppIndex
      var targetIdx = currentIdx

      if (direction === 'first') {
        targetIdx = 0
      } else if (direction === 'prev') {
        targetIdx = Math.max(0, currentIdx - 1)
      } else if (direction === 'next') {
        targetIdx = Math.min(opps.length - 1, currentIdx + 1)
      } else if (direction === 'last') {
        targetIdx = opps.length - 1
      }

      if (targetIdx !== currentIdx && opps[targetIdx]) {
        this.$router.push('/opportunities/' + opps[targetIdx].id)
      }
    },

    // ActivityTimeline click handler
    handleActivityClick: function (activity) {
      if (activity && activity.id) {
        this.$router.push('/activities/' + activity.id)
      }
    },

    // FactBox item click handler
    handleFactBoxClick: function (item) {
      if (item && item.link) {
        this.$router.push(item.link)
      }
    }
  }
}
</script>

<style scoped>
.opportunity-detail {
  padding: 0 24px 24px;
}

.page-header {
  padding: 16px 0 8px;
}

/* Detail Header */
.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}
.header-info {
  flex: 1;
}
.detail-title {
  font-size: 22px;
  font-weight: 600;
  color: #323130;
  margin: 0 0 8px;
}
.header-badges {
  display: flex;
  gap: 8px;
}
.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}
.header-value {
  text-align: right;
}
.value-label {
  display: block;
  font-size: 12px;
  color: #605E5C;
  margin-bottom: 2px;
}
.value-amount {
  font-size: 24px;
  font-weight: 600;
  color: #0078D4;
}

/* Two-column layout for detail + factbox */
.detail-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.detail-main {
  flex: 1;
  min-width: 0;
}

/* Tab Content */
.tab-content {
  margin-top: 0;
}

/* Detail Card */
.detail-card {
  padding: 0;
}
.card-section {
  padding: 20px;
  border-bottom: 1px solid #EDEBE9;
}
.card-section:last-child {
  border-bottom: none;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #323130;
  margin: 0 0 12px;
}
.section-header .section-title {
  margin-bottom: 0;
}

/* Field Grid */
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}
.field-row {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  border-bottom: 1px solid #FAF9F8;
}
.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #605E5C;
  margin-bottom: 2px;
}
.field-value {
  font-size: 14px;
  color: #323130;
}
.field-link {
  color: #0078D4;
  text-decoration: none;
}
.field-link:hover {
  text-decoration: underline;
}

.description-text {
  font-size: 14px;
  color: #323130;
  line-height: 1.6;
  margin: 0;
}

/* Documents */
.document-list {
  margin-top: 8px;
}
.document-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
}
.doc-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.doc-number {
  font-size: 14px;
  font-weight: 600;
  color: #0078D4;
}
.doc-type {
  font-size: 12px;
  color: #605E5C;
}
.doc-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}
.doc-amount {
  font-size: 14px;
  font-weight: 600;
  color: #323130;
}

/* Notes */
.notes-textarea {
  resize: vertical;
  min-height: 150px;
  font-family: inherit;
  line-height: 1.5;
}

/* Tab Count */
.tab-count {
  color: #A19F9D;
  font-weight: 400;
  font-size: 12px;
  margin-left: 2px;
}

/* Empty Section */
.empty-section {
  padding: 24px 0;
  text-align: center;
}
.empty-text {
  font-size: 14px;
  color: #605E5C;
  margin: 0;
}

/* Not Found */
.not-found {
  padding: 0 24px 24px;
}
.not-found-content {
  padding: 48px;
  text-align: center;
}
.not-found-content h2 {
  font-size: 20px;
  font-weight: 600;
  color: #323130;
  margin-bottom: 8px;
}
.not-found-content p {
  font-size: 14px;
  color: #605E5C;
  margin-bottom: 16px;
}

/* Responsive: stack factbox below on small screens */
@media (max-width: 768px) {
  .detail-layout {
    flex-direction: column;
  }
  .detail-header {
    flex-direction: column;
    gap: 12px;
  }
  .header-right {
    align-items: flex-start;
  }
  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>
