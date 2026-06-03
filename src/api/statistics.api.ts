import request from '@/utils/http'
import type { AdminDashboardOverviewResponse } from '@/types/api/statistical'

export const statisticsApi = {
  getDashboardOverview() {
    return request.get<AdminDashboardOverviewResponse>({
      url: '/api/v1/Statistics/dashboard-overview',
    })
  },
  getDailyRevenue(days: number = 7) {
    return request.get<any[]>({
      url: '/api/v1/Statistics/daily-revenue',
      params: { days },
    })
  },
  getMonthlyRevenueProfit(months: number = 12) {
    return request.get<any[]>({
      url: '/api/v1/Statistics/monthly-revenue-profit',
      params: { months },
    })
  },
  getOrderStatusCounts() {
    return request.get<any[]>({
      url: '/api/v1/Statistics/order-status-counts',
    })
  },
}
