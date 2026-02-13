/**
 * Global Keyboard Shortcuts Mixin for D365 CRM
 *
 * Provides keyboard shortcut handling across the entire application.
 * Shortcuts are suppressed when the user is typing in input fields.
 *
 * Shortcuts:
 *   Alt+N          - Open quick create
 *   Alt+S          - Save current record
 *   Ctrl+F or /    - Focus the Tell Me search
 *   F5             - Refresh current view
 *   Escape         - Close modals/panels
 *   Alt+Left       - Navigate back
 *   Alt+Right      - Navigate forward
 *   Ctrl+Shift+F   - Toggle filter panel
 *   ?              - Show keyboard shortcuts help
 */

import eventBus from '../utils/eventBus'

export default {
  data() {
    return {
      _ks_showShortcutsHelp: false
    }
  },

  mounted() {
    this._shortcutHandler = (e) => {
      const tag = e.target.tagName
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable

      // Alt+N - Open quick create (works even in inputs)
      if (e.altKey && e.key === 'n') {
        e.preventDefault()
        if (this.$store) {
          this.$store.dispatch('ui/openQuickCreate')
        }
        return
      }

      // Alt+S - Save
      if (e.altKey && e.key === 's') {
        e.preventDefault()
        eventBus.emit('shortcut-save')
        return
      }

      // Ctrl+F - Focus search
      if (e.ctrlKey && !e.shiftKey && e.key === 'f') {
        e.preventDefault()
        eventBus.emit('shortcut-focus-search')
        return
      }

      // Ctrl+Shift+F - Toggle filter panel
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        eventBus.emit('shortcut-toggle-filter')
        return
      }

      // F5 - Refresh
      if (e.key === 'F5') {
        e.preventDefault()
        eventBus.emit('shortcut-refresh')
        return
      }

      // Escape - Close modals/panels
      if (e.key === 'Escape') {
        // First check if shortcuts help is open
        if (this._ks_showShortcutsHelp) {
          this._ks_showShortcutsHelp = false
          eventBus.emit('shortcut-close-shortcuts-help')
          return
        }
        eventBus.emit('shortcut-escape')
        if (this.$store) {
          if (this.$store.state.ui.quickCreateOpen) {
            this.$store.dispatch('ui/closeQuickCreate')
          }
          if (this.$store.state.ui.confirmDialog && this.$store.state.ui.confirmDialog.show) {
            this.$store.dispatch('ui/hideConfirm')
          }
        }
        return
      }

      // Alt+Left - Go back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault()
        if (this.$router) {
          this.$router.back()
        }
        return
      }

      // Alt+Right - Go forward
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault()
        if (this.$router) {
          this.$router.forward()
        }
        return
      }

      // The following shortcuts should NOT fire in input fields
      if (isInput) return

      // / - Focus search
      if (e.key === '/') {
        e.preventDefault()
        eventBus.emit('shortcut-focus-search')
        return
      }

      // ? - Show keyboard shortcuts help
      if (e.key === '?') {
        e.preventDefault()
        this._ks_showShortcutsHelp = !this._ks_showShortcutsHelp
        eventBus.emit('shortcut-toggle-shortcuts-help')
        return
      }
    }

    document.addEventListener('keydown', this._shortcutHandler)
  },

  beforeUnmount() {
    if (this._shortcutHandler) {
      document.removeEventListener('keydown', this._shortcutHandler)
    }
  }
}
