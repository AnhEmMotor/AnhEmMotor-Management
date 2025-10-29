<template>
  <div class="box-style">
    <div class="content-box-style">
      <div>
        <h1 class="title-style">Quản lý sản phẩm</h1>
      </div>
      <div class="action-button-style">
        <BaseButton text="Thêm sản phẩm" color="purple" @click="openAddEditModal()" />
        <BaseButton text="Import Excel" color="blue" @click="importExcel" />
        <BaseButton text="Export" color="green" @click="exportExcel" />
        <span class="text-gray-400 mx-4 hidden border-r-2 sm:block" />

        <ProductFilterButtons v-model="selectedStatuses" />
      </div>
    </div>

    <BaseInput
      v-model="searchTerm"
      type="text"
      placeholder="Tìm kiếm (Tên, Danh mục...)"
      class="mb-3"
    />

    <div v-if="isLoading" class="text-center py-10">
      <svg
        class="animate-spin h-8 w-8 text-purple-600 mx-auto"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p class="text-gray-600 mt-2">Đang tải dữ liệu...</p>
    </div>

    <div
      v-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
      role="alert"
    >
      <strong class="font-bold">Lỗi!</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <div class="overflow-x-auto" v-if="!isLoading && !error">
      <table class="table-style">
        <thead class="table-header-style">
          <tr>
            <th class="normal-cell-style w-12"></th>
            <th class="normal-cell-style w-20">Ảnh Bìa</th>
            <th class="normal-cell-style">Tên Dòng Sản Phẩm</th>
            <th class="normal-cell-style">Danh Mục</th>
            <th class="normal-cell-style">Thương Hiệu</th>
            <th class="normal-cell-style">Số Biến Thể</th>
            <th class="normal-cell-style">Trạng Thái Kho</th>
            <th class="center-cell-style">Thao Tác</th>
          </tr>
        </thead>
        <tbody class="table-body-style">
          <tr v-if="filteredProducts.length === 0">
            <td :colspan="numberOfColumns" class="not-found-text-style">
              Không có sản phẩm nào để hiển thị.
            </td>
          </tr>

          <template v-for="product in filteredProducts" :key="product.id">
            <tr class="table-row-style">
              <td class="normal-cell-style w-12 text-center">
                <button
                  v-if="product.variants && product.variants.length > 0"
                  @click="toggleDetails(product.id)"
                  class="text-gray-500 hover:text-gray-800"
                >
                  <svg
                    v-if="!isExpanded(product.id)"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </td>

              <td class="normal-cell-style w-20">
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

              <td class="normal-cell-style whitespace-nowrap font-medium text-gray-800">
                {{ product.name }}
              </td>
              <td class="normal-cell-style">{{ product.category }}</td>
              <td class="normal-cell-style">{{ product.brand }}</td>
              <td class="normal-cell-style">
                {{ product.variants ? product.variants.length : 0 }}
              </td>
              <td class="normal-cell-style">
                <RoundBadge :color="getAggregateStatusColor(product.status_stock_id)">
                  {{ getAggregateStatusText(product.status_stock_id) }}
                </RoundBadge>
              </td>
              <td class="center-cell-style space-x-2">
                <BaseSmallNoBgButton @click="openAddEditModal(product)">Sửa</BaseSmallNoBgButton>
                <BaseSmallNoBgButton color="red" @click="promptDelete(product)">
                  Xóa
                </BaseSmallNoBgButton>
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
                          <th class="detail-cell-style w-20">Ảnh</th>
                          <th class="detail-cell-style">Thuộc tính</th>
                          <th class="detail-cell-style">Giá Bán</th>
                          <th class="detail-cell-style">Tồn Kho (Tổng)</th>
                          <th class="detail-cell-style">Đã Đặt</th>
                          <th class="detail-cell-style">Hiện Có</th>
                          <th class="detail-cell-style">Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="variant in product.variants"
                          :key="variant.id"
                          class="border-b last:border-b-0"
                        >
                          <td class="detail-cell-style w-20">
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
                          <td class="detail-cell-style text-gray-800">
                            {{ getVariantOptionsText(variant) }}
                          </td>
                          <td class="detail-cell-style">
                            {{ formatCurrency(variant.price) }}
                          </td>

                          <td class="detail-cell-style">{{ variant.stock }}</td>

                          <td class="detail-cell-style">{{ variant.has_been_booked }}</td>

                          <td class="detail-cell-style">
                            {{ variant.stock - variant.has_been_booked }}
                          </td>

                          <td class="detail-cell-style">
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
    <BasePagination
      :total-pages="pagination.totalPages"
      v-model:currentPage="currentPage"
      :loading="isLoading"
    />
  </div>

  <DraggableModal
    :key="formModalKey"
    v-if="isFormModalVisible"
    @close="handleCloseFormModal"
    width="72vw"
  >
    <template #header>
      <h2 class="font-bold text-lg">{{ formModalTitle }}</h2>
    </template>
    <template #body>
      <ProductForm v-model="editableProduct" :is-edit-mode="isEditMode" :errors="formErrors" />
    </template>
    <template #footer>
      <div class="flex justify-end space-x-2">
        <BaseButton text="Bỏ qua" color="gray" @click="handleCloseFormModal" />
        <BaseButton text="Lưu" color="purple" @click="handleSaveProduct" :loading="isSaving" />
      </div>
    </template>
  </DraggableModal>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { debounce } from 'lodash-es'
