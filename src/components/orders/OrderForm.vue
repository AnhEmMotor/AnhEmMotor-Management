<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useOrdersStore } from '@/stores/useOrdersStore'
import { debounce } from '@/utils/debounceThrottle'
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
const ordersStore = useOrdersStore()

const localData = ref({
  customerName: '',
  products: [],
  notes: '',
})

const STATUS_LIST = [
  { key: 'pending', text: 'Chờ xác nhận' }, 
  { key: 'completed', text: 'Đã hoàn thành' },
  { key: 'canceled', text: 'Đã hủy' }, 
  { key: 'refunding', text: 'Đang hoàn tiền' },
  { key: 'refunded', text: 'Đã hoàn tiền' },
  { key: 'confirmed_cod', text: 'Đã xác nhận (Chờ thanh toán COD)' }, 
  { key: 'paid_processing', text: 'Đã thanh toán (Chờ xử lý)' },
  { key: 'waiting_deposit', text: 'Chờ đặt cọc' },
  { key: 'deposit_paid', text: 'Đã đặt cọc (Chờ xử lý)' },
  { key: 'delivering', text: 'Đang giao hàng' },
  { key: 'waiting_pickup', text: 'Chờ lấy hàng tại cửa hàng' },
]

const localStatus = ref('pending')

const LOCKED_STATUSES = [
  'confirmed_cod',
  'paid_processing',
  'deposit_paid',
  'delivering',
  'waiting_pickup',
  'completed',
  'canceled',
  'refunding',
  'refunded',
]

const isLocked = computed(() => {
  if (!props.order) return false
  const key = localStatus.value || (props.order && props.order.status_id) || 'pending'
  return LOCKED_STATUSES.includes(key)
})

const originalStatusKey = computed(() => (props.order ? props.order.status_id : null))
const statusChanged = computed(() => {
  if (!props.order) return false
  return localStatus.value !== originalStatusKey.value
})

function allowedStatusOptionsFor(currentKey) {
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
  const currentEntry = STATUS_LIST.find((s) => s.key === currentKey)
  const result = []
  if (currentEntry) {
    result.push({ value: currentEntry.key, text: `${currentEntry.text} (Hiện tại)` })
  }
  STATUS_LIST.forEach((s) => {
    if (s.key !== currentKey && allowed.includes(s.key)) {
      result.push({ value: s.key, text: s.text })
    }
  })
  return result
}

const productSearchResults = ref([])
const productSearchTerm = ref('')
const showProductDropdown = ref(false)
const productInputRef = ref(null)
const dropdownStyle = ref({})

const errors = ref({
  products: '',
  customerName: '',
})

const debouncedSearch = debounce(async (term) => {
  if (term.length < 2) {
    productSearchResults.value = []
    return
  }
  try {
    const data = await ordersStore.fetchProductVariants({
      p_page: 1,
      p_items_per_page: 10,
      p_search: term,
      p_status_ids: null,
    })
    productSearchResults.value = data.products || []
    if (productSearchResults.value.length > 0) {
      openProductDropdown()
    }
  } catch (err) {
    console.error('Lỗi tìm sản phẩm:', err)
  }
}, 300)

watch(productSearchTerm, (newTerm) => {
  debouncedSearch(newTerm)
})

const filteredProducts = computed(() => {
  return productSearchResults.value
})

const selectProduct = (product) => {
  if (isLocked.value) {
    showProductDropdown.value = false
    return
  }
  const newProduct = {
    id: Date.now() + Math.random(),
    product_id: product.id,
    code: product.id.substring(0, 8),
    name: product.name,
    quantity: 1,
    unitPrice: product.price || 0,
    total: product.price || 0,
    costPrice: product.cost_price || 0,
  }
  localData.value.products.push(newProduct)
  productSearchTerm.value = ''
  productSearchResults.value = []
  showProductDropdown.value = false
}

