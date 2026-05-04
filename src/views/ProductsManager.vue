<script setup>
import { ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useProductStore } from '@/stores/product.store'
import productService from '@/services/product.service'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { useToast } from 'vue-toastification'
import { Permissions } from '@/constants/permissions'
import { usePermission } from '@/composables/usePermission'
import { normalizeBackendErrors } from '@/utils/error-helper'

import Button from '@/components/ui/button/BaseButton.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import Pagination from '@/components/ui/button/BasePagination.vue'
import IconPlus from '@/assets/icons/IconPlus.svg'
import IconFileImport from '@/assets/icons/IconFileImport.svg'
import IconFileExport from '@/assets/icons/IconFileExport.svg'

import ProductSearch from '@/components/product/ProductSearch.vue'
import ProductTable from '@/components/product/ProductTable.vue'
import ProductFormModal from '@/components/product/ProductFormModal.vue'

const productStore = useProductStore()
const queryClient = useQueryClient()
const toast = useToast()
const { hasPermission } = usePermission()

const isSaving = ref(false)
const isRefreshing = ref(false)
const isFormModalVisible = ref(false)
const formModalKey = ref(0)
const formModalTitle = ref('')

const { data: inventoryStatusesData } = useQuery({
  queryKey: ['inventoryStatuses'],
  queryFn: () => productService.getInventoryStatuses(),
})

const inventoryStatusMap = computed(() => {
  const list = inventoryStatusesData.value || []
  return list.reduce((acc, item) => {
    acc[item.key] = item.label
    return acc
  }, {})
})

const inventoryStatusColorMap = {
  OutOfStock: 'red',
  LowStock: 'yellow',
  InStock: 'green',
}

const {
  data: products,
  isLoading,
  isError,
  error,
  pagination,
  searchRefs,
  filterRefs,
  toggleSort,
  getSortDirection,
} = usePaginatedQuery({
  queryKey: ['products'],
  queryFn: (query) => productStore.fetchProducts(query),
  itemsPerPage: 10,
  searchFields: [{ key: 'search', debounce: 400 }],
  filterFields: [{ key: 'inventoryStatus' }],
  sortableFields: ['inventoryStatus'],
})

const getNewEmptyProduct = () => ({
  id: null,
  name: '',
  category_id: null,
  brand_id: null,
  description: '',
  weight: null,
  dimensions: '',
  wheelbase: null,
  seat_height: null,
  ground_clearance: null,
  fuel_capacity: null,
  tire_size: '',
  front_suspension: '',
  rear_suspension: '',
  engine_type: '',
  max_power: '',
  oil_capacity: null,
  fuel_consumption: '',
  transmission_type: '',
  starter_system: '',
  max_torque: '',
  displacement: null,
  bore_stroke: '',
  compression_ratio: '',
  status_id: 'out-of-stock',
  variants: [
    {
      id: null,
      price: null,
      optionValues: {},
      cover_image_url: '',
      photo_collection: [],
      url: '',
    },
  ],
})

const editableProduct = ref(getNewEmptyProduct())
const formErrors = ref({ name: '', category_id: '', variants: [], _backend: {} })

const openAddEditModal = async (product = null) => {
  formErrors.value = { name: '', category_id: '', variants: [], _backend: {} }
  if (product) {
    formModalTitle.value = 'Chỉnh Sửa Sản Phẩm'
    formModalKey.value++
    isFormModalVisible.value = true
    isRefreshing.value = true

    const cachedData = queryClient.getQueryData(['products', product.id])
    if (cachedData) {
      editableProduct.value = JSON.parse(JSON.stringify(cachedData))
    }

    try {
      const freshData = await queryClient.fetchQuery({
        queryKey: ['products', product.id],
        queryFn: () => productStore.getProductById(product.id),
      })
      if (freshData) {
        editableProduct.value = JSON.parse(JSON.stringify(freshData))
      }
    } catch (e) {
      if (!cachedData) {
        toast.error(`Lỗi tải dữ liệu: ${e.message}`)
      }
    } finally {
      isRefreshing.value = false
    }
  } else {
    editableProduct.value = getNewEmptyProduct()
    formModalTitle.value = 'Thêm Sản Phẩm Mới'
    formModalKey.value++
    isFormModalVisible.value = true
  }
}

const handleRefreshForm = async () => {
  if (editableProduct.value.id) {
    isRefreshing.value = true
    try {
      const freshData = await queryClient.fetchQuery({
        queryKey: ['products', editableProduct.value.id],
        queryFn: () => productStore.getProductById(editableProduct.value.id),
      })
      if (freshData) {
        editableProduct.value = JSON.parse(JSON.stringify(freshData))
      }
      toast.info('Đã làm mới dữ liệu sản phẩm')
    } catch (e) {
      toast.error(`Lỗi làm mới: ${e.message}`)
    } finally {
      isRefreshing.value = false
    }
  }
}

