<template>
  <div
    v-if="visible"
    class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
  >
    <div
      class="modal-content bg-white w-full max-w-4xl p-8 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto"
    >
      <div class="flex justify-between items-center mb-6 border-b pb-3">
        <h2 class="text-2xl font-bold text-gray-800">
          Chi Tiết Đơn Hàng: <span>{{ order.id }}</span>
        </h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-800 text-xl font-bold">
          ×
        </button>
      </div>

      <div v-if="order" class="grid grid-cols-2 gap-6">
        <!-- Order Info -->
        <div class="space-y-4">
          <p class="text-lg">
            Khách hàng: <strong>{{ order.customerName }}</strong>
          </p>
          <p class="text-lg">
            Ngày đặt: <strong>{{ order.date }}</strong>
          </p>
          <p class="text-xl font-bold">
            Tổng tiền:
            <strong class="text-red-500">{{ order.total.toLocaleString('vi-VN') }} VNĐ</strong>
          </p>

          <div class="bg-gray-50 p-3 rounded-lg border">
            <h3 class="text-lg font-semibold mb-2">Quản Lý Trạng Thái</h3>
            <div class="mb-2">
              <label for="modal-status-select" class="block text-sm font-medium text-gray-700 mb-1"
                >Cập nhật Trạng Thái Đơn Hàng</label
              >
              <select
                v-model="currentStatus"
                @change="updateStatus"
                :disabled="order.status === 'completed'"
                class="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-red-500 focus:ring-red-500"
                :class="{ 'bg-gray-200 cursor-not-allowed': order.status === 'completed' }"
              >
                <option
                  v-for="(statusInfo, statusKey) in availableStatuses"
                  :key="statusKey"
                  :value="statusKey"
                >
                  {{ statusInfo.text }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Product List -->
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
                  :key="index"
                  class="border-b hover:bg-gray-50"
                >
                  <td class="py-2 px-4 whitespace-nowrap">{{ product.name }}</td>
                  <td class="py-2 px-4 text-right">{{ product.qty }}</td>
                  <td class="py-2 px-4 text-right">{{ product.price.toLocaleString('vi-VN') }}</td>
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
import { ref, computed, watch } from 'vue'
import { statusMaps } from '../../utils/statusHelper'

const props = defineProps({
  visible: Boolean,
  order: Object,
})

const emit = defineEmits(['close', 'update-status'])

const currentStatus = ref('')

const availableStatuses = computed(() => {
  if (!props.order) return {}
  return statusMaps[props.order.type] || {}
})

watch(
  () => props.order,
  (newOrder) => {
    if (newOrder) {
      currentStatus.value = newOrder.status
    }
  },
)

function updateStatus() {
  if (props.order.status === 'completed') {
    alert('Không thể thay đổi trạng thái đơn hàng đã hoàn thành!')
    currentStatus.value = props.order.status // Reset dropdown
    return
  }
  emit('update-status', { orderId: props.order.id, newStatus: currentStatus.value })
}
</script>
