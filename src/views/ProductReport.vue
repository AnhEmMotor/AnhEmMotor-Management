<script setup>
import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { statisticsService } from '@/api/statistics'
import ReportStatsCard from '@/components/ui/ReportStatsCard.vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import HorizontalBarChart from '@/components/charts/HorizontalBarChart.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import IconFileExport from '@/assets/icons/IconFileExport.svg'
import IconSearch from '@/assets/icons/search.svg'

const sortBy = ref('sold')
const searchQuery = ref('')

const sortOptions = [
  { value: 'sold', label: 'Bán chạy nhất' },
  { value: 'margin', label: 'Lợi nhuận cao nhất' },
  { value: 'stock', label: 'Tồn kho nhiều nhất' },
  { value: 'name', label: 'Tên A-Z' },
]

const { isLoading, data: apiData } = useQuery({
  queryKey: ['admin', 'product-report'],
  queryFn: statisticsService.getAdminProductReport,
  staleTime: 5 * 60 * 1000, // 5 mins
})

const reportData = computed(() => apiData.value || {})

const productData = computed(() => reportData.value.productPerformanceTable || [])

const highlights = computed(() => reportData.value.highlights || {})
const bestSellerName = computed(() => highlights.value.bestSellerName)
const bestSellerSold = computed(() => highlights.value.bestSellerSold || 0)
const deadStockName = computed(() => highlights.value.deadStockName)
const deadStockValue = computed(() => highlights.value.deadStockValue || 0)
const avgTurnover = computed(() => highlights.value.avgTurnover || 0)
const totalSKUs = computed(() => highlights.value.totalSKUs || 0)

const topRevenueData = computed(() => {
  return (reportData.value.topRevenueProducts || []).map((p) => ({
    label: p.productName,
    value: Math.round(p.revenue / 1000000),
  }))
})

const topProfitData = computed(() => {
  return (reportData.value.topProfitProducts || []).map((p) => ({
    label: p.productName,
    value: Math.round(p.profit / 1000000),
  }))
})

