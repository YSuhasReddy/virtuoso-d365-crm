<template>
  <div class="dashboard-view">
    <!-- Command Bar -->
    <div class="command-bar">
      <div class="command-bar-left">
        <button class="d365-cmd-btn primary" @click="openQuickCreate">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" fill="none"/></svg>
          <span>Quick Create</span>
        </button>
        <span class="cmd-separator"></span>
        <button class="d365-cmd-btn" @click="refreshData">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 1a6 6 0 015.917 5H14l-3 3-3-3h1.917A4.002 4.002 0 003 7a4 4 0 007.874 1H12.92A6.002 6.002 0 017 13 6 6 0 017 1z"/></svg>
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Breadcrumb -->
    <div class="dashboard-content">
      <Breadcrumb :items="[{ label: 'Home', path: '/dashboard' }, { label: 'Dashboard' }]" />

      <h1 class="page-title">Sales Dashboard</h1>

      <!-- Loading Skeleton -->
      <div v-if="loading" class="dashboard-loading">
        <div class="skeleton-rect" v-for="i in 4" :key="'skel-kpi-' + i" style="height: 100px; margin-bottom: 16px;"></div>
      </div>

      <template v-if="!loading">
        <!-- KPI Cards Row -->
        <div class="kpi-row">
          <KpiCard
            label="Pipeline Value"
            :value="totalPipelineValue"
            format="currency"
            subtitle="Total open opportunities"
            @click="$router.push('/opportunities')"
          />
          <KpiCard
            label="Open Opportunities"
            :value="openOpportunitiesCount"
            format="number"
            :subtitle="openSubtitle"
            @click="$router.push('/opportunities')"
          />
          <KpiCard
            label="Won This Month"
            :value="wonThisMonth.value"
            format="currency"
            :subtitle="wonThisMonth.count + ' deals closed'"
            @click="$router.push('/opportunities')"
          />
          <KpiCard
            label="Activities Due Today"
            :value="activitiesDueToday"
            format="number"
            :subtitle="overdueCount + ' overdue'"
            :valueClass="activitiesDueToday > 0 ? '' : 'text-gray-400'"
            @click="$router.push('/activities')"
          />
          <KpiCard
            label="Conversion Rate"
            :value="conversionRate"
            format="number"
            :subtitle="conversionRate + '% win rate'"
            @click="$router.push('/opportunities')"
          />
          <KpiCard
            label="Avg Deal Size"
            :value="averageDealSize"
            format="currency"
            subtitle="Average won deal value"
            @click="$router.push('/opportunities')"
          />
          <KpiCard
            label="Overdue Activities"
            :value="overdueCount"
            format="number"
            subtitle="Require attention"
            :valueClass="overdueCount > 0 ? 'kpi-warning' : ''"
            @click="$router.push('/activities')"
          />
        </div>

        <!-- Main Grid: Pipeline + Recent Activities -->
        <div class="dashboard-grid">
          <!-- Pipeline Funnel -->
          <div class="dashboard-widget d365-card">
            <div class="widget-header">
              <h2 class="widget-title">Sales Pipeline</h2>
              <router-link to="/opportunities/pipeline" class="widget-link">View Pipeline</router-link>
            </div>
            <div class="pipeline-chart">
              <div
                v-for="stage in pipelineStages"
                :key="stage.name"
                class="pipeline-bar-row"
              >
                <div class="pipeline-label">
                  <span class="stage-dot" :style="{ background: stage.color }"></span>
                  <span class="stage-name">{{ stage.name }}</span>
                </div>
                <div class="pipeline-bar-container">
                  <div
                    class="pipeline-bar"
                    :style="{ width: stage.percentage + '%', background: stage.color }"
                  ></div>
                </div>
                <div class="pipeline-values">
                  <span class="pipeline-count">{{ stage.count }}</span>
                  <span class="pipeline-amount">${{ formatNumber(stage.value) }}</span>
                </div>
              </div>
            </div>
            <div class="pipeline-total">
              <span>Total Pipeline</span>
              <span class="total-value">${{ formatNumber(totalPipelineValue) }}</span>
            </div>
          </div>

          <!-- Recent Activities -->
          <div class="dashboard-widget d365-card">
            <div class="widget-header">
              <h2 class="widget-title">Recent Activities</h2>
              <router-link to="/activities" class="widget-link">View All</router-link>
            </div>
            <div class="activity-list">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-icon" :class="'icon-' + activity.type.toLowerCase()">
                  <svg v-if="activity.type === 'Call'" width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M2.5 1.5a1 1 0 011.64-.77l2.36 2a1 1 0 01-.13 1.6L5 5.5s.5 1.5 2 3 3 2 3 2l1.17-1.37a1 1 0 011.6-.13l2 2.36a1 1 0 01-.77 1.64H12c-5.523 0-10-4.477-10-10V2.5z"/></svg>
                  <svg v-else-if="activity.type === 'Email'" width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M1 3.5l6 4 6-4V11a1 1 0 01-1 1H2a1 1 0 01-1-1V3.5zM12 2H2L7 5.5 12 2z"/></svg>
                  <svg v-else-if="activity.type === 'Meeting'" width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M4 1v1H2a1 1 0 00-1 1v9a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1h-2V1h-1v1H5V1H4zm-2 4h10v7H2V5z"/></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1h8a1 1 0 011 1v8.586l-2.707 2.707A1 1 0 018.586 13H3a1 1 0 01-1-1V2a1 1 0 011-1zm1 3v1.5h6V4H4zm0 3v1.5h4V7H4z"/></svg>
                </div>
                <div class="activity-content">
                  <div class="activity-subject">{{ activity.subject }}</div>
                  <div class="activity-meta">
                    <span>{{ activity.type }}</span>
                    <span v-if="activity.dueDate"> &middot; {{ activity.dueDate | shortDate }}</span>
                    <StatusBadge v-if="activity.status === 'Completed'" status="Completed" />
                  </div>
                </div>
              </div>
              <div v-if="recentActivities.length === 0" class="empty-widget">
                No recent activities
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Timeline Section -->
        <div class="dashboard-section">
          <div class="dashboard-widget d365-card">
            <div class="widget-header">
              <h2 class="widget-title">Activity Timeline</h2>
              <router-link to="/activities" class="widget-link">View All Activities</router-link>
            </div>
            <div class="timeline-wrapper">
              <ActivityTimeline
                :activities="recentTimelineActivities"
                :max-items="8"
                :show-filters="false"
                :compact="true"
                @activity-click="goToActivity"
              />
            </div>
          </div>
        </div>

        <!-- Second Row: Top Opportunities + Sales by Salesperson -->
        <div class="dashboard-grid">
          <!-- Top Opportunities -->
          <div class="dashboard-widget d365-card">
            <div class="widget-header">
              <h2 class="widget-title">Top Opportunities</h2>
              <router-link to="/opportunities" class="widget-link">View All</router-link>
            </div>
            <template v-if="topOpportunities.length > 0">
              <table class="mini-table">
                <thead>
                  <tr>
                    <th>Opportunity</th>
                    <th>Contact</th>
                    <th>Stage</th>
                    <th class="text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="opp in topOpportunities"
                    :key="opp.id"
                    class="clickable-row"
                    @click="$router.push('/opportunities/' + opp.id)"
                  >
                    <td class="cell-link">{{ opp.name }}</td>
                    <td>{{ opp.contactName }}</td>
                    <td><StatusBadge :status="opp.currentStage" /></td>
                    <td class="text-right font-semibold">{{ opp.estimatedValue | currency }}</td>
                  </tr>
                </tbody>
              </table>
            </template>
            <div v-if="topOpportunities.length === 0" class="empty-state-action">
              <p>No open opportunities yet</p>
              <button class="d365-cmd-btn d365-cmd-primary" @click="$router.push('/opportunities/new')">Create Opportunity</button>
            </div>
          </div>

          <!-- Sales by Salesperson -->
          <div class="dashboard-widget d365-card">
            <div class="widget-header">
              <h2 class="widget-title">Sales by Salesperson</h2>
            </div>
            <div class="salesperson-chart">
              <div
                v-for="sp in salesBySalesperson"
                :key="sp.name"
                class="sp-bar-row"
              >
                <div class="sp-name">{{ sp.name }}</div>
                <div class="sp-bar-container">
                  <div
                    class="sp-bar"
                    :style="{ width: sp.percentage + '%' }"
                  ></div>
                </div>
                <div class="sp-value">${{ formatNumber(sp.totalValue) }}</div>
              </div>
            </div>
            <div v-if="salesBySalesperson.length === 0" class="empty-state-action">
              <p>No sales data</p>
              <button class="d365-cmd-btn d365-cmd-primary" @click="$router.push('/opportunities/new')">Create Opportunity</button>
            </div>
            <div v-if="conversionRate > 0" class="conversion-rate">
              <div class="conversion-label">Win Rate</div>
              <div class="conversion-value">{{ conversionRate }}%</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import KpiCard from '@/components/common/KpiCard.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ActivityTimeline from '@/components/common/ActivityTimeline.vue'
