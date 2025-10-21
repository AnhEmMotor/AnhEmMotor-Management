import * as productCategoryApi from '@/api/productCategory';

const state = {
  categories: [],
  isLoading: false,
  error: null,
};

const mutations = {
  SET_CATEGORIES(state, categories) {
    state.categories = categories;
  },
  ADD_CATEGORY(state, category) {
    state.categories.push(category);
  },
  UPDATE_CATEGORY(state, updatedCategory) {
    const index = state.categories.findIndex(c => c.id === updatedCategory.id);
    if (index !== -1) {
      state.categories.splice(index, 1, updatedCategory);
    }
  },
  DELETE_CATEGORY(state, id) {
    state.categories = state.categories.filter(c => c.id !== id);
  },
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
};

const actions = {
  async fetchCategories({ commit }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const categories = await productCategoryApi.getAllProductCategories();
      commit('SET_CATEGORIES', categories);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async addCategory({ commit }, category) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const newCategory = await productCategoryApi.createProductCategory(category);
      commit('ADD_CATEGORY', newCategory);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async updateCategory({ commit }, { id, category }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const updatedCategory = await productCategoryApi.updateProductCategory(id, category);
      commit('UPDATE_CATEGORY', updatedCategory);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async deleteCategory({ commit }, id) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      await productCategoryApi.deleteProductCategory(id);
      commit('DELETE_CATEGORY', id);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
};

const getters = {
  allCategories: (state) => state.categories,
  categoryById: (state) => (id) => state.categories.find(c => c.id === id),
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
