import { defineStore } from 'pinia'
import roleService from '@/services/roleService'
import roleMapper from '@/mappers/roleMapper'

export const useRoleStore = defineStore('role', {
  state: () => ({
    structure: null,
  }),

  actions: {
    async fetchRoles(query) {
      const params = roleMapper.toParams(query)
      const data = await roleService.fetchRoles(params)
      return {
        data: roleMapper.toList(data),
        pagination: roleMapper.toPagination(data),
      }
    },

    async fetchPermissionStructure() {
      if (this.structure) return this.structure
      const data = await roleService.fetchPermissionStructure()
      this.structure = roleMapper.toPermissionStructure(data)
      return this.structure
    },

    async fetchRolePermissions(roleId) {
      return await roleService.fetchRolePermissions(roleId)
    },

    async createRole(roleData) {
      const payload = roleMapper.toCreatePayload(roleData)
      return await roleService.createRole(payload)
    },

    async updateRole(id, roleData) {
      const payload = roleMapper.toUpdatePayload(roleData)
      return await roleService.updateRole(id, payload)
    },

    async deleteRole(id) {
      return await roleService.deleteRole(id)
    },

    /**
     * Logic trung gian để xử lý toggle quyền dựa trên cấu trúc hiện tại
     */
    resolveTogglePermission(currentPermissions, permissionId) {
      if (!this.structure) return currentPermissions
      return roleMapper.resolveTogglePermission(currentPermissions, permissionId, this.structure)
    },

    /**
     * Logic trung gian để xử lý chọn tất cả quyền trong một nhóm
     */
    resolveSelectAllInCategory(currentPermissions, categoryPermissions) {
      if (!this.structure) return currentPermissions
      return roleMapper.resolveSelectAllInCategory(
        currentPermissions,
        categoryPermissions,
        this.structure,
      )
    },
  },
})
