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

    <div class="overflow-x-auto">
      <table class="table-style">
        <thead class="table-header-style">
          <tr>
            <th class="normal-cell-style w-12"></th>
            <!-- Thêm cột Ảnh Bìa -->
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
            <!-- Cập nhật colspan -->
            <td :colspan="numberOfColumns" class="not-found-text-style">
              Không có sản phẩm nào để hiển thị.
            </td>
          </tr>

          <template v-for="product in filteredProducts" :key="product.id">
            <tr class="table-row-style">
              <td class="normal-cell-style w-12 text-center">
                <button
                  v-if="product.variants.length > 0"
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

              <!-- Thêm ô hiển thị Ảnh Bìa -->
              <td class="normal-cell-style w-20">
                <img
                  :src="product.cover_image || 'https://placehold.co/100x100/gray/white?text=N/A'"
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
              <td class="normal-cell-style">{{ product.variants.length }}</td>
              <td class="normal-cell-style">
                <RoundBadge :color="getAggregateStatusColor(product)">
                  {{ getAggregateStatusText(product) }}
                </RoundBadge>
              </td>
              <td class="center-cell-style space-x-2">
                <BaseSmallNoBgButton @click="openAddEditModal(product)">Sửa</BaseSmallNoBgButton>
                <BaseSmallNoBgButton color="red" @click="promptDelete(product)">
                  Xóa
                </BaseSmallNoBgButton>
              </td>
            </tr>

            <!-- Hàng chi tiết (dropdown) -->
            <tr v-if="isExpanded(product.id)" class="bg-gray-50">
              <!-- Cập nhật colspan -->
              <td :colspan="numberOfColumns" class="p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Cột chi tiết biến thể -->
                  <div>
                    <h4 class="text-sm font-semibold mb-2 text-gray-700">Chi tiết biến thể:</h4>
                    <table class="min-w-full bg-white rounded shadow-inner text-sm">
                      <thead class="bg-gray-100">
                        <tr>
                          <th class="detail-cell-style">Thuộc tính</th>
                          <th class="detail-cell-style">Giá Bán</th>
                          <th class="detail-cell-style">Số Lượng</th>
                          <th class="detail-cell-style">Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="variant in product.variants"
                          :key="variant.id"
                          class="border-b last:border-b-0"
                        >
                          <td class="detail-cell-style text-gray-800">
                            {{ getVariantOptionsText(variant) }}
                          </td>
                          <td class="detail-cell-style">
                            {{ formatCurrency(variant.price) }}
                          </td>
                          <td class="detail-cell-style">{{ variant.quantity }}</td>
                          <td class="detail-cell-style">
                            <RoundBadge :color="getStatusColorClass(variant.quantity)">
                              {{ getStockStatusText(variant.quantity) }}
                            </RoundBadge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Cột thông số kỹ thuật -->
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
                      <!-- Bạn có thể thêm các thông số khác ở đây -->
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
      :total-pages="totalPages"
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
      <ProductForm
        v-model="editableProduct"
        :is-edit-mode="isEditMode"
        :errors="formErrors"
        @update:dirty="isFormDirty = $event"
      />
    </template>
    <template #footer>
      <div class="flex justify-end space-x-2">
        <BaseButton text="Bỏ qua" color="gray" @click="handleCloseFormModal" />
        <BaseButton text="Lưu" color="purple" @click="handleSaveProduct" />
      </div>
    </template>
  </DraggableModal>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue' // Thêm onMounted
import ProductFilterButtons from '@/components/product/ProductFilterButtons.vue'
import ProductForm from '@/components/product/ProductForm.vue'
import BaseButton from '@/components/ui/button/BaseButton.vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'
import BasePagination from '@/components/ui/button/BasePagination.vue'
import BaseSmallNoBgButton from '@/components/ui/button/BaseSmallNoBgButton.vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import { showConfirmation } from '@/composables/confirmation'
import DraggableModal from '@/components/ui/DraggableModal.vue'

