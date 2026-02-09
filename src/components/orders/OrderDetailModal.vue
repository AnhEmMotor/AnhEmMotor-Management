<template>
  <div
    v-if="visible"
    class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    style="z-index: 100"
    @click.self="$emit('close')"
  >
    <div
      class="modal-content bg-white w-full max-w-4xl p-8 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto"
    >
      <div class="flex justify-between items-center mb-6 border-b pb-3">
        <h2 class="text-2xl font-bold text-gray-800">
          Chi Tiết Đơn Hàng: <span>{{ order.id ? order.id.substring(0, 8) : 'N/A' }}...</span>
        </h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-800 text-xl font-bold">
          ×
        </button>
      </div>

      <div v-if="order" class="grid grid-cols-2 gap-6">
        <div class="space-y-4">
          <p class="text-lg">
            Khách hàng: <strong>{{ order.customer_name }}</strong>
          </p>
          <p class="text-lg">
            Ngày đặt: <strong>{{ new Date(order.created_at).toLocaleString('vi-VN') }}</strong>
          </p>
          <p class="text-xl font-bold">
            Tổng tiền:
            <strong class="text-red-500"
              >{{ (order.total || 0).toLocaleString('vi-VN') }} VNĐ</strong
            >
          </p>
          <p class="text-lg">
            Trạng Thái:
            <RoundBadge :color="getStatusColor(order.status_id)">
              {{ getStatusLabel(order.status_id) }}
            </RoundBadge>
          </p>
          <div class="bg-gray-50 p-3 rounded-lg border">
            <h3 class="text-lg font-semibold mb-2">Ghi chú</h3>
            <p class="text-sm text-gray-700 whitespace-pre-wrap">
              {{ order.notes || 'Không có ghi chú.' }}
            </p>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3">Sản Phẩm Trong Đơn Hàng</h3>
          <div class="overflow-x-auto max-h-96">
            <table class="min-w-full bg-white border text-sm">
              <thead>
                <tr class="bg-gray-100 text-gray-600 uppercase text-xs leading-normal">
                  <th class="py-2 px-3 text-left">Tên Sản Phẩm</th>
                  <th class="py-2 px-3 text-right">Số lượng</th>
                  <th class="py-2 px-3 text-right">Giá (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(product, index) in order.products"
                  :key="product.id || index"
                  class="border-b hover:bg-gray-50"
                >
                  <td class="py-2 px-4 whitespace-nowrap">{{ product.name }}</td>
                  <td class="py-2 px-4 text-right">{{ product.count }}</td>
                  <td class="py-2 px-4 text-right">
                    {{ (product.price || 0).toLocaleString('vi-VN') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import RoundBadge from '@/components/ui/RoundBadge.vue'

defineProps({
  visible: Boolean,
  order: Object,
})

defineEmits(['close'])

const STATUS_TEXT_MAP = {
  pending: 'Chờ xác nhận',
  completed: 'Đã hoàn thành',
  canceled: 'Đã hủy',
  refunding: 'Đang hoàn tiền',
  refunded: 'Đã hoàn tiền',
  confirmed_cod: 'Đã xác nhận (COD)',
  paid_processing: 'Đã thanh toán (Chờ xử lý)',
  waiting_deposit: 'Chờ đặt cọc',
  deposit_paid: 'Đã đặt cọc (Chờ xử lý)',
  delivering: 'Đang giao hàng',
  waiting_pickup: 'Chờ lấy hàng',
}

const STATUS_COLOR_MAP = {
  pending: 'gray',
  waiting_deposit: 'gray',
  refunded: 'gray',
  completed: 'green',
  waiting_pickup: 'green',
  confirmed_cod: 'yellow',
  refunding: 'yellow',
  paid_processing: 'blue',
  deposit_paid: 'blue',
  delivering: 'blue',
  canceled: 'red',
}

function getStatusLabel(key) {
  return STATUS_TEXT_MAP[key] || key
}

function getStatusColor(key) {
  return STATUS_COLOR_MAP[key] || 'gray'
}
</script>