import salespersons from '@/data/salespersons'

export default {
  name: 'Dashboard',
  components: { Breadcrumb, KpiCard, StatusBadge, ActivityTimeline },
  data() {
    return {
      loading: true
    }
  },
  computed: {
    ...mapGetters('dashboard', [
      'totalPipelineValue',
      'openOpportunitiesCount',
      'wonThisMonth',
      'activitiesDueToday',
      'overdueActivities',
      'salesByStage',
      'recentActivities',
      'topOpportunities',
      'conversionRate',
      'averageDealSize'
    ]),
    salesBySalesperson() {
      const raw = this.$store.getters['dashboard/salesBySalesperson'] || []
      const spMap = {}
      salespersons.forEach(sp => { spMap[sp.id] = sp.name })
      const maxValue = Math.max(...raw.map(s => s.totalValue), 1)
      return raw.map(s => ({
        name: spMap[s.salesperson] || s.salesperson,
        totalValue: s.totalValue,
        count: s.count,
        percentage: Math.max((s.totalValue / maxValue) * 100, 5)
      }))
    },
    overdueCount() {
      return this.overdueActivities || 0
    },
    openSubtitle() {
      const stages = this.salesByStage || []
      const negotiating = stages.find(s => s.stage === 'Negotiation')
      return negotiating ? negotiating.count + ' in negotiation' : 'Across all stages'
    },
    pipelineStages() {
      const stages = this.salesByStage || []
      const maxValue = Math.max(...stages.map(s => s.value), 1)
      const colors = {
        'Qualification': '#0078D4',
        'Development': '#8764B8',
        'Proposal': '#FFB900',
        'Negotiation': '#FF8C00',
        'Closed Won': '#107C10'
      }
      return stages.filter(s => s.stage !== 'Closed Lost').map(s => ({
        name: s.stage,
        count: s.count,
        value: s.value,
        percentage: Math.max((s.value / maxValue) * 100, 5),
        color: colors[s.stage] || '#0078D4'
      }))
    },
    recentTimelineActivities() {
      var activities = this.recentActivities || []
      return activities.map(function (a) {
        return {
          id: a.id,
          type: a.type || 'Task',
          subject: a.subject || '',
          description: a.description || '',
          date: a.dueDate || a.createdAt || '',
          status: a.status || 'Open',
          user: '',
          duration: a.duration || 0
        }
      })
    }
  },
  methods: {
    ...mapActions('ui', ['openQuickCreate']),
    refreshData() {
      this.$store.dispatch('contacts/initContacts')
      this.$store.dispatch('opportunities/initOpportunities')
      this.$store.dispatch('activities/initActivities')
      this.$store.dispatch('sales/initDocuments')
      this.$store.dispatch('ui/showInfo', { title: 'Refreshed', message: 'Dashboard data has been refreshed.' })
    },
    formatNumber(num) {
      if (!num) return '0'
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
      if (num >= 1000) return (num / 1000).toFixed(0) + 'K'
      return num.toLocaleString()
    },
    goToActivity(activity) {
      if (activity && activity.id) {
        this.$router.push('/activities')
      }
    },
    handleRefresh() {
      this.refreshData()
    }
  },
  mounted() {
    var self = this
    setTimeout(function () {
      self.loading = false
    }, 500)
    this.$root.$on('shortcut-refresh', this.handleRefresh)
  },
  beforeDestroy() {
    this.$root.$off('shortcut-refresh', this.handleRefresh)
  }
}
</script>

