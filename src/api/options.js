import axiosInstance from './axios'

export const getPredefinedOptions = async () => {
  const { data } = await axiosInstance.get('/api/v1/product/predefined-options')
  return data
}

export const getInventoryStatuses = async () => {
  const { data } = await axiosInstance.get('/api/v1/product/inventory-statuses')
  return data
}

export const getGenderOptions = async () => {
  const { data } = await axiosInstance.get('/api/v1/user/gender-options')
  return data
}
