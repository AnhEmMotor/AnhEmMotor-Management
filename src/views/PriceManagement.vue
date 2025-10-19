<script setup>
import { ref, computed, onMounted } from 'vue'
import PriceModal from '@/components/price_management/PriceModal.vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'
import BasePagination from '@/components/ui/button/BasePagination.vue'

// sample data (kept from original)
const priceHistoryData = {
  SP000007: { name: 'VS', recentInputPrice: null, oldPrices: [] },
  SP000006: {
    name: 'SH350i',
    recentInputPrice: 4500000,
    oldPrices: [
      { price: 48000000, date: '01/05/2024' },
      { price: 47500000, date: '15/03/2024' },
    ],
  },
  SP000004: {
    name: 'AirBlade',
    recentInputPrice: 38000000,
    oldPrices: [{ price: 39500000, date: '12/04/2024' }],
  },
}

const products = ref(
  Object.keys(priceHistoryData).map((id) => {
    const history = priceHistoryData[id].oldPrices || []
    return {
      id,
      name: priceHistoryData[id].name,
      history,
      status: 'active',
      sellingPrice: history && history.length > 0 ? history[0].price : '',
    }
  }),
)

// search / pagination
const searchTerm = ref('')
const pageSize = 5
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / pageSize)))

const filteredProducts = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return products.value
  return products.value.filter(
    (p) => p.id.toLowerCase().includes(term) || p.name.toLowerCase().includes(term),
  )
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredProducts.value.slice(start, start + pageSize)
})

// modal
const isModalVisible = ref(false)
const selectedProduct = ref(null)

function handleOpenModal(product) {
  // prefer the live product object from `products` so we show the latest history
  const live = products.value.find((p) => p.id === product.id) || product
  // also keep priceHistoryData in sync if available
  if (priceHistoryData[product.id]) priceHistoryData[product.id].oldPrices = live.history || []
  selectedProduct.value = live
  isModalVisible.value = true
}
function handleCloseModal() {
  isModalVisible.value = false
  selectedProduct.value = null
}

// toast

