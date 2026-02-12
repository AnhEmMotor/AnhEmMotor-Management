import axiosInstance from './axios'

const BASE_URL = '/api/v1/supplier'

export const fetchSuppliers = async ({ page, limit, search, status }) => {
  const params = {
    Page: page,
    PageSize: limit,
  }

  const filters = []
  if (search) {
    filters.push(`Name@=${search}`)
  }
  if (status) {
    const statusArray = Array.isArray(status) ? status : status.split(',')

    if (statusArray.length === 1 && statusArray[0]) {
      filters.push(`StatusId==${statusArray[0]}`)
    }
  }

  if (filters.length > 0) {
    params.filters = filters.join(',')
  }
  const { data } = await axiosInstance.get(BASE_URL, { params })
  return {
    data: data.items,
    pagination: {
      totalPages: data.totalPages,
      totalCount: data.totalCount,
    },
  }
}

export const createSupplier = async (supplier) => {
  const { data } = await axiosInstance.post(BASE_URL, supplier)
  return data
}

export const updateSupplier = async (id, supplier) => {
  const { data } = await axiosInstance.put(`${BASE_URL}/${id}`, supplier)
  return data
}

export const deleteSupplier = async (id) => {
  const { data } = await axiosInstance.delete(`${BASE_URL}/${id}`)
  return data
}

export const updateSupplierStatus = async (id, statusId) => {
  const { data } = await axiosInstance.patch(`${BASE_URL}/${id}/status`, { statusId })
  return data
}

export const getSupplierById = async (id) => {
  if (!id) throw new Error('id is required')
  const { data } = await axiosInstance.get(`${BASE_URL}/${id}`)
  return data
}

export const searchActiveSuppliers = async (search = '') => {
  const params = {
    Search: search,
    StatusId: 'active',
    PageSize: 50,
  }
  const { data } = await axiosInstance.get(BASE_URL, { params })
  return (data.items || []).map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
  }))
}
