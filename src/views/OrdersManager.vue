<script setup>
import { ref, computed, watch } from 'vue'
import { useOrdersStore } from '@/stores/useOrdersStore'
import { fetchSalesOrders, getSalesOrderById, fetchOutputStatuses } from '@/api/order'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { useQuery, useQueryClient } from '@tanstack/vue-query'

import RoundBadge from '@/components/ui/RoundBadge.vue'
import OrderForm from '@/components/orders/OrderForm.vue'
import SmallNoBgButton from '@/components/ui/button/SmallNoBgButton.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconFileImport from '@/components/icons/IconFileImport.vue'
import IconFileExport from '@/components/icons/IconFileExport.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import { useToast } from 'vue-toastification'

const ordersStore = useOrdersStore()
const queryClient = useQueryClient()
const toast = useToast()

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
  cancelled: 'red',
}

const { data: statusMapData } = useQuery({
  queryKey: ['outputStatuses'],
  queryFn: fetchOutputStatuses,
  staleTime: Infinity,
})

const statusMap = computed(() => statusMapData.value || {})

function getStatusLabel(key) {
  return statusMap.value[key] || key
}

function getStatusColor(key) {
  return STATUS_COLOR_MAP[key] || 'gray'
}

const selectedStatuses = ref([])
const selectedOrder = ref(null)
const showOrderForm = ref(false)
const isEditMode = ref(false)
const loadingOverlay = ref(false)
const itemsPerPage = ref(20)

const filters = computed(() => {
  const f = {}
  if (selectedStatuses.value.length > 0) {
    f.filters = selectedStatuses.value.map((s) => `StatusId==${s}`).join('|')
  }
  return f
})

const queryFn = async (params) => {
  const res = await fetchSalesOrders({
    Page: params.page,
    PageSize: params.limit,
    ...(params.filters ? { filters: params.filters } : {}),
    ...(params.search ? { search: params.search } : {}),
  })
  return {
    data: res.items || [],
    pagination: {
      totalPages: res.totalPages,
      totalCount: res.totalCount,
    },
  }
}

const {
  data: displayedOrders,
  isLoading,
  isFetching,
  isError,
  error,
  searchRefs,
  pagination,
} = usePaginatedQuery({
  queryKey: ['salesOrders'],
  queryFn,
  itemsPerPage,
  filters,
  searchFields: [{ key: 'search', debounce: 400 }],
})

watch(isError, (val) => {
  if (val) {
    toast.error(`Không thể tải danh sách đơn hàng: ${error.value?.message || 'Lỗi không xác định'}`)
  }
})

function createNewOrder() {
  isEditMode.value = false
  selectedOrder.value = null
  showOrderForm.value = true
}

const handleEditOrder = async (order) => {
  isEditMode.value = true
  const cached = queryClient.getQueryData(['salesOrders', order.id])
  if (cached) {
    selectedOrder.value = cached
    showOrderForm.value = true
  } else {
    loadingOverlay.value = true
    showOrderForm.value = true
  }
  try {
    const detail = await queryClient.fetchQuery({
      queryKey: ['salesOrders', order.id],
      queryFn: () => getSalesOrderById(order.id),
    })
    selectedOrder.value = detail
    queryClient.setQueryData(['salesOrders', order.id], detail)
  } catch (err) {
    toast.error(`Lỗi khi tải chi tiết đơn hàng: ${err.message}`)
    showOrderForm.value = false
  } finally {
    loadingOverlay.value = false
  }
}

const handleFormRefresh = async () => {
  if (!isEditMode.value || !selectedOrder.value?.id) return
  loadingOverlay.value = true
  try {
    const detail = await queryClient.fetchQuery({
      queryKey: ['salesOrders', selectedOrder.value.id],
      queryFn: () => getSalesOrderById(selectedOrder.value.id),
      staleTime: 0,
    })
    selectedOrder.value = detail
    queryClient.setQueryData(['salesOrders', detail.id], detail)
    toast.success('Đã tải lại thông tin đơn hàng')
  } catch (err) {
    toast.error(`Lỗi khi tải lại: ${err.message}`)
  } finally {
    loadingOverlay.value = false
  }
}

const handleSaveOrder = async (payload) => {
  loadingOverlay.value = true
  try {
    let result
    if (isEditMode.value && selectedOrder.value?.id) {
      result = await ordersStore.updateOrder(selectedOrder.value.id, payload)
    } else {
      result = await ordersStore.createOrder(payload)
    }
    if (result) {
      queryClient.setQueryData(['salesOrders', result.id], result)
    }
    toast.success(isEditMode.value ? 'Đã cập nhật đơn hàng' : 'Đã tạo đơn hàng mới')
    showOrderForm.value = false
    queryClient.invalidateQueries({ queryKey: ['salesOrders'] })
  } catch (err) {
    toast.error(`Lỗi khi lưu đơn hàng: ${err.message}`)
  } finally {
    loadingOverlay.value = false
  }
}

const handleDeleteOrder = async (order) => {
  try {
    await ordersStore.deleteOrder(order.id)
    queryClient.removeQueries({ queryKey: ['salesOrders', order.id] })
    queryClient.invalidateQueries({ queryKey: ['salesOrders'] })
    toast.success('Đã xoá đơn hàng')
  } catch (err) {
    toast.error(`Lỗi khi xoá đơn hàng: ${err.message}`)
  }
}

const handleImport = (event) => {
  toast.info('Chức năng Import Excel đang phát triển')
  event.target.value = ''
}

const handleExport = () => {
  toast.info('Chức năng Export Excel đang phát triển')
}
</script>

<template>
  <div class="p-6 rounded-xl shadow-lg bg-white">
    <LoadingOverlay v-if="loadingOverlay" />

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
          <tr v-if="isError">
            <td colspan="5" class="text-center p-4 text-red-500">
              Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
            </td>
          </tr>
          <template v-else-if="!displayedOrders || displayedOrders.length === 0">
            <template v-if="isLoading || isFetching">
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
            <tr v-else>
              <td colspan="5" class="text-center p-4">Không có đơn hàng nào.</td>
            </tr>
          </template>
          <tr
            v-else
            v-for="order in displayedOrders"
            :key="order.id"
            class="row-table-style cursor-pointer border-b border-gray-200 hover:bg-gray-50 transition-colors"
            @click="handleEditOrder(order)"
          >
            <td class="py-3 px-6 text-left">
              {{ new Date(order.createdAt).toLocaleDateString('vi-VN') }}
            </td>
            <td class="py-3 px-6 text-left">{{ order.notes || `Đơn hàng #${order.id}` }}</td>
            <td class="py-3 px-6 text-left whitespace-nowrap">
              <RoundBadge :color="getStatusColor(order.statusId)">
                {{ getStatusLabel(order.statusId) }}
              </RoundBadge>
            </td>
            <td class="py-3 px-6 text-left">
              {{ (order.totalAmount || 0).toLocaleString('vi-VN') }} VNĐ
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

    <div class="mt-4">
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-500">
          Tổng: {{ pagination.totalCount.value }} đơn hàng
        </p>
      </div>
    </div>

    <OrderForm
      v-if="showOrderForm"
      :show="showOrderForm"
      :zIndex="110"
      :order="selectedOrder"
      :onRefresh="isEditMode ? handleFormRefresh : undefined"
      @close="showOrderForm = false"
      @save="handleSaveOrder"
      @delete="handleDeleteOrder"
    />
  </div>
</template>
