import axiosInstance from './axios';

export const fetchSalesOrders = async (params) => {
  const { data } = await axiosInstance.get('/api/v1/SalesOrders', { params });
  return data;
};

export const getSalesOrderById = async (id) => {
  const { data } = await axiosInstance.get(`/api/v1/SalesOrders/for-manager/${id}`);
  return data;
};

export const createSalesOrder = async (payload) => {
  const { data } = await axiosInstance.post('/api/v1/SalesOrders/by-manager', payload);
  return data;
};

export const updateSalesOrder = async (id, payload) => {
  const { data } = await axiosInstance.put(`/api/v1/SalesOrders/for-manager/${id}`, payload);
  return data;
};

export const deleteSalesOrder = async (id) => {
  await axiosInstance.delete(`/api/v1/SalesOrders/${id}`);
};

export const updateSalesOrderStatus = async (id, statusId) => {
  const { data } = await axiosInstance.patch(`/api/v1/SalesOrders/${id}/status`, { statusId });
  return data;
};

export const fetchOutputStatuses = async () => {
  const { data } = await axiosInstance.get('/api/v1/SalesOrders/status');
  return data;
};
