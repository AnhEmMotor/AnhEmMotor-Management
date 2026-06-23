import request from "@/utils/http";
import type * as Statistical from "@/types/api/statistical";

export const statisticsApi = {
  getDashboardOverview() {
    return request.get<Statistical.AdminDashboardOverviewResponse>({
      url: "/api/v1/Statistics/dashboard-overview",
    });
  },
  getDailyRevenue(days: number = 7) {
    return request.get<Statistical.DailyRevenueResponse[]>({
      url: "/api/v1/Statistics/daily-revenue",
      params: { days },
    });
  },
  getMonthlyRevenueProfit(months: number = 12) {
    return request.get<Statistical.MonthlyRevenueProfitResponse[]>({
      url: "/api/v1/Statistics/monthly-revenue-profit",
      params: { months },
    });
  },
  getOrderStatusCounts() {
    return request.get<Statistical.OrderStatusCountResponse[]>({
      url: "/api/v1/Statistics/order-status-counts",
    });
  },
  getRevenueAnalysis() {
    return request.get<Statistical.AdminRevenueAnalysisResponse>({
      url: "/api/v1/Statistics/revenue-analysis",
    });
  },
  getProductReport() {
    return request.get<Statistical.AdminProductReportResponse>({
      url: "/api/v1/Statistics/product-report",
    });
  },
  getWarehouseReport() {
    return request.get<Statistical.AdminWarehouseReportResponse>({
      url: "/api/v1/Statistics/warehouse-report",
    });
  },
  getProductStockPrice(variantId: number) {
    return request.get<Statistical.ProductStockPriceResponse>({
      url: `/api/v1/Statistics/product-stock-price/${variantId}`,
    });
  },
  getDailyRevenueDetail(reportDay: string, days: number = 7) {
    return request.get<Statistical.DailyRevenueDetailResponse[]>({
      url: "/api/v1/Statistics/daily-revenue/detail",
      params: { reportDay, days },
    });
  },
  getWorkshopOverview() {
    return request.get<Statistical.WorkshopOverviewResponse>({
      url: "/api/v1/Statistics/workshop-overview",
    });
  },
  getFinancingOverview() {
    return request.get<Statistical.FinancingOverviewResponse>({
      url: "/api/v1/Statistics/financing-overview",
    });
  },
  getCustomerAnalytics() {
    return request.get<Statistical.CustomerAnalyticsResponse>({
      url: "/api/v1/Statistics/customer-analytics",
    });
  },
  getCustomerServiceAnalytics() {
    return request.get<Statistical.CustomerServiceAnalyticsResponse>({
      url: "/api/v1/Statistics/customer-service-analytics",
    });
  },
};
