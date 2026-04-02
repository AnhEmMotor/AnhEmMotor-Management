<script setup>
import { storeToRefs } from 'pinia'
import { useStatisticsStore } from '@/stores/statistics.store'
import ReportStatsCard from '@/components/ui/ReportStatsCard.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import HorizontalBarChart from '@/components/statistics/HorizontalBarChart.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import ProductStatisticsTable from '@/components/statistics/ProductStatisticsTable.vue'
import IconFileExport from '@/assets/icons/IconFileExport.svg'
import IconSearch from '@/assets/icons/search.svg'
import { formatCurrency } from '@/utils/currency'

const store = useStatisticsStore()
const {
  productSearchQuery: searchQuery,
  productSortBy: sortBy,
  productReport: reportData,
  isProductLoading: isLoading,
  filteredProducts,
} = storeToRefs(store)

const sortOptions = [
  { value: 'sold', label: 'Bán chạy nhất' },
  { value: 'margin', label: 'Lợi nhuận cao nhất' },
  { value: 'stock', label: 'Tồn kho nhiều nhất' },
  { value: 'name', label: 'Tên A-Z' },
]

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

    <template v-else-if="reportData">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <ReportStatsCard
          title="Best Seller"
          :stat="reportData.highlights.bestSellerName"
          :subtitle="`Đã bán: ${reportData.highlights.bestSellerSold} cái`"
          color="red"
          mode="detail"
        />
        <ReportStatsCard
          title="Tồn Kho Lâu Nhất"
          :stat="reportData.highlights.deadStockName"
          :subtitle="`Giá trị: ${formatCurrency(reportData.highlights.deadStockValue)}`"
          color="yellow"
          mode="detail"
        />
        <ReportStatsCard
          title="Vòng Quay Kho TB"
          :stat="`${reportData.highlights.avgTurnover}x`"
          subtitle="Tốc độ luân chuyển"
          color="green"
        />
        <ReportStatsCard
          title="Tổng Mã Hàng"
          :stat="String(reportData.highlights.totalSKUs)"
          subtitle="Đang kinh doanh"
          color="purple"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="border border-gray-200 rounded-lg p-4">
          <h2 class="text-base font-semibold text-gray-700 mb-3">Top 5 Doanh Thu</h2>
          <HorizontalBarChart
            :data="reportData.topRevenueChart"
            color="#DC2626"
            :formatValue="(v) => `${v} tr`"
          />
        </div>
        <div class="border border-gray-200 rounded-lg p-4">
          <h2 class="text-base font-semibold text-gray-700 mb-3">Top 5 Lợi Nhuận</h2>
          <HorizontalBarChart
            :data="reportData.topProfitChart"
            color="#F87171"
            :formatValue="(v) => `${v} tr`"
          />
        </div>
      </div>

      <ProductStatisticsTable :products="filteredProducts" />
    </template>
  </div>
</template>
