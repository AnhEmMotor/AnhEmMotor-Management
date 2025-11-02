import { priceApi } from '@/api/price'
const state = {
  products: [],
  totalCount: 0,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 10,
  },
  filters: {
    searchTerm: '',
    statusIds: [],
  },
}

const getters = {
  totalPages(state) {
    return Math.max(1, Math.ceil(state.totalCount / state.pagination.pageSize))
  },
}

const mutations = {
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading
    state.error = null
  },
  SET_ERROR(state, error) {
    state.isLoading = false
    state.error = error
  },
  SET_PRODUCTS(state, { products, totalCount }) {
    state.products = products
    state.totalCount = totalCount
  },
  SET_PAGINATION(state, { currentPage, pageSize }) {
    state.pagination.currentPage = currentPage
    state.pagination.pageSize = pageSize
  },
  SET_FILTERS(state, { searchTerm }) {
    state.filters.searchTerm = searchTerm
  },
  UPDATE_VARIANT_PRICE(state, { productId, variantId, newPrice }) {
    const product = state.products.find((p) => p.product_id === productId)
    if (product) {
      const variant = product.variants.find((v) => v.variant_id === variantId)
      if (variant) {
        variant.price = newPrice
      }
    }
  },
}

const actions = {
  async fetchProducts({ commit, state }) {
    commit('SET_LOADING', true)
    try {
      const { currentPage, pageSize } = state.pagination
      const { searchTerm, statusIds } = state.filters

      const data = await priceApi.getProducts({
        page: currentPage,
        itemsPerPage: pageSize,
        search: searchTerm,
        statusIds: statusIds,
      })

      commit('SET_PRODUCTS', {
        products: data.products || [],
        totalCount: data.totalCount || 0,
      })
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updatePrice({ commit }, { productId, variantId, newPrice }) {
    try {
      const parsedPrice = parseNumber(newPrice)
      if (parsedPrice === null) {
        throw new Error('Invalid price format')
      }

      await priceApi.updateVariantPrice(variantId, parsedPrice)
      commit('UPDATE_VARIANT_PRICE', { productId, variantId, newPrice: parsedPrice })
    } catch (error) {
      commit('SET_ERROR', error.message)
    }
  },

  async updatePage({ commit, dispatch, state }, currentPage) {
    commit('SET_PAGINATION', { ...state.pagination, currentPage })
    await dispatch('fetchProducts')
  },

  async updateSearch({ commit, dispatch, state }, searchTerm) {
    commit('SET_FILTERS', { ...state.filters, searchTerm })
    commit('SET_PAGINATION', { ...state.pagination, currentPage: 1 })
    await dispatch('fetchProducts')
  },
}

const parseNumber = (v) => {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number') return v
  const s = String(v).replace(/\./g, '').replace(/,/g, '')
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
