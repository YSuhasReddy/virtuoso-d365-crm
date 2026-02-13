<template>
  <div class="record-navigation" role="navigation" aria-label="Record navigation">
    <!-- First button -->
    <button
      v-if="showFirstLast"
      class="nav-btn"
      :class="{ 'nav-btn-disabled': isFirst }"
      :disabled="isFirst"
      @click="navigate('first')"
      :aria-label="'Go to first ' + entityLabel"
      :title="'First ' + entityLabel"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
        <path d="M2 2v6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M4 5l3-3v6L4 5z"/>
      </svg>
    </button>

    <!-- Previous button -->
    <button
      class="nav-btn"
      :class="{ 'nav-btn-disabled': isFirst }"
      :disabled="isFirst"
      @click="navigate('prev')"
      :aria-label="'Go to previous ' + entityLabel"
      :title="'Previous ' + entityLabel"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
        <path d="M6 2L3 5l3 3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Counter text -->
    <span class="nav-counter">
      {{ displayIndex }} of {{ safeTotal }} {{ entityLabel }}
    </span>

    <!-- Next button -->
    <button
      class="nav-btn"
      :class="{ 'nav-btn-disabled': isLast }"
      :disabled="isLast"
      @click="navigate('next')"
      :aria-label="'Go to next ' + entityLabel"
      :title="'Next ' + entityLabel"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
        <path d="M4 2l3 3-3 3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Last button -->
    <button
      v-if="showFirstLast"
      class="nav-btn"
      :class="{ 'nav-btn-disabled': isLast }"
      :disabled="isLast"
      @click="navigate('last')"
      :aria-label="'Go to last ' + entityLabel"
      :title="'Last ' + entityLabel"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
        <path d="M3 2l3 3-3 3" fill="currentColor"/>
        <path d="M8 2v6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<script>
export default {
  name: 'RecordNavigation',

  props: {
    currentIndex: {
      type: Number,
      default: 0
    },
    totalCount: {
      type: Number,
      default: 0
    },
    entityName: {
      type: String,
      default: 'Record'
    },
    showFirstLast: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    safeIndex: function () {
      if (this.totalCount <= 0) return 0
      return Math.max(0, Math.min(this.currentIndex, this.totalCount - 1))
    },

    safeTotal: function () {
      return Math.max(0, this.totalCount)
    },

    displayIndex: function () {
      if (this.safeTotal === 0) return 0
      return this.safeIndex + 1
    },

    isFirst: function () {
      return this.safeTotal === 0 || this.safeIndex === 0
    },

    isLast: function () {
      return this.safeTotal === 0 || this.safeIndex >= this.safeTotal - 1
    },

    entityLabel: function () {
      if (!this.entityName) return 'Records'
      // Pluralize simply: add 's' if not already ending in 's'
      var name = this.entityName
      if (this.safeTotal !== 1) {
        if (name.charAt(name.length - 1).toLowerCase() !== 's') {
          name = name + 's'
        }
      }
      return name
    }
  },

  methods: {
    navigate: function (direction) {
      if (direction === 'first' && this.isFirst) return
      if (direction === 'prev' && this.isFirst) return
      if (direction === 'next' && this.isLast) return
      if (direction === 'last' && this.isLast) return
      this.$emit('navigate', direction)
    }
  }
}
</script>

<style scoped>
.record-navigation {
  display: flex;
  align-items: center;
  gap: 2px;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.nav-btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #FFFFFF;
  border: 1px solid #C8C6C4;
  border-radius: 2px;
  cursor: pointer;
  color: #323130;
  padding: 0;
  transition: background-color 0.1s ease;
  font-family: inherit;
}
.nav-btn:hover:not(:disabled) {
  background: #F3F2F1;
}
.nav-btn:active:not(:disabled) {
  background: #EDEBE9;
}
.nav-btn:focus {
  outline: 2px solid #0078D4;
  outline-offset: -1px;
}

.nav-btn-disabled,
.nav-btn:disabled {
  color: #C8C6C4;
  cursor: not-allowed;
  background: #FFFFFF;
}
.nav-btn:disabled:hover {
  background: #FFFFFF;
}

.nav-counter {
  font-size: 13px;
  color: #605E5C;
  padding: 0 8px;
  white-space: nowrap;
  user-select: none;
}
</style>
