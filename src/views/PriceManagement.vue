<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useStore } from 'vuex'
import PriceQuickMenu from '@/components/price_management/PriceQuickMenu.vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'
import BasePagination from '@/components/ui/button/BasePagination.vue'

const store = useStore()

const products = computed(() => store.state.price.products)
const totalPages = computed(() => store.getters['price/totalPages'])
const isLoading = computed(() => store.state.price.isLoading)
const error = computed(() => store.state.price.error)

const currentPage = computed({
  get: () => store.state.price.pagination.currentPage,
  set: (value) => store.dispatch('price/updatePage', value),
})

const localSearchTerm = ref(store.state.price.filters.searchTerm)
let searchTimeout = null

watch(localSearchTerm, (newValue) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    store.dispatch('price/updateSearch', newValue)
  }, 500)
})

const quickMenu = ref({ visible: false, x: 0, y: 0, item: null })
const selectedProductId = ref(null)

function selectProduct(productId) {
  if (selectedProductId.value === productId) {
    selectedProductId.value = null
  } else {
    selectedProductId.value = productId
  }
}

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
  const { product, variant } = quickMenu.value.item
  if (!product || !variant) return

  const formattedPrice = String(newPrice)
  variant.price = formattedPrice
  store.dispatch('price/updatePrice', {
    productId: product.product_id,
    variantId: variant.variant_id,
    newPrice: formattedPrice,
  })
  closeQuickMenu()
}

function handlePriceBlur(product, variant) {
  const v = (variant.price || '').toString().trim()
  if (!v) return

  store.dispatch('price/updatePrice', {
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
  store.dispatch('price/fetchProducts')
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

    <BaseInput
      v-model="localSearchTerm"
      type="text"
      placeholder="Tìm kiếm mã, tên, ..."
      class="mb-3"
    />

    <div
      class="hidden md:grid md:grid-cols-12 items-center py-3 px-4 text-sm font-semibold text-gray-600 bg-gray-200 rounded-t-md"
    >
      <div class="md:col-span-8">Tên Sản Phẩm</div>
      <div class="md:col-span-3">Số biến thể</div>
      <div class="md:col-span-1 text-right"></div>
    </div>

    <div class="bg-white rounded-b-md shadow-sm">
      <div v-if="isLoading" class="text-center py-6 text-gray-500">Đang tải dữ liệu...</div>
      <div v-else-if="error" class="text-center py-6 text-red-500">
        {{ error }}
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
          <div
            @click="selectProduct(product.product_id)"
            class="grid grid-cols-1 md:grid-cols-12 items-center py-3 px-4 cursor-pointer hover:bg-gray-50"
            :class="{ 'bg-gray-50': selectedProductId === product.product_id }"
          >
            <div class="font-medium text-gray-800 md:col-span-8">{{ product.product_name }}</div>
            <div class="text-sm text-gray-600 md:col-span-3">
              {{ product.variants?.length || 0 }} biến thể/phiên bản
            </div>
            <div class="hidden md:flex justify-end items-center md:col-span-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-gray-500 transition-transform duration-200"
                :class="{ 'rotate-180': selectedProductId === product.product_id }"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>

          <transition name="slide-fade">
            <div
              v-if="selectedProductId === product.product_id"
              class="bg-gray-50 pl-4 pr-4 md:pl-12 pb-4 pt-2"
            >
              <div
                class="hidden md:grid md:grid-cols-12 items-center pt-2 pb-2 text-xs font-semibold text-gray-500 border-b border-gray-300"
              >
                <div class="md:col-span-4 px-3">Biến thể/phiên bản</div>
                <div class="md:col-span-3 px-4 text-right">Giá nhập gần nhất</div>
                <div class="md:col-span-4 px-1 text-right">Nhập giá</div>
                <div class="md:col-span-1 px-3 text-right">%</div>
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
                <div class="px-0 md:px-3 md:col-span-4">
                  <div class="text-xs text-gray-500 md:hidden">Biến thể</div>
                  <div class="font-medium">{{ getVariantOptionsText(variant.option_values) }}</div>
                </div>

                <div class="px-0 md:px-4 text-right md:col-span-3">
                  <div class="text-xs text-gray-500 md:hidden">Giá nhập gần nhất</div>
                  <div>{{ getRecentInputPriceDisplay(variant) }}</div>
                </div>

                <div class="px-0 md:px-1 md:col-span-4">
                  <div class="text-xs text-gray-500 md:hidden">Nhập giá</div>
                  <div class="flex items-center gap-2">
                    <BaseInput
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

                <div class="hidden md:flex items-center justify-end px-0 md:px-3 md:col-span-1">
                  <div v-if="computePercent(variant) !== null" class="text-sm font-medium">
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
                </div>
              </div>
            </div>
          </transition>
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

    <div class="py-4 flex justify-center">
      <BasePagination :total-pages="totalPages" v-model:currentPage="currentPage" />
    </div>
  </div>
</template>
