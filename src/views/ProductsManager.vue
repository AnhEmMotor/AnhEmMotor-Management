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
        <!-- ProductFilterButtons vẫn hoạt động như cũ -->
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
            <!-- Cột mở rộng/thu gọn -->
            <th class="normal-cell-style w-12"></th>
            <!-- Các cột Master (Sản phẩm cha) -->
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
          <!-- Sử dụng <template> để render 2 hàng cho mỗi product -->
          <template v-for="product in filteredProducts" :key="product.id">
            <!-- HÀNG MASTER (SẢN PHẨM CHA) -->
            <tr class="table-row-style">
              <!-- Nút Mở rộng/Thu gọn -->
              <td class="normal-cell-style w-12 text-center">
                <button
                  v-if="product.variants.length > 0"
                  @click="toggleDetails(product.id)"
                  class="text-gray-500 hover:text-gray-800"
                >
                  <!-- Icon Chevron -->
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
              <!-- Thông tin sản phẩm cha -->
              <td class="normal-cell-style whitespace-nowrap font-medium text-gray-800">
                {{ product.name }}
              </td>
              <td class="normal-cell-style">{{ product.category }}</td>
              <td class="normal-cell-style">{{ product.brand }}</td>
              <td class="normal-cell-style">{{ product.variants.length }}</td>
              <td class="normal-cell-style">
                <!-- Trạng thái tổng hợp -->
                <RoundBadge :color="getAggregateStatusColor(product)">
                  {{ getAggregateStatusText(product) }}
                </RoundBadge>
              </td>
              <td class="center-cell-style space-x-2">
                <!-- Nút Sửa/Xóa cho sản phẩm cha -->
                <BaseSmallNoBgButton @click="openAddEditModal(product)">Sửa</BaseSmallNoBgButton>
                <BaseSmallNoBgButton color="red" @click="promptDelete(product)">
                  Xóa
                </BaseSmallNoBgButton>
              </td>
            </tr>

            <!-- HÀNG DETAIL (BẢNG BIẾN THỂ CON) -->
            <tr v-if="isExpanded(product.id)" class="bg-gray-50">
              <td :colspan="numberOfColumns" class="p-4">
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
                      <td class="detail-cell-style">{{ formatCurrency(variant.price) }}</td>
                      <td class="detail-cell-style">{{ variant.quantity }}</td>
                      <td class="detail-cell-style">
                        <RoundBadge :color="getStatusColorClass(variant.quantity)">
                          {{ getStockStatusText(variant.quantity) }}
                        </RoundBadge>
                      </td>
                    </tr>
                  </tbody>
                </table>
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

  <!-- MODAL FORM: Không thay đổi template, chỉ thay đổi logic bên dưới -->
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
      <!-- ProductForm (từ bài trước) sẽ nhận đúng `editableProduct` -->
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
import { ref, watch, computed } from 'vue'
import ProductFilterButtons from '@/components/product/ProductFilterButtons.vue'
import ProductForm from '@/components/product/ProductForm.vue' // Import form mới
import BaseButton from '@/components/ui/button/BaseButton.vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'
import BasePagination from '@/components/ui/button/BasePagination.vue'
import BaseSmallNoBgButton from '@/components/ui/button/BaseSmallNoBgButton.vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import { showConfirmation } from '@/composables/confirmation'
import DraggableModal from '@/components/ui/DraggableModal.vue'

