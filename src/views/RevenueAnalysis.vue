<template>
  <div class="bg-white p-6 rounded-xl shadow-lg">
    <h1 class="text-3xl font-bold mb-4 text-red-800">Phân Tích Doanh Thu Chi Tiết</h1>
    <div class="flex flex-wrap items-center gap-4 mb-6">
      <div>
        <span class="text-sm font-medium text-red-700 mr-2">Khoảng Thời gian:</span>
        <div class="inline-flex">
          <RevenueFilterButtons v-model="selectedStatuses" />
        </div>
      </div>
      <div>
        <label for="car-brand" class="text-sm font-medium text-red-700 mr-2">Hãng Xe:</label>
        <select
          id="car-brand"
          v-model="selectedBrand"
          class="rounded-md border-red-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200"
        >
          <option v-for="brand in carBrands" :key="brand" :value="brand">{{ brand }}</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div class="lg:col-span-3 bg-white p-6 rounded-xl shadow-md h-96">
        <h3 class="text-lg font-semibold text-red-700 mb-4">Xu Hướng Doanh Thu</h3>
        <RevenueChart7day :revenue-data="revenueData" />
      </div>

      <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-md h-96">
        <h3 class="text-lg font-semibold text-red-700 mb-4">Doanh Thu Theo Hãng Xe</h3>
        <RevenueChartByBrand :chart-data="brandRevenueData" />
      </div>
    </div>
  </div>
</template>

<script setup>
import RevenueFilterButtons from '@/components/report/RevenueFilterButtons.vue'
import { ref } from 'vue'
import RevenueChart7day from '@/components/report/RevenueChart7day.vue'
import RevenueChartByBrand from '@/components/report/RevenueChartByBrand.vue'

const selectedBrand = ref('Tất cả')
const selectedStatuses = ref(['30-days'])

const revenueData = [
  { date: '2025-09-15', revenue: 250, profit: 90 },
  { date: '2025-09-16', revenue: 280, profit: 110 },
  { date: '2025-09-17', revenue: 220, profit: 80 },
  { date: '2025-09-18', revenue: 350, profit: 150 },
  { date: '2025-09-19', revenue: 410, profit: 180 },
  { date: '2025-09-20', revenue: 380, profit: 165 },
  { date: '2025-09-21', revenue: 450, profit: 200 },
]
const carBrands = ['Tất cả', 'HonDa', 'YaMaHa', 'SuZuKi', 'KaWaSaKi']

const brandRevenueData = [
  { brand: 'VinFast', revenue: 450 },
  { brand: 'Hyundai', revenue: 380 },
  { brand: 'Toyota', revenue: 320 },
  { brand: 'Ford', revenue: 280 },
  { brand: 'Mazda', revenue: 250 },
  { brand: 'Kia', revenue: 210 },
]
</script>