const formatPrice = (v) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)} tr`
  return `${(v / 1000).toFixed(0)} k`
}

const getTrendIcon = (trend) => {
  if (!trend || trend.length < 2) return '—'
  const last = trend[trend.length - 1]
  const prev = trend[trend.length - 2]
  if (last > prev) return '📈'
  if (last < prev) return '📉'
  return '➖'
}

const stockPercent = (p) => {
  if (!p.maxStockQuantity) return 0
  return Math.min(100, Math.round((p.stockQuantity / p.maxStockQuantity) * 100))
}

const getStockStatus = (p) => {
  if (p.stockQuantity <= 0) return { text: 'Hết hàng', color: 'red' }
  if (p.stockQuantity < 5) return { text: 'Sắp hết', color: 'yellow' }
  return { text: 'Còn hàng', color: 'green' }
}

const filteredProducts = computed(() => {
  let result = [...productData.value]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((p) => p.productName && p.productName.toLowerCase().includes(q))
  }

  result.sort((a, b) => {
    switch (sortBy.value) {
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

const handleExport = () => {}
</script>

<template>
  <div class="p-6 rounded-xl shadow-lg bg-white">
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold mb-1 text-gray-800">Hiệu Quả Sản Phẩm</h1>
        <p class="text-gray-500 text-sm">
          Phân tích doanh thu, lợi nhuận và hiệu suất từng mã hàng
        </p>
      </div>
      <div v-if="isLoading" class="flex gap-3">
        <SkeletonLoader width="200px" height="2.5rem" className="rounded-lg" />
        <SkeletonLoader width="130px" height="2.5rem" className="rounded-lg" />
        <SkeletonLoader width="100px" height="2.5rem" className="rounded-lg" />
      </div>
      <div v-else class="flex items-center gap-3">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm sản phẩm..."
            class="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none w-56"
          />
          <IconSearch class="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
        </div>
        <select
          v-model="sortBy"
          class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
        >
          <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <Button color="secondary" :icon="IconFileExport" text="Export" @click="handleExport" />
      </div>
    </div>

    <template v-if="isLoading">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SkeletonLoader v-for="i in 4" :key="i" height="6rem" className="rounded-xl" />
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SkeletonLoader height="220px" className="rounded-lg" />
        <SkeletonLoader height="220px" className="rounded-lg" />
      </div>
      <SkeletonLoader height="300px" className="rounded-lg" />
    </template>

    <template v-else>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <ReportStatsCard
          title="Best Seller"
          :stat="bestSellerName"
          :subtitle="`Đã bán: ${bestSellerSold} cái`"
          color="red"
          mode="detail"
        />
        <ReportStatsCard
          title="Tồn Kho Lâu Nhất"
          :stat="deadStockName"
          :subtitle="`Giá trị: ${formatPrice(deadStockValue)}`"
          color="yellow"
          mode="detail"
        />
        <ReportStatsCard
          title="Vòng Quay Kho TB"
          :stat="`${avgTurnover}x`"
          subtitle="Tốc độ luân chuyển"
          color="green"
        />
        <ReportStatsCard
          title="Tổng Mã Hàng"
          :stat="String(totalSKUs)"
          subtitle="Đang kinh doanh"
          color="purple"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="border border-gray-200 rounded-lg p-4">
          <h2 class="text-base font-semibold text-gray-700 mb-3">Top 5 Doanh Thu</h2>
          <HorizontalBarChart
            :data="topRevenueData"
            color="#DC2626"
            :formatValue="(v) => `${v} tr`"
          />
        </div>
        <div class="border border-gray-200 rounded-lg p-4">
          <h2 class="text-base font-semibold text-gray-700 mb-3">Top 5 Lợi Nhuận</h2>
          <HorizontalBarChart
            :data="topProfitData"
            color="#F87171"
            :formatValue="(v) => `${v} tr`"
          />
        </div>
      </div>

      <div class="overflow-x-auto rounded-lg shadow-sm border border-gray-300">
        <table class="min-w-full bg-white border-collapse">
          <thead>
            <tr
              class="bg-gray-50 text-gray-500 uppercase text-xs font-medium tracking-wider leading-normal border-b border-gray-200"
            >
              <th class="py-3 px-4 text-left">Sản Phẩm</th>
              <th class="py-3 px-4 text-right">Giá Bán</th>
              <th class="py-3 px-4 text-right">Đã Bán (30d)</th>
              <th class="py-3 px-4 text-left w-36">Tồn Kho</th>
              <th class="py-3 px-4 text-right">Margin</th>
              <th class="py-3 px-4 text-center">Trạng Thái</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm">
            <tr
              v-for="product in filteredProducts"
              :key="product.productName"
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0"
                  >
                    SP
                  </div>
                  <span class="font-medium text-gray-900">{{ product.productName }}</span>
                </div>
              </td>
              <td class="py-3 px-4 whitespace-nowrap text-right font-mono text-gray-700">
                {{ formatPrice(product.sellPrice) }}
              </td>
              <td class="py-3 px-4 whitespace-nowrap text-right">
                <span class="font-mono text-gray-700">{{ product.soldCount30Days }}</span>
                <span class="ml-1">{{ getTrendIcon(product.trend) }}</span>
              </td>
              <td class="py-3 px-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-gray-700 w-8 text-right">{{
                    product.stockQuantity
                  }}</span>
                  <div class="flex-1">
                    <div class="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        class="h-1.5 rounded-full transition-all duration-500"
                        :class="
                          product.stockQuantity === 0
                            ? 'bg-gray-300'
                            : product.stockQuantity < 5
                              ? 'bg-yellow-400'
                              : 'bg-green-400'
                        "
                        :style="{ width: `${stockPercent(product)}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 whitespace-nowrap text-right">
                <span
                  class="font-semibold"
                  :class="
                    product.marginPercentage >= 30
                      ? 'text-green-600'
                      : product.marginPercentage >= 20
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  "
                >
                  {{ product.marginPercentage }}%
                </span>
              </td>
              <td class="py-3 px-4 whitespace-nowrap text-center">
                <RoundBadge :color="getStockStatus(product).color">
                  {{ getStockStatus(product).text }}
                </RoundBadge>
              </td>
            </tr>
            <tr v-if="filteredProducts.length === 0">
              <td colspan="6" class="text-center py-8 text-gray-400">
                Không tìm thấy sản phẩm phù hợp
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