// === CẤU TRÚC DỮ LIỆU MỚI ===
// Dữ liệu mock mới phản ánh cấu trúc lồng nhau (nested)
const products = ref([
  {
    id: 'prod_001',
    name: 'Honda Air Blade',
    category: 'Xe Máy',
    brand: 'Honda',
    description: 'Dòng xe tay ga Air Blade của Honda',
    options: [
      { name: 'Dung tích động cơ', values: '125cc, 160cc' },
      { name: 'Màu sắc', values: 'Đen Mờ, Xanh Xi Măng' },
    ],
    variants: [
      {
        id: 'var_001',
        price: 45000000,
        cost: 40000000,
        quantity: 12,
        optionValues: { 'Dung tích động cơ': '125cc', 'Màu sắc': 'Đen Mờ' },
      },
      {
        id: 'var_002',
        price: 45000000,
        cost: 40000000,
        quantity: 8,
        optionValues: { 'Dung tích động cơ': '125cc', 'Màu sắc': 'Xanh Xi Măng' },
      },
      {
        id: 'var_003',
        price: 60000000,
        cost: 55000000,
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
    options: [
      { name: 'Kích cỡ', values: 'M, L, XL' },
      { name: 'Màu sắc', values: 'Đỏ, Trắng' },
    ],
    variants: [
      {
        id: 'var_004',
        price: 550000,
        cost: 450000,
        quantity: 20,
        optionValues: { 'Kích cỡ': 'M', 'Màu sắc': 'Đỏ' },
      },
      {
        id: 'var_005',
        price: 550000,
        cost: 450000,
        quantity: 0,
        optionValues: { 'Kích cỡ': 'L', 'Màu sắc': 'Đỏ' },
      },
      {
        id: 'var_006',
        price: 550000,
        cost: 450000,
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
    options: [], // Sản phẩm đơn
    variants: [
      // Chỉ có 1 biến thể
      {
        id: 'var_007',
        price: 85000,
        cost: 65000,
        quantity: 3,
        optionValues: {},
      },
    ],
  },
])

// === LOGIC MASTER-DETAIL & BẢNG ===
const expandedProductIds = ref([]) // Lưu ID của các product đang được mở
const numberOfColumns = ref(7) // Tổng số cột của bảng master

const isExpanded = (productId) => {
  return expandedProductIds.value.includes(productId)
}

const toggleDetails = (productId) => {
  const index = expandedProductIds.value.indexOf(productId)
  if (index > -1) {
    expandedProductIds.value.splice(index, 1) // Thu gọn
  } else {
    expandedProductIds.value.push(productId) // Mở rộng
  }
}

// Helper format tiền tệ
const formatCurrency = (value) => {
  if (value === null || value === undefined) return ''
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

// Helper tạo text cho thuộc tính biến thể
const getVariantOptionsText = (variant) => {
  const values = Object.entries(variant.optionValues)
  if (values.length === 0) return 'Mặc định'
  return values.map(([key, value]) => `${key}: ${value}`).join(', ')
}

// === LOGIC TRẠNG THÁI KHO (TỔNG HỢP VÀ CHI TIẾT) ===
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

// Logic cho từng biến thể (như cũ)
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

// Logic TỔNG HỢP cho sản phẩm cha (Master row)
const getAggregateStockStatus = (product) => {
  const quantities = product.variants.map((v) => v.quantity)
  if (quantities.length === 0) return 'out-of-stock'

  const totalQuantity = quantities.reduce((sum, q) => sum + q, 0)
  if (totalQuantity === 0) return 'out-of-stock'

  // Nếu bất kỳ biến thể nào > threshold, coi là "Còn hàng"
  if (quantities.some((q) => q > LOW_STOCK_THRESHOLD)) {
    return 'in-stock'
  }

  // Nếu không có cái nào > threshold, nhưng tổng > 0, coi là "Sắp hết"
  return 'low-stock'
}

const getAggregateStatusColor = (product) => {
  return stockStatusColors[getAggregateStockStatus(product)]
}

const getAggregateStatusText = (product) => {
  return stockStatusTextMap[getAggregateStockStatus(product)]
}

// === LOGIC LỌC VÀ TÌM KIẾM (CẬP NHẬT) ===
const searchTerm = ref('')
const selectedStatuses = ref([]) // Từ ProductFilterButtons

const filteredProducts = computed(() => {
  let filtered = products.value

  // 1. Lọc theo Trạng thái (dùng trạng thái tổng hợp)
  if (selectedStatuses.value.length > 0) {
    filtered = filtered.filter((product) =>
      selectedStatuses.value.includes(getAggregateStockStatus(product)),
    )
  }

  // 2. Lọc theo Tìm kiếm
  if (searchTerm.value) {
    const lowerSearch = searchTerm.value.toLowerCase()
    filtered = filtered.filter((product) => {
      // Tìm ở sản phẩm cha
      const inParent =
        product.name.toLowerCase().includes(lowerSearch) ||
        product.category.toLowerCase().includes(lowerSearch) ||
        (product.brand && product.brand.toLowerCase().includes(lowerSearch))

      if (inParent) return true

      // Tìm ở các biến thể con (ĐÃ BỎ TÌM KIẾM BẰNG CODE)
      const inVariants = product.variants.some((variant) =>
        // Ví dụ: tìm theo thuộc tính
        getVariantOptionsText(variant).toLowerCase().includes(lowerSearch),
      )

      return inVariants
    })
  }

  return filtered
})

// === LOGIC FORM MODAL (CẬP NHẬT) ===
const isFormModalVisible = ref(false)
const isFormDirty = ref(false)
const formModalTitle = ref('')
const formModalKey = ref(0)

// Cấu trúc rỗng mới cho sản phẩm
const getNewEmptyProduct = () => {
  return {
    id: null, // Sẽ có khi ở chế độ Edit (ví dụ: dùng crypto.randomUUID() khi tạo mới)
    name: '',
    category: '',
    brand: '',
    description: '',
    options: [], // Định nghĩa các thuộc tính
    variants: [
      // Biến thể mặc định khi là sản phẩm đơn
      {
        id: null,
        price: null,
        cost: null,
        quantity: null,
        optionValues: {},
      },
    ],
  }
}

const editableProduct = ref(getNewEmptyProduct())
const isEditMode = computed(() => !!editableProduct.value?.id) // Dựa trên ID của cha

// Cấu trúc lỗi validation mới
const formErrors = ref({
  name: '',
  category: '',
  brand: '',
  variants: [], // Mảng các đối tượng lỗi
})

// Mở modal (Logic này giờ đã đúng)
const openAddEditModal = (product = null) => {
  const openForm = () => {
    formErrors.value = { name: '', category: '', brand: '', variants: [] }

    if (product) {
      // Chế độ "Sửa": Clone sâu product cha
      editableProduct.value = JSON.parse(JSON.stringify(product))
      formModalTitle.value = 'Chỉnh Sửa Sản Phẩm'
    } else {
      // Chế độ "Thêm":
      editableProduct.value = getNewEmptyProduct()
      formModalTitle.value = 'Thêm Sản Phẩm Mới'
    }
    isFormDirty.value = false
    formModalKey.value++ // Reset form
    isFormModalVisible.value = true
  }

  if (isFormModalVisible.value && isFormDirty.value) {
    showConfirmation(
      'Mở biểu mẫu mới?',
      'Bạn có các thay đổi chưa lưu. Bạn có chắc muốn hủy và mở một biểu mẫu mới không?',
      openForm,
    )
  } else {
    openForm()
  }
}

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

// Logic Lưu (Logic từ bài trước)
const handleSaveProduct = () => {
  const productData = editableProduct.value

  // Reset errors
  formErrors.value = { name: '', category: '', brand: '', variants: [] }
  let hasError = false

  // a. Validate thông tin chung
  if (!productData.name) {
    formErrors.value.name = 'Vui lòng nhập tên dòng sản phẩm.'
    hasError = true
  }
  if (!productData.category) {
    formErrors.value.category = 'Vui lòng nhập danh mục.'
    hasError = true
  }

  // b. Validate thông tin biến thể
  const variantErrors = []
  if (!productData.variants || productData.variants.length === 0) {
    // Nếu có thuộc tính, bắt buộc phải có ít nhất 1 biến thể
    if (productData.options.length > 0) {
      // Tạm thời chỉ log, có thể thêm lỗi chung
      console.error('Sản phẩm có thuộc tính nhưng không có biến thể nào.')
      hasError = true
    }
    // Nếu không có thuộc tính (sản phẩm đơn) thì lỗi này không áp dụng
    // (Vì logic cũ vẫn check giá của variants[0])
  }

  // Trường hợp sản phẩm đơn (Không có thuộc tính)
  if (productData.options.length === 0 && productData.variants[0]) {
    const errors = {}
    if (
      productData.variants[0].price === null ||
      productData.variants[0].price === undefined ||
      productData.variants[0].price === '' ||
      isNaN(productData.variants[0].price)
    ) {
      errors.price = 'Vui lòng nhập Giá Bán.'
      hasError = true
    }
    variantErrors[0] = errors
  }
  // Trường hợp sản phẩm có biến thể
  else if (productData.options.length > 0) {
    const seenCombinations = new Set() // Dùng để kiểm tra trùng lặp

    productData.variants.forEach((variant, index) => {
      const errors = {}

      // 1. Kiểm tra Giá
      if (
        variant.price === null ||
        variant.price === undefined ||
        variant.price === '' ||
        isNaN(variant.price)
      ) {
        errors.price = 'Vui lòng nhập Giá Bán.'
        hasError = true
      }

      // 2. Kiểm tra đã chọn đủ thuộc tính
      const allOptionsSelected = productData.options.every((opt) => variant.optionValues[opt.name])
      if (!allOptionsSelected) {
        errors.combination = 'Vui lòng chọn đầy đủ thuộc tính.'
        hasError = true
      }

      // 3. Kiểm tra trùng lặp tổ hợp thuộc tính
      if (allOptionsSelected) {
        // Chỉ check trùng khi đã điền đủ
        // Sắp xếp key để đảm bảo thứ tự không ảnh hưởng
        const combinationSignature = JSON.stringify(
          Object.keys(variant.optionValues)
            .sort()
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

  if (hasError) {
    formErrors.value.variants = variantErrors
    return
  }

  // c. Xử lý lưu trữ
  // Trong ứng dụng thực tế, đây là lúc gọi API
  // để lưu 5 bảng CSDL của bạn.

  if (isEditMode.value) {
    // Update
    const index = products.value.findIndex((p) => p.id === productData.id)
    if (index !== -1) {
      products.value[index] = productData
    }
  } else {
    // Add new
    productData.id = `prod_${crypto.randomUUID()}` // Tạo ID mới
    // Gán ID cho các biến thể mới (nếu chúng chưa có)
    productData.variants.forEach((v) => {
      if (!v.id) {
        v.id = `var_${crypto.randomUUID()}`
      }
    })
    products.value.unshift(productData)
  }

  saveProducts()
  isFormModalVisible.value = false
}

// === LOGIC XÓA (CẬP NHẬT) ===
const promptDelete = async (product) => {
  const title = 'Xác nhận xóa'
  // Xóa sản phẩm cha sẽ xóa tất cả biến thể con
  const message = `Bạn có chắc chắn muốn xóa dòng sản phẩm "${product.name}"? 
                   Tất cả ${product.variants.length} biến thể con cũng sẽ bị xóa. 
                   Hành động này không thể hoàn tác.`
  const confirmed = await showConfirmation(title, message)
  if (!confirmed) return

  const index = products.value.findIndex((p) => p.id === product.id)
  if (index !== -1) {
    products.value.splice(index, 1)
    saveProducts()
  }
}

// === LƯU LOCALSTORAGE (CẬP NHẬT) ===
const saveProducts = () => {
  // Lưu cấu trúc lồng nhau mới
  localStorage.setItem('products_nested', JSON.stringify(products.value))
}

// === PHÂN TRANG (Không đổi) ===
const totalPages = ref(10)
const currentPage = ref(1)
const isLoading = ref(false)

const fetchDataForPage = () => {
  isLoading.value = true
  // Trong ứng dụng thực, bạn sẽ fetch dữ liệu theo trang
  // và cập nhật `products.value`
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}

watch(currentPage, (newPage, oldPage) => {
  if (newPage !== oldPage) {
    fetchDataForPage(newPage)
  }
})

// === CÁC HÀM KHÁC (Import/Export) ===
const importExcel = () => {
  // TODO: Logic import Excel
  alert('Chức năng Import Excel chưa được triển khai.')
}
const exportExcel = () => {
  // TODO: Logic export Excel
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
/* Style cho bảng detail con */
.detail-cell-style {
  @apply py-2 px-4 text-left;
}
</style>
