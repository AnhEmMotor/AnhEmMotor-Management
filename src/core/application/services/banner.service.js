import axiosInstance from '@infrastructure/api/axios'
import { BANNER_ENDPOINTS } from '@constants/endpoints/banner.endpoint'

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
    const mapped = {
      title: payload.title,
      desktop_image_url: payload.desktopImageUrl,
      mobile_image_url: payload.mobileImageUrl,
      link_url: payload.linkUrl,
      cta_text: payload.ctaText,
      placement: payload.placement,
      start_date: payload.startDate,
      end_date: payload.endDate,
      is_active: payload.isActive,
      priority: payload.priority
    }
    const { data } = await axiosInstance.post(BANNER_ENDPOINTS.BASE, mapped)
    return data
  },

  async updateBanner(id, payload) {
    const mapped = {
      id: payload.id || id,
      title: payload.title,
      desktop_image_url: payload.desktopImageUrl,
      mobile_image_url: payload.mobileImageUrl,
      link_url: payload.linkUrl,
      cta_text: payload.ctaText,
      placement: payload.placement,
      start_date: payload.startDate,
      end_date: payload.endDate,
      is_active: payload.isActive,
      priority: payload.priority
    }
    const { data } = await axiosInstance.put(BANNER_ENDPOINTS.BY_ID(id), mapped)
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
  },

  async fetchAuditLogs(id) {
    const { data } = await axiosInstance.get(`${BANNER_ENDPOINTS.BASE}/${id}/audit`)
    return data
  }
}

export default bannerService



