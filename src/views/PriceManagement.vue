<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { usePriceStore } from '@/stores/usePriceStore'
import { useRoute, useRouter } from 'vue-router'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import PriceQuickMenu from '@/components/price_management/PriceQuickMenu.vue'
import Input from '@/components/ui/input/Input.vue'
import Button from '@/components/ui/button/Button.vue'
import Pagination from '@/components/ui/button/Pagination.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import IconFileImport from '@/components/icons/IconFileImport.vue'
import IconFileExport from '@/components/icons/IconFileExport.vue'
import IconRightArrow from '@/components/icons/IconLeftArrow.vue'
import IconDownArrow from '@/components/icons/IconDownArrow.vue'
import { useToast } from 'vue-toastification'

const priceStore = usePriceStore()
const router = useRouter()
const route = useRoute()
const queryClient = useQueryClient()
const toast = useToast()

const itemsPerPage = ref(5) // Default to 5 items to show pagination

const page = computed(() => parseInt(route.query.page) || 1)
const searchTerm = computed(() => route.query.search || '')

const filters = computed(() => ({
  search: searchTerm.value,
}))

const localSearchTerm = ref(searchTerm.value)
let searchTimeout = null

const fetchProductsFn = async (params) => {
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
      const cloned = JSON.parse(JSON.stringify(newProductsData))
      
      if (cloned && cloned.length > 0) {
        // Auto format prices for input
        cloned.forEach(p => {
          if (p.variants) {
            p.variants.forEach(v => {
              if (v.price !== null && v.price !== undefined) {
                v.price = formatMoney(v.price)
              }
            })
          }
        })
      }
      
      products.value = cloned
    } else {
      products.value = []
    }
  },
  {
    immediate: true, 
    deep: true,
  },
)

watch(isError, (val) => {
  if (val) {
    toast.error(error.value?.message || 'Có lỗi xảy ra khi tải dữ liệu')
  }
})

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
const expandedProducts = ref(new Set())

function openQuickMenu(evt, product, variant) {
  if (variant.latest_input_price === null || variant.latest_input_price === undefined) {
    return
  }
  const rect = evt.target.getBoundingClientRect()
  const menuWidth = 384
  const menuHeight = 200
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  let left = rect.left + window.scrollX

  if (left + menuWidth > windowWidth) {
    left = windowWidth - menuWidth - 8
  }

  if (left < 8) {
    left = 8
  }

  const spaceBelow = windowHeight - rect.bottom
  const spaceAbove = rect.top

  let top
  if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
    top = rect.top + window.scrollY - menuHeight - 6
  } else {
    top = rect.bottom + window.scrollY + 6
  }

  quickMenu.value.x = left
  quickMenu.value.y = top
  quickMenu.value.visible = true
  quickMenu.value.item = { product, variant }
}

function closeQuickMenu() {
  quickMenu.value.visible = false
  quickMenu.value.item = null
}

function toggleProduct(productId) {
  if (expandedProducts.value.has(productId)) {
    expandedProducts.value.delete(productId)
  } else {
    expandedProducts.value.add(productId)
  }
  expandedProducts.value = new Set(expandedProducts.value)
}

function isExpanded(productId) {
  return expandedProducts.value.has(productId)
}

function getPriceRange(variants, field) {
  if (!variants || variants.length === 0) return '-'
  const prices = variants.map(v => parseNumber(v[field])).filter(p => p !== null)
  if (prices.length === 0) return '-'
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  if (min === max) return formatMoney(min)
  return `${formatMoney(min)} - ${formatMoney(max)}`
}

function updatePriceInput(value, variant) {
  const raw = String(value).replace(/\D/g, '')
  if (!raw) {
    variant.price = ''
    return
  }
  const num = Number(raw)
  variant.price = new Intl.NumberFormat('vi-VN').format(num)
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
  // console.log(newPrice)
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
  const s = String(v).replace(/[\.,\+]/g, '')
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

function computeProfitAmount(variant) {
  const selling = parseNumber(variant.price)
  const cost = parseNumber(variant.latest_input_price)
  if (selling === null || cost === null) return null
  return selling - cost
}

function formatPercent(variant) {
  const current = parseNumber(variant.price)
  const recent = parseNumber(variant.latest_input_price)
  if (current === null || recent === null || recent === 0) return '-'
  const ratio = (current - recent) / recent
  return new Intl.NumberFormat('vi-VN', { 
    style: 'percent', 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 2 
  }).format(ratio)
}

function formatMoney(v) {
  if (v === null || v === undefined) return '-'
  return new Intl.NumberFormat('vi-VN').format(v)
}

function getVariantOptionsText(options) {
  if (!options) return ''
  return Object.values(options).join(' - ')
}

onMounted(() => {
  document.addEventListener('mousedown', onDocClick)
})

function handleImport() {
  console.log('Import functionality to be implemented')
}

function handleExport() {
  console.log('Export functionality to be implemented')
}

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocClick)
  clearTimeout(searchTimeout)
})
</script>

