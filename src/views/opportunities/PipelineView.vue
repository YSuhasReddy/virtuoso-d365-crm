<template>
  <div class="pipeline-view">
    <!-- Breadcrumb -->
    <div class="page-header">
      <Breadcrumb :items="breadcrumbs" />
      <h1 class="page-title">Pipeline View</h1>
    </div>

    <!-- Command Bar -->
    <CommandBar
      :actions="commandActions"
      :show-view-switcher="false"
      :show-filter="false"
      @list-view="$router.push('/opportunities')"
      @new="$router.push('/opportunities/new')"
      @refresh="handleRefresh"
      @export="handleExportPipeline"
    />

    <!-- Pipeline Summary -->
    <div class="pipeline-summary">
      <div class="summary-card d365-card">
        <span class="summary-label">Total Pipeline Value</span>
        <span class="summary-value">{{ totalPipelineValue | currency }}</span>
      </div>
      <div class="summary-card d365-card">
        <span class="summary-label">Open Opportunities</span>
        <span class="summary-value">{{ openCount }}</span>
      </div>
      <div class="summary-card d365-card">
        <span class="summary-label">Won This Period</span>
        <span class="summary-value summary-won">{{ wonCount }}</span>
      </div>
      <div class="summary-card d365-card">
        <span class="summary-label">Weighted Value</span>
        <span class="summary-value summary-weighted">{{ weightedValue | currency }}</span>
      </div>
      <div class="summary-card d365-card summary-card-weighted">
        <span class="summary-label">Weighted Pipeline</span>
        <span class="summary-value summary-weighted-pipeline">{{ weightedPipelineValue | currency }}</span>
        <span class="summary-detail">Sum of (Value x Probability)</span>
      </div>
    </div>

    <!-- Pipeline Board -->
    <div class="pipeline-board">
      <div
        v-for="stage in pipelineStages"
        :key="stage.name"
        class="pipeline-column"
      >
        <div class="column-header" :style="{ borderTopColor: stage.color }">
          <div class="column-title-row">
            <span class="column-title">{{ stage.name }}</span>
            <span class="column-count">{{ getStageOpportunities(stage.name).length }}</span>
          </div>
          <div class="column-value">{{ getStageTotal(stage.name) | currency }}</div>
        </div>
        <div class="column-body">
          <div
            v-for="opp in getStageOpportunities(stage.name)"
            :key="opp.id"
            class="pipeline-card d365-card"
            @click="navigateToOpportunity(opp)"
          >
            <div class="card-name">{{ opp.name }}</div>
            <div class="card-contact">{{ opp.contactName }}</div>
            <div class="card-details">
              <span class="card-value">{{ opp.estimatedValue | currency }}</span>
              <StatusBadge :status="opp.priority" />
            </div>
            <div class="card-footer">
              <span class="card-date">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="#A19F9D">
                  <path d="M3 1v1H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H9V1H8v1H4V1H3zm-1 3h8v6H2V4z"/>
                </svg>
                {{ opp.estimatedCloseDate | shortDate }}
              </span>
              <span class="card-probability">{{ opp.probability }}%</span>
            </div>
          </div>
          <div v-if="getStageOpportunities(stage.name).length === 0" class="column-empty">
            <span class="empty-text">No opportunities</span>
          </div>
        </div>
      </div>

      <!-- Closed Won Column -->
      <div class="pipeline-column">
        <div class="column-header" style="border-top-color: #107C10;">
          <div class="column-title-row">
            <span class="column-title">Closed Won</span>
            <span class="column-count">{{ wonOpportunities.length }}</span>
          </div>
          <div class="column-value column-value-won">{{ wonTotal | currency }}</div>
        </div>
        <div class="column-body">
          <div
            v-for="opp in wonOpportunities"
            :key="opp.id"
            class="pipeline-card d365-card card-won"
            @click="navigateToOpportunity(opp)"
          >
            <div class="card-name">{{ opp.name }}</div>
            <div class="card-contact">{{ opp.contactName }}</div>
            <div class="card-details">
              <span class="card-value">{{ opp.estimatedValue | currency }}</span>
              <StatusBadge status="Won" />
            </div>
            <div class="card-footer">
              <span class="card-date">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="#A19F9D">
                  <path d="M3 1v1H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H9V1H8v1H4V1H3zm-1 3h8v6H2V4z"/>
                </svg>
                {{ opp.estimatedCloseDate | shortDate }}
              </span>
              <span class="card-probability card-probability-won">100%</span>
            </div>
          </div>
          <div v-if="wonOpportunities.length === 0" class="column-empty">
            <span class="empty-text">No won deals</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Lost Opportunities Section -->
    <div class="lost-section">
      <button class="lost-toggle" @click="showLost = !showLost">
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
          :class="{ 'chevron-open': showLost }"
          class="chevron-icon"
        >
          <path d="M4 2l4 4-4 4"/>
        </svg>
        <span>Closed Lost ({{ lostOpportunities.length }})</span>
        <span class="lost-value">{{ lostTotal | currency }}</span>
      </button>
      <transition name="slide">
        <div v-if="showLost" class="lost-cards">
          <div
            v-for="opp in lostOpportunities"
            :key="opp.id"
            class="lost-card d365-card"
            @click="navigateToOpportunity(opp)"
          >
            <div class="lost-card-main">
              <span class="card-name">{{ opp.name }}</span>
              <span class="card-contact">{{ opp.contactName }}</span>
            </div>
            <div class="lost-card-meta">
              <span class="card-value">{{ opp.estimatedValue | currency }}</span>
              <StatusBadge status="Lost" />
            </div>
          </div>
          <div v-if="lostOpportunities.length === 0" class="column-empty">
            <span class="empty-text">No lost opportunities</span>
          </div>
        </div>
      </transition>
    </div>

    <!-- Summary Footer -->
    <div class="pipeline-footer d365-card">
      <div class="footer-row">
        <div class="footer-item">
          <span class="footer-label">Qualification</span>
          <span class="footer-value">{{ getStageTotal('Qualification') | currency }}</span>
        </div>
        <div class="footer-item">
          <span class="footer-label">Development</span>
          <span class="footer-value">{{ getStageTotal('Development') | currency }}</span>
        </div>
        <div class="footer-item">
          <span class="footer-label">Proposal</span>
          <span class="footer-value">{{ getStageTotal('Proposal') | currency }}</span>
        </div>
        <div class="footer-item">
          <span class="footer-label">Negotiation</span>
          <span class="footer-value">{{ getStageTotal('Negotiation') | currency }}</span>
        </div>
        <div class="footer-item footer-item-won">
          <span class="footer-label">Won</span>
          <span class="footer-value">{{ wonTotal | currency }}</span>
        </div>
        <div class="footer-item footer-item-total">
          <span class="footer-label">Total Pipeline</span>
          <span class="footer-value">{{ grandTotal | currency }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import CommandBar from '@/components/layout/CommandBar.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

export default {
  name: 'PipelineView',

  components: {
    Breadcrumb,
    CommandBar,
    StatusBadge
  },

  data() {
    return {
      showLost: false,
      breadcrumbs: [
        { label: 'Home', path: '/dashboard' },
        { label: 'Opportunities', path: '/opportunities' },
        { label: 'Pipeline' }
      ],
      pipelineStages: [
        { name: 'Qualification', color: '#0078D4' },
        { name: 'Development', color: '#8764B8' },
        { name: 'Proposal', color: '#FFB900' },
        { name: 'Negotiation', color: '#FF8C00' }
      ],
      commandActions: [
        {
          id: 'list-view',
          label: 'List View',
          event: 'list-view',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1 2h14v2H1V2zm0 4h14v2H1V6zm0 4h14v2H1v-2zm0 4h14v2H1v-2z"/></svg>'
        },
        {
          id: 'new',
          label: 'New',
          event: 'new',
          primary: true,
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" fill="none"/></svg>'
        },
        {
          id: 'export',
          label: 'Export Pipeline',
          event: 'export',
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 1h8v2h-8V1zm-2 3h12v1H2V4zm1 2h10v9H3V6zm2 2v1h2V8H5zm3 0v1h2V8H8zm-3 2v1h2v-1H5zm3 0v1h2v-1H8zm-3 2v1h2v-1H5zm3 0v1h2v-1H8z"/></svg>'
        },
        {
          id: 'refresh',
          label: 'Refresh',
          event: 'refresh',
          extra: true,
          icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 1 1 .908-.418A6 6 0 1 1 8 2v1z"/><path d="M8 1v4l3-2-3-2z"/></svg>'
        }
      ]
    }
  },

  computed: {
    ...mapGetters('opportunities', [
      'byStage',
      'pipelineData',
      'totalPipelineValue',
      'allOpportunities',
      'openOpportunities',
      'wonOpportunities',
      'lostOpportunities'
    ]),

    openCount: function () {
      return this.openOpportunities.length
    },

    wonCount: function () {
      return this.wonOpportunities.length
    },

    wonTotal: function () {
      return this.wonOpportunities.reduce(function (sum, o) { return sum + (o.estimatedValue || 0) }, 0)
    },

    lostTotal: function () {
      return this.lostOpportunities.reduce(function (sum, o) { return sum + (o.estimatedValue || 0) }, 0)
    },

    weightedValue: function () {
      return this.openOpportunities.reduce(function (sum, o) {
        return sum + ((o.estimatedValue || 0) * (o.probability || 0) / 100)
      }, 0)
    },

    // New KPI: weighted pipeline value = sum of (estimatedValue * probability/100) for all open opportunities
    weightedPipelineValue: function () {
      return this.openOpportunities.reduce(function (sum, o) {
        return sum + ((o.estimatedValue || 0) * (o.probability || 0) / 100)
      }, 0)
    },

    grandTotal: function () {
      return this.allOpportunities.reduce(function (sum, o) { return sum + (o.estimatedValue || 0) }, 0)
    }
  },

  mounted: function () {
    var self = this
    this._shortcutRefresh = function () {
      self.handleRefresh()
    }
    this.$root.$on('shortcut-refresh', this._shortcutRefresh)
  },

  beforeDestroy: function () {
    this.$root.$off('shortcut-refresh', this._shortcutRefresh)
  },

  methods: {
    getStageOpportunities: function (stageName) {
      if (!this.byStage) return []
      return (this.byStage[stageName] || []).filter(function (o) { return o.status === 'Open' })
    },

    getStageTotal: function (stageName) {
      var opps = this.getStageOpportunities(stageName)
      return opps.reduce(function (sum, o) { return sum + (o.estimatedValue || 0) }, 0)
    },

    navigateToOpportunity: function (opp) {
      this.$router.push('/opportunities/' + opp.id)
    },

    handleRefresh: function () {
      this.$store.dispatch('opportunities/initOpportunities')
    },

    // Export pipeline data to CSV
    handleExportPipeline: function () {
      var stages = ['Qualification', 'Development', 'Proposal', 'Negotiation']
      var allExportRows = []
      var self = this

      // Open opportunities by stage
      stages.forEach(function (stageName) {
        var stageOpps = self.getStageOpportunities(stageName)
        stageOpps.forEach(function (opp) {
          allExportRows.push({
            Name: opp.name || '',
            Contact: opp.contactName || '',
            Stage: stageName,
            Status: 'Open',
            'Estimated Value': opp.estimatedValue || 0,
            'Probability (%)': opp.probability || 0,
            'Weighted Value': ((opp.estimatedValue || 0) * (opp.probability || 0) / 100).toFixed(2),
            Priority: opp.priority || '',
            'Close Date': opp.estimatedCloseDate || ''
          })
        })
      })

      // Won opportunities
      self.wonOpportunities.forEach(function (opp) {
        allExportRows.push({
          Name: opp.name || '',
          Contact: opp.contactName || '',
          Stage: 'Closed Won',
          Status: 'Won',
          'Estimated Value': opp.estimatedValue || 0,
          'Probability (%)': 100,
          'Weighted Value': (opp.estimatedValue || 0).toFixed(2),
          Priority: opp.priority || '',
          'Close Date': opp.estimatedCloseDate || ''
        })
      })

      // Lost opportunities
      self.lostOpportunities.forEach(function (opp) {
        allExportRows.push({
          Name: opp.name || '',
          Contact: opp.contactName || '',
          Stage: 'Closed Lost',
          Status: 'Lost',
          'Estimated Value': opp.estimatedValue || 0,
          'Probability (%)': 0,
          'Weighted Value': '0.00',
          Priority: opp.priority || '',
          'Close Date': opp.estimatedCloseDate || ''
        })
      })

      if (allExportRows.length === 0) {
        return
      }

      // Build CSV
      var headers = Object.keys(allExportRows[0])
      var csvLines = [headers.map(function (h) { return self.escapeCsvField(h) }).join(',')]

      allExportRows.forEach(function (row) {
        var line = headers.map(function (h) {
          return self.escapeCsvField(row[h] !== null && row[h] !== undefined ? String(row[h]) : '')
        }).join(',')
        csvLines.push(line)
      })

      var csvContent = csvLines.join('\n')
      var blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      var url = URL.createObjectURL(blob)

      var now = new Date()
      var dateStr = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0')
      var fileName = 'pipeline-export-' + dateStr + '.csv'

      var link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },

    escapeCsvField: function (value) {
      if (value == null) return ''
      var str = String(value)
      if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1 || str.indexOf('\r') !== -1) {
        return '"' + str.replace(/"/g, '""') + '"'
      }
      return str
    }
  }
}
</script>

<style scoped>
.pipeline-view {
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

/* Pipeline Summary */
.pipeline-summary {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin: 12px 0;
}
.summary-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.summary-card-weighted {
  background: linear-gradient(135deg, #F3F2F1 0%, #EFF6FC 100%);
  border-color: #0078D4;
}
.summary-label {
  font-size: 12px;
  font-weight: 600;
  color: #605E5C;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.summary-value {
  font-size: 22px;
  font-weight: 600;
  color: #323130;
}
.summary-won {
  color: #107C10;
}
.summary-weighted {
  color: #0078D4;
}
.summary-weighted-pipeline {
  color: #0078D4;
  font-size: 20px;
}
.summary-detail {
  font-size: 10px;
  color: #A19F9D;
  font-weight: 400;
}

/* Pipeline Board */
.pipeline-board {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 16px;
  min-height: 400px;
}

/* Column */
.pipeline-column {
  display: flex;
  flex-direction: column;
  background: #FAFAFA;
  border-radius: 2px;
  border: 1px solid #EDEBE9;
  overflow: hidden;
}

.column-header {
  padding: 12px;
  background: #FFFFFF;
  border-top: 3px solid #C8C6C4;
  border-bottom: 1px solid #EDEBE9;
}
.column-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.column-title {
  font-size: 13px;
  font-weight: 600;
  color: #323130;
}
.column-count {
  font-size: 12px;
  font-weight: 600;
  color: #FFFFFF;
  background: #605E5C;
  border-radius: 10px;
  padding: 1px 8px;
  min-width: 22px;
  text-align: center;
}
.column-value {
  font-size: 14px;
  font-weight: 600;
  color: #0078D4;
  margin-top: 4px;
}
.column-value-won {
  color: #107C10;
}

.column-body {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Pipeline Card */
.pipeline-card {
  padding: 12px;
  cursor: pointer;
  transition: box-shadow 0.15s ease, transform 0.1s ease;
  border-left: 3px solid transparent;
}
.pipeline-card:hover {
  box-shadow: 0 3.2px 7.2px rgba(0,0,0,0.132), 0 0.6px 1.8px rgba(0,0,0,0.108);
  transform: translateY(-1px);
}
.card-won {
  border-left-color: #107C10;
}

.card-name {
  font-size: 13px;
  font-weight: 600;
  color: #323130;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-contact {
  font-size: 12px;
  color: #605E5C;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-details {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.card-value {
  font-size: 13px;
  font-weight: 600;
  color: #0078D4;
}
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: #A19F9D;
}
.card-date {
  display: flex;
  align-items: center;
  gap: 4px;
}
.card-probability {
  font-weight: 600;
  color: #605E5C;
}
.card-probability-won {
  color: #107C10;
}

/* Column Empty */
.column-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 80px;
}
.empty-text {
  font-size: 12px;
  color: #A19F9D;
}

/* Lost Section */
.lost-section {
  margin-bottom: 16px;
}
.lost-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: #FDE7E9;
  border: 1px solid #F1C1C3;
  border-radius: 2px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #D13438;
  text-align: left;
}
.lost-toggle:hover {
  background: #F9D0D3;
}
.lost-value {
  margin-left: auto;
  font-size: 14px;
  font-weight: 600;
}
.chevron-icon {
  transition: transform 0.2s ease;
}
.chevron-open {
  transform: rotate(90deg);
}

.lost-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 8px;
  padding: 12px 0;
}
.lost-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  cursor: pointer;
  border-left: 3px solid #D13438;
}
.lost-card:hover {
  background: #FAF9F8;
}
.lost-card-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
.lost-card-main .card-name {
  margin-bottom: 0;
}
.lost-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Pipeline Footer */
.pipeline-footer {
  padding: 16px 20px;
}
.footer-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
.footer-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  text-align: center;
  padding: 8px;
  border-right: 1px solid #EDEBE9;
}
.footer-item:last-child {
  border-right: none;
}
.footer-label {
  font-size: 11px;
  font-weight: 600;
  color: #605E5C;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.footer-value {
  font-size: 15px;
  font-weight: 600;
  color: #323130;
}
.footer-item-won .footer-value {
  color: #107C10;
}
.footer-item-total {
  background: #F3F2F1;
  border-radius: 2px;
}
.footer-item-total .footer-value {
  color: #0078D4;
  font-size: 16px;
}

/* Slide transition */
.slide-enter-active, .slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-enter, .slide-leave-to {
  opacity: 0;
  max-height: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .pipeline-summary {
    grid-template-columns: repeat(3, 1fr);
  }
  .pipeline-board {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .pipeline-summary {
    grid-template-columns: repeat(2, 1fr);
  }
  .pipeline-board {
    grid-template-columns: 1fr;
  }
  .footer-row {
    flex-wrap: wrap;
  }
  .footer-item {
    min-width: 30%;
  }
}
</style>
