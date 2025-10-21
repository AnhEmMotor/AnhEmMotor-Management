<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import * as XLSX from 'xlsx'
import SupplierItem from '@/components/supplier/SupplierItem.vue'
import BaseButton from '@/components/ui/button/BaseButton.vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'
import BasePagination from '@/components/ui/button/BasePagination.vue'
import SupplierFilterButtons from '@/components/supplier/SupplierFilterButtons.vue'
import SupplierDeleteModal from '@/components/supplier/SupplierDeleteModal.vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import SupplierForm from '@/components/supplier/SupplierForm.vue'
import FullScreenModal from '@/components/ui/FullScreenModal.vue'

const store = useStore()

function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const storeSuppliers = computed(() => store.getters['suppliers/allSuppliers'] || [])
const isLoading = computed(() => store.state.suppliers?.isLoading || false)

const searchTerm = ref('')
const selectedStatuses = ref([])
const selectedSupplierId = ref(null)

const openStates = reactive({})

const isFormModalVisible = ref(false)
const isFormDirty = ref(false)
const editableSupplier = ref({})
const formModalTitle = ref('')
const formModalKey = ref(0)
const originalSupplierOnEdit = ref(null)
const isEditMode = computed(() => !!editableSupplier.value?.id)

const isConfirmationModalVisible = ref(false)
const confirmationModalProps = reactive({
  title: '',
  message: '',
  onConfirm: () => {},
})

const isDeleteModalVisible = ref(false)
const supplierToDelete = ref(null)

import { useToast } from 'vue-toastification'
const toast = useToast()

const formErrors = ref({ name: '', phone: '', email: '', address: '' })

const totalPages = ref(5)
const currentPage = ref(1)

watch(currentPage, () => {})

watch(
  storeSuppliers,
  (list) => {
    list.forEach((s) => {
      if (!(s.id in openStates)) openStates[s.id] = false
    })
  },
  { immediate: true },
)

const filteredItems = computed(() => {
  let items = (storeSuppliers.value || []).slice()
  if (selectedStatuses.value.length > 0) {
    items = items.filter((item) => selectedStatuses.value.includes(item.status))
  }
  if (searchTerm.value) {
    const lowerCaseSearchTerm = searchTerm.value.toLowerCase()
    items = items.filter(
      (item) =>
        String(item.id).toLowerCase().includes(lowerCaseSearchTerm) ||
        String(item.name || '')
          .toLowerCase()
          .includes(lowerCaseSearchTerm) ||
        String(item.phone || '')
          .toLowerCase()
          .includes(lowerCaseSearchTerm),
    )
  }
  return items.sort((a, b) => (b.creationDate || 0) - (a.creationDate || 0))
})

function showMessage(text, type = 'success', duration = 3000) {
  if (type === 'error') {
    toast.error(text, { timeout: duration })
  } else {
    toast.success(text, { timeout: duration })
  }
}

function showConfirmation(title, msg, onConfirmAction) {
  confirmationModalProps.title = title
  confirmationModalProps.message = msg
  confirmationModalProps.onConfirm = onConfirmAction
  isConfirmationModalVisible.value = true
}
function executeConfirmation() {
  confirmationModalProps.onConfirm()
  isConfirmationModalVisible.value = false
}

function openAddEditModal(supplier = null) {
  formErrors.value = { name: '', phone: '', email: '', address: '' }
  if (supplier) {
    originalSupplierOnEdit.value = JSON.parse(JSON.stringify(supplier))
    editableSupplier.value = JSON.parse(JSON.stringify(supplier))
    formModalTitle.value = 'Chỉnh sửa Nhà cung cấp'
  } else {
    originalSupplierOnEdit.value = null
    editableSupplier.value = {
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    }
    formModalTitle.value = 'Thêm Nhà cung cấp'
  }
  isFormDirty.value = false
  formModalKey.value++
  isFormModalVisible.value = true
}

