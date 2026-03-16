<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useOrdersStore } from '@/stores/useOrdersStore'
import { fetchSalesOrders, getSalesOrderById, fetchOutputStatuses } from '@/api/order'
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

const ordersStore = useOrdersStore()
const queryClient = useQueryClient()
const toast = useToast()
const { hasPermission } = usePermission()

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
const itemsPerPage = ref(10)

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
        queryFn: () => getSalesOrderById(order.id),
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
        queryFn: () => getSalesOrderById(order.id),
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
      queryFn: () => getSalesOrderById(selectedOrder.value.id),
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
  <div class="p-4 sm:p-6 rounded-xl shadow-lg bg-white">
    <LoadingOverlay :show="loadingOverlay" />

    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold mb-1 text-gray-800">Quản Lý Đơn Hàng</h1>
        <p class="text-gray-500 text-sm">Quản lý đơn hàng bán ra của cửa hàng</p>
      </div>
      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <Button
          v-if="hasPermission(Permissions.OutputsCreate)"
          color="primary"
          :icon="IconPlus"
          @click="createNewOrder"
          text="Tạo Mới"
          class="flex-1 sm:flex-none"
        />

        <label
          v-if="hasPermission(Permissions.OutputsCreate)"
          for="import-order-input"
          class="cursor-pointer flex-1 sm:flex-none min-w-[100px]"
        >
          <Button text="Import" :icon="IconFileImport" color="secondary" as="span" class="w-full justify-center" />
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
           class="flex-1 sm:flex-none min-w-[100px] justify-center"
        />
      </div>
    </div>

    <div class="rounded-lg shadow-sm border border-gray-300 bg-white">
      <!-- Desktop Table -->
      <div class="hidden md:block overflow-x-auto">
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
            <td class="py-3 px-6 text-left truncate max-w-xs">{{ order.buyerName || '---' }}</td>
            <td class="py-3 px-6 text-left">{{ order.notes || '' }}</td>
            <td class="py-3 px-6 text-left whitespace-nowrap">
              <RoundBadge :color="getStatusColor(order.statusId)">
                {{ getStatusLabel(order.statusId) }}
              </RoundBadge>
            </td>
            <td class="py-3 px-6 text-left">
              {{ (order.total || 0).toLocaleString('vi-VN') }} VNĐ
            </td>
            <td class="py-3 px-6 text-center">
              <SmallNoBgButton
                v-if="hasPermission(Permissions.OutputsEdit)"
                color="blue"
                :icon="IconEdit"
                @click.stop="handleEditOrder(order)"
              >
                Sửa
              </SmallNoBgButton>
            </td>
          </tr>
        </tbody>
        </table>
      </div>

      <!-- Mobile List/Cards View -->
      <div class="md:hidden flex flex-col divide-y divide-gray-200">
        <template v-if="isError">
           <div class="text-center p-6 text-red-500 text-sm">
              Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
           </div>
        </template>
        <template v-else-if="!displayedOrders || displayedOrders.length === 0">
          <div v-if="isLoading || isFetching" class="p-4 space-y-4">
            <div v-for="i in 5" :key="`mob-loading-${i}`" class="space-y-3 pb-4 border-b border-gray-100 last:border-0">
              <SkeletonLoader width="140px" height="20px" />
              <SkeletonLoader width="100%" height="40px" />
              <div class="flex justify-between items-center pt-2">
                <SkeletonLoader width="80px" height="24px" class="rounded-full" />
                <SkeletonLoader width="100px" height="24px" />
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500 text-sm">
            Không có đơn hàng nào.
          </div>
        </template>
        <template v-else>
          <div
            v-for="order in displayedOrders"
            :key="`mobile-${order.id}`"
            class="p-4 flex flex-col gap-3 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            @click="handleEditOrder(order)"
          >
            <div class="flex justify-between items-start gap-2">
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-gray-800 text-base mb-1 truncate">{{ order.buyerName || 'Khách lẻ' }}</div>
                <div class="text-xs text-gray-500 flex items-center gap-1.5">
                   <span>{{ new Date(order.createdAt).toLocaleDateString('vi-VN') }}</span>
                   <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                   <span>{{ new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }}</span>
                </div>
              </div>
              <RoundBadge :color="getStatusColor(order.statusId)" class="shrink-0 text-[10px] sm:text-xs">
                {{ getStatusLabel(order.statusId) }}
              </RoundBadge>
            </div>

            <p v-if="order.notes" class="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded border border-gray-100 italic">
               {{ order.notes }}
            </p>

            <div class="flex items-center justify-between mt-1 pt-3 border-t border-gray-50">
               <span class="font-semibold text-red-600 text-base">
                 {{ (order.total || 0).toLocaleString('vi-VN') }} <span class="text-xs font-normal">VNĐ</span>
               </span>
               
               <SmallNoBgButton
                 v-if="hasPermission(Permissions.OutputsEdit)"
                 color="blue"
                 :icon="IconEdit"
                 @click.stop="handleEditOrder(order)"
               >
                 Sửa
               </SmallNoBgButton>
            </div>
          </div>
        </template>
      </div>
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
