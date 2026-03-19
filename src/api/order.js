import axiosInstance from './axios'

export const fetchSalesOrders = async (params) => {
  const { data } = await axiosInstance.get('/api/v1/SalesOrders', { params })
  return data
}

export const getSalesOrderById = async (id) => {
  const { data } = await axiosInstance.get(`/api/v1/SalesOrders/${id}`)
  return data
}

export const createSalesOrder = async (payload) => {
  const mappedPayload = {
    BuyerId: payload.customer?.id,
    StatusId: payload.status?.key,
    Notes: payload.notes,
    CustomerName: payload.customerName,
    CustomerAddress: payload.customerAddress,
    CustomerPhone: payload.customerPhone,
    products: (payload.products || []).map((p) => ({
      ProductId: p.product_id,
      Count: p.quantity,
    })),
  }
  const { data } = await axiosInstance.post('/api/v1/SalesOrders/by-manager', mappedPayload)
  return data
}

export const updateSalesOrder = async (id, payload) => {
  const mappedPayload = {
    BuyerId: payload.customer?.id,
    StatusId: payload.status?.key,
    Notes: payload.notes,
    CustomerName: payload.customerName,
    CustomerAddress: payload.customerAddress,
    CustomerPhone: payload.customerPhone,
    products: (payload.products || []).map((p) => ({
      Id: typeof p.id === 'number' && p.id > 2000000000000 ? undefined : p.id,
      ProductId: p.product_id,
      Count: p.quantity,
    })),
  }
  const { data } = await axiosInstance.put(`/api/v1/SalesOrders/for-manager/${id}`, mappedPayload)
  return data
}

export const deleteSalesOrder = async (id) => {
  await axiosInstance.delete(`/api/v1/SalesOrders/${id}`)
}

export const updateSalesOrderStatus = async (id, statusId) => {
  const { data } = await axiosInstance.patch(`/api/v1/SalesOrders/${id}/status`, { statusId })
  return data
}

export const fetchOutputStatuses = async () => {
  const { data } = await axiosInstance.get('/api/v1/SalesOrders/status')
  return data
}
export const fetchOrderStatusMap = async () => {
  const { data } = await axiosInstance.get('/api/v1/SalesOrders/status-map')
  return data
}

export const fetchOrderTransitionMap = async () => {
  const { data } = await axiosInstance.get('/api/v1/SalesOrders/transition-map')
  return data
}
export const fetchLockedStatuses = async () => {
  const { data } = await axiosInstance.get('/api/v1/SalesOrders/locked-statuses')
  return data
}
