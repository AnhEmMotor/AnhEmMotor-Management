import axiosInstance from '@infrastructure/api/axios'
import { USER_ENDPOINTS } from '@/constants/endpoints/user.endpoint'

const userService = {
  async fetchBasicUsers(params) {
    const { data } = await axiosInstance.get(USER_ENDPOINTS.FOR_OUTPUT, { params })
    return data
  },

  async fetchUsers(params) {
    const { data } = await axiosInstance.get(USER_ENDPOINTS.BASE, { params })
    return data
  },

  async getUserById(id) {
    const { data } = await axiosInstance.get(USER_ENDPOINTS.BY_ID(id))
    return data
  },

  async updateUser(id, payload) {
    const { data } = await axiosInstance.put(USER_ENDPOINTS.BY_ID(id), payload)
    return data
  },

  async resetPassword(id, payload) {
    const { data } = await axiosInstance.post(USER_ENDPOINTS.CHANGE_PASSWORD(id), payload)
    return data
  },

  async assignRoles(id, payload) {
    const { data } = await axiosInstance.post(USER_ENDPOINTS.ASSIGN_ROLES(id), payload)
    return data
  },

  async changeStatus(id, payload) {
    const { data } = await axiosInstance.patch(USER_ENDPOINTS.STATUS(id), payload)
    return data
  },

  async changeMultipleStatus(payload) {
    const { data } = await axiosInstance.patch(USER_ENDPOINTS.STATUS_BATCH, payload)
    return data
  },

  async uploadAvatar(id, payload) {
    const { data } = await axiosInstance.post(USER_ENDPOINTS.AVATAR(id), payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async getGenderOptions() {
    const { data } = await axiosInstance.get('/api/v1/user/gender-options')
    return data
  },
}

export default userService


