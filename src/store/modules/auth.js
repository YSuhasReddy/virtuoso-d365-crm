const STORAGE_KEY = 'd365-auth'

const VALID_CREDENTIALS = {
  email: 'suhas.r@spotqa.com',
  password: 'Virtuoso1!'
}

const AUTHENTICATED_USER = {
  name: 'Suhas R',
  email: 'suhas.r@spotqa.com',
  initials: 'SR',
  role: 'Sales Manager'
}

function loadFromStorage() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.warn('Failed to load auth state:', e)
  }
  return null
}

function persistAuth(data) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to persist auth state:', e)
  }
}

const saved = loadFromStorage()

const state = {
  isAuthenticated: saved ? saved.isAuthenticated : false,
  user: saved ? saved.user : null
}

const getters = {
  isAuthenticated: state => state.isAuthenticated,
  currentUser: state => state.user || {},
  userInitials: state => (state.user && state.user.initials) || ''
}

const mutations = {
  SET_AUTH(state, { isAuthenticated, user }) {
    state.isAuthenticated = isAuthenticated
    state.user = user
  },
  CLEAR_AUTH(state) {
    state.isAuthenticated = false
    state.user = null
  }
}

const actions = {
  login({ commit }, { email, password }) {
    if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
      const authData = {
        isAuthenticated: true,
        user: { ...AUTHENTICATED_USER }
      }
      commit('SET_AUTH', authData)
      persistAuth(authData)
      return { success: true, user: { ...AUTHENTICATED_USER } }
    }
    return { success: false, error: 'Invalid email or password. Please try again.' }
  },

  logout({ commit }) {
    commit('CLEAR_AUTH')
    sessionStorage.removeItem(STORAGE_KEY)
  },

  initAuth({ commit }) {
    const saved = loadFromStorage()
    if (saved && saved.isAuthenticated) {
      commit('SET_AUTH', saved)
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
