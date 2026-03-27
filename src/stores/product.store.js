import { defineStore } from 'pinia'
import { ref } from 'vue'
import productService from '@/services/productService'
import productMapper from '@/mappers/productMapper'

export const useProductStore = defineStore('product', () => {
  const isLoading = ref(false)
  const error = ref(null)
  const options = ref([])
  const optionValues = ref([])

  // Product Actions
  const fetchProducts = async (query) => {
    error.value = null
    try {
      const params = productMapper.toParams(query)
      const data = await productService.fetchProducts(params)
      return {
        data: productMapper.toList(data),
        pagination: productMapper.toPagination(data),
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const getProductById = async (id) => {
    isLoading.value = true
    try {
      const data = await productService.getProductById(id)
      return productMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const addProduct = async (product) => {
    isLoading.value = true
    error.value = null
    try {
      const dto = productMapper.toDTO(product)
      const data = await productService.createProduct(dto)
      return productMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateProduct = async (id, product) => {
    isLoading.value = true
    error.value = null
    try {
      const dto = productMapper.toDTO(product)
      const data = await productService.updateProduct(id, dto)
      return productMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteProduct = async (id) => {
    isLoading.value = true
    error.value = null
    try {
      await productService.deleteProduct(id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateStatus = async (id, statusId) => {
    isLoading.value = true
    try {
      const data = await productService.updateStatus(id, statusId)
      return productMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateProductPrice = async (id, price) => {
    isLoading.value = true
    try {
      return await productService.updatePrice(id, price)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateVariantPrice = async (id, price) => {
    isLoading.value = true
    try {
      return await productService.updateVariantPrice(id, price)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const searchVariantsLiteForOutput = async (params) => {
    return await productService.fetchVariantsLiteForOutput(params)
  }

  // Options & OptionValues Actions (Merged)
  const fetchOptions = async () => {
    isLoading.value = true
    try {
      const data = await productService.getPredefinedOptions()
      options.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Media Actions (Merged)
  const uploadImage = async (file) => {
    return await productService.uploadImage(file)
  }

  return {
    isLoading,
    error,
    options,
    optionValues,
    fetchProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStatus,
    updateProductPrice,
    updateVariantPrice,
    searchVariantsLiteForOutput,
    fetchOptions,
    uploadImage,
  }
})
