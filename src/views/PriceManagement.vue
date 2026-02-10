<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { usePriceStore } from '@/stores/usePriceStore'
import { useRoute, useRouter } from 'vue-router'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import PriceQuickMenu from '@/components/price_management/PriceQuickMenu.vue'
import Input from '@/components/ui/input/Input.vue'
import Pagination from '@/components/ui/button/Pagination.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'

const priceStore = usePriceStore()
const router = useRouter()
const route = useRoute()
const queryClient = useQueryClient()

const itemsPerPage = ref(5)

const page = computed(() => parseInt(route.query.page) || 1)
const searchTerm = computed(() => route.query.search || '')

const filters = computed(() => ({
  search: searchTerm.value,
}))

const localSearchTerm = ref(searchTerm.value)
let searchTimeout = null

const fetchProductsFn = (params) => {
  return priceStore.fetchProducts(params)
}

const productDataMapper = (data) => ({
  items: data?.products || [],
  count: data?.totalCount || 0,
})

const {
  items: fetchedProducts,
  totalPages,
  isLoading,
  isError,
  error,
} = usePaginatedQuery({
  queryKeyBase: ref('products'),
  filters: filters,
  page: page,
  itemsPerPage: itemsPerPage,
  fetchFn: fetchProductsFn,
  dataMapper: productDataMapper,
})

const products = ref([])
watch(
  fetchedProducts,
  (newProductsData) => {
    if (newProductsData) {
      products.value = JSON.parse(JSON.stringify(newProductsData))
    } else {
      products.value = []
    }
  },
  {
    immediate: true, 
    deep: true,
  },
)

const currentPage = computed({
  get: () => page.value,
  set: (value) => {
    router.push({ query: { ...route.query, page: value } })
  },
})

watch(localSearchTerm, (newValue) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    router.push({ query: { ...route.query, search: newValue || undefined, page: 1 } })
  }, 500)
})

watch(searchTerm, (newSearch) => {
  if (localSearchTerm.value !== newSearch) {
    localSearchTerm.value = newSearch
  }
})

const { mutate: updatePriceMutation } = useMutation({
  mutationFn: (variables) => priceStore.updatePrice(variables),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
  },
  onError: (err) => {
    console.error('Failed to update price:', err)
  },
})

const quickMenu = ref({ visible: false, x: 0, y: 0, item: null })

function openQuickMenu(evt, product, variant) {
  if (variant.latest_input_price === null || variant.latest_input_price === undefined) {
    return
  }

  quickMenu.value.visible = true
  quickMenu.value.item = { product, variant }

  const rect = evt.target.getBoundingClientRect()
  const menuWidth = 384
  const windowWidth = window.innerWidth

  let left = rect.left + window.scrollX

  if (left + menuWidth > windowWidth - 8) {
    left = windowWidth - menuWidth - 8
  }

  if (left < 8) {
    left = 8
  }

  quickMenu.value.x = left
  quickMenu.value.y = rect.bottom + window.scrollY + 6
}

function closeQuickMenu() {
  quickMenu.value.visible = false
  quickMenu.value.item = null
}

function onDocClick(e) {
  const menuEl = document.querySelector('.price-quick-menu')
  if (!menuEl || !menuEl.contains(e.target)) {
    if (e.target && e.target.closest && e.target.closest('.price-input')) {
      return
    }
    closeQuickMenu()
  }
}

function applyQuickPrice(newPrice) {
  console.log(newPrice)
  const { product, variant } = quickMenu.value.item
  if (!product || !variant) return

  const formattedPrice = String(newPrice)
  variant.price = formattedPrice
  updatePriceMutation({
    productId: product.product_id,
    variantId: variant.variant_id,
    newPrice: formattedPrice,
  })
  closeQuickMenu()
}

function handlePriceBlur(product, variant) {
  const v = (variant.price || '').toString().trim()
  if (!v) return

  updatePriceMutation({
    productId: product.product_id,
    variantId: variant.variant_id,
    newPrice: v,
  })
}

