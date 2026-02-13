<template>
  <div
    class="smart-dropdown"
    :class="{ 'smart-dropdown--disabled': disabled }"
    ref="container"
  >
    <!-- Trigger -->
    <div
      ref="trigger"
      class="smart-dropdown__trigger"
      @click="handleTriggerClick"
      @mouseenter="handleTriggerHover(true)"
      @mouseleave="handleTriggerHover(false)"
      @keydown.enter.prevent="handleTriggerClick"
      @keydown.space.prevent="handleTriggerClick"
      @keydown.down.prevent="handleTriggerClick"
      :tabindex="disabled ? -1 : 0"
      :aria-expanded="String(isOpen)"
      aria-haspopup="listbox"
    >
      <slot name="trigger">
        <button class="smart-dropdown__default-trigger" :disabled="disabled">
          Dropdown
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" class="smart-dropdown__chevron" :class="{ 'smart-dropdown__chevron--up': isOpen && openDirection === 'above' }">
            <path d="M2 3.5l3 3 3-3"/>
          </svg>
        </button>
      </slot>
    </div>

    <!-- Dropdown Menu -->
    <transition name="smart-dropdown-anim">
      <div
        v-if="isOpen"
        ref="menu"
        class="smart-dropdown__menu"
        :class="[
          'smart-dropdown__menu--' + openDirection,
          'smart-dropdown__menu--align-' + computedAlign
        ]"
        :style="menuStyle"
        role="listbox"
        @mouseenter="handleMenuHover(true)"
        @mouseleave="handleMenuHover(false)"
      >
        <!-- Header Slot -->
        <div v-if="$slots.header" class="smart-dropdown__header">
          <slot name="header"></slot>
        </div>

        <!-- Search Filter -->
        <div v-if="showSearch" class="smart-dropdown__search">
          <input
            ref="searchInput"
            v-model="searchQuery"
            class="smart-dropdown__search-input"
            type="text"
            placeholder="Search..."
            @keydown.down.prevent="navigateDown"
            @keydown.up.prevent="navigateUp"
            @keydown.enter.prevent="selectFocused"
            @keydown.escape.prevent="close"
          />
        </div>

        <!-- Items -->
        <div class="smart-dropdown__items" ref="itemsList">
          <template v-for="(item, idx) in filteredItems">
            <!-- Group Header -->
            <div
              v-if="item._isGroupHeader"
              :key="'group-' + idx"
              class="smart-dropdown__group-header"
            >{{ item.label }}</div>

            <!-- Separator -->
            <div
              v-else-if="item.separator"
              :key="'sep-' + idx"
              class="smart-dropdown__separator"
            ></div>

            <!-- Normal Item -->
            <div
              v-else
              :key="item.id || idx"
              class="smart-dropdown__item"
              :class="{
                'smart-dropdown__item--disabled': item.disabled,
                'smart-dropdown__item--focused': focusedIndex === getSelectableIndex(item)
              }"
              role="option"
              :aria-selected="focusedIndex === getSelectableIndex(item) ? 'true' : 'false'"
              :aria-disabled="item.disabled ? 'true' : 'false'"
              @click.stop="selectItem(item)"
              @mouseenter="focusedIndex = getSelectableIndex(item)"
            >
              <slot name="item" :item="item">
                <span v-if="item.icon" class="smart-dropdown__item-icon" v-html="item.icon"></span>
                <span class="smart-dropdown__item-label">{{ item.label }}</span>
              </slot>
            </div>
          </template>

          <!-- No results -->
          <div v-if="filteredItems.length === 0 && searchQuery" class="smart-dropdown__no-results">
            No items found
          </div>
        </div>

        <!-- Footer Slot -->
        <div v-if="$slots.footer" class="smart-dropdown__footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'SmartDropdown',

  props: {
    items: {
      type: Array,
      default: function () { return [] }
    },
    trigger: {
      type: String,
      default: 'click',
      validator: function (v) { return ['click', 'hover'].indexOf(v) !== -1 }
    },
    align: {
      type: String,
      default: 'auto',
      validator: function (v) { return ['left', 'right', 'auto'].indexOf(v) !== -1 }
    },
    maxHeight: {
      type: Number,
      default: 300
    },
    width: {
      type: String,
      default: 'auto'
    },
    minWidth: {
      type: String,
      default: '180px'
    },
    closeOnSelect: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  data: function () {
    return {
      isOpen: false,
      openDirection: 'below',
      computedAlign: this.align === 'auto' ? 'left' : this.align,
      focusedIndex: -1,
      searchQuery: '',
      hoverTimer: null,
      menuHovered: false
    }
  },

  computed: {
    showSearch: function () {
      // Show search if more than 10 non-separator, non-group-header items
      var count = 0
      for (var i = 0; i < this.items.length; i++) {
        if (!this.items[i].separator && !this.items[i]._isGroupHeader) count++
      }
      return count > 10
    },

    processedItems: function () {
      // Insert group headers above items with a new group
      var result = []
      var lastGroup = null
      for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i]
        if (item.group && item.group !== lastGroup && !item.separator) {
          result.push({ _isGroupHeader: true, label: item.group })
          lastGroup = item.group
        }
        result.push(item)
      }
      return result
    },

    filteredItems: function () {
      if (!this.searchQuery) return this.processedItems
      var q = this.searchQuery.toLowerCase()
      var filtered = []
      for (var i = 0; i < this.processedItems.length; i++) {
        var item = this.processedItems[i]
        if (item._isGroupHeader || item.separator) continue
        if (item.label && item.label.toLowerCase().indexOf(q) !== -1) {
          filtered.push(item)
        }
      }
      return filtered
    },

    selectableItems: function () {
      var result = []
      for (var i = 0; i < this.filteredItems.length; i++) {
        var item = this.filteredItems[i]
        if (!item._isGroupHeader && !item.separator && !item.disabled) {
          result.push(item)
        }
      }
      return result
    },

    menuStyle: function () {
      var style = {
        maxHeight: this.maxHeight + 'px',
        minWidth: this.minWidth
      }
      if (this.width !== 'auto') {
        style.width = this.width
      }
      return style
    }
  },

  watch: {
    isOpen: function (val) {
      if (val) {
        this.$emit('open')
        this.focusedIndex = -1
        this.searchQuery = ''
        this.$nextTick(this.positionMenu)
        this.addGlobalListeners()
        if (this.showSearch) {
          var self = this
          this.$nextTick(function () {
            if (self.$refs.searchInput) {
              self.$refs.searchInput.focus()
            }
          })
        }
      } else {
        this.$emit('close')
        this.removeGlobalListeners()
      }
    }
  },

  methods: {
    handleTriggerClick: function () {
      if (this.disabled) return
      if (this.trigger === 'click') {
        this.toggle()
      }
    },

    handleTriggerHover: function (entering) {
      if (this.disabled || this.trigger !== 'hover') return
      var self = this
      if (entering) {
        if (this.hoverTimer) clearTimeout(this.hoverTimer)
        this.open()
      } else {
        this.hoverTimer = setTimeout(function () {
          if (!self.menuHovered) {
            self.close()
          }
        }, 150)
      }
    },

    handleMenuHover: function (entering) {
      this.menuHovered = entering
      if (!entering && this.trigger === 'hover') {
        var self = this
        this.hoverTimer = setTimeout(function () {
          self.close()
        }, 150)
      }
    },

    toggle: function () {
      if (this.isOpen) {
        this.close()
      } else {
        this.open()
      }
    },

    open: function () {
      if (this.disabled) return
      this.isOpen = true
    },

    close: function () {
      this.isOpen = false
    },

    positionMenu: function () {
      var triggerEl = this.$refs.trigger
      var menuEl = this.$refs.menu
      if (!triggerEl || !menuEl) return

      var triggerRect = triggerEl.getBoundingClientRect()
      var menuRect = menuEl.getBoundingClientRect()
      var viewportH = window.innerHeight
      var viewportW = window.innerWidth
      var gap = 4

      // Vertical direction
      var spaceBelow = viewportH - triggerRect.bottom - gap
      var spaceAbove = triggerRect.top - gap
      var menuH = menuRect.height || this.maxHeight

      if (spaceBelow < menuH + 8 && spaceAbove > spaceBelow) {
        this.openDirection = 'above'
      } else {
        this.openDirection = 'below'
      }

      // Horizontal alignment
      if (this.align === 'auto') {
        var spaceRight = viewportW - triggerRect.left
        var menuW = menuRect.width || 180
        if (spaceRight < menuW + gap) {
          this.computedAlign = 'right'
        } else {
          this.computedAlign = 'left'
        }
      } else {
        this.computedAlign = this.align
      }
    },

    selectItem: function (item) {
      if (item.disabled) return
      this.$emit('select', item)
      if (this.closeOnSelect) {
        this.close()
      }
    },

    getSelectableIndex: function (item) {
      for (var i = 0; i < this.selectableItems.length; i++) {
        if (this.selectableItems[i] === item) return i
      }
      return -1
    },

    navigateDown: function () {
      if (this.selectableItems.length === 0) return
      this.focusedIndex++
      if (this.focusedIndex >= this.selectableItems.length) {
        this.focusedIndex = 0
      }
      this.scrollToFocused()
    },

    navigateUp: function () {
      if (this.selectableItems.length === 0) return
      this.focusedIndex--
      if (this.focusedIndex < 0) {
        this.focusedIndex = this.selectableItems.length - 1
      }
      this.scrollToFocused()
    },

    selectFocused: function () {
      if (this.focusedIndex >= 0 && this.focusedIndex < this.selectableItems.length) {
        this.selectItem(this.selectableItems[this.focusedIndex])
      }
    },

    scrollToFocused: function () {
      var self = this
      this.$nextTick(function () {
        var listEl = self.$refs.itemsList
        if (!listEl) return
        var focusedEl = listEl.querySelector('.smart-dropdown__item--focused')
        if (focusedEl) {
          focusedEl.scrollIntoView({ block: 'nearest' })
        }
      })
    },

    handleKeydown: function (e) {
      if (!this.isOpen) return
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          this.close()
          break
        case 'ArrowDown':
          e.preventDefault()
          this.navigateDown()
          break
        case 'ArrowUp':
          e.preventDefault()
          this.navigateUp()
          break
        case 'Enter':
          e.preventDefault()
          this.selectFocused()
          break
      }
    },

    handleClickOutside: function (e) {
      if (!this.$refs.container) return
      if (!this.$refs.container.contains(e.target)) {
        this.close()
      }
    },

    handleScroll: function () {
      // Reposition or close on scroll
      if (this.isOpen) {
        this.positionMenu()
      }
    },

    addGlobalListeners: function () {
      document.addEventListener('keydown', this.handleKeydown)
      document.addEventListener('mousedown', this.handleClickOutside)
      window.addEventListener('scroll', this.handleScroll, true)
      window.addEventListener('resize', this.handleScroll)
    },

    removeGlobalListeners: function () {
      document.removeEventListener('keydown', this.handleKeydown)
      document.removeEventListener('mousedown', this.handleClickOutside)
      window.removeEventListener('scroll', this.handleScroll, true)
      window.removeEventListener('resize', this.handleScroll)
    }
  },

  beforeUnmount: function () {
    this.removeGlobalListeners()
    if (this.hoverTimer) clearTimeout(this.hoverTimer)
  }
}
</script>

