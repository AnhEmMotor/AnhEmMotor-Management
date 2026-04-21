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
              ? 'Chúc bạn một buổi sáng tốt lành! Đây là thống kê tổng quan.'
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
      v-else-if="hasStatView && dashboardData"
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

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <template v-if="hasStatView">
        <div v-if="isLoading" class="bg-gray-50 p-6 rounded-xl shadow-md h-96">
          <SkeletonLoader width="50%" height="20px" class="mb-4" />
          <SkeletonLoader width="100%" height="300px" />
        </div>
        <div v-else-if="dashboardData" class="bg-gray-50 p-6 rounded-xl shadow-md h-96">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">
            Doanh Thu &amp; Lợi Nhuận (7 Ngày)
          </h3>
          <div class="w-full h-full">
            <RevenueChart7day :revenue-data="dashboardData.dailyRevenueChart" />
          </div>
        </div>

        <div v-if="isLoading" class="bg-gray-50 p-6 rounded-xl shadow-md h-96">
          <SkeletonLoader width="50%" height="20px" class="mb-4" />
          <SkeletonLoader width="100%" height="300px" />
        </div>
        <div v-else-if="dashboardData" class="bg-gray-50 p-6 rounded-xl shadow-md h-96">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Tỷ Lệ Trạng Thái Đơn Hàng</h3>
          <div class="w-full h-full">
            <PieChartFrame :order-data="dashboardData.orderStatusChart" />
          </div>
        </div>
      </template>

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

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useStatisticsStore } from '@/stores/statistics.store'
import { useAuthStore } from '@/stores/auth.store'
import { usePermission } from '@/composables/usePermission'
import { Permissions } from '@/constants/permissions'
import { formatCurrency } from '@/utils/currency'

import RevenueChart7day from '@/components/statistics/RevenueChart7day.vue'
import PieChartFrame from '@/components/statistics/OrderChart.vue'
import StatsCard from '@/components/ui/ReportStatsCard.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'

import IconHome from '@/assets/icons/IconHome.svg'
import IconProduct from '@/assets/icons/IconProduct.svg'
import IconOrder from '@/assets/icons/IconOrder.svg'
import IconUser from '@/assets/icons/IconUser.svg'
import IconWarehouse from '@/assets/icons/IconWarehouse.svg'
import IconSettings from '@/assets/icons/IconSettings.svg'
import IconInput from '@/assets/icons/IconInput.svg'

const authStore = useAuthStore()
const statsStore = useStatisticsStore()
const { hasPermission } = usePermission()

const { dashboardData, isDashboardLoading: isLoading } = storeToRefs(statsStore)

const hasStatView = computed(() => hasPermission(Permissions.StatisticalView))
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
</script>


