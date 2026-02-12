<script setup>
import { ref, watch, toRefs } from 'vue'
import IconTrash from '../icons/IconTrash.vue'
import IconDuplicate from '../icons/IconDuplicate.vue'
import IconExpand from '../icons/IconExpand.vue'
import Textarea from '../ui/input/BaseTextarea.vue'

const props = defineProps({
  itemData: Object,
})

defineEmits(['edit', 'cancel-request', 'copy', 'complete-request', 'save-notes'])

const { itemData } = toRefs(props)

const notes = ref('')

watch(
  itemData,
  (v) => {
    notes.value = v && v.notes ? v.notes : ''
  },
  { immediate: true, deep: true },
)

function formatCurrency(value) {
  if (!value && value !== 0) return ''
  return value.toLocaleString('vi-VN')
}

const totalProductValue = (products) => {
  return products.reduce((sum, product) => sum + product.total, 0)
}
const totalDiscount = (products) => {
  return products.reduce((sum, product) => sum + product.discount * product.quantity, 0)
}
</script>

<template>
  <div
    class="border-t bg-white p-5"
    :class="itemData.status === 'finished' ? 'border-red-300' : 'border-gray-200'"
  >
    <div class="border border-gray-200 rounded-md overflow-hidden mb-4">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Tên hàng
            </th>
            <th
              class="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Số lượng
            </th>
            <th
              class="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Đơn giá
            </th>
            <th
              class="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Giảm giá
            </th>
            <th
              class="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Giá nhập
            </th>
            <th
              class="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Thành tiền
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 text-sm">
          <tr
            v-for="(product, index) in itemData.products"
            :key="product.code"
            class="text-xs"
            :class="{ 'bg-gray-50': index % 2 !== 0 }"
          >
            <td class="px-2 py-2.5 font-medium text-gray-800">{{ product.name }}</td>
            <td class="px-2 py-2.5 text-right">{{ formatCurrency(product.quantity) }}</td>
            <td class="px-2 py-2.5 text-right">{{ formatCurrency(product.unitPrice) }}</td>
            <td class="px-2 py-2.5 text-right">{{ formatCurrency(product.discount) }}</td>
            <td class="px-2 py-2.5 text-right">{{ formatCurrency(product.importPrice) }}</td>
            <td class="px-2 py-2.5 text-right font-semibold">
              {{ formatCurrency(product.total) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-6 items-center">
      <div class="flex-1">
        <span class="text-gray-600 text-xs">Ghi chú</span>
        <Textarea v-model="notes" placeholder="Gõ ghi chú của bạn ở đây..." :rows="4" />
      </div>
      <div class="w-full md:w-64 space-y-1 text-xs">
        <div class="flex justify-between">
          <span class="text-gray-600">Số lượng mặt hàng</span>
          <span class="font-medium text-gray-800">{{ itemData.products.length }}</span>
        </div>
        <div class="flex justify-between pt-1">
          <span class="text-gray-600 font-semibold">Tổng cộng</span>
          <span class="font-bold text-gray-900 text-sm">{{
            formatCurrency(totalProductValue(itemData.products) - totalDiscount(itemData.products))
          }}</span>
        </div>
      </div>
    </div>

    <div class="flex justify-between items-center mt-4 pt-5 border-t border-gray-200">
      <div class="flex items-center space-x-3">
        <button
          v-if="itemData.status !== 'cancelled' && itemData.status !== 'finished'"
          @click="$emit('cancel-request', itemData)"
          class="flex items-center space-x-1.5 text-gray-600 py-1.5 px-3 rounded-md hover:bg-gray-100 text-xs font-medium transition duration-150"
        >
          <IconTrash class="w-4 h-4" />
          <span>Hủy</span>
        </button>
        <button
          @click="$emit('copy', itemData)"
          class="flex items-center space-x-1.5 text-gray-600 py-1.5 px-3 rounded-md hover:bg-gray-100 text-xs font-medium transition duration-150"
        >
          <IconDuplicate class="w-4 h-4" />
          <span>Sao chép</span>
        </button>
      </div>
      <div class="flex items-center space-x-2">
        <button
          v-if="itemData.status !== 'cancelled' && itemData.status !== 'finished'"
          @click="$emit('edit', itemData)"
          class="bg-red-600 text-white py-1.5 px-3 rounded-md hover:bg-red-700 text-xs font-medium transition duration-150 flex items-center space-x-1.5"
        >
          <IconExpand class="w-4 h-4" />
          <span>Chỉnh sửa chi tiết phiếu</span>
        </button>
        <button
          @click="$emit('save-notes', { id: itemData.id, notes: notes })"
          class="text-gray-600 py-1.5 px-3 rounded-md hover:bg-gray-100 text-xs font-medium transition duration-150 border border-gray-300"
        >
          Lưu
        </button>
      </div>
    </div>
  </div>
</template>
