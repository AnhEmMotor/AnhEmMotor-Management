import axiosInstance from './axios'

const BASE_URL = '/api/v1/Permission'

export const fetchRoles = async (params) => {
  const { data } = await axiosInstance.get(`${BASE_URL}/roles`, { params })
  return {
    data: data.items,
    pagination: {
      totalPages: data.totalPages,
      totalCount: data.totalCount,
    },
  }
}

export const fetchRolePermissions = async (roleId) => {
  const { data } = await axiosInstance.get(
    `${BASE_URL}/roles/${encodeURIComponent(roleId)}/permissions`,
  )
  return data
}

export const createRole = async (payload) => {
  const { data } = await axiosInstance.post(`${BASE_URL}/roles`, payload)
  return data
}

export const updateRole = async ({ roleId, ...payload }) => {
  const { data } = await axiosInstance.put(
    `${BASE_URL}/roles/${encodeURIComponent(roleId)}`,
    payload,
  )
  return data
}

export const deleteRole = async (roleId) => {
  const { data } = await axiosInstance.delete(`${BASE_URL}/roles/${encodeURIComponent(roleId)}`)
  return data
}

export const deleteMultipleRoles = async (roleNames) => {
  const { data } = await axiosInstance.post(`${BASE_URL}/roles/delete-multiple`, roleNames)
  return data
}

export const fetchPermissionStructure = async () => {
  const { data } = await axiosInstance.get(`${BASE_URL}/structure`)
  return data
}

export const fetchUserPermissions = async (userId) => {
  const { data } = await axiosInstance.get(`${BASE_URL}/users/${userId}/permissions`)
  return data
}
