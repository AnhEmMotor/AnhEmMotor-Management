import { defineStore } from 'pinia'
import brandService from '@/services/brandService'
import brandMapper from '@/mappers/brandMapper'

export const useBrandStore = defineStore('brand', {
  state: () => ({
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchBrands(query) {
      this.isLoading = true
      this.error = null
      try {
        const params = brandMapper.toParams(query)
        const data = await brandService.fetchBrands(params)
        return {
          data: brandMapper.toList(data),
          pagination: brandMapper.toPagination(data),
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getAllBrands(params = { PageSize: 1000 }) {
      this.isLoading = true
      try {
        const data = await brandService.fetchBrands(params)
        return brandMapper.toList(data)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getBrandById(id) {
      this.isLoading = true
      try {
        const data = await brandService.getBrandById(id)
        return brandMapper.toModel(data)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async addBrand(brand) {
      this.isLoading = true
      this.error = null
      try {
        const dto = brandMapper.toDTO(brand)
        const data = await brandService.createBrand(dto)
        return brandMapper.toModel(data)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateBrand({ id, brand }) {
      this.isLoading = true
      this.error = null
      try {
        const dto = brandMapper.toDTO(brand)
        const data = await brandService.updateBrand(id, dto)
        return brandMapper.toModel(data)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteBrand(id) {
      this.isLoading = true
      this.error = null
      try {
        await brandService.deleteBrand(id)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },
  },
})
