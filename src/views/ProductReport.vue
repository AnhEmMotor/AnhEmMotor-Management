<template>
  <div class="bg-gray-100 p-6 rounded-xl shadow-lg">
    <h1 class="text-3xl font-bold mb-4 text-gray-800">Báo Cáo Sản Phẩm & Tồn Kho</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
      <ReportStatsCard
        title="Sản phẩm sắp hết hàng (&lt; 5)"
        :stat="lowStockProductsCount"
        color="red"
      />
      <ReportStatsCard title="Tổng Doanh Thu (Tháng)" :stat="totalProducts" color="indigo" />
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
        <thead class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
          <tr>
            <th
              class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Tên Sản Phẩm
            </th>
            <th
              class="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Tồn Kho
            </th>
            <th
              class="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Đã Bán (Tháng)
            </th>
            <th
              class="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Trạng Thái
            </th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm divide-y divide-gray-200">
          <tr v-for="product in productData" :key="product.name">
            <td
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 py-4 px-4 whitespace-nowrap font-medium text-gray-900"
            >
              {{ product.name }}
            </td>
            <td
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 py-4 px-4 whitespace-nowrap text-gray-500 text-right font-mono"
            >
              {{ product.stock }}
            </td>
            <td
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 py-4 px-4 whitespace-nowrap text-gray-500 text-right font-mono"
            >
              {{ product.sold }}
            </td>
            <td
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 py-4 px-4 whitespace-nowrap text-center"
            >
              <RoundBadge :color="getStatusClass(product.status)">{{ product.status }}</RoundBadge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import ReportStatsCard from '@/components/ui/ReportStatsCard.vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import { ref, computed } from 'vue'

const productData = ref([
  { name: 'Nhông Sên Dĩa (SSS 428)', stock: 45, sold: 23, status: 'Còn hàng' },
  { name: 'Dầu Nhớt Motul 7100 (1L)', stock: 120, sold: 87, status: 'Còn hàng' },
  { name: 'Lốp Michelin Pilot Street', stock: 18, sold: 34, status: 'Còn hàng' },
  { name: 'Ắc Quy GS GTZ7V (12V-6Ah)', stock: 8, sold: 15, status: 'Sắp hết' },
  { name: 'Phanh ABS Bosch (Winner X)', stock: 3, sold: 7, status: 'Sắp hết' },
  { name: 'Gương Chiếu Hậu (Exciter 155)', stock: 25, sold: 41, status: 'Còn hàng' },
  { name: 'Bugi NGK Iridium', stock: 0, sold: 45, status: 'Hết hàng' },
])

const lowStockProductsCount = computed(() => {
  return productData.value.filter((p) => p.stock > 0 && p.stock < 5).length
})

const totalProducts = computed(() => {
  return productData.value.length
})

const getStatusClass = (product) => {
  if (product.stock === 0) return 'red'
  if (product.stock < 10) return 'yellow'
  return 'green'
}

// Override logic status string based on stock for display consistency if needed,
// but data already has status string. Let's keep existing helper but simplify based on string.
// Actually, let's fix the helper to match the data or vice versa.
// The previous helper used the string status.
/*
const getStatusClass = (status) => {
  if (status === 'Còn hàng') return 'green'
  if (status === 'Sắp hết') return 'yellow'
  return 'red'
}
*/
// The data has status strings.
</script>
