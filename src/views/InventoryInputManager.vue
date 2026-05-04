<script setup>
import { ref, computed, watch } from 'vue'
import { useInputStore } from '@/stores/input.store'

import InventoryItem from '@/components/inventory_input/InventoryItem.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import Pagination from '@/components/ui/button/BasePagination.vue'
import Input from '@/components/ui/input/BaseInput.vue'
import InventoryInputFormModal from '@/components/inventory_input/InventoryInputFormModal.vue'
import InventoryFilterButtons from '@/components/inventory_input/InventoryFilterButtons.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'

import { showConfirmation } from '@/composables/useConfirmationState'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import { useToast } from 'vue-toastification'
import IconPlus from '@/assets/icons/IconPlus.svg'
import IconFileImport from '@/assets/icons/IconFileImport.svg'
import IconFileExport from '@/assets/icons/IconFileExport.svg'
import IconEmptyBox from '@/assets/icons/empty-box.svg'
import { Permissions } from '@/constants/permissions'
import { usePermission } from '@/composables/usePermission'

const inputStore = useInputStore()
const queryClient = useQueryClient()
const toast = useToast()
const { hasPermission } = usePermission()

const expandedItemId = ref(null)
const itemsPerPage = ref(15)

const {
  data: filteredItems,
  isLoading,
  isFetching,
  isError,
  error,
  searchRefs,
  filterRefs,
  pagination,
} = usePaginatedQuery({
  queryKey: ['inventoryReceipts'],
  queryFn: (params) => inputStore.fetchInputs(params),
  itemsPerPage,
  searchFields: [{ key: 'search', debounce: 400 }],
  filterFields: [{ key: 'status' }],
})

const selectedStatus = computed({
  get: () => filterRefs.status || '',
  set: (val) => {
    filterRefs.status = val
  },
})

const { data: statusMapData } = useQuery({
  queryKey: ['inputStatuses'],
  queryFn: () => inputStore.fetchInputStatuses(),
})

const statusMap = computed(() => statusMapData.value || {})

watch(isError, (hasError) => {
  if (hasError) {
    toast.error(error.value?.message || 'Lỗi tải dữ liệu phiếu nhập')
  }
})

function handleToggleDetail(itemId) {
  expandedItemId.value = expandedItemId.value === itemId ? null : itemId
}

const showInventoryModal = ref(false)
const isEditMode = ref(false)
const currentInventoryData = ref({ supplier: null, products: [], notes: '' })
const inventoryErrors = ref({ supplier: '', products: {} })
const isSaving = ref(false)
const overlayMessage = ref('')

const openNewInventoryModal = () => {
  isEditMode.value = false
  currentInventoryData.value = {
    supplier: null,
    products: [],
    notes: '',
    statusId: 'working',
  }
  inventoryErrors.value = { supplier: '', products: {} }
  showInventoryModal.value = true
}

const openEditInventoryModal = async (item) => {
  isEditMode.value = true
  inventoryErrors.value = { supplier: '', products: {} }

  const cached = queryClient.getQueryData(['inventoryReceipts', item.id])
  if (cached) {
    currentInventoryData.value = JSON.parse(JSON.stringify(cached))
  } else {
    isSaving.value = true
    overlayMessage.value = 'Đang tải chi tiết...'
  }

  showInventoryModal.value = true
  try {
    const detail = await queryClient.fetchQuery({
      queryKey: ['inventoryReceipts', item.id],
      queryFn: () => inputStore.getInputById(item.id),
    })
    currentInventoryData.value = JSON.parse(JSON.stringify(detail))
  } catch (err) {
    toast.error(`Lỗi khi tải chi tiết phiếu: ${err.message}`)
    showInventoryModal.value = false
  } finally {
    isSaving.value = false
  }
}

const handleInventoryRefresh = async () => {
  if (!isEditMode.value || !currentInventoryData.value.id) return
  isSaving.value = true
  overlayMessage.value = 'Đang làm mới dữ liệu...'
  try {
    const detail = await queryClient.fetchQuery({
      queryKey: ['inventoryReceipts', currentInventoryData.value.id],
      queryFn: () => inputStore.getInputById(currentInventoryData.value.id),
    })
    currentInventoryData.value = JSON.parse(JSON.stringify(detail))
    toast.success('Đã làm mới thông tin phiếu nhập')
  } catch (err) {
    toast.error(`Lỗi khi làm mới: ${err.message}`)
  } finally {
    isSaving.value = false
  }
}

const closeInventoryModal = () => {
  showInventoryModal.value = false
}

const handleSaveInventory = async (data, statusId = 'working') => {
  const errors = inputStore.validateInput(data)
  if (Object.keys(errors.products).length > 0 || errors.supplier) {
    inventoryErrors.value = errors
    toast.warning('Vui lòng kiểm tra lại thông tin phiếu nhập')
    return
  }

  isSaving.value = true
  overlayMessage.value =
    statusId === 'finished' ? 'Đang hoàn thành phiếu...' : 'Đang lưu phiếu tạm...'

  try {
    const result = await inputStore.saveInput(data, statusId, isEditMode.value)
    if (result) {
      queryClient.setQueryData(['inventoryReceipts', result.id], result)
      await queryClient.invalidateQueries({ queryKey: ['inventoryReceipts'] })
      toast.success(statusId === 'finished' ? 'Đã hoàn thành phiếu nhập!' : 'Đã lưu phiếu tạm')
      closeInventoryModal()
    }
  } catch (err) {
    toast.error(`Lỗi: ${err.message || 'Không thể lưu phiếu'}`)
  } finally {
    isSaving.value = false
  }
}

