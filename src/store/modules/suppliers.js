import * as supplierApi from '@/api/supplier'

const state = {
  suppliers: [],
  isLoading: false,
  error: null,
  totalCount: 0,
}

const mutations = {
  SET_SUPPLIERS(state, suppliers) {
    state.suppliers = suppliers
  },
  ADD_SUPPLIER(state, supplier) {
    state.suppliers.push(supplier)
  },
  UPDATE_SUPPLIER(state, updatedSupplier) {
    const index = state.suppliers.findIndex((s) => s.id === updatedSupplier.id)
    if (index !== -1) {
      state.suppliers.splice(index, 1, updatedSupplier)
    }
  },
  DELETE_SUPPLIER(state, id) {
    state.suppliers = state.suppliers.filter((s) => s.id !== id)
  },
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  SET_TOTAL_COUNT(state, count) {
    state.totalCount = count
  },
}

const actions = {
  async fetchSuppliers({ commit }, payload) {
    const { page, itemsPerPage, statusFilters, search } = payload || {}
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const { suppliers, count } = await supplierApi.fetchSuppliers(
        page,
        itemsPerPage,
        statusFilters,
        search,
      )
      commit('SET_SUPPLIERS', suppliers)
      commit('SET_TOTAL_COUNT', count)
      return { suppliers, count }
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async addSupplier({ commit }, supplier) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      supplier = { ...supplier, status: 'active' }
      const newSupplier = await supplierApi.createSupplier(supplier)
      commit('ADD_SUPPLIER', newSupplier)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async updateSupplier({ commit }, { id, supplier }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const updatedSupplier = await supplierApi.updateSupplier(id, supplier)
      commit('UPDATE_SUPPLIER', updatedSupplier)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async updateSupplierStatus({ commit }, { id, status }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const updatedSupplier = await supplierApi.updateSupplier(id, { status })
      commit('UPDATE_SUPPLIER', updatedSupplier)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async deleteSupplier({ commit }, id) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const updated = await supplierApi.deleteSupplier(id)
      commit('UPDATE_SUPPLIER', updated)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async restoreSupplier({ commit }, id) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const restored = await supplierApi.restoreSupplier(id)
      commit('UPDATE_SUPPLIER', restored)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
}

const getters = {
  allSuppliers: (state) => state.suppliers,
  supplierById: (state) => (id) => state.suppliers.find((s) => s.id === id),
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