function formatDate(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function getRecentInputPriceDisplay(item) {
  const rec =
    priceHistoryData[item.id] && priceHistoryData[item.id].recentInputPrice !== undefined
      ? priceHistoryData[item.id].recentInputPrice
      : item.history && item.history.length > 0
        ? item.history[0].price
        : null
  return rec === null || rec === undefined || rec === '' ? '-' : rec
}

function setPrice(item) {
  const v = (item.sellingPrice || '').toString().trim()
  if (!v) {
    return
  }
  // Update selling price and also record it into history + global priceHistoryData
  item.sellingPrice = v

  // format as numeric if possible, otherwise keep string
  const numeric = parseNumber(v)
  const formattedPrice = numeric !== null ? numeric : v
  const date = formatDate(Date.now())

  // push into product.history (most recent first)
  item.history = item.history || []
  // Avoid duplicating identical most-recent entries
  const lastPriceRaw = item.history.length > 0 ? item.history[0].price : null
  const lastNumeric = parseNumber(lastPriceRaw)
  const newNumeric = numeric
  let isSame = false
  if (newNumeric !== null && lastNumeric !== null) {
    // both are numeric -> compare numbers
    isSame = newNumeric === lastNumeric
  } else {
    // fallback: compare normalized strings (remove dots/commas/spaces)
    const normalize = (s) =>
      s === null || s === undefined
        ? ''
        : String(s)
            .replace(/[.,\s]/g, '')
            .trim()
    isSame = normalize(lastPriceRaw) === normalize(formattedPrice)
  }
  if (!isSame) {
    item.history.unshift({ price: formattedPrice, date })
  }

  // keep global map in sync for oldPrices only. Do NOT overwrite recentInputPrice (it's the reference/import price).
  if (!priceHistoryData[item.id]) {
    priceHistoryData[item.id] = {
      name: item.name,
      recentInputPrice: null,
      oldPrices: item.history.slice(),
    }
  } else {
    priceHistoryData[item.id].oldPrices = item.history.slice()
    // preserve existing recentInputPrice; do not overwrite
  }
}

// helper to coerce numeric values from strings like '48,000,000' or '48000000'
function parseNumber(v) {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number') return v
  const s = String(v).replace(/\./g, '').replace(/,/g, '')
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

function handlePriceBlur(item) {
  const v = (item.sellingPrice || '').toString().trim()
  if (!v) return
  setPrice(item)
}

onMounted(() => {
  products.value.forEach((p) => (p.isOpen = false))
})
</script>

<template>
  <div class="box-style">
    <div class="content-box-style">
      <div>
        <h1 class="title-style">Thiết Lập Giá Hàng Hóa</h1>
      </div>
    </div>

    <BaseInput v-model="searchTerm" type="text" placeholder="Tìm kiếm mã, tên, ..." class="mb-3" />

    <!-- Table Header (visible on md+) -->
    <div
      class="hidden md:grid md:[grid-template-columns:repeat(16,minmax(0,1fr))] items-center py-3 px-4 text-sm font-semibold text-gray-600 bg-gray-200 rounded-t-md"
    >
      <div class="px-3 md:[grid-column:span_2]">Mã hàng</div>
      <div class="px-3 md:[grid-column:span_3]">Tên hàng</div>
      <div class="px-4 md:[grid-column:span_3]">Giá nhập gần nhất</div>
      <div class="px-5 md:[grid-column:span_3]">Ngày cập nhật</div>
      <div class="px-3 md:[grid-column:span_5]">Nhập giá</div>
    </div>

    <!-- List -->
    <div class="bg-white rounded-b-md shadow-sm">
      <div v-if="filteredProducts.length === 0" class="text-center py-6 text-gray-500">
        Không có mặt hàng để hiển thị.
      </div>
      <div v-else>
        <div
          v-for="item in paginatedProducts"
          :key="item.id"
          class="grid grid-cols-1 md:[grid-template-columns:repeat(16,minmax(0,1fr))] md:items-center py-1 md:py-1 px-4 md:px-4 border-b text-sm gap-2 md:gap-0"
          @dblclick="handleOpenModal(item)"
        >
          <!-- Mã hàng -->
          <div class="px-0 md:px-3 md:[grid-column:span_2]">
            <div class="text-xs text-gray-500 md:hidden">Mã hàng</div>
            <div class="font-medium">{{ item.id }}</div>
          </div>

          <!-- Tên hàng -->
          <div class="px-0 md:px-3 max-w-full md:[grid-column:span_3]">
            <div class="text-xs text-gray-500 md:hidden">Tên hàng</div>
            <div class="truncate" :title="item.name">{{ item.name }}</div>
          </div>

          <!-- Giá nhập gần nhất (from recentInputPrice or history) -->
          <div class="px-0 md:px-4 text-right md:[grid-column:span_3]">
            <div class="text-xs text-gray-500 md:hidden">Giá nhập gần nhất</div>
            <div>{{ getRecentInputPriceDisplay(item) }}</div>
          </div>

          <!-- Ngày cập nhật -->
          <div class="px-0 md:px-5 md:[grid-column:span_3]">
            <div class="text-xs text-gray-500 md:hidden">Ngày cập nhật</div>
            <div>{{ item.history && item.history.length > 0 ? item.history[0].date : '-' }}</div>
          </div>

          <!-- Nhập giá + actions -->
          <div class="px-0 md:px-3 md:[grid-column:span_5]">
            <div class="text-xs text-gray-500 md:hidden">Nhập giá</div>
            <div class="flex items-center gap-2">
              <BaseInput
                v-model="item.sellingPrice"
                type="text"
                placeholder="0"
                @blur="() => handlePriceBlur(item)"
                @keydown.enter.prevent="() => setPrice(item)"
                @dblclick.stop
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="py-4 flex justify-center">
      <BasePagination :total-pages="totalPages" v-model:currentPage="currentPage" />
    </div>

    <PriceModal :is-visible="isModalVisible" :product="selectedProduct" @close="handleCloseModal" />
  </div>
</template>
