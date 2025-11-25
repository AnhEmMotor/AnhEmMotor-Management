import * as orderApi from '@/api/order'

const state = {
  statuses: [],
  isLoading: false,
  error: null,
}

const mutations = {
  SET_STATUSES(state, statuses) {
    state.statuses = statuses
  },
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
}

const actions = {
  async fetchOrders({ commit }, params) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const data = await orderApi.fetchOrders(params)
      return data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async saveOrder({ commit }, payload) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const savedOrder = await orderApi.saveOrder(payload)
      return savedOrder
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchProductVariants({ commit }, params) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const data = await orderApi.fetchProductVariants(params)
      return data
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchStatuses({ commit }) {
    if (state.statuses.length > 0) return

    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const statuses = await orderApi.fetchOutputStatuses()
      commit('SET_STATUSES', statuses)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
}

const getters = {
  allStatuses: (state) => state.statuses,
  statusById: (state) => (id) => state.statuses.find((s) => s.id === id),
  isLoading: (state) => state.isLoading,
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
