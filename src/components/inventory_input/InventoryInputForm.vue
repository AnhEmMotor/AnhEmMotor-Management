<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import BaseTextarea from '@/components/ui/input/BaseTextarea.vue'
import RoundBadge from '../ui/RoundBadge.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'addProduct'])

const localData = ref({
  supplier: null,
  products: [],
  notes: '',
})

const isUpdatingFromParent = ref(false)
const emitTimer = ref(null)

const handleSupplierBlur = () => {
  window.setTimeout(() => {
    showSupplierDropdown.value = false
  }, 200)
}

const handleProductBlur = () => {
  window.setTimeout(() => {
    showProductDropdown.value = false
  }, 200)
}

const debouncedEmit = (value) => {
  if (emitTimer.value) {
    clearTimeout(emitTimer.value)
  }
  emitTimer.value = window.setTimeout(() => {
    emit('update:modelValue', JSON.parse(JSON.stringify(value)))
  }, 100)
}

const allSuppliers = ref([
  { code: 'NCC00001', name: 'NCC ĐỒNG NAI', phone: '0123456789' },
  { code: 'NCC00002', name: 'NCC PHÚ THỌ', phone: '0987654321' },
  { code: 'NCC00003', name: 'NCC QUẢNG NAM', phone: '0123456780' },
])

const allProducts = ref([
  { code: '1233289314912', name: 'Siro đào VINASYRUP 750ml', price: 34800, stock: 5 },
  { code: 'SP000001', name: 'VISION', price: 30000000, stock: 10 },
  { code: 'SP000002', name: 'VARIO', price: 35000000, stock: 5 },
  { code: 'SP001001', name: 'SH Mode 2024', price: 65000000, stock: 8 },
])

const supplierSearchTerm = ref('')
const showSupplierDropdown = ref(false)
const filteredSuppliers = computed(() => {
  if (!supplierSearchTerm.value) return allSuppliers.value
  const term = supplierSearchTerm.value.toLowerCase()
  return allSuppliers.value.filter(
    (s) =>
      s.code.toLowerCase().includes(term) ||
      s.name.toLowerCase().includes(term) ||
      s.phone.includes(term),
  )
})

const productSearchTerm = ref('')
const showProductDropdown = ref(false)
const productInputRef = ref(null)
const dropdownStyle = ref({})
const filteredProducts = computed(() => {
  if (!productSearchTerm.value) return allProducts.value
  const term = productSearchTerm.value.toLowerCase()
  return allProducts.value.filter(
    (p) => p.code.toLowerCase().includes(term) || p.name.toLowerCase().includes(term),
  )
})

const selectSupplier = (supplier) => {
  localData.value.supplier = { ...supplier }
  supplierSearchTerm.value = `${supplier.name} - ${supplier.phone}`
  showSupplierDropdown.value = false
}

const clearSupplier = () => {
  localData.value.supplier = null
  supplierSearchTerm.value = ''
}

const addNewProduct = () => {
  emit('addProduct')
  productSearchTerm.value = ''
  showProductDropdown.value = false
}

const selectProduct = (product) => {
  try {
    const newProduct = {
      id: Date.now() + Math.random(),
      code: product.code,
      name: product.name,
      quantity: 1,
      unitPrice: 1000,
      total: 1000,
    }
    localData.value.products.push(newProduct)
    productSearchTerm.value = ''
    showProductDropdown.value = false
  } catch (error) {
    console.error('Error selecting product:', error)
  }
}

const updateDropdownPosition = () => {
  if (!productInputRef.value) return
  const rect = productInputRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 2000,
  }
}

const onShowProductDropdown = (val) => {
  if (val) {
    // compute position after render
    setTimeout(updateDropdownPosition, 0)
    window.addEventListener('resize', updateDropdownPosition)
    // use capture scroll to recalc when scrolling any ancestor
    window.addEventListener('scroll', updateDropdownPosition, true)
  } else {
    window.removeEventListener('resize', updateDropdownPosition)
    window.removeEventListener('scroll', updateDropdownPosition, true)
  }
}

watch(showProductDropdown, onShowProductDropdown)

const removeProduct = (index) => {
  localData.value.products.splice(index, 1)
}

const calculateProductTotal = (product) => {
  const quantity = Number(product.quantity) || 0
  const unitPrice = Number(product.unitPrice) || 0
  product.total = quantity * unitPrice
}

const totalAmount = computed(() => {
  return localData.value.products.reduce((sum, p) => sum + p.total, 0)
})

watch(
  () => props.modelValue,
  (newVal, oldVal) => {
    if (
      newVal &&
      !isUpdatingFromParent.value &&
      JSON.stringify(newVal) !== JSON.stringify(oldVal)
    ) {
      isUpdatingFromParent.value = true
      localData.value = JSON.parse(JSON.stringify(newVal))
      if (localData.value.supplier) {
        supplierSearchTerm.value = `${localData.value.supplier.name} - ${localData.value.supplier.phone}`
      }

      window.setTimeout(() => {
        isUpdatingFromParent.value = false
      }, 50)
    }
  },
  { immediate: true, deep: true },
)

