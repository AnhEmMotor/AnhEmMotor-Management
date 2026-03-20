import axiosInstance from './axios'

const BASE_URL = '/api/v1/UserManager'

export const fetchBasicUsers = async ({ page, limit, search }) => {
  const params = {
    Page: page,
    PageSize: limit,
  }

  const filters = []
  if (search) {
    if (search.includes('@')) {
      filters.push(`Email@=${search}`)
    } else {
      filters.push(`FullName@=${search}|Email@=${search}|PhoneNumber@=${search}`)
    }
  }

  if (filters.length > 0) {
    params.filters = filters.join(',')
  }

  const { data } = await axiosInstance.get(`${BASE_URL}/for-output`, { params })

  return {
    data: data.items,
    pagination: {
      totalPages: data.totalPages,
      totalCount: data.totalCount,
    },
  }
}
export const fetchUsers = async (params) => {
  const { data } = await axiosInstance.get(BASE_URL, { params })
  return {
    data: data.items,
    pagination: {
      totalPages: data.totalPages,
      totalCount: data.totalCount,
    },
  }
}

export const getUserById = async (userId) => {
  const { data } = await axiosInstance.get(`${BASE_URL}/${userId}`)
  return data
}

export const updateUser = async (userId, payload) => {
  const { data } = await axiosInstance.put(`${BASE_URL}/${userId}`, payload)
  return data
}

export const changePassword = async (userId, payload) => {
  const { data } = await axiosInstance.post(`${BASE_URL}/${userId}/change-password`, payload)
  return data
}

export const assignRoles = async (userId, payload) => {
  const { data } = await axiosInstance.post(`${BASE_URL}/${userId}/assign-roles`, payload)
  return data
}

export const changeStatus = async (userId, payload) => {
  const { data } = await axiosInstance.patch(`${BASE_URL}/${userId}/status`, payload)
  return data
}

export const changeMultipleStatus = async (payload) => {
  const { data } = await axiosInstance.patch(`${BASE_URL}/status`, payload)
  return data
}

export const uploadUserAvatar = async (userId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await axiosInstance.post(`${BASE_URL}/${userId}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}