function getRecentInputPriceDisplay(variant) {
  const price = variant.latest_input_price
  return price === null || price === undefined ? '-' : formatMoney(price)
}

function parseNumber(v) {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number') return v
  const s = String(v).replace(/\./g, '').replace(/,/g, '')
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

function computePercent(variant) {
  const current = parseNumber(variant.price)
  if (current === null) return null

  const recent = parseNumber(variant.latest_input_price)
  if (recent === null || recent === 0) return null

  return ((current - recent) / recent) * 100
}

function formatPercent(variant) {
  const p = computePercent(variant)
  if (p === null) return '-'
  const rounded = Math.round(p * 10) / 10
  const sign = rounded > 0 ? '+' : ''
  return `${sign}${rounded}%`
}

function formatMoney(v) {
  if (v === null || v === undefined) return '-'
  if (typeof v === 'number') return new Intl.NumberFormat('vi-VN').format(v)
  return String(v)
}

function getVariantOptionsText(optionValues) {
  if (!optionValues) return 'Mặc định'
  return Object.values(optionValues).join(' - ')
}

onMounted(() => {
  document.addEventListener('mousedown', onDocClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocClick)
  clearTimeout(searchTimeout)
})
</script>

<template>
  <div class="bg-gray-100 p-4 sm:p-6 rounded-xl shadow-lg">
    <div class="text-3xl font-bold text-center text-gray-800">
      <div>
        <h1
          class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0"
        >
          Thiết Lập Giá Hàng Hóa
        </h1>
      </div>
    </div>

    <Input
      v-model="localSearchTerm"
      type="text"
      placeholder="Tìm kiếm mã, tên, ..."
      class="mb-3"
    />

    <div
      class="hidden md:grid md:grid-cols-12 items-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200 rounded-t-md"
    >
      <div class="md:col-span-8">Tên Sản Phẩm</div>
      <div class="md:col-span-3">Số biến thể</div>
      <div class="md:col-span-1 text-right"></div>
    </div>

    <div class="bg-white rounded-b-md shadow-sm">
      <div v-if="isLoading" class="p-0">
        <div v-for="i in 5" :key="i" class="border-b border-gray-200 p-4 bg-white">
          <!-- Header Row Skeleton -->
          <div class="grid grid-cols-12 gap-4 mb-2">
            <div class="col-span-8"><SkeletonLoader height="20px" width="60%" /></div>
            <div class="col-span-3"><SkeletonLoader height="20px" width="40%" /></div>
          </div>
          <!-- Detail Row Skeleton to match columns -->
          <div class="grid grid-cols-12 gap-4 mt-4 pl-12">
             <div class="col-span-3"><SkeletonLoader height="16px" width="80%" /></div> <!-- Variant -->
             <div class="col-span-2"><SkeletonLoader height="16px" width="100%" /></div> <!-- Cost -->
             <div class="col-span-2"><SkeletonLoader height="16px" width="100%" /></div> <!-- Price -->
             <div class="col-span-3"><SkeletonLoader height="32px" width="100%" /></div> <!-- Input -->
             <div class="col-span-2"><SkeletonLoader height="16px" width="50%" /></div> <!-- Margin -->
          </div>
        </div>
      </div>
      <div v-else-if="isError" class="text-center py-6 text-red-500">
        {{ error?.message || 'Đã xảy ra lỗi' }}
      </div>
      <div v-else-if="!products || products.length === 0" class="text-center py-6 text-gray-500">
        Không có mặt hàng để hiển thị.
      </div>

      <template v-else>
        <div
          v-for="product in products"
          :key="product.product_id"
          class="border-b border-gray-200 last:border-b-0"
        >
          <div class="grid grid-cols-1 md:grid-cols-12 items-center py-3 px-4 bg-gray-50">
            <div class="font-medium text-gray-800 md:col-span-8">{{ product.product_name }}</div>
            <div class="text-sm text-gray-600 md:col-span-3">
              {{ product.variants?.length || 0 }} biến thể/phiên bản
            </div>
          </div>

          <div class="bg-gray-50 pl-4 pr-4 md:pl-12 pb-4 pt-2">
            <div
              class="hidden md:grid md:grid-cols-12 items-center pt-2 pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300"
            >
              <div class="md:col-span-3 px-3">Biến thể/phiên bản</div>
              <div class="md:col-span-2 px-2 text-right">Giá vốn</div>
              <div class="md:col-span-2 px-2 text-right">Giá bán</div>
              <div class="md:col-span-3 px-1 text-right">Nhập giá bán mới</div>
              <div class="md:col-span-2 px-2 text-right">Biên lợi nhuận</div>
            </div>

            <div
              v-if="!product.variants || product.variants.length === 0"
              class="text-center py-4 text-gray-500 text-sm"
            >
              Sản phẩm này chưa có biến thể.
            </div>

            <div
              v-for="variant in product.variants"
              :key="variant.variant_id"
              class="grid grid-cols-1 md:grid-cols-12 md:items-center py-2 md:py-2 border-t border-gray-200 text-sm gap-2 md:gap-0 first:border-t-0 md:first:border-t-0"
            >
              <div class="px-0 md:px-3 md:col-span-3">
                <div class="text-xs text-gray-500 md:hidden">Biến thể</div>
                <div class="font-medium">{{ getVariantOptionsText(variant.option_values) }}</div>
              </div>

              <div class="px-0 md:px-2 text-right md:col-span-2">
                <div class="text-xs text-gray-500 md:hidden">Giá vốn (nhập gần nhất)</div>
                <div class="font-mono">{{ getRecentInputPriceDisplay(variant) }}</div>
              </div>

              <div class="px-0 md:px-2 text-right md:col-span-2">
                <div class="text-xs text-gray-500 md:hidden">Giá bán hiện tại</div>
                <div class="font-mono font-semibold text-gray-900">{{ formatMoney(variant.price) }}</div>
              </div>

              <div class="px-0 md:px-1 md:col-span-3">
                <div class="text-xs text-gray-500 md:hidden">Nhập giá bán mới</div>
                <div class="flex items-center gap-2">
                  <Input
                    v-model="variant.price"
                    type="text"
                    placeholder="0"
                    class="price-input"
                    @focus="(e) => openQuickMenu(e, product, variant)"
                    @blur="() => handlePriceBlur(product, variant)"
                    @keydown.enter.prevent="() => handlePriceBlur(product, variant)"
                    @dblclick.stop
                  />
                </div>
              </div>

              <div class="px-0 md:px-2 text-right md:col-span-2">
                <div class="text-xs text-gray-500 md:hidden">Biên lợi nhuận</div>
                <div v-if="computePercent(variant) !== null" class="text-sm font-medium font-mono">
                  <span
                    :class="{
                      'text-green-600': computePercent(variant) > 0,
                      'text-red-600': computePercent(variant) < 0,
                      'text-gray-500': computePercent(variant) === 0,
                    }"
                  >
                    {{ formatPercent(variant) }}
                  </span>
                </div>
                <div v-else class="text-gray-400">-</div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div
        v-if="quickMenu.visible"
        :style="{
          position: 'absolute',
          left: quickMenu.x + 'px',
          top: quickMenu.y + 'px',
          zIndex: 50,
          maxWidth: '320px',
        }"
      >
        <PriceQuickMenu
          :basePrice="getRecentInputPriceDisplay(quickMenu.item.variant || {})"
          @apply="applyQuickPrice"
          @menu-mousedown="() => {}"
        />
      </div>
    </div>

    <Pagination :total-pages="totalPages || 0" v-model:currentPage="currentPage" />
  </div>
</template>
