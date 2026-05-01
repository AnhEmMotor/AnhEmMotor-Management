<script setup>
import { computed, watch, ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useSupplierStore } from '@/stores/supplier.store'
import { useToast } from 'vue-toastification'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { Permissions } from '@/constants/permissions'
import { usePermission } from '@/composables/usePermission'
import { normalizeBackendErrors } from '@/utils/error-helper'

import SupplierItem from '@/components/supplier/SupplierItem.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import Input from '@/components/ui/input/BaseInput.vue'
import Pagination from '@/components/ui/button/BasePagination.vue'
import SupplierFilterButtons from '@/components/supplier/SupplierFilterButtons.vue'
import SupplierFormModal from '@/components/supplier/SupplierFormModal.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import { showConfirmation } from '@/composables/useConfirmationState'
import IconPlus from '@/assets/icons/IconPlus.svg'
import IconFileImport from '@/assets/icons/IconFileImport.svg'
import IconFileExport from '@/assets/icons/IconFileExport.svg'
import IconEmptyBox from '@/assets/icons/empty-box.svg'

const toast = useToast()
const { hasPermission } = usePermission()
const queryClient = useQueryClient()
const supplierStore = useSupplierStore()

const isFormModalVisible = ref(false)
const isEditMode = ref(false)
const editableSupplier = ref({})
const formErrors = ref({})

const {
  data: suppliers,
  isLoading,
  isError,
  pagination,
  searchRefs,
  filterRefs,
} = usePaginatedQuery({
  queryKey: ['suppliers'],
  queryFn: (query) => supplierStore.fetchSuppliers(query),
  itemsPerPage: 10,
  searchFields: [{ key: 'search', debounce: 400 }],
  filterFields: [{ key: 'status' }],
})

const selectedStatuses = computed({
  get: () => {
    const val = filterRefs.status
    if (!val) return []
    return Array.isArray(val) ? val : [val]
  },
  set: (val) => {
    filterRefs.status = val.length > 0 ? val[0] : ''
  },
})

const openStates = ref({})
const isSaving = ref(false)
const overlayMessage = ref('')

const handleToggleDetail = (id) => {
  openStates.value = { ...openStates.value, [id]: !openStates.value[id] }
}

const toggleActivation = async (supplier) => {
  const newStatus = supplier.statusId === 'active' ? 'inactive' : 'active'
  const actionName = newStatus === 'active' ? 'Kích hoạt' : 'Ngưng kích hoạt'

  const confirmed = await showConfirmation(
    `Xác nhận ${actionName}`,
    `Bạn có chắc chắn muốn ${actionName.toLowerCase()} nhà cung cấp ${supplier.name}?`,
  )

  if (confirmed) {
    isSaving.value = true
    overlayMessage.value = `Đang ${actionName.toLowerCase()}...`
    try {
      const result = await supplierStore.toggleSupplierStatus(supplier.id, supplier.statusId)
      if (result) {
        queryClient.setQueryData(['suppliers', result.id], result)
        await queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        toast.success(`${actionName} thành công!`)
      }
    } catch (err) {
      toast.error(`Lỗi: ${err.message || err}`)
    } finally {
      isSaving.value = false
    }
  }
}

const formModalTitle = computed(() =>
  isEditMode.value ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp mới',
)
const formModalKey = ref(0)

const openAddEditModal = async (supplier = null) => {
  isEditMode.value = !!supplier
  formErrors.value = {}
  formModalKey.value++

  if (supplier) {
    editableSupplier.value = JSON.parse(JSON.stringify(supplier))
    isFormModalVisible.value = true
    await handleFormRefresh(false, false)
  } else {
    editableSupplier.value = {
      name: '',
      phone: '',
      email: '',
      address: '',
      taxIdentificationNumber: '',
      notes: '',
      statusId: 'active',
    }
    isFormModalVisible.value = true
  }
}

const handleCloseFormModal = () => {
  isFormModalVisible.value = false
  editableSupplier.value = {}
  formErrors.value = {}
}

const handleSaveSupplier = async (data) => {
  editableSupplier.value = data
  isSaving.value = true
  overlayMessage.value = isEditMode.value ? 'Đang cập nhật...' : 'Đang tạo mới...'

  try {
    let result
    if (isEditMode.value) {
      result = await supplierStore.updateSupplier(editableSupplier.value.id, editableSupplier.value)
    } else {
      result = await supplierStore.createSupplier(editableSupplier.value)
    }

    if (result) {
      queryClient.setQueryData(['suppliers', result.id], result)
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success(isEditMode.value ? 'Cập nhật thành công!' : 'Thêm mới thành công!')
      handleCloseFormModal()
    }
  } catch (err) {
    if (err.response?.status === 400) {
      formErrors.value = normalizeBackendErrors(err, {
        fieldMappings: {
          taxidentificationnumber: 'taxIdentificationNumber',
        },
      })
      toast.warning('Vui lòng kiểm tra lại các trường có lỗi.')
    } else {
      toast.error(`Lỗi: ${err.message || err}`)
    }
  } finally {
    isSaving.value = false
  }
}

const handleClearError = (field) => {
  if (formErrors.value[field]) {
    formErrors.value[field] = ''
  }
}