function handleFormRefresh() {
  const doRefresh = () => {
    if (originalSupplierOnEdit.value) {
      editableSupplier.value = JSON.parse(JSON.stringify(originalSupplierOnEdit.value))
      isFormDirty.value = false
      showMessage('Đã tải lại dữ liệu gốc của nhà cung cấp.')
    }
  }

  if (isFormDirty.value) {
    showConfirmation(
      'Tải lại dữ liệu gốc?',
      'Bạn có các thay đổi chưa lưu. Bạn có chắc muốn tải lại dữ liệu gốc không?',
      doRefresh,
    )
  } else {
    doRefresh()
  }
}

function handleCloseFormModal() {
  if (isFormDirty.value) {
    showConfirmation(
      'Đóng biểu mẫu?',
      'Bạn có các thay đổi chưa lưu. Bạn có chắc muốn đóng không?',
      () => {
        isFormModalVisible.value = false
      },
    )
  } else {
    isFormModalVisible.value = false
  }
}

async function handleSaveSupplier() {
  const supplierData = editableSupplier.value

  formErrors.value = { name: '', phone: '', email: '', address: '' }
  let hasError = false
  if (!supplierData.name || !supplierData.name.toString().trim()) {
    formErrors.value.name = 'Vui lòng nhập tên nhà cung cấp.'
    hasError = true
  }
  if (!supplierData.address || !supplierData.address.toString().trim()) {
    formErrors.value.address = 'Vui lòng nhập địa chỉ.'
    hasError = true
  }

  if (!supplierData.phone && !supplierData.email) {
    formErrors.value.phone = 'Cần nhập ít nhất SĐT hoặc Email.'
    formErrors.value.email = 'Cần nhập ít nhất SĐT hoặc Email.'
    hasError = true
  }
  if (hasError) return

  try {
    if (supplierData.id) {
      await store.dispatch('suppliers/updateSupplier', {
        id: supplierData.id,
        supplier: supplierData,
      })
      showMessage(`Đã cập nhật nhà cung cấp: ${supplierData.name}.`)
    } else {
      await store.dispatch('suppliers/addSupplier', supplierData)
      showMessage(`Đã tạo nhà cung cấp mới: ${supplierData.name}.`)
    }
  } catch (err) {
    showMessage('Lỗi khi lưu nhà cung cấp.', 'error')
    console.error(err)
  } finally {
    isFormModalVisible.value = false
    isFormDirty.value = false

    await store.dispatch('suppliers/fetchSuppliers')
  }
}

function openDeleteModal(supplier) {
  supplierToDelete.value = supplier
  isDeleteModalVisible.value = true
}

async function handleDeleteSupplier() {
  if (!supplierToDelete.value) return
  try {
    await store.dispatch('suppliers/deleteSupplier', supplierToDelete.value.id)
    showMessage(`Đã xóa nhà cung cấp: ${supplierToDelete.value.name}.`)
    if (selectedSupplierId.value === supplierToDelete.value.id) selectedSupplierId.value = null
  } catch (err) {
    showMessage('Lỗi khi xóa nhà cung cấp.', 'error')
    console.error(err)
  } finally {
    isDeleteModalVisible.value = false
  }
}

function handleToggleDetail(supplierId) {
  const wasOpen = !!openStates[supplierId]

  Object.keys(openStates).forEach((k) => {
    openStates[k] = false
  })
  if (!wasOpen) openStates[supplierId] = true
}

function toggleActivation(supplierId) {
  const supplier = storeSuppliers.value.find((s) => s.id === supplierId)
  if (!supplier) return
  const actionText = supplier.status === 'active' ? 'ngừng hoạt động' : 'kích hoạt'
  const title = `Xác nhận ${actionText}`
  const messageText = `Bạn có chắc chắn muốn ${actionText} nhà cung cấp "${supplier.name}" không?`

  showConfirmation(title, messageText, async () => {
    try {
      const updated = { ...supplier, status: supplier.status === 'active' ? 'inactive' : 'active' }
      await store.dispatch('suppliers/updateSupplier', { id: supplier.id, supplier: updated })
      showMessage(
        `Đã ${updated.status === 'active' ? 'kích hoạt' : 'ngừng hoạt động'} nhà cung cấp ${supplier.name}.`,
      )
    } catch (err) {
      showMessage('Lỗi khi cập nhật trạng thái.', 'error')
      console.error(err)
    }
  })
}