<style scoped>
.dashboard-view {
  min-height: 100%;
}

.command-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  background: white;
  border-bottom: 1px solid #EDEBE9;
}
.command-bar-left {
  display: flex;
  align-items: center;
  gap: 2px;
}
.cmd-separator {
  display: inline-block;
  width: 1px;
  height: 24px;
  background: #EDEBE9;
  margin: 0 4px;
}

.dashboard-content {
  padding: 0 24px 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #323130;
  margin: 0 0 16px 0;
}

/* Loading Skeleton */
.dashboard-loading {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.skeleton-rect {
  background: linear-gradient(90deg, #F3F2F1 25%, #EDEBE9 50%, #F3F2F1 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 2px;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* KPI Row */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

/* KPI Warning Color */
.kpi-warning {
  color: #D13438 !important;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

/* Dashboard Section for Timeline */
.dashboard-section {
  margin-bottom: 20px;
}

.dashboard-widget {
  padding: 0;
  overflow: hidden;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #EDEBE9;
}
.widget-title {
  font-size: 15px;
  font-weight: 600;
  color: #323130;
  margin: 0;
}
.widget-link {
  font-size: 13px;
  color: #0078D4;
  text-decoration: none;
}
.widget-link:hover {
  text-decoration: underline;
}

/* Timeline Wrapper */
.timeline-wrapper {
  padding: 16px 20px;
}

/* Pipeline Chart */
.pipeline-chart {
  padding: 16px 20px;
}
.pipeline-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.pipeline-label {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 120px;
  flex-shrink: 0;
}
.stage-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.stage-name {
  font-size: 13px;
  color: #323130;
  white-space: nowrap;
}
.pipeline-bar-container {
  flex: 1;
  height: 24px;
  background: #F3F2F1;
  border-radius: 2px;
  overflow: hidden;
}
.pipeline-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
  min-width: 4px;
}
.pipeline-values {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 80px;
}
.pipeline-count {
  font-size: 12px;
  font-weight: 600;
  color: #323130;
}
.pipeline-amount {
  font-size: 11px;
  color: #605E5C;
}
.pipeline-total {
  display: flex;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid #EDEBE9;
  font-size: 13px;
  font-weight: 600;
  color: #323130;
}
.total-value {
  color: #0078D4;
  font-size: 15px;
}

/* Activity List */
.activity-list {
  padding: 8px 0;
  max-height: 380px;
  overflow-y: auto;
}
.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 20px;
  transition: background 0.1s;
}
.activity-item:hover {
  background: #F3F2F1;
}
.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.icon-call { background: #E8F5E9; color: #107C10; }
.icon-email { background: #DEECF9; color: #0078D4; }
.icon-meeting { background: #FFF4CE; color: #797673; }
.icon-task { background: #F3F2F1; color: #605E5C; }
.activity-content { flex: 1; min-width: 0; }
.activity-subject {
  font-size: 13px;
  font-weight: 600;
  color: #323130;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.activity-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #605E5C;
  margin-top: 2px;
}

/* Mini Table */
.mini-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.mini-table th {
  padding: 8px 16px;
  text-align: left;
  font-weight: 600;
  color: #605E5C;
  border-bottom: 1px solid #EDEBE9;
  font-size: 12px;
}
.mini-table td {
  padding: 8px 16px;
  color: #323130;
  border-bottom: 1px solid #EDEBE9;
}
.mini-table .cell-link {
  color: #0078D4;
  cursor: pointer;
}
.clickable-row {
  cursor: pointer;
  transition: background 0.1s;
}
.clickable-row:hover {
  background: #F3F2F1;
}
.text-right { text-align: right; }
.font-semibold { font-weight: 600; }

/* Empty State with Action */
.empty-state-action {
  padding: 32px 24px;
  text-align: center;
  color: #605E5C;
}
.empty-state-action p {
  margin: 0 0 16px;
  font-size: 14px;
  color: #A19F9D;
}
.d365-cmd-primary {
  background: #0078D4;
  color: #FFFFFF;
  border: 1px solid #0078D4;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 2px;
  cursor: pointer;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  transition: background-color 0.1s ease;
}
.d365-cmd-primary:hover {
  background: #106EBE;
  border-color: #106EBE;
}

/* Salesperson Chart */
.salesperson-chart {
  padding: 16px 20px;
}
.sp-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.sp-name {
  width: 120px;
  font-size: 13px;
  color: #323130;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sp-bar-container {
  flex: 1;
  height: 20px;
  background: #F3F2F1;
  border-radius: 2px;
  overflow: hidden;
}
.sp-bar {
  height: 100%;
  background: #0078D4;
  border-radius: 2px;
  transition: width 0.5s ease;
}
.sp-value {
  font-size: 13px;
  font-weight: 600;
  color: #323130;
  min-width: 70px;
  text-align: right;
}

.conversion-rate {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid #EDEBE9;
  background: #F9F9F8;
}
.conversion-label {
  font-size: 12px;
  font-weight: 600;
  color: #605E5C;
}
.conversion-value {
  font-size: 18px;
  font-weight: 700;
  color: #107C10;
}

.empty-widget {
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: #A19F9D;
}

/* Responsive */
@media (max-width: 1024px) {
  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .dashboard-loading {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .kpi-row {
    grid-template-columns: 1fr;
  }
  .dashboard-content {
    padding: 0 12px 12px;
  }
  .dashboard-loading {
    grid-template-columns: 1fr;
  }
}
</style>
