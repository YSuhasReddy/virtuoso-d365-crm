/**
 * Simple event bus to replace Vue 2's $root.$on/$off/$emit
 * which were removed in Vue 3.
 */
const listeners = {}

const eventBus = {
  on(event, callback) {
    if (!listeners[event]) {
      listeners[event] = []
    }
    listeners[event].push(callback)
  },

  off(event, callback) {
    if (!listeners[event]) return
    if (callback) {
      listeners[event] = listeners[event].filter(cb => cb !== callback)
    } else {
      delete listeners[event]
    }
  },

  emit(event, ...args) {
    if (!listeners[event]) return
    listeners[event].forEach(cb => cb(...args))
  }
}

export default eventBus
