import request from "@/common/utils/http";

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

export interface WorkshopStats {
  received: number;
  inProgress: number;
  completed: number;
  cancelled: number;
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
    url: "/api/v1/statistics/monthly-revenue-profit",
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

export const fetchWorkshopOverview = (fromDate: Date, toDate: Date) => {
  return request.get<any>({
    url: "/api/workshop/dashboard/overview",
    params: { fromDate, toDate },
  });
};
