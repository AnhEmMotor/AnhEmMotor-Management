<script setup>
import { ref, computed, watch } from 'vue'
import { useInputsStore } from '@/stores/useInputsStore'
import { fetchInventoryReceipts, getInventoryReceiptById, fetchInputStatuses } from '@/api/input'
import * as XLSX from 'xlsx'
import InventoryItem from '@/components/inventory_input/InventoryItem.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import Pagination from '@/components/ui/button/BasePagination.vue'
import Input from '@/components/ui/input/BaseInput.vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import InventoryInputForm from '@/components/inventory_input/InventoryInputForm.vue'
import ProductForm from '@/components/product/ProductForm.vue'
import InventoryFilterButtons from '@/components/inventory_input/InventoryFilterButtons.vue'
import { showConfirmation } from '@/composables/useConfirmationState'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import { useToast } from 'vue-toastification'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconFileImport from '@/components/icons/IconFileImport.vue'
import IconFileExport from '@/components/icons/IconFileExport.vue'

const inputsStore = useInputsStore()
const queryClient = useQueryClient()
const toast = useToast()

const expandedItemId = ref(null)
const itemsPerPage = ref(15)
const selectedStatuses = ref([])

const filters = computed(() => {
  const f = {}
  if (selectedStatuses.value.length > 0) {
    f.filters = selectedStatuses.value.map((s) => `StatusId==${s}`).join('|')
  }
  return f
})

