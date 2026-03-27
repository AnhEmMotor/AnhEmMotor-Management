import axiosInstance from '@/api/axios'
import { PRODUCT_ENDPOINTS } from '@/constants/endpoints/product'

const productService = {
  async fetchProducts(params) {
    const { data } = await axiosInstance.get(PRODUCT_ENDPOINTS.FOR_MANAGER, { params })
    return data
  },

  async getProductsForPriceManagement(params) {
    const { data } = await axiosInstance.get(PRODUCT_ENDPOINTS.FOR_PRICE_MANAGEMENT, { params })
    return data
  },

  async getProductById(id) {
    const { data } = await axiosInstance.get(PRODUCT_ENDPOINTS.BY_ID(id))
    return data
  },

  async createProduct(payload) {
    const { data } = await axiosInstance.post(PRODUCT_ENDPOINTS.BASE, payload)
    return data
  },

  async updateProduct(id, payload) {
    const { data } = await axiosInstance.put(PRODUCT_ENDPOINTS.UPDATE_BY_ID(id), payload)
    return data
  },

  async deleteProduct(id) {
    const { data } = await axiosInstance.delete(PRODUCT_ENDPOINTS.UPDATE_BY_ID(id))
    return data
  },

  async updateStatus(id, statusId) {
    const { data } = await axiosInstance.patch(PRODUCT_ENDPOINTS.STATUS(id), { id, statusId })
    return data
  },

  async updatePrice(id, price) {
    const { data } = await axiosInstance.patch(PRODUCT_ENDPOINTS.PRICE(id), { id, price })
    return data
  },
  async updateVariantPrice(id, price) {
    const { data } = await axiosInstance.patch(PRODUCT_ENDPOINTS.VARIANT_PRICE(id), { id, price })
    return data
  },

  async checkSlug(slug) {
    const { data } = await axiosInstance.get(PRODUCT_ENDPOINTS.CHECK_SLUG, { params: { slug } })
    return data
  },

  async getVariantsLite(type = 'manager', params = {}) {
    let url = PRODUCT_ENDPOINTS.VARIANTS_LITE.FOR_MANAGER
    if (type === 'input') url = PRODUCT_ENDPOINTS.VARIANTS_LITE.FOR_INPUT
    if (type === 'output') url = PRODUCT_ENDPOINTS.VARIANTS_LITE.FOR_OUTPUT

    const { data } = await axiosInstance.get(url, { params })
    return data
  },

  async fetchVariantsLiteForOutput({ page, limit, search } = {}) {
    const params = { Page: page, PageSize: limit }
    if (search) params.Filters = `search@=${search}`
    const data = await this.getVariantsLite('output', params)
    return {
      data: data.items || [],
      pagination: {
        totalPages: data.totalPages || 1,
        totalCount: data.totalCount || 0,
      },
    }
  },

  async fetchVariantsLiteForInput({ page, limit, search } = {}) {
    const params = { Page: page, PageSize: limit }
    if (search) params.Filters = `search@=${search}`
    const data = await this.getVariantsLite('input', params)
    return {
      data: data.items || [],
      pagination: {
        totalPages: data.totalPages || 1,
        totalCount: data.totalCount || 0,
      },
    }
  },

  // Media & options logic merged from tool files
  async uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await axiosInstance.post('/api/v1/mediafile/product/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async uploadImages(files) {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    const { data } = await axiosInstance.post('/api/v1/mediafile/product/upload-many', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async deleteImage(storagePath) {
    await axiosInstance.delete(`/api/v1/mediafile/product/${storagePath}`)
  },

  async getPredefinedOptions() {
    const { data } = await axiosInstance.get('/api/v1/product/predefined-options')
    return data
  },

  async getInventoryStatuses() {
    const { data } = await axiosInstance.get('/api/v1/product/inventory-statuses')
    return data
  },
}

export default productService
