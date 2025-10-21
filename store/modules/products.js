import * as productApi from '@/api/product';

const state = {
  products: [],
  isLoading: false,
  error: null,
};

const mutations = {
  SET_PRODUCTS(state, products) {
    state.products = products;
  },
  ADD_PRODUCT(state, product) {
    state.products.push(product);
  },
  UPDATE_PRODUCT(state, updatedProduct) {
    const index = state.products.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      state.products.splice(index, 1, updatedProduct);
    }
  },
  DELETE_PRODUCT(state, id) {
    state.products = state.products.filter(p => p.id !== id);
  },
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
};

const actions = {
  async fetchProducts({ commit }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const products = await productApi.getAllProducts();
      commit('SET_PRODUCTS', products);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async addProduct({ commit }, product) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const newProduct = await productApi.createProduct(product);
      commit('ADD_PRODUCT', newProduct);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async updateProduct({ commit }, { id, product }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const updatedProduct = await productApi.updateProduct(id, product);
      commit('UPDATE_PRODUCT', updatedProduct);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async deleteProduct({ commit }, id) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      await productApi.deleteProduct(id);
      commit('DELETE_PRODUCT', id);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
};

const getters = {
  allProducts: (state) => state.products,
  productById: (state) => (id) => state.products.find(p => p.id === id),
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
