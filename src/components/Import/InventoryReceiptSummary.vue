<script setup>
defineProps({
  itemData: Object,
  isOpen: Boolean,
})
defineEmits(['toggle-detail'])

function formatCurrency(value) {
  if (!value && value !== 0) return ''
  return value.toLocaleString('vi-VN')
}

function getStatusClass(status) {
  switch (status) {
    case 'Đã nhập hàng':
      return 'bg-green-100 text-green-800'
    case 'Phiếu tạm':
      return 'bg-yellow-100 text-yellow-800'
    case 'Đã hủy':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div
    class="summary-row-responsive border rounded-md p-3 md:p-0 md:border-none"
    :class="{ 'rounded-b-none': isOpen, 'hover:bg-gray-50': !isOpen }"
    @click="$emit('toggle-detail')"
  >
    <div
      class="hidden md:grid summary-row-grid items-center py-2 px-3 text-sm cursor-pointer transition duration-150"
    >
      <div class="flex justify-center px-3">
        <input type="checkbox" class="w-3.5 h-3.5 rounded text-red-600 focus:ring-red-500" />
      </div>
      <div class="px-3 font-semibold text-gray-800 text-sm">{{ itemData.id }}</div>
      <div class="px-3 text-gray-600 whitespace-nowrap text-xs">{{ itemData.time }}</div>
      <div class="px-3 text-gray-600 text-xs">{{ itemData.supplierCode }}</div>
      <div class="px-3 font-medium text-gray-800 truncate text-sm">{{ itemData.supplierName }}</div>
      <div class="px-3 text-gray-600 text-right text-sm font-semibold text-red-600">
        {{ formatCurrency(itemData.payable) }}
      </div>
      <div class="flex justify-start px-3">
        <span
          class="text-xs font-semibold px-2 py-0.5 rounded-full"
          :class="getStatusClass(itemData.status)"
        >
          {{ itemData.status }}
        </span>
      </div>
    </div>

    <div class="block md:hidden space-y-2 text-sm">
      <div class="flex justify-between items-center">
        <div class="font-semibold text-gray-800">{{ itemData.id }}</div>
        <span
          class="text-xs font-semibold px-2 py-0.5 rounded-full"
          :class="getStatusClass(itemData.status)"
        >
          {{ itemData.status }}
        </span>
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
/* Bạn vẫn cần định nghĩa các cột grid cho màn hình lớn */
.summary-row-grid {
  /* Thay đổi số cột và độ rộng cho phù hợp với thiết kế của bạn */
  grid-template-columns: 40px 1fr 1.5fr 1fr 2fr 1.5fr 1.2fr;
}
.summary-row-responsive {
  /* Thêm khoảng cách giữa các card trên mobile */
  margin-bottom: 0.75rem; /* 12px */
}
@media (min-width: 768px) {
  .summary-row-responsive {
    margin-bottom: 0;
  }
}
</style>
