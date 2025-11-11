<template>
  <div class="bg-gray-100 p-6 rounded-xl shadow-lg">
    <div class="flex items-start justify-between mb-4">
      <h1 class="text-3xl font-bold mb-4 text-gray-800">Đơn Hàng Của Tôi</h1>
      <div class="flex items-center">
        <OrderFilterButtons v-model="selectedStatuses" />
        <span class="h-8 border-r-2 border-black-300 mx-2" />
        <BaseButton color="green" @click="createNewOrder" text="Tạo Đơn Hàng Mới"></BaseButton>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
        <thead>
          <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th class="py-3 px-6 text-left">Mã ĐH</th>
            <th class="py-3 px-6 text-left">Ngày Đặt</th>
            <th class="py-3 px-6 text-left">Sản phẩm</th>
            <th class="py-3 px-6 text-left">Trạng Thái</th>
            <th class="py-3 px-6 text-left">Tổng Tiền</th>
            <th class="py-3 px-6 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm">
          <tr v-if="isLoading">
            <td colspan="7" class="text-center p-4">Đang tải dữ liệu...</td>
          </tr>
          <tr v-else-if="!displayedOrders || displayedOrders.length === 0">
            <td colspan="7" class="text-center p-4">Không có đơn hàng nào.</td>
          </tr>
          <tr
            v-else
            v-for="order in displayedOrders"
            :key="order.id"
            class="row-table-style cursor-pointer"
            @click="openOrderDetails(order)"
          >
            <td class="py-3 px-6 text-left whitespace-nowrap">{{ order.id.substring(0, 8) }}...</td>
            <td class="py-3 px-6 text-left">
              {{ new Date(order.created_at).toLocaleDateString('vi-VN') }}
            </td>
            <td class="py-3 px-6 text-left">{{ order.product_summary }}</td>
            <td class="py-3 px-6 text-left">
              <RoundBadge :color="getStatusColor(order.status_id)">
                {{ getStatusLabel(order.status_id) }}
              </RoundBadge>
            </td>
            <td class="py-3 px-6 text-left">
              {{ (order.total || 0).toLocaleString('vi-VN') }} VNĐ
            </td>
            <td class="py-3 px-6 text-center">
              <BaseSmallNoBgButton color="blue" @click.stop="handleEditOrder(order)">
                Sửa
              </BaseSmallNoBgButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <OrderDetailModal
      :visible="showDetailModal"
      :order="selectedOrder"
      @close="showDetailModal = false"
    />

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
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

import RoundBadge from '@/components/ui/RoundBadge.vue'
import OrderFilterButtons from '@/components/orders/OrderFilterButtons.vue'
import OrderDetailModal from '@/components/orders/OrderDetailModal.vue'
import OrderForm from '@/components/orders/OrderForm.vue'
import BaseSmallNoBgButton from '@/components/ui/button/BaseSmallNoBgButton.vue'
import BaseButton from '@/components/ui/button/BaseButton.vue'

const store = useStore()
const queryClient = useQueryClient()

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
const showDetailModal = ref(false)
const selectedOrder = ref(null)
const showOrderForm = ref(false)

const page = ref(1)
const itemsPerPage = ref(20)
const searchTerm = ref('')

onMounted(() => {
  store.dispatch('orders/fetchStatuses')
})

const filters = computed(() => ({
  status_ids: selectedStatuses.value.length > 0 ? selectedStatuses.value : null,
  search: searchTerm.value || null,
}))

const fetchFn = (params) => {
  return store.dispatch('orders/fetchOrders', params)
}

const dataMapper = (data) => ({
  items: data?.orders || [],
  count: data?.totalCount || 0,
})

const {
  items: displayedOrders,
  _totalPages,
  isLoading,
  _isError,
  _error,
} = usePaginatedQuery({
  queryKeyBase: ref('orders'),
  filters: filters,
  page: page,
  itemsPerPage: itemsPerPage,
  fetchFn: fetchFn,
  dataMapper: dataMapper,
})

const saveOrderMutation = useMutation({
  mutationFn: (orderPayload) => store.dispatch('orders/saveOrder', orderPayload),
  onSuccess: (savedOrder) => {
    console.debug('Order saved, invalidating queries...', savedOrder)
    queryClient.invalidateQueries({ queryKey: ['orders'] })
    showOrderForm.value = false
  },
  onError: (error) => {
    console.error('Lỗi khi lưu đơn hàng:', error)
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

function openOrderDetails(order) {
  selectedOrder.value = { ...order }
  showDetailModal.value = true
}

function handleSaveOrder(payload) {
  console.debug('[OrdersManager] handleSaveOrder received payload:', payload)
  saveOrderMutation.mutate(payload)
}
</script>
