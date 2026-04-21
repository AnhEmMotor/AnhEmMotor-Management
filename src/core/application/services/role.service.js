import axiosInstance from '@infrastructure/api/axios'
import { ROLE_ENDPOINTS } from '@/constants/endpoints/role.endpoint'

const roleService = {
  async fetchRoles(params) {
    const { data } = await axiosInstance.get(ROLE_ENDPOINTS.ROLES, { params })
    return data
  },

  async fetchRolePermissions(roleId) {
    const { data } = await axiosInstance.get(ROLE_ENDPOINTS.ROLE_PERMISSIONS(roleId))
    return data
  },

  async createRole(payload) {
    const { data } = await axiosInstance.post(ROLE_ENDPOINTS.ROLES, payload)
    return data
  },

  async updateRole(id, payload) {
    const { data } = await axiosInstance.put(ROLE_ENDPOINTS.ROLE_BY_ID(id), payload)
    return data
  },

  async deleteRole(id) {
    const { data } = await axiosInstance.delete(ROLE_ENDPOINTS.ROLE_BY_ID(id))
    return data
  },

  async deleteMultipleRoles(roleNames) {
    const { data } = await axiosInstance.post(ROLE_ENDPOINTS.BATCH_DELETE, roleNames)
    return data
  },

  async fetchPermissionStructure() {
    const { data } = await axiosInstance.get(ROLE_ENDPOINTS.STRUCTURE)
    return data
  },

  async fetchUserPermissions(userId) {
    const { data } = await axiosInstance.get(ROLE_ENDPOINTS.USER_PERMISSIONS(userId))
    return data
  },
}

export default roleService