const openDeleteModal = async (supplier) => {
  const confirmed = await showConfirmation(
    'Xóa nhà cung cấp',
    `Bạn có chắc chắn muốn xóa nhà cung cấp ${supplier.name}?`,
  )

  if (confirmed) {
    isSaving.value = true
    overlayMessage.value = 'Đang xóa...'
    try {
      await supplierStore.deleteSupplier(supplier.id)
      queryClient.removeQueries({ queryKey: ['suppliers', supplier.id] })
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Xóa thành công!')
    } catch (err) {
      toast.error(`Lỗi: ${err.message || err}`)
    } finally {
      isSaving.value = false
    }
  }
}

const isRefreshing = ref(false)

const handleFormRefresh = async (showToast = true, showLoading = true) => {
  if (isEditMode.value && editableSupplier.value.id) {
    if (showLoading) isRefreshing.value = true
    try {
      const freshData = await queryClient.fetchQuery({
        queryKey: ['suppliers', editableSupplier.value.id],
        queryFn: () => supplierStore.getSupplierById(editableSupplier.value.id),
        staleTime: 0,
      })
      if (freshData) {
        editableSupplier.value = JSON.parse(JSON.stringify(freshData))
      }
      if (showToast) toast.info('Đã làm mới dữ liệu')
    } catch (e) {
      toast.error(`Lỗi làm mới: ${e.message}`)
    } finally {
      if (showLoading) isRefreshing.value = false
    }
  } else {
    editableSupplier.value = {
      name: '',
      phone: '',
      email: '',
      address: '',
      taxIdentificationNumber: '',
      notes: '',
      statusId: 'active',
    }
    formErrors.value = {}
    if (showToast) toast.info('Đã làm mới form')
  }
}

watch(isError, (hasError) => {
  if (hasError) {
    toast.error('Lỗi tải dữ liệu nhà cung cấp')
  }
})

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
        <h1 class="text-3xl font-bold text-gray-800">Quản lý nhà cung cấp</h1>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button
          v-if="hasPermission(Permissions.SuppliersCreate)"
          text="Thêm nhà cung cấp"
          :icon="IconPlus"
          color="primary"
          @click="openAddEditModal()"
        />

        <label
          v-if="hasPermission(Permissions.SuppliersCreate)"
          for="import-file-input"
          class="cursor-pointer"
        >
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
          v-if="hasPermission(Permissions.SuppliersView)"
          text="Export"
          :icon="IconFileExport"
          color="secondary"
          @click="handleExport"
        />

        <span class="text-gray-400 mx-4 hidden border-r-2 sm:block" />

        <SupplierFilterButtons v-model="selectedStatuses" />
      </div>
    </div>

    <Input
      v-model="searchRefs.search"
      type="text"
      placeholder="Tìm kiếm theo tên nhà cung cấp..."
      class="mb-3"
    />

    <div class="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div
        class="hidden md:grid md:grid-cols-16 items-center gap-2 py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200"
      >
        <div class="md:col-span-8">Tên nhà cung cấp</div>
        <div class="md:col-start-9 md:col-span-2">Điện thoại</div>
        <div class="md:col-start-11 md:col-span-2">Email</div>
        <div class="md:col-start-13 md:col-span-2 md:justify-self-end">Tổng đã mua (hoàn tất)</div>
        <div class="md:col-start-15 md:col-span-2">Trạng thái</div>
      </div>

      <div class="bg-white">
        <div v-if="isError" class="text-center py-12 text-red-500 font-medium">
          Đã xảy ra lỗi khi lấy dữ liệu nhà cung cấp
        </div>

        <template v-else-if="suppliers.length === 0">
          <div v-if="isLoading">
            <div
              v-for="i in 5"
              :key="i"
              class="grid md:grid-cols-16 gap-2 py-4 px-5 border-b border-gray-50 items-center last:border-0"
            >
              <div class="md:col-span-8"><SkeletonLoader width="60%" height="16px" /></div>
              <div class="md:col-start-9 md:col-span-2">
                <SkeletonLoader width="80%" height="16px" />
              </div>
              <div class="md:col-start-11 md:col-span-2">
                <SkeletonLoader width="90%" height="16px" />
              </div>
              <div class="md:col-start-13 md:col-span-2 flex justify-end">
                <SkeletonLoader width="60%" height="16px" />
              </div>
              <div class="md:col-start-15 md:col-span-2">
                <SkeletonLoader width="70%" height="24px" class="rounded-full" />
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 flex flex-col items-center justify-center space-y-3">
            <div class="bg-gray-50 p-3 rounded-full">
              <IconEmptyBox class="h-8 w-8 text-gray-400" />
            </div>
            <p class="text-gray-500 font-medium">Không có nhà cung cấp nào để hiển thị.</p>
          </div>
        </template>

        <div v-else class="divide-y divide-gray-50">
          <SupplierItem
            v-for="item in suppliers"
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
      :total-pages="pagination.totalPages.value"
      :currentPage="pagination.currentPage.value"
      @update:currentPage="pagination.changePage"
      :loading="isLoading"
    />

    <SupplierFormModal
      :key="formModalKey"
      :show="isFormModalVisible"
      :title="formModalTitle"
      :supplier="editableSupplier"
      :is-edit-mode="isEditMode"
      :is-saving="isSaving"
      :is-refreshing="isRefreshing"
      :errors="formErrors"
      :on-refresh="isEditMode ? handleFormRefresh : undefined"
      @close="handleCloseFormModal"
      @save="handleSaveSupplier"
      @clear-error="handleClearError"
    />
  </div>
</template>
