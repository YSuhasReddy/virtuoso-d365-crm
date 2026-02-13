const STORAGE_KEY = 'd365-recycle-bin'

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) { console.warn('Failed to load recycle bin:', e) }
  return null
}

function persist(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) { console.warn('Failed to persist recycle bin:', e) }
}

const state = {
  items: loadFromStorage() || [],
  // Each item: { id, entityType: 'contact'|'opportunity'|'activity'|'salesDocument', data: {original record}, deletedAt: ISO string, deletedBy: 'User' }
}

const getters = {
  allItems: state => state.items,

  itemsByType: state => type => state.items.filter(i => i.entityType === type),

  contacts: state => state.items.filter(i => i.entityType === 'contact'),
  opportunities: state => state.items.filter(i => i.entityType === 'opportunity'),
  activities: state => state.items.filter(i => i.entityType === 'activity'),
  salesDocuments: state => state.items.filter(i => i.entityType === 'salesDocument'),

  totalCount: state => state.items.length,

  // Auto-purge: items older than 30 days
  activeItems: state => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return state.items.filter(i => new Date(i.deletedAt) > thirtyDaysAgo)
  }
}

const mutations = {
  SET_ALL(state, items) {
    state.items = items
  },

  ADD(state, item) {
    state.items.push(item)
  },

  REMOVE(state, itemId) {
    state.items = state.items.filter(i => i.id !== itemId)
  },

  CLEAR(state) {
    state.items = []
  }
}

const actions = {
  initRecycleBin({ commit }) {
    const saved = loadFromStorage()
    commit('SET_ALL', saved || [])
  },

  // Called by other modules when deleting a record
  addToRecycleBin({ commit, state, rootGetters }, { entityType, data }) {
    const userName = (rootGetters['auth/currentUser'] && rootGetters['auth/currentUser'].name) || 'Unknown User'
    const item = {
      id: 'rb-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      entityType,
      data: { ...data }, // Deep copy the original record
      deletedAt: new Date().toISOString(),
      deletedBy: userName
    }
    commit('ADD', item)
    persist(state.items)
  },

  // Restore a record from recycle bin back to its original store
  restore({ commit, state, dispatch }, itemId) {
    const item = state.items.find(i => i.id === itemId)
    if (!item) return

    // Restore to the original store module
    switch (item.entityType) {
      case 'contact':
        dispatch('contacts/addContact', item.data, { root: true })
        break
      case 'opportunity':
        dispatch('opportunities/addOpportunity', item.data, { root: true })
        break
      case 'activity':
        dispatch('activities/addActivity', item.data, { root: true })
        break
      case 'salesDocument':
        dispatch('sales/addDocument', item.data, { root: true })
        break
    }

    // Remove from recycle bin
    commit('REMOVE', itemId)
    persist(state.items)
  },

  // Permanently delete from recycle bin
  permanentDelete({ commit, state }, itemId) {
    commit('REMOVE', itemId)
    persist(state.items)
  },

  // Empty entire recycle bin
  emptyRecycleBin({ commit }) {
    commit('CLEAR')
    persist([])
  },

  // Auto-purge items older than 30 days
  purgeOldItems({ commit, state }) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const remaining = state.items.filter(i => new Date(i.deletedAt) > thirtyDaysAgo)
    commit('SET_ALL', remaining)
    persist(remaining)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
