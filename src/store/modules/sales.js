import defaultDocuments from '../../data/salesDocuments'

const STORAGE_KEY = 'd365-sales'

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Failed to load sales documents from localStorage:', e)
  }
  return null
}

function persist(documents) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
  } catch (e) {
    console.warn('Failed to persist sales documents to localStorage:', e)
  }
}

function recalculateDocTotals(doc) {
  const subtotal = doc.lines.reduce((sum, line) => sum + (line.amount || 0), 0)
  const discountAmount = subtotal * ((doc.discountPercent || 0) / 100)
  const taxableAmount = subtotal - discountAmount
  const tax = taxableAmount * ((doc.taxPercent || 0) / 100)
  return {
    ...doc,
    subtotal,
    total: taxableAmount + tax
  }
}

const state = {
  documents: loadFromStorage() || defaultDocuments,
  filters: {
    type: '',
    status: ''
  },
  searchQuery: '',
  sortBy: 'createdAt',
  sortDir: 'desc',
  currentPage: 1,
  perPage: 15
}

const getters = {
  allDocuments: state => state.documents,

  quotes: state => state.documents.filter(d => d.type === 'Quote'),

  orders: state => state.documents.filter(d => d.type === 'Order'),

  invoices: state => state.documents.filter(d => d.type === 'Invoice'),

  creditMemos: state => state.documents.filter(d => d.type === 'Credit Memo'),

  getDocumentById: state => id => state.documents.find(d => d.id === id),

  byContact: state => contactId => {
    return state.documents.filter(d => d.contactId === contactId)
  },

  byOpportunity: state => oppId => {
    return state.documents.filter(d => d.opportunityId === oppId)
  },

  filteredDocuments: state => {
    let filtered = [...state.documents]

    // Apply search query
    const query = (state.searchQuery || '').trim().toLowerCase()
    if (query) {
      filtered = filtered.filter(d => {
        const number = (d.number || '').toLowerCase()
        const contactName = (d.contactName || '').toLowerCase()
        const notes = (d.notes || '').toLowerCase()
        return number.includes(query) ||
               contactName.includes(query) ||
               notes.includes(query)
      })
    }

    // Apply filters
    if (state.filters.type) {
      filtered = filtered.filter(d => d.type === state.filters.type)
    }
    if (state.filters.status) {
      filtered = filtered.filter(d => d.status === state.filters.status)
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
    return Math.ceil(getters.filteredDocuments.length / state.perPage)
  },

  paginatedDocuments: (state, getters) => {
    const start = (state.currentPage - 1) * state.perPage
    const end = start + state.perPage
    return getters.filteredDocuments.slice(start, end)
  }
}

const mutations = {
  SET_ALL(state, documents) {
    state.documents = documents
  },

  ADD(state, document) {
    state.documents.push(document)
  },

  UPDATE(state, updatedDoc) {
    const index = state.documents.findIndex(d => d.id === updatedDoc.id)
    if (index !== -1) {
      state.documents.splice(index, 1, { ...state.documents[index], ...updatedDoc, updatedAt: new Date().toISOString() })
    }
  },

  DELETE(state, docId) {
    state.documents = state.documents.filter(d => d.id !== docId)
  },

  ADD_LINE(state, { docId, line }) {
    const doc = state.documents.find(d => d.id === docId)
    if (doc) {
      doc.lines.push(line)
    }
  },

  UPDATE_LINE(state, { docId, lineId, updatedLine }) {
    const doc = state.documents.find(d => d.id === docId)
    if (doc) {
      const lineIndex = doc.lines.findIndex(l => l.id === lineId)
      if (lineIndex !== -1) {
        doc.lines.splice(lineIndex, 1, { ...doc.lines[lineIndex], ...updatedLine })
      }
    }
  },

  REMOVE_LINE(state, { docId, lineId }) {
    const doc = state.documents.find(d => d.id === docId)
    if (doc) {
      doc.lines = doc.lines.filter(l => l.id !== lineId)
    }
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
  }
}

const actions = {
  initSales({ commit }) {
    const saved = loadFromStorage()
    commit('SET_ALL', saved || defaultDocuments)
  },

  addDocument({ commit, state }, document) {
    commit('ADD', document)
    persist(state.documents)
  },

  updateDocument({ commit, state }, document) {
    commit('UPDATE', document)
    persist(state.documents)
  },

  deleteDocument({ commit, state }, docId) {
    commit('DELETE', docId)
    persist(state.documents)
  },

  addLine({ commit, state }, { docId, line }) {
    commit('ADD_LINE', { docId, line })
    // Recalculate totals
    const doc = state.documents.find(d => d.id === docId)
    if (doc) {
      const recalculated = recalculateDocTotals(doc)
      commit('UPDATE', { id: docId, subtotal: recalculated.subtotal, total: recalculated.total })
    }
    persist(state.documents)
  },

  updateLine({ commit, state }, { docId, lineId, updatedLine }) {
    commit('UPDATE_LINE', { docId, lineId, updatedLine })
    // Recalculate totals
    const doc = state.documents.find(d => d.id === docId)
    if (doc) {
      const recalculated = recalculateDocTotals(doc)
      commit('UPDATE', { id: docId, subtotal: recalculated.subtotal, total: recalculated.total })
    }
    persist(state.documents)
  },

  removeLine({ commit, state }, { docId, lineId }) {
    commit('REMOVE_LINE', { docId, lineId })
    // Recalculate totals
    const doc = state.documents.find(d => d.id === docId)
    if (doc) {
      const recalculated = recalculateDocTotals(doc)
      commit('UPDATE', { id: docId, subtotal: recalculated.subtotal, total: recalculated.total })
    }
    persist(state.documents)
  },

  recalculateTotals({ commit, state }, docId) {
    const doc = state.documents.find(d => d.id === docId)
    if (doc) {
      const recalculated = recalculateDocTotals(doc)
      commit('UPDATE', { id: docId, subtotal: recalculated.subtotal, total: recalculated.total })
      persist(state.documents)
    }
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

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
