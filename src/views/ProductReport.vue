<script setup>
import { ref, computed, onMounted } from 'vue'
import ReportStatsCard from '@/components/ui/ReportStatsCard.vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import HorizontalBarChart from '@/components/charts/HorizontalBarChart.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import IconFileExport from '@/components/icons/IconFileExport.vue'

const isLoading = ref(true)
const sortBy = ref('sold')

const sortOptions = [
  { value: 'sold', label: 'Bán chạy nhất' },
  { value: 'margin', label: 'Lợi nhuận cao nhất' },
  { value: 'stock', label: 'Tồn kho nhiều nhất' },
  { value: 'name', label: 'Tên A-Z' },
]

const productData = ref([
  {
    name: 'Nhông Sên Dĩa (SSS 428)',
    costPrice: 280000,
    sellPrice: 350000,
    stock: 45,
    maxStock: 80,
    sold: 23,
    trend: [15, 18, 23],
    status: 'Còn hàng',
  },
  {
    name: 'Dầu Nhớt Motul 7100 (1L)',
    costPrice: 240000,
    sellPrice: 350000,
    stock: 120,
    maxStock: 200,
    sold: 87,
    trend: [60, 75, 87],
    status: 'Còn hàng',
  },
  {
    name: 'Lốp Michelin Pilot Street',
    costPrice: 720000,
    sellPrice: 850000,
    stock: 18,
    maxStock: 50,
    sold: 34,
    trend: [40, 38, 34],
    status: 'Còn hàng',
  },
  {
    name: 'Ắc Quy GS GTZ7V (12V-6Ah)',
    costPrice: 350000,
    sellPrice: 450000,
    stock: 3,
    maxStock: 30,
    sold: 15,
    trend: [12, 14, 15],
    status: 'Sắp hết',
  },
  {
    name: 'Phanh ABS Bosch (Winner X)',
    costPrice: 1200000,
    sellPrice: 1500000,
    stock: 3,
    maxStock: 20,
    sold: 7,
    trend: [5, 6, 7],
    status: 'Sắp hết',
  },
  {
    name: 'Gương Chiếu Hậu (Exciter 155)',
    costPrice: 85000,
    sellPrice: 120000,
    stock: 25,
    maxStock: 60,
    sold: 41,
    trend: [30, 35, 41],
    status: 'Còn hàng',
  },
  {
    name: 'Bugi NGK Iridium',
    costPrice: 130000,
    sellPrice: 220000,
    stock: 0,
    maxStock: 100,
    sold: 45,
    trend: [50, 48, 45],
    status: 'Hết hàng',
  },
])

const getMargin = (p) => Math.round(((p.sellPrice - p.costPrice) / p.sellPrice) * 100)

const getRevenue = (p) => p.sellPrice * p.sold
const getProfit = (p) => (p.sellPrice - p.costPrice) * p.sold

const formatPrice = (v) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}tr`
  return `${(v / 1000).toFixed(0)}k`
}

const getTrendIcon = (trend) => {
  if (trend.length < 2) return '—'
  const last = trend[trend.length - 1]
  const prev = trend[trend.length - 2]
  if (last > prev) return '📈'
  if (last < prev) return '📉'
  return '➖'
}

const stockPercent = (p) => Math.round((p.stock / p.maxStock) * 100)

const getStockStatus = (p) => {
  if (p.stock === 0) return { text: 'Hết hàng', color: 'red' }
  if (p.stock < 5) return { text: 'Sắp hết', color: 'yellow' }
  return { text: 'Còn hàng', color: 'green' }
}

const bestSeller = computed(() => {
  const sorted = [...productData.value].sort((a, b) => b.sold - a.sold)
  return sorted[0]
})

const deadStock = computed(() => {
  const slow = [...productData.value].filter((p) => p.stock > 0).sort((a, b) => a.sold - b.sold)
  return slow[0]
})

const deadStockValue = computed(() => {
  if (!deadStock.value) return 0
  return deadStock.value.stock * deadStock.value.costPrice
})

const avgTurnover = computed(() => {
  const turnovers = productData.value.filter((p) => p.stock > 0).map((p) => p.sold / p.stock)
  return turnovers.length ? (turnovers.reduce((a, b) => a + b, 0) / turnovers.length).toFixed(1) : 0
})

const totalSKUs = computed(() => productData.value.length)

const topRevenueData = computed(() =>
  [...productData.value]
    .sort((a, b) => getRevenue(b) - getRevenue(a))
    .slice(0, 5)
    .map((p) => ({ label: p.name, value: Math.round(getRevenue(p) / 1000000) })),
)

const topProfitData = computed(() =>
  [...productData.value]
    .sort((a, b) => getProfit(b) - getProfit(a))
    .slice(0, 5)
    .map((p) => ({ label: p.name, value: Math.round(getProfit(p) / 1000000) })),
)

const filteredProducts = computed(() => {
  let result = [...productData.value]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((p) => p.name.toLowerCase().includes(q))
  }

  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'sold':
        return b.sold - a.sold
      case 'margin':
        return getMargin(b) - getMargin(a)
      case 'stock':
        return b.stock - a.stock
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  return result
})

const handleExport = () => {}
const searchQuery = ref('')

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
          <svg
            class="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
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
          :stat="bestSeller?.name"
          :subtitle="`Đã bán: ${bestSeller?.sold} cái`"
          color="red"
          mode="detail"
        />
        <ReportStatsCard
          title="Tồn Kho Lâu Nhất"
          :stat="deadStock?.name"
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
              :key="product.name"
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0"
                  >
                    SP
                  </div>
                  <span class="font-medium text-gray-900">{{ product.name }}</span>
                </div>
              </td>
              <td class="py-3 px-4 whitespace-nowrap text-right font-mono text-gray-700">
                {{ formatPrice(product.sellPrice) }}
              </td>
              <td class="py-3 px-4 whitespace-nowrap text-right">
                <span class="font-mono text-gray-700">{{ product.sold }}</span>
                <span class="ml-1">{{ getTrendIcon(product.trend) }}</span>
              </td>
              <td class="py-3 px-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-gray-700 w-8 text-right">{{ product.stock }}</span>
                  <div class="flex-1">
                    <div class="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        class="h-1.5 rounded-full transition-all duration-500"
                        :class="
                          product.stock === 0
                            ? 'bg-gray-300'
                            : product.stock < 5
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
                    getMargin(product) >= 30
                      ? 'text-green-600'
                      : getMargin(product) >= 20
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  "
                >
                  {{ getMargin(product) }}%
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
