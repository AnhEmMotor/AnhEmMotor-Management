<script setup>
import { ref, computed, watch, onBeforeUnmount, reactive } from 'vue'
import { useOrderStore } from '@/stores/order.store'
import { useUserStore } from '@/stores/user.store'
import { useProductStore } from '@/stores/product.store'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import Dropdown from '@/components/ui/input/BaseDropdown.vue'
import Input from '@/components/ui/input/BaseInput.vue'
import Textarea from '../ui/input/BaseTextarea.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { useQuery } from '@tanstack/vue-query'
import { Permissions } from '@/constants/permissions'
import { usePermission } from '@/composables/usePermission'
import { useToast } from 'vue-toastification'
import { formatCurrency, formatVNDWithUnit } from '@/utils/currency'
import settingService from '@/services/setting.service'

const props = defineProps({
  show: { type: Boolean, default: false },
  zIndex: { type: Number, default: 100 },
  order: { type: Object, default: null },
  onRefresh: { type: Function, default: undefined },
  apiErrors: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['close', 'save', 'activate', 'delete'])
const orderStore = useOrderStore()
const userStore = useUserStore()
const productStore = useProductStore()
const { hasPermission } = usePermission()
const toast = useToast()

const localData = ref({
  customer: null,
  customerName: '',
  customerAddress: '',
  customerPhone: '',
  products: [],
  notes: '',
  paymentMethod: 'COD',
  depositRatio: 0,
})

const { data: settings } = useQuery({
  queryKey: ['system-settings'],
  queryFn: settingService.fetchSettings,
  staleTime: 1000 * 60 * 60, // 1 hour
})

const depositRatioSetting = computed(() => {
  if (!settings.value) return 50
  return Number(settings.value['Deposit_ratio'] || 50)
})

const orderValueThreshold = computed(() => {
  if (!settings.value) return 100000000
  return Number(settings.value['Order_value_exceeds'] || 100000000)
})

const { data: statusMap } = useQuery({
  queryKey: ['order-status-map'],
  queryFn: orderStore.fetchStatusMap,
  staleTime: 1000 * 60 * 10,
})

const { data: lockedStatuses } = useQuery({
  queryKey: ['order-locked-statuses'],
  queryFn: orderStore.fetchLockedStatuses,
  staleTime: 1000 * 60 * 60,
})

const { data: transitionMap } = useQuery({
  queryKey: ['order-transition-map'],
  queryFn: orderStore.fetchTransitionMap,
  staleTime: 1000 * 60 * 10,
})

const STATUS_LIST = computed(() => {
  if (!statusMap.value) return []
  return statusMap.value.map((s) => ({ key: s.id, text: s.name }))
})

const localStatus = ref('pending')
const isLoading = ref(false)

const isBuyerProductLocked = computed(() => {
  if (!props.order || !lockedStatuses.value) return false
  const list = Array.isArray(lockedStatuses.value)
    ? lockedStatuses.value
    : lockedStatuses.value.buyerAndProducts || []
  return list.includes(originalStatusKey.value)
})

const isDeliveryInfoLocked = computed(() => {
  if (!props.order || !lockedStatuses.value || Array.isArray(lockedStatuses.value)) return false
  return (lockedStatuses.value.deliveryInfo || []).includes(originalStatusKey.value)
})

const isNotesLocked = computed(() => {
  if (!props.order || !lockedStatuses.value || Array.isArray(lockedStatuses.value)) return false
  return (lockedStatuses.value.notes || []).includes(originalStatusKey.value)
})

const isLocked = computed(() => isBuyerProductLocked.value)

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
const deliveryInfoChanged = computed(() => {
  if (!props.order) return false
  return (
    localData.value.customerName !== (props.order.customerName || '') ||
    localData.value.customerPhone !== (props.order.customerPhone || '') ||
    localData.value.customerAddress !== (props.order.customerAddress || '')
  )
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
  queryFn: (params) => userStore.fetchBasicUsers(params),
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
  queryFn: (params) => productStore.searchVariantsLiteForOutput(params),
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
  customerName: '',
  customerPhone: '',
  customerAddress: '',
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
  customerSearchRefs.search = customer.fullName || customer.name || customer.email || ''
  customerSearch.showDropdown = false
}

const handleCustomerBlur = () => {
  window.setTimeout(() => {
    customerSearch.showDropdown = false
  }, 300)
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
    const buyerEmail =
      props.order.buyerEmail || props.order.customerEmail || props.order.customer_email || ''
    const buyerName = props.order.buyerName || ''
    const buyerId = props.order.buyerId || props.order.buyer_id
    const phone = props.order.buyerPhone || props.order.customerPhone || props.order.customer_phone

    localData.value.customer =
      buyerName || buyerEmail || buyerId
        ? { fullName: buyerName, id: buyerId, phoneNumber: phone, email: buyerEmail }
        : null

    if (localData.value.customer) {
      customerSearchRefs.search = buyerName || buyerEmail || ''
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
    localData.value.paymentMethod = props.order.paymentMethod || props.order.payment_method || 'COD'
    localData.value.depositRatio =
      props.order.depositRatio !== undefined && props.order.depositRatio !== null
        ? props.order.depositRatio
        : props.order.deposit_ratio !== undefined && props.order.deposit_ratio !== null
          ? props.order.deposit_ratio
          : depositRatioSetting.value
    localStatus.value = props.order.statusId || props.order.status_id || 'pending'
  } else {
    localData.value = {
      customer: null,
      products: [],
      notes: '',
      paymentMethod: 'COD',
      depositRatio: depositRatioSetting.value,
    }
    customerSearchRefs.search = ''
    localStatus.value = 'pending'
  }
  productSearchRefs.search = ''
  productSearch.showDropdown = false
  customerSearch.showDropdown = false
  errors.value = { products: '', customer: '' }
}

syncLocalData()

watch(depositRatioSetting, (newVal) => {
  if (!props.order && (localData.value.depositRatio === 0 || localData.value.depositRatio === 50)) {
    localData.value.depositRatio = newVal
  }
})

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
  return Math.round(localData.value.products.reduce((sum, p) => sum + (p.total || 0), 0))
})

