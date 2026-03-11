import axiosInstance from './axios'

const BASE_URL = '/api/v1/setting'

export const fetchSettings = async () => {
  const { data } = await axiosInstance.get(BASE_URL)
  return data
}

export const updateSettings = async (settings) => {
  const { data } = await axiosInstance.put(BASE_URL, settings)
  return data
}
