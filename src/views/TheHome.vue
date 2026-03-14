<template>
  <div class="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 sm:mb-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
          Xin chào, {{ authStore.user?.fullName || 'Admin' }}!
        </h1>
        <p id="greeting" class="text-sm sm:text-base text-gray-500">
          {{
            hasStatView
              ? 'Chúc bạn một buổi sáng tốt lành! Đây là báo cáo tổng quan.'
              : 'Chào mừng bạn đến với hệ thống quản lý AnhEm Motor!'
          }}
        </p>
      </div>
    </div>

    <!-- Skeleton Loading Metrics -->
    <div v-if="hasStatView && isLoading">
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div
          v-for="i in 4"
          :key="i"
          class="p-4 sm:p-6 rounded-xl shadow-md bg-gray-50 border border-gray-100"
        >
          <SkeletonLoader width="40%" height="14px" class="mb-2" />
          <SkeletonLoader width="60%" height="30px" class="mb-2" />
          <SkeletonLoader width="30%" height="12px" />
        </div>
      </div>
    </div>

    <!-- Loaded Metrics Overview -->
    <div
      v-if="hasStatView && !isLoading"
      class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
    >
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

    <!-- Layout 2 Cột chính: Biểu đồ & Truy cập nhanh -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
      <template v-if="hasStatView">
        <div v-if="isLoading" class="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-md h-80 sm:h-96 flex flex-col">
          <SkeletonLoader width="50%" height="20px" class="mb-4 shrink-0" />
          <SkeletonLoader width="100%" height="100%" class="flex-1" />
        </div>
        <div v-else class="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-md h-80 sm:h-96 flex flex-col">
          <h3 class="text-base sm:text-lg font-semibold text-gray-700 mb-4 shrink-0">
            Doanh Thu &amp; Lợi Nhuận (7 Ngày)
          </h3>
          <div class="w-full flex-1 min-h-0 relative">
            <RevenueChart7day :revenue-data="revenueData" />
          </div>
        </div>

        <div v-if="isLoading" class="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-md h-80 sm:h-96 flex flex-col">
          <SkeletonLoader width="50%" height="20px" class="mb-4 shrink-0" />
          <SkeletonLoader width="100%" height="100%" class="flex-1" />
        </div>
        <div v-else class="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-md h-80 sm:h-96 flex flex-col">
          <h3 class="text-base sm:text-lg font-semibold text-gray-700 mb-4 shrink-0">Tỷ Lệ Trạng Thái Đơn Hàng</h3>
          <div class="w-full flex-1 min-h-0 relative">
            <PieChartFrame :order-data="orderStatusData" />
          </div>
        </div>
      </template>

      <!-- Truy cập nhanh (Luôn full 2 cột nếu không có quyền StatView, ngược lại chiếm 2 cột dưới) -->
      <div class="lg:col-span-2 bg-gray-50/50 p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm mt-2 sm:mt-0">
        <h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
          <IconHome class="w-5 h-5 text-red-600" />
          Truy cập nhanh
        </h3>
        <div
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
        >
          <template v-for="action in visibleActions" :key="action.route">
            <RouterLink
              :to="action.route"
              class="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border border-gray-100 bg-white hover:bg-white hover:shadow-md hover:border-red-200 transition-all duration-300 group"
            >
              <div
                class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-red-50 group-hover:scale-110 transition-all duration-300"
              >
                <component
                  :is="action.icon"
                  class="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-red-600"
                />
              </div>
              <span class="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-red-700 text-center">
                {{ action.name }}
              </span>
            </RouterLink>
          </template>
        </div>
      </div>
    </div>

    <!-- Layout Component mới e.g. Bảng Đơn Hàng & So Sánh Tháng -->
    <div v-if="hasStatView" class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div v-if="isLoading" class="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-md h-80 flex flex-col">
        <SkeletonLoader width="35%" height="20px" class="mb-4 shrink-0" />
        <SkeletonLoader width="100%" height="100%" class="flex-1" />
      </div>
      <MonthlyRevenueChart v-else :monthly-data="monthlyData" />

      <div v-if="isLoading" class="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-md h-80 flex flex-col">
        <SkeletonLoader width="40%" height="20px" class="mb-4 shrink-0" />
        <SkeletonLoader width="100%" height="40px" class="mb-2" />
        <SkeletonLoader width="100%" height="40px" class="mb-2" />
        <SkeletonLoader width="100%" height="40px" class="mb-2" />
        <SkeletonLoader width="100%" height="40px" class="mb-2" />
        <SkeletonLoader width="100%" height="40px" />
      </div>
      <RecentOrdersTable v-else :recent-orders="recentOrders" />
    </div>

  </div>
