<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useStatisticsStore } from '@/stores/statistics.store'
import ReportStatsCard from '@/components/ui/ReportStatsCard.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import RevenueFilterButtons from '@/components/statistics/RevenueFilterButtons.vue'
import RevenueChart7day from '@/components/statistics/RevenueChart7day.vue'
import DonutChart from '@/components/statistics/DonutChart.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import RevenueDailyTable from '@/components/statistics/RevenueDailyTable.vue'
import IconFileExport from '@/assets/icons/IconFileExport.svg'
import { formatCurrency } from '@/utils/currency'

const store = useStatisticsStore()
const { revenueAnalysis: analysisData, isRevenueLoading: isLoading } = storeToRefs(store)

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

const paymentColors = ['#DC2626', '#FECACA', '#fca5a5', '#ef4444']

const handleExport = () => {}
const selectedStatuses = ref(['30-days'])
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

    <template v-else-if="analysisData">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <ReportStatsCard
          title="Tổng Doanh Thu"
          :stat="formatCurrency(analysisData.summary.totalRevenue)"
          :improvement="15"
          color="red"
        />
        <ReportStatsCard
          title="Lợi Nhuận Ròng"
          :stat="formatCurrency(analysisData.summary.totalProfit)"
          :improvement="analysisData.summary.profitMargin"
          color="green"
        />
        <ReportStatsCard
          title="Tổng Đơn Hàng"
          :stat="analysisData.summary.totalOrders"
          :improvement="-2"
          color="yellow"
        />
        <ReportStatsCard
          title="Giá Trị trung bình / đơn"
          :stat="`${analysisData.summary.totalOrders > 0 ? Math.round(analysisData.summary.totalRevenue / 1000000 / analysisData.summary.totalOrders) : 0} tr`"
          color="purple"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="lg:col-span-2 border border-gray-200 rounded-lg p-4">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">Xu Hướng Doanh Thu & Lợi Nhuận</h2>
          <RevenueChart7day :revenue-data="analysisData.revenueTrendChart" />
        </div>

        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-semibold text-gray-700">Top Sản Phẩm Bán Chạy</h2>
          </div>
          <div class="space-y-3">
            <div
              v-for="(product, index) in analysisData.topProducts"
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
            :data="analysisData.brandDistributionChart"
            :colors="brandDonutColors"
            :centerValue="formatCurrency(analysisData.summary.totalRevenue)"
            centerLabel="Tổng DT"
          />
        </div>

        <div class="border border-gray-200 rounded-lg p-4">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">Phân Tích Thanh Toán</h2>
          <DonutChart
            :data="analysisData.paymentMethodChart"
            :colors="paymentColors"
            centerValue="100%"
            centerLabel="Tổng"
          />
        </div>
      </div>

      <RevenueDailyTable :dailyData="analysisData.dailyTable" />
    </template>
  </div>
</template>


