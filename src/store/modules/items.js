import Vue from 'vue'
import defaultItems from '../../data/items'

const STORAGE_KEY = 'd365-items'

function loadFromStorage() {
  try {
    var saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Failed to load items from localStorage:', e)
  }
  return null
}

function persist(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    console.warn('Failed to persist items to localStorage:', e)
  }
}

var state = {
  all: loadFromStorage() || defaultItems,
  filters: {
    type: '',
    category: ''
  },
  searchQuery: '',
  sortBy: 'number',
  sortDir: 'asc',
  currentPage: 1,
  perPage: 15
}

var getters = {
  allItems: function (state) {
    return state.all
  },

  getItemById: function (state) {
    return function (id) {
      return state.all.find(function (item) { return item.id === id })
    }
  },

  inventoryItems: function (state) {
    return state.all.filter(function (item) { return item.type === 'Inventory' })
  },

  serviceItems: function (state) {
    return state.all.filter(function (item) { return item.type === 'Service' })
  },

  lowStockItems: function (state) {
    return state.all.filter(function (item) {
      return item.type === 'Inventory' &&
        item.inventory &&
        item.inventory.quantity <= item.inventory.reorderPoint
    })
  },

  filteredItems: function (state) {
    var filtered = [].concat(state.all)

    // Apply search query
    var query = (state.searchQuery || '').trim().toLowerCase()
    if (query) {
      filtered = filtered.filter(function (item) {
        var name = (item.name || '').toLowerCase()
        var number = (item.number || '').toLowerCase()
        var description = (item.description || '').toLowerCase()
        var vendor = (item.vendor || '').toLowerCase()
        var category = (item.category || '').toLowerCase()
        return name.includes(query) ||
               number.includes(query) ||
               description.includes(query) ||
               vendor.includes(query) ||
               category.includes(query)
      })
    }

    // Apply filters
    if (state.filters.type) {
      filtered = filtered.filter(function (item) { return item.type === state.filters.type })
    }
    if (state.filters.category) {
      filtered = filtered.filter(function (item) { return item.category === state.filters.category })
    }

    // Apply sort
    var dir = state.sortDir === 'asc' ? 1 : -1
    var sortField = state.sortBy
    filtered.sort(function (a, b) {
      var valA = a[sortField]
      var valB = b[sortField]
      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()
      if (valA < valB) return -1 * dir
      if (valA > valB) return 1 * dir
      return 0
    })

    return filtered
  },

  totalPages: function (state, getters) {
    return Math.ceil(getters.filteredItems.length / state.perPage)
  },

  paginatedItems: function (state, getters) {
    var start = (state.currentPage - 1) * state.perPage
    var end = start + state.perPage
    return getters.filteredItems.slice(start, end)
  }
}

var mutations = {
  SET_ALL: function (state, items) {
    state.all = items
  },

  ADD_ITEM: function (state, item) {
    var newAll = [].concat(state.all, [item])
    Vue.set(state, 'all', newAll)
  },

  UPDATE_ITEM: function (state, updatedItem) {
    var index = state.all.findIndex(function (item) { return item.id === updatedItem.id })
    if (index !== -1) {
      var merged = {}
      var existing = state.all[index]
      var keys = Object.keys(existing)
      for (var i = 0; i < keys.length; i++) {
        merged[keys[i]] = existing[keys[i]]
      }
      var updateKeys = Object.keys(updatedItem)
      for (var j = 0; j < updateKeys.length; j++) {
        merged[updateKeys[j]] = updatedItem[updateKeys[j]]
      }
      merged.updatedAt = new Date().toISOString()
      Vue.set(state.all, index, merged)
    }
  },

  DELETE_ITEM: function (state, itemId) {
    state.all = state.all.filter(function (item) { return item.id !== itemId })
  },

  ADJUST_INVENTORY: function (state, payload) {
    var index = state.all.findIndex(function (item) { return item.id === payload.itemId })
    if (index !== -1) {
      var item = state.all[index]
      if (item.inventory) {
        var updated = {}
        var keys = Object.keys(item)
        for (var i = 0; i < keys.length; i++) {
          updated[keys[i]] = item[keys[i]]
        }
        updated.inventory = {
          quantity: (item.inventory.quantity || 0) + payload.quantity,
          reorderPoint: item.inventory.reorderPoint,
          reorderQuantity: item.inventory.reorderQuantity
        }
        updated.updatedAt = new Date().toISOString()
        Vue.set(state.all, index, updated)
      }
    }
  },

  SET_FILTER: function (state, payload) {
    Vue.set(state.filters, payload.key, payload.value)
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

var actions = {
  initItems: function (context) {
    var saved = loadFromStorage()
    context.commit('SET_ALL', saved || defaultItems)
  },

  addItem: function (context, item) {
    context.commit('ADD_ITEM', item)
    persist(context.state.all)
  },

  updateItem: function (context, item) {
    context.commit('UPDATE_ITEM', item)
    persist(context.state.all)
  },

  deleteItem: function (context, itemId) {
    context.commit('DELETE_ITEM', itemId)
    persist(context.state.all)
  },

  adjustInventory: function (context, payload) {
    context.commit('ADJUST_INVENTORY', payload)
    persist(context.state.all)
  },

  setFilter: function (context, payload) {
    context.commit('SET_FILTER', payload)
    context.commit('SET_PAGE', 1)
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
