import { defineStore } from 'pinia'
import * as brandApi from '@/api/brand'

export const useBrandsStore = defineStore('brands', {
  state: () => ({
    brands: [],
    isLoading: false,
    error: null,
  }),
  
  getters: {
    allBrands: (state) => state.brands,
    brandById: (state) => (id) => state.brands.find((b) => b.id === id),
  },

  actions: {
    async fetchBrands() {
      this.isLoading = true
      this.error = null
      try {
        const result = await brandApi.getAllBrands({ PageSize: 10 })
        this.brands = result.items || result || []
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async addBrand(brand) {
      this.isLoading = true
      this.error = null
      try {
        const newBrand = await brandApi.createBrand(brand)
        this.brands.push(newBrand)
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async updateBrand({ id, brand }) {
      this.isLoading = true
      this.error = null
      try {
        const updatedBrand = await brandApi.updateBrand(id, brand)
        const index = this.brands.findIndex((b) => b.id === updatedBrand.id)
        if (index !== -1) {
          this.brands.splice(index, 1, updatedBrand)
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async deleteBrand(id) {
      this.isLoading = true
      this.error = null
      try {
        await brandApi.deleteBrand(id)
        this.brands = this.brands.filter((b) => b.id !== id)
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },
  },
})