watch(
  localData,
  (newVal) => {
    if (!isUpdatingFromParent.value) {
      debouncedEmit(newVal)
    }
  },
  { deep: true },
)

onBeforeUnmount(() => {
  if (emitTimer.value) {
    clearTimeout(emitTimer.value)
  }
  // cleanup any listeners attached by dropdown positioning
  window.removeEventListener('resize', updateDropdownPosition)
  window.removeEventListener('scroll', updateDropdownPosition, true)
})
</script>

<template>
  <div class="inventory-input-form">
    <div class="form-main">
      <div class="form-section">
        <label class="form-label">Nhà cung cấp</label>
        <div class="supplier-search-wrapper">
          <div class="relative">
            <input
              v-model="supplierSearchTerm"
              @focus="showSupplierDropdown = true"
              @blur="handleSupplierBlur"
              type="text"
              placeholder="Tìm nhà cung cấp"
              class="search-input"
            />
            <button
              v-if="localData.supplier"
              @click="clearSupplier"
              type="button"
              class="clear-button"
            >
              ×
            </button>
          </div>

          <div v-if="showSupplierDropdown" class="dropdown-menu">
            <div
              v-for="supplier in filteredSuppliers"
              :key="supplier.code"
              @click="selectSupplier(supplier)"
              class="dropdown-item"
            >
              <div class="font-medium">{{ supplier.name }}</div>
              <div class="text-xs text-gray-500">{{ supplier.code }} - {{ supplier.phone }}</div>
            </div>
            <div v-if="filteredSuppliers.length === 0" class="dropdown-empty">
              Không tìm thấy nhà cung cấp
            </div>
          </div>

          <div v-if="localData.supplier" class="selected-supplier">
            <div class="flex items-center gap-2">
              <span class="supplier-icon">👤</span>
              <div>
                <div class="font-medium">{{ localData.supplier.name }}</div>
                <div class="text-xs text-gray-500">
                  {{ localData.supplier.code }} - {{ localData.supplier.phone }}
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="props.errors && props.errors.supplier" class="text-red-500 text-xs mt-1">
            {{ props.errors.supplier }}
          </div>
        </div>
      </div>

      <div class="form-section">
        <label class="form-label">Hàng hoá nhập</label>
        <div class="relative">
          <input
            ref="productInputRef"
            v-model="productSearchTerm"
            @input="updateDropdownPosition"
            @focus="showProductDropdown = true"
            @blur="handleProductBlur"
            type="text"
            placeholder="Tìm hàng hóa theo tên...."
            class="search-input"
          />

          <div v-if="showProductDropdown" :style="dropdownStyle" class="dropdown-menu floating-dropdown">
            <div
              v-for="product in filteredProducts"
              :key="product.code"
              @click="selectProduct(product)"
              class="dropdown-item"
            >
              <div class="flex items-center gap-3">
                <div class="product-icon">📦</div>
                <div class="flex-1">
                  <div class="font-medium">{{ product.name }}</div>
                  <div class="text-xs text-gray-500">
                    {{ product.code }} | Giá: {{ product.price.toLocaleString() }} | Tồn:
                    {{ product.stock }}
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="productSearchTerm && filteredProducts.length === 0"
              @click="addNewProduct"
              class="dropdown-item-add"
            >
              <span class="text-lg">+</span>
              <span>Thêm sản phẩm mới</span>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="props.errors && props.errors.products && props.errors.products.__global"
        class="text-red-500 text-xs mb-2"
      >
        {{ props.errors.products.__global }}
      </div>

      <div class="product-table-section">
        <table class="product-table">
          <thead>
            <tr>
              <th class="w-12">STT</th>
              <th class="w-32">Mã hàng</th>
              <th class="flex-1">Tên hàng</th>
              <th class="w-24">ĐVT</th>
              <th class="w-32">Số lượng</th>
              <th class="w-40">Đơn giá</th>
              <th class="w-40">Thành tiền</th>
              <th class="w-12"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="localData.products.length === 0">
              <td colspan="8" class="text-center py-6 text-gray-400">Chưa có sản phẩm nào</td>
            </tr>
            <tr
              v-for="(product, index) in localData.products"
              :key="product.id"
              class="product-row"
            >
              <td class="text-center">{{ index + 1 }}</td>
              <td>
                <div class="text-blue-600">{{ product.code }}</div>
              </td>
              <td>{{ product.name }}</td>
              <td class="text-center">Cái</td>
              <td>
                <input
                  v-model.number="product.quantity"
                  @change="calculateProductTotal(product)"
                  type="number"
                  min="1"
                  class="quantity-input"
                />
                <div
                  v-if="
                    props.errors &&
                    props.errors.products &&
                    props.errors.products[product.id] &&
                    props.errors.products[product.id].quantity
                  "
                  class="text-red-500 text-xs mt-1"
                >
                  {{ props.errors.products[product.id].quantity }}
                </div>
              </td>
              <td>
                <input
                  v-model.number="product.unitPrice"
                  @change="calculateProductTotal(product)"
                  type="number"
                  min="0"
                  class="price-input"
                />
                <div
                  v-if="
                    props.errors &&
                    props.errors.products &&
                    props.errors.products[product.id] &&
                    props.errors.products[product.id].unitPrice
                  "
                  class="text-red-500 text-xs mt-1"
                >
                  {{ props.errors.products[product.id].unitPrice }}
                </div>
              </td>
              <td class="text-right font-medium">
                {{ (product.total || 0).toLocaleString() }}
              </td>
              <td class="text-center">
                <button @click="removeProduct(index)" class="delete-button" type="button">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="form-sidebar">
      <div class="sidebar-section">
        <h3 class="sidebar-title">Trạng thái</h3>
        <div class="sidebar-content">
          <RoundBadge color="yellow">Phiếu tạm</RoundBadge>
        </div>
      </div>

      <div class="sidebar-section total-section">
        <h3 class="sidebar-title">Tổng giá trị đơn nhập</h3>
        <div class="sidebar-content">
          <div class="total-amount">{{ totalAmount.toLocaleString() }}</div>
        </div>
      </div>

      <div class="sidebar-section">
        <BaseTextarea v-model="localData.notes" label="Ghi chú" placeholder="Ghi chú" :rows="4" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "../../assets/main.css";