</template>

<script setup lang="js">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { statisticsService } from '@/api/statistics'

import RevenueChart7day from '@/components/report/RevenueChart7day.vue'
import PieChartFrame from '@/components/report/OrderChart.vue'
import StatsCard from '@/components/ui/ReportStatsCard.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import MonthlyRevenueChart from '@/components/report/MonthlyRevenueChart.vue'
import RecentOrdersTable from '@/components/report/RecentOrdersTable.vue'

import { useAuthStore } from '@/stores/useAuthStore'
import { usePermission } from '@/composables/usePermission'
import { Permissions } from '@/constants/permissions'

import IconHome from '@/assets/icons/IconHome.svg'
import IconProduct from '@/assets/icons/IconProduct.svg'
import IconOrder from '@/assets/icons/IconOrder.svg'
import IconUser from '@/assets/icons/IconUser.svg'
import IconWarehouse from '@/assets/icons/IconWarehouse.svg'
import IconSettings from '@/assets/icons/IconSettings.svg'
import IconInput from '@/assets/icons/IconInput.svg'

const authStore = useAuthStore()
const { hasPermission } = usePermission()

const hasStatView = computed(() => hasPermission(Permissions.StatisticalView))

const { isLoading, data: dashboardData } = useQuery({
  queryKey: ['admin', 'dashboard-overview'],
  queryFn: statisticsService.getAdminDashboardOverview,
  staleTime: 5 * 60 * 1000,
  enabled: hasStatView,
})

const summary = computed(() => dashboardData.value?.summary || {})
const recentOrders = computed(() => dashboardData.value?.recentOrders || [])
const monthlyData = computed(() => dashboardData.value?.monthlyComparison || [])

const currentTime = ref(new Date().toLocaleTimeString('vi-VN'))
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('vi-VN')
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const quickActions = [
  { name: 'Sản phẩm', route: '/products', icon: IconProduct, permission: Permissions.ProductsView },
  { name: 'Đơn hàng', route: '/orders', icon: IconOrder, permission: Permissions.OutputsView },
  { name: 'Nhập hàng', route: '/inputs', icon: IconInput, permission: Permissions.InputsView },
  {
    name: 'Thương hiệu',
    route: '/brands',
    icon: IconWarehouse,
    permission: Permissions.BrandsView,
  },
  {
    name: 'Thể loại',
    route: '/categories',
    icon: IconWarehouse,
    permission: Permissions.ProductCategoriesView,
  },
  {
    name: 'Nhà cung cấp',
    route: '/suppliers',
    icon: IconWarehouse,
    permission: Permissions.SuppliersView,
  },
  {
    name: 'Thiết lập giá',
    route: '/price-management',
    icon: IconSettings,
    permission: Permissions.ProductsEditPrice,
  },
  { name: 'Người dùng', route: '/users', icon: IconUser, permission: Permissions.UsersView },
  { name: 'Vai trò', route: '/permissions', icon: IconSettings, permission: Permissions.RolesView },
  { name: 'Cài đặt', route: '/settings', icon: IconSettings, permission: Permissions.SettingsView },
]

const visibleActions = computed(() => {
  return quickActions.filter((action) => !action.permission || hasPermission(action.permission))
})

const formatCurrency = (val) => {
  if (val >= 1000000000) return `${(val / 1000000000).toFixed(2)} tỷ`
  if (val >= 1000000) return `${(val / 1000000).toFixed(0)} triệu`
  return `${val?.toLocaleString() || 0} đ`
}

const orderStatusColors = {
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

const orderStatusNames = {
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

const orderStatusData = computed(() => {
  if (!dashboardData.value?.orderStatusDistribution) return []
  return dashboardData.value.orderStatusDistribution.map((item) => {
    const statusKey = item.statusName?.toLowerCase()
    return {
      status: orderStatusNames[statusKey] || item.statusName,
      value: item.orderCount,
      color: orderStatusColors[statusKey] || '#d1d5db',
    }
  })
})

const revenueData = computed(() => {
  if (!dashboardData.value?.dailyRevenue) return []
  return dashboardData.value.dailyRevenue.map((item) => ({
    date: item.reportDay,
    revenue: item.totalRevenue / 1000000,
    profit: (item.totalProfit || 0) / 1000000,
  }))
})
</script>
