<template>
  <div class="activity-timeline">
    <!-- Filter pills -->
    <div v-if="showFilters" class="timeline-filters">
      <button
        v-for="filterType in filterTypes"
        :key="filterType.value"
        class="filter-pill"
        :class="{ 'filter-pill-active': isFilterActive(filterType.value) }"
        @click="toggleFilter(filterType.value)"
      >
        <span class="filter-dot" :style="{ background: typeColors[filterType.value] || '#C8C6C4' }"></span>
        {{ filterType.label }}
      </button>
      <button
        v-if="activeFilters.length > 0"
        class="filter-clear"
        @click="clearFilters"
      >
        Clear
      </button>
    </div>

    <!-- Timeline content -->
    <div v-if="groupedActivities.length > 0" class="timeline-body">
      <div
        v-for="group in visibleGroups"
        :key="group.label"
        class="timeline-group"
      >
        <!-- Date group header -->
        <div class="group-header">
          <span class="group-label">{{ group.label }}</span>
          <span class="group-line"></span>
        </div>

        <!-- Activity items -->
        <div
          v-for="activity in group.items"
          :key="activity.id"
          class="timeline-item"
          :class="{ 'timeline-item-compact': compact }"
          @click="$emit('activity-click', activity)"
          @keydown.enter="$emit('activity-click', activity)"
          tabindex="0"
        >
          <!-- Timeline dot -->
          <div class="timeline-dot-container">
            <div class="timeline-line-segment timeline-line-top"></div>
            <div class="timeline-dot" :style="{ background: typeColors[activity.type] || '#C8C6C4' }">
              <span class="dot-icon" v-html="getTypeIcon(activity.type)"></span>
            </div>
            <div class="timeline-line-segment timeline-line-bottom"></div>
          </div>

          <!-- Activity card -->
          <div class="timeline-card">
            <div class="card-top">
              <span class="activity-type-badge" :style="getTypeBadgeStyle(activity.type)">{{ activity.type }}</span>
              <span class="activity-subject">{{ activity.subject }}</span>
            </div>
            <div
              v-if="activity.description && !compact"
              class="card-description"
              :class="{ 'card-description-expanded': expandedIds[activity.id] }"
              @click.stop="toggleExpand(activity.id)"
            >
              {{ activity.description }}
            </div>
            <div class="card-bottom">
              <span v-if="activity.user" class="card-user">{{ activity.user }}</span>
              <span class="card-time">{{ formatTime(activity.date) }}</span>
              <span v-if="activity.duration" class="card-duration">{{ formatDuration(activity.duration) }}</span>
              <span v-if="activity.status" class="card-status" :class="getStatusClass(activity.status)">{{ activity.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Load more button -->
      <div v-if="hasMore" class="timeline-load-more">
        <button class="load-more-btn" @click="handleLoadMore">
          Show more activities ({{ filteredActivities.length - displayCount }} remaining)
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="timeline-empty">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" class="empty-icon">
        <circle cx="20" cy="20" r="18" stroke="#C8C6C4" stroke-width="2" fill="none"/>
        <path d="M20 12v8l5 3" stroke="#C8C6C4" stroke-width="2" stroke-linecap="round" fill="none"/>
      </svg>
      <p class="empty-text">No activities yet</p>
      <p class="empty-subtext">Activities will appear here once they are created.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActivityTimeline',

  props: {
    activities: {
      type: Array,
      default: function () { return [] }
    },
    maxItems: {
      type: Number,
      default: 20
    },
    showFilters: {
      type: Boolean,
      default: true
    },
    compact: {
      type: Boolean,
      default: false
    }
  },

  data: function () {
    return {
      activeFilters: [],
      expandedIds: {},
      displayCount: this.maxItems,
      typeColors: {
        'Task': '#0078D4',
        'Call': '#FFB900',
        'Email': '#107C10',
        'Meeting': '#8764B8',
        'Note': '#605E5C',
        'System': '#C8C6C4'
      },
      filterTypes: [
        { value: 'Task', label: 'Task' },
        { value: 'Call', label: 'Call' },
        { value: 'Email', label: 'Email' },
        { value: 'Meeting', label: 'Meeting' },
        { value: 'Note', label: 'Note' }
      ]
    }
  },

  computed: {
    filteredActivities: function () {
      var activities = Array.isArray(this.activities) ? this.activities : []
      var filters = this.activeFilters
      if (filters.length > 0) {
        activities = activities.filter(function (a) {
          return filters.indexOf(a.type) !== -1
        })
      }
      // Sort by date descending
      return activities.slice().sort(function (a, b) {
        return new Date(b.date) - new Date(a.date)
      })
    },

    groupedActivities: function () {
      var groups = []
      var groupMap = {}
      var self = this

      this.filteredActivities.forEach(function (activity) {
        var label = self.getDateGroupLabel(activity.date)
        if (!groupMap[label]) {
          groupMap[label] = { label: label, items: [], sortDate: new Date(activity.date) }
          groups.push(groupMap[label])
        }
        groupMap[label].items.push(activity)
      })

      return groups
    },

    visibleGroups: function () {
      var count = 0
      var limit = this.displayCount
      var result = []

      for (var i = 0; i < this.groupedActivities.length; i++) {
        var group = this.groupedActivities[i]
        if (count >= limit) break
        var remaining = limit - count
        var items = group.items.slice(0, remaining)
        result.push({ label: group.label, items: items })
        count += items.length
      }

      return result
    },

    hasMore: function () {
      return this.filteredActivities.length > this.displayCount
    }
  },

  methods: {
    isFilterActive: function (type) {
      return this.activeFilters.indexOf(type) !== -1
    },

    toggleFilter: function (type) {
      var idx = this.activeFilters.indexOf(type)
      if (idx === -1) {
        this.activeFilters.push(type)
      } else {
        this.activeFilters.splice(idx, 1)
      }
      this.displayCount = this.maxItems
      this.$emit('filter-change', this.activeFilters.slice())
    },

    clearFilters: function () {
      this.activeFilters = []
      this.displayCount = this.maxItems
      this.$emit('filter-change', [])
    },

    toggleExpand: function (id) {
      this.expandedIds[id] = !this.expandedIds[id]
    },

    handleLoadMore: function () {
      this.displayCount += this.maxItems
      this.$emit('load-more')
    },

    getDateGroupLabel: function (dateStr) {
      if (!dateStr) return 'Unknown'
      var date = new Date(dateStr)
      if (isNaN(date.getTime())) return 'Unknown'

      var today = new Date()
      today.setHours(0, 0, 0, 0)
      var activityDate = new Date(date)
      activityDate.setHours(0, 0, 0, 0)

      var diff = today.getTime() - activityDate.getTime()
      var dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (dayDiff === 0) return 'Today'
      if (dayDiff === 1) return 'Yesterday'
      if (dayDiff < 7) return activityDate.toLocaleDateString('en-US', { weekday: 'long' })

      return activityDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    },

    formatTime: function (dateStr) {
      if (!dateStr) return ''
      var date = new Date(dateStr)
      if (isNaN(date.getTime())) return ''
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    },

    formatDuration: function (minutes) {
      if (!minutes || minutes <= 0) return ''
      if (minutes < 60) return minutes + ' min'
      var h = Math.floor(minutes / 60)
      var m = minutes % 60
      return h + 'h' + (m > 0 ? ' ' + m + 'm' : '')
    },

    getTypeIcon: function (type) {
      var icons = {
        'Task': '<svg width="8" height="8" viewBox="0 0 8 8" fill="white"><path d="M3 6L1 4l.7-.7L3 4.6 6.3 1.3l.7.7L3 6z"/></svg>',
        'Call': '<svg width="8" height="8" viewBox="0 0 8 8" fill="white"><path d="M1.5 1C1.2 1 1 1.2 1 1.5v.8c0 2.5 2.2 4.7 4.7 4.7h.8c.3 0 .5-.2.5-.5V5.3L5.5 4.5l-1 .5C3.5 4.5 3 3.5 3.5 3l.5-1L3.2 .5H1.5z"/></svg>',
        'Email': '<svg width="8" height="8" viewBox="0 0 8 8" fill="white"><path d="M0 2l4 2.5L8 2v4.5c0 .3-.2.5-.5.5h-7C.2 7 0 6.8 0 6.5V2zm0-.5C0 1.2.2 1 .5 1h7c.3 0 .5.2.5.5L4 4 0 1.5z"/></svg>',
        'Meeting': '<svg width="8" height="8" viewBox="0 0 8 8" fill="white"><path d="M1 1h6v1H1V1zm0 2h6v4H1V3zm1 1v2h4V4H2z"/></svg>',
        'Note': '<svg width="8" height="8" viewBox="0 0 8 8" fill="white"><path d="M1 1h6v6H4L1 4V1zm1 1v1.5L3.5 6H6V2H2z"/></svg>',
        'System': '<svg width="8" height="8" viewBox="0 0 8 8" fill="white"><circle cx="4" cy="4" r="2"/></svg>'
      }
      return icons[type] || icons['System']
    },

    getTypeBadgeStyle: function (type) {
      var color = this.typeColors[type] || '#C8C6C4'
      return {
        background: color + '1A',
        color: color
      }
    },

    getStatusClass: function (status) {
      if (!status) return ''
      var s = status.toLowerCase()
      if (s === 'completed' || s === 'done') return 'status-completed'
      if (s === 'overdue') return 'status-overdue'
      if (s === 'cancelled' || s === 'canceled') return 'status-cancelled'
      return 'status-default'
    }
  }
}
</script>

<style scoped>
.activity-timeline {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

/* Filter pills */
.timeline-filters {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 0 0 12px;
  border-bottom: 1px solid #EDEBE9;
  margin-bottom: 16px;
}
.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 400;
  color: #605E5C;
  background: #FFFFFF;
  border: 1px solid #EDEBE9;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.1s ease;
  font-family: inherit;
}
.filter-pill:hover {
  background: #F3F2F1;
  border-color: #C8C6C4;
}
.filter-pill-active {
  background: #DEECF9;
  border-color: #0078D4;
  color: #0078D4;
  font-weight: 600;
}
.filter-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.filter-clear {
  padding: 4px 10px;
  font-size: 12px;
  color: #0078D4;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
}
.filter-clear:hover {
  text-decoration: underline;
}

/* Timeline body */
.timeline-body {
  position: relative;
}

/* Group header */
.group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0 6px 24px;
}
.group-label {
  font-size: 12px;
  font-weight: 600;
  color: #605E5C;
  white-space: nowrap;
  flex-shrink: 0;
}
.group-line {
  flex: 1;
  height: 1px;
  background: #EDEBE9;
}

