<script setup>
import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { statisticsService } from '@/api/statistics'
import ReportStatsCard from '@/components/ui/ReportStatsCard.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import RevenueFilterButtons from '@/components/report/RevenueFilterButtons.vue'
import RevenueChart7day from '@/components/report/RevenueChart7day.vue'
import DonutChart from '@/components/charts/DonutChart.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import IconFileExport from '@/assets/icons/IconFileExport.svg'

const { isLoading, data: apiData } = useQuery({
  queryKey: ['admin', 'revenue-analysis'],
  queryFn: statisticsService.getAdminRevenueAnalysis,
  staleTime: 5 * 60 * 1000,
})

const dashboardData = computed(() => apiData.value || {})

const totalRevenue = computed(() => dashboardData.value.summary?.lastMonthRevenue || 0)
const totalProfit = computed(() => dashboardData.value.summary?.lastMonthProfit || 0)

const profitMargin = computed(() => {
  if (totalRevenue.value === 0) return 0
  return Math.round((totalProfit.value / totalRevenue.value) * 100)
})

const dailyData = computed(() => {
  if (!dashboardData.value.dailyTableData) return []
  return dashboardData.value.dailyTableData.map((item) => {
    const formattedDate = new Date(item.reportDay).toLocaleDateString('vi-VN')
    return {
      date: formattedDate,
      orders: item.ordersCount,
      revenue: item.totalRevenue / 1000000,
      profit: item.totalProfit / 1000000,
      growth: item.growth,
    }
  })
})

const totalOrders = computed(() => {
  if (!dashboardData.value.dailyTableData) return 0
  return dashboardData.value.dailyTableData.reduce((sum, d) => sum + d.ordersCount, 0)
})

const avgOrderValue = computed(() => {
  if (totalOrders.value === 0) return 0
  return Math.round(totalRevenue.value / 1000000 / totalOrders.value)
})

const formatCurrency = (value) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)} tỷ`
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)} tr`
  return `${value?.toLocaleString() || 0} đ`
}

const revenueData = computed(() => {
  if (!dashboardData.value.revenueTrend) return []
  return dashboardData.value.revenueTrend.map((item) => ({
    date: item.reportDay,
    revenue: item.totalRevenue / 1000000,
    profit: (item.totalProfit || 0) / 1000000,
  }))
})

const topProducts = computed(() => {
  if (!dashboardData.value.topProductsByRevenue) return []
  return dashboardData.value.topProductsByRevenue.map((item) => ({
    name: item.productName,
    revenue: item.revenue / 1000000,
    units: item.unitsSold,
  }))
})

const brandDonutData = computed(() => {
  if (!dashboardData.value.brandRevenueDistribution) return []
  return dashboardData.value.brandRevenueDistribution.map((d) => ({
    label: d.brandName,
    value: d.revenue,
  }))
})

const brandDonutTotal = computed(
  () => dashboardData.value.brandRevenueDistribution?.reduce((sum, d) => sum + d.revenue, 0) || 0,
)

const brandDonutColors = [
  '#DC2626',
  '#EF4444',
  '#F87171',
  '#FCA5A5',
  '#FECACA',
  '#FEE2E2',
  '#d1d5db',
  '#9ca3af',
]

const paymentData = computed(() => {
  if (!dashboardData.value.paymentMethodDistribution) return []
  return dashboardData.value.paymentMethodDistribution.map((d) => ({
    label: d.methodName,
    value: d.value,
  }))
})

const paymentColors = ['#DC2626', '#FECACA', '#fca5a5', '#ef4444']

const handleExport = () => {}
const selectedStatuses = ref(['30-days'])
</script>

