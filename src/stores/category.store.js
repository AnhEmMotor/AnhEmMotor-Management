import { defineStore } from 'pinia'
import categoryService from '@/services/categoryService'
import categoryMapper from '@/mappers/categoryMapper'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchCategories(query) {
      this.isLoading = true
      this.error = null
      try {
        const params = categoryMapper.toParams(query)
        const data = await categoryService.fetchCategories(params)
        return {
          data: categoryMapper.toList(data),
          pagination: categoryMapper.toPagination(data),
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getAllCategories(params = { PageSize: 1000 }) {
      this.isLoading = true
      try {
        const data = await categoryService.fetchCategories(params)
        return categoryMapper.toList(data)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getCategoryById(id) {
      this.isLoading = true
      try {
        const data = await categoryService.getCategoryById(id)
        return categoryMapper.toModel(data)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async addCategory(category) {
      this.isLoading = true
      this.error = null
      try {
        const dto = categoryMapper.toDTO(category)
        const data = await categoryService.createCategory(dto)
        return categoryMapper.toModel(data)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateCategory({ id, category }) {
      this.isLoading = true
      this.error = null
      try {
        const dto = categoryMapper.toDTO(category)
        const data = await categoryService.updateCategory(id, dto)
        return categoryMapper.toModel(data)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteCategory(id) {
      this.isLoading = true
      this.error = null
      try {
        await categoryService.deleteCategory(id)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },
  },
})
