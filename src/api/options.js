import axiosInstance from './axios'

const BASE_URL = '/api/v1/PredefinedOption'

export const getPredefinedOptions = async () => {
  const { data } = await axiosInstance.get(BASE_URL)
  return data
}

export const getInventoryStatuses = async () => {
  const { data } = await axiosInstance.get(`${BASE_URL}/inventory-statuses`)
  return data
}

export const getGenderOptions = async () => {
  const { data } = await axiosInstance.get(`${BASE_URL}/gender-options`)
  return data
}