const handleSaveProduct = async (productData) => {
  isSaving.value = true
  try {
    let result
    if (productData.id) {
      result = await productStore.updateProduct(productData.id, productData)
    } else {
      result = await productStore.addProduct(productData)
    }
    if (result?.id) {
      queryClient.setQueryData(['products', result.id], result)
    }
    isFormModalVisible.value = false
    await queryClient.invalidateQueries({ queryKey: ['products'] })
    toast.success(productData.id ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công')
  } catch (err) {
    if (err?.response?.status === 400) {
      formErrors.value = normalizeBackendErrors(err, {
        fieldMappings: {
          categoryid: 'category_id',
          brandid: 'brand_id',
          urlslug: 'url',
          metatitle: 'meta_title',
          metadescription: 'meta_description',
          shortdescription: 'short_description',
          seatheight: 'seat_height',
          groundclearance: 'ground_clearance',
          fuelcapacity: 'fuel_capacity',
          tiresize: 'tire_size',
          frontsuspension: 'front_suspension',
          rearsuspension: 'rear_suspension',
          enginetype: 'engine_type',
          maxpower: 'max_power',
          oilcapacity: 'oil_capacity',
          fuelconsumption: 'fuel_consumption',
          transmissiontype: 'transmission_type',
          startersystem: 'starter_system',
          maxtorque: 'max_torque',
          borestroke: 'bore_stroke',
          compressionratio: 'compression_ratio',
        },
      })
      toast.warning('Vui lòng kiểm tra lại các trường có lỗi.')
    } else {
      toast.error(err.message || 'Lỗi khi lưu sản phẩm')
    }
  } finally {
    isSaving.value = false
  }
}

const handleClearError = (field, index = null) => {
  if (index !== null) {
    if (formErrors.value.variants && formErrors.value.variants[index]) {
      formErrors.value.variants[index][field] = ''
    }
  } else {
    if (formErrors.value[field]) {
      formErrors.value[field] = ''
    }
  }
}

const promptDelete = async (product) => {
  try {
    await productStore.deleteProduct(product.id)
    queryClient.removeQueries({ queryKey: ['products', product.id] })
    await queryClient.invalidateQueries({ queryKey: ['products'] })
    toast.success('Xoá sản phẩm thành công')
  } catch (err) {
    toast.error(err.message || 'Lỗi khi xoá sản phẩm')
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
  <LoadingOverlay :show="productStore.isLoading || isSaving" message="Đang xử lý..." />

  <div class="p-4 sm:p-6 rounded-xl shadow-lg bg-white">
    <div
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0"
    >
      <h1 class="text-3xl font-bold text-gray-800">Quản lý sản phẩm</h1>
      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
        <Button
          v-if="hasPermission(Permissions.ProductsCreate)"
          text="Thêm sản phẩm"
          :icon="IconPlus"
          color="primary"
          @click="openAddEditModal()"
        />
        <label
          v-if="hasPermission(Permissions.ProductsCreate)"
          for="import-product-input"
          class="cursor-pointer"
        >
          <Button text="Import" :icon="IconFileImport" color="secondary" as="span" />
          <input
            type="file"
            id="import-product-input"
            accept=".xlsx, .xls"
            class="hidden"
            @change="importExcel"
          />
        </label>
        <Button
          v-if="hasPermission(Permissions.ProductsView)"
          text="Export"
          :icon="IconFileExport"
          color="secondary"
          @click="exportExcel"
        />
      </div>
    </div>

    <ProductSearch
      v-model:search="searchRefs.search"
      v-model:inventoryStatus="filterRefs.inventoryStatus"
      :inventoryStatusMap="inventoryStatusMap"
    />

    <div
      v-if="isError"
      class="text-center py-12 text-red-500 font-medium bg-white rounded-lg shadow-sm border border-gray-200"
    >
      Đã xảy ra lỗi khi lấy dữ liệu: {{ error?.message }}
    </div>

    <ProductTable
      v-else
      :products="products"
      :isLoading="isLoading"
      :inventoryStatusMap="inventoryStatusMap"
      :inventoryStatusColorMap="inventoryStatusColorMap"
      :sortDirection="getSortDirection"
      @edit="openAddEditModal"
      @delete="promptDelete"
      @sort="toggleSort"
    />

    <Pagination
      :total-pages="pagination.totalPages.value"
      :currentPage="pagination.currentPage.value"
      @update:currentPage="pagination.changePage"
      :loading="isLoading"
    />
  </div>

  <ProductFormModal
    :key="formModalKey"
    :show="isFormModalVisible"
    :title="formModalTitle"
    :product="editableProduct"
    :is-edit-mode="!!editableProduct.id"
    :is-saving="isSaving"
    :is-refreshing="isRefreshing"
    :errors="formErrors"
    :onRefresh="editableProduct.id ? handleRefreshForm : undefined"
    @close="isFormModalVisible = false"
    @save="handleSaveProduct"
    @clear-error="handleClearError"
  />
</template>
