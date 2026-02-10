<template>
  <div class="p-4 sm:p-6 rounded-xl shadow-lg bg-white">
    <LoadingOverlay :show="showOverlay" :message="overlayMessage" />
    <div
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Quản lý nhà cung cấp</h1>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button text="Thêm nhà cung cấp" :icon="IconPlus" color="primary" @click="openAddEditModal()" />

        <label for="import-file-input" class="cursor-pointer">
          <Button text="Import" :icon="IconFileImport" color="secondary" as="span" />
          <input
            type="file"
            id="import-file-input"
            accept=".xlsx, .xls"
            class="hidden"
            @change="handleImport"
          />
        </label>

        <Button text="Export" :icon="IconFileExport" color="secondary" @click="handleExport" />

        <span class="text-gray-400 mx-4 hidden border-r-2 sm:block" />

        <SupplierFilterButtons v-model="selectedStatuses" />
      </div>
    </div>

    <Input
      v-model="rawSearch"
      type="text"
      placeholder="Tìm kiếm theo mã, tên, SĐT nhà cung cấp..."
      class="mb-3"
    />

    <!-- UNIFIED TABLE CONTAINER -->
    <div class="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <!-- Header -->
      <div
        class="hidden md:grid md:grid-cols-16 items-center gap-2 py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200"
      >
        <div class="md:col-span-8">Tên nhà cung cấp</div>
        <div class="md:col-start-9 md:col-span-2">Điện thoại</div>
        <div class="md:col-start-11 md:col-span-2">Email</div>
        <div class="md:col-start-13 md:col-span-2 md:justify-self-end">Tổng mua</div>
        <div class="md:col-start-15 md:col-span-2">Trạng thái</div>
      </div>

      <!-- Body -->
      <div class="bg-white">
        <div v-if="isLoading">
           <div v-for="i in 5" :key="i" class="grid md:grid-cols-16 gap-2 py-4 px-5 border-b border-gray-50 items-center last:border-0">
              <div class="md:col-span-8"><SkeletonLoader width="60%" height="16px" /></div>
              <div class="md:col-start-9 md:col-span-2"><SkeletonLoader width="80%" height="16px" /></div>
              <div class="md:col-start-11 md:col-span-2"><SkeletonLoader width="90%" height="16px" /></div>
              <div class="md:col-start-13 md:col-span-2 flex justify-end"><SkeletonLoader width="60%" height="16px" /></div>
              <div class="md:col-start-15 md:col-span-2"><SkeletonLoader width="70%" height="24px" class="rounded-full" /></div>
           </div>
        </div>
        
        <div v-else-if="isError" class="text-center py-12 text-red-500 font-medium">
          Đã xảy ra lỗi khi lấy dữ liệu nhà cung cấp
        </div>
        
        <div v-else-if="storeSuppliers.length === 0" class="text-center py-12 flex flex-col items-center justify-center space-y-3">
          <div class="bg-gray-50 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p class="text-gray-500 font-medium">Không có nhà cung cấp nào để hiển thị.</p>
        </div>
        
        <div v-else class="divide-y divide-gray-50">
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
      </div>
    </div>

    <Pagination
      :total-pages="totalPages"
      :currentPage="page"
      @update:currentPage="onPageChange"
      :loading="isLoading"
    />

    <DraggableModal
      :key="formModalKey"
      v-if="isFormModalVisible"
      @close="handleCloseFormModal"
      :onRefresh="handleFormRefresh"
    >
      <template #header>
        <h2 class="font-bold text-lg">{{ formModalTitle }}</h2>
      </template>
      <template #body>
        <SupplierForm v-model="editableSupplier" :errors="formErrors" />
      </template>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <Button text="Bỏ qua" color="gray" @click="handleCloseFormModal" />
          <Button text="Lưu" color="purple" @click="handleSaveSupplier" />
        </div>
      </template>
    </DraggableModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useSuppliersStore } from '@/stores/useSuppliersStore'
import * as XLSX from 'xlsx'
import SupplierItem from '@/components/supplier/SupplierItem.vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Pagination from '@/components/ui/button/Pagination.vue'
import SupplierFilterButtons from '@/components/supplier/SupplierFilterButtons.vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import SupplierForm from '@/components/supplier/SupplierForm.vue'
import Spinner from '@/components/ui/Spinner.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import { showConfirmation } from '@/composables/useConfirmationState'
import { useToast } from 'vue-toastification'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconFileImport from '@/components/icons/IconFileImport.vue'
import IconFileExport from '@/components/icons/IconFileExport.vue'

const suppliersStore = useSuppliersStore()
const toast = useToast()

// State
const page = ref(1)
const itemsPerPage = ref(10)
const rawSearch = ref('')
const selectedStatuses = ref(['all'])
const openStates = reactive({})
const showOverlay = ref(false)
const overlayMessage = ref('')

// Computed
const storeSuppliers = computed(() => suppliersStore.suppliers)
const isLoading = computed(() => suppliersStore.isLoading)
const isError = computed(() => !!suppliersStore.error)
const error = computed(() => suppliersStore.error)
const totalCount = computed(() => suppliersStore.totalCount)
const totalPages = computed(() => Math.ceil(totalCount.value / itemsPerPage.value))

