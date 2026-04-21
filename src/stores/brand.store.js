import { defineStore } from 'pinia'
import { ref } from 'vue'
import brandService from '@application/services/brand.service'
import brandMapper from '@infrastructure/mappers/brand.mapper'

export const useBrandStore = defineStore('brand', () => {
  const isLoading = ref(false)
  const error = ref(null)

  const fetchBrands = async (query) => {
    isLoading.value = true
    error.value = null
    try {
      const params = brandMapper.toParams(query)
      const data = await brandService.fetchBrands(params)
      return {
        data: brandMapper.toList(data),
        pagination: brandMapper.toPagination(data),
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getAllBrands = async (params = { PageSize: 1000 }) => {
    isLoading.value = true
    try {
      const data = await brandService.fetchBrands(params)
      return brandMapper.toList(data)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getBrandById = async (id) => {
    isLoading.value = true
    try {
      const data = await brandService.getBrandById(id)
      return brandMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const addBrand = async (brand) => {
    isLoading.value = true
    error.value = null
    try {
      const dto = brandMapper.toDTO(brand)
      const data = await brandService.createBrand(dto)
      return brandMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateBrand = async ({ id, brand }) => {
    isLoading.value = true
    error.value = null
    try {
      const dto = brandMapper.toDTO(brand)
      const data = await brandService.updateBrand(id, dto)
      return brandMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteBrand = async (id) => {
    isLoading.value = true
    error.value = null
    try {
      await brandService.deleteBrand(id)
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
    fetchBrands,
    getAllBrands,
    getBrandById,
    addBrand,
    updateBrand,
    deleteBrand,
  }
})




