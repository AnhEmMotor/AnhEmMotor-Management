<script setup>
import ReportStatsCard from '@/components/ui/ReportStatsCard.vue';
import RoundBadge from '@/components/ui/RoundBadge.vue';
import { ref, computed } from 'vue';

const warehouseData = ref([
  { name: 'HonDa', totalStock: 245, lowStock: 12, outOfStock: 3, status: 'Bình thường' },
  { name: 'YaMaHa', totalStock: 198, lowStock: 8, outOfStock: 1, status: 'Bình thường' },
  { name: 'SuZuKi', totalStock: 156, lowStock: 15, outOfStock: 5, status: 'Cảnh báo' },
  { name: 'KaWaSaKi', totalStock: 89, lowStock: 22, outOfStock: 8, status: 'Cảnh báo' },
]);

const totalStock = computed(() => {
  return warehouseData.value.reduce((sum, item) => sum + item.totalStock, 0);
});

const totalLowStock = computed(() => {
  return warehouseData.value.reduce((sum, item) => sum + item.lowStock, 0);
});

const totalOutOfStock = computed(() => {
  return warehouseData.value.reduce((sum, item) => sum + item.outOfStock, 0);
});

const getStatusClass = (status) => {
  if (status === 'Bình thường') return 'green';
  if (status === 'Cảnh báo') return 'yellow';
  return 'red';
};
</script>

<template>
  <div class="bg-gray-100 p-6 rounded-xl shadow-lg">
    <h1 class="text-3xl font-bold mb-4 text-gray-800">Báo Cáo Tình Trạng Kho</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
      <ReportStatsCard
        title="Tổng Số Sản Phẩm Trong Kho"
        :stat="totalStock"
        color="indigo"
      />
      <ReportStatsCard
        title="Sản Phẩm Sắp Hết Hàng"
        :stat="totalLowStock"
        color="yellow"
      />
      <ReportStatsCard title="Sản Phẩm Hết Hàng" :stat="totalOutOfStock" color="red" />
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
        <thead class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
          <tr>
            <th
              class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Hãng Xe
            </th>
            <th
              class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Tổng Tồn Kho
            </th>
            <th
              class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Sắp Hết Hàng
            </th>
            <th
              class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Hết Hàng
            </th>
            <th
              class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Trạng Thái
            </th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm divide-y divide-gray-200">
          <tr v-for="item in warehouseData" :key="item.name">
            <td
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 py-4 px-4 whitespace-nowrap font-medium text-gray-900"
            >
              {{ item.name }}
            </td>
            <td
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 py-4 px-4 whitespace-nowrap text-gray-500"
            >
              {{ item.totalStock }}
            </td>
            <td
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 py-4 px-4 whitespace-nowrap text-gray-500"
            >
              {{ item.lowStock }}
            </td>
            <td
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 py-4 px-4 whitespace-nowrap text-gray-500"
            >
              {{ item.outOfStock }}
            </td>
            <td
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 py-4 px-4 whitespace-nowrap"
            >
              <RoundBadge :color="getStatusClass(item.status)">{{ item.status }}</RoundBadge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