// ==== DỮ LIỆU MẪU (ĐÃ CẬP NHẬT TÊN TRƯỜNG TIẾNG ANH) ====
const products = ref([
  {
    id: 'prod_001',
    name: 'Honda Air Blade 160cc',
    category: 'Xe Máy',
    brand: 'Honda',
    description: 'Dòng xe tay ga Air Blade của Honda',
    // === CÁC TRƯỜNG MỚI (TIẾNG ANH) ===
    weight: 114,
    dimensions: '1.902 x 686 x 1.116',
    wheelbase: 1286,
    seat_height: 775,
    ground_clearance: 141,
    fuel_capacity: 4.4,
    tire_size: '90/80-14 M/C 43P / 100/80-14 M/C 48P',
    front_suspension: 'Ống lồng, giảm chấn thủy lực',
    rear_suspension: 'Lò xo trụ, giảm chấn thủy lực',
    engine_type: 'eSP+, 4 kỳ, 1 xy-lanh, làm mát bằng dung dịch',
    max_power: '11,7 mã lực @ 8.500 vòng/phút',
    oil_capacity: 0.8,
    fuel_consumption: '2,31 l/100km',
    transmission_type: 'Tự động, vô cấp',
    starter_system: 'Điện',
    max_torque: '14,6 Nm @ 6.500 vòng/phút',
    displacement: 156.9,
    bore_stroke: '60,0 x 55,5 mm',
    compression_ratio: '12,0:1',
    cover_image: 'https://placehold.co/300x300/EAD9FF/5C2D91?text=AirBlade',
    // Quan trọng: photo_collection là một MẢNG (Array)
    photo_collection: [
      'https://placehold.co/300x300/EAD9FF/5C2D91?text=Img+1',
      'https://placehold.co/300x300/EAD9FF/5C2D91?text=Img+2',
    ],
    // === KẾT THÚC TRƯỜNG MỚI ===
    options: [
      { name: 'Dung tích động cơ', values: '125cc, 160cc' }, // Dù tên là 160cc nhưng vẫn giữ option
      { name: 'Màu sắc', values: 'Đen Mờ, Xanh Xi Măng' },
    ],
    variants: [
      {
        id: 'var_001',
        price: 45000000,
        quantity: 12,
        optionValues: { 'Dung tích động cơ': '125cc', 'Màu sắc': 'Đen Mờ' },
      },
      {
        id: 'var_002',
        price: 45000000,
        quantity: 8,
        optionValues: { 'Dung tích động cơ': '125cc', 'Màu sắc': 'Xanh Xi Măng' },
      },
      {
        id: 'var_003',
        price: 60000000,
        quantity: 5,
        optionValues: { 'Dung tích động cơ': '160cc', 'Màu sắc': 'Đen Mờ' },
      },
    ],
  },
  {
    id: 'prod_002',
    name: 'Mũ Bảo Hiểm Royal M136',
    category: 'Phụ Kiện',
    brand: 'Royal',
    description: 'Mũ bảo hiểm fullface Royal M136',
    // === CÁC TRƯỜNG MỚI (ĐỂ NULL/RỖNG) ===
    weight: 1.5,
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
    cover_image: 'https://placehold.co/300x300/D1FAE5/065F46?text=Royal+M136',
    photo_collection: [],
    // === KẾT THÚC TRƯỜNG MỚI ===
    options: [
      { name: 'Kích cỡ', values: 'M, L, XL' },
      { name: 'Màu sắc', values: 'Đỏ, Trắng' },
    ],
    variants: [
      {
        id: 'var_004',
        price: 550000,
        quantity: 20,
        optionValues: { 'Kích cỡ': 'M', 'Màu sắc': 'Đỏ' },
      },
      {
        id: 'var_005',
        price: 550000,
        quantity: 0,
        optionValues: { 'Kích cỡ': 'L', 'Màu sắc': 'Đỏ' },
      },
      {
        id: 'var_006',
        price: 550000,
        quantity: 15,
        optionValues: { 'Kích cỡ': 'L', 'Màu sắc': 'Trắng' },
      },
    ],
  },
  {
    id: 'prod_003',
    name: 'Dầu Nhớt Castrol',
    category: 'Phụ Tùng',
    brand: 'Castrol',
    description: 'Dầu nhớt Castrol 10W-30 1L',
    cover_image: '',
    photo_collection: [],
    options: [], // Sản phẩm đơn, không có options
    variants: [
      {
        id: 'var_007',
        price: 85000,
        quantity: 3,
        optionValues: {}, // Không có optionValues
      },
    ],
  },
])

