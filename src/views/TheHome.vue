<template>
  <div class="bg-white p-6 rounded-xl shadow-lg">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold mb-2 text-gray-800">
          Xin chào, {{ authStore.user?.fullName || 'Admin' }}!
        </h1>
        <p id="greeting" class="text-gray-500">
          {{
            hasStatView
              ? 'Chúc bạn một buổi sáng tốt lành! Đây là báo cáo tổng quan.'
              : 'Chào mừng bạn đến với hệ thống quản lý AnhEm Motor!'
          }}
        </p>
      </div>
    </div>

    <div v-if="hasStatView && isLoading">
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
    </div>

    <div
      v-if="hasStatView && !isLoading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
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

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Charts (Only if hasStatView) -->
      <template v-if="hasStatView">
        <div v-if="isLoading" class="bg-gray-50 p-6 rounded-xl shadow-md h-96">
          <SkeletonLoader width="50%" height="20px" class="mb-4" />
          <SkeletonLoader width="100%" height="300px" />
        </div>
        <div v-else class="bg-gray-50 p-6 rounded-xl shadow-md h-96">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">
            Doanh Thu &amp; Lợi Nhuận (7 Ngày)
          </h3>
          <div class="w-full h-full">
            <RevenueChart7day :revenue-data="revenueData" />
          </div>
        </div>

        <div v-if="isLoading" class="bg-gray-50 p-6 rounded-xl shadow-md h-96">
          <SkeletonLoader width="50%" height="20px" class="mb-4" />
          <SkeletonLoader width="100%" height="300px" />
        </div>
        <div v-else class="bg-gray-50 p-6 rounded-xl shadow-md h-96">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Tỷ Lệ Trạng Thái Đơn Hàng</h3>
          <div class="w-full h-full">
            <PieChartFrame :order-data="orderStatusData" />
          </div>
        </div>
      </template>

      <!-- Quick Actions Section (Replaces 3 Month Chart or shows alone) -->
      <div class="lg:col-span-2 bg-gray-50/50 p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <IconHome class="w-5 h-5 text-red-600" />
          Truy cập nhanh
        </h3>
        <div
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          <template v-for="action in visibleActions" :key="action.route">
            <RouterLink
              :to="action.route"
              class="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-white hover:bg-white hover:shadow-md hover:border-red-200 transition-all duration-300 group"
            >
              <div
                class="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-red-50 group-hover:scale-110 transition-all duration-300"
              >
                <component
                  :is="action.icon"
                  class="w-6 h-6 text-gray-600 group-hover:text-red-600"
                />
              </div>
              <span class="text-sm font-medium text-gray-700 group-hover:text-red-700 text-center">
                {{ action.name }}
              </span>
            </RouterLink>
          </template>
        </div>
      </div>
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
import { useAuthStore } from '@/stores/useAuthStore'
import { usePermission } from '@/composables/usePermission'
import { Permissions } from '@/constants/permissions'

// Icons
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
  staleTime: 5 * 60 * 1000, // 5 minutes
  enabled: hasStatView,
})

const summary = computed(() => dashboardData.value?.summary || {})

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
  pending: '#3b82f6', // Blue
  waiting_deposit: '#93c5fd', // Light Blue
  deposit_paid: '#6366f1', // Indigo
  confirmed_cod: '#8b5cf6', // Violet
  preparing: '#f59e0b', // Amber
  waiting_pickup: '#fbbf24', // Yellow
  delivering: '#ec4899', // Pink
  completed: '#10b981', // Green
  cancelled: '#ef4444', // Red
  refunding: '#f97316', // Orange
  refunded: '#6b7280', // Gray
  paid_processing: '#06b6d4', // Cyan
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
