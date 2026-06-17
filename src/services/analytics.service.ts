import api from '@/utils/http'
import type {
  DashboardSummary,
  PnlReport,
  StaffPerformance,
  Expense,
  TransactionLog,
} from './analytics.types'

const API_BASE = '/api'

export const AnalyticsService = {
  // Dashboard
  async getDashboardSummary(start?: string, end?: string): Promise<DashboardSummary> {
    return api.get<DashboardSummary>({
      url: `${API_BASE}/analytics/dashboard/summary`,
      params: { start, end },
    })
  },

  async getRecentTransactions(): Promise<TransactionLog[]> {
    return api.get<TransactionLog[]>({
      url: `${API_BASE}/analytics/transactions/recent`,
    })
  },

  // P&L
  async getPnlReport(month: number, year: number): Promise<PnlReport> {
    return api.get<PnlReport>({
      url: `${API_BASE}/analytics/pnl`,
      params: { month, year },
    })
  },

  // Staff
  async getStaffPerformance(start?: string, end?: string): Promise<StaffPerformance[]> {
    return api.get<StaffPerformance[]>({
      url: `${API_BASE}/analytics/staff-performance`,
      params: { start, end },
    })
  },

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    return api.get<Expense[]>({
      url: `${API_BASE}/expense`,
    })
  },

  async createExpense(expense: Partial<Expense>): Promise<Expense> {
    return api.post<Expense>({
      url: `${API_BASE}/expense`,
      data: expense,
    })
  },

  async deleteExpense(id: number): Promise<void> {
    return api.del({
      url: `${API_BASE}/expense/${id}`,
    })
  },
}
