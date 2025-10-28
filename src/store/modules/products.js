import * as productApi from '@/api/product'
import * as storageApi from '@/api/supabaseStorage'
import { showConfirmation } from '@/composables/confirmation'

const getDefaultPagination = () => ({
  page: 1,
  itemsPerPage: 20,
  totalCount: 0,
  totalPages: 1,
})

const getDefaultFilters = () => ({
  search: '',
  statusIds: [],
})

const state = {
  products: [],
  isLoading: false,
  error: null,
  pagination: getDefaultPagination(),
  filters: getDefaultFilters(),
}

const mutations = {
  SET_PRODUCTS(state, products) {
    state.products = products
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
  SET_PAGINATION(state, { page, totalCount }) {
    if (page) state.pagination.page = page
    if (totalCount !== undefined) {
      state.pagination.totalCount = totalCount
      state.pagination.totalPages = Math.ceil(totalCount / state.pagination.itemsPerPage)
    }
  },
  SET_FILTERS(state, filters) {
    Object.assign(state.filters, filters)
  },
}

const actions = {
  async fetchProducts({ commit, getters }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const { filters, pagination } = getters
      const result = await productApi.getProducts(filters, pagination)

      commit('SET_PRODUCTS', result.products)
      commit('SET_PAGINATION', { totalCount: result.totalCount })
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async saveProduct({ commit, dispatch }, product) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const { product: _savedProduct } = await productApi.saveProduct(product)
      dispatch('fetchProducts')
    } catch (error) {
      console.error('Lỗi saveProduct action:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteProduct({ commit, dispatch }, product) {
    const title = 'Xác nhận xóa'
    const message = `Bạn có chắc chắn muốn xóa dòng sản phẩm "${product.name}"? Hành động này không thể hoàn tác.`

    const confirmed = await showConfirmation(title, message)
    if (!confirmed) return

    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      for (const variant of product.variants) {
        if (variant.cover_image) {
          await dispatch('deleteProductImage', { url: variant.cover_image, bucket: 'cover' })
        }
        for (const url of variant.photo_collection || []) {
          await dispatch('deleteProductImage', { url, bucket: 'photo_collection' })
        }
      }

      await productApi.deleteProduct(product.id)
      dispatch('fetchProducts')
    } catch (error) {
      console.error('Lỗi deleteProduct action:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteProductImage({ commit }, { url, bucket }) {
    await storageApi.deleteFile(url, bucket)
  },

  updateFilters({ commit, dispatch }, filters) {
    commit('SET_FILTERS', filters)
    dispatch('fetchProducts')
  },

  changePage({ commit, dispatch }, page) {
    commit('SET_PAGINATION', { page })
    dispatch('fetchProducts')
  },
}

const getters = {
  allProducts: (state) => state.products,
  productById: (state) => (id) => state.products.find((p) => p.id === id),
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
