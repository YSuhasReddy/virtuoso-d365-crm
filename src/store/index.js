import { createStore } from 'vuex'
import contacts from './modules/contacts'
import opportunities from './modules/opportunities'
import activities from './modules/activities'
import sales from './modules/sales'
import ui from './modules/ui'
import dashboard from './modules/dashboard'
import items from './modules/items'
import campaigns from './modules/campaigns'
import salespersons from './modules/salespersons'
import auth from './modules/auth'

export default createStore({
  modules: {
    contacts,
    opportunities,
    activities,
    sales,
    ui,
    dashboard,
    items,
    campaigns,
    salespersons,
    auth
  },
  strict: process.env.NODE_ENV !== 'production'
})
