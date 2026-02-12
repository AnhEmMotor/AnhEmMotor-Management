<script setup>
import { ref, computed, watch, onBeforeUnmount, reactive } from 'vue'
import Textarea from '@/components/ui/input/BaseTextarea.vue'
import RoundBadge from '../ui/RoundBadge.vue'
import * as apiSuppliers from '@/api/supplier'
import * as apiProducts from '@/api/product'

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

const supplierSearch = reactive({
  term: '',
  results: [],
  showDropdown: false,
  isLoading: false,
  debounceTimer: null,
})

const productSearch = reactive({
  term: '',
  results: [],
  showDropdown: false,
  isLoading: false,
  debounceTimer: null,
})

const productInputRef = ref(null)
const dropdownStyle = ref({})

const handleSupplierBlur = () => {
  window.setTimeout(() => {
    supplierSearch.showDropdown = false
  }, 200)
}

const handleProductBlur = () => {
  window.setTimeout(() => {
    productSearch.showDropdown = false
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

watch(
  () => supplierSearch.term,
  (newVal) => {
    if (
      newVal &&
      localData.value.supplier &&
      `${localData.value.supplier.name} - ${localData.value.supplier.phone}` === newVal
    ) {
      return
    }
    if (!newVal) {
      localData.value.supplier = null
    }

    supplierSearch.showDropdown = true
    supplierSearch.isLoading = true
    if (supplierSearch.debounceTimer) {
      clearTimeout(supplierSearch.debounceTimer)
    }
    supplierSearch.debounceTimer = window.setTimeout(async () => {
      try {
        supplierSearch.results = await apiSuppliers.searchActiveSuppliers(newVal)
      } catch (error) {
        console.error(error)
        supplierSearch.results = []
      } finally {
        supplierSearch.isLoading = false
      }
    }, 300)
  },
)

watch(
  () => productSearch.term,
  (newVal) => {
    if (!newVal) {
      productSearch.results = []
      productSearch.showDropdown = false
      return
    }
    productSearch.showDropdown = true
    productSearch.isLoading = true
    if (productSearch.debounceTimer) {
      clearTimeout(productSearch.debounceTimer)
    }
    productSearch.debounceTimer = window.setTimeout(async () => {
      try {
        productSearch.results = await apiProducts.searchProductsFlatType(newVal)
      } catch (error) {
        console.error(error)
        productSearch.results = []
      } finally {
        productSearch.isLoading = false
      }
    }, 300)
  },
)

const selectSupplier = (supplier) => {
  localData.value.supplier = { ...supplier }
  supplierSearch.term = `${supplier.name} - ${supplier.phone}`
  supplierSearch.showDropdown = false
}

const clearSupplier = () => {
  localData.value.supplier = null
  supplierSearch.term = ''
}

const addNewProduct = () => {
  emit('addProduct')
  productSearch.term = ''
  productSearch.showDropdown = false
}

const selectProduct = (product) => {
  try {
    const newProduct = {
      id: Date.now() + Math.random(),
      code: product.id,
      name: product.name,
      quantity: 1,
      unitPrice: product.price || 0,
      total: product.price || 0,
    }
    localData.value.products.push(newProduct)
    productSearch.term = ''
    productSearch.showDropdown = false
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
    setTimeout(updateDropdownPosition, 0)
    window.addEventListener('resize', updateDropdownPosition)
    window.addEventListener('scroll', updateDropdownPosition, true)
  } else {
    window.removeEventListener('resize', updateDropdownPosition)
    window.removeEventListener('scroll', updateDropdownPosition, true)
  }
}

watch(() => productSearch.showDropdown, onShowProductDropdown)

const removeProduct = (index) => {
  localData.value.products.splice(index, 1)
}

const calculateProductTotal = (product) => {
  const quantity = Number(product.quantity) || 0
  const unitPrice = Number(product.unitPrice) || 0
  product.total = quantity * unitPrice
}

const totalAmount = computed(() => {
  return localData.value.products.reduce((sum, p) => sum + (p.total || 0), 0)
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
        supplierSearch.term = `${localData.value.supplier.name} - ${localData.value.supplier.phone || ''}`
      } else {
        supplierSearch.term = ''
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
  if (supplierSearch.debounceTimer) {
    clearTimeout(supplierSearch.debounceTimer)
  }
  if (productSearch.debounceTimer) {
    clearTimeout(productSearch.debounceTimer)
  }
  window.removeEventListener('resize', updateDropdownPosition)
  window.removeEventListener('scroll', updateDropdownPosition, true)
})
</script>

<template>
  <div class="flex gap-5">
    <div class="flex-1 overflow-y-auto pr-2.5">
      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 mb-2">Nhà cung cấp</label>
        <div class="relative">
          <div class="relative">
            <input
              v-model="supplierSearch.term"
              @focus="supplierSearch.showDropdown = true"
              @blur="handleSupplierBlur"
              type="text"
              placeholder="Tìm nhà cung cấp"
              class="w-full py-2.5 px-3 border border-gray-300 rounded-md text-sm outline-none transition-colors duration-200"
            />
            <button
              v-if="localData.supplier"
              @click="clearSupplier"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 bg-gray-200 border-none rounded-full w-6 h-6 flex items-center justify-center cursor-pointer text-lg text-gray-500"
            >
              ×
            </button>
          </div>

          <div
            v-if="supplierSearch.showDropdown"
            class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-[300px] overflow-y-auto z-50"
          >
            <div v-if="supplierSearch.isLoading" class="p-3 text-center text-gray-400">
              Đang tìm...
            </div>
            <div
              v-else
              v-for="supplier in supplierSearch.results"
              :key="supplier.id"
              @click="selectSupplier(supplier)"
              class="p-3 cursor-pointer border-b border-gray-100 transition-colors duration-150"
            >
              <div class="font-medium">{{ supplier.name }}</div>
              <div class="text-xs text-gray-500">{{ supplier.id }} - {{ supplier.phone }}</div>
            </div>
            <div
              v-if="!supplierSearch.isLoading && supplierSearch.results.length === 0"
              class="p-3 text-center text-gray-400"
            >
              Không tìm thấy nhà cung cấp
            </div>
          </div>

          <div
            v-if="localData.supplier"
            class="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md"
          >
            <div class="flex items-center gap-2">
              <span class="text-2xl">👤</span>
              <div>
                <div class="font-medium">{{ localData.supplier.name }}</div>
                <div class="text-xs text-gray-500">
                  {{ localData.supplier.id }} - {{ localData.supplier.phone }}
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="props.errors && props.errors.supplier" class="text-red-500 text-xs mt-1">
            {{ props.errors.supplier }}
          </div>
        </div>
      </div>

      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 mb-2">Hàng hoá nhập</label>
        <div class="relative">
          <input
            ref="productInputRef"
            v-model="productSearch.term"
            @input="updateDropdownPosition"
            @focus="productSearch.showDropdown = true"
            @blur="handleProductBlur"
            type="text"
            placeholder="Tìm hàng hóa theo tên...."
            class="w-full py-2.5 px-3 border border-gray-300 rounded-md text-sm outline-none transition-colors duration-200"
          />

          <div
            v-if="productSearch.showDropdown"
            :style="dropdownStyle"
            class="fixed z-50 max-h-[300px] overflow-y-auto bg-white rounded-md border border-[rgba(0,0,0,0.08)] shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
          >
            <div v-if="productSearch.isLoading" class="p-3 text-center text-gray-400">
              Đang tìm...
            </div>
            <div
              v-else
              v-for="product in productSearch.results"
              :key="product.id"
              @click="selectProduct(product)"
              class="p-3 cursor-pointer border-b border-gray-100 transition-colors duration-150"
            >
              <div class="flex items-center gap-3">
                <img
                  :src="product.cover_image_url || 'https://placehold.co/40x40'"
                  alt="product"
                  class="w-10 h-10 rounded object-cover"
                />
                <div class="flex-1">
                  <div class="font-medium">{{ product.name }}</div>
                  <div class="text-xs text-gray-500">
                    {{ product.id }} | Giá: {{ (product.price || 0).toLocaleString() }} | Tồn:
                    {{ product.stock }}
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="
                productSearch.term && !productSearch.isLoading && productSearch.results.length === 0
              "
              @click="addNewProduct"
              class="p-3 cursor-pointer flex items-center gap-2 text-blue-500 font-medium transition-colors duration-150; hover:bg-blue-50"
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

      <div class="mt-5 border border-gray-200 rounded-lg overflow-hidden">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th class="w-12">STT</th>
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
              class="hover:bg-gray-50"
            >
              <td class="text-center">{{ index + 1 }}</td>
              <td>{{ product.name }}</td>
              <td class="text-center">Cái</td>
              <td>
                <input
                  v-model.number="product.quantity"
                  @change="calculateProductTotal(product)"
                  type="number"
                  min="1"
                  class="w-full py-1.5 px-2 border border-gray-300 rounded text-center text-sm outline-none"
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
                  class="w-full py-1.5 px-2 border border-gray-300 rounded text-center text-sm outline-none"
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
                <button
                  @click="removeProduct(index)"
                  class="bg-transparent border-none cursor-pointer text-lg p-1 opacity-60 transition-opacity duration-150"
                  type="button"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="w-[300px] border-l border-gray-200 pl-5 overflow-y-auto">
      <div class="flex justify-between items-center mb-5">
        <h3 class="text-sm font-semibold text-gray-700">Trạng thái</h3>
        <div class="text-sm text-gray-500 py-1">
          <RoundBadge color="yellow">Phiếu tạm</RoundBadge>
        </div>
      </div>

      <div class="flex justify-between items-center mb-5 flex-col items-start gap-1">
        <h3 class="text-sm font-semibold text-gray-700">Tổng giá trị đơn nhập</h3>
        <div class="text-sm text-gray-500 py-1">
          <div class="text-2xl font-bold text-blue-500 break-all">
            {{ totalAmount.toLocaleString() }}
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center mb-5">
        <Textarea v-model="localData.notes" label="Ghi chú" placeholder="Ghi chú" :rows="4" />
      </div>
    </div>
  </div>
</template>
