import Vue from 'vue'
import defaultContacts from '../../data/contacts'

const STORAGE_KEY = 'd365-contacts'

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Failed to load contacts from localStorage:', e)
  }
  return null
}

function persist(contacts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
  } catch (e) {
    console.warn('Failed to persist contacts to localStorage:', e)
  }
}

const state = {
  all: loadFromStorage() || defaultContacts,
  filters: {
    type: '',
    businessRelation: '',
    industry: '',
    salesperson: ''
  },
  searchQuery: '',
  sortBy: 'name',
  sortDir: 'asc',
  currentPage: 1,
  perPage: 15
}

const getters = {
  allContacts: state => state.all,

  companies: state => state.all.filter(c => c.type === 'Company'),

  persons: state => state.all.filter(c => c.type === 'Person'),

  getContactById: state => id => state.all.find(c => c.id === id),

  filteredContacts: state => {
    let filtered = [...state.all]

    // Apply search query
    const query = (state.searchQuery || '').trim().toLowerCase()
    if (query) {
      filtered = filtered.filter(c => {
        const name = (c.name || '').toLowerCase()
        const email = (c.email || '').toLowerCase()
        const phone = (c.phone || '').toLowerCase()
        const city = (c.address && c.address.city ? c.address.city : '').toLowerCase()
        return name.includes(query) ||
               email.includes(query) ||
               phone.includes(query) ||
               city.includes(query)
      })
    }

    // Apply filters
    if (state.filters.type) {
      filtered = filtered.filter(c => c.type === state.filters.type)
    }
    if (state.filters.businessRelation) {
      filtered = filtered.filter(c => c.businessRelation === state.filters.businessRelation)
    }
    if (state.filters.industry) {
      filtered = filtered.filter(c => c.industry === state.filters.industry)
    }
    if (state.filters.salesperson) {
      filtered = filtered.filter(c => c.salesperson === state.filters.salesperson)
    }

    // Apply sort
    const dir = state.sortDir === 'asc' ? 1 : -1
    filtered.sort((a, b) => {
      let valA = a[state.sortBy]
      let valB = b[state.sortBy]
      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()
      if (valA < valB) return -1 * dir
      if (valA > valB) return 1 * dir
      return 0
    })

    return filtered
  },

  totalPages: (state, getters) => {
    return Math.ceil(getters.filteredContacts.length / state.perPage)
  },

  paginatedContacts: (state, getters) => {
    const start = (state.currentPage - 1) * state.perPage
    const end = start + state.perPage
    return getters.filteredContacts.slice(start, end)
  }
}

const mutations = {
  SET_ALL(state, contacts) {
    state.all = contacts
  },

  ADD_CONTACT(state, contact) {
    // Use Vue.set pattern by creating a new array for reactivity
    const newAll = [...state.all, contact]
    Vue.set(state, 'all', newAll)
  },

  UPDATE_CONTACT(state, updatedContact) {
    const index = state.all.findIndex(c => c.id === updatedContact.id)
    if (index !== -1) {
      Vue.set(state.all, index, { ...state.all[index], ...updatedContact, updatedAt: new Date().toISOString() })
    }
  },

  DELETE_CONTACT(state, contactId) {
    state.all = state.all.filter(c => c.id !== contactId)
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
  },

  SET_PER_PAGE(state, perPage) {
    state.perPage = perPage
  }
}

const actions = {
  initContacts({ commit }) {
    const saved = loadFromStorage()
    commit('SET_ALL', saved || defaultContacts)
  },

  addContact({ commit, state }, contact) {
    commit('ADD_CONTACT', contact)
    persist(state.all)
  },

  updateContact({ commit, state }, contact) {
    commit('UPDATE_CONTACT', contact)
    persist(state.all)
  },

  deleteContact({ commit, state }, contactId) {
    commit('DELETE_CONTACT', contactId)
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
