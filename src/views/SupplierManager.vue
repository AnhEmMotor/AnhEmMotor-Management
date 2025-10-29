<script setup>
import { ref, reactive, computed, watch, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import * as XLSX from 'xlsx'
import SupplierItem from '@/components/supplier/SupplierItem.vue'
import BaseButton from '@/components/ui/button/BaseButton.vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'
import BasePagination from '@/components/ui/button/BasePagination.vue'
import SupplierFilterButtons from '@/components/supplier/SupplierFilterButtons.vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import SupplierForm from '@/components/supplier/SupplierForm.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import BaseLoadingOverlay from '@/components/ui/BaseLoadingOverlay.vue'
import { showConfirmation } from '@/composables/useConfirmationState'
import { formatDate } from '@/composables/useDate'
import { useToast } from 'vue-toastification'
import { useRoute, useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import { getSupplierById } from '@/api/supplier'
import { debounce } from '@/utils/debounceThrottle'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'

const store = useStore()
const route = useRoute()
const toast = useToast()
const router = useRouter()
const queryClient = useQueryClient()

const page = computed(() => parseInt(route.query.page) || 1)
const searchTerm = ref(route.query.search ? String(route.query.search) : '')
const rawSearch = ref(searchTerm.value)
const selectedStatuses = ref(
  route.query.statuses ? String(route.query.statuses).split(',').filter(Boolean) : [],
)
const selectedSupplierId = ref(null)
const openStates = reactive({})
const isFormModalVisible = ref(false)
const editableSupplier = ref({})
const formModalTitle = ref('')
const formModalKey = ref(0)
const originalSupplierOnEdit = ref(null)
const isEditMode = computed(() => !!editableSupplier.value?.id)
const itemsPerPage = ref(20)
const formErrors = ref({ name: '', phone: '', email: '', address: '' })
const showOverlay = ref(false)
const overlayMessage = ref('Đang xử lý, vui lòng chờ...')

function showMessage(text, type = 'success', duration = 3000) {
  if (type === 'error') {
    toast.error(text, { timeout: duration })
  } else {
    toast.success(text, { timeout: duration })
  }
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
  formModalKey.value++
  isFormModalVisible.value = true
}

const handleFormRefresh = async () => {
  if (!originalSupplierOnEdit.value) return
  const id = originalSupplierOnEdit.value.id
  if (!id) return
  try {
    showOverlay.value = true
    overlayMessage.value = 'Đang tải lại dữ liệu nhà cung cấp...'
    const fresh = await getSupplierById(id)
    if (!fresh) {
      showMessage('Không tìm thấy nhà cung cấp trên server.', 'error')
      showOverlay.value = false
      return
    }
    originalSupplierOnEdit.value = JSON.parse(JSON.stringify(fresh))
    editableSupplier.value = JSON.parse(JSON.stringify(fresh))
    showMessage('Đã tải lại dữ liệu gốc của nhà cung cấp.')
    await queryClient.invalidateQueries({ queryKey: ['suppliers'] })
  } catch (err) {
    console.error('Lỗi khi tải lại nhà cung cấp:', err)
    showMessage('Lỗi khi tải lại dữ liệu nhà cung cấp.', 'error')
  } finally {
    showOverlay.value = false
  }
}

async function handleSaveSupplier() {
  showOverlay.value = true
  const supplierData = editableSupplier.value
  overlayMessage.value = supplierData.id
    ? 'Đang cập nhật nhà cung cấp...'
    : 'Đang tạo nhà cung cấp mới...'

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
  if (hasError) {
    showOverlay.value = false
    return
  }

  try {
    if (supplierData.id) {
      await store.dispatch('suppliers/updateSupplier', {
        id: supplierData.id,
        supplier: supplierData,
      })
      showMessage(`Đã cập nhật nhà cung cấp: ${supplierData.name}.`)
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    } else {
      await store.dispatch('suppliers/addSupplier', supplierData)
      showMessage(`Đã tạo nhà cung cấp mới: ${supplierData.name}.`)
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    }
  } catch (err) {
    showMessage('Lỗi khi lưu nhà cung cấp.', 'error')
    console.error(err)
  } finally {
    isFormModalVisible.value = false
    showOverlay.value = false
  }
}

const filters = computed(() => ({
  statusFilters: selectedStatuses.value,
  search: searchTerm.value,
}))

const fetchSuppliersFn = (params) => {
  return store.dispatch('suppliers/fetchSuppliers', {
    page: params.page,
    itemsPerPage: params.itemsPerPage,
    statusFilters: params.statusFilters,
    search: params.search,
  })
}

const supplierDataMapper = (data) => ({
  items: data?.suppliers || [],
  count: data?.count,
})

const {
  data: suppliersData,
  isLoading,
  isError,
  error,
  items: storeSuppliers,
  totalPages,
} = usePaginatedQuery({
  queryKeyBase: ref('suppliers'),
  filters: filters,
  page: page,
  itemsPerPage: itemsPerPage,
  fetchFn: fetchSuppliersFn,
  dataMapper: supplierDataMapper,
})

const applyQueryFromRaw = async () => {
  const qs = { ...route.query }
  if (rawSearch.value && String(rawSearch.value).trim()) qs.search = String(rawSearch.value).trim()
  else delete qs.search
  if (Array.isArray(selectedStatuses.value) && selectedStatuses.value.length > 0)
    qs.statuses = selectedStatuses.value.join(',')
  else delete qs.statuses
  qs.page = 1
  await router.replace({ query: qs })
  if (typeof window !== 'undefined' && window.scrollTo) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const debouncedApplyQuery = debounce(applyQueryFromRaw, 400)

watch(rawSearch, () => {
  debouncedApplyQuery()
})

watch(selectedStatuses, () => {
  if (debouncedApplyQuery.cancel) debouncedApplyQuery.cancel()
  applyQueryFromRaw()
})

onUnmounted(() => {
  if (debouncedApplyQuery && debouncedApplyQuery.cancel) debouncedApplyQuery.cancel()
})

function handleCloseFormModal() {
  isFormModalVisible.value = false
}

async function openDeleteModal(supplier) {
  if (!supplier) return
  const title = 'Xác nhận xóa'
  const message = `Bạn có chắc chắn muốn xóa nhà cung cấp "${supplier.name}"? Hành động này không thể hoàn tác.`
  const confirmed = await showConfirmation(title, message)
  if (!confirmed) return

  try {
    showOverlay.value = true
    overlayMessage.value = 'Đang xóa nhà cung cấp...'
    await store.dispatch('suppliers/deleteSupplier', supplier.id)
    showMessage(`Đã xóa nhà cung cấp: ${supplier.name}.`)
    if (selectedSupplierId.value === supplier.id) selectedSupplierId.value = null
    await queryClient.invalidateQueries({ queryKey: ['suppliers'] })
  } catch (err) {
    showMessage('Lỗi khi xóa nhà cung cấp.', 'error')
    console.error(err)
  } finally {
    showOverlay.value = false
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

  showConfirmation(title, messageText).then(async (confirmed) => {
    if (!confirmed) return
    try {
      await store.dispatch('suppliers/updateSupplierStatus', {
        id: supplier.id,
        status: supplier.status === 'active' ? 'inactive' : 'active',
      })
      showMessage(
        `Đã ${supplier.status === 'active' ? 'kích hoạt' : 'ngừng hoạt động'} nhà cung cấp ${supplier.name}.`,
      )
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    } catch (err) {
      showMessage('Lỗi khi cập nhật trạng thái.', 'error')
      console.error(err)
    }
  })
}

const handleExport = () => {
  if (storeSuppliers.value.length === 0) {
    return
  }
  const exportData = storeSuppliers.value.map((s) => ({
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
        await queryClient.invalidateQueries({ queryKey: ['suppliers'] })
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

async function onPageChange(newPage) {
  if (newPage !== page.value) {
    await router.replace({ query: { ...route.query, page: newPage } })
    if (typeof window !== 'undefined' && window.scrollTo) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

watch([searchTerm, selectedStatuses], ([newSearch, newStatuses]) => {
  const qs = { ...route.query }
  if (newSearch && String(newSearch).trim()) qs.search = String(newSearch).trim()
  else delete qs.search
  if (Array.isArray(newStatuses) && newStatuses.length > 0) qs.statuses = newStatuses.join(',')
  else delete qs.statuses
  qs.page = 1
  router.replace({ query: qs })
})

watch(
  () => route.query,
  (newQuery) => {
    const qSearch = newQuery.search === undefined ? '' : String(newQuery.search || '')
    if (qSearch !== searchTerm.value) {
      searchTerm.value = qSearch
      rawSearch.value = qSearch
    }
    const qs = String(newQuery.statuses || '')
    const vals = qs
      ? qs
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
    if (JSON.stringify(vals) !== JSON.stringify(selectedStatuses.value)) {
      selectedStatuses.value = vals
    }
  },
)

watch(
  [() => page.value, totalPages],
  ([currentPage, total]) => {
    const tp = Number(total) || 1
    const cp = Number(currentPage) || 1
    if (suppliersData.value && suppliersData.value.count != null) {
      if (tp > 0 && cp > tp) {
        router.replace({ query: { ...route.query, page: 1 } })
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="bg-gray-100 p-4 sm:p-6 rounded-xl shadow-lg">
    <BaseLoadingOverlay :show="showOverlay" :message="overlayMessage" />
    <div
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Quản lý nhà cung cấp</h1>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <BaseButton text="Thêm nhà cung cấp" color="purple" @click="openAddEditModal()" />

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
      v-model="rawSearch"
      type="text"
      placeholder="Tìm kiếm theo mã, tên, SĐT nhà cung cấp..."
      class="mb-3"
    />

    <div
      class="hidden md:grid md:grid-cols-16 items-center gap-2 py-3 px-5 text-sm font-semibold text-gray-600 bg-gray-200 rounded-t-md"
    >
      <div class="md:col-span-8">Tên nhà cung cấp</div>
      <div class="md:col-start-9 md:col-span-2">Điện thoại</div>
      <div class="md:col-start-11 md:col-span-2">Email</div>
      <div class="md:col-start-13 md:col-span-2 md:justify-self-end">Tổng mua</div>
      <div class="md:col-start-15 md:col-span-2">Trạng thái</div>
    </div>

    <div class="bg-white rounded-b-md shadow-sm">
      <div v-if="isLoading">
        <BaseSpinner />
      </div>
      <div v-else-if="isError">
        <p class="not-found-msg">Could not fetch suppliers. Please try again later. {{ error }}</p>
      </div>
      <div v-else-if="storeSuppliers.length === 0" class="text-center py-6 text-gray-500">
        Không có nhà cung cấp nào để hiển thị.
      </div>
      <SupplierItem
        v-for="item in storeSuppliers"
        :key="item.id"
        :itemData="item"
        :is-open="openStates[item.id]"
        @toggle-detail="handleToggleDetail"
        @edit-supplier="openAddEditModal"
        @delete-supplier="openDeleteModal"
        @toggle-activation="toggleActivation"
      />
    </div>

    <div>
      <BasePagination
        v-if="totalPages !== null"
        :total-pages="totalPages"
        :currentPage="page"
        @update:currentPage="onPageChange"
        :loading="isLoading"
      />
      <div v-else class="flex justify-center py-4 text-sm text-gray-500">Đang tải...</div>
    </div>

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
        <SupplierForm v-model="editableSupplier" :errors="formErrors" />
      </template>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <BaseButton text="Bỏ qua" color="gray" @click="handleCloseFormModal" />
          <BaseButton text="Lưu" color="purple" @click="handleSaveSupplier" />
        </div>
      </template>
    </DraggableModal>
  </div>
</template>
