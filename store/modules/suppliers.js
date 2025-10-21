import * as supplierApi from '@/api/supplier';

const state = {
  suppliers: [],
  isLoading: false,
  error: null,
};

const mutations = {
  SET_SUPPLIERS(state, suppliers) {
    state.suppliers = suppliers;
  },
  ADD_SUPPLIER(state, supplier) {
    state.suppliers.push(supplier);
  },
  UPDATE_SUPPLIER(state, updatedSupplier) {
    const index = state.suppliers.findIndex(s => s.id === updatedSupplier.id);
    if (index !== -1) {
      state.suppliers.splice(index, 1, updatedSupplier);
    }
  },
  DELETE_SUPPLIER(state, id) {
    state.suppliers = state.suppliers.filter(s => s.id !== id);
  },
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
};

const actions = {
  async fetchSuppliers({ commit }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const suppliers = await supplierApi.getAllSuppliers();
      commit('SET_SUPPLIERS', suppliers);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async addSupplier({ commit }, supplier) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const newSupplier = await supplierApi.createSupplier(supplier);
      commit('ADD_SUPPLIER', newSupplier);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async updateSupplier({ commit }, { id, supplier }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const updatedSupplier = await supplierApi.updateSupplier(id, supplier);
      commit('UPDATE_SUPPLIER', updatedSupplier);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async deleteSupplier({ commit }, id) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      await supplierApi.deleteSupplier(id);
      commit('DELETE_SUPPLIER', id);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
};

const getters = {
  allSuppliers: (state) => state.suppliers,
  supplierById: (state) => (id) => state.suppliers.find(s => s.id === id),
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
