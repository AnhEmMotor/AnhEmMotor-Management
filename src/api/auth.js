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
