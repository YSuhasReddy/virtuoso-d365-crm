<template>
  <transition name="preview-fade">
    <div v-if="show" class="preview-backdrop" @click.self="$emit('close')">
      <div class="preview-container">
        <!-- Toolbar -->
        <div class="preview-toolbar">
          <h3 class="preview-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="margin-right:6px;vertical-align:-2px;opacity:0.7;">
              <path d="M3 1h10a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1zm1 3v1h8V4H4zm0 2.5v1h8v-1H4zm0 2.5v1h5V9H4z"/>
            </svg>
            Print Preview — {{ document ? document.number : '' }}
          </h3>
          <div class="preview-actions">
            <button class="d365-cmd-btn primary" @click="handlePrint">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 1v3H1v8h3v3h8v-3h3V4h-3V1H4zm1 1h6v2H5V2zm7 4v5h-1v-2H5v2H4V6h8zm-7 4h4v3H5v-3z"/>
              </svg>
              <span>Print / Save as PDF</span>
            </button>
            <button class="d365-cmd-btn" @click="handleDownload">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1v9M8 10l-3-3M8 10l3-3M2 12v2h12v-2" stroke="currentColor" stroke-width="1.5" fill="none"/>
              </svg>
              <span>Download</span>
            </button>
            <button class="preview-close-btn" @click="$emit('close')" title="Close preview">
              <svg width="16" height="16" viewBox="0 0 14 14" fill="currentColor">
                <path d="M3.5 2.086L7 5.586l3.5-3.5L11.914 3.5 8.414 7l3.5 3.5-1.414 1.414L7 8.414l-3.5 3.5L2.086 10.5l3.5-3.5-3.5-3.5L3.5 2.086z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Paper Preview Area -->
        <div class="preview-content">
          <div class="preview-paper" v-html="previewHTML"></div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { generateDocumentPDF, getDocumentPreviewHTML } from '@/utils/pdfGenerator'

export default {
  name: 'DocumentPreview',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    document: {
      type: Object,
      default: function () { return null }
    }
  },
  computed: {
    previewHTML: function () {
      if (!this.document) return ''
      return getDocumentPreviewHTML(this.document)
    }
  },
  watch: {
    show: function (val) {
      if (val) {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  methods: {
    handlePrint: function () {
      if (!this.document) return
      generateDocumentPDF(this.document)
      this.$emit('print')
    },
    handleDownload: function () {
      // Download uses the same print-to-PDF workflow; user can choose "Save as PDF"
      if (!this.document) return
      generateDocumentPDF(this.document)
      this.$emit('print')
    },
    handleKeydown: function (e) {
      if (e.key === 'Escape' && this.show) {
        this.$emit('close')
      }
    }
  },
  mounted: function () {
    window.addEventListener('keydown', this.handleKeydown)
  },
  beforeDestroy: function () {
    window.removeEventListener('keydown', this.handleKeydown)
    document.body.style.overflow = ''
  }
}
</script>

<style scoped>
/* Transition */
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.2s ease;
}
.preview-fade-enter,
.preview-fade-leave-to {
  opacity: 0;
}

/* Backdrop */
.preview-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 3000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Container */
.preview-container {
  display: flex;
  flex-direction: column;
  width: 92vw;
  max-width: 880px;
  height: 92vh;
  max-height: 92vh;
  background: #E8E8E8;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
}

/* Toolbar */
.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #FFFFFF;
  border-bottom: 1px solid #EDEBE9;
  flex-shrink: 0;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #323130;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.preview-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: 4px;
  color: #605E5C;
  cursor: pointer;
  margin-left: 4px;
}
.preview-close-btn:hover {
  background: #F3F2F1;
  color: #323130;
}

/* Paper content area */
.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  justify-content: center;
}

.preview-paper {
  background: #FFFFFF;
  width: 100%;
  max-width: 800px;
  min-height: 1000px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  border-radius: 2px;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Responsive */
@media (max-width: 768px) {
  .preview-container {
    width: 100vw;
    height: 100vh;
    max-width: none;
    max-height: none;
    border-radius: 0;
  }
  .preview-content {
    padding: 12px;
  }
  .preview-paper {
    padding: 20px;
    min-height: auto;
  }
  .preview-title {
    font-size: 13px;
  }
  .preview-actions span {
    display: none;
  }
}
</style>
