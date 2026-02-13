import Vue from 'vue'
import Vuex from 'vuex'
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

Vue.use(Vuex)

export default new Vuex.Store({
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
