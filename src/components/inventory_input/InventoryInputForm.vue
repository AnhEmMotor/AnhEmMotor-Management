<script setup>
import { ref, computed, watch, onBeforeUnmount, reactive } from 'vue'
import Textarea from '@/components/ui/input/BaseTextarea.vue'
import RoundBadge from '../ui/RoundBadge.vue'
import { useInputStore } from '@/stores/input.store'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { Permissions } from '@/constants/permissions'
import { usePermission } from '@/composables/usePermission'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
})

const { hasPermission } = usePermission()
const inputStore = useInputStore()

const emit = defineEmits(['update:modelValue', 'addProduct'])

const localData = ref({
  supplier: null,
  products: [],
  notes: '',
})

const isUpdatingFromParent = ref(false)
const emitTimer = ref(null)

const supplierSearch = reactive({
  showDropdown: false,
})

const {
  data: suppliers,
  isLoading: isSuppliersLoading,
  searchRefs: supplierSearchRefs,
  pagination: supplierPagination,
} = usePaginatedQuery({
  queryKey: ['active-suppliers'],
  queryFn: (params) => inputStore.searchSuppliers(params),
  itemsPerPage: 5,
  useLocalPagination: true,
  searchFields: [{ key: 'search', debounce: 400 }],
})

const productSearch = reactive({
  showDropdown: false,
})

const {
  data: products,
  isLoading: isProductsLoading,
  searchRefs: productSearchRefs,
  pagination: productPagination,
} = usePaginatedQuery({
  queryKey: ['variants-lite-for-input'],
  queryFn: (params) => inputStore.searchProducts(params),
  itemsPerPage: 5,
  useLocalPagination: true,
  searchFields: [{ key: 'search', debounce: 400 }],
})

const productInputRef = ref(null)
const supplierInputRef = ref(null)
const dropdownStyle = ref({})
const supplierDropdownStyle = ref({})

const handleSupplierBlur = () => {
  window.setTimeout(() => {
    supplierSearch.showDropdown = false
  }, 300)
}

const handleProductBlur = () => {
  window.setTimeout(() => {
    productSearch.showDropdown = false
  }, 300)
}

const debouncedEmit = (value) => {
  if (emitTimer.value) {
    clearTimeout(emitTimer.value)
  }
  emitTimer.value = window.setTimeout(() => {
    emit('update:modelValue', JSON.parse(JSON.stringify(value)))
  }, 100)
}

const selectSupplier = (supplier) => {
  localData.value.supplier = { ...supplier }
  supplierSearchRefs.search = supplier.name
  supplierSearch.showDropdown = false
}

const clearSupplier = () => {
  localData.value.supplier = null
  supplierSearchRefs.search = ''
}

const selectProduct = (product) => {
  const newProduct = {
    id: Date.now() + Math.random(),
    variantId: product.id,
    code: product.id,
    name: product.displayName || product.name,
    quantity: 1,
    unitPrice: product.price || 0,
    total: product.price || 0,
  }
  localData.value.products.push(newProduct)
  productSearchRefs.search = ''
  productSearch.showDropdown = false
}

const updateDropdownPosition = () => {
  if (!productInputRef.value) return
  const rect = productInputRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    maxHeight: 'none',
    overflowY: 'hidden',
    zIndex: 2000,
  }
}

const updateSupplierDropdownPosition = () => {
  if (!supplierInputRef.value) return
  const rect = supplierInputRef.value.getBoundingClientRect()
  supplierDropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    maxHeight: 'none',
    overflowY: 'hidden',
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

const onShowSupplierDropdown = (val) => {
  if (val) {
    setTimeout(updateSupplierDropdownPosition, 0)
    window.addEventListener('resize', updateSupplierDropdownPosition)
    window.addEventListener('scroll', updateSupplierDropdownPosition, true)
  } else {
    window.removeEventListener('resize', updateSupplierDropdownPosition)
    window.removeEventListener('scroll', updateSupplierDropdownPosition, true)
  }
}

watch(() => productSearch.showDropdown, onShowProductDropdown)
watch(() => supplierSearch.showDropdown, onShowSupplierDropdown)

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
        supplierSearchRefs.search = localData.value.supplier.name
      } else {
        supplierSearchRefs.search = ''
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
  window.removeEventListener('resize', updateDropdownPosition)
  window.removeEventListener('scroll', updateDropdownPosition, true)
})
</script>

