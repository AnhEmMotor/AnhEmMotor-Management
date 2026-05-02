<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useOrderStore } from '@/stores/order.store'
import orderMapper from '@/mappers/order.mapper'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { useQuery, useQueryClient } from '@tanstack/vue-query'

import RoundBadge from '@/components/ui/RoundBadge.vue'
import OrderForm from '@/components/orders/OrderForm.vue'
import SmallNoBgButton from '@/components/ui/button/SmallNoBgButton.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import Pagination from '@/components/ui/button/BasePagination.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import IconPlus from '@/assets/icons/IconPlus.svg'
import IconFileImport from '@/assets/icons/IconFileImport.svg'
import IconFileExport from '@/assets/icons/IconFileExport.svg'
import IconEdit from '@/assets/icons/IconEdit.svg'
import { useToast } from 'vue-toastification'
import { Permissions } from '@/constants/permissions'
import { usePermission } from '@/composables/usePermission'

const orderStore = useOrderStore()
const queryClient = useQueryClient()
const toast = useToast()
const { hasPermission } = usePermission()

const STATUS_COLOR_MAP = {
  pending: 'gray',
  waiting_deposit: 'yellow',
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
  queryKey: ['order-statuses'],
  queryFn: orderStore.fetchStatuses,
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
const itemsPerPage = ref(10)
const formErrors = ref({})

const filters = computed(() =>
  orderMapper.toParams({
    selectedStatuses: selectedStatuses.value,
  }),
)

const queryFn = async (params) => {
  return await orderStore.fetchOrders({
    Page: params.page,
    PageSize: params.limit,
    ...(params.filters ? { filters: params.filters } : {}),
    ...(params.search ? { search: params.search } : {}),
  })
}

const {
  data: displayedOrders,
  isLoading,
  isFetching,
  isError,
  error,
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
  const cachedData = queryClient.getQueryData(['salesOrders', order.id])

  if (cachedData) {
    selectedOrder.value = cachedData
    showOrderForm.value = true
    queryClient
      .fetchQuery({
        queryKey: ['salesOrders', order.id],
        queryFn: () => orderStore.getOrderById(order.id),
        staleTime: 0,
      })
      .then((detail) => {
        if (selectedOrder.value?.id === order.id) {
          selectedOrder.value = detail
          queryClient.setQueryData(['salesOrders', order.id], detail)
        }
      })
      .catch((err) => {
        toast.error(`Lỗi khi cập nhật ngầm chi tiết đơn hàng: ${err.message}`)
      })
  } else {
    loadingOverlay.value = true
    try {
      const detail = await queryClient.fetchQuery({
        queryKey: ['salesOrders', order.id],
        queryFn: () => orderStore.getOrderById(order.id),
        staleTime: 0,
      })
      selectedOrder.value = detail
      queryClient.setQueryData(['salesOrders', order.id], detail)
      showOrderForm.value = true
    } catch (err) {
      toast.error(`Lỗi khi tải chi tiết đơn hàng: ${err.message}`)
    } finally {
      loadingOverlay.value = false
    }
  }
}

const handleFormRefresh = async () => {
  if (!isEditMode.value || !selectedOrder.value?.id) return
  loadingOverlay.value = true
  try {
    const detail = await queryClient.fetchQuery({
      queryKey: ['salesOrders', selectedOrder.value.id],
      queryFn: () => orderStore.getOrderById(selectedOrder.value.id),
      staleTime: 0,
    })
    selectedOrder.value = detail
    queryClient.setQueryData(['salesOrders', detail.id], detail)
    toast.success('Đã tải lại thông tin đơn hàng')
  } catch (err) {
    toast.error(`Lỗi khi tải lại: ${err.message}`)
  } finally {
    await nextTick()
    loadingOverlay.value = false
  }
}

const handleSaveOrder = async (payload) => {
  loadingOverlay.value = true
  formErrors.value = {}
  try {
    let result
    if (isEditMode.value && selectedOrder.value?.id) {
      result = await orderStore.saveOrder(selectedOrder.value.id, payload)
    } else {
      result = await orderStore.saveOrder(null, payload)
    }
    if (result) {
      queryClient.setQueryData(['salesOrders', result.id], result)
    }
    toast.success(isEditMode.value ? 'Đã cập nhật đơn hàng' : 'Đã tạo đơn hàng mới')
    showOrderForm.value = false
    queryClient.invalidateQueries({ queryKey: ['salesOrders'] })
  } catch (err) {
    if (err.response?.data?.type === 'Validation') {
      const apiErrors = err.response.data.errors || []
      formErrors.value = apiErrors.reduce((acc, curr) => {
        acc[curr.field] = curr.message
        return acc
      }, {})
    } else {
      toast.error(`Lỗi khi lưu đơn hàng: ${err.message}`)
    }
  } finally {
    loadingOverlay.value = false
  }
}

const handleDeleteOrder = async (order) => {
  try {
    await orderStore.deleteOrder(order.id)
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

const handleCopyPaymentLink = async (order) => {
  loadingOverlay.value = true
  try {
    const response = await orderStore.getPaymentLink(order.id)
    if (response) {
      await navigator.clipboard.writeText(response)
      toast.success('Đã copy link thanh toán vào clipboard!')
    }
  } catch (err) {
    toast.error(`Lỗi khi lấy link thanh toán: ${err.message}`)
  } finally {
    loadingOverlay.value = false
  }
}
</script>

<template>
  <div class="p-6 rounded-xl shadow-lg bg-white">
    <LoadingOverlay :show="loadingOverlay" />

    <div class="flex items-start justify-between mb-4">
      <div>
        <h1 class="text-3xl font-bold mb-1 text-gray-800">Quản Lý Đơn Hàng</h1>
        <p class="text-gray-500 text-sm">Quản lý đơn hàng bán ra của cửa hàng</p>
      </div>
      <div class="flex items-center gap-2">
        <Button
          v-if="hasPermission(Permissions.OutputsCreate)"
          color="primary"
          :icon="IconPlus"
          @click="createNewOrder"
          text="Tạo Đơn Hàng Mới"
        />

        <label
          v-if="hasPermission(Permissions.OutputsCreate)"
          for="import-order-input"
          class="cursor-pointer"
        >
          <Button text="Import" :icon="IconFileImport" color="secondary" as="span" />
          <input
            type="file"
            id="import-order-input"
            accept=".xlsx, .xls"
            class="hidden"
            @change="handleImport"
          />
        </label>

        <Button
          v-if="hasPermission(Permissions.OutputsView)"
          text="Export"
          :icon="IconFileExport"
          color="secondary"
          @click="handleExport"
        />
      </div>
    </div>

    <div class="overflow-x-auto rounded-lg shadow-sm border border-gray-300">
      <table class="min-w-full bg-white border-collapse">
        <thead>
          <tr
            class="bg-gray-50 text-gray-500 uppercase text-xs font-medium tracking-wider leading-normal border-b border-gray-200"
          >
            <th class="py-3 px-6 text-left w-48">Thời Gian Đặt</th>
            <th class="py-3 px-6 text-left w-64">Tên khách hàng</th>
            <th class="py-3 px-6 text-left">Ghi chú</th>
            <th class="py-3 px-6 text-left w-64">Trạng Thái</th>
            <th class="py-3 px-6 text-left w-48">Tổng Tiền</th>
            <th class="py-3 px-6 text-center w-32">Hành động</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm">
          <tr v-if="isError">
            <td colspan="6" class="text-center p-4 text-red-500">
              Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
            </td>
          </tr>
          <template v-else-if="!displayedOrders || displayedOrders.length === 0">
            <template v-if="isLoading || isFetching">
              <tr v-for="i in 5" :key="i" class="border-b border-gray-100">
                <td class="py-3 px-6"><SkeletonLoader width="100%" height="20px" /></td>
                <td class="py-3 px-6"><SkeletonLoader width="80%" height="20px" /></td>
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
              <td colspan="6" class="text-center p-4">Không có đơn hàng nào.</td>
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
              {{
                new Date(order.createdAt).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              }}
            </td>
            <td class="py-3 px-6 text-left truncate max-w-xs">
              {{ order.buyerName || order.buyerEmail || '---' }}
            </td>
            <td class="py-3 px-6 text-left">{{ order.notes || '' }}</td>
            <td class="py-3 px-6 text-left whitespace-nowrap">
              <RoundBadge :color="getStatusColor(order.statusId)">
                {{ getStatusLabel(order.statusId) }}
              </RoundBadge>
            </td>
            <td class="py-3 px-6 text-left">
              <div class="flex flex-col">
                <span class="font-bold text-gray-800">
                  {{ (order.total || 0).toLocaleString('vi-VN') }} VNĐ
                </span>
              </div>
            </td>
            <td class="py-3 px-6 text-center">
              <div class="flex items-center justify-center gap-2">
                <SmallNoBgButton
                  v-if="hasPermission(Permissions.OutputsEdit)"
                  color="blue"
                  :icon="IconEdit"
                  @click.stop="handleEditOrder(order)"
                >
                  Sửa
                </SmallNoBgButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4">
      <div class="flex items-center justify-center">
        <Pagination
          :total-pages="pagination.totalPages.value"
          :currentPage="pagination.currentPage.value"
          @update:currentPage="pagination.changePage"
          :loading="isLoading"
        />
      </div>
    </div>

    <OrderForm
      v-if="showOrderForm"
      :key="selectedOrder?.id || 'new'"
      :show="showOrderForm"
      :zIndex="110"
      :order="selectedOrder"
      :onRefresh="isEditMode ? handleFormRefresh : undefined"
      :apiErrors="formErrors"
      @close="showOrderForm = false"
      @save="handleSaveOrder"
      @delete="handleDeleteOrder"
    />
  </div>
</template>
