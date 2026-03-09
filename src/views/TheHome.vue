<template>
  <div class="bg-white p-6 rounded-xl shadow-lg">
    <h1 class="text-3xl font-bold mb-2 text-gray-800">Xin chào, Admin!</h1>
    <p id="greeting" class="text-gray-500 mb-6">
      Chúc bạn một buổi sáng tốt lành! Đây là báo cáo tổng quan.
    </p>

    <div v-if="isLoading">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          v-for="i in 4"
          :key="i"
          class="p-6 rounded-xl shadow-md bg-gray-50 border border-gray-100"
        >
          <SkeletonLoader width="40%" height="14px" class="mb-2" />
          <SkeletonLoader width="60%" height="30px" class="mb-2" />
          <SkeletonLoader width="30%" height="12px" />
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-gray-50 p-6 rounded-xl shadow-md h-96">
          <SkeletonLoader width="50%" height="20px" class="mb-4" />
          <SkeletonLoader width="100%" height="300px" />
        </div>
        <div class="bg-gray-50 p-6 rounded-xl shadow-md h-96">
          <SkeletonLoader width="50%" height="20px" class="mb-4" />
          <SkeletonLoader width="100%" height="300px" />
        </div>
        <div class="bg-gray-50 p-6 rounded-xl shadow-md lg:col-span-2 h-96">
          <SkeletonLoader width="40%" height="20px" class="mb-4" />
          <SkeletonLoader width="100%" height="300px" />
        </div>
      </div>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Tổng Doanh Thu (Tháng Trước)"
          :stat="formatCurrency(summary.lastMonthRevenue || 0)"
          color="red"
        />
        <StatsCard
          title="Lợi Nhuận (Tháng Trước)"
          :stat="formatCurrency(summary.lastMonthProfit || 0)"
          color="green"
        />
        <StatsCard title="Đơn Hàng Chờ" :stat="summary.pendingOrdersCount || 0" color="yellow" />
        <StatsCard title="Khách Hàng Mới" :stat="summary.newCustomersCount || 0" color="purple" />
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-gray-50 p-6 rounded-xl shadow-md h-96">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">
            Doanh Thu &amp; Lợi Nhuận (7 Ngày)
          </h3>
          <div class="w-full h-full">
            <RevenueChart7day :revenue-data="revenueData" />
          </div>
        </div>
        <div class="bg-gray-50 p-6 rounded-xl shadow-md h-96">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Tỷ Lệ Trạng Thái Đơn Hàng</h3>
          <div class="w-full h-full">
            <PieChartFrame :order-data="orderStatusData" />
          </div>
        </div>
        <div class="bg-gray-50 p-6 rounded-xl shadow-md lg:col-span-2 h-96">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Doanh Thu và Lợi Nhuận (3 Tháng)</h3>
          <div class="w-full h-full">
            <ChartFrame3month :revenue-data="monthlyComparisonData" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { statisticsService } from '@/api/statistics'
import ChartFrame3month from '@/components/report/ChartFrame3month.vue'
import RevenueChart7day from '@/components/report/RevenueChart7day.vue'
import PieChartFrame from '@/components/report/OrderChart.vue'
import StatsCard from '@/components/ui/ReportStatsCard.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'

const { isLoading, data: dashboardData } = useQuery({
  queryKey: ['admin', 'dashboard-overview'],
  queryFn: statisticsService.getAdminDashboardOverview,
  staleTime: 5 * 60 * 1000, // 5 minutes
})

const summary = computed(() => dashboardData.value?.summary || {})

const formatCurrency = (val) => {
  if (val >= 1000000000) return `${(val / 1000000000).toFixed(2)} tỷ`
  if (val >= 1000000) return `${(val / 1000000).toFixed(0)} triệu`
  return `${val?.toLocaleString() || 0} đ`
}

const orderStatusColors = {
  Pending: '#3b82f6',
  Processing: '#f59e0b',
  Shipped: '#8b5cf6',
  Delivered: '#10b981',
  Cancelled: '#ef4444',
  Refunded: '#6b7280',
}

const orderStatusNames = {
  Pending: 'Chờ xử lý',
  Processing: 'Đang xử lý',
  Shipped: 'Đang giao',
  Delivered: 'Đã giao',
  Cancelled: 'Đã huỷ',
  Refunded: 'Hoàn tiền',
}

const orderStatusData = computed(() => {
  if (!dashboardData.value?.orderStatusDistribution) return []
  return dashboardData.value.orderStatusDistribution.map((item) => ({
    status: orderStatusNames[item.statusName] || item.statusName,
    value: item.orderCount,
    color: orderStatusColors[item.statusName] || '#d1d5db',
  }))
})

const revenueData = computed(() => {
  if (!dashboardData.value?.dailyRevenue) return []
  return dashboardData.value.dailyRevenue.map((item) => ({
    date: item.reportDay,
    revenue: item.totalRevenue / 1000000,
    profit: (item.totalProfit || 0) / 1000000,
  }))
})

const monthlyComparisonData = computed(() => {
  if (!dashboardData.value?.monthlyComparison) return []
  return dashboardData.value.monthlyComparison.map((item) => ({
    month: `Tháng ${new Date(item.reportMonth).getMonth() + 1}`,
    revenue: item.totalRevenue / 1000000,
    profit: item.totalProfit / 1000000,
  }))
})
</script>
