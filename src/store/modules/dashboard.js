/**
 * Dashboard store module
 * Purely computed getters from other modules via rootState and rootGetters.
 * No own persisted state.
 */

const state = {}

const getters = {
  totalPipelineValue: (state, getters, rootState) => {
    return rootState.opportunities.all
      .filter(o => o.status === 'Open')
      .reduce((sum, o) => sum + (o.estimatedValue || 0), 0)
  },

  openOpportunitiesCount: (state, getters, rootState) => {
    return rootState.opportunities.all.filter(o => o.status === 'Open').length
  },

  wonThisMonth: (state, getters, rootState) => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const wonOpps = rootState.opportunities.all.filter(o => {
      if (o.status !== 'Won') return false
      const updated = new Date(o.updatedAt)
      return updated.getMonth() === currentMonth && updated.getFullYear() === currentYear
    })

    return {
      count: wonOpps.length,
      value: wonOpps.reduce((sum, o) => sum + (o.estimatedValue || 0), 0)
    }
  },

  activitiesDueToday: (state, getters, rootState) => {
    const today = new Date().toISOString().split('T')[0]
    return rootState.activities.all.filter(a => {
      if (a.status !== 'Open') return false
      const dueStr = a.dueDate ? new Date(a.dueDate).toISOString().split('T')[0] : ''
      return dueStr === today
    }).length
  },

  overdueActivities: (state, getters, rootState) => {
    const today = new Date().toISOString().split('T')[0]
    return rootState.activities.all.filter(a => {
      if (a.status !== 'Open') return false
      const dueStr = a.dueDate ? new Date(a.dueDate).toISOString().split('T')[0] : ''
      return dueStr < today
    }).length
  },

  salesByStage: (state, getters, rootState) => {
    const openStages = ['Qualification', 'Development', 'Proposal', 'Negotiation']
    return openStages.map(stage => {
      const opps = rootState.opportunities.all.filter(
        o => o.currentStage === stage && o.status === 'Open'
      )
      return {
        stage,
        count: opps.length,
        value: opps.reduce((sum, o) => sum + (o.estimatedValue || 0), 0)
      }
    })
  },

  recentActivities: (state, getters, rootState) => {
    return [...rootState.activities.all]
      .sort((a, b) => {
        const dateA = a.createdAt || ''
        const dateB = b.createdAt || ''
        return dateB.localeCompare(dateA)
      })
      .slice(0, 10)
  },

  topOpportunities: (state, getters, rootState) => {
    return [...rootState.opportunities.all]
      .filter(o => o.status === 'Open')
      .sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0))
      .slice(0, 5)
  },

  salesBySalesperson: (state, getters, rootState) => {
    const grouped = {}
    rootState.opportunities.all
      .filter(o => o.status === 'Open' || o.status === 'Won')
      .forEach(o => {
        const sp = o.salesperson || 'Unassigned'
        if (!grouped[sp]) {
          grouped[sp] = { salesperson: sp, count: 0, totalValue: 0 }
        }
        grouped[sp].count++
        grouped[sp].totalValue += (o.estimatedValue || 0)
      })
    return Object.values(grouped).sort((a, b) => b.totalValue - a.totalValue)
  },

  conversionRate: (state, getters, rootState) => {
    const won = rootState.opportunities.all.filter(o => o.status === 'Won').length
    const lost = rootState.opportunities.all.filter(o => o.status === 'Lost').length
    const total = won + lost
    if (total === 0) return 0
    return Math.round((won / total) * 100)
  },

  averageDealSize: (state, getters, rootState) => {
    const wonOpps = rootState.opportunities.all.filter(o => o.status === 'Won')
    if (wonOpps.length === 0) return 0
    const totalValue = wonOpps.reduce((sum, o) => sum + (o.estimatedValue || 0), 0)
    return Math.round(totalValue / wonOpps.length)
  }
}

const mutations = {}

const actions = {}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
