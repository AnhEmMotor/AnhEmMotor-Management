import axiosInstance from './axios'

export const statisticsService = {
  getAdminDashboardOverview: async () => {
    const response = await axiosInstance.get('/api/v1/statistics/dashboard-overview')
    return response.data
  },

  getAdminRevenueAnalysis: async () => {
    const response = await axiosInstance.get('/api/v1/statistics/revenue-analysis')
    return response.data
  },

  getAdminProductReport: async () => {
    const response = await axiosInstance.get('/api/v1/statistics/product-report')
    return response.data
  },

  getAdminWarehouseReport: async () => {
    const response = await axiosInstance.get('/api/v1/statistics/warehouse-report')
    return response.data
  },
}
