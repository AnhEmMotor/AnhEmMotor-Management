<template>
  <LoadingOverlay :show="isStoreLoading" message="Đang xoá sản phẩm..." />

  <div class="p-4 sm:p-6 rounded-xl shadow-lg bg-white">
    <div
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0"
    >
      <div>
        <h1 class="text-3xl font-bold text-center text-gray-800">Quản lý sản phẩm</h1>
      </div>
      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
        <Button text="Thêm sản phẩm" icon="fas fa-plus" color="primary" @click="openAddEditModal()" />
        <Button text="Import Excel" icon="fas fa-file-import" color="secondary" @click="importExcel" />
        <Button text="Export" icon="fas fa-file-export" color="secondary" @click="exportExcel" />
        <span class="text-gray-400 mx-4 hidden border-r-2 sm:block" />
        <ProductFilterButtons v-model="selectedStatuses" />
      </div>
    </div>

    <Input
      v-model="searchTerm"
      type="text"
      placeholder="Tìm kiếm (Tên, Danh mục...)"
      class="mb-3"
    />

    <div v-if="isLoading" class="text-center py-10">
      <Spinner />
    </div>

    <div
      v-if="isError"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
      role="alert"
    >
      <strong class="font-bold">Lỗi!</strong>
      <span class="block sm:inline">{{ error.message }}</span>
    </div>

    <div class="overflow-x-auto" v-if="!isLoading">
      <table class="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
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
            <th class="py-3 px-6 text-left">Trạng Thái Kho</th>
            <th class="py-3 px-6 text-center">Thao Tác</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <tr v-if="filteredProducts.length === 0">
            <td :colspan="numberOfColumns" class="text-center py-6 text-gray-500">
              Không có sản phẩm nào để hiển thị.
            </td>
          </tr>

          <template v-for="product in filteredProducts" :key="product.id">
            <tr class="border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200">
              <td class="py-3 px-6 w-12 text-center">
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

              <td class="py-3 px-6 text-left whitespace-nowrap font-medium text-gray-800">
                {{ product.name }}
              </td>
              <td class="py-3 px-6 text-left">{{ product.category }}</td>
              <td class="py-3 px-6 text-left">{{ product.brand }}</td>
              <td class="py-3 px-6 text-left">
                {{ product.variants ? product.variants.length : 0 }}
              </td>
              <td class="py-3 px-6 text-left">
                <RoundBadge :color="getAggregateStatusColor(product.status_stock_id)">
                  {{ getAggregateStatusText(product.status_stock_id) }}
                </RoundBadge>
              </td>
              <td class="py-3 px-6 text-center space-x-2">
                <SmallNoBgButton @click="openAddEditModal(product)">Sửa</SmallNoBgButton>
                <SmallNoBgButton color="red" @click="promptDelete(product)"> Xóa </SmallNoBgButton>
              </td>
            </tr>

            <tr v-if="isExpanded(product.id)" class="bg-gray-50">
              <td :colspan="numberOfColumns" class="p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 class="text-sm font-semibold mb-2 text-gray-700">Chi tiết biến thể:</h4>
                    <table class="min-w-full bg-white rounded shadow-inner text-sm">
                      <thead class="bg-gray-100">
                        <tr>
                          <th class="py-2 px-4 text-left w-20">Ảnh</th>
                          <th class="py-2 px-4 text-left">Thuộc tính</th>
                          <th class="py-2 px-4 text-left">Giá Bán</th>
                          <th class="py-2 px-4 text-left">Tồn Kho (Tổng)</th>
                          <th class="py-2 px-4 text-left">Đã Đặt</th>
                          <th class="py-2 px-4 text-left">Hiện Có</th>
                          <th class="py-2 px-4 text-left">Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="variant in product.variants"
                          :key="variant.id"
                          class="border-b last:border-b-0"
                        >
                          <td class="py-2 px-4 text-left w-20">
                            <img
                              :src="
                                variant.cover_image_url ||
                                'https://placehold.co/100x100/gray/white?text=N/A'
                              "
                              alt="Ảnh biến thể"
                              class="w-12 h-12 object-cover rounded-md border border-gray-200"
                              @error="
                                (e) =>
                                  (e.target.src =
                                    'https://placehold.co/100x100/gray/white?text=Error')
                              "
                            />
                          </td>
                          <td class="py-2 px-4 text-left text-gray-800">
                            {{ getVariantOptionsText(variant) }}
                          </td>
                          <td class="py-2 px-4 text-left">
                            {{ formatCurrency(variant.price) }}
                          </td>

                          <td class="py-2 px-4 text-left">{{ variant.stock }}</td>

                          <td class="py-2 px-4 text-left">{{ variant.has_been_booked }}</td>

                          <td class="py-2 px-4 text-left">
                            {{ variant.stock - variant.has_been_booked }}
                          </td>

                          <td class="py-2 px-4 text-left">
                            <RoundBadge :color="getStatusColorClass(variant.status_stock_id)">
                              {{ getStockStatusText(variant.status_stock_id) }}
                            </RoundBadge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h4 class="text-sm font-semibold mb-2 text-gray-700">Thông số kỹ thuật:</h4>
                    <div class="bg-white rounded shadow-inner p-4 text-sm space-y-2">
                      <div v-if="product.weight">
                        <strong>Khối lượng:</strong> {{ product.weight }} kg
                      </div>
                      <div v-if="product.dimensions">
                        <strong>Kích thước (DxRxC):</strong> {{ product.dimensions }} mm
                      </div>
                      <div v-if="product.displacement">
                        <strong>Dung tích xy-lanh:</strong> {{ product.displacement }} cc
                      </div>
                      <div v-if="product.engine_type">
                        <strong>Loại động cơ:</strong> {{ product.engine_type }}
                      </div>
                      <div v-if="product.fuel_consumption">
                        <strong>Tiêu thụ nhiên liệu:</strong> {{ product.fuel_consumption }}
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
    <Pagination :total-pages="totalPages" v-model:currentPage="currentPage" :loading="isLoading" />
  </div>

  <DraggableModal
    :key="formModalKey"
    v-if="isFormModalVisible"
    @close="handleCloseFormModal"
    width="72vw"
  >
    <template #body>
      <ProductForm
        v-model="editableProduct"
        :is-edit-mode="isEditMode"
        :errors="formErrors"
        :is-saving="isSaving"
      />
    </template>

    <template #footer>
      <Button text="Lưu" color="purple" @click="handleSaveProduct" :loading="isSaving" />
    </template>
  </DraggableModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useProductsStore } from '@/stores/useProductsStore'