// Load data từ LocalStorage khi component được mount
onMounted(() => {
  const savedProducts = localStorage.getItem('products_nested_v2') // Đổi tên key
  if (savedProducts) {
    try {
      const parsed = JSON.parse(savedProducts)
      if (Array.isArray(parsed)) {
        products.value = parsed
      }
    } catch (e) {
      console.error('Lỗi khi parse sản phẩm từ LocalStorage:', e)
      // Nếu lỗi, lưu lại dữ liệu mẫu
      saveProducts()
    }
  } else {
    // Nếu chưa có, lưu dữ liệu mẫu
    saveProducts()
  }
})

// ==== LOGIC BẢNG (TABLE) ====
const expandedProductIds = ref([])
const numberOfColumns = ref(8) // Tăng colspan lên 8 vì thêm cột Ảnh Bìa

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
  const values = Object.entries(variant.optionValues)
  if (values.length === 0) return 'Mặc định'
  return values.map(([key, value]) => `${key}: ${value}`).join(', ')
}

// ==== LOGIC TRẠNG THÁI KHO (STOCK) ====
const LOW_STOCK_THRESHOLD = 10
const stockStatusColors = {
  'in-stock': 'green',
  'low-stock': 'yellow',
  'out-of-stock': 'red',
}
const stockStatusTextMap = {
  'in-stock': 'Còn Hàng',
  'low-stock': 'Sắp Hết',
  'out-of-stock': 'Hết Hàng',
}

const getStockStatus = (quantity) => {
  if (quantity === 0) return 'out-of-stock'
  if (quantity <= LOW_STOCK_THRESHOLD) return 'low-stock'
  return 'in-stock'
}
const getStatusColorClass = (quantity) => {
  return stockStatusColors[getStockStatus(quantity)]
}
const getStockStatusText = (quantity) => {
  return stockStatusTextMap[getStockStatus(quantity)]
}

const getAggregateStockStatus = (product) => {
  const quantities = product.variants.map((v) => v.quantity)
  if (quantities.length === 0) return 'out-of-stock' // Không có biến thể = Hết hàng

  const totalQuantity = quantities.reduce((sum, q) => sum + (q || 0), 0)
  if (totalQuantity === 0) return 'out-of-stock'

  // Nếu TẤT CẢ biến thể đều <= threshold (và > 0)
  if (quantities.every((q) => q > 0 && q <= LOW_STOCK_THRESHOLD)) {
    return 'low-stock'
  }

  // Nếu ít nhất 1 biến thể sắp hết (<= threshold)
  if (quantities.some((q) => q > 0 && q <= LOW_STOCK_THRESHOLD)) {
    return 'low-stock'
  }

  return 'in-stock' // Mặc định là còn hàng
}

const getAggregateStatusColor = (product) => {
  return stockStatusColors[getAggregateStockStatus(product)]
}

const getAggregateStatusText = (product) => {
  return stockStatusTextMap[getAggregateStockStatus(product)]
}

// ==== LOGIC LỌC VÀ TÌM KIẾM ====
const searchTerm = ref('')
const selectedStatuses = ref([])

const filteredProducts = computed(() => {
  let filtered = products.value

  // Lọc theo trạng thái
  if (selectedStatuses.value.length > 0) {
    filtered = filtered.filter((product) =>
      selectedStatuses.value.includes(getAggregateStockStatus(product)),
    )
  }

  // Lọc theo tìm kiếm
  if (searchTerm.value) {
    const lowerSearch = searchTerm.value.toLowerCase()
    filtered = filtered.filter((product) => {
      const inParent =
        product.name.toLowerCase().includes(lowerSearch) ||
        product.category.toLowerCase().includes(lowerSearch) ||
        (product.brand && product.brand.toLowerCase().includes(lowerSearch))

      if (inParent) return true

      // Tìm trong biến thể
      const inVariants = product.variants.some((variant) =>
        getVariantOptionsText(variant).toLowerCase().includes(lowerSearch),
      )

      return inVariants
    })
  }

  return filtered
})

