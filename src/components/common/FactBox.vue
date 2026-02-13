<template>
  <div class="factbox-wrapper" :style="wrapperStyle">
    <!-- Collapsed bar -->
    <div v-if="isCollapsed" class="factbox-collapsed-bar" @click="togglePanel" @keydown.enter="togglePanel" tabindex="0" role="button" aria-label="Expand FactBox panel">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" class="collapse-chevron">
        <path d="M3 1l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <!-- Expanded panel -->
    <div v-else class="factbox-panel" :style="{ width: width }">
      <!-- Panel header -->
      <div class="factbox-header">
        <span class="factbox-title">Related</span>
        <button class="factbox-collapse-btn" @click="togglePanel" aria-label="Collapse FactBox panel">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M7 1L3 5l4 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Scrollable content -->
      <div class="factbox-content">
        <div
          v-for="section in safeSections"
          :key="section.id"
          class="factbox-section"
        >
          <!-- Section header -->
          <div
            class="section-header"
            @click="toggleSection(section.id)"
            @keydown.enter="toggleSection(section.id)"
            tabindex="0"
            role="button"
            :aria-expanded="!isSectionCollapsed(section.id)"
          >
            <div class="section-header-left">
              <svg
                class="section-chevron"
                :class="{ 'section-chevron-collapsed': isSectionCollapsed(section.id) }"
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="currentColor"
              >
                <path d="M2 3l3 3.5L8 3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span v-if="section.icon" class="section-icon" v-html="section.icon"></span>
              <span class="section-title">{{ section.title }}</span>
            </div>
            <span v-if="section.badge != null && section.badge > 0" class="section-badge">{{ section.badge }}</span>
          </div>

          <!-- Section items -->
          <transition name="factbox-section-transition">
            <div v-if="!isSectionCollapsed(section.id)" class="section-items">
              <div
                v-for="(item, idx) in (section.items || [])"
                :key="idx"
                class="section-item"
                :class="{ 'section-item-clickable': item.link || item.type === 'link' }"
                @click="handleItemClick(item)"
                @keydown.enter="handleItemClick(item)"
                :tabindex="item.link || item.type === 'link' ? 0 : -1"
              >
                <span class="item-label">{{ item.label }}</span>
                <span class="item-value" :class="'item-value-' + (item.type || 'text')">
                  <template v-if="item.type === 'currency'">{{ formatCurrency(item.value) }}</template>
                  <template v-else-if="item.type === 'date'">{{ formatDate(item.value) }}</template>
                  <template v-else-if="item.type === 'badge'">
                    <span class="item-badge" :class="getBadgeClass(item.value)">{{ item.value }}</span>
                  </template>
                  <template v-else-if="item.type === 'link'">
                    <span class="item-link-text">{{ item.value }}</span>
                  </template>
                  <template v-else>{{ item.value != null ? item.value : '-' }}</template>
                </span>
              </div>
              <div v-if="!section.items || section.items.length === 0" class="section-empty">
                No data available
              </div>
            </div>
          </transition>
        </div>

        <!-- Empty state -->
        <div v-if="!safeSections.length" class="factbox-empty">
          No related information available.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FactBox',

  props: {
    sections: {
      type: Array,
      default: function () { return [] }
    },
    collapsed: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: '280px'
    }
  },

  data: function () {
    return {
      isCollapsed: this.collapsed,
      collapsedSections: {}
    }
  },

  computed: {
    safeSections: function () {
      if (!Array.isArray(this.sections)) return []
      return this.sections
    },
    wrapperStyle: function () {
      return {
        width: this.isCollapsed ? '32px' : this.width
      }
    }
  },

  watch: {
    collapsed: function (val) {
      this.isCollapsed = val
    },
    sections: {
      immediate: true,
      handler: function (sections) {
        if (!Array.isArray(sections)) return
        var self = this
        sections.forEach(function (section) {
          if (section.collapsed && !(section.id in self.collapsedSections)) {
            self.collapsedSections[section.id] = true
          }
        })
      }
    }
  },

  methods: {
    togglePanel: function () {
      this.isCollapsed = !this.isCollapsed
      this.$emit('toggle', this.isCollapsed)
    },

    toggleSection: function (sectionId) {
      var current = this.collapsedSections[sectionId] || false
      this.collapsedSections[sectionId] = !current
      this.$emit('section-toggle', sectionId, !current)
    },

    isSectionCollapsed: function (sectionId) {
      return !!this.collapsedSections[sectionId]
    },

    handleItemClick: function (item) {
      if (item.link || item.type === 'link') {
        this.$emit('item-click', item)
        if (item.link && this.$router) {
          this.$router.push(item.link)
        }
      }
    },

    formatCurrency: function (value) {
      if (value == null || value === '') return '-'
      var num = parseFloat(value)
      if (isNaN(num)) return String(value)
      return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    },

    formatDate: function (value) {
      if (!value) return '-'
      var date = new Date(value)
      if (isNaN(date.getTime())) return String(value)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },

    getBadgeClass: function (value) {
      if (!value) return 'badge-draft'
      var s = String(value).toLowerCase().replace(/\s+/g, '-')
      var map = {
        'open': 'badge-open',
        'won': 'badge-won',
        'lost': 'badge-lost',
        'draft': 'badge-draft',
        'active': 'badge-open',
        'completed': 'badge-completed',
        'high': 'badge-overdue',
        'medium': 'badge-sent',
        'low': 'badge-draft'
      }
      return map[s] || 'badge-draft'
    }
  }
}
</script>

