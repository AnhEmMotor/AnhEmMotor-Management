<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import BaseDropdown from '@/components/ui/input/BaseDropdown.vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'
import BaseTextarea from '../ui/input/BaseTextarea.vue'
import BaseButton from '@/components/ui/button/BaseButton.vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  zIndex: { type: Number, default: 100 },
  order: { type: Object, default: null },
})
const emit = defineEmits(['close', 'save', 'activate'])

// local form state inspired by InventoryInputForm
const localData = ref({
  customerName: '',
  products: [],
  notes: '',
})

// Status list (11 statuses) - key/value pairs
const STATUS_LIST = [
  { key: 'pending', text: 'Chờ xác nhận' }, //1
  { key: 'completed', text: 'Đã hoàn thành' }, //2
  { key: 'canceled', text: 'Đã hủy' }, //3
  { key: 'refunding', text: 'Đang hoàn tiền' }, //4
  { key: 'refunded', text: 'Đã hoàn tiền' }, //5
  { key: 'confirmed_cod', text: 'Đã xác nhận (Chờ thanh toán COD)' }, //6
  { key: 'paid_processing', text: 'Đã thanh toán (Chờ xử lý)' }, //7
  { key: 'waiting_deposit', text: 'Chờ đặt cọc' }, //8
  { key: 'deposit_paid', text: 'Đã đặt cọc (Chờ xử lý)' }, //9
  { key: 'delivering', text: 'Đang giao hàng' }, //10
  { key: 'waiting_pickup', text: 'Chờ lấy hàng tại cửa hàng' }, //11
]

const localStatus = ref('pending')

// statuses that lock editing according to the sales workflow
const LOCKED_STATUSES = [
  'confirmed_cod', // 6 - Đã xác nhận (Chờ thanh toán COD)
  'paid_processing', // 7 - Đã thanh toán (Chờ xử lý)
  'deposit_paid', // 9 - Đã đặt cọc (Chờ xử lý)
  'delivering', // 10 - Đang giao hàng
  'waiting_pickup', // 11 - Chờ lấy hàng tại cửa hàng
  'completed',
  'canceled',
  'refunding',
  'refunded',
]

const isLocked = computed(() => {
  // If creating a new order (no props.order) it's not locked
  if (!props.order) return false
  const key = localStatus.value || (props.order.status && props.order.status.key) || 'pending'
  return LOCKED_STATUSES.includes(key)
})

// original status key (when editing) and whether user changed it
const originalStatusKey = computed(() =>
  props.order && props.order.status ? props.order.status.key : null,
)
const statusChanged = computed(() => {
  if (!props.order) return false
  return localStatus.value !== originalStatusKey.value
})

// compute allowed target statuses based on current status key
function allowedStatusOptionsFor(currentKey) {
  // Define allowed transitions per project logic (admin can move forward or to cancel/refund paths)
  const map = {
    pending: ['confirmed_cod', 'paid_processing', 'waiting_deposit', 'canceled'],
    confirmed_cod: ['delivering', 'waiting_pickup', 'completed', 'canceled'],
    paid_processing: ['delivering', 'waiting_pickup', 'completed', 'refunding'],
    waiting_deposit: ['deposit_paid', 'canceled'],
    deposit_paid: ['delivering', 'waiting_pickup', 'completed', 'refunding'],
    delivering: ['completed', 'refunding'],
    waiting_pickup: ['completed', 'refunding'],
    canceled: ['pending'],
    refunding: ['refunded', 'pending'],
    refunded: ['pending'],
    completed: [],
  }
  const allowed = map[currentKey] || []
  // Find current status entry
  const currentEntry = STATUS_LIST.find((s) => s.key === currentKey)
  const result = []
  if (currentEntry) {
    // include current status first and mark it as current in the label
    result.push({ value: currentEntry.key, text: `${currentEntry.text} (Hiện tại)` })
  }
  // Add allowed transitions (excluding current if present)
  STATUS_LIST.forEach((s) => {
    if (s.key !== currentKey && allowed.includes(s.key)) {
      result.push({ value: s.key, text: s.text })
    }
  })
  return result
}

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

// inline validation errors (similar to UserForm.vue)
const errors = ref({
  products: '',
  customerName: '',
})

const filteredProducts = computed(() => {
  if (!productSearchTerm.value) return allProducts.value
  const term = productSearchTerm.value.toLowerCase()
  return allProducts.value.filter(
    (p) => p.code.toLowerCase().includes(term) || p.name.toLowerCase().includes(term),
  )
})

const selectProduct = (product) => {
  if (isLocked.value) {
    // prevent adding when locked
    showProductDropdown.value = false
    return
  }
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

const openProductDropdown = () => {
  if (isLocked.value) return
  showProductDropdown.value = true
}

// when editing an order, initialize localData and status
if (props.order) {
  localData.value.customerName = props.order.customerName || ''
  localData.value.products = (props.order.products || []).map((p) => ({
    id: Date.now() + Math.random(),
    code: p.code || p.name || '',
    name: p.name,
    quantity: p.qty || p.quantity || 1,
    unitPrice: p.price || p.unitPrice || 0,
    total: (p.price || p.unitPrice || 0) * (p.qty || p.quantity || 1),
  }))
  localData.value.notes = props.order.notes || ''
  localStatus.value = (props.order.status && props.order.status.key) || 'pending'
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
      errors.value.products = ''
      errors.value.customerName = ''
    }
  },
)

// clear product error when user adds/removes products
watch(
  () => localData.value.products.length,
  (len) => {
    if (len > 0) errors.value.products = ''
  },
)

watch(
  () => localData.value.customerName,
  (val) => {
    if (val && val.trim() !== '') errors.value.customerName = ''
  },
)

