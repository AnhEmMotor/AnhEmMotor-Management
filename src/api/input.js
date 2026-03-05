import axiosInstance from './axios'

export const fetchInventoryReceipts = async (params) => {
  const serverParams = {
    Page: params.Page || params.page,
    PageSize: params.PageSize || params.limit,
  }

  const filters = []

  if (params.search) {
    const s = params.search
    if (!isNaN(s) && !isNaN(parseFloat(s))) {
      filters.push(`(Id==${s}|SupplierName@=${s})`)
    } else {
      filters.push(`SupplierName@=${s}`)
    }
  }

  if (params.status) {
    filters.push(`StatusId==${params.status}`)
  }

  if (filters.length > 0) {
    serverParams.filters = filters.join(',')
  }

  const { data } = await axiosInstance.get('/api/v1/InventoryReceipts', { params: serverParams })
  return data
}

export const getInventoryReceiptById = async (id) => {
  const { data } = await axiosInstance.get(`/api/v1/InventoryReceipts/${id}`)
  return data
}

export const createInventoryReceipt = async (payload) => {
  const { data } = await axiosInstance.post('/api/v1/InventoryReceipts', payload)
  return data
}

export const updateInventoryReceipt = async (id, payload) => {
  const { data } = await axiosInstance.put(`/api/v1/InventoryReceipts/${id}`, payload)
  return data
}

export const deleteInventoryReceipt = async (id) => {
  await axiosInstance.delete(`/api/v1/InventoryReceipts/${id}`)
}

export const updateInventoryReceiptStatus = async (id, statusId) => {
  const { data } = await axiosInstance.patch(`/api/v1/InventoryReceipts/${id}/status`, { statusId })
  return data
}

export const cloneInventoryReceipt = async (id) => {
  const { data } = await axiosInstance.post(`/api/v1/InventoryReceipts/${id}/clone`)
  return data
}

export const fetchReceiptsBySupplier = async (supplierId, params) => {
  const { data } = await axiosInstance.get(`/api/v1/InventoryReceipts/by-supplier/${supplierId}`, {
    params,
  })
  return data
}

export const fetchInputStatuses = async () => {
  const { data } = await axiosInstance.get('/api/v1/InventoryReceipts/status')
  return data
}

export const updateInventoryReceiptNotes = async (id, notes) => {
  const { data } = await axiosInstance.patch(`/api/v1/InventoryReceipts/${id}/notes`, { notes })
  return data
}
