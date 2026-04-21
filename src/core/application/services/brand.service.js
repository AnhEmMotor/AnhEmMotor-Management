import axiosInstance from '@infrastructure/api/axios'
import { BRAND_ENDPOINTS } from '@/constants/endpoints/brand.endpoint'

const brandService = {
  async fetchBrands(params) {
    const { data } = await axiosInstance.get(BRAND_ENDPOINTS.BASE, { params })
    return data
  },

  async getBrandById(id) {
    const { data } = await axiosInstance.get(BRAND_ENDPOINTS.BY_ID(id))
    return data
  },

  async createBrand(payload) {
    const { data } = await axiosInstance.post(BRAND_ENDPOINTS.BASE, payload)
    return data
  },

  async updateBrand(id, payload) {
    const { data } = await axiosInstance.put(BRAND_ENDPOINTS.BY_ID(id), payload)
    return data
  },

  async deleteBrand(id) {
    const { data } = await axiosInstance.delete(BRAND_ENDPOINTS.BY_ID(id))
    return data
  },
}

export default brandService