<style scoped>
.smart-dropdown {
  position: relative;
  display: inline-block;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
}

.smart-dropdown--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.smart-dropdown__trigger {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.smart-dropdown__default-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #C8C6C4;
  border-radius: 2px;
  background: white;
  color: #323130;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
}
.smart-dropdown__default-trigger:hover {
  background: #F3F2F1;
}
.smart-dropdown__default-trigger:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.smart-dropdown__chevron {
  transition: transform 0.2s;
}
.smart-dropdown__chevron--up {
  transform: rotate(180deg);
}

/* Menu */
.smart-dropdown__menu {
  position: absolute;
  z-index: 9999;
  background: white;
  border: 1px solid #EDEBE9;
  border-radius: 2px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 13px;
}

.smart-dropdown__menu--below {
  top: 100%;
  margin-top: 4px;
}
.smart-dropdown__menu--above {
  bottom: 100%;
  margin-bottom: 4px;
}

.smart-dropdown__menu--align-left {
  left: 0;
}
.smart-dropdown__menu--align-right {
  right: 0;
}

/* Search */
.smart-dropdown__search {
  padding: 8px 8px 4px;
  border-bottom: 1px solid #EDEBE9;
}
.smart-dropdown__search-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #C8C6C4;
  border-radius: 2px;
  font-size: 12px;
  font-family: inherit;
  color: #323130;
  outline: none;
  box-sizing: border-box;
}
.smart-dropdown__search-input:focus {
  border-color: #0078D4;
}