<style scoped>
.factbox-wrapper {
  position: relative;
  flex-shrink: 0;
  transition: width 0.2s ease;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  height: 100%;
}

/* Collapsed bar */
.factbox-collapsed-bar {
  width: 32px;
  height: 100%;
  background: #FAFAFA;
  border-left: 1px solid #EDEBE9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.1s ease;
}
.factbox-collapsed-bar:hover {
  background: #F3F2F1;
}
.factbox-collapsed-bar:focus {
  outline: 2px solid #0078D4;
  outline-offset: -2px;
}
.collapse-chevron {
  color: #605E5C;
}

/* Expanded panel */
.factbox-panel {
  height: 100%;
  background: #FAFAFA;
  border-left: 1px solid #EDEBE9;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Panel header */
.factbox-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 10px;
  border-bottom: 1px solid #EDEBE9;
  flex-shrink: 0;
}
.factbox-title {
  font-size: 14px;
  font-weight: 600;
  color: #323130;
}
.factbox-collapse-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  color: #605E5C;
  transition: background-color 0.1s ease;
}
.factbox-collapse-btn:hover {
  background: #EDEBE9;
}
.factbox-collapse-btn:focus {
  outline: 2px solid #0078D4;
  outline-offset: -2px;
}

/* Scrollable content */
.factbox-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Section */
.factbox-section {
  border-bottom: 1px solid #EDEBE9;
}
.factbox-section:last-child {
  border-bottom: none;
}

/* Section header */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.1s ease;
}
.section-header:hover {
  background: #F3F2F1;
}
.section-header:focus {
  outline: 2px solid #0078D4;
  outline-offset: -2px;
}
.section-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.section-chevron {
  flex-shrink: 0;
  color: #605E5C;
  transition: transform 0.15s ease;
}
.section-chevron-collapsed {
  transform: rotate(-90deg);
}
.section-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  color: #605E5C;
}
.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #323130;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.section-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 600;
  color: #FFFFFF;
  background: #0078D4;
  border-radius: 9px;
}

/* Section items */
.section-items {
  padding: 0 12px 8px;
}
.section-item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 4px 0;
  gap: 8px;
}
.section-item-clickable {
  cursor: pointer;
  border-radius: 2px;
}
.section-item-clickable:hover .item-link-text,
.section-item-clickable:hover .item-value-link {
  text-decoration: underline;
}
.section-item-clickable:focus {
  outline: 2px solid #0078D4;
  outline-offset: 1px;
}

.item-label {
  font-size: 12px;
  color: #605E5C;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
  min-width: 0;
}
.item-value {
  font-size: 12px;
  color: #323130;
  white-space: nowrap;
  text-align: right;
  flex-shrink: 0;
}
.item-value-currency {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.item-value-link .item-link-text,
.item-value-link {
  color: #0078D4;
  cursor: pointer;
}

/* Badge within item */
.item-badge {
  display: inline-block;
  padding: 1px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 2px;
  white-space: nowrap;
}

/* Empty states */
.section-empty {
  font-size: 12px;
  color: #A19F9D;
  padding: 4px 0;
  font-style: italic;
}
.factbox-empty {
  padding: 24px 12px;
  font-size: 12px;
  color: #A19F9D;
  text-align: center;
}

/* Transition */
.factbox-section-transition-enter-active,
.factbox-section-transition-leave-active {
  transition: max-height 0.15s ease, opacity 0.15s ease;
  overflow: hidden;
}
.factbox-section-transition-enter-from,
.factbox-section-transition-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