const handleExport = () => {
  if (filteredItems.value.length === 0) {
    return
  }
  const exportData = filteredItems.value.map((s) => ({
    'Mã nhà cung cấp': s.id,
    'Tên nhà cung cấp': s.name,
    'Số điện thoại': s.phone || '',
    Email: s.email || '',
    'Tổng mua (VND)': s.totalPurchase,
    'Trạng thái': s.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động',
    'Địa chỉ': [s.address, s.ward, s.cityDistrict].filter(Boolean).join(', '),
    'Ghi chú': s.notes || '',
  }))
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'DanhSachNhaCungCap')
  const fileName = `Danh_sach_NCC_${formatDate(Date.now()).replace(/\//g, '-')}.xlsx`
  XLSX.writeFile(wb, fileName)
  showMessage(`Đã xuất ${exportData.length} nhà cung cấp ra file Excel.`)
}

const handleImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonArr = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      if (jsonArr.length < 2) {
        showMessage('File Excel không có dữ liệu.', 'error')
        return
      }
      const headers = jsonArr[0].map((h) => String(h).trim())
      const importedRows = jsonArr.slice(1)
      const created = []
      for (let i = 0; i < importedRows.length; i++) {
        const row = importedRows[i]
        const newSupplierData = {}
        headers.forEach((h, idx) => {
          if (h === 'Tên nhà cung cấp') newSupplierData.name = row[idx]
          if (h === 'Số điện thoại') newSupplierData.phone = row[idx]
          if (h === 'Email') newSupplierData.email = row[idx]
          if (h === 'Nhóm NCC') newSupplierData.group = row[idx]
          if (h === 'Địa chỉ') newSupplierData.address = row[idx]
          if (h === 'Ghi chú') newSupplierData.notes = row[idx]
        })
        if (!newSupplierData.name || !String(newSupplierData.name).trim()) continue
        try {
          await store.dispatch('suppliers/addSupplier', {
            ...newSupplierData,
            totalPurchase: 0,
            status: 'active',
            creator: 'Import User',
            creationDate: Date.now(),
            transactions: [],
          })
          created.push(newSupplierData)
        } catch (err) {
          console.error('Import row error', err)
        }
      }
      if (created.length > 0) {
        showMessage(`Đã nhập thành công ${created.length} nhà cung cấp.`)
        await store.dispatch('suppliers/fetchSuppliers')
      } else {
        showMessage('Không có nhà cung cấp nào hợp lệ trong file.', 'error')
      }
    } catch (error) {
      console.error('Lỗi import:', error)
      showMessage('Lỗi xử lý file Excel.', 'error')
    }
  }
  reader.readAsArrayBuffer(file)
  event.target.value = null
}

onMounted(async () => {
  await store.dispatch('suppliers/fetchSuppliers')
})
</script>

