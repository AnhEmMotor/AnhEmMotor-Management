import axiosInstance from '@/api/axios'
import { USER_ENDPOINTS } from '@/constants/endpoints/user.endpoint'

const userService = {
  /**
   * Lấy danh sách người dùng cơ bản (để chọn làm filter, assignee, v.v.)
   */
  async fetchBasicUsers(params) {
    const { data } = await axiosInstance.get(USER_ENDPOINTS.FOR_OUTPUT, { params })
    return data
  },

  /**
   * Lấy danh sách người dùng đầy đủ có phân trang
   */
  async fetchUsers(params) {
    const { data } = await axiosInstance.get(USER_ENDPOINTS.BASE, { params })
    return data
  },

  /**
   * Lấy thông tin chi tiết người dùng qua ID
   */
  async getUserById(id) {
    const { data } = await axiosInstance.get(USER_ENDPOINTS.BY_ID(id))
    return data
  },

  /**
   * Cập nhật thông tin cơ bản của người dùng (Admin hành động)
   */
  async updateUser(id, payload) {
    const { data } = await axiosInstance.put(USER_ENDPOINTS.BY_ID(id), payload)
    return data
  },

  /**
   * Đặt lại mật khẩu người dùng (Admin hành động)
   */
  async resetPassword(id, payload) {
    const { data } = await axiosInstance.post(USER_ENDPOINTS.CHANGE_PASSWORD(id), payload)
    return data
  },

  /**
   * Gán vai trò cho người dùng
   */
  async assignRoles(id, payload) {
    const { data } = await axiosInstance.post(USER_ENDPOINTS.ASSIGN_ROLES(id), payload)
    return data
  },

  /**
   * Cập nhật trạng thái người dùng (Hoạt động/Khóa)
   */
  async changeStatus(id, payload) {
    const { data } = await axiosInstance.patch(USER_ENDPOINTS.STATUS(id), payload)
    return data
  },

  /**
   * Cập nhật trạng thái hàng loạt
   */
  async changeMultipleStatus(payload) {
    const { data } = await axiosInstance.patch(USER_ENDPOINTS.STATUS_BATCH, payload)
    return data
  },

  /**
   * Cập nhật ảnh đại diện của người dùng
   */
  async uploadAvatar(id, payload) {
    const { data } = await axiosInstance.post(USER_ENDPOINTS.AVATAR(id), payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
  /**
   * Lấy danh sách tùy chọn giới tính
   */
  async getGenderOptions() {
    const { data } = await axiosInstance.get('/api/v1/user/gender-options')
    return data
  },
}

export default userService