// ==== LOGIC MODAL FORM ====
const isFormModalVisible = ref(false)
const isFormDirty = ref(false) // State mới để theo dõi thay đổi
const formModalTitle = ref('')
const formModalKey = ref(0) // Dùng để reset modal

// === HÀM TẠO SẢN PHẨM MỚI (ĐÃ CẬP NHẬT TÊN TIẾNG ANH) ===
const getNewEmptyProduct = () => {
  return {
    id: null,
    name: '',
    category: '',
    brand: '',
    description: '',

    // === CÁC TRƯỜNG MỚI (TIẾNG ANH) ===
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
    cover_image: '', // String
    photo_collection: [], // Quan trọng: Khởi tạo là MẢNG RỖNG
    // === KẾT THÚC TRƯỜNG MỚI ===

    options: [],
    variants: [
      {
        id: null,
        price: null,
        quantity: null,
        optionValues: {},
      },
    ],
  }
}

const editableProduct = ref(getNewEmptyProduct())
const isEditMode = computed(() => !!editableProduct.value?.id)

// State lỗi validation
const formErrors = ref({
  name: '',
  category: '',
  brand: '',
  variants: [],
})

// Mở Modal (Add/Edit)
const openAddEditModal = (product = null) => {
  // Hàm để thực sự mở
  const openForm = () => {
    formErrors.value = { name: '', category: '', brand: '', variants: [] }

    if (product) {
      // Clone sâu để tránh chỉnh sửa trực tiếp
      editableProduct.value = JSON.parse(JSON.stringify(product))
      formModalTitle.value = 'Chỉnh Sửa Sản Phẩm'
    } else {
      editableProduct.value = getNewEmptyProduct()
      formModalTitle.value = 'Thêm Sản Phẩm Mới'
    }
    isFormDirty.value = false // Reset trạng thái
    formModalKey.value++ // Thay đổi key để reset component ProductForm
    isFormModalVisible.value = true
  }

  // Kiểm tra nếu modal đang mở và có thay đổi
  if (isFormModalVisible.value && isFormDirty.value) {
    showConfirmation(
      'Mở biểu mẫu mới?',
      'Bạn có các thay đổi chưa lưu. Bạn có chắc muốn hủy và mở một biểu mẫu mới không?',
      openForm, // Chỉ gọi openForm nếu xác nhận
    )
  } else {
    openForm() // Mở trực tiếp nếu không có gì
  }
}

