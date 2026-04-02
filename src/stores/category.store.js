import { defineStore } from 'pinia'
import { ref } from 'vue'
import categoryService from '@/services/category.service'
import categoryMapper from '@/mappers/category.mapper'

export const useCategoryStore = defineStore('category', () => {
  const isLoading = ref(false)
  const error = ref(null)

  const fetchCategories = async (query) => {
    isLoading.value = true
    error.value = null
    try {
      const params = categoryMapper.toParams(query)
      const data = await categoryService.fetchCategories(params)
      return {
        data: categoryMapper.toList(data),
        pagination: categoryMapper.toPagination(data),
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getAllCategories = async (params = { PageSize: 1000 }) => {
    isLoading.value = true
    try {
      const data = await categoryService.fetchCategories(params)
      return categoryMapper.toList(data)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getCategoryById = async (id) => {
    isLoading.value = true
    try {
      const data = await categoryService.getCategoryById(id)
      return categoryMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const addCategory = async (category) => {
    isLoading.value = true
    error.value = null
    try {
      const dto = categoryMapper.toDTO(category)
      const data = await categoryService.createCategory(dto)
      return categoryMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateCategory = async ({ id, category }) => {
    isLoading.value = true
    error.value = null
    try {
      const dto = categoryMapper.toDTO(category)
      const data = await categoryService.updateCategory(id, dto)
      return categoryMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteCategory = async (id) => {
    isLoading.value = true
    error.value = null
    try {
      await categoryService.deleteCategory(id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    fetchCategories,
    getAllCategories,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory,
  }
})
