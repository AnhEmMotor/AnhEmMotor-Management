<script setup>
import RoundBadge from '@/components/ui/RoundBadge.vue'
import BasePagination from '../ui/button/BasePagination.vue'
import BaseSpinner from '../ui/BaseSpinner.vue'
import { computed, ref } from 'vue'
import { getAllInputBySupplierID } from '@/api/input'
import { formatDateTime, formatDate } from '@/composables/useDate'
import { formatCurrency } from '@/composables/useCurrency'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'

const props = defineProps({
  itemData: Object,
})
defineEmits(['edit-supplier', 'delete-supplier', 'toggle-activation'])
const activeTab = ref('info')
const historyCurrentPage = ref(1)
const historyItemsPerPage = ref(10)

function getStatusInfo(statusId) {
  switch (statusId) {
    case 'finished':
      return { text: 'Đã nhập hàng', color: 'green' }
    case 'working':
      return { text: 'Chờ xử lý', color: 'yellow' }
    case 'cancelled':
      return { text: 'Đã hủy', color: 'red' }
    default:
      return { text: `ID: ${statusId}`, color: 'gray' }
  }
}

const queryKeyBase = computed(() => ['inputHistoryOfSupplier', props.itemData.id])

const filters = computed(() => ({
  statusFilters: [],
  search: '',
}))

const fetchHistoryFn = (params) => {
  return getAllInputBySupplierID(
    props.itemData.id,
    params.page,
    params.itemsPerPage,
    params.statusFilters,
    params.search,
  )
}

const historyDataMapper = (data) => ({
  items: data?.inputs || [],
  count: data?.count,
})

const {
  isLoading: historyLoading,
  isError: historyIsError,
  error: historyError,
  items: inputsData,
  totalPages: historyTotalPages,
} = usePaginatedQuery({
  queryKeyBase: queryKeyBase,
  filters: filters,
  page: historyCurrentPage,
  itemsPerPage: historyItemsPerPage,
  fetchFn: fetchHistoryFn,
  dataMapper: historyDataMapper,
})
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
          <span class="font-medium text-gray-700">{{ formatDate(itemData.created_at) }}</span>
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
      <div v-if="historyLoading" class="p-4 text-center text-gray-500"><BaseSpinner /></div>
      <div v-else-if="historyIsError" class="p-4 text-center text-red-500 bg-red-50 rounded-lg">
        Lỗi khi tải lịch sử: {{ historyError?.message }}
      </div>
      <div v-else-if="inputsData && inputsData.length > 0" class="p-4 bg-white pr-12">
        <div class="grid grid-cols-16 gap-4 text-xs font-semibold text-gray-600 border-b pb-2 mb-2">
          <div class="col-span-4">Thời gian</div>
          <div class="col-span-7">Người xác nhận</div>
          <div class="text-right col-span-3">Tổng cộng</div>
          <div class="text-right col-span-2">Trạng thái</div>
        </div>
        <div>
          <div
            v-for="input in inputsData"
            :key="input.id"
            class="grid grid-cols-16 gap-4 items-center py-2 border-b border-gray-100 text-sm"
          >
            <div class="text-gray-600 col-span-4">
              {{ formatDateTime(input.created_at) }}
            </div>
            <div class="text-gray-600 col-span-7">
              {{ input.name_verify || 'Chưa có' }}
            </div>
            <div class="text-right font-medium col-span-3">
              {{ formatCurrency(input.total) }}
            </div>
            <div class="text-right col-span-2">
              <RoundBadge :color="getStatusInfo(input.status_id).color">
                {{ getStatusInfo(input.status_id).text }}
              </RoundBadge>
            </div>
          </div>
        </div>
        <BasePagination
          :total-pages="historyTotalPages"
          v-model:currentPage="historyCurrentPage"
          :loading="historyLoading"
        />
      </div>

      <div v-else class="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
        Chưa có giao dịch nào được ghi nhận.
      </div>
    </div>
  </div>
</template>
