import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import statisticsService from '@/services/statistics.service'
import statisticsMapper from '@/mappers/statistics.mapper'

export const useStatisticsStore = defineStore('statistics', () => {
  // --- Báo cáo Sản phẩm ---
  const productSearchQuery = ref('')
  const productSortBy = ref('sold')

  const productReportQuery = useQuery({
    queryKey: ['admin', 'product-report'],
    queryFn: async () => {
      const data = await statisticsService.getAdminProductReport()
      return statisticsMapper.toProductReport(data)
    },
    staleTime: 5 * 60 * 1000,
  })

  const filteredProducts = computed(() => {
    if (!productReportQuery.data.value?.productTable) return []
    let result = [...productReportQuery.data.value.productTable]

    if (productSearchQuery.value) {
      const q = productSearchQuery.value.toLowerCase()
      result = result.filter((p) => p.productName && p.productName.toLowerCase().includes(q))
    }

    result.sort((a, b) => {
      switch (productSortBy.value) {
        case 'sold':
          return Number(b.soldCount30Days) - Number(a.soldCount30Days)
        case 'margin':
          return Number(b.marginPercentage) - Number(a.marginPercentage)
        case 'stock':
          return Number(b.stockQuantity) - Number(a.stockQuantity)
        case 'name':
          return (a.productName || '').localeCompare(b.productName || '')
        default:
          return 0
      }
    })

    return result
  })

  // --- Phân tích Doanh thu ---
  const revenueAnalysisQuery = useQuery({
    queryKey: ['admin', 'revenue-analysis'],
    queryFn: async () => {
      const data = await statisticsService.getAdminRevenueAnalysis()
      return statisticsMapper.toRevenueAnalysis(data)
    },
    staleTime: 5 * 60 * 1000,
  })

  // --- Báo cáo Kho ---
  const warehouseReportQuery = useQuery({
    queryKey: ['admin', 'warehouse-report'],
    queryFn: async () => {
      const data = await statisticsService.getAdminWarehouseReport()
      return statisticsMapper.toWarehouseReport(data)
    },
    staleTime: 5 * 60 * 1000,
  })

  // --- Tổng quan Dashboard ---
  const dashboardOverviewQuery = useQuery({
    queryKey: ['admin', 'dashboard-overview'],
    queryFn: async () => {
      const data = await statisticsService.getAdminDashboardOverview()
      return statisticsMapper.toDashboardOverview(data)
    },
    staleTime: 5 * 60 * 1000,
  })

  return {
    // Dashboard
    dashboardData: dashboardOverviewQuery.data,
    isDashboardLoading: dashboardOverviewQuery.isLoading,

    // Product
    productSearchQuery,
    productSortBy,
    productReport: productReportQuery.data,
    isProductLoading: productReportQuery.isLoading,
    filteredProducts,

    // Revenue
    revenueAnalysis: revenueAnalysisQuery.data,
    isRevenueLoading: revenueAnalysisQuery.isLoading,

    // Warehouse
    warehouseReport: warehouseReportQuery.data,
    isWarehouseLoading: warehouseReportQuery.isLoading,
  }
})
