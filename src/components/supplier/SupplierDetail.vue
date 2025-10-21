<script setup>
import { ref } from 'vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'

const props = defineProps({
  itemData: Object,
})
defineEmits(['edit-supplier', 'delete-supplier', 'toggle-activation'])

console.log('SupplierDetail itemData:', props.itemData)
const activeTab = ref('info')

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'decimal',
  minimumFractionDigits: 0,
})

function formatCurrency(number) {
  if (typeof number !== 'number') return '0'
  return currencyFormatter.format(number) + ''
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

function formatDateTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}
</script>

<template>
  <div class="p-3 px-10 border-t border-gray-200 bg-white">
    <div class="flex border-b border-gray-200 mb-3 space-x-5">
      <button
        class="py-1.5 text-sm"
        :class="
          activeTab === 'info'
            ? 'font-semibold border-b-2 border-red-500 text-red-600'
            : 'text-gray-600 hover:text-gray-800'
        "
        @click="activeTab = 'info'"
      >
        Thông tin
      </button>
      <button
        class="py-1.5 text-sm"
        :class="
          activeTab === 'history'
            ? 'font-semibold border-b-2 border-red-500 text-red-600'
            : 'text-gray-600 hover:text-gray-800'
        "
        @click="activeTab = 'history'"
      >
        Lịch sử nhập hàng
      </button>
    </div>

    <div v-show="activeTab === 'info'">
      <h3 class="text-lg font-bold text-gray-800 mb-3">
        {{ itemData.name }}
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 mb-4">
        <div class="text-sm">
          <span class="text-gray-500 block">Ngày tạo:</span>
          <span class="font-medium text-gray-700">{{ formatDate(itemData.creationDate) }}</span>
        </div>
      </div>
      <hr class="my-3 border-gray-100" />
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
        <div class="text-sm">
          <span class="text-gray-500 block">Điện thoại</span>
          <span class="font-medium text-gray-800">{{ itemData.phone || '---' }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-500 block">Email</span>
          <span class="font-medium text-gray-800">{{ itemData.email || 'Chưa có' }}</span>
        </div>
        <div class="text-sm col-span-1 md:col-span-2 lg:col-span-3">
          <span class="text-gray-500 block">Địa chỉ</span>
          <span class="font-medium text-gray-800">{{
            [itemData.address, itemData.ward, itemData.cityDistrict].filter(Boolean).join(', ') ||
            'Chưa có'
          }}</span>
        </div>
      </div>
      <div class="mt-4 p-2 bg-gray-50 border border-gray-200 rounded-lg">
        <p class="text-xs text-gray-500">Ghi chú:</p>
        <p class="text-sm italic text-gray-600">
          {{ itemData.notes || 'Chưa có ghi chú' }}
        </p>
      </div>
      <div class="flex justify-end space-x-3 mt-4 pt-3 border-t border-gray-100">
        <button
          class="flex items-center space-x-1 text-sm font-medium text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
          @click="$emit('delete-supplier')"
        >
          <span>Xóa</span>
        </button>
        <button
          class="bg-red-600 text-white py-1.5 px-3 rounded-md hover:bg-red-700 text-xs font-medium"
          @click="$emit('edit-supplier')"
        >
          <span>Chỉnh sửa</span>
        </button>
        <button
          v-if="itemData.status === 'active'"
          class="flex items-center space-x-1 text-sm font-medium text-gray-600 border border-gray-300 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          @click="$emit('toggle-activation')"
        >
          <span>Ngừng hoạt động</span>
        </button>
        <button
          v-else
          class="flex items-center space-x-1 text-sm font-medium text-green-600 border border-green-300 px-2.5 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
          @click="$emit('toggle-activation')"
        >
          <span>Kích hoạt lại</span>
        </button>
      </div>
    </div>

    <div v-show="activeTab === 'history'">
      <div
        v-if="
          itemData.transactions &&
          itemData.transactions.filter((t) => t.status === 'Đã nhập hàng').length > 0
        "
        class="p-4 border border-gray-200 rounded-lg bg-white"
      >
        <h4 class="font-semibold text-gray-800 mb-3">Lịch sử giao dịch</h4>
        <div class="grid grid-cols-5 gap-4 text-xs font-semibold text-gray-600 border-b pb-2 mb-2">
          <div>Mã phiếu</div>
          <div>Thời gian</div>
          <div>Người tạo</div>
          <div class="text-right">Tổng cộng</div>
          <div class="text-right">Trạng thái</div>
        </div>
        <div>
          <div
            v-for="t in itemData.transactions.filter((tx) => tx.status === 'Đã nhập hàng')"
            :key="t.code"
            class="grid grid-cols-5 gap-4 items-center py-2 border-b border-gray-100 text-sm"
          >
            <div class="font-medium text-red-600 hover:text-red-700 cursor-pointer">
              {{ t.code }}
            </div>
            <div class="text-gray-600">{{ formatDateTime(t.time) }}</div>
            <div class="text-gray-600">{{ t.creator }}</div>
            <div class="text-right font-medium">{{ formatCurrency(t.total) }}</div>
            <div class="text-right">
              <RoundBadge :color="t.status === 'Đã nhập hàng' ? 'green' : 'gray'">
                {{ t.status }}
              </RoundBadge>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
        Chưa có giao dịch nào được ghi nhận.
      </div>
    </div>
  </div>
</template>
