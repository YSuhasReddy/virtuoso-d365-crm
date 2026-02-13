let alertCounter = 0

const state = {
  sideNavCollapsed: false,
  currentView: 'grid',
  activeFilters: false,
  searchOpen: false,
  quickCreateOpen: false,
  quickCreateType: '',
  confirmDialog: {
    show: false,
    title: '',
    message: '',
    onConfirm: null
  },
  alerts: []
}

const getters = {
  sideNavCollapsed: state => state.sideNavCollapsed,
  currentView: state => state.currentView,
  activeFilters: state => state.activeFilters,
  searchOpen: state => state.searchOpen,
  quickCreateOpen: state => state.quickCreateOpen,
  quickCreateType: state => state.quickCreateType,
  confirmDialog: state => state.confirmDialog,
  alerts: state => state.alerts
}

const mutations = {
  TOGGLE_SIDENAV(state) {
    state.sideNavCollapsed = !state.sideNavCollapsed
  },

  SET_SIDENAV(state, collapsed) {
    state.sideNavCollapsed = collapsed
  },

  SET_VIEW(state, view) {
    state.currentView = view
  },

  TOGGLE_FILTERS(state) {
    state.activeFilters = !state.activeFilters
  },

  SET_SEARCH_OPEN(state, open) {
    state.searchOpen = open
  },

  SET_QUICK_CREATE(state, { open, type }) {
    state.quickCreateOpen = open
    state.quickCreateType = type || ''
  },

  SET_CONFIRM_DIALOG(state, dialog) {
    state.confirmDialog = { ...state.confirmDialog, ...dialog }
  },

  ADD_ALERT(state, alert) {
    state.alerts.push(alert)
  },

  REMOVE_ALERT(state, alertId) {
    state.alerts = state.alerts.filter(a => a.id !== alertId)
  }
}

const actions = {
  toggleSideNav({ commit }) {
    commit('TOGGLE_SIDENAV')
  },

  setSideNav({ commit }, collapsed) {
    commit('SET_SIDENAV', collapsed)
  },

  setView({ commit }, view) {
    commit('SET_VIEW', view)
  },

  toggleFilters({ commit }) {
    commit('TOGGLE_FILTERS')
  },

  setSearchOpen({ commit }, open) {
    commit('SET_SEARCH_OPEN', open)
  },

  openQuickCreate({ commit }, type) {
    commit('SET_QUICK_CREATE', { open: true, type })
  },

  closeQuickCreate({ commit }) {
    commit('SET_QUICK_CREATE', { open: false, type: '' })
  },

  showConfirm({ commit }, { title, message, onConfirm }) {
    commit('SET_CONFIRM_DIALOG', { show: true, title, message, onConfirm })
  },

  hideConfirm({ commit }) {
    commit('SET_CONFIRM_DIALOG', { show: false, title: '', message: '', onConfirm: null })
  },

  showAlert({ commit }, { type, title, message, duration = 5000 }) {
    alertCounter++
    const id = alertCounter
    const alert = { id, type, title, message, duration }
    commit('ADD_ALERT', alert)

    if (duration > 0) {
      setTimeout(() => {
        commit('REMOVE_ALERT', id)
      }, duration)
    }

    return id
  },

  showSuccess({ dispatch }, { title, message, duration }) {
    return dispatch('showAlert', { type: 'success', title, message, duration })
  },

  showError({ dispatch }, { title, message, duration }) {
    return dispatch('showAlert', { type: 'error', title, message, duration: duration || 8000 })
  },

  showWarning({ dispatch }, { title, message, duration }) {
    return dispatch('showAlert', { type: 'warning', title, message, duration })
  },

  showInfo({ dispatch }, { title, message, duration }) {
    return dispatch('showAlert', { type: 'info', title, message, duration })
  },

  removeAlert({ commit }, alertId) {
    commit('REMOVE_ALERT', alertId)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
