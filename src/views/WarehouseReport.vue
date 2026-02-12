<script setup>
import { ref, computed, onMounted } from 'vue'
import ReportStatsCard from '@/components/ui/ReportStatsCard.vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import SmallNoBgButton from '@/components/ui/button/SmallNoBgButton.vue'
import StackedBarChart from '@/components/charts/StackedBarChart.vue'
import DonutChart from '@/components/charts/DonutChart.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconFileExport from '@/components/icons/IconFileExport.vue'
import IconExpand from '@/components/icons/IconExpand.vue'

const isLoading = ref(true)

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1200)
})

const warehouseData = ref([
  {
    name: 'Honda',
    totalStock: 245,
    capacity: 300,
    lowStock: 12,
    outOfStock: 3,
    status: 'Bình thường',
    value: 1250000000,
  },
  {
    name: 'Yamaha',
    totalStock: 198,
    capacity: 250,
    lowStock: 8,
    outOfStock: 1,
    status: 'Bình thường',
    value: 980000000,
  },
  {
    name: 'Suzuki',
    totalStock: 156,
    capacity: 200,
    lowStock: 15,
    outOfStock: 5,
    status: 'Cảnh báo',
    value: 650000000,
  },
  {
    name: 'Kawasaki',
    totalStock: 89,
    capacity: 150,
    lowStock: 22,
    outOfStock: 8,
    status: 'Cảnh báo',
    value: 420000000,
  },
])

const totalStock = computed(() =>
  warehouseData.value.reduce((sum, item) => sum + item.totalStock, 0),
)

const totalValue = computed(() => warehouseData.value.reduce((sum, item) => sum + item.value, 0))

const totalLowStock = computed(() =>
  warehouseData.value.reduce((sum, item) => sum + item.lowStock, 0),
)

const totalOutOfStock = computed(() =>
  warehouseData.value.reduce((sum, item) => sum + item.outOfStock, 0),
)

const formatCurrency = (value) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)} tỷ`
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)} triệu`
  return value.toLocaleString('vi-VN')
}

const capacityPercent = (item) => Math.round((item.totalStock / item.capacity) * 100)

const getStatusClass = (status) => {
  if (status === 'Bình thường') return 'gray'
  return 'red'
}

const barChartData = computed(() =>
  warehouseData.value.map((item) => ({
    name: item.name,
    inStock: item.totalStock - item.lowStock - item.outOfStock,
    lowStock: item.lowStock,
    outOfStock: item.outOfStock,
  })),
)

const donutChartData = computed(() => {
  const safe = totalStock.value - totalLowStock.value - totalOutOfStock.value
  return [
    { label: 'An toàn', value: safe },
    { label: 'Sắp hết', value: totalLowStock.value },
    { label: 'Hết hàng', value: totalOutOfStock.value },
  ]
})

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

    <template v-else>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <ReportStatsCard title="Tổng Tồn Kho" :stat="totalStock" :improvement="12" color="red" />
        <ReportStatsCard
          title="Giá Trị Tồn Kho"
          :stat="formatCurrency(totalValue)"
          :improvement="8"
          color="green"
        />
        <ReportStatsCard
          title="Sắp Hết Hàng"
          :stat="totalLowStock"
          :improvement="-5"
          color="yellow"
        />
        <ReportStatsCard
          title="Hết Hàng"
          :stat="totalOutOfStock"
          :improvement="-2"
          color="purple"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div class="lg:col-span-3 border border-gray-200 rounded-lg p-4">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">Tồn Kho Theo Hãng Xe</h2>
          <StackedBarChart :data="barChartData" />
        </div>
        <div class="lg:col-span-2 border border-gray-200 rounded-lg p-4">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">Tỷ Lệ Tình Trạng Kho</h2>
          <DonutChart :data="donutChartData" :centerValue="totalStock" centerLabel="Tổng SP" />
        </div>
      </div>

      <div class="overflow-x-auto rounded-lg shadow-sm border border-gray-300">
        <table class="min-w-full bg-white border-collapse">
          <thead>
            <tr
              class="bg-gray-50 text-gray-500 uppercase text-xs font-medium tracking-wider leading-normal border-b border-gray-200"
            >
              <th class="py-3 px-6 text-left">Hãng Xe</th>
              <th class="py-3 px-6 text-left w-48">Tổng Tồn Kho</th>
              <th class="py-3 px-6 text-right">Sắp Hết Hàng</th>
              <th class="py-3 px-6 text-right">Hết Hàng</th>
              <th class="py-3 px-6 text-center">Trạng Thái</th>
              <th class="py-3 px-6 text-center w-32">Hành Động</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 text-sm">
            <tr
              v-for="item in warehouseData"
              :key="item.name"
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-6 whitespace-nowrap font-medium text-gray-900">
                {{ item.name }}
              </td>
              <td class="py-3 px-6 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <span class="font-mono text-gray-700">{{ item.totalStock }}</span>
                  <div class="flex-1">
                    <div class="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        class="h-1.5 rounded-full transition-all duration-500"
                        :class="
                          capacityPercent(item) > 70
                            ? 'bg-red-300'
                            : capacityPercent(item) > 40
                              ? 'bg-red-400'
                              : 'bg-red-600'
                        "
                        :style="{ width: `${capacityPercent(item)}%` }"
                      ></div>
                    </div>
                  </div>
                  <span class="text-xs text-gray-400 w-10 text-right"
                    >{{ capacityPercent(item) }}%</span
                  >
                </div>
              </td>
              <td class="py-3 px-6 whitespace-nowrap text-right font-mono text-gray-500">
                {{ item.lowStock }}
              </td>
              <td class="py-3 px-6 whitespace-nowrap text-right font-mono text-gray-500">
                {{ item.outOfStock }}
              </td>
              <td class="py-3 px-6 whitespace-nowrap text-center">
                <RoundBadge :color="getStatusClass(item.status)">{{ item.status }}</RoundBadge>
              </td>
              <td class="py-3 px-6 whitespace-nowrap text-center">
                <div class="flex items-center justify-center gap-2">
                  <SmallNoBgButton color="gray" @click.stop="handleViewDetail(item)">
                    <IconExpand class="w-4 h-4" />
                  </SmallNoBgButton>
                  <SmallNoBgButton color="red" @click.stop="handleRestock(item)">
                    <IconPlus class="w-4 h-4" />
                  </SmallNoBgButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
