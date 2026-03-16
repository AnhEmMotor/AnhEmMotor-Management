<template>
  <div class="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-md flex flex-col h-full">
    <div class="flex items-center justify-between mb-4 shrink-0">
      <h3 class="text-base sm:text-lg font-semibold text-gray-700">Đơn Hàng Mới Nhất</h3>
      <RouterLink
        to="/orders"
        class="text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
      >
        Xem tất cả
      </RouterLink>
    </div>
    
    <div class="w-full flex-1 overflow-x-auto border border-gray-100 rounded-lg bg-white custom-scrollbar">
      <table class="w-full text-sm text-left text-gray-600 whitespace-nowrap min-w-[600px]">
        <thead class="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
          <tr>
            <th scope="col" class="px-4 py-3 font-semibold">Mã đơn</th>
            <th scope="col" class="px-4 py-3 font-semibold">Khách hàng</th>
            <th scope="col" class="px-4 py-3 font-semibold">Tổng tiền</th>
            <th scope="col" class="px-4 py-3 font-semibold">Trạng thái</th>
            <th scope="col" class="px-4 py-3 font-semibold text-right">Lúc đặt</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="order in orders" 
            :key="order.id"
            class="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
          >
            <td class="px-4 py-3">
              <span class="font-medium text-gray-800">{{ order.orderCode || `#${order.id}` }}</span>
            </td>
            <td class="px-4 py-3 font-medium text-gray-700">{{ order.buyerName || 'Khách vãng lai' }}</td>
            <td class="px-4 py-3 font-semibold text-gray-800">{{ formatCurrency(order.totalAmount) }}</td>
            <td class="px-4 py-3">
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :style="getStatusStyle(order.statusId)"
              >
                {{ getStatusName(order.statusId) }}
              </span>
            </td>
            <td class="px-4 py-3 text-right text-gray-500 text-xs">
              {{ formatRelativeTime(order.createdAt) }}
            </td>
          </tr>
          
          <tr v-if="orders.length === 0">
            <td colspan="5" class="py-10 text-center text-gray-500">
              Không có đơn hàng mới nào.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  recentOrders: {
    type: Array,
    default: () => []
  }
})

const orders = computed(() => {
  if (!props.recentOrders) return []
  return props.recentOrders.slice(0, 10) // Tối đa 10 đơn vị
})

const formatCurrency = (val) => {
  return `${(val || 0).toLocaleString()} đ`
}

const formatRelativeTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  }).format(date)
}

const orderStatusColors = {
  pending: { bg: '#EBF5FF', text: '#1E40AF' },
  waiting_deposit: { bg: '#E0E7FF', text: '#3730A3' },
  deposit_paid: { bg: '#EDE9FE', text: '#5B21B6' },
  confirmed_cod: { bg: '#F3E8FF', text: '#6B21A8' },
  preparing: { bg: '#FEF3C7', text: '#92400E' },
  waiting_pickup: { bg: '#FEF08A', text: '#854D0E' },
  delivering: { bg: '#FCE7F3', text: '#9D174D' },
  completed: { bg: '#D1FAE5', text: '#065F46' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
  refunding: { bg: '#FFEDD5', text: '#9A3412' },
  refunded: { bg: '#F3F4F6', text: '#374151' },
  paid_processing: { bg: '#CFFAFE', text: '#155E75' },
}

const orderStatusNames = {
  pending: 'Chờ xử lý',
  waiting_deposit: 'Chờ đặt cọc',
  deposit_paid: 'Đã đặt cọc',
  confirmed_cod: 'Đã xác COD',
  preparing: 'Đang chuẩn bị',
  waiting_pickup: 'Chờ lấy hàng',
  delivering: 'Đang giao',
  completed: 'Hoàn tất',
  cancelled: 'Đã huỷ',
  refunding: 'Đang hoàn tiền',
  refunded: 'Hoàn tiền',
  paid_processing: 'Liên kết thanh toán',
}

const getStatusStyle = (statusKey) => {
  const key = statusKey?.toLowerCase()
  const config = orderStatusColors[key] || { bg: '#F3F4F6', text: '#374151' }
  return {
    backgroundColor: config.bg,
    color: config.text
  }
}

const getStatusName = (statusKey) => {
  const key = statusKey?.toLowerCase()
  return orderStatusNames[key] || statusKey || 'Không rõ'
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
