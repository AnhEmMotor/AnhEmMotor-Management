<script setup>
import { ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import * as productApi from '@/api/product'
import { getPredefinedOptions, getInventoryStatuses } from '@/api/options'
import { useProductsStore } from '@/stores/useProductsStore'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { useToast } from 'vue-toastification'
import { Permissions } from '@/constants/permissions'
import { usePermission } from '@/composables/usePermission'
import ProductForm from '@/components/product/ProductForm.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import Input from '@/components/ui/input/BaseInput.vue'
import Pagination from '@/components/ui/button/BasePagination.vue'
import SmallNoBgButton from '@/components/ui/button/SmallNoBgButton.vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import IconLeftArrow from '@/assets/icons/IconLeftArrow.svg'
import IconDownArrow from '@/assets/icons/IconDownArrow.svg'
import IconPlus from '@/assets/icons/IconPlus.svg'
import IconFileImport from '@/assets/icons/IconFileImport.svg'
import IconFileExport from '@/assets/icons/IconFileExport.svg'
import IconEdit from '@/assets/icons/IconEdit.svg'
import IconTrash from '@/assets/icons/IconTrash.svg'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'

const { hasPermission } = usePermission()

const productsStore = useProductsStore()
const queryClient = useQueryClient()
const toast = useToast()

const { data: predefinedOptionsData } = useQuery({
  queryKey: ['predefinedOptions'],
  queryFn: getPredefinedOptions,
  staleTime: 5 * 60 * 1000,
})

const { data: inventoryStatusesData } = useQuery({
  queryKey: ['inventoryStatuses'],
  queryFn: getInventoryStatuses,
  staleTime: 10 * 60 * 1000,
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

const expandedProductIds = ref([])
const activeTabs = ref({})
const getActiveTab = (productId) => activeTabs.value[productId] || 'variants'
const setActiveTab = (productId, tab) => {
  activeTabs.value[productId] = tab
}
const numberOfColumns = ref(8)
const isSaving = ref(false)
const isRefreshing = ref(false)

const fetchProductsFn = async (params) => {
  const { page, limit, search, inventoryStatus, sort } = params
  const apiParams = { Page: page, PageSize: limit }

  let filterParts = []
  if (search) filterParts.push(`name@=*${search}`)
  if (inventoryStatus) filterParts.push(`inventoryStatus==${inventoryStatus}`)

  if (filterParts.length > 0) apiParams.Filters = filterParts.join(',')
  if (sort) apiParams.Sorts = sort

  const result = await productApi.getProductsForManager(apiParams)
  return {
    data: result.items || [],
    pagination: {
      totalPages: result.totalPages || 1,
      totalCount: result.totalCount || 0,
    },
  }
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
  queryFn: fetchProductsFn,
  itemsPerPage: 10,
  searchFields: [{ key: 'search', debounce: 400 }],
  filterFields: [{ key: 'inventoryStatus' }],
  sortableFields: ['inventoryStatus'],
})

const isStoreLoading = computed(() => productsStore.isLoading)

const isExpanded = (productId) => expandedProductIds.value.includes(productId)

const toggleDetails = (productId) => {
  const index = expandedProductIds.value.indexOf(productId)
  if (index > -1) {
    expandedProductIds.value.splice(index, 1)
  } else {
    expandedProductIds.value.push(productId)
  }
}

const formatCurrency = (value) => {
  if (value === null || value === undefined) return ''
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

const getVariantOptionsText = (variant) => {
  if (!variant.optionValues) return 'Mặc định'
  const values = Object.entries(variant.optionValues)
  if (values.length === 0) return 'Mặc định'
  const dict = predefinedOptionsData.value || {}
  return values.map(([key, value]) => `${dict[key] || key}: ${value}`).join(', ')
}

const getInventoryStatusColor = (statusKey) => inventoryStatusColorMap[statusKey] || 'gray'
const getInventoryStatusLabel = (statusKey) =>
  inventoryStatusMap.value[statusKey] || statusKey || 'Không rõ'

const isFormModalVisible = ref(false)
const formModalTitle = ref('')
const formModalKey = ref(0)

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
const isEditMode = computed(() => !!editableProduct.value?.id)

const formErrors = ref({ name: '', category_id: '', variants: [], _backend: {} })

const openAddEditModal = async (product = null) => {
  formErrors.value = { name: '', category_id: '', variants: [], _backend: {} }
  if (product) {
    formModalTitle.value = 'Chỉnh Sửa Sản Phẩm'
    formModalKey.value++
    isFormModalVisible.value = true

    const cachedData = queryClient.getQueryData(['products', product.id])
    if (cachedData) {
      editableProduct.value = JSON.parse(JSON.stringify(cachedData))
      queryClient
        .fetchQuery({
          queryKey: ['products', product.id],
          queryFn: () => productApi.getProductById(product.id),
        })
        .then((freshData) => {
          if (freshData) {
            editableProduct.value = JSON.parse(JSON.stringify(freshData))
          }
        })
        .catch(() => {})
    } else {
      isRefreshing.value = true
      try {
        const freshData = await queryClient.fetchQuery({
          queryKey: ['products', product.id],
          queryFn: () => productApi.getProductById(product.id),
        })
        if (freshData) {
          editableProduct.value = JSON.parse(JSON.stringify(freshData))
        }
      } catch (e) {
        toast.error(`Lỗi tải dữ liệu: ${e.message}`)
      } finally {
        isRefreshing.value = false
      }
    }
  } else {
    editableProduct.value = getNewEmptyProduct()
    formModalTitle.value = 'Thêm Sản Phẩm Mới'
    formModalKey.value++
    isFormModalVisible.value = true
  }
}

const handleCloseFormModal = () => {
  isFormModalVisible.value = false
}

const handleRefreshForm = async () => {
  if (isEditMode.value && editableProduct.value.id) {
    isRefreshing.value = true
    try {
      const freshData = await queryClient.fetchQuery({
        queryKey: ['products', editableProduct.value.id],
        queryFn: () => productApi.getProductById(editableProduct.value.id),
        staleTime: 0,
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

const validateProduct = (productData) => {
  const errors = { name: '', category_id: '', variants: [] }
  let hasError = false

  if (!productData.name) {
    errors.name = 'Vui lòng nhập tên dòng sản phẩm.'
    hasError = true
  }
  if (!productData.category_id) {
    errors.category_id = 'Vui lòng chọn danh mục.'
    hasError = true
  }
  if (!productData.variants || productData.variants.length === 0) {
    hasError = true
  }

  const variantErrors = []
  const seenCombinations = new Set()
  const seenSlugs = new Set()

  ;(productData.variants || []).forEach((variant, index) => {
    const vErrors = {}
    if (
      variant.price === null ||
      variant.price === '' ||
      isNaN(variant.price) ||
      variant.price < 0
    ) {
      vErrors.price = 'Vui lòng nhập Giá Bán hợp lệ (lớn hơn 0).'
      hasError = true
    }
    if (!variant.url) {
      vErrors.url = 'Vui lòng nhập URL Slug.'
      hasError = true
    }
    const optionEntries = Object.entries(variant.optionValues || {})
    if (optionEntries.length > 0) {
      const hasEmptyValues = optionEntries.some(([, val]) => !val || !val.trim())
      if (hasEmptyValues) {
        vErrors.combination = 'Vui lòng nhập đầy đủ giá trị cho tất cả thuộc tính.'
        hasError = true
      } else {
        const sig = JSON.stringify(
          Object.keys(variant.optionValues)
            .sort()
            .reduce((o, k) => {
              o[k] = variant.optionValues[k]
              return o
            }, {}),
        )
        if (seenCombinations.has(sig)) {
          vErrors.combination = 'Tổ hợp thuộc tính này bị trùng lặp.'
          hasError = true
        } else {
          seenCombinations.add(sig)
        }
      }
    }

    if (variant.url) {
      if (seenSlugs.has(variant.url)) {
        vErrors.url = 'URL Slug này bị trùng lặp với biến thể khác.'
        hasError = true
      } else {
        seenSlugs.add(variant.url)
      }
    }

    variantErrors[index] = vErrors
  })

  errors.variants = variantErrors
  return { hasError, errors }
}

const handleSaveProduct = async () => {
  const productData = editableProduct.value
  const { hasError, errors } = validateProduct(productData)
  formErrors.value = errors
  if (hasError) return

  isSaving.value = true
  try {
    const isEditing = isEditMode.value
    let result
    if (isEditing) {
      result = await productsStore.updateProduct(productData.id, productData)
    } else {
      result = await productsStore.createProduct(productData)
    }
    if (result?.id) {
      queryClient.setQueryData(['products', result.id], result)
    }
    isFormModalVisible.value = false
    await queryClient.invalidateQueries({ queryKey: ['products'] })
    toast.success(isEditing ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công')
  } catch (err) {
    const backendErrors = err?.response?.data?.errors || err?.response?.data?.Errors || null
    if (backendErrors && err?.response?.status === 400) {
      const normalized = {}
      const variantErrorsFromBackend = []
      Object.entries(backendErrors).forEach(([key, messages]) => {
        const msg = Array.isArray(messages) ? messages[0] : messages
        const normalizedKey = key.toLowerCase()
        normalized[normalizedKey] = msg

        const variantMatch = key.match(/(?:\$\.)?variants\[(\d+)\]\.(.+)/i)
        if (variantMatch) {
          const index = parseInt(variantMatch[1], 10)
          const field = variantMatch[2].toLowerCase()
          if (!variantErrorsFromBackend[index]) {
            variantErrorsFromBackend[index] = {}
          }
          variantErrorsFromBackend[index][field] = msg
        }
      })

      const mergedVariantErrors = []
      const maxLen = Math.max(
        formErrors.value.variants?.length || 0,
        variantErrorsFromBackend.length,
      )
      for (let i = 0; i < maxLen; i++) {
        mergedVariantErrors[i] = {
          ...(formErrors.value.variants?.[i] || {}),
          ...(variantErrorsFromBackend[i] || {}),
        }
      }

      formErrors.value = {
        ...formErrors.value,
        _backend: normalized,
        name: normalized['name'] || formErrors.value.name,
        category_id:
          normalized['category_id'] || normalized['categoryid'] || formErrors.value.category_id,
        variants: mergedVariantErrors,
      }

      if (normalized['varients']) {
        formErrors.value._backend = formErrors.value._backend || {}
        formErrors.value._backend.varients = normalized['varients']
      }
      if (normalized['variants']) {
        formErrors.value._backend = formErrors.value._backend || {}
        formErrors.value._backend.variants = normalized['variants']
      }
      toast.warning('Vui lòng kiểm tra lại các trường có lỗi.')
    } else {
      toast.error(err.message || 'Lỗi khi lưu sản phẩm')
    }
  } finally {
    isSaving.value = false
  }
}

const promptDelete = async (product) => {
  try {
    await productsStore.deleteProduct(product)
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
  <LoadingOverlay :show="isStoreLoading" message="Đang xử lý..." />

  <div class="p-4 sm:p-6 rounded-xl shadow-lg bg-white">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-4"
    >
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">Quản lý sản phẩm</h1>
      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <Button
          v-if="hasPermission(Permissions.ProductsCreate)"
          text="Thêm mới"
          :icon="IconPlus"
          color="primary"
          @click="openAddEditModal()"
          class="flex-1 sm:flex-none"
        />
        <label
          v-if="hasPermission(Permissions.ProductsCreate)"
          for="import-product-input"
          class="cursor-pointer flex-1 sm:flex-none min-w-[100px]"
        >
          <Button text="Import" :icon="IconFileImport" color="secondary" as="span" class="w-full justify-center" />
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
          class="flex-1 sm:flex-none min-w-[100px] justify-center"
        />
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <Input
        v-model="searchRefs.search"
        type="text"
        placeholder="Tìm kiếm theo tên sản phẩm..."
        class="flex-1"
      />

      <div class="w-full sm:w-64">
        <select
          v-model="filterRefs.inventoryStatus"
          class="w-full h-11 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 appearance-none cursor-pointer"
          style="
            background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E');
            background-repeat: no-repeat;
            background-position: right 1rem center;
            background-size: 1em;
          "
        >
          <option value="">Tất cả trạng thái kho</option>
          <option v-for="(label, key) in inventoryStatusMap" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
      </div>
    </div>

    <div
      v-if="isError"
      class="text-center py-12 text-red-500 font-medium bg-white rounded-lg shadow-sm border border-gray-200"
    >
      Đã xảy ra lỗi khi lấy dữ liệu: {{ error?.message }}
    </div>

    <div v-else class="rounded-lg shadow-sm border border-gray-300 bg-white">
      <!-- Desktop Table (lg and up) -->
      <div class="hidden lg:block overflow-x-auto">
        <table class="min-w-full bg-white border-collapse">
        <thead
          class="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-medium border-b border-gray-200"
        >
          <tr>
            <th class="py-3 px-6 text-left w-12"></th>
            <th class="py-3 px-6 text-left w-20">Ảnh Bìa</th>
            <th class="py-3 px-6 text-left">Tên Dòng Sản Phẩm</th>
            <th class="py-3 px-6 text-left">Danh Mục</th>
            <th class="py-3 px-6 text-left">Thương Hiệu</th>
            <th class="py-3 px-6 text-left">Số Biến Thể</th>
            <th
              class="py-3 px-6 text-left cursor-pointer hover:bg-gray-100 transition-colors"
              @click="toggleSort('inventoryStatus')"
            >
              <div class="flex items-center space-x-1">
                <span>Trạng Thái Kho</span>
                <div class="flex flex-col">
                  <IconDownArrow
                    class="w-3 h-3 transition-colors"
                    :class="
                      getSortDirection('inventoryStatus') === 'asc'
                        ? 'text-red-500'
                        : 'text-gray-300'
                    "
                    style="transform: rotate(180deg)"
                  />
                  <IconDownArrow
                    class="w-3 h-3 transition-colors -mt-1"
                    :class="
                      getSortDirection('inventoryStatus') === 'desc'
                        ? 'text-red-500'
                        : 'text-gray-300'
                    "
                  />
                </div>
              </div>
            </th>
            <th class="py-3 px-6 text-center">Thao Tác</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <template v-if="products.length === 0">
            <template v-if="isLoading">
              <tr v-for="i in 5" :key="i" class="border-b border-gray-200">
                <td class="py-3 px-6 text-center"><SkeletonLoader width="16px" height="16px" /></td>
                <td class="py-3 px-6">
                  <SkeletonLoader width="64px" height="64px" class="rounded-md" />
                </td>
                <td class="py-3 px-6"><SkeletonLoader width="150px" height="20px" /></td>
                <td class="py-3 px-6"><SkeletonLoader width="100px" height="20px" /></td>
                <td class="py-3 px-6"><SkeletonLoader width="80px" height="20px" /></td>
                <td class="py-3 px-6"><SkeletonLoader width="40px" height="20px" /></td>
                <td class="py-3 px-6">
                  <SkeletonLoader width="90px" height="24px" class="rounded-full" />
                </td>
                <td class="py-3 px-6 text-center flex justify-center gap-2 mt-4">
                  <SkeletonLoader width="40px" height="20px" />
                  <SkeletonLoader width="40px" height="20px" />
                </td>
              </tr>
            </template>
            <tr v-else>
              <td :colspan="numberOfColumns" class="text-center py-6 text-gray-500">
                Không có sản phẩm nào để hiển thị.
              </td>
            </tr>
          </template>

          <template v-for="product in products" :key="product.id">
            <tr class="border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200">
              <td class="py-3 px-6 w-12 text-center border-r border-gray-200">
                <button
                  v-if="product.variants && product.variants.length > 0"
                  @click="toggleDetails(product.id)"
                  class="text-gray-500 hover:text-gray-800"
                >
                  <IconLeftArrow v-if="!isExpanded(product.id)" />
                  <IconDownArrow v-else />
                </button>
              </td>
              <td class="py-3 px-6 text-left w-20">
                <img
                  :src="
                    product.cover_image_url || 'https://placehold.co/100x100/gray/white?text=N/A'
                  "
                  alt="Ảnh bìa"
                  class="w-16 h-16 object-cover rounded-md border border-gray-200"
                  @error="
                    (e) => (e.target.src = 'https://placehold.co/100x100/gray/white?text=Error')
                  "
                />
              </td>
              <td class="py-3 px-6 whitespace-nowrap font-medium text-gray-800">
                {{ product.name }}
              </td>
              <td class="py-3 px-6">{{ product.category }}</td>
              <td class="py-3 px-6">{{ product.brand }}</td>
              <td class="py-3 px-6">{{ product.variants ? product.variants.length : 0 }}</td>
              <td class="py-3 px-6">
                <RoundBadge :color="getInventoryStatusColor(product.inventory_status)">
                  {{ getInventoryStatusLabel(product.inventory_status) }}
                </RoundBadge>
              </td>
              <td class="py-3 px-6 text-center space-x-2">
                <SmallNoBgButton
                  v-if="hasPermission(Permissions.ProductsEdit)"
                  @click="openAddEditModal(product)"
                  :icon="IconEdit"
                  >Sửa</SmallNoBgButton
                >
                <SmallNoBgButton
                  v-if="hasPermission(Permissions.ProductsDelete)"
                  color="red"
                  @click="promptDelete(product)"
                  :icon="IconTrash"
                  >Xóa</SmallNoBgButton
                >
              </td>
            </tr>

            <tr v-if="isExpanded(product.id)" class="bg-gray-50 border-b border-gray-200">
              <td :colspan="numberOfColumns" class="p-0">
                <div class="p-3 px-10 border-t border-gray-200 bg-white">
                  <div class="flex border-b border-gray-200 mb-3 space-x-5">
                    <button
                      class="py-1.5 text-sm"
                      :class="
                        getActiveTab(product.id) === 'variants'
                          ? 'font-semibold border-b-2 border-red-500 text-red-600'
                          : 'text-gray-600 hover:text-gray-800'
                      "
                      @click="setActiveTab(product.id, 'variants')"
                    >
                      Biến thể sản phẩm
                    </button>
                    <button
                      class="py-1.5 text-sm"
                      :class="
                        getActiveTab(product.id) === 'specs'
                          ? 'font-semibold border-b-2 border-red-500 text-red-600'
                          : 'text-gray-600 hover:text-gray-800'
                      "
                      @click="setActiveTab(product.id, 'specs')"
                    >
                      Thông số kỹ thuật
                    </button>
                  </div>

                  <div v-show="getActiveTab(product.id) === 'variants'">
                    <table
                      class="min-w-full bg-white rounded shadow-sm text-sm border border-gray-200 overflow-hidden"
                    >
                      <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th
                            class="py-2 px-4 text-left w-20 text-gray-700 font-semibold tracking-wider"
                          >
                            Ảnh
                          </th>
                          <th
                            class="py-2 px-4 text-left text-gray-700 font-semibold tracking-wider"
                          >
                            Thuộc tính
                          </th>
                          <th
                            class="py-2 px-4 text-left text-gray-700 font-semibold tracking-wider"
                          >
                            Giá Bán
                          </th>
                          <th
                            class="py-2 px-4 text-left text-gray-700 font-semibold tracking-wider"
                          >
                            Tồn Kho
                          </th>
                          <th
                            class="py-2 px-4 text-left text-gray-700 font-semibold tracking-wider"
                          >
                            Đã Đặt
                          </th>
                          <th
                            class="py-2 px-4 text-left text-gray-700 font-semibold tracking-wider"
                          >
                            Hiện Có
                          </th>
                          <th
                            class="py-2 px-4 text-left text-gray-700 font-semibold tracking-wider"
                          >
                            Trạng Thái
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="variant in product.variants"
                          :key="variant.id"
                          class="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td class="py-2 px-4 w-20">
                            <img
                              :src="
                                variant.cover_image_url ||
                                'https://placehold.co/100x100/gray/white?text=N/A'
                              "
                              class="w-12 h-12 object-cover rounded-md border border-gray-200"
                              @error="
                                (e) =>
                                  (e.target.src =
                                    'https://placehold.co/100x100/gray/white?text=Error')
                              "
                            />
                          </td>
                          <td class="py-2 px-4 text-gray-800 font-medium">
                            {{ getVariantOptionsText(variant) }}
                          </td>
                          <td class="py-2 px-4 font-semibold text-gray-900">
                            {{ formatCurrency(variant.price) }}
                          </td>
                          <td class="py-2 px-4 text-gray-600">{{ variant.stock }}</td>
                          <td class="py-2 px-4 text-gray-600">{{ variant.has_been_booked }}</td>
                          <td
                            class="py-2 px-4 font-medium"
                            :class="
                              getInventoryStatusColor(variant.inventory_status) === 'green'
                                ? 'text-green-600'
                                : getInventoryStatusColor(variant.inventory_status) === 'yellow'
                                  ? 'text-yellow-500'
                                  : 'text-red-500'
                            "
                          >
                            {{ variant.stock - variant.has_been_booked }}
                          </td>
                          <td class="py-2 px-4">
                            <RoundBadge :color="getInventoryStatusColor(variant.inventory_status)">
                              {{ getInventoryStatusLabel(variant.inventory_status) }}
                            </RoundBadge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div v-show="getActiveTab(product.id) === 'specs'" class="pt-2">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                      <div class="text-sm">
                        <span class="text-gray-500 block">Khối lượng</span>
                        <span class="font-medium text-gray-800">{{
                          product.weight ? product.weight + ' kg' : '---'
                        }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Kích thước</span>
                        <span class="font-medium text-gray-800">{{
                          product.dimensions || '---'
                        }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Dung tích</span>
                        <span class="font-medium text-gray-800">{{
                          product.displacement ? product.displacement + ' cc' : '---'
                        }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Tỷ số nén</span>
                        <span class="font-medium text-gray-800">{{
                          product.compression_ratio || '---'
                        }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Đường kính x Hành trình piston</span>
                        <span class="font-medium text-gray-800">{{
                          product.bore_stroke || '---'
                        }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Loại động cơ</span>
                        <span class="font-medium text-gray-800">{{
                          product.engine_type || '---'
                        }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Công suất tối đa</span>
                        <span class="font-medium text-gray-800">{{
                          product.max_power || '---'
                        }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Mô-men xoắn cực đại</span>
                        <span class="font-medium text-gray-800">{{
                          product.max_torque || '---'
                        }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Tiêu hao nhiên liệu</span>
                        <span class="font-medium text-gray-800">{{
                          product.fuel_consumption || '---'
                        }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Dung tích bình xăng</span>
                        <span class="font-medium text-gray-800">{{
                          product.fuel_capacity ? product.fuel_capacity + ' L' : '---'
                        }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Dung tích nhớt máy</span>
                        <span class="font-medium text-gray-800">{{
                          product.oil_capacity ? product.oil_capacity + ' L' : '---'
                        }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Loại truyền động</span>
                        <span class="font-medium text-gray-800">{{
                          product.transmission_type || '---'
                        }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Hệ thống khởi động</span>
                        <span class="font-medium text-gray-800">{{
                          product.starter_system || '---'
                        }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Phuộc trước</span>
                        <span class="font-medium text-gray-800">{{
                          product.front_suspension || '---'
                        }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Phuộc sau</span>
                        <span class="font-medium text-gray-800">{{
                          product.rear_suspension || '---'
                        }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Kích cỡ lốp</span>
                        <span class="font-medium text-gray-800">{{
                          product.tire_size || '---'
                        }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Khoảng cách trục bánh xe</span>
                        <span class="font-medium text-gray-800">{{
                          product.wheelbase ? product.wheelbase + ' mm' : '---'
                        }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Độ cao yên</span>
                        <span class="font-medium text-gray-800">{{
                          product.seat_height ? product.seat_height + ' mm' : '---'
                        }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Khoảng sáng gầm xe</span>
                        <span class="font-medium text-gray-800">{{
                          product.ground_clearance ? product.ground_clearance + ' mm' : '---'
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      </div>

      <!-- Mobile List/Cards View (below lg) -->
      <div class="lg:hidden flex flex-col divide-y divide-gray-200">
        <template v-if="products.length === 0">
          <div v-if="isLoading" class="p-4 space-y-4">
            <div v-for="i in 5" :key="`mob-loading-${i}`" class="space-y-3 pb-4 border-b border-gray-100 last:border-0">
              <div class="flex gap-4">
                <SkeletonLoader width="64px" height="64px" class="rounded-md shrink-0" />
                <div class="flex-1 space-y-2 mt-1">
                  <SkeletonLoader width="80%" height="20px" />
                  <SkeletonLoader width="60%" height="20px" />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500 text-sm">
            Không có sản phẩm nào để hiển thị.
          </div>
        </template>
        
        <template v-else>
          <div v-for="product in products" :key="`mobile-${product.id}`" class="p-4 flex flex-col gap-3 bg-white hover:bg-gray-50 transition-colors">
            <div class="flex gap-3 items-start">
              <img
                :src="product.cover_image_url || 'https://placehold.co/100x100/gray/white?text=N/A'"
                alt="Ảnh bìa"
                class="w-16 h-16 object-cover rounded-md border border-gray-200 shrink-0 mt-1"
                @error="(e) => (e.target.src = 'https://placehold.co/100x100/gray/white?text=Error')"
              />
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-800 text-base break-words line-clamp-2 leading-tight mb-1">{{ product.name }}</h3>
                <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
                  <span class="truncate">{{ product.category }}</span>
                  <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span class="truncate">{{ product.brand }}</span>
                </div>
                <div class="mt-2 flex flex-wrap gap-2 items-center">
                  <RoundBadge :color="getInventoryStatusColor(product.inventory_status)" class="text-[10px] sm:text-xs">
                    {{ getInventoryStatusLabel(product.inventory_status) }}
                  </RoundBadge>
                  <span class="text-xs text-gray-500">{{ product.variants ? product.variants.length : 0 }} biến thể</span>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-gray-50 mt-1">
              <button
                v-if="product.variants && product.variants.length > 0"
                @click="toggleDetails(product.id)"
                class="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 py-1.5 px-3 rounded-md"
              >
                <span>Chi tiết</span>
                <IconDownArrow class="ml-1 w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': isExpanded(product.id) }" />
              </button>
              <div v-else></div>
              
              <div class="flex items-center gap-2">
                <SmallNoBgButton v-if="hasPermission(Permissions.ProductsEdit)" @click="openAddEditModal(product)" :icon="IconEdit">Sửa</SmallNoBgButton>
                <SmallNoBgButton v-if="hasPermission(Permissions.ProductsDelete)" color="red" @click="promptDelete(product)" :icon="IconTrash">Xóa</SmallNoBgButton>
              </div>
            </div>

            <div v-if="isExpanded(product.id)" class="bg-gray-50 rounded-lg p-3 mt-1 border border-gray-100 overflow-hidden">
              <div class="flex border-b border-gray-200 mb-3 space-x-3">
                <button
                  class="py-1.5 text-sm flex-1 text-center font-medium transition-colors"
                  :class="getActiveTab(product.id) === 'variants' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500 hover:text-gray-800'"
                  @click="setActiveTab(product.id, 'variants')"
                >
                  Biến thể
                </button>
                <button
                  class="py-1.5 text-sm flex-1 text-center font-medium transition-colors"
                  :class="getActiveTab(product.id) === 'specs' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500 hover:text-gray-800'"
                  @click="setActiveTab(product.id, 'specs')"
                >
                  Thông số
                </button>
              </div>

              <div v-show="getActiveTab(product.id) === 'variants'" class="space-y-3">
                <div v-for="variant in product.variants" :key="`mob-var-${variant.id}`" class="flex gap-3 p-2 bg-white rounded border border-gray-100 shadow-sm relative overflow-hidden">
                  <div class="absolute top-0 right-0 p-1 bg-gray-50 rounded-bl border-l border-b border-gray-100">
                     <RoundBadge :color="getInventoryStatusColor(variant.inventory_status)" class="scale-90 origin-top-right">
                       {{ getInventoryStatusLabel(variant.inventory_status) }}
                     </RoundBadge>
                  </div>
                  <img
                    :src="variant.cover_image_url || 'https://placehold.co/100x100/gray/white?text=N/A'"
                    class="w-14 h-14 object-cover rounded border border-gray-200 mt-1 shrink-0"
                    @error="(e) => (e.target.src = 'https://placehold.co/100x100/gray/white?text=Error')"
                  />
                  <div class="flex-1 min-w-0 pr-16">
                    <div class="font-medium text-gray-800 text-sm mb-0.5 truncate">{{ getVariantOptionsText(variant) }}</div>
                    <div class="font-bold text-red-600 text-sm mb-1">{{ formatCurrency(variant.price) }}</div>
                    <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-500">
                      <div>Tồn kho: <span class="font-medium text-gray-700">{{ variant.stock }}</span></div>
                      <div>Đã đặt: <span class="font-medium text-gray-700">{{ variant.has_been_booked }}</span></div>
                      <div class="col-span-2 text-[11px]">
                         Hiện có: 
                         <span class="font-medium" :class="getInventoryStatusColor(variant.inventory_status) === 'green' ? 'text-green-600' : getInventoryStatusColor(variant.inventory_status) === 'yellow' ? 'text-yellow-500' : 'text-red-500'">
                           {{ variant.stock - variant.has_been_booked }}
                         </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-show="getActiveTab(product.id) === 'specs'" class="grid grid-cols-2 gap-3 text-xs">
                <div class="flex flex-col">
                  <span class="text-gray-500">Khối lượng</span>
                  <span class="font-medium text-gray-800 break-words">{{ product.weight ? product.weight + ' kg' : '---' }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-gray-500">Dung tích</span>
                  <span class="font-medium text-gray-800 break-words">{{ product.displacement ? product.displacement + ' cc' : '---' }}</span>
                </div>
                <div class="flex flex-col col-span-2">
                  <span class="text-gray-500">Kích thước</span>
                  <span class="font-medium text-gray-800 break-words">{{ product.dimensions || '---' }}</span>
                </div>
                <div class="flex flex-col col-span-2">
                  <span class="text-gray-500">Tỷ số nén</span>
                  <span class="font-medium text-gray-800 break-words">{{ product.compression_ratio || '---' }}</span>
                </div>
                <div class="flex flex-col col-span-2">
                  <span class="text-gray-500">Đường kính x Hành trình</span>
                  <span class="font-medium text-gray-800 break-words">{{ product.bore_stroke || '---' }}</span>
                </div>
                <div class="flex flex-col col-span-2">
                  <span class="text-gray-500">Công suất tối đa</span>
                  <span class="font-medium text-gray-800 break-words">{{ product.max_power || '---' }}</span>
                </div>
                <div class="flex flex-col col-span-2">
                  <span class="text-gray-500">Mô-men xoắn</span>
                  <span class="font-medium text-gray-800 break-words">{{ product.max_torque || '---' }}</span>
                </div>
                <div class="flex flex-col col-span-2">
                  <span class="text-gray-500">Mức tiêu thụ</span>
                  <span class="font-medium text-gray-800 break-words">{{ product.fuel_consumption || '---' }}</span>
                </div>
                <div class="flex flex-col col-span-2">
                  <span class="text-gray-500">Lốp xe</span>
                  <span class="font-medium text-gray-800 break-words">{{ product.tire_size || '---' }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="mt-4">
      <Pagination
        :total-pages="pagination.totalPages.value"
        :currentPage="pagination.currentPage.value"
        @update:currentPage="pagination.changePage"
        :loading="isLoading"
      />
    </div>
  </div>

  <DraggableModal
    :key="formModalKey"
    v-if="isFormModalVisible"
    @close="handleCloseFormModal"
    :onRefresh="isEditMode ? handleRefreshForm : undefined"
    :isLoading="isRefreshing"
    width="72vw"
  >
    <template #header>
      <span class="font-bold text-lg">{{ formModalTitle }}</span>
    </template>
    <template #body>
      <ProductForm
        v-model="editableProduct"
        :is-edit-mode="isEditMode"
        :errors="formErrors"
        :is-saving="isSaving"
      />
    </template>
    <template #footer>
      <div class="flex justify-end gap-3 w-full">
        <Button text="Huỷ bỏ" color="gray" @click="handleCloseFormModal" />
        <Button text="Lưu" color="purple" @click="handleSaveProduct" :loading="isSaving" />
      </div>
    </template>
  </DraggableModal>
</template>
