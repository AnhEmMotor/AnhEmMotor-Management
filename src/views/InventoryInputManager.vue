<script setup>
import { ref, computed, watch } from 'vue'
import * as XLSX from 'xlsx'
import InventoryItem from '@/components/inventory_input/InventoryItem.vue'
import BaseButton from '@/components/ui/button/BaseButton.vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'
import BasePagination from '@/components/ui/button/BasePagination.vue'
import InventoryFilterButtons from '@/components/inventory_input/InventoryFilterButtons.vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import InventoryInputForm from '@/components/inventory_input/InventoryInputForm.vue'
import ProductForm from '@/components/product/ProductForm.vue'
import { showConfirmation } from '@/composables/useConfirmationState'

// Local products catalog shared with the inventory input form
const productsCatalog = ref([
  { code: '1233289314912', name: 'Siro đào VINASYRUP 750ml', price: 34800, stock: 5 },
  { code: 'SP000001', name: 'VISION', price: 30000000, stock: 10 },
  { code: 'SP000002', name: 'VARIO', price: 35000000, stock: 5 },
  { code: 'SP001001', name: 'SH Mode 2024', price: 65000000, stock: 8 },
])

const searchTerm = ref('')
const selectedStatuses = ref([])
const expandedItemId = ref(null)

// Mock data
const allInventoryItems = ref([
  {
    id: 'PN000001',
    time: '10/10/2025 10:20',
    supplierCode: 'NCC00001',
    supplierName: 'NCC ĐỒNG NAI',
    payable: 3500000000,
    status: 'Đã nhập hàng',
    branch: 'Chi nhánh trung tâm',
    creator: 'Kim Ngân',
    importer: 'Kim Ngân',
    importDate: '2025-10-10',
    products: [
      {
        code: 'SP000002',
        name: 'VARIO',
        quantity: 100,
        unitPrice: 35000000,
        discount: 0,
        importPrice: 35000000,
        total: 3500000000,
      },
    ],
    notes: '',
    paid: 3500000000,
  },
  {
    id: 'PN000002',
    time: '10/10/2025 09:30',
    supplierCode: 'NCC00002',
    supplierName: 'NCC PHÚ THỌ',
    payable: 3440700000,
    status: 'Phiếu tạm',
    branch: 'Chi nhánh TP.HCM',
    creator: 'Trần Văn A',
    importer: 'Lê Thị B',
    importDate: '2025-10-10',
    products: [
      {
        code: 'SP001001',
        name: 'SH Mode 2024',
        quantity: 30,
        unitPrice: 65000000,
        discount: 300000,
        importPrice: 64700000,
        total: 1941000000,
      },
      {
        code: 'SP001002',
        name: 'Vision 2023',
        quantity: 50,
        unitPrice: 30000000,
        discount: 0,
        importPrice: 30000000,
        total: 1500000000,
      },
    ],
    notes: 'Nhập hàng đầu tháng, số lượng lớn.',
    paid: 1200000000,
  },
  {
    id: 'PN000003',
    time: '09/10/2025 15:00',
    supplierCode: 'NCC00003',
    supplierName: 'NCC QUẢNG NAM',
    payable: 0,
    status: 'Đã hủy',
    branch: 'Chi nhánh Đà Nẵng',
    creator: 'Nguyễn Văn C',
    importer: 'Đã hủy',
    importDate: '2025-10-09',
    products: [
      {
        code: 'SP002001',
        name: 'Sirius 2024',
        quantity: 40,
        unitPrice: 12500000,
        discount: 0,
        importPrice: 12500000,
        total: 500000000,
      },
    ],
    notes: 'Đã hủy do lỗi đặt hàng sai mẫu mã.',
    paid: 0,
  },
])

const filteredItems = computed(() => {
  let items = allInventoryItems.value

  // Filter by status
  if (selectedStatuses.value.length > 0) {
    items = items.filter((item) => selectedStatuses.value.includes(item.status))
  }

  // Filter by search term
  if (searchTerm.value) {
    const lowerCaseSearchTerm = searchTerm.value.toLowerCase()
    items = items.filter(
      (item) =>
        item.id.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.supplierName.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.supplierCode.toLowerCase().includes(lowerCaseSearchTerm),
    )
  }

  return items
})

function handleToggleDetail(itemId) {
  expandedItemId.value = expandedItemId.value === itemId ? null : itemId
}

