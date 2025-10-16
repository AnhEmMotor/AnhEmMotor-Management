<script setup>
import RoundBadge from '../ui/RoundBadge.vue'

defineProps({
  itemData: Object,
  isOpen: Boolean,
})
defineEmits(['toggle-detail'])

// Hàm định dạng tiền tệ (hiển thị)
const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0
});

function formatCurrency(number) {
    if (typeof number !== 'number') return '0';
    return currencyFormatter.format(number) + '';
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
      class="hidden md:grid summary-row-grid items-center py-2 px-3 text-sm cursor-pointer transition duration-150"
    >
      <div class="px-5 font-semibold text-gray-800 text-sm">{{ itemData.id }}</div>
      <div class="px-5 font-medium text-gray-800 truncate text-sm">{{ itemData.name }}</div>
      <div class="px-5 text-gray-600 text-xs">{{ itemData.phone || '---' }}</div>
      <div class="px-5 text-gray-600 text-xs">{{ itemData.email || 'Chưa có' }}</div>
      <div class="px-5 text-right text-sm font-semibold text-red-600">
        {{ formatCurrency(itemData.totalPurchase) }}
      </div>
      <div class="flex justify-start px-3">
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
  grid-template-columns: 1fr 2fr 1fr 1.5fr 1.5fr 1.2fr;
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
