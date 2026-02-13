<template>
  <div class="command-bar" ref="commandBar">
    <div class="command-bar-left" ref="actionsContainer">
      <!-- Primary/Left actions -->
      <template v-for="action in visibleLeftActions" :key="'la-' + action.id">
        <button
          class="d365-cmd-btn"
          :class="{ primary: action.primary }"
          :disabled="action.disabled"
          @click="$emit(action.event, action.payload)"
          :title="action.label"
        >
          <span v-if="action.icon" v-html="action.icon" class="cmd-icon"></span>
          <span class="cmd-label">{{ action.label }}</span>
        </button>
      </template>

      <span v-if="visibleLeftActions.length > 0 && (visibleExtraActions.length > 0 || visibleMenus.length > 0)" class="cmd-separator"></span>

      <!-- Extra actions -->
      <template v-for="action in visibleExtraActions" :key="'ea-' + action.id">
        <button
          class="d365-cmd-btn"
          :disabled="action.disabled"
          @click="$emit(action.event, action.payload)"
          :title="action.label"
        >
          <span v-if="action.icon" v-html="action.icon" class="cmd-icon"></span>
          <span class="cmd-label">{{ action.label }}</span>
        </button>
      </template>

      <span v-if="visibleExtraActions.length > 0 && visibleMenus.length > 0" class="cmd-separator"></span>

      <!-- Menu buttons -->
      <template v-for="menu in visibleMenus" :key="'menu-' + menu.id">
        <div class="cmd-menu-wrap" :ref="'menuTrigger-' + menu.id">
          <button
            class="d365-cmd-btn cmd-menu-btn"
            @click="toggleMenu(menu.id)"
            :title="menu.label"
          >
            <span v-if="menu.icon" v-html="menu.icon" class="cmd-icon"></span>
            <span class="cmd-label">{{ menu.label }}</span>
            <svg class="cmd-chevron" width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M2.5 3.5l2.5 3 2.5-3"/>
            </svg>
          </button>
          <div
            v-if="activeMenu === menu.id"
            class="cmd-menu-dropdown"
            :class="menuPositionClass(menu.id)"
            :ref="'menuDropdown-' + menu.id"
          >
            <template v-for="(item, itemIdx) in menu.items" :key="'item-' + menu.id + '-' + itemIdx">
              <div v-if="item.separator" class="cmd-menu-separator"></div>
              <button
                class="cmd-menu-item"
                :class="{ 'cmd-menu-item--disabled': item.disabled }"
                :disabled="item.disabled"
                @click="onMenuItemClick(item)"
              >
                <span v-if="item.icon" class="cmd-menu-item-icon" v-html="item.icon"></span>
                <span class="cmd-menu-item-label">{{ item.label }}</span>
                <span v-if="item.shortcut" class="cmd-menu-item-shortcut">{{ item.shortcut }}</span>
              </button>
            </template>
          </div>
        </div>
      </template>

      <!-- Overflow button -->
      <div v-if="overflowActions.length > 0" class="cmd-menu-wrap" ref="overflowTrigger">
        <button
          class="d365-cmd-btn cmd-overflow-btn"
          @click="toggleMenu('__overflow__')"
          title="More actions"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="3" cy="8" r="1.5"/>
            <circle cx="8" cy="8" r="1.5"/>
            <circle cx="13" cy="8" r="1.5"/>
          </svg>
        </button>
        <div
          v-if="activeMenu === '__overflow__'"
          class="cmd-menu-dropdown"
          :class="overflowMenuPositionClass"
          ref="overflowDropdown"
        >
          <template v-for="action in overflowActions" :key="'of-' + action.id">
            <button
              class="cmd-menu-item"
              :class="{ 'cmd-menu-item--disabled': action.disabled }"
              :disabled="action.disabled"
              @click="onOverflowActionClick(action)"
            >
              <span v-if="action.icon" class="cmd-menu-item-icon" v-html="action.icon"></span>
              <span class="cmd-menu-item-label">{{ action.label }}</span>
            </button>
          </template>
        </div>
      </div>
    </div>

    <div class="command-bar-right">
      <!-- View Switcher -->
      <div v-if="showViewSwitcher" class="view-switcher">
        <button
          class="d365-cmd-btn"
          :class="{ active: currentView === 'grid' }"
          @click="$emit('set-view', 'grid')"
          title="Grid View"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 2h14v2H1V2zm0 4h14v2H1V6zm0 4h14v2H1v-2zm0 4h14v2H1v-2z"/>
          </svg>
        </button>
        <button
          class="d365-cmd-btn"
          :class="{ active: currentView === 'card' }"
          @click="$emit('set-view', 'card')"
          title="Card View"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 2h6v5H1V2zm8 0h6v5H9V2zM1 9h6v5H1V9zm8 0h6v5H9V9z"/>
          </svg>
        </button>
      </div>
      <span v-if="showViewSwitcher && showFilter" class="cmd-separator"></span>
      <button
        v-if="showFilter"
        class="d365-cmd-btn"
        :class="{ active: filterActive }"
        @click="$emit('toggle-filter')"
        title="Toggle Filters"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1 2h14l-5.5 6.5V14l-3-2V8.5L1 2z"/>
        </svg>
        <span>Filter</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommandBar',
  props: {
    actions: { type: Array, default: function() { return [] } },
    menus: { type: Array, default: function() { return [] } },
    showViewSwitcher: { type: Boolean, default: true },
    showFilter: { type: Boolean, default: true },
    currentView: { type: String, default: 'grid' },
    filterActive: { type: Boolean, default: false },
    hasSelection: { type: Boolean, default: false }
  },

  data: function() {
    return {
      activeMenu: null,
      overflowStartIndex: -1,
      containerWidth: 0
    }
  },

  computed: {
    leftActions: function() {
      return this.actions.filter(function(a) { return !a.extra })
    },
    extraActions: function() {
      return this.actions.filter(function(a) { return a.extra })
    },
    allLeftItems: function() {
      // Combine left actions, extra actions, and menus for overflow calculation
      var items = []
      var self = this
      this.leftActions.forEach(function(a) { items.push({ type: 'action', data: a, estimatedWidth: 90 }) })
      this.extraActions.forEach(function(a) { items.push({ type: 'action', data: a, estimatedWidth: 90 }) })
      self.menus.forEach(function(m) { items.push({ type: 'menu', data: m, estimatedWidth: 100 }) })
      return items
    },
    maxVisibleItems: function() {
      if (this.containerWidth <= 0) return this.allLeftItems.length
      // Reserve space for right-side controls (~200px) and overflow button (~40px)
      var available = this.containerWidth - 40
      var used = 0
      var count = 0
      for (var i = 0; i < this.allLeftItems.length; i++) {
        used += this.allLeftItems[i].estimatedWidth
        if (used > available) break
        count++
      }
      return Math.max(1, count)
    },
    needsOverflow: function() {
      return this.allLeftItems.length > this.maxVisibleItems
    },
    visibleLeftActions: function() {
      if (!this.needsOverflow) return this.leftActions
      var visible = []
      var count = 0
      for (var i = 0; i < this.leftActions.length && count < this.maxVisibleItems; i++) {
        visible.push(this.leftActions[i])
        count++
      }
      return visible
    },
    visibleExtraActions: function() {
      if (!this.needsOverflow) return this.extraActions
      var remaining = this.maxVisibleItems - this.visibleLeftActions.length
      if (remaining <= 0) return []
      return this.extraActions.slice(0, remaining)
    },
    visibleMenus: function() {
      if (!this.needsOverflow) return this.menus
      var remaining = this.maxVisibleItems - this.visibleLeftActions.length - this.visibleExtraActions.length
      if (remaining <= 0) return []
      return this.menus.slice(0, remaining)
    },
    overflowActions: function() {
      if (!this.needsOverflow) return []
      var overflow = []
      // Overflow left actions
      for (var i = this.visibleLeftActions.length; i < this.leftActions.length; i++) {
        overflow.push(this.leftActions[i])
      }
      // Overflow extra actions
      for (var j = this.visibleExtraActions.length; j < this.extraActions.length; j++) {
        overflow.push(this.extraActions[j])
      }
      // Overflow menus get flattened into items
      for (var k = this.visibleMenus.length; k < this.menus.length; k++) {
        var menu = this.menus[k]
        menu.items.forEach(function(item) {
          if (!item.separator) {
            overflow.push({ id: item.id, label: item.label, icon: item.icon, event: item.event, disabled: item.disabled })
          }
        })
      }
      return overflow
    },
    overflowMenuPositionClass: function() {
      return this.computeMenuPositionClass(this.$refs.overflowTrigger, this.$refs.overflowDropdown)
    }
  },

  watch: {
    activeMenu: function(val) {
      if (val) {
        var self = this
        this.$nextTick(function() { self.positionActiveMenu() })
      }
    }
  },

  mounted: function() {
    var self = this
    this._clickOutside = function(e) {
      if (self.activeMenu && !self.$el.contains(e.target)) {
        self.activeMenu = null
      }
    }
    document.addEventListener('mousedown', this._clickOutside)

    // Set up ResizeObserver for overflow detection
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(function(entries) {
        for (var i = 0; i < entries.length; i++) {
          self.containerWidth = entries[i].contentRect.width
        }
      })
      if (this.$refs.commandBar) {
        this._resizeObserver.observe(this.$refs.commandBar)
      }
    }
    // Initial measure
    this.$nextTick(function() {
      if (self.$refs.commandBar) {
        self.containerWidth = self.$refs.commandBar.offsetWidth
      }
    })
  },

  beforeUnmount: function() {
    document.removeEventListener('mousedown', this._clickOutside)
    if (this._resizeObserver) {
      this._resizeObserver.disconnect()
    }
  },

  methods: {
    toggleMenu: function(menuId) {
      if (this.activeMenu === menuId) {
        this.activeMenu = null
      } else {
        this.activeMenu = menuId
      }
    },

    onMenuItemClick: function(item) {
      if (item.disabled) return
      this.activeMenu = null
      if (item.event) {
        this.$emit(item.event, item.payload)
      }
    },

    onOverflowActionClick: function(action) {
      if (action.disabled) return
      this.activeMenu = null
      if (action.event) {
        this.$emit(action.event, action.payload)
      }
    },

    positionDropdown: function(triggerEl, dropdownEl) {
      if (!triggerEl || !dropdownEl) return { openAbove: false, alignRight: false }
      var triggerRect = triggerEl.getBoundingClientRect()
      var dropdownHeight = dropdownEl.offsetHeight || 300
      var dropdownWidth = dropdownEl.offsetWidth || 200
      var viewportHeight = window.innerHeight
      var viewportWidth = window.innerWidth

      var spaceBelow = viewportHeight - triggerRect.bottom
      var spaceAbove = triggerRect.top
      var openAbove = spaceBelow < dropdownHeight + 8 && spaceAbove > spaceBelow

      var spaceRight = viewportWidth - triggerRect.left
      var alignRight = spaceRight < dropdownWidth

      return { openAbove: openAbove, alignRight: alignRight }
    },

    menuPositionClass: function(menuId) {
      var triggerRef = this.$refs['menuTrigger-' + menuId]
      var dropdownRef = this.$refs['menuDropdown-' + menuId]
      var trigger = Array.isArray(triggerRef) ? triggerRef[0] : triggerRef
      var dropdown = Array.isArray(dropdownRef) ? dropdownRef[0] : dropdownRef
      return this.computeMenuPositionClass(trigger, dropdown)
    },

    computeMenuPositionClass: function(trigger, dropdown) {
      if (!trigger) return ''
      var pos = this.positionDropdown(trigger, dropdown)
      var classes = []
      if (pos.openAbove) classes.push('cmd-menu-dropdown--above')
      if (pos.alignRight) classes.push('cmd-menu-dropdown--align-right')
      return classes.join(' ')
    },

    positionActiveMenu: function() {
      // Position is handled via CSS classes
    }
  }
}
</script>

