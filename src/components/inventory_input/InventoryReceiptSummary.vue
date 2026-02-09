<script setup>
import { formatDateTime } from '@/composables/useDate'
import RoundBadge from '../ui/RoundBadge.vue'

defineProps({
  itemData: Object,
  isOpen: Boolean,
})
defineEmits(['toggle-detail', 'edit', 'copy', 'cancel-request'])

function formatCurrency(value) {
  if (!value && value !== 0) return ''
  return value.toLocaleString('vi-VN')
}

function getStatusColor(status) {
  switch (status) {
    case 'finished':
      return 'green'
    case 'working':
      return 'yellow'
    case 'cancelled':
      return 'red'
    default:
      return 'gray'
  }
}

function getStatusName(status) {
  switch (status) {
    case 'finished':
      return 'Đã hoàn thành'
    case 'working':
      return 'Phiếu tạm/chưa hoàn thành'
    case 'cancelled':
      return 'Đã huỷ'
    default:
      return 'Chưa xác định'
  }
}
</script>

<template>
  <div class="mb-1 border p-3 md:p-0 md:border-none" @click="$emit('toggle-detail')">
    <div
      class="hidden md:grid grid-cols-[1.5fr_2fr_1.5fr_1.2fr] items-center py-2 px-3 text-sm cursor-pointer transition duration-150"
    >
      <div class="px-5 text-gray-600 whitespace-nowrap text-xs">
        {{ formatDateTime(itemData.time) }}
      </div>
      <div class="px-5 font-medium text-gray-800 truncate text-sm">{{ itemData.supplierName }}</div>
      <div class="px-5 text-right text-sm font-semibold text-red-600">
        {{ formatCurrency(itemData.payable) }}
      </div>
      <div class="flex justify-start px-3">
        <RoundBadge :color="getStatusColor(itemData.status)">
          {{ getStatusName(itemData.status) }}
        </RoundBadge>
      </div>
    </div>

    <div class="block md:hidden space-y-2 text-sm">
      <div class="flex justify-between items-center">
        <div class="font-semibold text-gray-800">{{ itemData.id }}</div>
        <RoundBadge :color="getStatusColor(itemData.status)">
          {{ getStatusName(itemData.status) }}
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
.summary-row-responsive {
  margin-bottom: 0.75rem;
}
@media (min-width: 768px) {
  .summary-row-responsive {
    margin-bottom: 0;
  }
}
</style>
