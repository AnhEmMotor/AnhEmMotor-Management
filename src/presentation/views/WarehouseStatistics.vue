<script setup>
import { storeToRefs } from 'pinia'
import { useStatisticsStore } from '@stores/statistics.store'
import ReportStatsCard from '@components/ui/ReportStatsCard.vue'
import Button from '@components/ui/button/BaseButton.vue'
import StackedBarChart from '@components/statistics/StackedBarChart.vue'
import DonutChart from '@components/statistics/DonutChart.vue'
import SkeletonLoader from '@components/ui/SkeletonLoader.vue'
import WarehouseStockTable from '@components/statistics/WarehouseStockTable.vue'
import IconPlus from '@/assets/icons/IconPlus.svg'
import IconFileExport from '@/assets/icons/IconFileExport.svg'
import { formatCurrency } from '@/utils/currency'

const store = useStatisticsStore()
const { warehouseReport: reportData, isWarehouseLoading: isLoading } = storeToRefs(store)

const handleExport = () => {}
const handleImport = () => {}
const handleViewDetail = () => {}
const handleRestock = () => {}
</script>

<template>
  <div class="p-6 rounded-xl shadow-lg bg-white">
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold mb-1 text-gray-800">Báo Cáo Tình Trạng Kho</h1>
        <p class="text-gray-500 text-sm">Tổng quan tình trạng tồn kho theo hãng xe</p>
      </div>
      <div v-if="isLoading" class="flex gap-2">
        <SkeletonLoader width="100px" height="2.5rem" className="rounded-lg" />
        <SkeletonLoader width="100px" height="2.5rem" className="rounded-lg" />
      </div>
      <div v-else class="flex items-center gap-2">
        <Button color="secondary" :icon="IconFileExport" text="Export" @click="handleExport" />
        <Button color="primary" :icon="IconPlus" text="Nhập Kho" @click="handleImport" />
      </div>
    </div>

    <template v-if="isLoading">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SkeletonLoader v-for="i in 4" :key="i" height="6rem" className="rounded-xl" />
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <SkeletonLoader className="lg:col-span-3 rounded-lg" height="250px" />
        <SkeletonLoader className="lg:col-span-2 rounded-lg" height="250px" />
      </div>
      <SkeletonLoader height="200px" className="rounded-lg" />
    </template>

    <template v-else-if="reportData">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <ReportStatsCard
          title="Tổng Tồn Kho"
          :stat="reportData.summary.totalStock"
          :improvement="12"
          color="red"
        />
        <ReportStatsCard
          title="Giá Trị Tồn Kho"
          :stat="formatCurrency(reportData.summary.totalValue)"
          :improvement="8"
          color="green"
        />
        <ReportStatsCard
          title="Sắp Hết Hàng"
          :stat="reportData.summary.lowStockCount"
          :improvement="-5"
          color="yellow"
        />
        <ReportStatsCard
          title="Hết Hàng"
          :stat="reportData.summary.outOfStockCount"
          :improvement="-2"
          color="purple"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div class="lg:col-span-3 border border-gray-200 rounded-lg p-4">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">Tồn Kho Theo Hãng Xe</h2>
          <StackedBarChart :data="reportData.stockByBrandChart" />
        </div>
        <div class="lg:col-span-2 border border-gray-200 rounded-lg p-4">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">Tỷ Lệ Tình Trạng Kho</h2>
          <DonutChart
            :data="reportData.stockStatusRatioChart"
            :centerValue="reportData.summary.totalStock"
            centerLabel="Tổng SP"
          />
        </div>
      </div>

      <WarehouseStockTable
        :warehouseData="reportData.warehouseTable"
        @view-detail="handleViewDetail"
        @restock="handleRestock"
      />
    </template>
  </div>
</template>



