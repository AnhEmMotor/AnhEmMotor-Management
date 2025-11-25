import * as brandApi from '@/api/brand'

const state = {
  brands: [],
  isLoading: false,
  error: null,
}

const mutations = {
  SET_BRANDS(state, brands) {
    state.brands = brands
  },
  ADD_BRAND(state, brand) {
    state.brands.push(brand)
  },
  UPDATE_BRAND(state, updatedBrand) {
    const index = state.brands.findIndex((b) => b.id === updatedBrand.id)
    if (index !== -1) {
      state.brands.splice(index, 1, updatedBrand)
    }
  },
  DELETE_BRAND(state, id) {
    state.brands = state.brands.filter((b) => b.id !== id)
  },
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
}

const actions = {
  async fetchBrands({ commit }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const brands = await brandApi.getAllBrands()
      commit('SET_BRANDS', brands)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async addBrand({ commit }, brand) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const newBrand = await brandApi.createBrand(brand)
      commit('ADD_BRAND', newBrand)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async updateBrand({ commit }, { id, brand }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const updatedBrand = await brandApi.updateBrand(id, brand)
      commit('UPDATE_BRAND', updatedBrand)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async deleteBrand({ commit }, id) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      await brandApi.deleteBrand(id)
      commit('DELETE_BRAND', id)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
}

const getters = {
  allBrands: (state) => state.brands,
  brandById: (state) => (id) => state.brands.find((b) => b.id === id),
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
