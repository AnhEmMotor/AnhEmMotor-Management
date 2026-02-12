import { defineStore } from 'pinia'
import * as productApi from '@/api/product'
import * as storageApi from '@/api/supabaseStorage'
import { showConfirmation } from '@/composables/useConfirmationState'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      itemsPerPage: 20,
      totalCount: 0,
      totalPages: 1,
    },
    filters: {
      search: '',
      statusIds: [],
    },
  }),

  getters: {
    allProducts: (state) => state.products,
    productById: (state) => (id) => state.products.find((p) => p.id === id),
  },

  actions: {
    async fetchProducts() {
      this.isLoading = true
      this.error = null
      try {
        const { filters, pagination } = this
        const result = await productApi.getProducts(filters, pagination)

        this.products = result.products

        if (result.totalCount !== undefined) {
          this.pagination.totalCount = result.totalCount
          this.pagination.totalPages = Math.ceil(result.totalCount / this.pagination.itemsPerPage)
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async saveProduct(product) {
      this.isLoading = true
      this.error = null
      try {
        await productApi.upsertProduct(product)
        await this.fetchProducts()
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteProduct(product) {
      const title = 'Xác nhận xóa'
      const message = `Bạn có chắc chắn muốn xóa dòng sản phẩm "${product.name}"? Hành động này không thể hoàn tác.`

      const confirmed = await showConfirmation(title, message)
      if (!confirmed) return

      this.isLoading = true
      this.error = null
      try {
        for (const variant of product.variants) {
          if (variant.cover_image_url) {
            await this.deleteProductImage({ url: variant.cover_image_url, bucket: 'cover' })
          }
          for (const url of variant.photo_collection || []) {
            await this.deleteProductImage({ url, bucket: 'photo-collection' })
          }
        }

        await productApi.deleteProduct(product.id)
        await this.fetchProducts()
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteProductImage({ url, bucket }) {
      await storageApi.deleteFile(url, bucket)
    },

    async updateFilters(filters) {
      Object.assign(this.filters, filters)
      await this.fetchProducts()
    },

    async changePage(page) {
      if (page) this.pagination.page = page
      await this.fetchProducts()
    },
  },
})
