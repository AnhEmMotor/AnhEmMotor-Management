<script setup>
import RoundBadge from '../ui/RoundBadge.vue'

defineProps({
  itemData: Object,
  isOpen: Boolean,
})
defineEmits(['toggle-detail'])

function formatCurrency(value) {
  if (!value && value !== 0) return ''
  return value.toLocaleString('vi-VN')
}

function getStatusColor(status) {
  switch (status) {
    case 'Đã nhập hàng':
      return 'green'
    case 'Phiếu tạm':
      return 'yellow'
    case 'Đã hủy':
      return 'red'
    default:
      return 'gray'
  }
}
</script>

<template>
  <div
    class="summary-row-responsive border p-3 md:p-0 md:border-none"
    @click="$emit('toggle-detail')"
  >
    <div
      class="hidden md:grid summary-row-grid items-center py-2 px-3 text-sm cursor-pointer transition duration-150"
    >
      <div class="px-5 font-semibold text-gray-800 text-sm">{{ itemData.id }}</div>
      <div class="px-5 text-gray-600 whitespace-nowrap text-xs">{{ itemData.time }}</div>
      <div class="px-5 text-gray-600 text-xs">{{ itemData.supplierCode }}</div>
      <div class="px-5 font-medium text-gray-800 truncate text-sm">{{ itemData.supplierName }}</div>
      <div class="px-5 text-right text-sm font-semibold text-red-600">
        {{ formatCurrency(itemData.payable) }}
      </div>
      <div class="flex justify-start px-3">
        <RoundBadge :color="getStatusColor(itemData.status)">
          {{ itemData.status }}
        </RoundBadge>
      </div>
    </div>

    <div class="block md:hidden space-y-2 text-sm">
      <div class="flex justify-between items-center">
        <div class="font-semibold text-gray-800">{{ itemData.id }}</div>
        <RoundBadge :color="getStatusColor(itemData.status)">
          {{ itemData.status }}
        </RoundBadge>
      </div>
      <div class="text-gray-600 text-xs">{{ itemData.time }}</div>
      <div class="pt-2">
        <div class="font-medium text-gray-800 truncate">{{ itemData.supplierName }}</div>
        <div class="text-gray-600 text-xs">{{ itemData.supplierCode }}</div>
      </div>
      <div class="flex justify-between items-center pt-2">
        <div class="text-gray-500">Cần trả NCC</div>
        <div class="font-semibold text-red-600">{{ formatCurrency(itemData.payable) }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-row-grid {
  grid-template-columns: 1fr 1.5fr 1fr 2fr 1.5fr 1.2fr;
}
.summary-row-responsive {
  margin-bottom: 0.75rem; /* 12px */
}
@media (min-width: 768px) {
  .summary-row-responsive {
    margin-bottom: 0;
  }
}
</style>
