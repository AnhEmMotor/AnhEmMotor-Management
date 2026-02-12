<script setup>
import RoundBadge from '@/components/ui/RoundBadge.vue'
import Pagination from '../ui/button/BasePagination.vue'
import SkeletonLoader from '../ui/SkeletonLoader.vue'
import { computed, ref } from 'vue'
import { formatDateTime, formatDate } from '@/composables/useDate'
import { formatCurrency } from '@/composables/useCurrency'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { useInputsStore } from '@/stores/useInputsStore'
import { useSuppliersStore } from '@/stores/useSuppliersStore'
import { useQuery } from '@tanstack/vue-query'

const props = defineProps({
  itemData: Object,
})
defineEmits(['edit-supplier', 'delete-supplier', 'toggle-activation'])
const activeTab = ref('info')
const historyItemsPerPage = ref(10)
const inputsStore = useInputsStore()
const suppliersStore = useSuppliersStore()

// Fetch latest supplier details when opened
const { data: detailData } = useQuery({
  queryKey: computed(() => ['suppliers', props.itemData.id]),
  queryFn: () => suppliersStore.getSupplierById(props.itemData.id),
})

const supplierInfo = computed(() => ({ ...props.itemData, ...(detailData.value || {}) }))

function getStatusInfo(statusId) {
  // ... rest of script
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

const fetchHistoryFn = async (params) => {
  // DEMO DELAY: 2 seconds to show Skeleton Loader in History tab
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const response = await inputsStore.fetchInputsBySupplier(props.itemData.id, {
    page: params.page,
    limit: params.limit,
    statusFilters: params.statusFilters,
    search: params.search,
  })

  // Transform response to match usePaginatedQuery expected format
  const inputs = response?.inputs || []
  const count = response?.count || 0

  return {
    data: inputs,
    pagination: {
      totalCount: count,
      totalPages: Math.ceil(count / params.limit),
      currentPage: params.page,
    },
  }
}

const {
  isLoading: historyLoading,
  isError: historyIsError,
  error: historyError,
  data: inputsData, // Maps to 'data' from composable return
  pagination: { totalPages: historyTotalPages, currentPage: historyCurrentPage },
} = usePaginatedQuery({
  queryKey: queryKeyBase,
  filters: filters,
  itemsPerPage: historyItemsPerPage,
  queryFn: fetchHistoryFn,
  useLocalPagination: true,
})

import { watch } from 'vue'
import { useToast } from 'vue-toastification'
const toast = useToast()

watch(historyIsError, (hasError) => {
  if (hasError) {
    toast.error('Lỗi khi tải lịch sử: ' + (historyError.value?.message || 'Không xác định'))
  }
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
        {{ supplierInfo.name }}
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 mb-4">
        <div class="text-sm">
          <span class="text-gray-500 block">Ngày tạo:</span>
          <span class="font-medium text-gray-700">{{ formatDate(supplierInfo.created_at) }}</span>
        </div>
      </div>
      <hr class="my-3 border-gray-100" />
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
        <div class="text-sm">
          <span class="text-gray-500 block">Điện thoại</span>
          <span class="font-medium text-gray-800">{{ supplierInfo.phone || '---' }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-500 block">Email</span>
          <span class="font-medium text-gray-800">{{ supplierInfo.email || 'Chưa có' }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-500 block">Mã số thuế</span>
          <span class="font-medium text-gray-800">{{
            supplierInfo.taxIdentificationNumber || '---'
          }}</span>
        </div>
        <div class="text-sm col-span-1 md:col-span-2 lg:col-span-3">
          <span class="text-gray-500 block">Địa chỉ</span>
          <span class="font-medium text-gray-800">{{
            [supplierInfo.address, supplierInfo.ward, supplierInfo.cityDistrict].filter(Boolean).join(', ') ||
            'Chưa có'
          }}</span>
        </div>
      </div>
      <div class="mt-4 p-2 bg-gray-50 border border-gray-200 rounded-lg">
        <p class="text-xs text-gray-500">Ghi chú:</p>
        <p class="text-sm italic text-gray-600">
          {{ supplierInfo.notes || 'Chưa có ghi chú' }}
        </p>
      </div>
      <div class="flex justify-end space-x-3 mt-4 pt-3 border-t border-gray-100">
        <button
          class="flex items-center space-x-1 text-sm font-medium text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
          @click="$emit('delete-supplier', supplierInfo)"
        >
          <span>Xóa</span>
        </button>
        <button
          class="bg-red-600 text-white py-1.5 px-3 rounded-md hover:bg-red-700 text-xs font-medium"
          @click="$emit('edit-supplier', supplierInfo)"
        >
          <span>Chỉnh sửa</span>
        </button>
        <button
          v-if="supplierInfo.statusId === 'active'"
          class="flex items-center space-x-1 text-sm font-medium text-gray-600 border border-gray-300 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          @click="$emit('toggle-activation', supplierInfo)"
        >
          <span>Ngừng hoạt động</span>
        </button>
        <button
          v-else
          class="flex items-center space-x-1 text-sm font-medium text-green-600 border border-green-300 px-2.5 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
          @click="$emit('toggle-activation', supplierInfo)"
        >
          <span>Kích hoạt lại</span>
        </button>
      </div>
    </div>

    <div v-show="activeTab === 'history'" class="relative">
      <div class="border border-gray-200 rounded-lg overflow-hidden">
        <!-- Permanent Header -->
        <div
          class="grid grid-cols-16 gap-4 text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50 border-b border-gray-200 px-4 py-3"
        >
          <div class="col-span-4">Thời gian</div>
          <div class="col-span-7">Người xác nhận</div>
          <div class="text-right col-span-3">Tổng cộng</div>
          <div class="text-right col-span-2">Trạng thái</div>
        </div>

        <div v-if="historyLoading" class="bg-white">
          <div
            v-for="i in 3"
            :key="i"
            class="grid grid-cols-16 gap-4 px-4 py-3 border-b border-gray-50 items-center animate-pulse last:border-0"
          >
            <div class="col-span-4"><SkeletonLoader width="80%" height="14px" /></div>
            <div class="col-span-7"><SkeletonLoader width="60%" height="14px" /></div>
            <div class="col-span-3 flex justify-end">
              <SkeletonLoader width="50%" height="14px" />
            </div>
            <div class="col-span-2 flex justify-end">
              <SkeletonLoader width="70%" height="20px" class="rounded-full" />
            </div>
          </div>
        </div>

        <div v-else-if="!historyIsError && inputsData && inputsData.length > 0" class="bg-white">
          <div
            v-for="input in inputsData"
            :key="input.id"
            class="grid grid-cols-16 gap-4 items-center px-4 py-3 border-b border-gray-50 text-sm hover:bg-gray-50 transition-colors last:border-0"
          >
            <div class="text-gray-700 font-medium col-span-4">
              {{ formatDateTime(input.created_at) }}
            </div>
            <div class="text-gray-600 col-span-7">
              {{ input.name_verify || '---' }}
            </div>
            <div class="text-right font-medium text-gray-800 col-span-3">
              {{ formatCurrency(input.total) }}
            </div>
            <div class="text-right col-span-2">
              <RoundBadge :color="getStatusInfo(input.status_id).color">
                {{ getStatusInfo(input.status_id).text }}
              </RoundBadge>
            </div>
          </div>
          <div class="p-4 border-t border-gray-100 bg-gray-50">
            <Pagination
              :total-pages="historyTotalPages"
              v-model:currentPage="historyCurrentPage"
              :loading="historyLoading"
            />
          </div>
        </div>

        <!-- Beautiful Empty/Error State -->
        <div
          v-else
          class="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-white"
        >
          <div class="bg-gray-50 p-3 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <div class="text-gray-500 font-medium">Chưa có lịch sử nhập hàng</div>
          <div class="text-xs text-gray-400 max-w-xs">
            Hiện tại chưa có giao dịch nào được ghi nhận cho nhà cung cấp này.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