// Helpers
const fetchData = async () => {
  try {
    await suppliersStore.fetchSuppliers({
      page: page.value,
      itemsPerPage: itemsPerPage.value,
      statusFilters: selectedStatuses.value,
      search: rawSearch.value
    })
  } catch (err) {
    console.error('Failed to fetch suppliers:', err)
  }
}

// Watchers
watch([page, selectedStatuses], () => {
  fetchData()
})

let searchTimeout
watch(rawSearch, () => {
  page.value = 1
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchData()
  }, 300)
})

// Lifecycle
onMounted(() => {
  fetchData()
})

// Handlers
const onPageChange = (newPage) => {
  page.value = newPage
}

const handleToggleDetail = (id) => {
  openStates[id] = !openStates[id]
}

const toggleActivation = async (supplier) => {
  const newStatus = supplier.status === 'active' ? 'inactive' : 'active'
  const actionName = newStatus === 'active' ? 'Kích hoạt' : 'Ngưng kích hoạt'
  
  const confirmed = await showConfirmation(
    `Xác nhận ${actionName}`,
    `Bạn có chắc chắn muốn ${actionName.toLowerCase()} nhà cung cấp ${supplier.name}?`
  )

  if (confirmed) {
    showOverlay.value = true
    overlayMessage.value = `Đang ${actionName.toLowerCase()}...`
    try {
      await suppliersStore.updateSupplierStatus({ id: supplier.id, status: newStatus })
      toast.success(`${actionName} thành công!`)
    } catch (error) {
      toast.error(`Lỗi: ${error}`)
    } finally {
      showOverlay.value = false
    }
  }
}

// Modal Logic
const isFormModalVisible = ref(false)
const formModalKey = ref(0)
const isEditMode = ref(false)
const formModalTitle = computed(() => isEditMode.value ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp mới')
const editableSupplier = ref({})
const formErrors = ref({})

const openAddEditModal = (supplier = null) => {
  isEditMode.value = !!supplier
  editableSupplier.value = supplier ? { ...supplier } : {}
  formErrors.value = {}
  isFormModalVisible.value = true
  formModalKey.value++
}

const handleCloseFormModal = () => {
  isFormModalVisible.value = false
}

const validateForm = () => {
  const errors = {}
  if (!editableSupplier.value.name) errors.name = 'Tên nhà cung cấp là bắt buộc'
  if (!editableSupplier.value.phone) errors.phone = 'Số điện thoại là bắt buộc'
  // Add more validation as needed
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleSaveSupplier = async () => {
  if (!validateForm()) return

  showOverlay.value = true
  overlayMessage.value = isEditMode.value ? 'Đang cập nhật...' : 'Đang tạo mới...'
  
  try {
    if (isEditMode.value) {
      await suppliersStore.updateSupplier({ 
        id: editableSupplier.value.id, 
        supplier: editableSupplier.value 
      })
      toast.success('Cập nhật thành công!')
    } else {
      await suppliersStore.addSupplier(editableSupplier.value)
      toast.success('Thêm mới thành công!')
    }
    handleCloseFormModal()
    fetchData()
  } catch (error) {
    toast.error(`Lỗi: ${error}`)
  } finally {
    showOverlay.value = false
  }
}

const openDeleteModal = async (supplier) => {
  const confirmed = await showConfirmation(
    'Xóa nhà cung cấp',
    `Bạn có chắc chắn muốn xóa nhà cung cấp ${supplier.name}?`
  )
  
  if (confirmed) {
    showOverlay.value = true
    overlayMessage.value = 'Đang xóa...'
    try {
      await suppliersStore.deleteSupplier(supplier.id)
      toast.success('Xóa thành công!')
      fetchData()
    } catch (error) {
      toast.error(`Lỗi: ${error}`)
    } finally {
      showOverlay.value = false
    }
  }
}

const handleFormRefresh = async () => {
  if (isEditMode.value && editableSupplier.value.id) {
      try {
        // Simulate fetching fresh data
        const freshData = await suppliersStore.refreshSupplier(editableSupplier.value.id)
        if (freshData) {
            editableSupplier.value = { ...freshData }
        }
        toast.info("Đã làm mới dữ liệu")
      } catch (e) {
        toast.error("Lỗi làm mới: " + e.message)
      }
  } else {
    // Reset form for create mode
    editableSupplier.value = {}
    formErrors.value = {}
    toast.info("Đã làm mới form")
  }
}

// Watch for errors
watch(isError, (hasError) => {
  if (hasError) {
    const errorMsg = error.value?.message || 'Lỗi tải dữ liệu nhà cung cấp'
    // Prevent duplicate toast spam if needed, relies on toast dedup usually
    toast.error(errorMsg)
  }
})

// Import/Export
const handleExport = () => {
  // Stub implementation
  toast.info('Chức năng xuất Excel đang phát triển')
}

const handleImport = (event) => {
  // Stub implementation
  toast.info('Chức năng nhập Excel đang phát triển')
}
</script>
