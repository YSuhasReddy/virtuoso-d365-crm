import defaultCampaigns from '../../data/campaigns'

const STORAGE_KEY = 'd365-campaigns'

function loadFromStorage() {
  try {
    var saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Failed to load campaigns from localStorage:', e)
  }
  return null
}

function persist(campaigns) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns))
  } catch (e) {
    console.warn('Failed to persist campaigns to localStorage:', e)
  }
}

const state = {
  all: loadFromStorage() || defaultCampaigns,
  filters: {
    status: '',
    type: ''
  },
  searchQuery: '',
  sortBy: 'name',
  sortDir: 'asc',
  currentPage: 1,
  perPage: 15
}

const getters = {
  allCampaigns: function (state) {
    return state.all
  },

  getCampaignById: function (state) {
    return function (id) {
      return state.all.find(function (c) { return c.id === id })
    }
  },

  filteredCampaigns: function (state) {
    var filtered = state.all.slice()

    // Apply search query
    var query = (state.searchQuery || '').trim().toLowerCase()
    if (query) {
      filtered = filtered.filter(function (c) {
        var name = (c.name || '').toLowerCase()
        var number = (c.number || '').toLowerCase()
        var description = (c.description || '').toLowerCase()
        var segment = (c.targetSegment || '').toLowerCase()
        var salesperson = (c.salespersonName || '').toLowerCase()
        return name.includes(query) ||
               number.includes(query) ||
               description.includes(query) ||
               segment.includes(query) ||
               salesperson.includes(query)
      })
    }

    // Apply filters
    if (state.filters.status) {
      filtered = filtered.filter(function (c) { return c.status === state.filters.status })
    }
    if (state.filters.type) {
      filtered = filtered.filter(function (c) { return c.type === state.filters.type })
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

  paginatedCampaigns: function (state, getters) {
    var start = (state.currentPage - 1) * state.perPage
    var end = start + state.perPage
    return getters.filteredCampaigns.slice(start, end)
  },

  totalPages: function (state, getters) {
    return Math.ceil(getters.filteredCampaigns.length / state.perPage)
  },

  activeCampaigns: function (state) {
    return state.all.filter(function (c) { return c.status === 'Active' })
  },

  completedCampaigns: function (state) {
    return state.all.filter(function (c) { return c.status === 'Completed' })
  },

  totalBudget: function (state) {
    return state.all.reduce(function (sum, c) { return sum + (c.budget || 0) }, 0)
  },

  totalSpent: function (state) {
    return state.all.reduce(function (sum, c) { return sum + (c.actualCost || 0) }, 0)
  },

  campaignROI: function (state) {
    // Simple ROI: (total responses / total spent) * 100 — a proxy metric
    var totalResponses = state.all.reduce(function (sum, c) { return sum + (c.responses || 0) }, 0)
    var totalSpent = state.all.reduce(function (sum, c) { return sum + (c.actualCost || 0) }, 0)
    if (totalSpent === 0) return 0
    return ((totalResponses / totalSpent) * 1000).toFixed(1)
  }
}

const mutations = {
  SET_ALL: function (state, campaigns) {
    state.all = campaigns
  },

  ADD_CAMPAIGN: function (state, campaign) {
    state.all.push(campaign)
  },

  UPDATE_CAMPAIGN: function (state, updatedCampaign) {
    var index = state.all.findIndex(function (c) { return c.id === updatedCampaign.id })
    if (index !== -1) {
      var merged = Object.assign({}, state.all[index], updatedCampaign, { updatedAt: new Date().toISOString() })
      state.all.splice(index, 1, merged)
    }
  },

  DELETE_CAMPAIGN: function (state, campaignId) {
    state.all = state.all.filter(function (c) { return c.id !== campaignId })
  },

  ADD_CAMPAIGN_ACTIVITY: function (state, { campaignId, activity }) {
    var index = state.all.findIndex(function (c) { return c.id === campaignId })
    if (index !== -1) {
      var campaign = Object.assign({}, state.all[index])
      var activities = campaign.activities ? campaign.activities.slice() : []
      activities.push(activity)
      campaign.activities = activities
      campaign.updatedAt = new Date().toISOString()
      state.all.splice(index, 1, campaign)
    }
  },

  UPDATE_CAMPAIGN_STATUS: function (state, { campaignId, status }) {
    var index = state.all.findIndex(function (c) { return c.id === campaignId })
    if (index !== -1) {
      var updated = Object.assign({}, state.all[index], { status: status, updatedAt: new Date().toISOString() })
      state.all.splice(index, 1, updated)
    }
  },

  SET_FILTER: function (state, { key, value }) {
    state.filters[key] = value
  },

  SET_SEARCH: function (state, query) {
    state.searchQuery = query
  },

  SET_SORT: function (state, { sortBy, sortDir }) {
    state.sortBy = sortBy
    if (sortDir !== undefined) {
      state.sortDir = sortDir
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
  initCampaigns: function ({ commit }) {
    var saved = loadFromStorage()
    commit('SET_ALL', saved || defaultCampaigns)
  },

  addCampaign: function ({ commit, state }, campaign) {
    commit('ADD_CAMPAIGN', campaign)
    persist(state.all)
  },

  updateCampaign: function ({ commit, state }, campaign) {
    commit('UPDATE_CAMPAIGN', campaign)
    persist(state.all)
  },

  deleteCampaign: function ({ commit, state }, campaignId) {
    commit('DELETE_CAMPAIGN', campaignId)
    persist(state.all)
  },

  addCampaignActivity: function ({ commit, state }, payload) {
    commit('ADD_CAMPAIGN_ACTIVITY', payload)
    persist(state.all)
  },

  updateCampaignStatus: function ({ commit, state }, payload) {
    commit('UPDATE_CAMPAIGN_STATUS', payload)
    persist(state.all)
  },

  setFilter: function ({ commit }, payload) {
    commit('SET_FILTER', payload)
    commit('SET_PAGE', 1)
  },

  setSearch: function ({ commit }, query) {
    commit('SET_SEARCH', query)
    commit('SET_PAGE', 1)
  },

  setSort: function ({ commit }, payload) {
    commit('SET_SORT', payload)
  },

  setPage: function ({ commit }, page) {
    commit('SET_PAGE', page)
  },

  setPerPage: function ({ commit }, perPage) {
    commit('SET_PER_PAGE', perPage)
    commit('SET_PAGE', 1)
  }
}

export default {
  namespaced: true,
  state: state,
  getters: getters,
  mutations: mutations,
  actions: actions
}
