<script setup>
import { ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useCategoryStore } from '@stores/category.store'
import { usePaginatedQuery } from '@composables/usePaginatedQuery'
import { showConfirmation } from '@composables/useConfirmationState'
import { useToast } from 'vue-toastification'
import { Permissions } from '@constants/permissions'
import { usePermission } from '@composables/usePermission'

import Button from '@components/ui/button/BaseButton.vue'
import LoadingOverlay from '@components/ui/LoadingOverlay.vue'
import Pagination from '@components/ui/button/BasePagination.vue'
import IconPlus from '@/assets/icons/IconPlus.svg'
import IconFileImport from '@/assets/icons/IconFileImport.svg'
import IconFileExport from '@/assets/icons/IconFileExport.svg'

import CategorySearch from '@components/categories/CategorySearch.vue'
import CategoryTable from '@components/categories/CategoryTable.vue'
import CategoryFormModal from '@components/categories/CategoryFormModal.vue'

const categoryStore = useCategoryStore()
const queryClient = useQueryClient()
const toast = useToast()
const { hasPermission } = usePermission()

const isSaving = ref(false)
const isRefreshing = ref(false)
const isOverlayVisible = ref(false)
const isFormModalVisible = ref(false)
const formModalKey = ref(0)
const editableCategory = ref({ id: null, name: '', description: '' })
const isEditMode = ref(false)
const formModalTitle = ref('')

const {
  data: categories,
  isLoading,
  isError,
  pagination,
  searchRefs,
} = usePaginatedQuery({
  queryKey: ['categoriesForManager'],
  queryFn: (query) => categoryStore.fetchCategoriesForManager(query),
  itemsPerPage: 10,
  searchFields: [{ key: 'search', debounce: 400 }],
})

const openAddModal = () => {
  editableCategory.value = { id: null, name: '', description: '' }
  isEditMode.value = false
  formModalTitle.value = 'Thêm thể loại mới'
  formModalKey.value++
  isFormModalVisible.value = true
}

const openEditModal = async (category) => {
  editableCategory.value = { ...category }
  isEditMode.value = true
  formModalTitle.value = 'Chỉnh sửa thể loại'
  formModalKey.value++
  isFormModalVisible.value = true

  const cachedData = queryClient.getQueryData(['categoriesForManager', category.id])
  if (!cachedData) {
    isRefreshing.value = true
  } else {
    editableCategory.value = { ...cachedData }
  }

  try {
    const fetchedData = await queryClient.fetchQuery({
      queryKey: ['categoriesForManager', category.id],
      queryFn: () => categoryStore.getCategoryById(category.id),
      staleTime: 0,
    })
    if (fetchedData) {
      editableCategory.value = { ...fetchedData }
    }
  } catch {
    if (!cachedData) {
      toast.error('Lỗi khi tải chi tiết thể loại')
    }
  } finally {
    isRefreshing.value = false
  }
}

const handleSave = async (categoryData) => {
  isSaving.value = true
  try {
    if (isEditMode.value) {
      const updatedCategory = await categoryStore.updateCategory({
        id: categoryData.id,
        category: categoryData,
      })
      queryClient.setQueryData(['categoriesForManager', updatedCategory.id], updatedCategory)
      toast.success('Cập nhật thể loại thành công')
    } else {
      const newCategory = await categoryStore.addCategory(categoryData)
      queryClient.setQueryData(['categoriesForManager', newCategory.id], newCategory)
      toast.success('Thêm thể loại thành công')
    }
    isFormModalVisible.value = false
    await queryClient.invalidateQueries({ queryKey: ['categoriesForManager'] })
  } catch (err) {
    toast.error(err.message || 'Lỗi khi lưu thể loại')
  } finally {
    isSaving.value = false
  }
}

const promptDelete = async (category) => {
  const confirmed = await showConfirmation(
    'Xác nhận xóa',
    `Bạn có chắc chắn muốn xoá thể loại "${category.name}"?`,
  )
  if (!confirmed) return

  isOverlayVisible.value = true
  try {
    await categoryStore.deleteCategory(category.id)
    queryClient.removeQueries({ queryKey: ['categoriesForManager', category.id] })
    await queryClient.invalidateQueries({ queryKey: ['categoriesForManager'] })
    toast.success('Xoá thể loại thành công')
  } catch (err) {
    toast.error(err.message || 'Lỗi khi xoá thể loại')
  } finally {
    isOverlayVisible.value = false
  }
}

const handleRefreshForm = async () => {
  if (isEditMode.value && editableCategory.value.id) {
    isRefreshing.value = true
    try {
      const freshData = await queryClient.fetchQuery({
        queryKey: ['categoriesForManager', editableCategory.value.id],
        queryFn: () => categoryStore.getCategoryById(editableCategory.value.id),
        staleTime: 0,
      })
      if (freshData) {
        editableCategory.value = { ...freshData }
      }
      toast.info('Đã tải lại dữ liệu thể loại')
    } catch (e) {
      toast.error(`Lỗi tải lại: ${e.message}`)
    } finally {
      isRefreshing.value = false
    }
  } else {
    editableCategory.value = { id: null, name: '', description: '' }
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
      <h1 class="text-3xl font-bold text-gray-800">Quản lý thể loại sản phẩm</h1>
      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
        <Button
          v-if="hasPermission(Permissions.ProductCategoriesCreate)"
          text="Thêm thể loại"
          :icon="IconPlus"
          color="primary"
          @click="openAddModal"
        />
        <label
          v-if="hasPermission(Permissions.ProductCategoriesCreate)"
          for="import-category-input"
          class="cursor-pointer"
        >
          <Button text="Import" :icon="IconFileImport" color="secondary" as="span" />
          <input
            type="file"
            id="import-category-input"
            accept=".xlsx, .xls"
            class="hidden"
            @change="importExcel"
          />
        </label>
        <Button
          v-if="hasPermission(Permissions.ProductCategoriesView)"
          text="Export"
          :icon="IconFileExport"
          color="secondary"
          @click="exportExcel"
        />
      </div>
    </div>

    <CategorySearch v-model="searchRefs.search" />

    <div
      v-if="isError"
      class="text-center py-12 text-red-500 font-medium bg-white rounded-lg shadow-sm border border-gray-200"
    >
      Đã xảy ra lỗi khi tải danh sách thể loại.
    </div>
    <CategoryTable
      v-else
      :categories="categories"
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

  <CategoryFormModal
    :key="formModalKey"
    :show="isFormModalVisible"
    :title="formModalTitle"
    :category="editableCategory"
    :isEditMode="isEditMode"
    :isSaving="isSaving"
    :isRefreshing="isRefreshing"
    :onRefresh="isEditMode ? handleRefreshForm : undefined"
    @close="isFormModalVisible = false"
    @save="handleSave"
  />
</template>



