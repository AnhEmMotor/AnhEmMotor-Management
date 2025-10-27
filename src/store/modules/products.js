import * as productApi from '@/api/product'
import { showConfirmation } from '@/composables/confirmation'

const state = {
  products: [],
  isLoading: false,
  error: null,
  filters: {
    search: '',
    statusIds: [],
  },
  pagination: {
    page: 1,
    itemsPerPage: 1000,
    totalPages: 1,
  },
}

const mutations = {
  SET_PRODUCTS(state, products) {
    state.products = products
  },
  ADD_PRODUCT(state, product) {
    state.products.unshift(product)
  },
  UPDATE_PRODUCT(state, updatedProduct) {
    const index = state.products.findIndex((p) => p.id === updatedProduct.id)
    if (index !== -1) {
      state.products.splice(index, 1, updatedProduct)
    }
  },
  DELETE_PRODUCT(state, id) {
    state.products = state.products.filter((p) => p.id !== id)
  },
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  SET_FILTERS(state, { search, statusIds }) {
    if (search !== undefined) {
      state.filters.search = search
    }
    if (statusIds !== undefined) {
      state.filters.statusIds = statusIds
    }
  },
  SET_PAGINATION(state, { page, totalPages }) {
    if (page) {
      state.pagination.page = page
    }
    if (totalPages) {
      state.pagination.totalPages = totalPages
    }
  },
}

const actions = {
  async fetchProducts({ commit, state }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const params = {
        ...state.pagination,
        ...state.filters,
      }
      const products = await productApi.getProducts(params)
      commit('SET_PRODUCTS', products)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async saveProduct({ commit, dispatch }, productData) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const isEditMode = !!productData.id
      const savedProductData = await productApi.upsertProduct(productData)

      if (isEditMode) {
        commit('UPDATE_PRODUCT', savedProductData)
      } else {
        commit('ADD_PRODUCT', savedProductData)
      }
      dispatch('fetchProducts')
      return savedProductData
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteProduct({ commit, dispatch }, product) {
    const confirmed = await showConfirmation(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa dòng sản phẩm "${product.name}"? 
       Hành động này không thể hoàn tác.`,
    )
    if (!confirmed) return

    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      await productApi.deleteProduct(product.id)
      commit('DELETE_PRODUCT', product.id)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateFilters({ commit, dispatch }, { search, statusIds }) {
    commit('SET_FILTERS', { search, statusIds })
    commit('SET_PAGINATION', { page: 1 })
    await dispatch('fetchProducts')
  },

  async changePage({ commit, dispatch }, page) {
    commit('SET_PAGINATION', { page })
    await dispatch('fetchProducts')
  },
}

const getters = {
  allProducts: (state) => state.products,
  isLoading: (state) => state.isLoading,
  error: (state) => state.error,
  pagination: (state) => state.pagination,
  filters: (state) => state.filters,
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
