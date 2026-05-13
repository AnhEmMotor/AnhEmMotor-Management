import axiosInstance from '@infrastructure/api/axios'
import { CATEGORY_ENDPOINTS } from '@constants/endpoints/category.endpoint'

const categoryService = {
  // Dùng cho form thêm/sửa sản phẩm - trả TẤT CẢ thể loại (kể cả Xe máy, Xe tay ga...)
  async fetchCategories(params) {
    const { data } = await axiosInstance.get(CATEGORY_ENDPOINTS.BASE, { params })
    return data
  },

  // Dùng cho bảng quản lý thể loại sản phẩm - chỉ trả CategoryGroup="Product"
  async fetchCategoriesForManager(params) {
    const { data } = await axiosInstance.get(CATEGORY_ENDPOINTS.FOR_MANAGER, { params })
    return data
  },

  async getCategoryById(id) {
    const { data } = await axiosInstance.get(CATEGORY_ENDPOINTS.BY_ID(id))
    return data
  },

  async createCategory(payload) {
    const { data } = await axiosInstance.post(CATEGORY_ENDPOINTS.BASE, payload)
    return data
  },

  async updateCategory(id, payload) {
    const { data } = await axiosInstance.put(CATEGORY_ENDPOINTS.BY_ID(id), payload)
    return data
  },

  async deleteCategory(id) {
    const { data } = await axiosInstance.delete(CATEGORY_ENDPOINTS.BY_ID(id))
    return data
  },
}

export default categoryService



