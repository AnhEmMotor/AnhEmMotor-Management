<script setup>
import { ref, watch } from 'vue'
import { useInputsStore } from '@/stores/useInputsStore'
import * as XLSX from 'xlsx'
import InventoryItem from '@/components/inventory_input/InventoryItem.vue'
import Button from '@/components/ui/button/Button.vue'
import Pagination from '@/components/ui/button/Pagination.vue'
import Input from '@/components/ui/input/Input.vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import InventoryInputForm from '@/components/inventory_input/InventoryInputForm.vue'
import ProductForm from '@/components/product/ProductForm.vue'
import { showConfirmation } from '@/composables/useConfirmationState'
import { useQueryClient } from '@tanstack/vue-query'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'

const inputsStore = useInputsStore()
const queryClient = useQueryClient()

const expandedItemId = ref(null)

const currentPage = ref(1)
const itemsPerPage = ref(15)

const fetchInputsFn = (params) => {
  return inputsStore.fetchInputs(params)
}

const inputsDataMapper = (data) => ({
  items: data?.inputs || [],
  count: data?.count || 0,
})

const {
  items: filteredItems,
  _totalCount,
  totalPages,
  isLoading,
  isError,
  error,
} = usePaginatedQuery({
  queryKeyBase: ref('inventoryInputs'),
  page: currentPage,
  itemsPerPage: itemsPerPage,
  fetchFn: fetchInputsFn,
  dataMapper: inputsDataMapper,
})

function handleToggleDetail(itemId) {
  expandedItemId.value = expandedItemId.value === itemId ? null : itemId
}

const exportExcel = () => {
  if (filteredItems.value.length === 0) {
    return
  }
  const exportData = filteredItems.value.map((item) => ({
    'Mã Phiếu Nhập': item.id,
    'Thời Gian': item.time,
    'Mã NCC': item.supplierCode,
    'Tên NCC': item.supplierName,
    'Cần Trả NCC': item.payable,
    'Trạng Thái': item.status,
    'Chi Nhánh': item.branch,
    'Người Tạo': item.creator,
    'Người Nhập': item.importer,
    'Ngày Nhập': item.importDate,
    'Đã Trả NCC': item.paid,
    'Ghi Chú': item.notes,
  }))
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(exportData)
  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 20 },
    { wch: 12 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 30 },
  ]
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh Sách Phiếu Nhập')
  const currentDate = new Date().toISOString().split('T')[0]
  const filename = `DanhSachPhieuNhap_${currentDate}.xlsx`
  XLSX.writeFile(workbook, filename)
}

const showInventoryModal = ref(false)
const showProductModal = ref(false)
const currentInventoryData = ref({
  supplier: null,
  products: [],
  notes: '',
})
const inventoryErrors = ref({ supplier: '', products: {} })
const isEditMode = ref(false)
const currentProductData = ref({
  code: '',
  name: '',
  category: '',
  price: 0,
  quantity: 0,
  unitPrice: 0,
})

const openNewInventoryModal = () => {
  isEditMode.value = false
  currentInventoryData.value = {
    supplier: null,
    products: [],
    notes: '',
  }
  showInventoryModal.value = true
}

const openEditInventoryModal = (item) => {
  isEditMode.value = true
  currentInventoryData.value = {
    id: item.id,
    supplier: {
      id: item.supplierCode,
      name: item.supplierName,
      phone: '',
    },
    products: item.products.map((p) => ({
      id: Date.now() + Math.random(),
      code: p.code,
      name: p.name,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      total: p.total,
    })),
    notes: item.notes || '',
    importDate: item.importDate,
  }
  showInventoryModal.value = true
}

const closeInventoryModal = () => {
  showInventoryModal.value = false
}

const openProductModal = () => {
  currentProductData.value = {
    code: '',
    name: '',
    category: '',
    price: 0,
    quantity: 1,
    unitPrice: 0,
  }
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
    if (Number(p.quantity) <= 0) {
      per.quantity = 'Số lượng phải lớn hơn 0'
    }
    if (Number(p.unitPrice) < 0) {
      per.unitPrice = 'Đơn giá không được nhỏ hơn 0'
    }
    if (Object.keys(per).length > 0) {
      errors.products[p.id] = per
    }
  })
  return errors
}

const saveInventoryReceipt = async () => {
  const errors = validateInventory(currentInventoryData.value)
  if (Object.keys(errors.products).length > 0 || errors.supplier) {
    inventoryErrors.value = errors
    return
  }
  inventoryErrors.value = { supplier: '', products: {} }

  try {
    await inputsStore.saveReceipt({
      receiptData: currentInventoryData.value,
      isEditMode: isEditMode.value,
      status_id: 'working',
    })
    closeInventoryModal()
    queryClient.invalidateQueries({ queryKey: ['inventoryInputs'] })
  } catch (error) {
    console.error('Lỗi khi lưu phiếu nhập:', error)
  }
}

const completeInventoryReceipt = async () => {
  const errors = validateInventory(currentInventoryData.value)
  if (Object.keys(errors.products).length > 0 || errors.supplier) {
    inventoryErrors.value = errors
    return
  }
  inventoryErrors.value = { supplier: '', products: {} }

  try {
    await inputsStore.saveReceipt({
      receiptData: currentInventoryData.value,
      isEditMode: isEditMode.value,
      status_id: 'finished',
    })
    console.log('Đã hoàn thành phiếu nhập!')
    closeInventoryModal()
    queryClient.invalidateQueries({ queryKey: ['inventoryInputs'] })
  } catch (error) {
    console.error('Lỗi khi hoàn thành phiếu nhập:', error)
  }
}

