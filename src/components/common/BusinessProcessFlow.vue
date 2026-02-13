<template>
  <div
    class="bpf-bar"
    :class="{
      'bpf-won': entityStatus === 'Won',
      'bpf-lost': entityStatus === 'Lost'
    }"
    role="navigation"
    aria-label="Business process flow"
  >
    <div class="bpf-stages">
      <div
        v-for="(stage, index) in safeStages"
        :key="stage.id"
        class="bpf-stage"
        :class="getStageClasses(stage, index)"
        @click="handleStageClick(stage)"
        @keydown.enter="handleStageClick(stage)"
        tabindex="0"
        :aria-label="stage.name + ' - ' + getStageStatus(stage)"
        :title="stage.name"
      >
        <!-- Left notch (not for first) -->
        <div v-if="index > 0" class="bpf-notch-left">
          <svg width="16" height="56" viewBox="0 0 16 56" preserveAspectRatio="none">
            <path d="M16 0 L0 28 L16 56" :fill="getStageBackground(stage, index)" :stroke="getStageBorder(stage, index)" stroke-width="1"/>
          </svg>
        </div>

        <!-- Stage content -->
        <div class="bpf-stage-content">
          <span v-if="isStageCompleted(stage)" class="bpf-stage-icon">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M4.5 9L1.5 6l.7-.7L4.5 7.6 9.8 2.3l.7.7L4.5 9z"/>
            </svg>
          </span>
          <span v-else-if="isStageActive(stage)" class="bpf-stage-icon bpf-stage-icon-active">
            <span class="bpf-active-dot"></span>
          </span>
          <span class="bpf-stage-name">{{ stage.name }}</span>
          <span v-if="stage.required" class="bpf-required" title="Required">*</span>
        </div>

        <!-- Right arrow point (not for last) -->
        <div v-if="index < safeStages.length - 1" class="bpf-arrow-right">
          <svg width="16" height="56" viewBox="0 0 16 56" preserveAspectRatio="none">
            <path d="M0 0 L16 28 L0 56" :fill="getStageBackground(stage, index)" :stroke="getStageBorder(stage, index)" stroke-width="1"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Lost indicator -->
    <div v-if="entityStatus === 'Lost'" class="bpf-lost-indicator">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="#D13438">
        <path d="M3.5 3.5l5 5M8.5 3.5l-5 5" stroke="#D13438" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      </svg>
      <span>Lost</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BusinessProcessFlow',

  props: {
    stages: {
      type: Array,
      default: function () { return [] }
    },
    currentStage: {
      type: String,
      default: ''
    },
    completedStages: {
      type: Array,
      default: function () { return [] }
    },
    entityStatus: {
      type: String,
      default: 'Open'
    }
  },

  computed: {
    safeStages: function () {
      return Array.isArray(this.stages) ? this.stages : []
    },

    safeCompleted: function () {
      return Array.isArray(this.completedStages) ? this.completedStages : []
    },

    currentStageIndex: function () {
      var self = this
      var idx = -1
      this.safeStages.forEach(function (stage, i) {
        if (stage.id === self.currentStage) idx = i
      })
      return idx
    }
  },

  methods: {
    isStageCompleted: function (stage) {
      if (this.entityStatus === 'Won') return true
      return this.safeCompleted.indexOf(stage.id) !== -1
    },

    isStageActive: function (stage) {
      if (this.entityStatus === 'Won' || this.entityStatus === 'Lost') return false
      return stage.id === this.currentStage
    },

    isStageFuture: function (stage) {
      if (this.entityStatus === 'Won') return false
      if (this.entityStatus === 'Lost') return true
      return !this.isStageCompleted(stage) && !this.isStageActive(stage)
    },

    getStageStatus: function (stage) {
      if (this.isStageCompleted(stage)) return 'Completed'
      if (this.isStageActive(stage)) return 'Active'
      return 'Future'
    },

    getStageClasses: function (stage, index) {
      return {
        'bpf-stage-completed': this.isStageCompleted(stage),
        'bpf-stage-active': this.isStageActive(stage),
        'bpf-stage-future': this.isStageFuture(stage),
        'bpf-stage-first': index === 0,
        'bpf-stage-last': index === this.safeStages.length - 1,
        'bpf-stage-won': this.entityStatus === 'Won',
        'bpf-stage-lost': this.entityStatus === 'Lost'
      }
    },

    getStageBackground: function (stage) {
      if (this.entityStatus === 'Won') return '#107C10'
      if (this.entityStatus === 'Lost') return '#F3F2F1'
      if (this.isStageCompleted(stage)) return '#107C10'
      if (this.isStageActive(stage)) return '#0078D4'
      return '#F3F2F1'
    },

    getStageBorder: function (stage) {
      if (this.entityStatus === 'Won') return '#0E6A0E'
      if (this.entityStatus === 'Lost') return '#EDEBE9'
      if (this.isStageCompleted(stage)) return '#0E6A0E'
      if (this.isStageActive(stage)) return '#106EBE'
      return '#EDEBE9'
    },

    handleStageClick: function (stage) {
      if (this.isStageCompleted(stage) || this.isStageActive(stage)) {
        this.$emit('stage-click', stage.id)
      }
      if (this.isStageActive(stage)) {
        this.$emit('set-active', stage.id)
      }
    }
  }
}
</script>

