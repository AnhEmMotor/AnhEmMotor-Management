<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  zIndex: { type: Number, default: 100 },
})
const emit = defineEmits(['close', 'save', 'activate'])

// local form state inspired by InventoryInputForm
const localData = ref({
  customerName: '',
  products: [],
  notes: '',
})

const allProducts = ref([
  { code: 'SP000001', name: 'VISION', price: 30000000, stock: 10 },
  { code: 'SP000002', name: 'VARIO', price: 35000000, stock: 5 },
  { code: 'SP001001', name: 'SH Mode 2024', price: 65000000, stock: 8 },
  { code: '1233289314912', name: 'Siro đào VINASYRUP 750ml', price: 34800, stock: 5 },
])

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

const selectProduct = (product) => {
  const newProduct = {
    id: Date.now() + Math.random(),
    code: product.code,
    name: product.name,
    quantity: 1,
    unitPrice: product.price || 0,
    total: product.price || 0,
  }
  localData.value.products.push(newProduct)
  productSearchTerm.value = ''
  showProductDropdown.value = false
}

const handleProductBlur = () => {
  // delay hiding to allow clicks on dropdown items to register
  window.setTimeout(() => {
    showProductDropdown.value = false
  }, 200)
}

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

watch(showProductDropdown, onShowProductDropdown)

watch(
  () => props.show,
  (val) => {
    if (!val) {
      // reset form
      localData.value = { customerName: '', products: [], notes: '' }
      productSearchTerm.value = ''
      showProductDropdown.value = false
    }
  },
)

function submit() {
  if (!localData.value.customerName) {
    alert('Vui lòng nhập tên khách hàng')
    return
  }
  if (localData.value.products.length === 0) {
    alert('Vui lòng thêm ít nhất 1 sản phẩm')
    return
  }
  const payload = {
    customerName: localData.value.customerName,
    products: JSON.parse(JSON.stringify(localData.value.products)),
    total: totalAmount.value,
    notes: localData.value.notes,
    createdAt: new Date().toISOString(),
  }
  emit('save', payload)
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDropdownPosition)
  window.removeEventListener('scroll', updateDropdownPosition, true)
})
</script>

<template>
  <DraggableModal
    v-if="show"
    :zIndex="zIndex"
    @close="$emit('close')"
    @activate="$emit('activate')"
    width="40vw"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-semibold">Tạo Đơn Mới</h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Tên khách hàng</label>
          <input v-model="localData.customerName" class="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Thêm sản phẩm</label>
          <div class="relative">
            <input
              ref="productInputRef"
              v-model="productSearchTerm"
              @input="updateDropdownPosition"
              @focus="showProductDropdown = true"
              @blur="handleProductBlur"
              type="text"
              placeholder="Tìm hàng hóa theo tên...."
              class="search-input w-full"
            />

            <div
              v-if="showProductDropdown"
              :style="dropdownStyle"
              class="dropdown-menu floating-dropdown"
            >
              <div
                v-for="product in filteredProducts"
                :key="product.code"
                @mousedown.prevent="selectProduct(product)"
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
            </div>
          </div>
        </div>

        <div class="product-table-section">
          <table class="product-table w-full text-sm bg-white rounded-md overflow-hidden shadow-sm">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-12">STT</th>
                <th class="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-28">Mã</th>
                <th class="py-2 px-3 text-left text-xs font-semibold text-gray-600">Tên</th>
                <th class="py-2 px-3 text-right text-xs font-semibold text-gray-600 w-24">Số lượng</th>
                <th class="py-2 px-3 text-right text-xs font-semibold text-gray-600 w-44">Đơn giá</th>
                <th class="py-2 px-3 text-right text-xs font-semibold text-gray-600 w-40">Thành tiền</th>
                <th class="py-2 px-3 text-center text-xs font-semibold text-gray-600 w-12"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="localData.products.length === 0">
                <td colspan="7" class="text-center py-6 text-gray-400">Chưa có sản phẩm nào</td>
              </tr>
              <tr
                v-for="(p, idx) in localData.products"
                :key="p.id"
                class="product-row even:bg-gray-50"
              >
                <td class="py-2 px-3 text-sm text-gray-700">{{ idx + 1 }}</td>
                <td class="py-2 px-3 text-sm text-gray-700">{{ p.code }}</td>
                <td class="py-2 px-3 text-sm text-gray-700">{{ p.name }}</td>
                <td class="py-2 px-3 text-right">
                  <input
                    v-model.number="p.quantity"
                    @change="calculateProductTotal(p)"
                    type="number"
                    min="1"
                    class="quantity-input"
                  />
                </td>
                <td class="py-2 px-3 text-right">
                  <input
                    v-model.number="p.unitPrice"
                    @change="calculateProductTotal(p)"
                    type="number"
                    min="0"
                    class="price-input"
                  />
                </td>
                <td class="py-2 px-3 text-right font-medium text-gray-800">
                  {{ (p.total || 0).toLocaleString('vi-VN') }}
                </td>
                <td class="py-2 px-3 text-center">
                  <button @click="removeProduct(idx)" class="delete-button" title="Xóa sản phẩm">
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Ghi chú</label>
          <textarea
            v-model="localData.notes"
            class="w-full border rounded px-3 py-2"
            rows="3"
          ></textarea>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <div class="text-sm font-semibold">Tổng: {{ totalAmount.toLocaleString() }} VNĐ</div>
        <div class="flex gap-2">
          <button class="px-4 py-2 border rounded" @click="$emit('close')">Huỷ</button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="submit">Tạo đơn</button>
        </div>
      </div>
    </template>
  </DraggableModal>
</template>

<style scoped>
@reference "../../assets/main.css";

.search-input {
  @apply w-full py-2 px-3 border border-gray-300 rounded-md;
}
.quantity-input,
.price-input {
  @apply py-1 px-2 border rounded text-center bg-white;
}
.delete-button {
  @apply bg-transparent border-none cursor-pointer text-lg opacity-80 hover:opacity-100;
}
.floating-dropdown {
  position: fixed;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

.quantity-input { @apply w-16 }
.price-input { @apply w-36 }
.dropdown-item { @apply p-3 cursor-pointer border-b border-gray-100 }
.dropdown-item .product-icon { @apply mr-3 }
.product-table {
  border-collapse: collapse;
}
.product-table th,
.product-table td {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}
.product-row:hover {
  background: rgba(59, 130, 246, 0.03);
}
.DraggableModalFooter {
  display: flex;
}
</style>
