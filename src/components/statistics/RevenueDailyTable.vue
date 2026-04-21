<script setup>
defineProps({
  dailyData: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="overflow-x-auto rounded-lg shadow-sm border border-gray-300">
    <table class="min-w-full bg-white border-collapse">
      <thead>
        <tr
          class="bg-gray-50 text-gray-500 uppercase text-xs font-medium tracking-wider leading-normal border-b border-gray-200"
        >
          <th class="py-3 px-6 text-left">Ngày</th>
          <th class="py-3 px-6 text-right">Số Đơn</th>
          <th class="py-3 px-6 text-right">Doanh Thu (tr)</th>
          <th class="py-3 px-6 text-right">Lợi Nhuận (tr)</th>
          <th class="py-3 px-6 text-center">Tăng Trưởng</th>
        </tr>
      </thead>
      <tbody class="text-gray-600 text-sm">
        <tr
          v-for="row in dailyData"
          :key="row.date"
          class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <td class="py-3 px-6 whitespace-nowrap font-medium text-gray-900">{{ row.date }}</td>
          <td class="py-3 px-6 whitespace-nowrap text-right font-mono">{{ row.orders }}</td>
          <td class="py-3 px-6 whitespace-nowrap text-right font-mono">{{ row.revenue }}</td>
          <td class="py-3 px-6 whitespace-nowrap text-right font-mono">{{ row.profit }}</td>
          <td class="py-3 px-6 whitespace-nowrap text-center">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
              :class="row.growth >= 0 ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'"
            >
              {{ row.growth >= 0 ? '▲' : '▼' }} {{ Math.abs(row.growth) }}%
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>