const handleCancelRequest = async (item) => {
  const confirmed = await showConfirmation(
    'Xác nhận huỷ phiếu',
    `Bạn có chắc muốn huỷ phiếu ${item.id}? Hành động này không thể hoàn tác.`,
  )
  if (!confirmed) return

  isSaving.value = true
  overlayMessage.value = 'Đang hủy phiếu...'
  try {
    await inputStore.updateStatus(item.id, 'cancelled')
    toast.success('Đã huỷ phiếu thành công')
    await queryClient.invalidateQueries({ queryKey: ['inventoryReceipts'] })
  } catch (err) {
    toast.error(`Lỗi: ${err.message}`)
  } finally {
    isSaving.value = false
  }
}

const handleSaveNotes = async ({ id, notes }) => {
  try {
    const result = await inputStore.updateNotes(id, notes)
    if (result) {
      queryClient.setQueryData(['inventoryReceipts', id], result)
    }
    toast.success('Đã lưu ghi chú')
    await queryClient.invalidateQueries({ queryKey: ['inventoryReceipts'] })
  } catch (err) {
    toast.error(`Lỗi: ${err.message}`)
  }
}

const handleCopyReceipt = async (item) => {
  isEditMode.value = false
  inventoryErrors.value = { supplier: '', products: {} }

  currentInventoryData.value = {
    supplier: item.supplier ? { ...item.supplier } : null,
    products: (item.products || []).map((p) => ({
      ...p,
      id: Date.now() + Math.random(),
    })),
    notes: `Copy từ phiếu ${item.id}. ${item.notes || ''}`,
    statusId: 'working',
  }
  showInventoryModal.value = true
}

const handleExport = () => {
  toast.info('Chức năng xuất Excel đang phát triển')
}

const handleImport = () => {
  toast.info('Chức năng nhập Excel đang phát triển')
}
</script>

<template>
  <div class="p-4 sm:p-6 rounded-xl shadow-lg bg-white">
    <LoadingOverlay :show="isSaving" :message="overlayMessage" />
    <div
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Quản lý phiếu nhập kho</h1>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button
          v-if="hasPermission(Permissions.InputsCreate)"
          text="Tạo phiếu nhập hàng"
          :icon="IconPlus"
          color="primary"
          @click="openNewInventoryModal"
        />

        <label v-if="hasPermission(Permissions.InputsCreate)" class="cursor-pointer">
          <Button text="Import" :icon="IconFileImport" color="secondary" as="span" />
          <input
            type="file"
            id="import-file-input"
            accept=".xlsx, .xls"
            class="hidden"
            @change="handleImport"
          />
        </label>

        <Button
          v-if="hasPermission(Permissions.InputsView)"
          text="Export"
          :icon="IconFileExport"
          color="secondary"
          @click="handleExport"
        />

        <span class="text-gray-400 mx-4 hidden border-r-2 sm:block" />

        <InventoryFilterButtons v-model="selectedStatus" :status-map="statusMap" />
      </div>
    </div>

    <Input
      v-model="searchRefs.search"
      type="text"
      placeholder="Tìm theo mã phiếu, tên nhà cung cấp..."
      class="mb-3"
    />

    <div class="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div
        class="hidden md:grid grid-cols-[1.5fr_2fr_1.5fr_1.2fr] items-center py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200"
      >
        <div class="px-3">Thời gian</div>
        <div class="px-5">Nhà cung cấp</div>
        <div class="px-5 text-right">Tổng giá trị phiếu nhập</div>
        <div class="px-5">Trạng thái</div>
      </div>

      <div class="bg-white">
        <div v-if="isError" class="text-center py-12 text-red-500 font-medium">
          Đã xảy ra lỗi khi lấy dữ liệu nhà cung cấp
        </div>

        <template v-else-if="filteredItems.length === 0">
          <div v-if="isLoading || isFetching">
            <div
              v-for="i in 5"
              :key="i"
              class="grid grid-cols-[1.5fr_2fr_1.5fr_1.2fr] items-center py-3 px-5 border-b border-gray-50 last:border-0"
            >
              <div class="px-3"><SkeletonLoader width="80%" height="16px" /></div>
              <div class="px-5"><SkeletonLoader width="70%" height="16px" /></div>
              <div class="px-5 flex justify-end"><SkeletonLoader width="60%" height="16px" /></div>
              <div class="px-5">
                <SkeletonLoader width="70%" height="24px" class="rounded-full" />
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 flex flex-col items-center justify-center space-y-3">
            <div class="bg-gray-50 p-3 rounded-full">
              <IconEmptyBox class="h-8 w-8 text-gray-400" />
            </div>
            <p class="text-gray-500 font-medium">Không có phiếu nhập nào để hiển thị.</p>
          </div>
        </template>

        <div v-else class="divide-y divide-gray-50">
          <InventoryItem
            v-for="item in filteredItems"
            :key="item.id"
            :itemData="item"
            :status-label="statusMap[item.statusId]"
            :is-open="item.id === expandedItemId"
            @toggle-detail="handleToggleDetail"
            @edit="openEditInventoryModal"
            @copy="handleCopyReceipt"
            @cancel-request="handleCancelRequest"
            @save-notes="handleSaveNotes"
          />
        </div>
      </div>
    </div>

    <Pagination
      :total-pages="pagination.totalPages.value"
      v-model:currentPage="pagination.currentPage.value"
      @update:currentPage="pagination.changePage"
      :loading="isLoading"
    />

    <InventoryInputFormModal
      :show="showInventoryModal"
      :data="currentInventoryData"
      :is-edit-mode="isEditMode"
      :errors="inventoryErrors"
      :is-loading="isSaving"
      :on-refresh="isEditMode ? handleInventoryRefresh : undefined"
      @close="closeInventoryModal"
      @save="(data) => handleSaveInventory(data, 'working')"
      @complete="(data) => handleSaveInventory(data, 'finished')"
    />
  </div>
</template>