const saveNewProduct = () => {
  if (!currentProductData.value.code || !currentProductData.value.name) {
    console.log('Vui lòng nhập mã và tên sản phẩm')
    return
  }
  const newProduct = {
    id: Date.now(),
    code: currentProductData.value.code,
    name: currentProductData.value.name,
    quantity: currentProductData.value.quantity || 1,
    unitPrice: currentProductData.value.unitPrice || 0,
    total: (currentProductData.value.quantity || 1) * (currentProductData.value.unitPrice || 0),
  }

  currentInventoryData.value.products.push(newProduct)
  closeProductModal()
}

const handleCopyReceipt = (item) => {
  const copyData = JSON.parse(JSON.stringify(item))
  delete copyData.id
  copyData.status = 'Phiếu tạm'
  copyData.paid = 0
  currentInventoryData.value = {
    supplier: {
      id: copyData.supplierCode,
      name: copyData.supplierName,
      phone: '',
    },
    products: copyData.products.map((p) => ({
      id: Date.now() + Math.random(),
      code: p.code,
      name: p.name,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      total: p.total,
    })),
    notes: copyData.notes || '',
  }
  isEditMode.value = false
  showInventoryModal.value = true
}

const handleCancelRequest = async (item) => {
  const title = 'Xác nhận huỷ phiếu'
  const message = `Bạn có chắc muốn huỷ phiếu ${item.id}? Hành động này không thể hoàn tác.`
  const confirmed = await showConfirmation(title, message)
  if (!confirmed) return

  try {
    await inputsStore.cancelReceipt({ id: item.id })
    queryClient.invalidateQueries({ queryKey: ['inventoryInputs'] })
  } catch (error) {
    console.error('Lỗi khi huỷ phiếu:', error)
  }
}

const handleSaveNotes = async ({ id, notes }) => {
  try {
    await inputsStore.saveNotes({ id, notes })
    queryClient.invalidateQueries({ queryKey: ['inventoryInputs'] })
  } catch (error) {
    console.error('Lỗi khi lưu ghi chú:', error)
  }
}
</script>

<template>
  <div class="bg-gray-100 p-4 sm:p-6 rounded-xl shadow-lg">
    <div
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Quản lý phiếu nhập kho</h1>
      </div>
      
      <div class="flex flex-wrap items-center gap-2">
        <Button text="Nhập hàng" color="purple" @click="openNewInventoryModal" />
        <Button text="Export" color="green" @click="exportExcel" />
        <div class="h-8 border-r-2 border-black-300 mx-2"></div>
        <InventoryFilterButtons v-model="selectedStatuses" />
      </div> 

    </div>

    
    <Input
      v-model="searchTerm"
      type="text"
      placeholder="Tìm kiếm theo mã phiếu, mã hoặc tên NCC..."
      class="mb-3"
    /> 


    <div
      class="hidden md:grid grid-cols-[1.5fr_2fr_1.5fr_1.2fr] items-center py-3 px-5 text-sm font-semibold text-gray-600 bg-gray-200 rounded-t-md"
    >
      <div class="px-3">Thời gian</div>
      <div class="px-5">Nhà cung cấp</div>
      <div class="px-5 text-right">Tổng giá trị phiếu nhập</div>
      <div class="px-5">Trạng thái</div>
    </div>

    <div class="bg-white rounded-b-md shadow-sm">
      <div v-if="isLoading" class="text-center py-6 text-gray-500">Đang tải dữ liệu...</div>
      <div v-else-if="isError" class="text-center py-6 text-red-500">
        Đã xảy ra lỗi: {{ error?.message || 'Không thể tải dữ liệu' }}
      </div>
      <div v-else-if="filteredItems.length === 0" class="text-center py-6 text-gray-500">
        Không có phiếu nhập nào để hiển thị.
      </div>
      <InventoryItem
        v-for="item in filteredItems"
        :key="item.id"
        :itemData="item"
        :is-open="item.id === expandedItemId"
        @toggle-detail="handleToggleDetail"
        @edit="openEditInventoryModal"
        @copy="handleCopyReceipt"
        @cancel-request="handleCancelRequest"
        @save-notes="handleSaveNotes"
      />
    </div>

    <Pagination
      :total-pages="totalPages"
      v-model:currentPage="currentPage"
      :loading="isLoading"
    />

    <DraggableModal
      v-if="showInventoryModal"
      :initial-position="{ x: 100, y: 50 }"
      :z-index="1000"
      width="70vw"
      @close="closeInventoryModal"
    >
      <template #header>
        <h3 class="text-lg font-semibold">
          {{ isEditMode ? 'Chỉnh sửa phiếu nhập' : 'Nhập hàng' }}
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
        <Button text="Lưu tạm" color="blue" @click="saveInventoryReceipt" />
        <Button text="Hoàn thành" color="green" @click="completeInventoryReceipt" />
      </template>
    </DraggableModal>

    <DraggableModal
      v-if="showProductModal"
      :initial-position="{ x: 150, y: 100 }"
      :z-index="1001"
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
        <Button text="Thêm sản phẩm" color="green" @click="saveNewProduct" />
      </template>
    </DraggableModal>
  </div>
</template>