<template>
  <div class="flex gap-5 h-full min-h-[600px]">
    <div class="flex-1 flex flex-col min-h-0 pr-2.5">
      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 mb-2">Nhà cung cấp</label>
        <div class="relative">
          <div class="relative">
            <input
              ref="supplierInputRef"
              v-model="supplierSearchRefs.search"
              @focus="supplierSearch.showDropdown = true"
              @input="updateSupplierDropdownPosition"
              @blur="handleSupplierBlur"
              type="text"
              :disabled="!hasPermission(Permissions.InputsEdit) && props.isEditMode"
              placeholder="Tìm nhà cung cấp"
              class="w-full py-2.5 px-3 border border-gray-300 rounded-md text-sm outline-none transition-colors duration-200"
            />
            <button
              v-if="
                localData.supplier && (hasPermission(Permissions.InputsEdit) || !props.isEditMode)
              "
              @click="clearSupplier"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 bg-gray-200 border-none rounded-full w-6 h-6 flex items-center justify-center cursor-pointer text-lg text-gray-500"
            >
              ×
            </button>
          </div>

          <div
            v-if="supplierSearch.showDropdown"
            :style="supplierDropdownStyle"
            class="fixed z-50 max-h-[300px] overflow-y-auto bg-white rounded-md border border-[rgba(0,0,0,0.08)] shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
          >
            <div v-if="isSuppliersLoading" class="p-3 text-center text-gray-400">Đang tìm...</div>
            <div
              v-else
              v-for="supplier in suppliers"
              :key="supplier.id"
              @click="selectSupplier(supplier)"
              class="p-3 cursor-pointer border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50"
            >
              <div class="font-medium">{{ supplier.name }}</div>
              <div class="text-xs text-gray-500">
                {{ supplier.phone || 'N/A' }}{{ supplier.email ? ` | ${supplier.email}` : '' }}
              </div>
            </div>

            <div
              v-if="supplierPagination.totalPages.value > 1"
              class="p-2 border-t border-gray-100 bg-gray-50 flex justify-between items-center sticky bottom-0"
            >
              <button
                @click.stop="supplierPagination.prevPage"
                @mousedown.prevent
                :disabled="supplierPagination.isFirstPage.value"
                class="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 cursor-pointer"
              >
                Trước
              </button>
              <span class="text-xs text-gray-500">
                Trang {{ supplierPagination.currentPage.value }} /
                {{ supplierPagination.totalPages.value }}
              </span>
              <button
                @click.stop="supplierPagination.nextPage"
                @mousedown.prevent
                :disabled="supplierPagination.isLastPage.value"
                class="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 cursor-pointer"
              >
                Sau
              </button>
            </div>

            <div
              v-else-if="!isSuppliersLoading && suppliers.length === 0"
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
                  {{ localData.supplier.phone || 'Chưa có SĐT'
                  }}{{ localData.supplier.email ? ` | ${localData.supplier.email}` : '' }}
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
            v-if="hasPermission(Permissions.InputsEdit) || !props.isEditMode"
            ref="productInputRef"
            v-model="productSearchRefs.search"
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
            class="fixed z-50 bg-white rounded-md border border-[rgba(0,0,0,0.08)] shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
          >
            <div v-if="isProductsLoading" class="p-3 text-center text-gray-400">Đang tìm...</div>
            <div
              v-else
              v-for="product in products"
              :key="product.id"
              @click="selectProduct(product)"
              class="p-3 cursor-pointer border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50"
            >
              <div class="flex items-center gap-3">
                <img
                  :src="product.coverImageUrl || 'https://placehold.co/40x40'"
                  alt="product"
                  class="w-10 h-10 rounded object-cover"
                />
                <div class="flex-1">
                  <div class="font-medium">{{ product.displayName || product.name }}</div>
                  <div class="text-xs text-gray-500">
                    ID: {{ product.id }} | Giá: {{ (product.price || 0).toLocaleString() }}
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="productPagination.totalPages.value > 1"
              class="p-2 border-t border-gray-100 bg-gray-50 flex justify-between items-center sticky bottom-0"
            >
              <button
                @click.stop="productPagination.prevPage"
                @mousedown.prevent
                :disabled="productPagination.isFirstPage.value"
                class="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 cursor-pointer"
              >
                Trước
              </button>
              <span class="text-xs text-gray-500">
                Trang {{ productPagination.currentPage.value }} /
                {{ productPagination.totalPages.value }}
              </span>
              <button
                @click.stop="productPagination.nextPage"
                @mousedown.prevent
                :disabled="productPagination.isLastPage.value"
                class="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 cursor-pointer"
              >
                Sau
              </button>
            </div>

            <div
              v-else-if="productSearchRefs.search && !isProductsLoading && products.length === 0"
              class="p-4 text-center text-gray-400 text-sm"
            >
              Không tìm thấy sản phẩm nào. Vui lòng thêm sản phẩm mới nếu bạn cần thêm sản phẩm này
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

      <div
        class="mt-5 border border-gray-200 rounded-lg overflow-hidden flex-1 flex flex-col min-h-0"
      >
        <div class="overflow-y-auto flex-1 min-h-[300px]">
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="w-12 py-4 px-4 text-center font-semibold text-gray-700">STT</th>
                <th class="py-4 px-4 text-left font-semibold text-gray-700">Tên hàng</th>
                <th class="w-24 py-4 px-4 text-center font-semibold text-gray-700">ĐVT</th>
                <th class="w-32 py-4 px-4 text-center font-semibold text-gray-700">Số lượng</th>
                <th class="w-40 py-4 px-4 text-center font-semibold text-gray-700">Đơn giá</th>
                <th class="w-40 py-4 px-4 text-right font-semibold text-gray-700">Thành tiền</th>
                <th class="w-12 py-4 px-4"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="localData.products.length === 0">
                <td colspan="8" class="text-center py-6 text-gray-400">Chưa có sản phẩm nào</td>
              </tr>
              <tr
                v-for="(product, index) in localData.products"
                :key="product.id"
                class="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <td class="py-4 px-4 text-center text-gray-500">{{ index + 1 }}</td>
                <td class="py-4 px-4 font-medium text-gray-900 leading-relaxed">
                  {{ product.name }}
                </td>
                <td class="py-4 px-4 text-center text-gray-600">Cái</td>
                <td class="py-4 px-4">
                  <input
                    v-model.number="product.quantity"
                    @change="calculateProductTotal(product)"
                    type="number"
                    min="1"
                    :disabled="!hasPermission(Permissions.InputsEdit) && props.isEditMode"
                    class="w-full py-2 px-3 border border-gray-300 rounded-md text-center text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
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
                <td class="py-4 px-4">
                  <input
                    v-model.number="product.unitPrice"
                    @change="calculateProductTotal(product)"
                    type="number"
                    min="0"
                    :disabled="!hasPermission(Permissions.InputsEdit) && props.isEditMode"
                    class="w-full py-2 px-3 border border-gray-300 rounded-md text-center text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
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
                <td class="py-4 px-4 text-right font-semibold text-gray-900">
                  {{ (product.total || 0).toLocaleString() }}
                </td>
                <td class="py-4 px-4 text-center">
                  <button
                    v-if="hasPermission(Permissions.InputsEdit) || !props.isEditMode"
                    @click="removeProduct(index)"
                    class="bg-transparent border-none cursor-pointer text-lg p-1 opacity-40 hover:opacity-100 transition-opacity duration-150 grayscale hover:grayscale-0"
                    type="button"
                    title="Xoá hàng này"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="w-[300px] border-l border-gray-200 pl-5 flex flex-col">
      <div class="flex justify-between items-center mb-5">
        <h3 class="text-sm font-semibold text-gray-700">Trạng thái</h3>
        <div class="text-sm text-gray-500 py-1">
          <RoundBadge
            :color="
              localData.statusId === 'finished'
                ? 'green'
                : localData.statusId === 'cancelled'
                  ? 'red'
                  : 'yellow'
            "
          >
            {{
              localData.statusId === 'finished'
                ? 'Hoàn thành'
                : localData.statusId === 'cancelled'
                  ? 'Đã huỷ'
                  : 'Phiếu tạm'
            }}
          </RoundBadge>
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
        <Textarea
          v-model="localData.notes"
          label="Ghi chú"
          placeholder="Ghi chú"
          :rows="4"
          :disabled="!hasPermission(Permissions.InputsEdit) && props.isEditMode"
        />
      </div>
    </div>
  </div>
</template>
