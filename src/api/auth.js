import axiosInstance from './axios'

export const loginManager = async (credentials) => {
  const { data } = await axiosInstance.post('/api/v1/auth/login/for-manager', credentials)
  return data
}

export const logoutUser = async () => {
  const { data } = await axiosInstance.post('/api/v1/auth/logout')
  return data
}

export const fetchMe = async () => {
  const { data } = await axiosInstance.get('/api/v1/user/me')
  return data
}

export const refreshToken = async () => {
  const { data } = await axiosInstance.post('/api/v1/auth/refresh-token')
  return data
}
export const updateProfile = async (payload) => {
  const { data } = await axiosInstance.put('/api/v1/user/me', payload)
  return data
}

export const changePassword = async (payload) => {
  const { data } = await axiosInstance.post('/api/v1/user/change-password', payload)
  return data
}

export const uploadAvatar = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await axiosInstance.post('/api/v1/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}
