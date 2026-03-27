import { defineStore } from 'pinia'
import { ref } from 'vue'
import roleService from '@/services/roleService'
import roleMapper from '@/mappers/roleMapper'

export const useRoleStore = defineStore('role', () => {
  const structure = ref(null)

  const fetchRoles = async (query) => {
    const params = roleMapper.toParams(query)
    const data = await roleService.fetchRoles(params)
    return {
      data: roleMapper.toList(data),
      pagination: roleMapper.toPagination(data),
    }
  }

  const fetchPermissionStructure = async () => {
    if (structure.value) return structure.value
    const data = await roleService.fetchPermissionStructure()
    structure.value = roleMapper.toPermissionStructure(data)
    return structure.value
  }

  const fetchRolePermissions = async (roleId) => {
    return await roleService.fetchRolePermissions(roleId)
  }

  const createRole = async (roleData) => {
    const payload = roleMapper.toCreatePayload(roleData)
    return await roleService.createRole(payload)
  }

  const updateRole = async (id, roleData) => {
    const payload = roleMapper.toUpdatePayload(roleData)
    return await roleService.updateRole(id, payload)
  }

  const deleteRole = async (id) => {
    return await roleService.deleteRole(id)
  }

  /**
   * Logic trung gian để xử lý toggle quyền dựa trên cấu trúc hiện tại
   */
  const resolveTogglePermission = (currentPermissions, permissionId) => {
    if (!structure.value) return currentPermissions
    return roleMapper.resolveTogglePermission(currentPermissions, permissionId, structure.value)
  }

  /**
   * Logic trung gian để xử lý chọn tất cả quyền trong một nhóm
   */
  const resolveSelectAllInCategory = (currentPermissions, categoryPermissions) => {
    if (!structure.value) return currentPermissions
    return roleMapper.resolveSelectAllInCategory(
      currentPermissions,
      categoryPermissions,
      structure.value,
    )
  }

  return {
    structure,
    fetchRoles,
    fetchPermissionStructure,
    fetchRolePermissions,
    createRole,
    updateRole,
    deleteRole,
    resolveTogglePermission,
    resolveSelectAllInCategory,
  }
})
