import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/styles/tailwind.css'
import './assets/styles/d365.css'

// Import and register the smart position directive
import SmartPosition from './directives/smartPosition'
Vue.use(SmartPosition)

// Import and register the keyboard shortcuts mixin globally
import keyboardShortcuts from './mixins/keyboardShortcuts'
Vue.mixin(keyboardShortcuts)

Vue.config.productionTip = false

// Global filters
Vue.filter('currency', (value) => {
  if (value === null || value === undefined) return '$0.00'
  return `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
})

Vue.filter('date', (value) => {
  if (!value) return ''
  const d = new Date(value)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
})

Vue.filter('shortDate', (value) => {
  if (!value) return ''
  const d = new Date(value)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
