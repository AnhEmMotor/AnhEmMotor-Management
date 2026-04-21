import axiosInstance from '@infrastructure/api/axios'
import { BANNER_ENDPOINTS } from '@/constants/endpoints/banner.endpoint'

const bannerService = {
  async fetchBanners() {
    const { data } = await axiosInstance.get(BANNER_ENDPOINTS.BASE)
    return data
  },

  async getActiveBanners() {
    const { data } = await axiosInstance.get(BANNER_ENDPOINTS.ACTIVE)
    return data
  },

  async createBanner(payload) {
    const { data } = await axiosInstance.post(BANNER_ENDPOINTS.BASE, payload)
    return data
  },

  async updateBanner(id, payload) {
    const { data } = await axiosInstance.put(BANNER_ENDPOINTS.BY_ID(id), payload)
    return data
  },

  async deleteBanner(id) {
    const { data } = await axiosInstance.delete(BANNER_ENDPOINTS.BY_ID(id))
    return data
  },

  async uploadBannerImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await axiosInstance.post('/api/v1/mediafile/banner/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  }
}

export default bannerService