import ProductFilterButtons from '@/components/product/ProductFilterButtons.vue'
import ProductForm from '@/components/product/ProductForm.vue'
import BaseButton from '@/components/ui/button/BaseButton.vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'
import BasePagination from '@/components/ui/button/BasePagination.vue'
import BaseSmallNoBgButton from '@/components/ui/button/BaseSmallNoBgButton.vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'

const store = useStore()

const expandedProductIds = ref([])
const numberOfColumns = ref(8)

const filteredProducts = computed(() => store.getters['products/allProducts'])
const isLoading = computed(() => store.getters['products/isLoading'])
const isSaving = ref(false)
const error = computed(() => store.getters['products/error'])
const pagination = computed(() => store.getters['products/pagination'])

onMounted(() => {
  store.dispatch('products/fetchProducts')
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

const searchTerm = ref(store.getters['products/filters'].search)
const selectedStatuses = ref(store.getters['products/filters'].statusIds)

const debouncedFetch = debounce(() => {
  store.dispatch('products/updateFilters', {
    search: searchTerm.value,
    statusIds: selectedStatuses.value,
  })
}, 300)

watch(searchTerm, debouncedFetch)
watch(selectedStatuses, debouncedFetch)

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
    await store.dispatch('products/saveProduct', productData)
    isFormModalVisible.value = false
  } catch (error) {
    console.error('Lỗi khi lưu sản phẩm:', error)
    formErrors.value.general = error.message || 'Lỗi từ server. Vui lòng thử lại.'
  } finally {
    isSaving.value = false
  }
}

const promptDelete = async (product) => {
  await store.dispatch('products/deleteProduct', product)
}

const currentPage = computed({
  get: () => pagination.value.page,
  set: (value) => {
    store.dispatch('products/changePage', value)
  },
})

const importExcel = () => {
  alert('Chức năng Import Excel chưa được triển khai.')
}
const exportExcel = () => {
  alert('Chức năng Export Excel chưa được triển khai.')
}
</script>

<style scoped>
@reference "../assets/main.css";
.box-style {
  @apply bg-gray-100 p-4 sm:p-6 rounded-xl shadow-lg;
}
.title-style {
  @apply text-3xl font-bold text-center text-gray-800;
}
.content-box-style {
  @apply flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0;
}
.action-button-style {
  @apply flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto;
}
.normal-cell-style {
  @apply py-3 px-6 text-left;
}
.center-cell-style {
  @apply py-3 px-6 text-center;
}
.table-style {
  @apply min-w-full bg-white rounded-lg overflow-hidden shadow-sm;
}
.table-header-style {
  @apply bg-gray-200 text-gray-600 uppercase text-sm leading-normal;
}
.table-body-style {
  @apply text-gray-600 text-sm font-light;
}
.not-found-text-style {
  @apply text-center py-6 text-gray-500;
}
.table-row-style {
  @apply border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200;
}
.detail-cell-style {
  @apply py-2 px-4 text-left;
}
</style>
