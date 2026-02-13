import defaultActivities from '../../data/activities'

const STORAGE_KEY = 'd365-activities'

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Failed to load activities from localStorage:', e)
  }
  return null
}

function persist(activities) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities))
  } catch (e) {
    console.warn('Failed to persist activities to localStorage:', e)
  }
}

function toDateStr(dateVal) {
  if (!dateVal) return ''
  return new Date(dateVal).toISOString().split('T')[0]
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}

const state = {
  all: loadFromStorage() || defaultActivities,
  filters: {
    type: '',
    status: '',
    salesperson: ''
  },
  searchQuery: '',
  sortBy: 'dueDate',
  sortDir: 'asc',
  currentPage: 1,
  perPage: 20
}

const getters = {
  allActivities: state => state.all,

  getActivityById: state => id => state.all.find(a => a.id === id),

  filteredActivities: state => {
    let filtered = [...state.all]

    // Apply search query
    const query = (state.searchQuery || '').trim().toLowerCase()
    if (query) {
      filtered = filtered.filter(a => {
        const subject = (a.subject || '').toLowerCase()
        const description = (a.description || '').toLowerCase()
        const contactId = (a.contactId || '').toLowerCase()
        return subject.includes(query) ||
               description.includes(query) ||
               contactId.includes(query)
      })
    }

    // Apply filters
    if (state.filters.type) {
      filtered = filtered.filter(a => a.type === state.filters.type)
    }
    if (state.filters.status) {
      filtered = filtered.filter(a => a.status === state.filters.status)
    }
    if (state.filters.salesperson) {
      filtered = filtered.filter(a => a.salesperson === state.filters.salesperson)
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
    return Math.ceil(getters.filteredActivities.length / state.perPage)
  },

  paginatedActivities: (state, getters) => {
    const start = (state.currentPage - 1) * state.perPage
    const end = start + state.perPage
    return getters.filteredActivities.slice(start, end)
  },

  byContact: state => contactId => {
    return state.all.filter(a => a.contactId === contactId)
  },

  byOpportunity: state => oppId => {
    return state.all.filter(a => a.opportunityId === oppId)
  },

  overdue: state => {
    const today = getTodayStr()
    return state.all.filter(a => {
      return a.status === 'Open' && toDateStr(a.dueDate) < today
    })
  },

  upcoming: state => {
    const today = new Date()
    const todayStr = getTodayStr()
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    const nextWeekStr = nextWeek.toISOString().split('T')[0]

    return state.all.filter(a => {
      if (a.status !== 'Open') return false
      const dueStr = toDateStr(a.dueDate)
      return dueStr >= todayStr && dueStr <= nextWeekStr
    })
  },

  todayActivities: state => {
    const today = getTodayStr()
    return state.all.filter(a => {
      return a.status === 'Open' && toDateStr(a.dueDate) === today
    })
  },

  completedActivities: state => {
    return state.all.filter(a => a.status === 'Completed')
  }
}

const mutations = {
  SET_ALL(state, activities) {
    state.all = activities
  },

  ADD(state, activity) {
    state.all.push(activity)
  },

  UPDATE(state, updatedActivity) {
    const index = state.all.findIndex(a => a.id === updatedActivity.id)
    if (index !== -1) {
      state.all.splice(index, 1, { ...state.all[index], ...updatedActivity })
    }
  },

  DELETE(state, activityId) {
    state.all = state.all.filter(a => a.id !== activityId)
  },

  SET_FILTER(state, { key, value }) {
    state.filters[key] = value
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
  },

  SET_PER_PAGE(state, perPage) {
    state.perPage = perPage
  }
}

const actions = {
  initActivities({ commit }) {
    const saved = loadFromStorage()
    commit('SET_ALL', saved || defaultActivities)
  },

  addActivity({ commit, state }, activity) {
    commit('ADD', activity)
    persist(state.all)
  },

  updateActivity({ commit, state }, activity) {
    commit('UPDATE', activity)
    persist(state.all)
  },

  completeActivity({ commit, state }, activityId) {
    commit('UPDATE', {
      id: activityId,
      status: 'Completed',
      completedDate: new Date().toISOString()
    })
    persist(state.all)
  },

  cancelActivity({ commit, state }, activityId) {
    commit('UPDATE', {
      id: activityId,
      status: 'Cancelled'
    })
    persist(state.all)
  },

  deleteActivity({ commit, state }, activityId) {
    commit('DELETE', activityId)
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
  },

  setPerPage({ commit }, perPage) {
    commit('SET_PER_PAGE', perPage)
    commit('SET_PAGE', 1)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
