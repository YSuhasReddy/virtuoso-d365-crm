import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/styles/tailwind.css'
import './assets/styles/d365.css'

// Import the smart position directive
import SmartPosition from './directives/smartPosition'

// Import the keyboard shortcuts mixin
import keyboardShortcuts from './mixins/keyboardShortcuts'

// Import global filter functions
import filters from './utils/filters'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(SmartPosition)
app.mixin(keyboardShortcuts)

// Register filters as global properties (replaces Vue.filter())
app.config.globalProperties.$filters = filters

app.mount('#app')