const queryFn = async (params) => {
  const res = await fetchInventoryReceipts({
    Page: params.page,
    PageSize: params.limit,
    ...(params.filters ? { filters: params.filters } : {}),
    ...(params.search ? { filters: (params.filters ? params.filters + ',' : '') + `Notes@=${params.search}` } : {}),
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
  data: filteredItems,
  isLoading,
  isFetching,
  isError,
  error,
  searchRefs,
  pagination,
} = usePaginatedQuery({
  queryKey: ['inventoryReceipts'],
  queryFn,
  itemsPerPage,
  filters,
  searchFields: [{ key: 'search', debounce: 400 }],
})

const { data: statusMapData } = useQuery({
  queryKey: ['inputStatuses'],
  queryFn: fetchInputStatuses,
  staleTime: Infinity,
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

const exportExcel = () => {
  if (filteredItems.value.length === 0) {
    toast.warning('Không có dữ liệu để xuất')
    return
  }
  const exportData = filteredItems.value.map((item) => ({
    'Mã Phiếu Nhập': item.id,
    'Thời Gian': item.createdAt,
    'Tên NCC': item.supplierName,
    'Trạng Thái': statusMap.value[item.statusId] || item.statusId,
    'Ghi Chú': item.notes,
  }))
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(exportData)
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh Sách Phiếu Nhập')
  const currentDate = new Date().toISOString().split('T')[0]
  XLSX.writeFile(workbook, `DanhSachPhieuNhap_${currentDate}.xlsx`)
}

const handleImport = () => {
  toast.info('Chức năng nhập Excel đang phát triển')
}

const showInventoryModal = ref(false)
const currentInventoryData = ref({ supplier: null, products: [], notes: '' })
const inventoryErrors = ref({ supplier: '', products: {} })
const isEditMode = ref(false)
const loadingOverlay = ref(false)
const showProductModal = ref(false)
const currentProductData = ref({ code: '', name: '', category: '', price: 0, quantity: 1, unitPrice: 0 })

const openNewInventoryModal = () => {
  isEditMode.value = false
  currentInventoryData.value = { supplier: null, products: [], notes: '' }
  showInventoryModal.value = true
}

const openEditInventoryModal = async (item) => {
  isEditMode.value = true
  const cached = queryClient.getQueryData(['inventoryReceipts', item.id])
  if (cached) {
    currentInventoryData.value = mapResponseToForm(cached)
    showInventoryModal.value = true
  } else {
    loadingOverlay.value = true
    showInventoryModal.value = true
  }
  try {
    const detail = await queryClient.fetchQuery({
      queryKey: ['inventoryReceipts', item.id],
      queryFn: () => getInventoryReceiptById(item.id),
    })
    currentInventoryData.value = mapResponseToForm(detail)
  } catch (err) {
    toast.error(`Lỗi khi tải chi tiết phiếu: ${err.message}`)
    showInventoryModal.value = false
  } finally {
    loadingOverlay.value = false
  }
}

const handleInventoryRefresh = async () => {
  if (!isEditMode.value || !currentInventoryData.value.id) return
  loadingOverlay.value = true
  try {
    const detail = await queryClient.fetchQuery({
      queryKey: ['inventoryReceipts', currentInventoryData.value.id],
      queryFn: () => getInventoryReceiptById(currentInventoryData.value.id),
      staleTime: 0,
    })
    currentInventoryData.value = mapResponseToForm(detail)
    toast.success('Đã tải lại thông tin phiếu nhập')
  } catch (err) {
    toast.error(`Lỗi khi tải lại: ${err.message}`)
  } finally {
    loadingOverlay.value = false
  }
}

function mapResponseToForm(d) {
  return {
    id: d.id,
    supplier: d.supplier ? { id: d.supplier.id, name: d.supplier.name, phone: d.supplier.phone || '' } : null,
    products: (d.details || []).map((p) => ({
      id: Date.now() + Math.random(),
      variantId: p.variantId,
      code: p.variantCode || p.code,
      name: p.variantName || p.name,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      total: p.quantity * p.unitPrice,
    })),
    notes: d.notes || '',
    importDate: d.importDate,
    statusId: d.statusId,
  }
}

const closeInventoryModal = () => {
  showInventoryModal.value = false
  showProductModal.value = false
  loadingOverlay.value = false
}

const openProductModal = () => {
  currentProductData.value = { code: '', name: '', category: '', price: 0, quantity: 1, unitPrice: 0 }
  showProductModal.value = true
}

const closeProductModal = () => {
  showProductModal.value = false
}

watch(
  () => currentInventoryData.value,
  () => {
    inventoryErrors.value = { supplier: '', products: {} }
  },
  { deep: true },
)

function validateInventory(data) {
  const errors = { supplier: '', products: {} }
  if (!data.supplier || !data.supplier.id) {
    errors.supplier = 'Vui lòng chọn nhà cung cấp'
  }
  if (!data.products || data.products.length === 0) {
    errors.products.__global = 'Vui lòng thêm ít nhất một sản phẩm'
    return errors
  }
  data.products.forEach((p) => {
    const per = {}
    if (Number(p.quantity) <= 0) per.quantity = 'Số lượng phải lớn hơn 0'
    if (Number(p.unitPrice) < 0) per.unitPrice = 'Đơn giá không được nhỏ hơn 0'
    if (Object.keys(per).length > 0) errors.products[p.id] = per
  })
  return errors
}

function buildPayload(data, statusId) {
  return {
    supplierId: data.supplier.id,
    statusId,
    notes: data.notes,
    importDate: data.importDate,
    details: data.products.map((p) => ({
      variantId: p.variantId,
      quantity: Number(p.quantity),
      unitPrice: Number(p.unitPrice),
    })),
  }
}

const saveInventoryReceipt = async () => {
  const errors = validateInventory(currentInventoryData.value)
  if (Object.keys(errors.products).length > 0 || errors.supplier) {
    inventoryErrors.value = errors
    return
  }
  inventoryErrors.value = { supplier: '', products: {} }
  loadingOverlay.value = true
  try {
    const payload = buildPayload(currentInventoryData.value, 'working')
    let result
    if (isEditMode.value && currentInventoryData.value.id) {
      result = await inputsStore.updateInput(currentInventoryData.value.id, payload)
    } else {
      result = await inputsStore.createInput(payload)
    }
    if (result) {
      queryClient.setQueryData(['inventoryReceipts', result.id], result)
    }
    toast.success('Đã lưu phiếu tạm')
    closeInventoryModal()
    queryClient.invalidateQueries({ queryKey: ['inventoryReceipts'] })
  } catch (err) {
    toast.error(`Lỗi khi lưu phiếu nhập: ${err.message}`)
  } finally {
    loadingOverlay.value = false
  }
}

const completeInventoryReceipt = async () => {
  const errors = validateInventory(currentInventoryData.value)
  if (Object.keys(errors.products).length > 0 || errors.supplier) {
    inventoryErrors.value = errors
    return
  }
  inventoryErrors.value = { supplier: '', products: {} }
  loadingOverlay.value = true
  try {
    const payload = buildPayload(currentInventoryData.value, 'finished')
    let result
    if (isEditMode.value && currentInventoryData.value.id) {
      result = await inputsStore.updateInput(currentInventoryData.value.id, payload)
    } else {
      result = await inputsStore.createInput(payload)
    }
    if (result) {
      queryClient.setQueryData(['inventoryReceipts', result.id], result)
    }
    toast.success('Đã hoàn thành phiếu nhập!')
    closeInventoryModal()
    queryClient.invalidateQueries({ queryKey: ['inventoryReceipts'] })
  } catch (err) {
    toast.error(`Lỗi khi hoàn thành phiếu nhập: ${err.message}`)
  } finally {
    loadingOverlay.value = false
  }
}

const saveNewProduct = () => {
  if (!currentProductData.value.code || !currentProductData.value.name) {
    toast.warning('Vui lòng nhập mã và tên sản phẩm')
    return
  }
  currentInventoryData.value.products.push({
    id: Date.now(),
    code: currentProductData.value.code,
    name: currentProductData.value.name,
    quantity: currentProductData.value.quantity || 1,
    unitPrice: currentProductData.value.unitPrice || 0,
    total: (currentProductData.value.quantity || 1) * (currentProductData.value.unitPrice || 0),
  })
  closeProductModal()
}

const handleCancelRequest = async (item) => {
  const confirmed = await showConfirmation(
    'Xác nhận huỷ phiếu',
    `Bạn có chắc muốn huỷ phiếu ${item.id}? Hành động này không thể hoàn tác.`,
  )
  if (!confirmed) return
  try {
    await inputsStore.updateInputStatus(item.id, 'cancelled')
    toast.success('Đã huỷ phiếu thành công')
    queryClient.removeQueries({ queryKey: ['inventoryReceipts', item.id] })
    queryClient.invalidateQueries({ queryKey: ['inventoryReceipts'] })
  } catch (err) {
    toast.error(`Lỗi khi huỷ phiếu: ${err.message}`)
  }
}

const handleSaveNotes = async ({ id, notes }) => {
  try {
    const result = await inputsStore.updateInput(id, { notes })
    if (result) queryClient.setQueryData(['inventoryReceipts', id], result)
    toast.success('Đã lưu ghi chú')
    queryClient.invalidateQueries({ queryKey: ['inventoryReceipts'] })
  } catch (err) {
    toast.error(`Lỗi khi lưu ghi chú: ${err.message}`)
  }
}

const handleCopyReceipt = async (item) => {
  isEditMode.value = false
  currentInventoryData.value = {
    supplier: item.supplier ? { id: item.supplier.id, name: item.supplier.name, phone: '' } : null,
    products: (item.details || []).map((p) => ({
      id: Date.now() + Math.random(),
      variantId: p.variantId,
      code: p.variantCode || p.code,
      name: p.variantName || p.name,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      total: p.quantity * p.unitPrice,
    })),
    notes: item.notes || '',
  }
  showInventoryModal.value = true
}
</script>

<template>
  <div class="p-4 sm:p-6 rounded-xl shadow-lg bg-white">
    <LoadingOverlay v-if="loadingOverlay" />

    <div
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Quản lý phiếu nhập kho</h1>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button
          text="Tạo phiếu nhập hàng"
          :icon="IconPlus"
          color="primary"
          @click="openNewInventoryModal"
        />

        <label class="cursor-pointer">
          <Button
            text="Import"
            :icon="IconFileImport"
            color="secondary"
            as="span"
            @click="handleImport"
          />
        </label>

        <Button text="Export" :icon="IconFileExport" color="secondary" @click="exportExcel" />

        <span class="text-gray-400 mx-4 hidden border-r-2 sm:block" />

        <InventoryFilterButtons v-model="selectedStatuses" :status-map="statusMap" />
      </div>
    </div>

    <Input v-model="searchRefs.search" type="text" placeholder="Tìm theo mã phiếu, NCC..." class="mb-3" />

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
          Đã xảy ra lỗi khi lấy dữ liệu
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
          <div
            v-else
            class="text-center py-12 flex flex-col items-center justify-center space-y-3"
          >
            <div class="bg-gray-50 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p class="text-gray-500 font-medium">Không có phiếu nhập nào để hiển thị.</p>
          </div>
        </template>

        <div v-else class="divide-y divide-gray-50">
          <InventoryItem
            v-for="item in filteredItems"
            :key="item.id"
            :itemData="item"
            :status-map="statusMap"
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
      :loading="isLoading"
    />

    <DraggableModal
      v-if="showInventoryModal"
      :z-index="1000"
      width="70vw"
      :disabled="showProductModal"
      :onRefresh="isEditMode ? handleInventoryRefresh : undefined"
      @close="closeInventoryModal"
    >
      <template #header>
        <h3 class="text-lg font-semibold">
          {{ isEditMode ? 'Chỉnh sửa phiếu nhập' : 'Tạo phiếu nhập hàng' }}
        </h3>
      </template>

      <template #body>
        <InventoryInputForm
          v-model="currentInventoryData"
          :is-edit-mode="isEditMode"
          :errors="inventoryErrors"
          @add-product="openProductModal"
        />
      </template>

      <template #footer>
        <Button text="Hủy" color="gray" @click="closeInventoryModal" />
        <Button text="Lưu tạm" color="secondary" @click="saveInventoryReceipt" />
        <Button text="Hoàn thành" color="primary" @click="completeInventoryReceipt" />
      </template>
    </DraggableModal>

    <DraggableModal
      v-if="showProductModal"
      :z-index="1001"
      width="72vw"
      @close="closeProductModal"
    >
      <template #header>
        <h3 class="text-lg font-semibold">Thêm sản phẩm mới</h3>
      </template>

      <template #body>
        <ProductForm v-model="currentProductData" :is-edit-mode="false" />
      </template>

      <template #footer>
        <Button text="Hủy" color="gray" @click="closeProductModal" />
        <Button text="Thêm sản phẩm" color="primary" @click="saveNewProduct" />
      </template>
    </DraggableModal>
  </div>
</template>