function submit() {
  if (!localData.value.customerName) {
    errors.value.customerName = 'Vui lòng nhập tên khách hàng'
    return
  }
  // Require at least one product when creating a new order.
  // When editing, disallow saving if the product list is emptied (user
  // removed all products) unless the user only changed the status.
  if (localData.value.products.length === 0) {
    if (!props.order) {
      errors.value.products = 'Vui lòng thêm ít nhất 1 sản phẩm'
      return
    }
    // props.order exists (editing) — allow only if the user changed status
    // and did not remove products intentionally. If products are empty and
    // status wasn't changed, show validation error.
    if (!statusChanged.value) {
      errors.value.products = 'Đơn hàng phải có ít nhất 1 sản phẩm'
      return
    }
    // if statusChanged is true we allow saving (status-only change)
  }

  const statusEntry = STATUS_LIST.find((s) => s.key === localStatus.value) || STATUS_LIST[0]
  const payload = {
    id: props.order ? props.order.id : undefined,
    customerName: localData.value.customerName,
    products: JSON.parse(JSON.stringify(localData.value.products)),
    total: totalAmount.value,
    notes: localData.value.notes,
    // Emit a full status object so parent (OrdersManager) can decide how to
    // persist / map colors. This makes switching to API calls easier later.
    status: props.order
      ? { key: localStatus.value, text: statusEntry.text }
      : { key: 'pending', text: STATUS_LIST.find((s) => s.key === 'pending').text },
    createdAt: props.order ? props.order.date : new Date().toISOString(),
  }
  // debug: trace submit attempts
  console.debug('[OrderForm] submit payload:', payload)

  emit('save', payload)
  // also request the parent to close the modal immediately
  emit('close')
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
        <div
          v-if="isLocked"
          class="p-3 rounded bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-800"
        >
          Đơn hàng đang ở trạng thái
          <strong>{{ STATUS_LIST.find((s) => s.key === localStatus)?.text || localStatus }}</strong>
          nên hầu hết các trường bị khoá. Bạn vẫn có thể thay đổi "Trạng thái" và nhấn Lưu.
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Tên khách hàng</label>
          <BaseInput v-model="localData.customerName" :error="errors.customerName" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Thêm sản phẩm</label>
          <div class="relative">
            <BaseInput
              ref="productInputRef"
              v-model="productSearchTerm"
              @input="updateDropdownPosition"
              @focus="openProductDropdown"
              @blur="handleProductBlur"
              :disabled="isLocked"
              placeholder="Tìm hàng hóa theo tên...."
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
          <p v-if="errors.products" class="mt-1 text-sm text-red-500">{{ errors.products }}</p>
        </div>

        <!-- Status dropdown (only when editing an existing order) -->
        <div v-if="props.order">
          <label class="block text-sm font-medium mb-1">Trạng thái đơn</label>
          <BaseDropdown
            v-model="localStatus"
            :options="allowedStatusOptionsFor(localStatus)"
            placeholder="Chọn trạng thái"
            :disabled="isLocked"
          />
        </div>

        <div class="product-table-section">
          <table class="product-table w-full text-sm bg-white rounded-md overflow-hidden shadow-sm">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-12">STT</th>
                <th class="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-28">Mã</th>
                <th class="py-2 px-3 text-left text-xs font-semibold text-gray-600">Tên</th>
                <th class="py-2 px-3 text-right text-xs font-semibold text-gray-600 w-24">
                  Số lượng
                </th>
                <th class="py-2 px-3 text-right text-xs font-semibold text-gray-600 w-44">
                  Đơn giá
                </th>
                <th class="py-2 px-3 text-right text-xs font-semibold text-gray-600 w-40">
                  Thành tiền
                </th>
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
                  <BaseInput
                    v-model.number="p.quantity"
                    @change="calculateProductTotal(p)"
                    type="number"
                    min="1"
                    :disabled="isLocked"
                    class="quantity-input"
                  />
                </td>
                <td class="py-2 px-3 text-right">
                  <BaseInput
                    v-model.number="p.unitPrice"
                    @change="calculateProductTotal(p)"
                    type="number"
                    min="0"
                    :disabled="isLocked"
                    class="price-input"
                  />
                </td>
                <td class="py-2 px-3 text-right font-medium text-gray-800">
                  {{ (p.total || 0).toLocaleString('vi-VN') }}
                </td>
                <td class="py-2 px-3 text-center">
                  <BaseSmallNoBgButton
                    v-if="!isLocked"
                    @click="removeProduct(idx)"
                    title="Xóa sản phẩm"
                  >
                    🗑️
                  </BaseSmallNoBgButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Ghi chú</label>
          <BaseTextarea v-model="localData.notes" :disabled="isLocked" rows="3" />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <div class="text-sm font-semibold">Tổng: {{ totalAmount.toLocaleString() }} VNĐ</div>
        <div class="flex gap-2">
          <BaseButton text="Huỷ" color="gray" @click="$emit('close')" />
          <BaseButton
            :text="props.order ? 'Lưu' : 'Tạo đơn'"
            color="primary"
            @click="submit"
            :disabled="isLocked && !statusChanged"
          />
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
  /* keep spacing on the wrapper but remove border so we don't get double borders
     (BaseInput already renders the input's own border). We only use the wrapper
     to control width/alignment for the table layout. */
  @apply py-1 px-2 text-center bg-transparent;
}
.quantity-input input {
  @apply text-center;
}
.price-input input {
  @apply text-right;
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

.quantity-input {
  @apply w-16;
}
.price-input {
  @apply w-36;
}
.dropdown-item {
  @apply p-3 cursor-pointer border-b border-gray-100;
}
.dropdown-item .product-icon {
  @apply mr-3;
}
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
