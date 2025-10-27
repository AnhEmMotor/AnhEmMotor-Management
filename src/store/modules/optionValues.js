import * as optionValuesApi from '@/api/optionValues'

const state = {
  optionValues: [],
  isLoading: false,
  error: null,
}

const mutations = {
  SET_OPTION_VALUES(state, values) {
    state.optionValues = values
  },
  ADD_OPTION_VALUE(state, value) {
    state.optionValues.push(value)
  },
  UPDATE_OPTION_VALUE(state, updatedValue) {
    const index = state.optionValues.findIndex((v) => v.id === updatedValue.id)
    if (index !== -1) {
      state.optionValues.splice(index, 1, updatedValue)
    }
  },
  DELETE_OPTION_VALUE(state, id) {
    state.optionValues = state.optionValues.filter((v) => v.id !== id)
  },
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
}

const actions = {
  async fetchOptionValues({ commit }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const values = await optionValuesApi.getAllOptionValues()
      commit('SET_OPTION_VALUES', values)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async fetchValuesByOptionId({ commit }, optionId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const values = await optionValuesApi.getOptionValuesByOptionId(optionId)
      commit('SET_OPTION_VALUES', values)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async addOptionValue({ commit }, value) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const newValue = await optionValuesApi.createOptionValue(value)
      commit('ADD_OPTION_VALUE', newValue)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async updateOptionValue({ commit }, { id, value }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const updatedValue = await optionValuesApi.updateOptionValue(id, value)
      commit('UPDATE_OPTION_VALUE', updatedValue)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async deleteOptionValue({ commit }, id) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      await optionValuesApi.deleteOptionValue(id)
      commit('DELETE_OPTION_VALUE', id)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
}

const getters = {
  allOptionValues: (state) => state.optionValues,
  optionValuesByOptionId: (state) => (optionId) => {
    return state.optionValues.filter((v) => v.option_id === optionId)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