<style scoped>
.bpf-bar {
  width: 100%;
  background: #FFFFFF;
  border-bottom: 1px solid #EDEBE9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 0 16px;
  display: flex;
  align-items: center;
  height: 56px;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
}

/* Stages container */
.bpf-stages {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  height: 40px;
}

/* Individual stage */
.bpf-stage {
  display: flex;
  align-items: center;
  position: relative;
  height: 40px;
  flex: 1;
  min-width: 0;
  cursor: pointer;
  outline: none;
  transition: filter 0.15s ease;
}
.bpf-stage:focus-visible {
  z-index: 2;
  filter: brightness(1.1);
}
.bpf-stage:hover {
  filter: brightness(0.95);
}
.bpf-stage-future {
  cursor: default;
}
.bpf-stage-future:hover {
  filter: none;
}

/* Stage content (the visible rectangle part) */
.bpf-stage-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex: 1;
  height: 100%;
  padding: 0 8px;
  z-index: 1;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
}

/* Completed stage */
.bpf-stage-completed .bpf-stage-content {
  background: #107C10;
  color: #FFFFFF;
}
.bpf-stage-completed.bpf-stage-first .bpf-stage-content {
  border-radius: 4px 0 0 4px;
}
.bpf-stage-completed.bpf-stage-last .bpf-stage-content {
  border-radius: 0 4px 4px 0;
}

/* Active stage */
.bpf-stage-active .bpf-stage-content {
  background: #0078D4;
  color: #FFFFFF;
}

/* Future stage */
.bpf-stage-future .bpf-stage-content {
  background: #F3F2F1;
  color: #605E5C;
}

/* Won override */
.bpf-stage-won .bpf-stage-content {
  background: #107C10;
  color: #FFFFFF;
}

/* Lost override */
.bpf-stage-lost .bpf-stage-content {
  background: #F3F2F1;
  color: #A19F9D;
}

/* First and last stage rounded corners */
.bpf-stage-first .bpf-stage-content {
  border-radius: 4px 0 0 4px;
}
.bpf-stage-last .bpf-stage-content {
  border-radius: 0 4px 4px 0;
}
.bpf-stage-first.bpf-stage-last .bpf-stage-content {
  border-radius: 4px;
}

/* Notch and arrow SVGs */
.bpf-notch-left,
.bpf-arrow-right {
  position: absolute;
  top: 0;
  height: 100%;
  width: 16px;
  z-index: 2;
  line-height: 0;
}
.bpf-notch-left {
  left: 0;
}
.bpf-arrow-right {
  right: -16px;
}
.bpf-notch-left svg,
.bpf-arrow-right svg {
  display: block;
  width: 16px;
  height: 100%;
}

/* Stage icons */
.bpf-stage-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.bpf-stage-icon-active {
  position: relative;
}
.bpf-active-dot {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #FFFFFF;
  animation: bpf-pulse 2s ease-in-out infinite;
}

@keyframes bpf-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.3); }
}

/* Stage name */
.bpf-stage-name {
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Required indicator */
.bpf-required {
  color: inherit;
  font-size: 14px;
  font-weight: 700;
  opacity: 0.7;
}

/* Lost indicator */
.bpf-lost-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 12px;
  padding: 4px 10px;
  background: #FDE7E9;
  border-radius: 2px;
  flex-shrink: 0;
}
.bpf-lost-indicator span {
  font-size: 12px;
  font-weight: 600;
  color: #D13438;
}

/* Responsive: horizontal scroll on small screens */
@media (max-width: 640px) {
  .bpf-stages {
    min-width: max-content;
  }
  .bpf-stage {
    min-width: 80px;
  }
  .bpf-stage-name {
    font-size: 11px;
  }
}
</style>