// Đóng Modal
const handleCloseFormModal = () => {
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

// ==== LOGIC LƯU (SAVE) VÀ VALIDATION ====
const handleSaveProduct = () => {
  const productData = editableProduct.value // Lấy data từ v-model

  // Reset lỗi
  formErrors.value = { name: '', category: '', brand: '', variants: [] }
  let hasError = false

  // 1. Validate trường chung
  if (!productData.name) {
    formErrors.value.name = 'Vui lòng nhập tên dòng sản phẩm.'
    hasError = true
  }
  if (!productData.category) {
    formErrors.value.category = 'Vui lòng nhập danh mục.'
    hasError = true
  }

  // 2. Validate Biến thể
  const variantErrors = []
  if (!productData.variants || productData.variants.length === 0) {
    // Nếu có option mà không có variant là lỗi
    if (productData.options.length > 0) {
      // Tạm thời có thể bỏ qua lỗi này vì form tự động thêm variant
      console.warn('Sản phẩm có thuộc tính nhưng không có biến thể nào.')
      // hasError = true; // Bật nếu muốn
    }
    // Nếu không có option và cũng không có variant (lỗi data)
    else if (productData.options.length === 0) {
      console.error('Lỗi: Không tìm thấy biến thể mặc định.')
      hasError = true
    }
  }

  // 2a. Validate sản phẩm đơn (không có options)
  if (productData.options.length === 0 && productData.variants[0]) {
    const errors = {}
    if (
      productData.variants[0].price === null ||
      productData.variants[0].price === undefined ||
      productData.variants[0].price === '' ||
      isNaN(productData.variants[0].price) ||
      productData.variants[0].price < 0
    ) {
      errors.price = 'Vui lòng nhập Giá Bán hợp lệ (lớn hơn 0).'
      hasError = true
    }
    variantErrors[0] = errors
  }
  // 2b. Validate sản phẩm có biến thể (có options)
  else if (productData.options.length > 0) {
    const seenCombinations = new Set() // Dùng để check trùng lặp

    productData.variants.forEach((variant, index) => {
      const errors = {}

      // Check giá
      if (
        variant.price === null ||
        variant.price === undefined ||
        variant.price === '' ||
        isNaN(variant.price) ||
        variant.price < 0
      ) {
        errors.price = 'Vui lòng nhập Giá Bán hợp lệ (lớn hơn 0).'
        hasError = true
      }

      // Check đã chọn đủ thuộc tính chưa
      const allOptionsSelected = productData.options.every((opt) => variant.optionValues[opt.name])
      if (!allOptionsSelected) {
        errors.combination = 'Vui lòng chọn đầy đủ thuộc tính.'
        hasError = true
      }

      // Check trùng lặp tổ hợp thuộc tính
      if (allOptionsSelected) {
        // Tạo một "chữ ký" duy nhất cho tổ hợp
        const combinationSignature = JSON.stringify(
          Object.keys(variant.optionValues)
            .sort() // Sắp xếp key để đảm bảo thứ tự
            .reduce((obj, key) => {
              obj[key] = variant.optionValues[key]
              return obj
            }, {}),
        )

        if (seenCombinations.has(combinationSignature)) {
          errors.combination = 'Tổ hợp thuộc tính này bị trùng lặp.'
          hasError = true
        } else {
          seenCombinations.add(combinationSignature)
        }
      }

      variantErrors[index] = errors
    })
  }

  // 3. Hiển thị lỗi nếu có
  if (hasError) {
    formErrors.value.variants = variantErrors
    console.warn('Validation Errors:', formErrors.value)
    return // Dừng, không lưu
  }

  // 4. Tiến hành lưu (Create hoặc Update)
  if (isEditMode.value) {
    // Update
    const index = products.value.findIndex((p) => p.id === productData.id)
    if (index !== -1) {
      products.value[index] = productData
    }
  } else {
    // Create
    productData.id = `prod_${crypto.randomUUID()}`

    // Đảm bảo các variant con cũng có ID
    productData.variants.forEach((v) => {
      if (!v.id) {
        v.id = `var_${crypto.randomUUID()}`
      }
    })
    products.value.unshift(productData) // Thêm vào đầu danh sách
  }

  saveProducts() // Lưu vào LocalStorage
  isFormModalVisible.value = false // Đóng modal
  isFormDirty.value = false // Reset
}

// ==== LOGIC XÓA (DELETE) ====
const promptDelete = async (product) => {
  const title = 'Xác nhận xóa'
  const message = `Bạn có chắc chắn muốn xóa dòng sản phẩm "${product.name}"? 
                   Tất cả ${product.variants.length} biến thể con cũng sẽ bị xóa. 
                   Hành động này không thể hoàn tác.`

  // Sử dụng composable
  const confirmed = await showConfirmation(title, message)
  if (!confirmed) return

  // Tiến hành xóa
  const index = products.value.findIndex((p) => p.id === product.id)
  if (index !== -1) {
    products.value.splice(index, 1)
    saveProducts() // Lưu thay đổi
  }
}

// ==== LƯU VÀO LOCALSTORAGE ====
const saveProducts = () => {
  localStorage.setItem('products_nested_v2', JSON.stringify(products.value))
}

// ==== PAGINATION (GIẢ LẬP) ====
const totalPages = ref(10) // Giả lập tổng số trang
const currentPage = ref(1)
const isLoading = ref(false)

// Giả lập fetch data khi chuyển trang
const fetchDataForPage = () => {
  isLoading.value = true
  console.log(`Đang tải dữ liệu cho trang ${currentPage.value}...`)
  setTimeout(() => {
    isLoading.value = false
    console.log('Tải dữ liệu xong.')
  }, 1000)
}

watch(currentPage, (newPage, oldPage) => {
  if (newPage !== oldPage) {
    fetchDataForPage(newPage)
  }
})

// ==== IMPORT/EXPORT (CHƯA TRIỂN KHAI) ====
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
