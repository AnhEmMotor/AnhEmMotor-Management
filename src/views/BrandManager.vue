<script setup>
import { ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useBrandStore } from '@/stores/brand.store'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { showConfirmation } from '@/composables/useConfirmationState'
import { useToast } from 'vue-toastification'
import { Permissions } from '@/constants/permissions'
import { usePermission } from '@/composables/usePermission'

import Button from '@/components/ui/button/BaseButton.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import Pagination from '@/components/ui/button/BasePagination.vue'
import IconPlus from '@/assets/icons/IconPlus.svg'
import IconFileImport from '@/assets/icons/IconFileImport.svg'
import IconFileExport from '@/assets/icons/IconFileExport.svg'

import BrandSearch from '@/components/brands/BrandSearch.vue'
import BrandTable from '@/components/brands/BrandTable.vue'
import BrandFormModal from '@/components/brands/BrandFormModal.vue'

const brandStore = useBrandStore()
const queryClient = useQueryClient()
const toast = useToast()
const { hasPermission } = usePermission()

const isSaving = ref(false)
const isRefreshing = ref(false)
const isOverlayVisible = ref(false)
const isFormModalVisible = ref(false)
const formModalKey = ref(0)
const editableBrand = ref({ id: null, name: '', description: '' })
const isEditMode = ref(false)
const formModalTitle = ref('')

const {
  data: brands,
  isLoading,
  isError,
  pagination,
  searchRefs,
} = usePaginatedQuery({
  queryKey: ['brands'],
  queryFn: (query) => brandStore.fetchBrands(query),
  itemsPerPage: 10,
  searchFields: [{ key: 'search', debounce: 400 }],
})

const openAddModal = () => {
  editableBrand.value = { id: null, name: '', description: '' }
  isEditMode.value = false
  formModalTitle.value = 'Thêm thương hiệu mới'
  formModalKey.value++
  isFormModalVisible.value = true
}

const openEditModal = async (brand) => {
  editableBrand.value = { ...brand }
  isEditMode.value = true
  formModalTitle.value = 'Chỉnh sửa thương hiệu'
  formModalKey.value++
  isFormModalVisible.value = true

  const cachedData = queryClient.getQueryData(['brands', brand.id])
  if (!cachedData) {
    isRefreshing.value = true
  } else {
    editableBrand.value = { ...cachedData }
  }

  try {
    const fetchedData = await queryClient.fetchQuery({
      queryKey: ['brands', brand.id],
      queryFn: () => brandStore.getBrandById(brand.id),
    })
    if (fetchedData) {
      editableBrand.value = { ...fetchedData }
    }
  } catch {
    if (!cachedData) {
      toast.error('Lỗi khi tải chi tiết thương hiệu')
    }
  } finally {
    isRefreshing.value = false
  }
}

const handleSave = async (brandData) => {
  isSaving.value = true
  try {
    if (isEditMode.value) {
      const updatedBrand = await brandStore.updateBrand({
        id: brandData.id,
        brand: brandData,
      })
      queryClient.setQueryData(['brands', updatedBrand.id], updatedBrand)
      toast.success('Cập nhật thương hiệu thành công')
    } else {
      const newBrand = await brandStore.addBrand(brandData)
      queryClient.setQueryData(['brands', newBrand.id], newBrand)
      toast.success('Thêm thương hiệu thành công')
    }
    isFormModalVisible.value = false
    await queryClient.invalidateQueries({ queryKey: ['brands'] })
  } catch (err) {
    toast.error(err.message || 'Lỗi khi lưu thương hiệu')
  } finally {
    isSaving.value = false
  }
}

const promptDelete = async (brand) => {
  const confirmed = await showConfirmation(
    'Xác nhận xóa',
    `Bạn có chắc chắn muốn xoá thương hiệu "${brand.name}"?`,
  )
  if (!confirmed) return

  isOverlayVisible.value = true
  try {
    await brandStore.deleteBrand(brand.id)
    queryClient.removeQueries({ queryKey: ['brands', brand.id] })
    await queryClient.invalidateQueries({ queryKey: ['brands'] })
    toast.success('Xoá thương hiệu thành công')
  } catch (err) {
    toast.error(err.message || 'Lỗi khi xoá thương hiệu')
  } finally {
    isOverlayVisible.value = false
  }
}

const handleRefreshForm = async () => {
  if (isEditMode.value && editableBrand.value.id) {
    isRefreshing.value = true
    try {
      const freshData = await queryClient.fetchQuery({
        queryKey: ['brands', editableBrand.value.id],
        queryFn: () => brandStore.getBrandById(editableBrand.value.id),
      })
      if (freshData) {
        editableBrand.value = { ...freshData }
      }
      toast.info('Đã tải lại dữ liệu thương hiệu')
    } catch (e) {
      toast.error(`Lỗi tải lại: ${e.message}`)
    } finally {
      isRefreshing.value = false
    }
  } else {
    editableBrand.value = { id: null, name: '', description: '' }
    toast.info('Đã làm mới form')
  }
}

const importExcel = (event) => {
  toast.info('Chức năng Import Excel đang phát triển')
  event.target.value = ''
}

const exportExcel = () => {
  toast.info('Chức năng Export Excel đang phát triển')
}
</script>

<template>
  <LoadingOverlay :show="isOverlayVisible || isSaving" message="Đang xử lý..." />

  <div class="p-4 sm:p-6 rounded-xl shadow-lg bg-white">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0"
    >
      <h1 class="text-3xl font-bold text-gray-800">Quản lý thương hiệu</h1>
      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
        <Button
          v-if="hasPermission(Permissions.BrandsCreate)"
          text="Thêm thương hiệu"
          :icon="IconPlus"
          color="primary"
          @click="openAddModal"
        />
        <label
          v-if="hasPermission(Permissions.BrandsCreate)"
          for="import-brand-input"
          class="cursor-pointer"
        >
          <Button text="Import" :icon="IconFileImport" color="secondary" as="span" />
          <input
            type="file"
            id="import-brand-input"
            accept=".xlsx, .xls"
            class="hidden"
            @change="importExcel"
          />
        </label>
        <Button
          v-if="hasPermission(Permissions.BrandsView)"
          text="Export"
          :icon="IconFileExport"
          color="secondary"
          @click="exportExcel"
        />
      </div>
    </div>

    <BrandSearch v-model="searchRefs.search" />

    <div
      v-if="isError"
      class="text-center py-12 text-red-500 font-medium bg-white rounded-lg shadow-sm border border-gray-200"
    >
      Đã xảy ra lỗi khi tải danh sách thương hiệu.
    </div>
    <BrandTable
      v-else
      :brands="brands"
      :isLoading="isLoading"
      @edit="openEditModal"
      @delete="promptDelete"
    />

    <Pagination
      :total-pages="pagination.totalPages.value"
      :currentPage="pagination.currentPage.value"
      @update:currentPage="pagination.changePage"
      :loading="isLoading"
    />
  </div>

  <BrandFormModal
    :key="formModalKey"
    :show="isFormModalVisible"
    :title="formModalTitle"
    :brand="editableBrand"
    :isEditMode="isEditMode"
    :isSaving="isSaving"
    :isRefreshing="isRefreshing"
    :onRefresh="isEditMode ? handleRefreshForm : undefined"
    @close="isFormModalVisible = false"
    @save="handleSave"
  />
</template>
