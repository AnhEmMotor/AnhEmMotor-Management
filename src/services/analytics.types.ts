export interface DashboardSummary {
  totalRevenue: number
  revenueVsYesterdayPercentage: number
  dailyTarget: number

  netProfit: number
  profitMargin: number
  profitVsYesterdayPercentage: number

  pendingAmount: number
  depositAmount: number
  loanWaitAmount: number

  alertsCount: number
  newComplaintsCount: number
  delayedLoansCount: number
  lowStockVehiclesCount: number
  missedAppointmentsCount: number

  monthTarget: number
  monthAchieved: number
  monthRemaining: number
  monthForecast: number

  isRevenueAlert: boolean
  isPendingAlert: boolean
  isStockAlert: boolean
}

export interface PnlReport {
  period: string
  totalRevenue: number
  totalCostOfGoodsSold: number
  totalOperatingExpenses: number
  grossProfit: number
  netProfit: number
  expenseDetails: ExpenseDetail[]
}

export interface ExpenseDetail {
  category: string
  amount: number
}

export interface StaffPerformance {
  employeeName: string
  role: string
  totalSales: number
  targetSales: number
  commissionPaid: number
  kpiStatus: 'Vượt KPI' | 'Đạt' | 'Cần cải thiện'
  isTopSeller: boolean
}

export interface Expense {
  id: number
  name: string
  amount: number
  expenseDate: string
  category: number // 0: Fixed, 1: Variable
  note?: string
}

export interface TransactionLog {
  timestamp: string
  customerName: string
  productName: string
  amount: number
  isRevenue: boolean
  status: string
  staffName: string
}

export interface RevenueSource {
  name: string
  amount: number
  percent: number
}