<style scoped>
.command-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 16px;
  background: #FFFFFF;
  border-bottom: 1px solid #EDEBE9;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.command-bar-left,
.command-bar-right {
  display: flex;
  align-items: center;
  gap: 2px;
}

.command-bar-left {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.cmd-separator {
  display: inline-block;
  width: 1px;
  height: 24px;
  background: #EDEBE9;
  margin: 0 4px;
  flex-shrink: 0;
}

.cmd-icon {
  display: inline-flex;
  align-items: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.cmd-label {
  white-space: nowrap;
}

.d365-cmd-btn.active {
  background: #DEECF9;
  color: #0078D4;
}
.d365-cmd-btn:active {
  background-color: #EDEBE9;
}

.d365-cmd-btn.primary {
  background: #0078D4;
  color: #FFFFFF;
  font-weight: 600;
}
.d365-cmd-btn.primary:hover {
  background: #106EBE;
}
.d365-cmd-btn.primary:active {
  background: #005A9E;
}

/* Menu button */
.cmd-menu-wrap {
  position: relative;
  flex-shrink: 0;
}

.cmd-menu-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.cmd-chevron {
  opacity: 0.6;
  margin-left: 2px;
}

/* Menu dropdown */
.cmd-menu-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 2px;
  background: #FFFFFF;
  border: 1px solid #EDEBE9;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border-radius: 2px;
  min-width: 200px;
  z-index: 999;
  padding: 4px 0;
}
.cmd-menu-dropdown--above {
  top: auto;
  bottom: 100%;
  margin-top: 0;
  margin-bottom: 2px;
}
.cmd-menu-dropdown--align-right {
  left: auto;
  right: 0;
}

.cmd-menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  height: 36px;
  padding: 0 12px 0 12px;
  background: transparent;
  border: none;
  font-size: 13px;
  font-family: inherit;
  color: #323130;
  cursor: pointer;
  text-align: left;
  gap: 8px;
  transition: background 0.1s;
}
.cmd-menu-item:hover {
  background: #F3F2F1;
}
.cmd-menu-item:active {
  background: #EDEBE9;
}
.cmd-menu-item--disabled {
  color: #A19F9D;
  cursor: not-allowed;
}
.cmd-menu-item--disabled:hover {
  background: transparent;
}

.cmd-menu-item-icon {
  display: inline-flex;
  align-items: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.cmd-menu-item-label {
  flex: 1;
  white-space: nowrap;
}

.cmd-menu-item-shortcut {
  font-size: 11px;
  color: #A19F9D;
  white-space: nowrap;
  margin-left: 16px;
}

.cmd-menu-separator {
  height: 1px;
  background: #EDEBE9;
  margin: 4px 0;
}

/* Overflow button */
.cmd-overflow-btn {
  padding: 6px 8px;
}

.view-switcher {
  display: flex;
  align-items: center;
  gap: 1px;
}
</style>
