<script setup>
import { ref, computed, watch, onBeforeUnmount, reactive } from 'vue'
import { useOrdersStore } from '@/stores/useOrdersStore'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import Dropdown from '@/components/ui/input/BaseDropdown.vue'
import Input from '@/components/ui/input/BaseInput.vue'
import Textarea from '../ui/input/BaseTextarea.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import * as apiUsers from '@/api/user'
import * as apiProducts from '@/api/product'
import * as apiOrders from '@/api/order'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { useQuery } from '@tanstack/vue-query'
import { Permissions } from '@/constants/permissions'
import { usePermission } from '@/composables/usePermission'

const props = defineProps({
  show: { type: Boolean, default: false },
  zIndex: { type: Number, default: 100 },
  order: { type: Object, default: null },
  onRefresh: { type: Function, default: undefined },
})
const emit = defineEmits(['close', 'save', 'activate', 'delete'])
const ordersStore = useOrdersStore()
const { hasPermission } = usePermission()

const localData = ref({
  customer: null,
  customerName: '',
  customerAddress: '',
  customerPhone: '',
  products: [],
  notes: '',
})

const { data: statusMap } = useQuery({
  queryKey: ['order-status-map'],
  queryFn: apiOrders.fetchOrderStatusMap,
  staleTime: 1000 * 60 * 10,
})

const { data: lockedStatuses } = useQuery({
  queryKey: ['order-locked-statuses'],
  queryFn: apiOrders.fetchLockedStatuses,
  staleTime: 1000 * 60 * 60,
})

const { data: transitionMap } = useQuery({
  queryKey: ['order-transition-map'],
  queryFn: apiOrders.fetchOrderTransitionMap,
  staleTime: 1000 * 60 * 10,
})

const STATUS_LIST = computed(() => {
  if (!statusMap.value) return []
  return statusMap.value.map((s) => ({ key: s.id, text: s.name }))
})

const localStatus = ref('pending')
const isLoading = ref(false)

const isLocked = computed(() => {
  if (!props.order || !lockedStatuses.value) return false
  return lockedStatuses.value.includes(originalStatusKey.value)
})

const originalStatusKey = computed(() =>
  props.order ? props.order.statusId || props.order.status_id : null,
)
const statusChanged = computed(() => {
  if (!props.order) return false
  return localStatus.value !== originalStatusKey.value
})
const notesChanged = computed(() => {
  if (!props.order) return false
  return localData.value.notes !== (props.order.notes || '')
})

function allowedStatusOptionsFor(currentKey) {
  if (!transitionMap.value || !STATUS_LIST.value.length) return []

  const allowed = transitionMap.value[currentKey] || []
  const currentEntry = STATUS_LIST.value.find((s) => s.key === currentKey)
  const result = []

  if (currentEntry) {
    result.push({ value: currentEntry.key, text: `${currentEntry.text} (Hiện tại)` })
  }

  STATUS_LIST.value.forEach((s) => {
    if (s.key !== currentKey && allowed.includes(s.key)) {
      result.push({ value: s.key, text: s.text })
    }
  })
  return result
}

const customerSearch = reactive({
  showDropdown: false,
})

const {
  data: customers,
  isLoading: isCustomersLoading,
  searchRefs: customerSearchRefs,
  pagination: customerPagination,
} = usePaginatedQuery({
  queryKey: ['basic-users-for-orders'],
  queryFn: apiUsers.fetchBasicUsers,
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
  queryKey: ['variants-lite-for-output'],
  queryFn: apiProducts.fetchVariantsLiteForOutput,
  itemsPerPage: 5,
  useLocalPagination: true,
  searchFields: [{ key: 'search', debounce: 400 }],
})

const productInputRef = ref(null)
const customerInputRef = ref(null)
const dropdownStyle = ref({})
const customerDropdownStyle = ref({})

const errors = ref({
  products: '',
  customer: '',
})

const selectCustomer = (customer) => {
  if (isLocked.value) {
    customerSearch.showDropdown = false
    return
  }
  localData.value.customer = customer
  localData.value.customerName = customer.fullName || customer.name || ''
  localData.value.customerPhone = customer.phoneNumber || ''
  localData.value.customerAddress = customer.address || ''
  customerSearchRefs.search = customer.fullName || customer.name
  customerSearch.showDropdown = false
}

