<script setup>
import InventoryItem from './InventoryItem.vue'
defineProps({
  items: Array,
  totalPayable: Number,
})
const emit = defineEmits(['toggle-detail'])

function formatCurrency(value) {
  if (!value) return '0'
  return value.toLocaleString('vi-VN')
}

function handleToggle(itemId) {
  emit('toggle-detail', itemId)
}
</script>

<template>
  <!-- 3. Khu vực Nội dung chính -->
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Thanh Header cho danh sách phiếu nhập -->
    <div class="flex-shrink-0 bg-white border-b border-gray-200 px-6 pt-3">
      <div
        class="grid summary-row-grid text-xs text-gray-500 font-medium whitespace-nowrap overflow-x-auto custom-scroll"
      >
        <div class="pb-2 px-3"></div>
        <!-- Cột rỗng cho Checkbox -->
        <div class="pb-2 px-3 border-b-2 border-red-600 text-red-600 cursor-pointer">
          Mã nhập hàng
        </div>
        <div class="pb-2 px-3 hover:text-gray-800 cursor-pointer">Thời gian</div>
        <div class="pb-2 px-3 hover:text-gray-800 cursor-pointer">Mã NCC</div>
        <div class="pb-2 px-3 hover:text-gray-800 cursor-pointer">Nhà cung cấp</div>
        <div class="pb-2 px-3 hover:text-gray-800 cursor-pointer text-right">Cần trả NCC</div>
        <div class="pb-2 px-3">Trạng thái</div>
        <!-- Cột rỗng cho trạng thái -->
      </div>
    </div>

    <!-- Khung cuộn cho danh sách phiếu và chi tiết -->
    <div class="flex-1 overflow-y-auto custom-scroll p-4 space-y-3">
      <InventoryItem
        v-for="item in items"
        :key="item.id"
        :itemData="item"
        @toggle-detail="handleToggle"
      />
    </div>

    <!-- Footer hành động chính của trang -->
    <footer
      class="flex-shrink-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-between items-center shadow-inner"
    >
      <div class="flex items-center space-x-2 text-sm">
        <span class="font-medium text-gray-600">Tổng cần trả NCC:</span>
        <span class="font-bold text-red-600 text-base">{{ formatCurrency(totalPayable) }}</span>
      </div>
      <div class="text-xs text-gray-500">Chọn một phiếu nhập để thực hiện các thao tác</div>
    </footer>
  </div>
</template>
