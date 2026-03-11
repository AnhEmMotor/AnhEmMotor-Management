import axiosInstance from './axios'

const BASE_URL = '/api/v1/mediafile'

export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await axiosInstance.post(`${BASE_URL}/product/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const uploadImages = async (files) => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  const { data } = await axiosInstance.post(`${BASE_URL}/product/upload-many`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const getViewUrl = (storagePath, width) => {
  const base = `${BASE_URL}/view-image/${storagePath}`
  return width ? `${base}?width=${width}` : base
}

export const deleteImage = async (storagePath) => {
  await axiosInstance.delete(`${BASE_URL}/product/${storagePath}`)
}