const clearCustomer = () => {
  if (isLocked.value) return
  localData.value.customer = null
  localData.value.customerName = ''
  localData.value.customerPhone = ''
  localData.value.customerAddress = ''
  customerSearchRefs.search = ''
}

const handleCustomerBlur = () => {
  window.setTimeout(() => {
    customerSearch.showDropdown = false
  }, 300)
}

const formatCurrency = (value) => {
  if (value === '' || value === null || value === undefined) return ''
  return Number(value).toLocaleString('vi-VN')
}

const parseCurrency = (value) => {
  if (value === '' || value === null || value === undefined) return 0
  return Number(String(value).replace(/\./g, ''))
}

const selectProduct = (product) => {
  if (isLocked.value) {
    productSearch.showDropdown = false
    return
  }
  const newProduct = {
    id: Date.now() + Math.random(),
    product_id: product.id,
    code: String(product.id).substring(0, 8),
    name: product.displayName || product.name,
    quantity: 1,
    unitPrice: product.price || 0,
    total: product.price || 0,
    costPrice: product.cost_price || 0,
    coverImageUrl: product.coverImageUrl,
  }
  localData.value.products.push(newProduct)
  productSearchRefs.search = ''
  productSearch.showDropdown = false
}

const syncLocalData = () => {
  if (props.order) {
    const name =
      props.order.buyerName || props.order.customerName || props.order.customer_name || ''
    const buyerId = props.order.buyerId || props.order.buyer_id
    const phone = props.order.buyerPhone || props.order.customerPhone || props.order.customer_phone
    const email = props.order.buyerEmail || props.order.customerEmail || props.order.customer_email
    localData.value.customer =
      name || buyerId ? { fullName: name, id: buyerId, phoneNumber: phone, email: email } : null
    if (localData.value.customer) {
      customerSearchRefs.search = localData.value.customer.fullName || ''
    } else {
      customerSearchRefs.search = ''
    }

    localData.value.products = (props.order.products || []).map((p) => {
      const prodId = p.productId || p.product_id
      const prodName = p.productName || p.name
      const qty = p.count || p.quantity || 1
      const priceVal = p.price || p.unitPrice || 0
      return {
        id: p.id || Date.now() + Math.random(),
        product_id: prodId,
        code: p.code || (prodId ? String(prodId).substring(0, 8) : 'N/A'),
        name: prodName,
        quantity: qty,
        unitPrice: priceVal,
        total: priceVal * qty,
        costPrice: p.costPrice || p.cost_price || 0,
        coverImageUrl: p.coverImageUrl || p.cover_image_url,
      }
    })
    localData.value.notes = props.order.notes || ''
    localData.value.customerName = props.order.customerName || props.order.customer_name || ''
    localData.value.customerAddress =
      props.order.customerAddress || props.order.customer_address || ''
    localData.value.customerPhone = props.order.customerPhone || props.order.customer_phone || ''
    localStatus.value = props.order.statusId || props.order.status_id || 'pending'
  } else {
    localData.value = { customer: null, products: [], notes: '' }
    customerSearchRefs.search = ''
    localStatus.value = 'pending'
  }
  productSearchRefs.search = ''
  productSearch.showDropdown = false
  customerSearch.showDropdown = false
  errors.value = { products: '', customer: '' }
}

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      syncLocalData()
    }
  },
  { immediate: true },
)

watch(
  () => props.order,
  () => {
    if (props.show) {
      syncLocalData()
    }
  },
  { deep: true },
)

