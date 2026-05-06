import axiosInstance from '@infrastructure/api/axios'
import { NEWS_ENDPOINTS } from '@constants/endpoints/news.endpoint'

const newsService = {
  async fetchNews(params) {
    const { data } = await axiosInstance.get(NEWS_ENDPOINTS.BASE, { params })
    return data
  },

  async getNewsById(id) {
    const { data } = await axiosInstance.get(NEWS_ENDPOINTS.BY_ID(id))
    return data
  },

  async createNews(payload) {
    const { data } = await axiosInstance.post(NEWS_ENDPOINTS.BASE, payload)
    return data
  },

  async updateNews(id, payload) {
    const { data } = await axiosInstance.put(NEWS_ENDPOINTS.BY_ID(id), payload)
    return data
  },

  async deleteNews(id) {
    const { data } = await axiosInstance.delete(NEWS_ENDPOINTS.BY_ID(id))
    return data
  },

  async uploadCover(file) {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await axiosInstance.post('/api/v1/MediaFile/news/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  }
}

export default newsService



