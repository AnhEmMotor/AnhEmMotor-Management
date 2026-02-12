<template>
  <div class="p-6 rounded-xl shadow-lg bg-white">
    <div class="flex items-start justify-between mb-4">
      <div>
        <h1 class="text-3xl font-bold mb-1 text-gray-800">Quản Lý Đơn Hàng</h1>
        <p class="text-gray-500 text-sm">Quản lý đơn hàng bán ra của cửa hàng</p>
      </div>
      <div class="flex items-center gap-2">
        <Button color="primary" :icon="IconPlus" @click="createNewOrder" text="Tạo Đơn Hàng Mới" />

        <label for="import-order-input" class="cursor-pointer">
          <Button text="Import" :icon="IconFileImport" color="secondary" as="span" />
          <input
            type="file"
            id="import-order-input"
            accept=".xlsx, .xls"
            class="hidden"
            @change="handleImport"
          />
        </label>

        <Button text="Export" :icon="IconFileExport" color="secondary" @click="handleExport" />
      </div>
    </div>
    <div class="overflow-x-auto rounded-lg shadow-sm border border-gray-300">
      <table class="min-w-full bg-white border-collapse">
        <thead>
          <tr
            class="bg-gray-50 text-gray-500 uppercase text-xs font-medium tracking-wider leading-normal border-b border-gray-200"
          >
            <th class="py-3 px-6 text-left w-40">Ngày Đặt</th>
            <th class="py-3 px-6 text-left">Sản phẩm</th>
            <th class="py-3 px-6 text-left w-64">Trạng Thái</th>
            <th class="py-3 px-6 text-left w-40">Tổng Tiền</th>
            <th class="py-3 px-6 text-center w-32">Hành động</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm">
          <template v-if="isLoading">
            <tr v-for="i in 5" :key="i" class="border-b border-gray-100">
              <td class="py-3 px-6"><SkeletonLoader width="100%" height="20px" /></td>
              <td class="py-3 px-6"><SkeletonLoader width="80%" height="20px" /></td>
              <td class="py-3 px-6">
                <SkeletonLoader width="100px" height="24px" class="rounded-full" />
              </td>
              <td class="py-3 px-6"><SkeletonLoader width="80%" height="20px" /></td>
              <td class="py-3 px-6 text-center">
                <div class="flex justify-center">
                  <SkeletonLoader width="40px" height="20px" class="rounded" />
                </div>
              </td>
            </tr>
          </template>
          <tr v-else-if="_isError">
            <td colspan="7" class="text-center p-4 text-red-500">
              Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
            </td>
          </tr>
          <tr v-else-if="!displayedOrders || displayedOrders.length === 0">
            <td colspan="7" class="text-center p-4">Không có đơn hàng nào.</td>
          </tr>
          <tr
            v-else
            v-for="order in displayedOrders"
            :key="order.id"
            class="row-table-style cursor-pointer border-b border-gray-200 hover:bg-gray-50 transition-colors"
            @click="handleEditOrder(order)"
          >
            <td class="py-3 px-6 text-left">
              {{ new Date(order.created_at).toLocaleDateString('vi-VN') }}
            </td>
            <td class="py-3 px-6 text-left">{{ order.product_summary }}</td>
            <td class="py-3 px-6 text-left whitespace-nowrap">
              <RoundBadge :color="getStatusColor(order.status_id)">
                {{ getStatusLabel(order.status_id) }}
              </RoundBadge>
            </td>
            <td class="py-3 px-6 text-left">
              {{ (order.total || 0).toLocaleString('vi-VN') }} VNĐ
            </td>
            <td class="py-3 px-6 text-center">
              <SmallNoBgButton color="blue" :icon="IconEdit" @click.stop="handleEditOrder(order)">
                Sửa
              </SmallNoBgButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <OrderForm
      v-if="showOrderForm"
      :show="showOrderForm"
      :zIndex="110"
      :order="selectedOrder"
      @close="showOrderForm = false"
      @save="handleSaveOrder"
      @activate="() => {}"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useOrdersStore } from '@/stores/useOrdersStore'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

import RoundBadge from '@/components/ui/RoundBadge.vue'
import OrderForm from '@/components/orders/OrderForm.vue'
import SmallNoBgButton from '@/components/ui/button/SmallNoBgButton.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconFileImport from '@/components/icons/IconFileImport.vue'
import IconFileExport from '@/components/icons/IconFileExport.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import { useToast } from 'vue-toastification'

const ordersStore = useOrdersStore()
const queryClient = useQueryClient()
const toast = useToast()

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

const selectedStatuses = ref([])
const selectedOrder = ref(null)
const showOrderForm = ref(false)

const page = ref(1)
const itemsPerPage = ref(20)
const searchTerm = ref('')

onMounted(() => {
  ordersStore.fetchStatuses()
})

const filters = computed(() => ({
  status_ids: selectedStatuses.value.length > 0 ? selectedStatuses.value : null,
  search: searchTerm.value || null,
}))

const fetchFn = async (params) => {
  return ordersStore.fetchOrders(params)
}

const dataMapper = (data) => ({
  items: data?.orders || [],
  count: data?.totalCount || 0,
})

const {
  items: displayedOrders,
  totalPages: _totalPages,
  isLoading,
  isError: _isError,
  error: _error,
} = usePaginatedQuery({
  queryKeyBase: ref('orders'),
  filters: filters,
  page: page,
  itemsPerPage: itemsPerPage,
  fetchFn: fetchFn,
  dataMapper: dataMapper,
})

watch(_isError, (isError) => {
  if (isError) {
    const errorMsg = _error.value?.message || _error.value || 'Có lỗi xảy ra khi tải dữ liệu'
    toast.error(`Không thể tải danh sách đơn hàng: ${errorMsg}`)
  }
})

const saveOrderMutation = useMutation({
  mutationFn: (orderPayload) => ordersStore.saveOrder(orderPayload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] })
    showOrderForm.value = false
  },
})

function createNewOrder() {
  selectedOrder.value = null
  showOrderForm.value = true
}

function handleEditOrder(order) {
  selectedOrder.value = { ...order }
  showOrderForm.value = true
}

function handleSaveOrder(payload) {
  saveOrderMutation.mutate(payload)
}

const handleImport = (event) => {
  toast.info('Chức năng Import Excel đang phát triển')
  event.target.value = ''
}

const handleExport = () => {
  toast.info('Chức năng Export Excel đang phát triển')
}
</script>