const handleProductBlur = () => {
  window.setTimeout(() => {
    productSearch.showDropdown = false
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
  const rect = productInputRef.value.$el
    ? productInputRef.value.$el.getBoundingClientRect()
    : productInputRef.value.getBoundingClientRect()
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

const updateCustomerDropdownPosition = () => {
  if (!customerInputRef.value) return
  const rect = customerInputRef.value.$el
    ? customerInputRef.value.$el.getBoundingClientRect()
    : customerInputRef.value.getBoundingClientRect()
  customerDropdownStyle.value = {
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

const onShowCustomerDropdown = (val) => {
  if (val) {
    setTimeout(updateCustomerDropdownPosition, 0)
    window.addEventListener('resize', updateCustomerDropdownPosition)
    window.addEventListener('scroll', updateCustomerDropdownPosition, true)
  } else {
    window.removeEventListener('resize', updateCustomerDropdownPosition)
    window.removeEventListener('scroll', updateCustomerDropdownPosition, true)
  }
}

watch(() => productSearch.showDropdown, onShowProductDropdown)
watch(() => customerSearch.showDropdown, onShowCustomerDropdown)

watch(
  () => localData.value.products.length,
  (len) => {
    if (len > 0) errors.value.products = ''
  },
)

watch(
  () => localData.value.customer,
  (val) => {
    if (val) errors.value.customer = ''
  },
)

function submit() {
  if (!localData.value.customer && !customerSearchRefs.search) {
    errors.value.customer = 'Vui lòng chọn khách hàng'
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

  const statusEntry = STATUS_LIST.value.find((s) => s.key === localStatus.value) || {
    key: localStatus.value,
    text: localStatus.value,
  }
  const payload = {
    id: props.order ? props.order.id : undefined,
    customer: localData.value.customer,
    customerName: localData.value.customerName,
    customerAddress: localData.value.customerAddress,
    customerPhone: localData.value.customerPhone,
    products: JSON.parse(JSON.stringify(localData.value.products)),
    total: totalAmount.value,
    notes: localData.value.notes,
    status: { key: localStatus.value, text: statusEntry.text },
    createdAt: props.order ? props.order.created_at : new Date().toISOString(),
  }
  emit('save', payload)
}

const handleReload = async () => {
  if (!props.order?.id) return
  await ordersStore.reloadOrderData(props.order.id)
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDropdownPosition)
  window.removeEventListener('scroll', updateDropdownPosition, true)
  window.removeEventListener('resize', updateCustomerDropdownPosition)
  window.removeEventListener('scroll', updateCustomerDropdownPosition, true)
})
</script>

<template>
  <DraggableModal
    v-if="show"
    :zIndex="zIndex"
    @close="$emit('close')"
    @activate="$emit('activate')"
    :onRefresh="props.order ? props.onRefresh || handleReload : undefined"
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
          <div class="relative">
            <div class="relative">
              <input
                ref="customerInputRef"
                v-model="customerSearchRefs.search"
                @focus="customerSearch.showDropdown = true"
                @input="updateCustomerDropdownPosition"
                @blur="handleCustomerBlur"
                type="text"
                :disabled="isLocked"
                placeholder="Tìm khách hàng theo tên, SĐT, Email..."
                class="w-full py-2 px-3 border border-gray-300 rounded-md text-sm outline-none transition-colors duration-200"
                :class="errors.customer ? 'border-red-500' : ''"
              />
              <button
                v-if="localData.customer"
                @click="clearCustomer"
                type="button"
                :disabled="isLocked"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 bg-gray-200 border-none rounded-full w-5 h-5 flex items-center justify-center cursor-pointer text-sm text-gray-500"
              >
                ×
              </button>
            </div>

            <div
              v-if="customerSearch.showDropdown"
              :style="customerDropdownStyle"
              class="fixed z-50 max-h-[300px] overflow-y-auto bg-white rounded-md border border-[rgba(0,0,0,0.08)] shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
            >
              <div v-if="isCustomersLoading" class="p-3 text-center text-gray-400">Đang tìm...</div>
              <div
                v-else
                v-for="customer in customers"
                :key="customer.id"
                @click="selectCustomer(customer)"
                class="p-3 cursor-pointer border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50"
              >
                <div class="font-medium">{{ customer.fullName || customer.name }}</div>
                <div class="text-xs text-gray-500">
                  {{ customer.phoneNumber || 'N/A'
                  }}{{ customer.email ? ` | ${customer.email}` : '' }}
                </div>
              </div>

              <div
                v-if="customerPagination.totalPages.value > 1"
                class="p-2 border-t border-gray-100 bg-gray-50 flex justify-between items-center sticky bottom-0"
              >
                <button
                  @click.stop="customerPagination.prevPage"
                  @mousedown.prevent
                  :disabled="customerPagination.isFirstPage.value"
                  class="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 cursor-pointer"
                >
                  Trước
                </button>
                <span class="text-xs text-gray-500">
                  Trang {{ customerPagination.currentPage.value }} /
                  {{ customerPagination.totalPages.value }}
                </span>
                <button
                  @click.stop="customerPagination.nextPage"
                  @mousedown.prevent
                  :disabled="customerPagination.isLastPage.value"
                  class="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 cursor-pointer"
                >
                  Sau
                </button>
              </div>

              <div
                v-else-if="!isCustomersLoading && customers.length === 0"
                class="p-3 text-center text-gray-400"
              >
                Không tìm thấy khách hàng
              </div>
            </div>

            <div
              v-if="localData.customer || customerSearchRefs.search"
              class="mt-4 space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider"
                    >Họ tên người nhận</label
                  >
                  <Input
                    v-model="localData.customerName"
                    placeholder="Nhập tên khách..."
                    :disabled="isLocked"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider"
                    >Số điện thoại</label
                  >
                  <Input
                    v-model="localData.customerPhone"
                    placeholder="Nhập số điện thoại..."
                    :disabled="isLocked"
                  />
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider"
                  >Địa chỉ giao hàng</label
                >
                <Input
                  v-model="localData.customerAddress"
                  placeholder="Nhập địa chỉ giao hàng chi tiết..."
                  :disabled="isLocked"
                />
              </div>
            </div>
            <div v-else-if="errors && errors.customer" class="text-red-500 text-sm mt-1">
              {{ errors.customer }}
            </div>
          </div>
        </div>

        <div v-if="props.order">
          <label class="block text-sm font-medium mb-1">Trạng thái đơn</label>
          <Dropdown
            v-model="localStatus"
            :options="allowedStatusOptionsFor(originalStatusKey)"
            placeholder="Chọn trạng thái"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Thêm sản phẩm</label>
          <div class="relative">
            <input
              ref="productInputRef"
              v-model="productSearchRefs.search"
              @input="updateDropdownPosition"
              @focus="productSearch.showDropdown = true"
              @blur="handleProductBlur"
              type="text"
              :disabled="isLocked"
              placeholder="Tìm hàng hóa theo tên...."
              class="w-full py-2 px-3 border border-gray-300 rounded-md text-sm outline-none transition-colors duration-200"
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
                @mousedown.prevent="selectProduct(product)"
                class="p-3 cursor-pointer border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50"
              >
                <div class="flex items-center gap-3">
                  <img
                    :src="
                      product.coverImageUrl || 'https://placehold.co/40x40/f0f0f0/AAAAAA?text=...'
                    "
                    alt="product"
                    class="w-10 h-10 rounded object-cover"
                  />
                  <div class="flex-1">
                    <div class="font-medium">{{ product.displayName || product.name }}</div>
                    <div class="text-xs text-gray-500">
                      ID: {{ product.id || 'N/A' }} | Giá:
                      {{ (product.price || 0).toLocaleString() }}
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
                v-else-if="!isProductsLoading && products.length === 0"
                class="p-3 text-center text-gray-400"
              >
                Không tìm thấy sản phẩm...
              </div>
            </div>
          </div>
          <p v-if="errors.products" class="mt-1 text-sm text-red-500">{{ errors.products }}</p>
        </div>

        <div class="product-table-section border border-gray-300 rounded-md">
          <table class="w-full text-sm bg-white border-collapse">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-12 border-b border-[rgba(0,0,0,0.04)]"
                >
                  STT
                </th>
                <th
                  class="py-2 px-3 text-left text-xs font-semibold text-gray-600 border-b border-[rgba(0,0,0,0.04)]"
                >
                  Sản phẩm
                </th>
                <th
                  class="py-2 px-3 text-center text-xs font-semibold text-gray-600 w-24 border-b border-[rgba(0,0,0,0.04)]"
                >
                  SL
                </th>
                <th
                  class="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-32 border-b border-[rgba(0,0,0,0.04)]"
                >
                  Đơn giá
                </th>
                <th
                  class="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-32 border-b border-[rgba(0,0,0,0.04)]"
                >
                  Thành tiền
                </th>
                <th
                  class="py-2 px-3 text-center text-xs font-semibold text-gray-600 w-12 border-b border-[rgba(0,0,0,0.04)]"
                ></th>
              </tr>
            </thead>
            <tbody>
              <template v-if="isLoading">
                <tr v-for="i in 3" :key="i" class="border-b border-[rgba(0,0,0,0.04)]">
                  <td class="py-2 px-3"><SkeletonLoader width="20px" height="16px" /></td>
                  <td class="py-2 px-3"><SkeletonLoader width="150px" height="16px" /></td>
                  <td class="py-2 px-3">
                    <SkeletonLoader width="40px" height="24px" class="mx-auto" />
                  </td>
                  <td class="py-2 px-3 text-right">
                    <SkeletonLoader width="80px" height="24px" class="ml-auto" />
                  </td>
                  <td class="py-2 px-3 text-right">
                    <SkeletonLoader width="80px" height="16px" class="ml-auto" />
                  </td>
                  <td class="py-2 px-3 text-center">
                    <SkeletonLoader width="20px" height="20px" class="mx-auto rounded" />
                  </td>
                </tr>
              </template>
              <tr v-else-if="localData.products.length === 0">
                <td
                  colspan="6"
                  class="text-center py-6 text-gray-400 border-b border-[rgba(0,0,0,0.04)]"
                >
                  Chưa có sản phẩm nào
                </td>
              </tr>
              <tr
                v-else
                v-for="(p, idx) in localData.products"
                :key="p.id"
                class="even:bg-gray-50 hover:bg-[rgba(59,130,246,0.03)]"
              >
                <td class="py-2 px-3 text-sm text-gray-700 border-b border-[rgba(0,0,0,0.04)]">
                  {{ idx + 1 }}
                </td>

                <td class="py-2 px-3 text-sm text-gray-700 border-b border-[rgba(0,0,0,0.04)]">
                  <div class="flex items-center gap-3">
                    <img
                      :src="p.coverImageUrl || 'https://placehold.co/40x40/f0f0f0/AAAAAA?text=...'"
                      alt="product"
                      class="w-8 h-8 rounded object-cover border border-gray-100"
                    />
                    <span class="line-clamp-2">{{ p.name }}</span>
                  </div>
                </td>
                <td class="py-2 px-3 text-center border-b border-[rgba(0,0,0,0.04)]">
                  <Input
                    v-model.number="p.quantity"
                    @change="calculateProductTotal(p)"
                    type="number"
                    min="1"
                    :disabled="isLocked"
                    :inputClass="'text-center bg-transparent py-1 px-2'"
                  />
                </td>
                <td class="py-2 pl-3 text-left border-b border-[rgba(0,0,0,0.04)]">
                  <Input
                    :modelValue="formatCurrency(p.unitPrice)"
                    @update:modelValue="
                      (val) => {
                        p.unitPrice = parseCurrency(val)
                        calculateProductTotal(p)
                      }
                    "
                    type="text"
                    :disabled="isLocked"
                    :inputClass="'text-left bg-transparent py-1 px-2'"
                  />
                </td>
                <td
                  class="py-2 px-3 text-left font-medium text-gray-800 border-b border-[rgba(0,0,0,0.04)]"
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
          <Textarea v-model="localData.notes" :rows="3" />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <div class="text-sm font-semibold">Tổng: {{ totalAmount.toLocaleString('vi-VN') }} VNĐ</div>
        <div class="flex gap-2">
          <Button text="Huỷ" color="gray" @click="$emit('close')" />
          <Button
            v-if="
              (props.order && hasPermission(Permissions.OutputsEdit)) ||
              (!props.order && hasPermission(Permissions.OutputsCreate))
            "
            :text="props.order ? 'Lưu' : 'Tạo đơn'"
            color="primary"
            @click="submit"
            :disabled="isLocked && !statusChanged && !notesChanged"
          />
        </div>
      </div>
    </template>
  </DraggableModal>
</template>
