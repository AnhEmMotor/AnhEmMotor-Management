import { defineStore } from 'pinia'
import { priceApi } from '@/api/price'

export const usePriceStore = defineStore('price', {
  state: () => ({
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
  }),

  getters: {
    totalPages: (state) =>
      Math.max(1, Math.ceil(state.totalCount / state.pagination.pageSize)),
  },

  actions: {
    async fetchProducts(params) {
      this.isLoading = true
      this.error = null
      try {
        const { page, itemsPerPage, search } = params
        const { statusIds } = this.filters

        const data = await priceApi.getProducts({
          page: page,
          itemsPerPage: itemsPerPage,
          search: search,
          statusIds: statusIds,
        })

        this.products = data.products || []
        this.totalCount = data.totalCount || 0

        return data
      } catch (error) {
        this.error = error.message
        this.isLoading = false
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updatePrice({ productId, variantId, newPrice }) {
      const parseNumber = (v) => {
        if (v === null || v === undefined || v === '') return null
        if (typeof v === 'number') return v
        const s = String(v).replace(/\./g, '').replace(/,/g, '')
        const n = Number(s)
        return Number.isFinite(n) ? n : null
      }

      try {
        const parsedPrice = parseNumber(newPrice)
        if (parsedPrice === null) {
          throw new Error('Invalid price format')
        }

        await priceApi.updateVariantPrice(variantId, parsedPrice)
        
        const product = this.products.find((p) => p.product_id === productId)
        if (product) {
          const variant = product.variants.find((v) => v.variant_id === variantId)
          if (variant) {
            variant.price = parsedPrice
          }
        }
      } catch (error) {
        this.error = error.message
      }
    },

    async updatePage(currentPage) {
      this.pagination.currentPage = currentPage
      await this.fetchProducts({
        page: currentPage,
        itemsPerPage: this.pagination.pageSize,
        search: this.filters.searchTerm
      })
    },

    async updateSearch(searchTerm) {
      this.filters.searchTerm = searchTerm
      this.pagination.currentPage = 1
      await this.fetchProducts({
        page: 1,
        itemsPerPage: this.pagination.pageSize,
        search: searchTerm
      })
    },
  },
})