.inventory-input-form {
  @apply flex gap-5;
}

.form-main {
  @apply flex-1 overflow-y-auto pr-2.5;
}

.form-sidebar {
  @apply w-[300px] border-l border-gray-200 pl-5 overflow-y-auto;
}

.form-section {
  @apply mb-5;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.supplier-search-wrapper {
  @apply relative;
}

.search-input {
  @apply w-full py-2.5 px-3 border border-gray-300 rounded-md text-sm outline-none transition-colors duration-200;
}

.search-input:focus {
  @apply focus:border-blue-500 focus:ring focus:ring-blue-500/10;
}

.clear-button {
  @apply absolute right-2.5 top-1/2 -translate-y-1/2 bg-gray-200 border-none rounded-full w-6 h-6 flex items-center justify-center cursor-pointer text-lg text-gray-500;
}

.clear-button:hover {
  @apply hover:bg-gray-300;
}

.dropdown-menu {
  @apply absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-[300px] overflow-y-auto z-50;
}

.dropdown-item {
  @apply p-3 cursor-pointer border-b border-gray-100 transition-colors duration-150;
}

.dropdown-item:hover {
  @apply hover:bg-gray-100;
}

.dropdown-item:last-child {
  @apply last:border-b-0;
}

.dropdown-item-add {
  @apply p-3 cursor-pointer flex items-center gap-2 text-blue-500 font-medium transition-colors duration-150;
}

.dropdown-item-add:hover {
  @apply hover:bg-blue-50;
}

.dropdown-empty {
  @apply p-3 text-center text-gray-400;
}

.selected-supplier {
  @apply mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md;
}

.supplier-icon {
  @apply text-2xl;
}

.product-icon {
  @apply text-2xl;
}

.product-table-section {
  @apply mt-5 border border-gray-200 rounded-lg overflow-hidden;
}

.product-table {
  @apply w-full border-collapse text-sm;
}

.product-table thead {
  @apply bg-gray-100;
}

.product-table th {
  @apply py-3 px-2 text-left font-semibold text-gray-700 border-b-2 border-gray-200;
}

.product-table td {
  @apply py-3 px-2 border-b border-gray-100;
}

.product-row:hover {
  @apply hover:bg-gray-50;
}

.quantity-input,
.price-input {
  @apply w-full py-1.5 px-2 border border-gray-300 rounded text-center text-sm outline-none;
}

.quantity-input:focus,
.price-input:focus {
  @apply focus:border-blue-500 focus:ring-2 focus:ring-blue-100;
}

.delete-button {
  @apply bg-transparent border-none cursor-pointer text-lg p-1 opacity-60 transition-opacity duration-150;
}

.delete-button:hover {
  @apply hover:opacity-100;
}

.sidebar-section {
  @apply flex justify-between items-center mb-5;
}

.sidebar-section:last-child {
  @apply last:mb-0;
}

.sidebar-title {
  @apply text-sm font-semibold text-gray-700;
}

.sidebar-content {
  @apply text-sm text-gray-500 py-1;
}

.status-badge {
  @apply inline-block py-1.5 px-3 bg-amber-100 text-amber-800 rounded-md font-medium text-[13px];
}

.total-amount {
  @apply text-2xl font-bold text-blue-500 break-all;
}

.total-section {
  @apply flex-col items-start gap-1;
}

.floating-dropdown {
  position: fixed;
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  overflow-y: auto;
}
</style>
