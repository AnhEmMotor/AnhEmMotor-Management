import request from "@/common/utils/http";
import type * as Statistical from "@/types/api/statistical";

export interface WorkshopDashboardOverviewResponse {
  kpiCards?: {
    inProgressCount?: number;
    avgCompletionHours?: number;
    cumulativeRevenue?: number;
  };
  analytics?: {
    revenueComparison?: {
      workshopRevenue: number;
      retailRevenue: number;
    };
  };
  alerts?: {
    overdue: any[];
    partsShortage: any[];
  };
  technicianRows?: any[];
  warrantyRequestsCount?: number;
  complaintsCount?: number;
}

export const statisticsApi = {
	getWorkshopDashboardOverview(from?: string, to?: string) {
  const params: Record<string, string> = {};
  if (from) params.from = from;
  if (to) params.to = to;
  return request.get<WorkshopDashboardOverviewResponse>({
    url: "/api/v1/Statistics/workshop-dashboard-overview",
    params: Object.keys(params).length ? params : undefined,
  });
},
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

export interface DashboardKpi {
	totalIncome: number;
	totalExpense: number;
	grossProfit: number;
	netProfit: number;
	incomeChangePercent: number;
	expenseChangePercent: number;
	grossProfitChangePercent: number;
	netProfitChangePercent: number;
}

export interface MonthlyData {
	month: string;
	income: number;
	expense: number;
}

export interface TransactionLog {
	username: string;
	action: string;
	target: string;
	timestamp: string;
}

export interface MonthlyRevenueProfit {
	reportMonth: Date;
	totalRevenue: number;
	totalProfit: number;
	hasZeroCostPrice: boolean;
}

export const fetchDashboardKpis = () => {
	return request.get<DashboardKpi>({
		url: "/api/v1/admin/analytics/dashboard-kpis",
	});
};

export const fetchDashboardSummary = (start: Date, end: Date) => {
	return request.get<any>({
		url: "/api/analytics/dashboard/summary",
		params: { start, end },
	});
};

export const fetchMonthlyRevenueProfit = (months?: number) => {
	return request.get<MonthlyRevenueProfit[]>({
		url: "/api/v1/Statistics/monthly-revenue-profit",
		params: { months },
	});
};

export const fetchStaffPerformance = (start: Date, end: Date) => {
	return request.get<any>({
		url: "/api/analytics/staff-performance",
		params: { start, end },
	});
};

export const fetchRecentTransactions = (limit?: number) => {
	return request.get<any>({
		url: "/api/analytics/transactions/recent",
		params: { limit },
	});
};

export const fetchCustomerAnalytics = () => {
	return request.get<{
		kpi: { totalLeads: number; newCustomers: number; hotLeads: number };
		leads: any[];
	}>({
		url: "/api/v1/Statistics/customer-analytics",
	});
};

export const fetchDashboardStats = () => {
	return request.get<{
		newCustomersCount: number;
		monthlyVehiclesSold: number;
		currentInventoryCount: number;
		pendingOrdersCount: number;
	}>({
		url: "/api/v1/Statistics/dashboard-stats",
	});
};
