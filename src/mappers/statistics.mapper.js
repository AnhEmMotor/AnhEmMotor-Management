const statisticsMapper = {
  toProductReport(dto) {
    if (!dto) return { highlights: {}, topRevenueChart: [], topProfitChart: [], productTable: [] }

    return {
      highlights: {
        bestSellerName: dto.highlights?.bestSellerName || '—',
        bestSellerSold: dto.highlights?.bestSellerSold || 0,
        deadStockName: dto.highlights?.deadStockName || '—',
        deadStockValue: dto.highlights?.deadStockValue || 0,
        avgTurnover: dto.highlights?.avgTurnover || 0,
        totalSKUs: dto.highlights?.totalSKUs || 0,
      },
      topRevenueChart: (dto.topRevenueProducts || []).map((p) => ({
        label: p.productName,
        value: Math.round(p.revenue / 1000000),
      })),
      topProfitChart: (dto.topProfitProducts || []).map((p) => ({
        label: p.productName,
        value: Math.round(p.profit / 1000000),
      })),
      productTable: (dto.productPerformanceTable || []).map((p) => ({
        ...p,
        stockPercent: this._calculateStockPercent(p.stockQuantity, p.maxStockQuantity),
        stockStatus: this._getStockStatus(p.stockQuantity),
      })),
    }
  },

  toRevenueAnalysis(dto) {
    const defaults = {
      summary: { totalRevenue: 0, totalProfit: 0, profitMargin: 0, totalOrders: 0 },
      revenueTrendChart: [],
      topProducts: [],
      brandDistributionChart: [],
      paymentMethodChart: [],
      dailyTable: [],
    }
    if (!dto) return defaults

    const lastMonthRevenue = dto.summary?.lastMonthRevenue || 0
    const lastMonthProfit = dto.summary?.lastMonthProfit || 0

    return {
      summary: {
        totalRevenue: lastMonthRevenue,
        totalProfit: lastMonthProfit,
        profitMargin:
          lastMonthRevenue > 0 ? Math.round((lastMonthProfit / lastMonthRevenue) * 100) : 0,
        totalOrders: (dto.dailyTableData || []).reduce((sum, d) => sum + d.ordersCount, 0),
      },
      revenueTrendChart: (dto.revenueTrend || []).map((item) => ({
        date: item.reportDay,
        revenue: item.totalRevenue / 1000000,
        profit: (item.totalProfit || 0) / 1000000,
      })),
      topProducts: (dto.topProductsByRevenue || []).map((item) => ({
        name: item.productName,
        revenue: item.revenue / 1000000,
        units: item.unitsSold,
      })),
      brandDistributionChart: (dto.brandRevenueDistribution || []).map((d) => ({
        label: d.brandName,
        value: d.revenue,
      })),
      paymentMethodChart: (dto.paymentMethodDistribution || []).map((d) => ({
        label: d.methodName,
        value: d.value,
      })),
      dailyTable: (dto.dailyTableData || []).map((item) => ({
        date: new Date(item.reportDay).toLocaleDateString('vi-VN'),
        orders: item.ordersCount,
        revenue: item.totalRevenue / 1000000,
        profit: item.totalProfit / 1000000,
        growth: item.growth,
      })),
    }
  },

  toWarehouseReport(dto) {
    if (!dto)
      return { summary: {}, stockByBrandChart: [], stockStatusRatioChart: [], warehouseTable: [] }

    return {
      summary: {
        totalStock: dto.summary?.totalStock || 0,
        totalValue: dto.summary?.totalValue || 0,
        lowStockCount: dto.summary?.lowStockCount || 0,
        outOfStockCount: dto.summary?.outOfStockCount || 0,
      },
      stockByBrandChart: (dto.stockByBrand || []).map((item) => ({
        name: item.brandName,
        inStock: item.inStock,
        lowStock: item.lowStock,
        outOfStock: item.outOfStock,
      })),
      stockStatusRatioChart: (dto.stockStatusRatio || []).map((item) => ({
        label: item.statusLabel,
        value: item.count,
      })),
      warehouseTable: (dto.warehouseTableData || []).map((item) => ({
        ...item,
        capacityPercent: this._calculateCapacityPercent(item.totalStock, item.capacity),
        statusColor: item.status === 'Bình thường' ? 'gray' : 'red',
      })),
    }
  },

  toParams(filters) {
    if (!filters) return ''
    const params = new URLSearchParams()
    if (filters.startDate) params.append('start_date', filters.startDate)
    if (filters.endDate) params.append('end_date', filters.endDate)
    if (filters.type) params.append('type', filters.type)
    return params.toString()
  },

  toDTO(model) {
    if (!model) return {}
    return { ...model }
  },

  toDashboardOverview(dto) {
    if (!dto) return { summary: {}, orderStatusChart: [], dailyRevenueChart: [] }

    return {
      summary: dto.summary || {},
      orderStatusChart: (dto.orderStatusDistribution || []).map((item) => {
        const statusKey = item.statusName?.toLowerCase()
        return {
          status: this._getStatusName(statusKey) || item.statusName,
          value: item.orderCount,
          color: this._getStatusColor(statusKey) || '#d1d5db',
        }
      }),
      dailyRevenueChart: (dto.dailyRevenue || []).map((item) => ({
        date: item.reportDay,
        revenue: item.totalRevenue / 1000000,
        profit: (item.totalProfit || 0) / 1000000,
      })),
    }
  },

  _getStatusName(key) {
    const names = {
      pending: 'Chờ xử lý',
      waiting_deposit: 'Chờ đặt cọc',
      deposit_paid: 'Đã đặt cọc',
      confirmed_cod: 'Đã xác nhận COD',
      preparing: 'Đang chuẩn bị',
      waiting_pickup: 'Chờ lấy hàng',
      delivering: 'Đang giao',
      completed: 'Hoàn tất',
      cancelled: 'Đã huỷ',
      refunding: 'Đang hoàn tiền',
      refunded: 'Hoàn tiền',
      paid_processing: 'Đã thanh toán',
    }
    return names[key]
  },

  _getStatusColor(key) {
    const colors = {
      pending: '#3b82f6',
      waiting_deposit: '#93c5fd',
      deposit_paid: '#6366f1',
      confirmed_cod: '#8b5cf6',
      preparing: '#f59e0b',
      waiting_pickup: '#fbbf24',
      delivering: '#ec4899',
      completed: '#10b981',
      cancelled: '#ef4444',
      refunding: '#f97316',
      refunded: '#6b7280',
      paid_processing: '#06b6d4',
    }
    return colors[key]
  },

  _calculateStockPercent(current, max) {
    if (!max) return 0
    return Math.min(100, Math.round((current / max) * 100))
  },

  _getStockStatus(quantity) {
    if (quantity <= 0) return { text: 'Hết hàng', color: 'red' }
    if (quantity < 5) return { text: 'Sắp hết', color: 'yellow' }
    return { text: 'Còn hàng', color: 'green' }
  },

  _calculateCapacityPercent(total, capacity) {
    if (!capacity) return 0
    return Math.max(0, Math.min(100, Math.round((total / capacity) * 100)))
  },
}

export default statisticsMapper
