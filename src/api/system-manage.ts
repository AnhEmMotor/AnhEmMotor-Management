import request from '@/utils/http'

export function fetchGetUserList(params: {
  Page?: number
  PageSize?: number
  Filters?: string
  Sorts?: string
}): Promise<Api.Common.PaginatedResponse<any>> {
  return request.get<Api.Common.PaginatedResponse<any>>({
    url: '/api/v1/UserManager',
    params
  })
}

export function fetchCreateUser(data: {
  username?: string
  email?: string
  password?: string
  fullName?: string
  phoneNumber?: string
  gender?: string
  roleNames?: string[]
  status?: string
}) {
  return request.post<any>({
    url: '/api/v1/UserManager',
    data
  })
}

export function fetchUpdateUser(
  userId: string,
  data: {
    fullName?: string
    gender?: string
    phoneNumber?: string
    dateOfBirth?: string
  }
) {
  return request.put<any>({
    url: `/api/v1/UserManager/${userId}`,
    data
  })
}

export function fetchAssignUserRoles(userId: string, roleIds: string[]) {
  return request.post<any>({
    url: `/api/v1/UserManager/${userId}/assign-roles`,
    data: { roleIds }
  })
}

export function fetchChangeUserStatus(userId: string, status: string) {
  return request.request<any>({
    url: `/api/v1/UserManager/${userId}/status`,
    method: 'PATCH',
    data: { status }
  })
}

export function fetchDeleteUser(userId: string) {
  return request.del<any>({
    url: `/api/v1/UserManager/${userId}`
  })
}

export function fetchChangeUserPassword(userId: string, newPassword: string) {
  return request.post<any>({
    url: `/api/v1/UserManager/${userId}/change-password`,
    data: { newPassword }
  })
}

export function fetchGetRoleList(params: {
  Page?: number
  PageSize?: number
  Filters?: string
  Sorts?: string
}): Promise<Api.Common.PaginatedResponse<any>> {
  return request.get<Api.Common.PaginatedResponse<any>>({
    url: '/api/v1/Permission/roles',
    params
  })
}

export function fetchGetAllPermissions() {
  return request.get<any[]>({
    url: '/api/v1/Permission/permissions'
  })
}

export function fetchGetPermissionStructure() {
  return request.get<{
    groups: Record<string, string[]>
    conflicts: Record<string, string[]>
    dependencies: Record<string, string[]>
    metadata: Array<{ id: string; name: string; description: string }>
  }>({
    url: '/api/v1/Permission/structure'
  })
}

export function fetchGetRolePermissions(roleId: string) {
  return request.get<string[]>({
    url: `/api/v1/Permission/roles/${roleId}/permissions`
  })
}

export function fetchCreateRole(data: {
  roleName: string
  description: string
  permissions: string[]
}) {
  return request.post<any>({
    url: '/api/v1/Permission/roles',
    data
  })
}

export function fetchUpdateRole(
  roleId: string,
  data: {
    roleName: string
    description: string
    permissions: string[]
  }
) {
  return request.put<any>({
    url: `/api/v1/Permission/roles/${roleId}`,
    data
  })
}

export function fetchDeleteRole(roleId: string) {
  return request.del<any>({
    url: `/api/v1/Permission/roles/${roleId}`
  })
}

export function fetchGetMenuList() {
  return request.get<any[]>({
    url: '/api/v1/v3/system/menus'
  })
}