/* Timeline item */
.timeline-item {
  display: flex;
  align-items: stretch;
  padding: 0 0 0 0;
  cursor: pointer;
  outline: none;
}
.timeline-item:focus-visible .timeline-card {
  outline: 2px solid #0078D4;
  outline-offset: 1px;
}

/* Timeline dot container */
.timeline-dot-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24px;
  flex-shrink: 0;
  position: relative;
}
.timeline-line-segment {
  width: 2px;
  flex: 1;
  background: #EDEBE9;
}
.timeline-group:first-child .timeline-item:first-child .timeline-line-top {
  background: transparent;
}
.timeline-group:last-child .timeline-item:last-child .timeline-line-bottom {
  background: transparent;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px 0;
  position: relative;
  z-index: 1;
}
.dot-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

/* Timeline card */
.timeline-card {
  flex: 1;
  background: #FFFFFF;
  border: 1px solid #EDEBE9;
  border-radius: 8px;
  padding: 12px;
  margin: 4px 0 4px 10px;
  transition: box-shadow 0.15s ease;
  min-width: 0;
}
.timeline-item:hover .timeline-card {
  box-shadow: 0 1.6px 3.6px rgba(0, 0, 0, 0.1);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.activity-type-badge {
  display: inline-block;
  padding: 1px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 2px;
  white-space: nowrap;
  flex-shrink: 0;
}
.activity-subject {
  font-size: 13px;
  font-weight: 600;
  color: #323130;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.card-description {
  font-size: 12px;
  color: #605E5C;
  line-height: 1.5;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: pointer;
}
.card-description-expanded {
  -webkit-line-clamp: unset;
  display: block;
}

.card-bottom {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.card-user,
.card-time,
.card-duration {
  font-size: 11px;
  color: #A19F9D;
}
.card-user::after,
.card-time::after {
  content: '\00B7';
  margin-left: 8px;
  color: #C8C6C4;
}
.card-user:last-child::after,
.card-time:last-child::after {
  content: '';
  margin-left: 0;
}
.card-duration::before {
  content: '';
}

.card-status {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 2px;
}
.status-completed {
  color: #107C10;
  background: #DFF6DD;
}
.status-overdue {
  color: #D13438;
  background: #FDE7E9;
}
.status-cancelled {
  color: #A19F9D;
  background: #F3F2F1;
}
.status-default {
  color: #605E5C;
  background: #F3F2F1;
}

/* Compact mode */
.timeline-item-compact .timeline-card {
  padding: 8px 12px;
}
.timeline-item-compact .card-top {
  margin-bottom: 2px;
}

/* Load more */
.timeline-load-more {
  padding: 12px 0 0 24px;
  text-align: center;
}
.load-more-btn {
  padding: 6px 16px;
  font-size: 12px;
  color: #0078D4;
  background: #FFFFFF;
  border: 1px solid #0078D4;
  border-radius: 2px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.1s ease;
}
.load-more-btn:hover {
  background: #DEECF9;
}

/* Empty state */
.timeline-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}
.empty-icon {
  margin-bottom: 12px;
}
.empty-text {
  font-size: 14px;
  font-weight: 600;
  color: #605E5C;
  margin: 0 0 4px;
}
.empty-subtext {
  font-size: 12px;
  color: #A19F9D;
  margin: 0;
}
</style>