import { useRoute, useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import { debounce } from '@/utils/debounceThrottle'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { getProducts } from '@/api/product'
import ProductFilterButtons from '@/components/product/ProductFilterButtons.vue'
import ProductForm from '@/components/product/ProductForm.vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Pagination from '@/components/ui/button/Pagination.vue'
import SmallNoBgButton from '@/components/ui/button/SmallNoBgButton.vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import Spinner from '@/components/ui/Spinner.vue'
import IconLeftArrow from '@/components/icons/IconLeftArrow.vue'
import IconDownArrow from '@/components/icons/IconDownArrow.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import { useToast } from 'vue-toastification'

const productsStore = useProductsStore()
const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const toast = useToast()

const expandedProductIds = ref([])
const numberOfColumns = ref(8)
const isSaving = ref(false)

const itemsPerPage = ref(7)
const page = computed(() => parseInt(route.query.page) || 1)
const searchTerm = ref(route.query.search ? String(route.query.search) : '')
const selectedStatuses = ref(
  route.query.statuses ? String(route.query.statuses).split(',').filter(Boolean) : [],
)

const isStoreLoading = computed(() => productsStore.isLoading)

const querySearch = computed(() => (route.query.search ? String(route.query.search).trim() : ''))
const queryStatuses = computed(() =>
  route.query.statuses ? String(route.query.statuses).split(',').filter(Boolean) : [],
)

function showMessage(text, type = 'success', duration = 3000) {
  if (type === 'error') {
    toast.error(text, { timeout: duration })
  } else {
    toast.success(text, { timeout: duration })
  }
}

const filters = computed(() => ({
  search: querySearch.value,
  statusIds: queryStatuses.value,
}))

const fetchProductsFn = (params) => {
  return getProducts(params)
}

const productDataMapper = (data) => ({
  items: data?.products || [],
  count: data?.totalCount,
})

const {
  items: filteredProducts,
  totalPages,
  isLoading,
  isError,
  error,
} = usePaginatedQuery({
  queryKeyBase: ref('products'),
  filters: filters,
  page: page,
  itemsPerPage: itemsPerPage,
  fetchFn: fetchProductsFn,
  dataMapper: productDataMapper,
})

const isExpanded = (productId) => {
  return expandedProductIds.value.includes(productId)
}

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
  return values.map(([key, value]) => `${key}: ${value}`).join(', ')
}

const stockStatusColors = {
  in_stock: 'green',
  low_in_stock: 'yellow',
  out_of_stock: 'red',
}
const stockStatusTextMap = {
  in_stock: 'Còn Hàng',
  low_in_stock: 'Sắp Hết',
  out_of_stock: 'Hết Hàng',
}

const getStatusColorClass = (status) => {
  return stockStatusColors[status] || 'gray'
}
const getStockStatusText = (status) => {
  return stockStatusTextMap[status] || 'Không rõ'
}

const getAggregateStatusColor = (status) => {
  return stockStatusColors[status] || 'gray'
}

const getAggregateStatusText = (status) => {
  return stockStatusTextMap[status] || 'Không rõ'
}

const debouncedApplyQuery = debounce(() => {
  const qs = { ...route.query }
  if (searchTerm.value && String(searchTerm.value).trim()) {
    qs.search = String(searchTerm.value).trim()
  } else {
    delete qs.search
  }
  if (Array.isArray(selectedStatuses.value) && selectedStatuses.value.length > 0) {
    qs.statuses = selectedStatuses.value.join(',')
  } else {
    delete qs.statuses
  }
  qs.page = 1
  router.replace({ query: qs })
}, 300)