<template>
  <div class="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Thiết Lập Giá Hàng Hóa</h1>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button text="Import" :icon="IconFileImport" color="secondary" @click="handleImport" />
        <Button text="Export" :icon="IconFileExport" color="secondary" @click="handleExport" />
      </div>
    </div>

    <Input
      v-model="localSearchTerm"
      type="text"
      placeholder="Tìm kiếm mã, tên, ..."
      class="mb-3 w-full"
    />

    <div class="border border-gray-200 rounded-md overflow-hidden">
      <!-- Unified Header - Appears Once -->
      <div
        class="hidden md:grid md:grid-cols-12 items-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200"
      >
        <div class="md:col-span-4 pl-2">Tên Sản Phẩm / Biến Thể</div>
        <div class="md:col-span-2 text-right pr-2">Giá Vốn</div>
        <div class="md:col-span-2 text-right pr-2">Giá Bán</div>
        <div class="md:col-span-2 text-right pr-2">Nhập Giá Mới</div>
        <div class="md:col-span-2 text-right pr-2">Biên Lợi Nhuận</div>
      </div>

      <div class="bg-white">
        <div v-if="isLoading" class="p-0">
          <div v-for="i in 5" :key="i" class="border-b border-gray-200 bg-white">
            <div class="grid grid-cols-1 md:grid-cols-12 items-center py-4 px-4 bg-white">
              <div class="md:col-span-4 pl-2"><SkeletonLoader height="24px" width="70%" /></div>
              <div class="md:col-span-2 flex justify-end pr-2"><SkeletonLoader height="20px" width="50%" /></div>
              <div class="md:col-span-2 flex justify-end pr-2"><SkeletonLoader height="20px" width="50%" /></div>
              <div class="md:col-span-2"></div>
              <div class="md:col-span-2"></div>
            </div>
          </div>
        </div>
      <div v-else-if="isError" class="text-center py-6 text-red-500">
        Đã xảy ra lỗi trong quá trình lấy dữ liệu.
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
          <!-- Parent Row (Master - Product) -->
          <div 
            class="grid grid-cols-1 md:grid-cols-12 items-center py-4 px-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
            @click="toggleProduct(product.product_id)"
          >
            <div class="font-bold text-base text-gray-900 md:col-span-4 flex items-center gap-2">
              <component 
                :is="isExpanded(product.product_id) ? IconDownArrow : IconRightArrow" 
                class="w-4 h-4 text-gray-500 flex-shrink-0"
              />
              <span class="truncate">{{ product.product_name }}</span>
              <span class="text-xs text-gray-500 font-normal ml-2">({{ product.variants?.length || 0 }})</span>
            </div>
            <div class="text-sm text-gray-600 md:col-span-2 text-right pr-2">
              {{ getPriceRange(product.variants, 'latest_input_price') }}
            </div>
            <div class="text-sm text-gray-600 md:col-span-2 text-right pr-2">
              {{ getPriceRange(product.variants, 'price') }}
            </div>
            <div class="md:col-span-2"></div>
            <div class="md:col-span-2"></div>
          </div>

          <!-- Child Rows (Detail - Variants) -->
          <template v-if="isExpanded(product.product_id)">
            <div
              v-if="!product.variants || product.variants.length === 0"
              class="text-center py-4 text-gray-500 text-sm bg-gray-50"
            >
              Sản phẩm này chưa có biến thể.
            </div>

            <div
              v-for="variant in product.variants"
              :key="variant.variant_id"
              class="grid grid-cols-1 md:grid-cols-12 md:items-center py-2 md:py-3 border-t border-gray-100 text-sm gap-2 md:gap-0 first:border-t-0 bg-white hover:bg-gray-50 transition-colors"
            >
              <div class="px-0 md:pl-12 md:col-span-4 flex items-center gap-2">
                <div class="text-xs text-gray-500 md:hidden">Biến thể</div>
                <div class="font-medium text-gray-700">{{ getVariantOptionsText(variant.option_values) }}</div>
              </div>

              <div class="px-0 md:pr-2 text-right md:col-span-2">
                <div class="text-xs text-gray-500 md:hidden">Giá vốn (nhập gần nhất)</div>
                <div class="font-mono text-gray-700">{{ getRecentInputPriceDisplay(variant) }}</div>
              </div>

              <div class="px-0 md:pr-2 text-right md:col-span-2">
                <div class="text-xs text-gray-500 md:hidden">Giá bán hiện tại</div>
                <div class="font-mono font-semibold text-gray-900">{{ formatMoney(variant.price) }}</div>
              </div>

              <div class="px-0 md:pr-2 md:col-span-2">
                <div class="text-xs text-gray-500 md:hidden">Nhập giá bán mới</div>
                <Input
                  :model-value="variant.price"
                  @update:model-value="(val) => updatePriceInput(val, variant)"
                  type="text"
                  placeholder="0"
                  class="price-input w-full"
                  inputClass="text-right font-mono font-medium"
                  @focus="(e) => openQuickMenu(e, product, variant)"
                  @blur="() => handlePriceBlur(product, variant)"
                  @keydown.enter.prevent="() => handlePriceBlur(product, variant)"
                  @dblclick.stop
                />
              </div>

              <div class="px-0 md:pr-2 text-right md:col-span-2">
                <div class="text-xs text-gray-500 md:hidden">Biên lợi nhuận</div>
                <div v-if="computeProfitAmount(variant) !== null" class="text-sm font-medium font-mono">
                  <span
                    :class="{
                      'text-green-600': computeProfitAmount(variant) > 0,
                      'text-red-600': computeProfitAmount(variant) < 0,
                      'text-gray-500': computeProfitAmount(variant) === 0,
                    }"
                  >
                {{ formatPercent(variant) }}
                  </span>
                </div>
                <div v-else class="text-gray-400">-</div>
              </div>
            </div>
          </template>
        </div>
      </template>

      <div
        v-if="quickMenu.visible"
        class="price-quick-menu fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-fade-in-up"
        :style="{ top: quickMenu.y + 'px', left: quickMenu.x + 'px' }"
      >
        <PriceQuickMenu :item="quickMenu.item" @apply="applyQuickPrice" @close="closeQuickMenu" />
      </div>
    </div>
    </div>

    <Pagination :total-pages="totalPages || 0" v-model:currentPage="currentPage" />
  </div>
</template>