/* Items container */
.smart-dropdown__items {
  padding: 4px 0;
}

/* Group Header */
.smart-dropdown__group-header {
  font-size: 11px;
  font-weight: 600;
  color: #605E5C;
  text-transform: uppercase;
  padding: 8px 12px 4px;
  user-select: none;
}

/* Separator */
.smart-dropdown__separator {
  height: 0;
  border-top: 1px solid #EDEBE9;
  margin: 4px 0;
}

/* Item */
.smart-dropdown__item {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  cursor: pointer;
  color: #323130;
  user-select: none;
  white-space: nowrap;
  transition: background-color 0.08s;
}
.smart-dropdown__item:hover,
.smart-dropdown__item--focused {
  background: #F3F2F1;
}
.smart-dropdown__item--focused {
  background: #DEECF9;
  color: #0078D4;
}
.smart-dropdown__item--disabled {
  color: #A19F9D;
  cursor: not-allowed;
}
.smart-dropdown__item--disabled:hover {
  background: transparent;
}

.smart-dropdown__item-icon {
  margin-right: 8px;
  display: inline-flex;
  align-items: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.smart-dropdown__item-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* No results */
.smart-dropdown__no-results {
  padding: 12px;
  text-align: center;
  color: #A19F9D;
  font-size: 12px;
}

/* Header / Footer slots */
.smart-dropdown__header {
  padding: 8px 12px;
  border-bottom: 1px solid #EDEBE9;
}
.smart-dropdown__footer {
  padding: 8px 12px;
  border-top: 1px solid #EDEBE9;
}

/* Transition */
.smart-dropdown-anim-enter-active,
.smart-dropdown-anim-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.smart-dropdown-anim-enter-from,
.smart-dropdown-anim-leave-to {
  opacity: 0;
}

.smart-dropdown__menu--below.smart-dropdown-anim-enter-from,
.smart-dropdown__menu--below.smart-dropdown-anim-leave-to {
  transform: translateY(-4px);
}
.smart-dropdown__menu--above.smart-dropdown-anim-enter-from,
.smart-dropdown__menu--above.smart-dropdown-anim-leave-to {
  transform: translateY(4px);
}
</style>
