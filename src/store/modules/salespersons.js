import defaultSalespersons from '../../data/salespersons'

const STORAGE_KEY = 'd365-salespersons'

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Failed to load salespersons from localStorage:', e)
  }
  return null
}

function persist(salespersons) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(salespersons))
  } catch (e) {
    console.warn('Failed to persist salespersons to localStorage:', e)
  }
}

const state = {
  all: loadFromStorage() || defaultSalespersons,
  searchQuery: '',
  sortBy: 'name',
  sortDir: 'asc',
  currentPage: 1,
  perPage: 15
}

const getters = {
  allSalespersons: function (state) {
    return state.all
  },

  getSalespersonById: function (state) {
    return function (id) {
      return state.all.find(function (sp) { return sp.id === id })
    }
  },

  filteredSalespersons: function (state) {
    var filtered = [].concat(state.all)

    // Apply search query
    var query = (state.searchQuery || '').trim().toLowerCase()
    if (query) {
      filtered = filtered.filter(function (sp) {
        var name = (sp.name || '').toLowerCase()
        var email = (sp.email || '').toLowerCase()
        var role = (sp.role || '').toLowerCase()
        return name.indexOf(query) !== -1 ||
               email.indexOf(query) !== -1 ||
               role.indexOf(query) !== -1
      })
    }

    // Apply sort
    var dir = state.sortDir === 'asc' ? 1 : -1
    filtered.sort(function (a, b) {
      var valA = a[state.sortBy]
      var valB = b[state.sortBy]
      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()
      if (valA == null) return 1
      if (valB == null) return -1
      if (valA < valB) return -1 * dir
      if (valA > valB) return 1 * dir
      return 0
    })

    return filtered
  },

  totalPages: function (state, getters) {
    return Math.ceil(getters.filteredSalespersons.length / state.perPage)
  },

  paginatedSalespersons: function (state, getters) {
    var start = (state.currentPage - 1) * state.perPage
    var end = start + state.perPage
    return getters.filteredSalespersons.slice(start, end)
  },

  salespersonStats: function (state, getters, rootState) {
    var contacts = rootState.contacts.all || []
    var opportunities = rootState.opportunities.all || []

    var statsMap = {}

    state.all.forEach(function (sp) {
      var spContacts = contacts.filter(function (c) { return c.salesperson === sp.id })
      var spOpportunities = opportunities.filter(function (o) { return o.salesperson === sp.id })

      var openOpps = spOpportunities.filter(function (o) { return o.status === 'Open' })
      var wonOpps = spOpportunities.filter(function (o) { return o.status === 'Won' })
      var lostOpps = spOpportunities.filter(function (o) { return o.status === 'Lost' })

      var pipelineValue = openOpps.reduce(function (sum, o) { return sum + (o.estimatedValue || 0) }, 0)
      var wonRevenue = wonOpps.reduce(function (sum, o) { return sum + (o.estimatedValue || 0) }, 0)

      var closedCount = wonOpps.length + lostOpps.length
      var winRate = closedCount > 0 ? (wonOpps.length / closedCount) * 100 : 0
      var targetAchievement = sp.target > 0 ? (wonRevenue / sp.target) * 100 : 0

      statsMap[sp.id] = {
        contactCount: spContacts.length,
        opportunityCount: spOpportunities.length,
        openOpportunities: openOpps.length,
        wonOpportunities: wonOpps.length,
        lostOpportunities: lostOpps.length,
        pipelineValue: pipelineValue,
        wonRevenue: wonRevenue,
        winRate: Math.round(winRate * 10) / 10,
        targetAchievement: Math.round(targetAchievement * 10) / 10
      }
    })

    return statsMap
  }
}

const mutations = {
  SET_ALL: function (state, salespersons) {
    state.all = salespersons
  },

  ADD: function (state, salesperson) {
    state.all.push(salesperson)
  },

  UPDATE: function (state, updatedSp) {
    var index = state.all.findIndex(function (sp) { return sp.id === updatedSp.id })
    if (index !== -1) {
      state.all.splice(index, 1, Object.assign({}, state.all[index], updatedSp, { updatedAt: new Date().toISOString() }))
    }
  },

  DELETE: function (state, spId) {
    state.all = state.all.filter(function (sp) { return sp.id !== spId })
  },

  SET_SEARCH: function (state, query) {
    state.searchQuery = query
  },

  SET_SORT: function (state, payload) {
    state.sortBy = payload.sortBy
    if (payload.sortDir !== undefined) {
      state.sortDir = payload.sortDir
    }
  },

  SET_PAGE: function (state, page) {
    state.currentPage = page
  },

  SET_PER_PAGE: function (state, perPage) {
    state.perPage = perPage
  }
}

const actions = {
  initSalespersons: function (context) {
    var saved = loadFromStorage()
    context.commit('SET_ALL', saved || defaultSalespersons)
  },

  addSalesperson: function (context, salesperson) {
    context.commit('ADD', salesperson)
    persist(context.state.all)
  },

  updateSalesperson: function (context, salesperson) {
    context.commit('UPDATE', salesperson)
    persist(context.state.all)
  },

  deleteSalesperson: function (context, spId) {
    context.commit('DELETE', spId)
    persist(context.state.all)
  },

  setSearch: function (context, query) {
    context.commit('SET_SEARCH', query)
    context.commit('SET_PAGE', 1)
  },

  setSort: function (context, payload) {
    context.commit('SET_SORT', payload)
  },

  setPage: function (context, page) {
    context.commit('SET_PAGE', page)
  },

  setPerPage: function (context, perPage) {
    context.commit('SET_PER_PAGE', perPage)
    context.commit('SET_PAGE', 1)
  }
}

export default {
  namespaced: true,
  state: state,
  getters: getters,
  mutations: mutations,
  actions: actions
}