const depositAmount = computed(() => {
  return Math.round(totalAmount.value * (localData.value.depositRatio / 100))
})

const remainingAmount = computed(() => {
  return totalAmount.value - depositAmount.value
})

const showDepositInfo = computed(() => {
  return totalAmount.value >= orderValueThreshold.value || localData.value.depositRatio > 0
})

const isDepositRatioLocked = computed(() => {
  if (!props.order || !lockedStatuses.value) return false
  const data = lockedStatuses.value
  const list = Array.isArray(data) ? [] : (data.depositRatio || [])
  return list.includes(originalStatusKey.value)
})

const isPaymentLinkAvailable = computed(() => {
  if (!props.order || !lockedStatuses.value) return false
  const data = lockedStatuses.value
  const list = Array.isArray(data) ? [] : (data.paymentLink || [])
  return list.includes(originalStatusKey.value)
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

watch(
  () => props.apiErrors,
  (val) => {
    if (val && Object.keys(val).length > 0) {
      errors.value.customerName = val.CustomerName || val.customerName || ''
      errors.value.customerPhone = val.CustomerPhone || val.customerPhone || ''
      errors.value.customerAddress = val.CustomerAddress || val.customerAddress || ''
      if (val.Products || val.products) errors.value.products = val.Products || val.products
      if (val.Customer || val.customer) errors.value.customer = val.Customer || val.customer
    }
  },
  { deep: true },
)

watch(
  () => localData.value.customerName,
  (val) => {
    if (val) errors.value.customerName = ''
  },
)

watch(
  () => localData.value.customerPhone,
  (val) => {
    if (val) errors.value.customerPhone = ''
  },
)

watch(
  () => localData.value.customerAddress,
  (val) => {
    if (val) errors.value.customerAddress = ''
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
    depositRatio: localData.value.depositRatio,
    notes: localData.value.notes,
    paymentMethod: localData.value.paymentMethod,
    status: { key: localStatus.value, text: statusEntry.text },
    createdAt: props.order ? props.order.created_at : new Date().toISOString(),
  }
  emit('save', payload)
}

const handleReload = async () => {
  if (!props.order?.id) return
  const detail = await orderStore.getOrderById(props.order.id)
  if (detail) syncLocalData()
}

const handleCopyPaymentLink = async () => {
  if (!props.order?.id) return
  isLoading.value = true
  try {
    const response = await orderStore.getPaymentLink(props.order.id)
    if (response) {
      await navigator.clipboard.writeText(response)
      toast.success('Đã copy link thanh toán vào clipboard!')
    }
  } catch (err) {
    toast.error(`Lỗi khi lấy link thanh toán: ${err.message}`)
  } finally {
    isLoading.value = false
  }
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
    :isLoading="isLoading"
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
          v-if="isBuyerProductLocked || isDeliveryInfoLocked || isNotesLocked"
          class="p-3 rounded bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-800"
        >
          Đơn hàng đang ở trạng thái
          <strong>{{ STATUS_LIST.find((s) => s.key === localStatus)?.text || localStatus }}</strong>
          nên một số trường bị khoá. Bạn vẫn có thể thay đổi các phần chưa bị khoá và "Trạng thái",
          sau đó nhấn Lưu.
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Tên khách hàng</label>
          <div class="relative">
            <div class="relative">
              <div
                v-if="isBuyerProductLocked"
                class="w-full py-1 text-base text-gray-900 font-bold mb-2"
              >
                {{ customerSearchRefs.search || 'Chưa chọn khách hàng' }}
              </div>
              <input
                v-else
                ref="customerInputRef"
                v-model="customerSearchRefs.search"
                @focus="customerSearch.showDropdown = true"
                @input="updateCustomerDropdownPosition"
                @blur="handleCustomerBlur"
                type="text"
                placeholder="Tìm khách hàng theo tên hoặc Email..."
                class="w-full py-2 px-3 border border-gray-300 rounded-md text-sm outline-none transition-colors duration-200 focus:border-blue-500"
                :class="errors.customer ? 'border-red-500' : ''"
              />
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
                <div class="font-medium text-gray-900">
                  {{ customer.fullName || customer.name || customer.email }}
                </div>
                <div class="text-xs text-gray-500 mt-0.5">
                  <span v-if="customer.fullName || customer.name" class="mr-2">{{
                    customer.email
                  }}</span>
                  <span v-if="customer.phoneNumber">{{ customer.phoneNumber }}</span>
                  <span v-else-if="!customer.email && !customer.phoneNumber"
                    >Không có thông tin liên lạc</span
                  >
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
              class="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-4"
            >
              <div class="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                <h4 class="text-sm font-semibold text-gray-700">Thông tin giao nhận</h4>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="block text-xs font-medium text-gray-500">Họ tên người nhận</label>
                  <div v-if="isDeliveryInfoLocked" class="py-1 text-sm font-bold text-gray-800">
                    {{ localData.customerName || '---' }}
                  </div>
                  <Input
                    v-else
                    v-model="localData.customerName"
                    placeholder="Nhập tên người nhận..."
                    :disabled="isDeliveryInfoLocked"
                    :inputClass="errors.customerName ? 'border-red-500' : ''"
                  />
                  <p v-if="errors.customerName" class="text-xs text-red-500 mt-1">
                    {{ errors.customerName }}
                  </p>
                </div>
                <div class="space-y-1">
                  <label class="block text-xs font-medium text-gray-500">Số điện thoại</label>
                  <div v-if="isDeliveryInfoLocked" class="py-1 text-sm font-bold text-gray-800">
                    {{ localData.customerPhone || '---' }}
                  </div>
                  <Input
                    v-else
                    v-model="localData.customerPhone"
                    placeholder="Nhập số điện thoại..."
                    :disabled="isDeliveryInfoLocked"
                    :inputClass="errors.customerPhone ? 'border-red-500' : ''"
                  />
                  <p v-if="errors.customerPhone" class="text-xs text-red-500 mt-1">
                    {{ errors.customerPhone }}
                  </p>
                </div>
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-medium text-gray-500"
                  >Địa chỉ giao hàng chi tiết</label
                >
                <div v-if="isDeliveryInfoLocked" class="py-1 text-sm font-bold text-gray-800">
                  {{ localData.customerAddress || '---' }}
                </div>
                <Input
                  v-else
                  v-model="localData.customerAddress"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                  :disabled="isDeliveryInfoLocked"
                  :inputClass="errors.customerAddress ? 'border-red-500' : ''"
                />
                <p v-if="errors.customerAddress" class="text-xs text-red-500 mt-1">
                  {{ errors.customerAddress }}
                </p>
              </div>
            </div>
            <div v-else-if="errors && errors.customer" class="text-red-500 text-sm mt-1">
              {{ errors.customer }}
            </div>
          </div>
        </div>

        <div v-if="props.order" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Trạng thái đơn</label>
            <Dropdown
              v-model="localStatus"
              :options="allowedStatusOptionsFor(originalStatusKey)"
              placeholder="Chọn trạng thái"
            />
          </div>

          <div v-if="localData.paymentMethod">
            <label class="block text-sm font-medium mb-1">Phương thức thanh toán</label>
            <div class="flex items-center gap-3">
              <span class="text-sm font-bold text-gray-800">
                {{ 
                  (localData.paymentMethod && localData.paymentMethod.toLowerCase() === 'cod') 
                  ? 'Thanh toán khi nhận hàng (COD)' 
                  : 'Thanh toán qua ' + (localData.paymentMethod || '---')
                }}
              </span>
              <Button
                v-if="
                  props.order &&
                  localData.paymentMethod &&
                  ['vnpay', 'payos'].includes(localData.paymentMethod.toLowerCase()) &&
                  isPaymentLinkAvailable
                "
                text="Copy Link"
                color="secondary"
                size="sm"
                @click="handleCopyPaymentLink"
                class="whitespace-nowrap h-[32px]"
              >
                <template #icon>
                  <Icon name="fa6-solid:link" class="text-[10px]" />
                </template>
              </Button>
            </div>
          </div>
        </div>

        <!-- Thông tin chi tiết tỷ lệ đặt cọc và thanh toán -->
        <div
          v-if="showDepositInfo && totalAmount > 0"
          class="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-4 shadow-sm"
        >
          <div class="flex justify-between items-center text-sm">
            <div class="flex flex-col gap-1">
              <span class="text-gray-600 font-medium">Tỷ lệ đặt cọc (%):</span>
              <p class="text-[10px] text-orange-600 italic">
                * Ngưỡng yêu cầu cọc: {{ formatVNDWithUnit(orderValueThreshold) }}
              </p>
            </div>
            <div class="w-24">
              <div v-if="isDepositRatioLocked" class="text-right font-black text-orange-600 text-lg">
                {{ localData.depositRatio }}%
              </div>
              <Input
                v-else
                v-model.number="localData.depositRatio"
                type="number"
                min="0"
                max="100"
                inputClass="text-right font-bold py-1 px-2 border-orange-200 focus:border-orange-500"
              />
            </div>
          </div>

          <div class="space-y-2 border-t border-orange-200 pt-3">
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-600 font-medium">Tiền đặt cọc:</span>
              <span class="font-bold text-gray-900">
                {{ formatVNDWithUnit(depositAmount) }}
              </span>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-orange-800 font-semibold">Tiền còn lại:</span>
              <span class="text-xl font-black text-orange-600">
                {{ formatVNDWithUnit(remainingAmount) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="!isBuyerProductLocked">
          <label class="block text-sm font-medium mb-1">Thêm sản phẩm</label>
          <div class="relative">
            <input
              ref="productInputRef"
              v-model="productSearchRefs.search"
              @input="updateDropdownPosition"
              @focus="productSearch.showDropdown = true"
              @blur="handleProductBlur"
              type="text"
              placeholder="Tìm sản phẩm hàng hóa...."
              class="w-full py-2 px-3 border border-gray-300 rounded-md text-sm outline-none transition-colors duration-200 focus:border-blue-500"
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
                    <div class="font-medium">
                      {{ product.displayName || product.name || product.email }}
                    </div>
                    <div class="text-xs text-gray-500">
                      ID: {{ product.id || 'N/A' }} | Giá:
                      {{ formatCurrency(product.price || 0) }}
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

        <div
          class="product-table-section border border-gray-200 rounded-xl overflow-hidden shadow-sm"
          :class="{ 'opacity-80': isLocked }"
        >
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
                <tr v-for="i in 3" :key="i" class="border-b border-gray-50">
                  <td class="py-3 px-4"><SkeletonLoader width="20px" height="16px" /></td>
                  <td class="py-3 px-4"><SkeletonLoader width="150px" height="16px" /></td>
                  <td class="py-3 px-4">
                    <SkeletonLoader width="40px" height="24px" class="mx-auto" />
                  </td>
                  <td class="py-3 px-4 text-right">
                    <SkeletonLoader width="80px" height="24px" class="ml-auto" />
                  </td>
                  <td class="py-3 px-4 text-right">
                    <SkeletonLoader width="80px" height="16px" class="ml-auto" />
                  </td>
                  <td class="py-3 px-4 text-center">
                    <SkeletonLoader width="20px" height="20px" class="mx-auto rounded" />
                  </td>
                </tr>
              </template>
              <tr v-else-if="localData.products.length === 0">
                <td
                  colspan="6"
                  class="text-center py-10 text-gray-400 border-b border-gray-50 font-medium"
                >
                  Chưa có sản phẩm nào
                </td>
              </tr>
              <tr
                v-else
                v-for="(p, idx) in localData.products"
                :key="p.id"
                class="group hover:bg-blue-50/30 transition-colors border-b border-gray-50 last:border-0"
              >
                <td class="py-3 px-4 text-sm text-gray-500 font-medium whitespace-nowrap">
                  {{ idx + 1 }}
                </td>

                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <img
                      :src="p.coverImageUrl || 'https://placehold.co/40x40/f0f0f0/AAAAAA?text=...'"
                      alt="product"
                      class="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm"
                    />
                    <div class="flex flex-col">
                      <span class="font-bold text-gray-800 line-clamp-1">{{ p.name }}</span>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4 text-center">
                  <div v-if="isBuyerProductLocked" class="font-bold text-gray-700">
                    {{ p.quantity }}
                  </div>
                  <Input
                    v-else
                    v-model.number="p.quantity"
                    @change="calculateProductTotal(p)"
                    type="number"
                    min="1"
                    inputClass="text-center bg-transparent py-1 px-1 border-gray-200 focus:border-blue-500 font-bold"
                  />
                </td>
                <td class="py-3 px-4">
                  <div v-if="isBuyerProductLocked" class="font-bold text-gray-700 text-left">
                    {{ formatCurrency(p.unitPrice) }}
                  </div>
                  <Input
                    v-else
                    :modelValue="formatCurrency(p.unitPrice)"
                    @update:modelValue="
                      (val) => {
                        p.unitPrice = parseCurrency(val)
                        calculateProductTotal(p)
                      }
                    "
                    type="text"
                    inputClass="text-left bg-transparent py-1 px-1 border-gray-200 focus:border-blue-500 font-bold"
                  />
                </td>
                <td class="py-2 px-3 text-left font-medium text-gray-800">
                  {{ formatCurrency(p.total || 0) }}
                </td>
                <td class="py-2 px-3 text-center">
                  <button
                    v-if="!isBuyerProductLocked"
                    @click="removeProduct(idx)"
                    title="Xóa sản phẩm"
                    class="text-red-500 hover:text-red-700 text-lg p-1 rounded"
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
          <div v-if="isNotesLocked" class="py-1 text-sm italic text-gray-600 whitespace-pre-wrap">
            {{ localData.notes || 'Không có ghi chú' }}
          </div>
          <Textarea
            v-else
            v-model="localData.notes"
            :rows="3"
            placeholder="Nhập ghi chú cho đơn hàng..."
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-col">
          <div class="text-sm font-bold text-gray-800">
            Tổng: {{ formatVNDWithUnit(totalAmount) }}
          </div>
        </div>
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
            :disabled="
              isBuyerProductLocked &&
              isDeliveryInfoLocked &&
              isNotesLocked &&
              !statusChanged &&
              !notesChanged &&
              !deliveryInfoChanged
            "
          />
        </div>
      </div>
    </template>
  </DraggableModal>
</template>
