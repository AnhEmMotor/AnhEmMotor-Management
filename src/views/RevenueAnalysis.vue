<script setup>
import { ref, computed, onMounted } from 'vue'
import ReportStatsCard from '@/components/ui/ReportStatsCard.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import RevenueFilterButtons from '@/components/report/RevenueFilterButtons.vue'
import RevenueChart7day from '@/components/report/RevenueChart7day.vue'
import DonutChart from '@/components/charts/DonutChart.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import IconFileExport from '@/components/icons/IconFileExport.vue'

const isLoading = ref(true)

const revenueData = [
  { date: '2025-09-15', revenue: 250, profit: 90 },
  { date: '2025-09-16', revenue: 280, profit: 110 },
  { date: '2025-09-17', revenue: 220, profit: 80 },
  { date: '2025-09-18', revenue: 350, profit: 150 },
  { date: '2025-09-19', revenue: 410, profit: 180 },
  { date: '2025-09-20', revenue: 380, profit: 165 },
  { date: '2025-09-21', revenue: 450, profit: 200 },
]

const totalRevenue = computed(() => revenueData.reduce((sum, d) => sum + d.revenue, 0))

const totalProfit = computed(() => revenueData.reduce((sum, d) => sum + d.profit, 0))

const profitMargin = computed(() => Math.round((totalProfit.value / totalRevenue.value) * 100))

const totalOrders = ref(120)
const avgOrderValue = computed(() => Math.round(totalRevenue.value / totalOrders.value))

const formatCurrency = (value) => {
  if (value >= 1000) return `${(value / 1000).toFixed(2)} tỷ`
  return `${value} tr`
}

const topProducts = ref([
  { name: 'Honda Vision 2024', revenue: 500, units: 12 },
  { name: 'Yamaha Exciter 155', revenue: 380, units: 8 },
  { name: 'Honda Air Blade', revenue: 320, units: 10 },
  { name: 'Nhớt Castrol Power 1', revenue: 120, units: 245 },
  { name: 'Lọc gió Honda', revenue: 85, units: 180 },
])

const brandRevenueData = [
  { brand: 'Honda', revenue: 450 },
  { brand: 'Yamaha', revenue: 380 },
  { brand: 'Suzuki', revenue: 320 },
  { brand: 'Kawasaki', revenue: 280 },
  { brand: 'SYM', revenue: 250 },
  { brand: 'Piaggio', revenue: 210 },
]

const brandDonutData = computed(() =>
  brandRevenueData.map((d) => ({
    label: d.brand,
    value: d.revenue,
  })),
)

const brandDonutTotal = computed(() => brandRevenueData.reduce((sum, d) => sum + d.revenue, 0))

const brandDonutColors = ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2']

const paymentData = computed(() => [
  { label: 'Tiền mặt', value: 65 },
  { label: 'Chuyển khoản', value: 35 },
])

const paymentColors = ['#DC2626', '#FECACA']

const dailyData = ref([
  { date: '21/09/2025', orders: 15, revenue: 450, profit: 50, growth: 5 },
  { date: '20/09/2025', orders: 10, revenue: 300, profit: 35, growth: -2 },
  { date: '19/09/2025', orders: 18, revenue: 410, profit: 65, growth: 12 },
  { date: '18/09/2025', orders: 12, revenue: 350, profit: 45, growth: 3 },
  { date: '17/09/2025', orders: 8, revenue: 220, profit: 28, growth: -8 },
  { date: '16/09/2025', orders: 14, revenue: 280, profit: 38, growth: 6 },
  { date: '15/09/2025', orders: 11, revenue: 250, profit: 30, growth: 0 },
])

const handleExport = () => {}
const selectedStatuses = ref(['30-days'])

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1200)
})
</script>

<template>
  <div class="p-6 rounded-xl shadow-lg bg-white">
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold mb-1 text-gray-800">Phân Tích Doanh Thu Chi Tiết</h1>
        <p class="text-gray-500 text-sm">Theo dõi doanh thu, lợi nhuận và xu hướng kinh doanh</p>
      </div>
      <div v-if="isLoading" class="flex gap-3">
        <SkeletonLoader width="200px" height="2.5rem" className="rounded-lg" />
        <SkeletonLoader width="100px" height="2.5rem" className="rounded-lg" />
      </div>
      <div v-else class="flex items-center gap-3">
        <RevenueFilterButtons v-model="selectedStatuses" />
        <Button color="secondary" :icon="IconFileExport" text="Export" @click="handleExport" />
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

      <div class="overflow-x-auto rounded-lg shadow-sm border border-gray-300">
        <table class="min-w-full bg-white border-collapse">
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
      </div>
    </template>
  </div>
</template>
