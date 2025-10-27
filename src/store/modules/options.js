import * as optionsApi from '@/api/options'

const state = {
  options: [],
  isLoading: false,
  error: null,
}

const mutations = {
  SET_OPTIONS(state, options) {
    state.options = options
  },
  ADD_OPTION(state, option) {
    state.options.push(option)
  },
  UPDATE_OPTION(state, updatedOption) {
    const index = state.options.findIndex((o) => o.id === updatedOption.id)
    if (index !== -1) {
      state.options.splice(index, 1, updatedOption)
    }
  },
  DELETE_OPTION(state, id) {
    state.options = state.options.filter((o) => o.id !== id)
  },
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
}

const actions = {
  async fetchOptions({ commit }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const options = await optionsApi.getAllOptions()
      commit('SET_OPTIONS', options)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async addOption({ commit }, option) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const newOption = await optionsApi.createOption(option)
      commit('ADD_OPTION', newOption)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async updateOption({ commit }, { id, option }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const updatedOption = await optionsApi.updateOption(id, option)
      commit('UPDATE_OPTION', updatedOption)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async deleteOption({ commit }, id) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      await optionsApi.deleteOption(id)
      commit('DELETE_OPTION', id)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
}

const getters = {
  allOptions: (state) => state.options,
  optionById: (state) => (id) => state.options.find((o) => o.id === id),
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