const totalPages = ref(5)
const currentPage = ref(1)
const isLoading = ref(false)

watch(currentPage, () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})

// Excel export
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

// Modal states
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

// Mở modal nhập hàng mới
const openNewInventoryModal = () => {
  isEditMode.value = false
  currentInventoryData.value = {
    supplier: null,
    products: [],
    notes: '',
  }
  showInventoryModal.value = true
}

// Mở modal chỉnh sửa phiếu nhập
const openEditInventoryModal = (item) => {
  isEditMode.value = true
  // Chuyển đổi dữ liệu phiếu nhập sang format của form
  currentInventoryData.value = {
    id: item.id,
    supplier: {
      code: item.supplierCode,
      name: item.supplierName,
      phone: '0123456789', // Mock data, nên lấy từ API
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
  }
  showInventoryModal.value = true
}

// Đóng modal nhập hàng
const closeInventoryModal = () => {
  showInventoryModal.value = false
}

// Mở modal thêm sản phẩm mới
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

// Đóng modal sản phẩm
const closeProductModal = () => {
  showProductModal.value = false
}

// Clear inline errors when user modifies the current inventory data
watch(
  () => currentInventoryData.value,
  () => {
    inventoryErrors.value = { supplier: '', products: {} }
  },
  { deep: true },
)

// Lưu phiếu nhập
// Validation helper
function validateInventory(data) {
  const errors = { supplier: '', products: {} }
  if (!data.supplier) {
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

// Lưu phiếu nhập
const saveInventoryReceipt = () => {
  // Validate inventory data
  const errors = validateInventory(currentInventoryData.value)
  if (Object.keys(errors.products).length > 0 || errors.supplier) {
    inventoryErrors.value = errors
    // keep modal open and show inline errors
    return
  }
  // clear errors
  inventoryErrors.value = { supplier: '', products: {} }

  // Compute totals
  const computedProducts = currentInventoryData.value.products.map((p) => ({
    code: p.code,
    name: p.name,
    quantity: Number(p.quantity) || 0,
    unitPrice: Number(p.unitPrice) || 0,
    discount: p.discount || 0,
    importPrice: p.importPrice || p.unitPrice || 0,
    total: Number(p.total) || (Number(p.quantity) || 0) * (Number(p.unitPrice) || 0),
  }))

  const payable = computedProducts.reduce((s, p) => s + (p.total || 0), 0)

  if (isEditMode.value) {
    // Find existing receipt by matching supplier + date or by id if provided in model
    // We expect that when editing, the parent passed the original id as currentInventoryData.id
    const existingId = currentInventoryData.value.id
    if (existingId) {
      const idx = allInventoryItems.value.findIndex((it) => it.id === existingId)
      if (idx !== -1) {
        allInventoryItems.value[idx] = {
          ...allInventoryItems.value[idx],
          supplierCode: currentInventoryData.value.supplier.code,
          supplierName: currentInventoryData.value.supplier.name,
          products: computedProducts,
          payable,
          notes: currentInventoryData.value.notes || '',
          status: 'Phiếu tạm',
        }
        alert('Đã lưu thay đổi phiếu nhập!')
        closeInventoryModal()
        return
      }
    }
    // If no id or not found, fallthrough to create new
  }

  // Create new receipt
  const newIdNumber = allInventoryItems.value.length + 1
  const newId = `PN${String(newIdNumber).padStart(6, '0')}`
  const now = new Date()
  const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(
    2,
    '0',
  )}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes(),
  ).padStart(2, '0')}`

  const newReceipt = {
    id: newId,
    time: timeStr,
    supplierCode: currentInventoryData.value.supplier.code,
    supplierName: currentInventoryData.value.supplier.name,
    payable,
    status: 'Phiếu tạm',
    branch: 'Chi nhánh trung tâm',
    creator: 'Người dùng',
    importer: 'Người dùng',
    importDate: now.toISOString().split('T')[0],
    products: computedProducts,
    notes: currentInventoryData.value.notes || '',
    paid: 0,
  }

  allInventoryItems.value.unshift(newReceipt)
  alert('Đã lưu phiếu nhập thành công!')
  closeInventoryModal()
}

// Hoàn thành phiếu nhập
const completeInventoryReceipt = () => {
  const errors = validateInventory(currentInventoryData.value)
  if (Object.keys(errors.products).length > 0 || errors.supplier) {
    inventoryErrors.value = errors
    return
  }
  inventoryErrors.value = { supplier: '', products: {} }

  // Compute totals similarly to save
  const computedProducts = currentInventoryData.value.products.map((p) => ({
    code: p.code,
    name: p.name,
    quantity: Number(p.quantity) || 0,
    unitPrice: Number(p.unitPrice) || 0,
    discount: p.discount || 0,
    importPrice: p.importPrice || p.unitPrice || 0,
    total: Number(p.total) || (Number(p.quantity) || 0) * (Number(p.unitPrice) || 0),
  }))

  const payable = computedProducts.reduce((s, p) => s + (p.total || 0), 0)

  if (isEditMode.value) {
    const existingId = currentInventoryData.value.id
    if (existingId) {
      const idx = allInventoryItems.value.findIndex((it) => it.id === existingId)
      if (idx !== -1) {
        const now = new Date()
        allInventoryItems.value[idx] = {
          ...allInventoryItems.value[idx],
          supplierCode: currentInventoryData.value.supplier.code,
          supplierName: currentInventoryData.value.supplier.name,
          products: computedProducts,
          payable,
          paid: payable,
          status: 'Đã nhập hàng',
          importer: 'Người dùng',
          importDate: now.toISOString().split('T')[0],
          time: `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(
            2,
            '0',
          )}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(
            now.getMinutes(),
          ).padStart(2, '0')}`,
        }
        alert('Đã hoàn thành phiếu nhập!')
        closeInventoryModal()
        return
      }
    }
    // If editing but id not found, fallthrough to create new completed receipt
  }

  // Create new completed receipt
  const newIdNumber = allInventoryItems.value.length + 1
  const newId = `PN${String(newIdNumber).padStart(6, '0')}`
  const now = new Date()
  const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(
    2,
    '0',
  )}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes(),
  ).padStart(2, '0')}`

  const newReceipt = {
    id: newId,
    time: timeStr,
    supplierCode: currentInventoryData.value.supplier.code,
    supplierName: currentInventoryData.value.supplier.name,
    payable,
    status: 'Đã nhập hàng',
    branch: 'Chi nhánh trung tâm',
    creator: 'Người dùng',
    importer: 'Người dùng',
    importDate: now.toISOString().split('T')[0],
    products: computedProducts,
    notes: currentInventoryData.value.notes || '',
    paid: payable,
  }

  allInventoryItems.value.unshift(newReceipt)
  alert('Đã hoàn thành phiếu nhập!')
  closeInventoryModal()
}

