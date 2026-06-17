// --- Dashboard overview ---
export interface AdminDashboardOverviewResponse {
  summary: DashboardStatsResponse
  orderStatusDistribution: OrderStatusCountResponse[]
  dailyRevenue: DailyRevenueResponse[]
  monthlyComparison: MonthlyRevenueProfitResponse[]
  recentOrders: RecentOrderResponse[]
}

export interface DashboardStatsResponse {
  todayRevenue: number
  revenueChangePercentage: number
  monthlyRevenue: number
  todayProfit: number
  monthlyProfit: number
  lastMonthRevenue: number
  lastMonthProfit: number
  total7dRevenue: number
  total7dProfit: number
  bestDayRevenue: number
  bestDayDate?: string
  overdueOrdersCount: number
  lowStockCount: number
  overstockCount: number
  overdueDebtAmount: number
  todayVehiclesSold: number
  monthlyVehiclesSold: number
  currentInventoryCount: number
  totalSKUCount: number
  brandDistribution: BrandStockResponse[]
  activeInstallmentCount: number
  lateInstallmentCount: number
  totalCustomerDebt: number
  topSellingProducts: TopSellingProductResponse[]
  brandRevenueDistribution: BrandRevenueResponse[]
  todayActivities: string[]
  pendingOrdersCount: number
  newCustomersCount: number
}

export interface DailyRevenueResponse {
  reportDay: string
  totalRevenue: number
}

export interface MonthlyRevenueProfitResponse {
  reportMonth: string
  totalRevenue: number
  totalProfit: number
  hasZeroCostPrice: boolean
}

export interface OrderStatusCountResponse {
  statusName?: string
  orderCount: number
}

export interface RecentOrderResponse {
  id: number
  orderCode?: string
  buyerName?: string
  totalAmount: number
  statusId?: string
  createdAt: string
}

export interface BrandStockResponse {
  brandName?: string
  inStock: number
  lowStock: number
  outOfStock: number
  stockCount: number
}

export interface TopSellingProductResponse {
  productName?: string
  unitsSold: number
  revenue: number
}

export interface BrandRevenueResponse {
  brandName?: string
  revenue: number
  totalRevenue: number
  quantitySold: number
}

// --- Revenue analysis ---
export interface AdminRevenueAnalysisResponse {
  summary: DashboardStatsResponse
  revenueTrend: DailyRevenueResponse[]
  topProductsByRevenue: TopProductRevenueResponse[]
  brandRevenueDistribution: BrandRevenueResponse[]
  paymentMethodDistribution: PaymentMethodDistributionResponse[]
  dailyTableData: DailyRevenueTableResponse[]
}

export interface TopProductRevenueResponse {
  productName?: string
  unitsSold: number
  revenue: number
}

export interface PaymentMethodDistributionResponse {
  methodName?: string
  value: number
}

export interface DailyRevenueTableResponse {
  reportDay: string
  totalRevenue: number
  totalProfit: number
  orderCount: number
}

export interface DailyRevenueDetailResponse {
  productName?: string
  employeeName?: string
  quantity: number
  revenue: number
}

// --- Product report ---
export interface AdminProductReportResponse {
  highlights: ProductReportHighlightsResponse
  topRevenueProducts: TopProductRevenueResponse[]
  topProfitProducts: TopProductProfitResponse[]
  productPerformanceTable: ProductPerformanceTableResponse[]
}

export interface ProductReportHighlightsResponse {
  bestSellerName?: string
  bestSellerSold: number
  deadStockName?: string
  deadStockValue: number
  avgTurnover: number
  totalSKUs: number
}

export interface TopProductProfitResponse {
  productName?: string
  profit: number
}

export interface ProductPerformanceTableResponse {
  productName?: string
  sellPrice: number
  soldCount30Days: number
  stockQuantity: number
  maxStockQuantity: number
  marginPercentage: number
  status?: string
  trend: number[]
}

// --- Warehouse report ---
export interface AdminWarehouseReportResponse {
  summary: WarehouseSummaryResponse
  stockByBrand: BrandStockResponse[]
  stockStatusRatio: StockStatusRatioResponse[]
  warehouseTableData: WarehouseTableDataResponse[]
}

export interface WarehouseSummaryResponse {
  totalStock: number
  totalValue: number
  lowStockCount: number
  outOfStockCount: number
}

export interface StockStatusRatioResponse {
  statusLabel?: string
  count: number
}

export interface WarehouseTableDataResponse {
  brandName?: string
  totalStock: number
  capacity: number
  lowStock: number
  outOfStock: number
  status?: string
  value: number
}

// --- Product stock/price detail ---
export interface ProductStockPriceResponse {
  variantId: number
  productName?: string
  currentStock: number
  sellPrice: number
  costPrice?: number
  lastRestocked?: string
}

// --- Workshop overview ---
export interface WorkshopOverviewResponse {
  kpi: WorkshopKpi
  repairOrders: WorkshopRepairOrderDto[]
}

export interface WorkshopKpi {
  inProgressCount: number
  avgCompletionHours: number
  monthlyRevenue: number
  overdueCount: number
}

export interface WorkshopRepairOrderDto {
  id: number
  orderCode: string
  customerName: string
  vehicleInfo: string
  technicianName: string
  status: string
  startedAt: string
  laborFee: number
}

// --- Financing overview ---
export interface FinancingOverviewResponse {
  kpi: FinancingKpi
  installments: FinancingInstallmentDto[]
}

export interface FinancingKpi {
  totalApplications: number
  disbursedCount: number
  pendingCount: number
  overdueCount: number
}

export interface FinancingInstallmentDto {
  id: number
  applicationCode: string
  customerName: string
  partnerName: string
  vehicleName: string
  amount: number
  status: string
  cavetStatus?: string
  createdAt: string
}

// --- Customer analytics ---
export interface CustomerAnalyticsResponse {
  kpi: CustomerKpi
  leads: CustomerLeadDto[]
}

export interface CustomerKpi {
  totalLeads: number
  newCustomers: number
  hotLeads: number
}

export interface CustomerLeadDto {
  id: number
  customerName: string
  source: string
  leadScore: number
  status: string
  lastContact: string
}

// --- Customer service analytics ---
export interface CustomerServiceAnalyticsResponse {
  kpi: CustomerServiceKpi
  complaints: CustomerComplaintDto[]
}

export interface CustomerServiceKpi {
  avgRating: number
  newComplaints: number
  avgResponseHours: number
  resolvedCount: number
}

export interface CustomerComplaintDto {
  id: number
  ticketCode: string
  customerName: string
  subject: string
  rating: number
  status: string
  createdAt: string
  responseHours?: number
}