const openProductDropdown = () => {
  if (isLocked.value) return
  if (filteredProducts.value.length > 0) {
    showProductDropdown.value = true
  }
}

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      if (props.order) {
        localData.value.customerName = props.order.customer_name || ''
        localData.value.products = (props.order.products || []).map((p) => ({
          id: p.id || Date.now() + Math.random(),
          product_id: p.product_id,
          code: p.product_id ? p.product_id.substring(0, 8) : 'N/A',
          name: p.name,
          quantity: p.count || p.quantity || 1,
          unitPrice: p.price || p.unitPrice || 0,
          total: (p.price || p.unitPrice || 0) * (p.count || p.quantity || 1),
          costPrice: p.cost_price || 0,
        }))
        localData.value.notes = props.order.notes || ''
        localStatus.value = props.order.status_id || 'pending'
      } else {
        localData.value = { customerName: '', products: [], notes: '' }
        localStatus.value = 'pending'
      }
      productSearchTerm.value = ''
      showProductDropdown.value = false
      errors.value = { products: '', customerName: '' }
    }
  },
  { immediate: true },
)

const handleProductBlur = () => {
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
  const rect = productInputRef.value.$el.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: (props.zIndex || 100) + 10,
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
  if (localData.value.products.length === 0) {
    if (!props.order) {
      errors.value.products = 'Vui lòng thêm ít nhất 1 sản phẩm'
      return
    }
    if (!statusChanged.value) {
      errors.value.products = 'Đơn hàng phải có ít nhất 1 sản phẩm'
      return
    }
  }

  const statusEntry = STATUS_LIST.find((s) => s.key === localStatus.value) || STATUS_LIST[0]
  const payload = {
    id: props.order ? props.order.id : undefined,
    customerName: localData.value.customerName,
    products: JSON.parse(JSON.stringify(localData.value.products)),
    total: totalAmount.value,
    notes: localData.value.notes,
    status: { key: localStatus.value, text: statusEntry.text },
    createdAt: props.order ? props.order.created_at : new Date().toISOString(),
  }
  console.debug('[OrderForm] submit payload:', payload)
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
        <h3 class="text-lg font-semibold">{{ props.order ? 'Sửa Đơn Hàng' : 'Tạo Đơn Mới' }}</h3>
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
          <BaseInput
            v-model="localData.customerName"
            :error="errors.customerName"
            :disabled="isLocked"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Thêm sản phẩm</label>
          <div class="relative">
            <BaseInput
              ref="productInputRef"
              v-model="productSearchTerm"
              @focus="openProductDropdown"
              @blur="handleProductBlur"
              :disabled="isLocked"
              placeholder="Tìm hàng hóa theo tên (gõ ít nhất 2 ký tự)..."
            />

            <div
              v-if="showProductDropdown"
              :style="dropdownStyle"
              class="fixed bg-white border border-[rgba(0,0,0,0.08)] rounded-md shadow-[0_6px_18px_rgba(0,0,0,0.08)] z-50"
            >
              <div v-if="filteredProducts.length === 0" class="p-3 text-gray-500 text-sm">
                Không tìm thấy sản phẩm...
              </div>
              <div
                v-for="product in filteredProducts"
                :key="product.id"
                @mousedown.prevent="selectProduct(product)"
                class="p-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50"
              >
                <div class="flex items-center gap-3">
                  <div class="mr-3">
                    <img
                      :src="
                        product.cover_image_url ||
                        'https://placehold.co/40x40/f0f0f0/AAAAAA?text=...'
                      "
                      alt="Product"
                      class="w-10 h-10 object-cover rounded"
                    />
                  </div>
                  <div class="flex-1">
                    <div class="font-medium">{{ product.name }}</div>
                    <div class="text-xs text-gray-500">
                      Giá: {{ (product.price || 0).toLocaleString() }} | Tồn:
                      {{ product.stock }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p v-if="errors.products" class="mt-1 text-sm text-red-500">{{ errors.products }}</p>
        </div>

        <div v-if="props.order">
          <label class="block text-sm font-medium mb-1">Trạng thái đơn</label>
          <BaseDropdown
            v-model="localStatus"
            :options="allowedStatusOptionsFor(originalStatusKey)"
            placeholder="Chọn trạng thái"
          />
        </div>

        <div class="product-table-section max-h-[300px] overflow-y-auto">
          <table
            class="w-full text-sm bg-white rounded-md overflow-hidden shadow-sm border-collapse"
          >
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th
                  class="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-12 border-b border-[rgba(0,0,0,0.04)]"
                >
                  STT
                </th>
                <th
                  class="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-28 border-b border-[rgba(0,0,0,0.04)]"
                >
                  Mã
                </th>
                <th
                  class="py-2 px-3 text-left text-xs font-semibold text-gray-600 border-b border-[rgba(0,0,0,0.04)]"
                >
                  Tên
                </th>
                <th
                  class="py-2 px-3 text-right text-xs font-semibold text-gray-600 w-24 border-b border-[rgba(0,0,0,0.04)]"
                >
                  SL
                </th>
                <th
                  class="py-2 px-3 text-right text-xs font-semibold text-gray-600 w-32 border-b border-[rgba(0,0,0,0.04)]"
                >
                  Đơn giá
                </th>
                <th
                  class="py-2 px-3 text-right text-xs font-semibold text-gray-600 w-32 border-b border-[rgba(0,0,0,0.04)]"
                >
                  Thành tiền
                </th>
                <th
                  class="py-2 px-3 text-center text-xs font-semibold text-gray-600 w-12 border-b border-[rgba(0,0,0,0.04)]"
                ></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="localData.products.length === 0">
                <td
                  colspan="7"
                  class="text-center py-6 text-gray-400 border-b border-[rgba(0,0,0,0.04)]"
                >
                  Chưa có sản phẩm nào
                </td>
              </tr>
              <tr
                v-for="(p, idx) in localData.products"
                :key="p.id"
                class="even:bg-gray-50 hover:bg-[rgba(59,130,246,0.03)]"
              >
                <td class="py-2 px-3 text-sm text-gray-700 border-b border-[rgba(0,0,0,0.04)]">
                  {{ idx + 1 }}
                </td>
                <td class="py-2 px-3 text-sm text-gray-700 border-b border-[rgba(0,0,0,0.04)]">
                  {{ p.code }}
                </td>
                <td class="py-2 px-3 text-sm text-gray-700 border-b border-[rgba(0,0,0,0.04)]">
                  {{ p.name }}
                </td>
                <td class="py-2 px-3 text-right border-b border-[rgba(0,0,0,0.04)]">
                  <BaseInput
                    v-model.number="p.quantity"
                    @change="calculateProductTotal(p)"
                    type="number"
                    min="1"
                    :disabled="isLocked"
                    class="w-20 py-1 px-2 text-center bg-transparent"
                  />
                </td>
                <td class="py-2 px-3 text-right border-b border-[rgba(0,0,0,0.04)]">
                  <BaseInput
                    v-model.number="p.unitPrice"
                    @change="calculateProductTotal(p)"
                    type="number"
                    min="0"
                    :disabled="isLocked"
                    class="w-28 py-1 px-2 text-right bg-transparent"
                  />
                </td>
                <td
                  class="py-2 px-3 text-right font-medium text-gray-800 border-b border-[rgba(0,0,0,0.04)]"
                >
                  {{ (p.total || 0).toLocaleString('vi-VN') }}
                </td>
                <td class="py-2 px-3 text-center border-b border-[rgba(0,0,0,0.04)]">
                  <button
                    v-if="!isLocked"
                    @click="removeProduct(idx)"
                    title="Xóa sản phẩm"
                    class="text-red-500 hover:text-red-700 text-lg"
                  >
                    🗑️
                  </button>
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
        <div class="text-sm font-semibold">Tổng: {{ totalAmount.toLocaleString('vi-VN') }} VNĐ</div>
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