// Lưu sản phẩm mới từ modal sản phẩm
const saveNewProduct = () => {
  if (!currentProductData.value.code || !currentProductData.value.name) {
    alert('Vui lòng nhập mã và tên sản phẩm')
    return
  }

  // Thêm sản phẩm mới vào danh sách
  const newProduct = {
    id: Date.now(),
    code: currentProductData.value.code,
    name: currentProductData.value.name,
    quantity: currentProductData.value.quantity || 1,
    unitPrice: currentProductData.value.unitPrice || 0,
    total: (currentProductData.value.quantity || 1) * (currentProductData.value.unitPrice || 0),
  }

  currentInventoryData.value.products.push(newProduct)
  // Add to product catalog so it will be searchable in InventoryInputForm
  productsCatalog.value.push({
    code: currentProductData.value.code,
    name: currentProductData.value.name,
    price: currentProductData.value.unitPrice || currentProductData.value.price || 0,
    stock: 0,
  })

  closeProductModal()
}

// Handlers for copy / cancel requests from list items
const handleCopyReceipt = (item) => {
  // Create a deep copy and open modal in new (temporary) mode
  const copyData = JSON.parse(JSON.stringify(item))
  // Reset id so save creates a new one, set status to temporary and clear paid
  delete copyData.id
  copyData.status = 'Phiếu tạm'
  copyData.paid = 0
  // Map to form shape
  currentInventoryData.value = {
    supplier: {
      code: copyData.supplierCode,
      name: copyData.supplierName,
      phone: '0123456789',
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
  const title = 'Xác nhận huỷ phi'
  const message = `Bạn có chắc muốn huỷ phiếu ${item.id}? Hành động này không thể hoàn tác.`
  const confirmed = await showConfirmation(title, message)
  if (!confirmed) return
  confirmCancel(item)
}

const confirmCancel = (item) => {
  const idx = allInventoryItems.value.findIndex((it) => it.id === item.id)
  if (idx !== -1) {
    allInventoryItems.value[idx] = {
      ...allInventoryItems.value[idx],
      status: 'Đã hủy',
    }
  }
}

// Save notes handler from detail component
const handleSaveNotes = ({ id, notes }) => {
  const idx = allInventoryItems.value.findIndex((it) => it.id === id)
  if (idx !== -1) {
    allInventoryItems.value[idx] = {
      ...allInventoryItems.value[idx],
      notes: notes || '',
    }
    alert('Ghi chú đã được lưu')
  }
}
</script>

<template>
  <div class="box-style">
    <div class="content-box-style">
      <div>
        <h1 class="title-style">Quản lý phiếu nhập kho</h1>
      </div>
      <div class="action-button-style">
        <BaseButton text="Nhập hàng" color="purple" @click="openNewInventoryModal" />
        <BaseButton text="Export" color="green" @click="exportExcel" />
        <div class="h-8 border-r-2 border-black-300 mx-2"></div>
        <InventoryFilterButtons v-model="selectedStatuses" />
      </div>
    </div>

    <BaseInput
      v-model="searchTerm"
      type="text"
      placeholder="Tìm kiếm theo mã phiếu, mã hoặc tên NCC..."
      class="mb-3"
    />

    <!-- Table Header -->
    <div
      class="hidden md:grid summary-row-grid items-center py-3 px-5 text-sm font-semibold text-gray-600 bg-gray-200 rounded-t-md"
    >
      <div class="px-3">Mã nhập hàng</div>
      <div class="px-3">Thời gian</div>
      <div class="px-4">Mã NCC</div>
      <div class="px-5">Nhà cung cấp</div>
      <div class="px-5 text-right">Cần trả NCC</div>
      <div class="px-5">Trạng thái</div>
    </div>

    <!-- Inventory List -->
    <div class="bg-white rounded-b-md shadow-sm">
      <div v-if="filteredItems.length === 0" class="text-center py-6 text-gray-500">
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

    <BasePagination
      :total-pages="totalPages"
      v-model:currentPage="currentPage"
      :loading="isLoading"
    />

    <!-- Modal Nhập hàng -->
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
          :productList="productsCatalog"
          @add-product="openProductModal"
        />
      </template>

      <template #footer>
        <BaseButton text="Hủy" color="gray" @click="closeInventoryModal" />
        <BaseButton text="Lưu tạm" color="blue" @click="saveInventoryReceipt" />
        <BaseButton text="Hoàn thành" color="green" @click="completeInventoryReceipt" />
      </template>
    </DraggableModal>

    <!-- Modal Thêm sản phẩm mới -->
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

        <!-- TODO: Thêm trường số lượng và đơn giá nhập trong phiếu nhập hàng của đơn hàng -->
        <div class="grid grid-cols-2 gap-4 mt-4 px-2">
          <!-- <BaseInput
            v-model.number="currentProductData.quantity"
            label="Số lượng *"
            type="number"
            min="1"
            placeholder="Nhập số lượng"
          />
          <BaseInput
            v-model.number="currentProductData.unitPrice"
            label="Đơn giá nhập *"
            type="number"
            min="0"
            placeholder="Nhập đơn giá"
          /> -->
        </div>
      </template>

      <template #footer>
        <BaseButton text="Hủy" color="gray" @click="closeProductModal" />
        <BaseButton text="Thêm sản phẩm" color="green" @click="saveNewProduct" />
      </template>
    </DraggableModal>

    <!-- global confirmation modal is mounted in App.vue and used via showConfirmation() -->
  </div>
</template>

<style lang="css" scoped>
@reference '../assets/main.css';

.box-style {
  @apply bg-gray-100 p-4 sm:p-6 rounded-xl shadow-lg;
}
.title-style {
  @apply text-3xl font-bold text-gray-800;
}
.content-box-style {
  @apply flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0;
}
.action-button-style {
  @apply flex flex-wrap items-center gap-2;
}
.summary-row-grid {
  grid-template-columns: 1fr 1.5fr 1fr 2fr 1.5fr 1.2fr;
}
</style>
