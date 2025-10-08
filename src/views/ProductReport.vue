<template>
  <div class="box-bg">
    <h1 class="title-style">Báo Cáo Sản Phẩm & Tồn Kho</h1>
    <div class="report-card-style">
      <ReportStatsCard
        title="Sản phẩm sắp hết hàng (&lt; 5)"
        :stat="lowStockProductsCount"
        color="red"
      />
      <ReportStatsCard title="Tổng Doanh Thu (Tháng)" :stat="totalProducts" color="indigo" />
    </div>
    <div class="overflow-x-auto">
      <table class="table-style">
        <thead class="header-table-style">
          <tr>
            <th class="cell-header-table-style">Tên Sản Phẩm</th>
            <th class="cell-header-table-style">Tồn Kho</th>
            <th class="cell-header-table-style">Đã Bán (Tháng)</th>
            <th class="cell-header-table-style">Trạng Thái</th>
          </tr>
        </thead>
        <tbody class="tbody-table-style">
          <tr v-for="product in productData" :key="product.name">
            <td class="row-table-style font-medium text-gray-900">
              {{ product.name }}
            </td>
            <td class="row-table-style text-gray-500">{{ product.stock }}</td>
            <td class="row-table-style text-gray-500">{{ product.sold }}</td>
            <td class="row-table-style">
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

<style lang="css" scoped>
@reference "../assets/main.css";
.report-card-style {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8;
}
.box-bg {
  @apply bg-gray-100 p-6 rounded-xl shadow-lg;
}
.title-style {
  @apply text-3xl font-bold mb-4 text-gray-800;
}
.text-style {
  @apply py-3 px-6 text-left;
}
.text-center-style {
  @apply py-3 px-6 text-center;
}
.table-style {
  @apply min-w-full bg-white rounded-lg overflow-hidden shadow-sm;
}
.header-table-style {
  @apply bg-gray-200 text-gray-600 uppercase text-sm leading-normal;
}
.cell-header-table-style {
  @apply py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider;
}
.tbody-table-style {
  @apply text-gray-600 text-sm divide-y divide-gray-200;
}
.row-table-style {
  @apply border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 py-4 px-4 whitespace-nowrap;
}
</style>
