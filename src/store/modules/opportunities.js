import Vue from 'vue'
import defaultOpportunities from '../../data/opportunities'

const STORAGE_KEY = 'd365-opportunities'

const STAGES = ['Qualification', 'Development', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
const STAGE_PROBABILITIES = {
  'Qualification': 10,
  'Development': 30,
  'Proposal': 55,
  'Negotiation': 75,
  'Closed Won': 100,
  'Closed Lost': 0
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Failed to load opportunities from localStorage:', e)
  }
  return null
}

function persist(opportunities) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(opportunities))
  } catch (e) {
    console.warn('Failed to persist opportunities to localStorage:', e)
  }
}

const state = {
  all: loadFromStorage() || defaultOpportunities,
  filters: {
    status: '',
    stage: '',
    salesperson: '',
    priority: ''
  },
  searchQuery: '',
  sortBy: 'estimatedValue',
  sortDir: 'desc',
  currentPage: 1,
  perPage: 15
}

const getters = {
  allOpportunities: state => state.all,

  byStage: state => {
    const grouped = {}
    STAGES.forEach(stage => { grouped[stage] = [] })
    state.all.forEach(opp => {
      if (grouped[opp.currentStage]) {
        grouped[opp.currentStage].push(opp)
      }
    })
    return grouped
  },

  openOpportunities: state => state.all.filter(o => o.status === 'Open'),

  wonOpportunities: state => state.all.filter(o => o.status === 'Won'),

  lostOpportunities: state => state.all.filter(o => o.status === 'Lost'),

  getOpportunityById: state => id => state.all.find(o => o.id === id),

  filteredOpportunities: state => {
    let filtered = [...state.all]

    // Apply search query
    const query = (state.searchQuery || '').trim().toLowerCase()
    if (query) {
      filtered = filtered.filter(o => {
        const name = (o.name || '').toLowerCase()
        const contactName = (o.contactName || '').toLowerCase()
        const description = (o.description || '').toLowerCase()
        return name.includes(query) ||
               contactName.includes(query) ||
               description.includes(query)
      })
    }

    // Apply filters
    if (state.filters.status) {
      filtered = filtered.filter(o => o.status === state.filters.status)
    }
    if (state.filters.stage) {
      filtered = filtered.filter(o => o.currentStage === state.filters.stage)
    }
    if (state.filters.salesperson) {
      filtered = filtered.filter(o => o.salesperson === state.filters.salesperson)
    }
    if (state.filters.priority) {
      filtered = filtered.filter(o => o.priority === state.filters.priority)
    }

    // Apply sort
    const dir = state.sortDir === 'asc' ? 1 : -1
    filtered.sort((a, b) => {
      let valA = a[state.sortBy]
      let valB = b[state.sortBy]
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

  totalPages: (state, getters) => {
    return Math.ceil(getters.filteredOpportunities.length / state.perPage)
  },

  paginatedOpportunities: (state, getters) => {
    const start = (state.currentPage - 1) * state.perPage
    const end = start + state.perPage
    return getters.filteredOpportunities.slice(start, end)
  },

  pipelineData: state => {
    const openStages = ['Qualification', 'Development', 'Proposal', 'Negotiation']
    return openStages.map(stage => {
      const opps = state.all.filter(o => o.currentStage === stage && o.status === 'Open')
      return {
        stage,
        count: opps.length,
        value: opps.reduce((sum, o) => sum + (o.estimatedValue || 0), 0)
      }
    })
  },

  totalPipelineValue: state => {
    return state.all
      .filter(o => o.status === 'Open')
      .reduce((sum, o) => sum + (o.estimatedValue || 0), 0)
  }
}

const mutations = {
  SET_ALL(state, opportunities) {
    state.all = opportunities
  },

  ADD(state, opportunity) {
    const newAll = [...state.all, opportunity]
    Vue.set(state, 'all', newAll)
  },

  UPDATE(state, updatedOpp) {
    const index = state.all.findIndex(o => o.id === updatedOpp.id)
    if (index !== -1) {
      Vue.set(state.all, index, { ...state.all[index], ...updatedOpp, updatedAt: new Date().toISOString() })
    }
  },

  DELETE(state, oppId) {
    state.all = state.all.filter(o => o.id !== oppId)
  },

  SET_FILTER(state, { key, value }) {
    Vue.set(state.filters, key, value)
  },

  SET_SEARCH(state, query) {
    state.searchQuery = query
  },

  SET_SORT(state, { sortBy, sortDir }) {
    state.sortBy = sortBy
    if (sortDir !== undefined) {
      state.sortDir = sortDir
    }
  },

  SET_PAGE(state, page) {
    state.currentPage = page
  }
}

const actions = {
  initOpportunities({ commit }) {
    const saved = loadFromStorage()
    commit('SET_ALL', saved || defaultOpportunities)
  },

  addOpportunity({ commit, state }, opportunity) {
    commit('ADD', opportunity)
    persist(state.all)
  },

  updateOpportunity({ commit, state }, opportunity) {
    commit('UPDATE', opportunity)
    persist(state.all)
  },

  deleteOpportunity({ commit, state }, oppId) {
    commit('DELETE', oppId)
    persist(state.all)
  },

  advanceStage({ commit, state, getters }, oppId) {
    const opp = getters.getOpportunityById(oppId)
    if (!opp || opp.status !== 'Open') return

    const openStages = ['Qualification', 'Development', 'Proposal', 'Negotiation']
    const currentIndex = openStages.indexOf(opp.currentStage)
    if (currentIndex === -1 || currentIndex >= openStages.length - 1) return

    const nextStage = openStages[currentIndex + 1]
    commit('UPDATE', {
      id: oppId,
      currentStage: nextStage,
      stageIndex: currentIndex + 2,
      probability: STAGE_PROBABILITIES[nextStage] || opp.probability
    })
    persist(state.all)
  },

  setWon({ commit, state }, oppId) {
    commit('UPDATE', {
      id: oppId,
      status: 'Won',
      currentStage: 'Closed Won',
      stageIndex: 5,
      probability: 100
    })
    persist(state.all)
  },

  setLost({ commit, state }, oppId) {
    commit('UPDATE', {
      id: oppId,
      status: 'Lost',
      currentStage: 'Closed Lost',
      stageIndex: 5,
      probability: 0
    })
    persist(state.all)
  },

  setFilter({ commit }, payload) {
    commit('SET_FILTER', payload)
    commit('SET_PAGE', 1)
  },

  setSearch({ commit }, query) {
    commit('SET_SEARCH', query)
    commit('SET_PAGE', 1)
  },

  setSort({ commit }, payload) {
    commit('SET_SORT', payload)
  },

  setPage({ commit }, page) {
    commit('SET_PAGE', page)
  }
}

export { STAGES, STAGE_PROBABILITIES }

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