<template>
  <div class="box-style">
    <div class="content-box-style">
      <div>
        <h1 class="title-style">Quản lý nhà cung cấp</h1>
      </div>
      <div class="action-button-style">
        <BaseButton text="Thêm NCC" color="purple" @click="openAddEditModal()" />

        <label for="import-file-input" class="cursor-pointer">
          <BaseButton text="Import" color="blue" as="span" />
          <input
            type="file"
            id="import-file-input"
            accept=".xlsx, .xls"
            class="hidden"
            @change="handleImport"
          />
        </label>

        <BaseButton text="Export" color="green" @click="handleExport" />
        <div class="h-8 border-r-2 border-black-300 mx-2"></div>
        <SupplierFilterButtons v-model="selectedStatuses" />
      </div>
    </div>

    <BaseInput
      v-model="searchTerm"
      type="text"
      placeholder="Tìm kiếm theo mã, tên, SĐT nhà cung cấp..."
      class="mb-3"
    />

    <div
      class="hidden md:grid summary-row-grid items-center py-3 px-5 text-sm font-semibold text-gray-600 bg-gray-200 rounded-t-md"
    >
      <div>Tên nhà cung cấp</div>
      <div>Điện thoại</div>
      <div>Email</div>
      <div>Tổng mua</div>
      <div>Trạng thái</div>
    </div>

    <div class="bg-white rounded-b-md shadow-sm">
      <div v-if="filteredItems.length === 0" class="text-center py-6 text-gray-500">
        Không có nhà cung cấp nào để hiển thị.
      </div>
      <SupplierItem
        v-for="item in filteredItems"
        :key="item.id"
        :itemData="item"
        :is-open="openStates[item.id]"
        @toggle-detail="handleToggleDetail"
        @edit-supplier="openAddEditModal"
        @delete-supplier="openDeleteModal"
        @toggle-activation="toggleActivation"
      />
    </div>

    <BasePagination
      :total-pages="totalPages"
      v-model:currentPage="currentPage"
      :loading="isLoading"
    />

    <DraggableModal
      :key="formModalKey"
      v-if="isFormModalVisible"
      @close="handleCloseFormModal"
      :onRefresh="isEditMode ? handleFormRefresh : undefined"
    >
      <template #header>
        <h2 class="font-bold text-lg">{{ formModalTitle }}</h2>
      </template>
      <template #body>
        <SupplierForm
          v-model="editableSupplier"
          :errors="formErrors"
          @update:dirty="isFormDirty = $event"
        />
      </template>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <BaseButton text="Bỏ qua" color="gray" @click="handleCloseFormModal" />
          <BaseButton text="Lưu" color="purple" @click="handleSaveSupplier" />
        </div>
      </template>
    </DraggableModal>

    <SupplierDeleteModal
      v-if="isDeleteModalVisible"
      :is-open="isDeleteModalVisible"
      :supplier="supplierToDelete"
      @close="isDeleteModalVisible = false"
      @confirm="handleDeleteSupplier"
    />

    <FullScreenModal
      v-if="isConfirmationModalVisible"
      :show="isConfirmationModalVisible"
      :title="confirmationModalProps.title"
      @close="isConfirmationModalVisible = false"
    >
      <p class="text-gray-600 text-center">{{ confirmationModalProps.message }}</p>
      <template #actions>
        <BaseButton text="Bỏ qua" color="gray" @click="isConfirmationModalVisible = false" />
        <BaseButton text="Xác nhận" color="red" @click="executeConfirmation" />
      </template>
    </FullScreenModal>
  </div>
</template>

<style lang="css" scoped>
@reference "../assets/main.css";

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
  /* Use a 16-column layout so individual header items can span multiple cols */
  display: grid;
  grid-template-columns: repeat(16, minmax(0, 1fr));
  gap: 0.5rem;
  align-items: center;
}

/* Assign header column spans to match: 8 / 2 / 2 / 2 / 2 (total 16)
   - Tên nhà cung cấp: 8 cols
   - Điện thoại: 2 cols
   - Email: 2 cols
   - Tổng mua: 2 cols
   - Trạng thái: 2 cols
*/
.summary-row-grid > :nth-child(1) {
  grid-column: 1 / span 8; /* Tên nhà cung cấp */
}
.summary-row-grid > :nth-child(2) {
  grid-column: 9 / span 2; /* Điện thoại */
}
.summary-row-grid > :nth-child(3) {
  grid-column: 11 / span 2; /* Email */
}
.summary-row-grid > :nth-child(4) {
  grid-column: 13 / span 2; /* Tổng mua */
  justify-self: end;
}
.summary-row-grid > :nth-child(5) {
  grid-column: 15 / span 2; /* Trạng thái */
}
</style>