<template>
  <div class="p-6 rounded-xl shadow-lg bg-white">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold mb-1 text-gray-800">Phân Tích Doanh Thu Chi Tiết</h1>
        <p class="text-gray-500 text-sm">Theo dõi doanh thu, lợi nhuận và xu hướng kinh doanh</p>
      </div>
      <div v-if="isLoading" class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <SkeletonLoader width="100%" height="2.5rem" className="rounded-lg sm:w-[200px]" />
        <SkeletonLoader width="100%" height="2.5rem" className="rounded-lg sm:w-[100px]" />
      </div>
      <div v-else class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
        <RevenueFilterButtons v-model="selectedStatuses" class="flex-1 sm:flex-none" />
        <Button color="secondary" :icon="IconFileExport" text="Export" @click="handleExport" class="flex-1 sm:flex-none" />
      </div>
    </div>

    <template v-if="isLoading">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SkeletonLoader v-for="i in 4" :key="i" height="6rem" className="rounded-xl" />
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <SkeletonLoader className="lg:col-span-3 rounded-lg" height="280px" />
        <div class="lg:col-span-2 space-y-3">
          <SkeletonLoader height="1rem" />
          <SkeletonLoader v-for="i in 5" :key="i" height="2.5rem" className="rounded" />
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SkeletonLoader height="200px" className="rounded-lg" />
        <SkeletonLoader height="200px" className="rounded-lg" />
      </div>
      <SkeletonLoader height="250px" className="rounded-lg" />
    </template>

    <template v-else>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <ReportStatsCard
          title="Tổng Doanh Thu"
          :stat="formatCurrency(totalRevenue)"
          :improvement="15"
          color="red"
        />
        <ReportStatsCard
          title="Lợi Nhuận Ròng"
          :stat="formatCurrency(totalProfit)"
          :improvement="profitMargin"
          color="green"
        />
        <ReportStatsCard
          title="Tổng Đơn Hàng"
          :stat="totalOrders"
          :improvement="-2"
          color="yellow"
        />
        <ReportStatsCard
          title="Giá Trị trung bình / đơn"
          :stat="`${avgOrderValue} tr`"
          color="purple"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="lg:col-span-2 border border-gray-200 rounded-lg p-4">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">Xu Hướng Doanh Thu & Lợi Nhuận</h2>
          <RevenueChart7day :revenue-data="revenueData" />
        </div>

        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-semibold text-gray-700">Top Sản Phẩm Bán Chạy</h2>
          </div>
          <div class="space-y-3">
            <div
              v-for="(product, index) in topProducts"
              :key="product.name"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                :class="index < 3 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'"
              >
                {{ index + 1 }}
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate">{{ product.name }}</p>
                <p class="text-xs text-gray-400">{{ product.units }} đã bán</p>
              </div>
              <span class="text-sm font-semibold text-red-600 shrink-0"
                >{{ product.revenue }} tr</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="border border-gray-200 rounded-lg p-4">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">Tỷ Trọng Doanh Thu Theo Hãng</h2>
          <DonutChart
            :data="brandDonutData"
            :colors="brandDonutColors"
            :centerValue="formatCurrency(brandDonutTotal)"
            centerLabel="Tổng DT"
          />
        </div>

        <div class="border border-gray-200 rounded-lg p-4">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">Phân Tích Thanh Toán</h2>
          <DonutChart
            :data="paymentData"
            :colors="paymentColors"
            centerValue="100%"
            centerLabel="Tổng"
          />
        </div>
      </div>

      <div class="overflow-hidden rounded-lg shadow-sm border border-gray-300">
        <!-- Desktop Table -->
        <table class="min-w-full bg-white border-collapse hidden md:table">
          <thead>
            <tr
              class="bg-gray-50 text-gray-500 uppercase text-xs font-medium tracking-wider leading-normal border-b border-gray-200"
            >
              <th class="py-3 px-6 text-left">Ngày</th>
              <th class="py-3 px-6 text-right">Số Đơn</th>
              <th class="py-3 px-6 text-right">Doanh Thu</th>
              <th class="py-3 px-6 text-right">Lợi Nhuận</th>
              <th class="py-3 px-6 text-center">Tăng Trưởng</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm">
            <tr
              v-for="row in dailyData"
              :key="row.date"
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-6 whitespace-nowrap font-medium text-gray-900">{{ row.date }}</td>
              <td class="py-3 px-6 whitespace-nowrap text-right font-mono">{{ row.orders }}</td>
              <td class="py-3 px-6 whitespace-nowrap text-right font-mono">{{ row.revenue }} tr</td>
              <td class="py-3 px-6 whitespace-nowrap text-right font-mono">{{ row.profit }} tr</td>
              <td class="py-3 px-6 whitespace-nowrap text-center">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                  :class="row.growth >= 0 ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'"
                >
                  {{ row.growth >= 0 ? '▲' : '▼' }} {{ Math.abs(row.growth) }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Mobile Card View -->
        <div class="md:hidden flex flex-col bg-white divide-y divide-gray-200">
          <div
            v-for="row in dailyData"
            :key="`mob-${row.date}`"
            class="p-4 flex flex-col gap-3 hover:bg-gray-50 transition-colors"
          >
            <div class="flex justify-between items-center">
              <span class="font-bold text-gray-900 text-base">{{ row.date }}</span>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                :class="row.growth >= 0 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-gray-50 text-gray-500 border border-gray-200'"
              >
                {{ row.growth >= 0 ? '▲' : '▼' }} {{ Math.abs(row.growth) }}%
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col">
                <span class="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Doanh Thu</span>
                <span class="font-mono text-gray-800 font-bold">{{ row.revenue }} tr</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Lợi Nhuận</span>
                <span class="font-mono text-green-600 font-bold">{{ row.profit }} tr</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Số Đơn</span>
                <span class="font-mono text-gray-700">{{ row.orders }} đơn</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