watch(searchTerm, debouncedApplyQuery)
watch(selectedStatuses, debouncedApplyQuery)

watch(
  () => route.query,
  (newQuery) => {
    const qSearch = newQuery.search === undefined ? '' : String(newQuery.search || '')
    if (qSearch !== searchTerm.value) {
      searchTerm.value = qSearch
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
  { immediate: true },
)

const isFormModalVisible = ref(false)
const formModalTitle = ref('')
const formModalKey = ref(0)

const getNewEmptyProduct = () => {
  return {
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
    status_id: 'out-of-business',
    options: [],
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
  }
}

const editableProduct = ref(getNewEmptyProduct())
const isEditMode = computed(() => !!editableProduct.value?.id)

const formErrors = ref({
  name: '',
  category_id: '',
  variants: [],
})

const openAddEditModal = (product = null) => {
  const openForm = () => {
    formErrors.value = { name: '', category_id: '', variants: [] }

    if (product) {
      editableProduct.value = JSON.parse(JSON.stringify(product))
      formModalTitle.value = 'Chỉnh Sửa Sản Phẩm'
    } else {
      editableProduct.value = getNewEmptyProduct()
      formModalTitle.value = 'Thêm Sản Phẩm Mới'
    }
    formModalKey.value++
    isFormModalVisible.value = true
  }
  openForm()
}

const handleCloseFormModal = () => {
  isFormModalVisible.value = false
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

  const variantErrors = []
  if (!productData.variants || productData.variants.length === 0) {
    console.error('Lỗi: Không tìm thấy biến thể mặc định.')
    hasError = true
  }

  if (productData.options.length === 0 && productData.variants[0]) {
    const vErrors = {}
    if (
      productData.variants[0].price === null ||
      isNaN(productData.variants[0].price) ||
      productData.variants[0].price < 0
    ) {
      vErrors.price = 'Vui lòng nhập Giá Bán hợp lệ (lớn hơn 0).'
      hasError = true
    }
    if (!productData.variants[0].url) {
      vErrors.url = 'Vui lòng nhập URL Slug.'
      hasError = true
    }
    variantErrors[0] = vErrors
  } else if (productData.options.length > 0) {
    const seenCombinations = new Set()

    productData.variants.forEach((variant, index) => {
      const vErrors = {}

      if (variant.price === null || isNaN(variant.price) || variant.price < 0) {
        vErrors.price = 'Vui lòng nhập Giá Bán hợp lệ (lớn hơn 0).'
        hasError = true
      }

      if (!variant.url) {
        vErrors.url = 'Vui lòng nhập URL Slug.'
        hasError = true
      }

      const allOptionsSelected = productData.options.every((opt) => variant.optionValues[opt.name])
      if (!allOptionsSelected) {
        vErrors.combination = 'Vui lòng chọn đầy đủ thuộc tính.'
        hasError = true
      }

      if (allOptionsSelected) {
        const combinationSignature = JSON.stringify(
          Object.keys(variant.optionValues)
            .sort()
            .reduce((obj, key) => {
              obj[key] = variant.optionValues[key]
              return obj
            }, {}),
        )

        if (seenCombinations.has(combinationSignature)) {
          vErrors.combination = 'Tổ hợp thuộc tính này bị trùng lặp.'
          hasError = true
        } else {
          seenCombinations.add(combinationSignature)
        }
      }
      variantErrors[index] = vErrors
    })
  }

  errors.variants = variantErrors
  return { hasError, errors }
}

const handleSaveProduct = async () => {
  const productData = editableProduct.value

  const { hasError, errors } = validateProduct(productData)
  formErrors.value = errors

  if (hasError) {
    console.warn('Validation Errors:', formErrors.value)
    return
  }

  isSaving.value = true
  try {
    const isEditing = isEditMode.value
    await productsStore.saveProduct(productData)
    isFormModalVisible.value = false
    await queryClient.invalidateQueries({ queryKey: ['products'] })
    showMessage(isEditing ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công', 'success')
  } catch (error) {
    console.error('Lỗi khi lưu sản phẩm:', error)
    formErrors.value.general = error.message || 'Lỗi từ server. Vui lòng thử lại.'
    showMessage(error.message || 'Lỗi khi lưu sản phẩm', 'error')
  } finally {
    isSaving.value = false
  }
}

const promptDelete = async (product) => {
  try {
    await productsStore.deleteProduct(product)
    await queryClient.invalidateQueries({ queryKey: ['products'] })
    showMessage('Xoá sản phẩm thành công', 'success')
  } catch (error) {
    showMessage(error.message || 'Lỗi khi xoá sản phẩm', 'error')
  }
}

const currentPage = computed({
  get: () => page.value,
  set: (value) => {
    if (value !== page.value) {
      router.replace({ query: { ...route.query, page: value } })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  },
})

const importExcel = () => {
  alert('Chức năng Import Excel chưa được triển khai.')
}
const exportExcel = () => {
  alert('Chức năng Export Excel chưa được triển khai.')
}
</script>
