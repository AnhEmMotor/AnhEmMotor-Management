import axiosInstance from '@infrastructure/api/axios'
import { STATISTICS_ENDPOINTS } from '@constants/endpoints/statistics.endpoint'

const statisticsService = {
  async getAdminDashboardOverview() {
    const { data } = await axiosInstance.get(STATISTICS_ENDPOINTS.DASHBOARD_OVERVIEW)
    return data
  },

  async getAdminRevenueAnalysis() {
    const { data } = await axiosInstance.get(STATISTICS_ENDPOINTS.REVENUE_ANALYSIS)
    return data
  },

  async getAdminProductReport() {
    const { data } = await axiosInstance.get(STATISTICS_ENDPOINTS.PRODUCT_REPORT)
    return data
  },

  async getAdminWarehouseReport() {
    const { data } = await axiosInstance.get(STATISTICS_ENDPOINTS.WAREHOUSE_REPORT)
    return data
  },
}

export default statisticsService



