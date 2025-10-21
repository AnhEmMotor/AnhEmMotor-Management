<script setup>
import RoundBadge from '../ui/RoundBadge.vue'

defineProps({
  itemData: Object,
  isOpen: Boolean,
})
defineEmits(['toggle-detail'])

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'decimal',
  minimumFractionDigits: 0,
})

function formatCurrency(number) {
  if (typeof number !== 'number') return '0'
  return currencyFormatter.format(number) + ''
}

function getStatusColor(status) {
  switch (status) {
    case 'active':
      return 'green'
    case 'inactive':
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
      class="hidden md:grid summary-row-grid items-center py-3 px-5 text-sm cursor-pointer transition duration-150"
    >
      <div class="font-medium text-gray-800 truncate text-sm">{{ itemData.name }}</div>
      <div class="text-gray-600 text-xs">{{ itemData.phone || '---' }}</div>
      <div class="text-gray-600 text-xs">{{ itemData.email || 'Chưa có' }}</div>
      <div class="text-right text-sm font-semibold text-red-600">
        {{ formatCurrency(itemData.totalPurchase) }}
      </div>
      <div class="flex justify-start">
        <RoundBadge :color="getStatusColor(itemData.status)">
          {{ itemData.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động' }}
        </RoundBadge>
      </div>
    </div>

    <div class="block md:hidden space-y-2 text-sm">
      <div class="flex justify-between items-center">
        <div class="font-semibold text-gray-800">{{ itemData.id }}</div>
        <RoundBadge :color="getStatusColor(itemData.status)">
          {{ itemData.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động' }}
        </RoundBadge>
      </div>
      <div class="pt-2">
        <div class="font-medium text-gray-800 truncate">{{ itemData.name }}</div>
        <div class="text-gray-600 text-xs">{{ itemData.phone }}</div>
      </div>
      <div class="flex justify-between items-center pt-2">
        <div class="text-gray-500">Tổng mua</div>
        <div class="font-semibold text-red-600">{{ formatCurrency(itemData.totalPurchase) }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-row-grid {
  display: grid;
  grid-template-columns: repeat(16, minmax(0, 1fr));
  gap: 0.5rem;
  align-items: center;
}

/* Match header spans: 8 / 2 / 2 / 2 / 2 */
.summary-row-grid > :nth-child(1) {
  grid-column: 1 / span 8; /* Tên */
}
.summary-row-grid > :nth-child(2) {
  grid-column: 9 / span 2; /* Điện thoại */
}
.summary-row-grid > :nth-child(3) {
  grid-column: 11 / span 2; /* Email */
}
.summary-row-grid > :nth-child(4) {
  grid-column: 13 / span 2; /* Tổng mua */
  justify-self: end;
}
.summary-row-grid > :nth-child(5) {
  grid-column: 15 / span 2; /* Trạng thái */
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
