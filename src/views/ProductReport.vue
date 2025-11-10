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
              class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Tồn Kho
            </th>
            <th
              class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Đã Bán (Tháng)
            </th>
            <th
              class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
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
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 py-4 px-4 whitespace-nowrap text-gray-500"
            >
              {{ product.stock }}
            </td>
            <td
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 py-4 px-4 whitespace-nowrap text-gray-500"
            >
              {{ product.sold }}
            </td>
            <td
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 py-4 px-4 whitespace-nowrap"
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
  { name: 'VinFast VF8', stock: 12, sold: 85, status: 'Còn hàng' },
  { name: 'Hyundai Accent', stock: 8, sold: 72, status: 'Còn hàng' },
  { name: 'Toyota Vios', stock: 3, sold: 65, status: 'Sắp hết' },
  { name: 'Ford Ranger', stock: 15, sold: 58, status: 'Còn hàng' },
  { name: 'Mazda CX-5', stock: 4, sold: 51, status: 'Sắp hết' },
  { name: 'Kia Seltos', stock: 0, sold: 45, status: 'Hết hàng' },
])
const lowStockProductsCount = computed(() => {
  return productData.value.filter((p) => p.stock > 0 && p.stock < 5).length
})
const totalProducts = computed(() => {
  return productData.value.length
})
const getStatusClass = (status) => {
  if (status === 'Còn hàng') return 'green'
  if (status === 'Sắp hết') return 'yellow'
  return 'red'
}
</script>
