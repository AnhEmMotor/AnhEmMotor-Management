<template>
  <div
    class="price-quick-menu bg-white border rounded-md shadow-md p-3 w-96"
    @mousedown.stop="$emit('menu-mousedown')"
  >
    <div class="text-sm font-semibold mb-2">Cài đặt giá theo công thức</div>
    <div class="flex items-center gap-2 mb-2">
      <select v-model="mode" class="border rounded p-1 text-sm flex-1">
        <option value="absolute">Chỉnh sửa theo giá</option>
        <option value="percent">Chỉnh sửa theo %</option>
      </select>
      <button class="p-1 bg-blue-500 text-white rounded" @click="applyPlus">+</button>
      <button class="p-1 bg-gray-200 rounded" @click="applyMinus">-</button>
    </div>

    <div class="flex items-center gap-2 mb-2">
      <input v-model="value" type="text" class="flex-1 border rounded p-1 text-sm" />
      <button class="px-2 py-1 bg-blue-600 text-white rounded text-sm" @click="apply">
        Áp dụng
      </button>
    </div>

    <div v-if="preview !== null" class="mb-2 text-sm">
      <div class="text-xs text-gray-500">Kết quả</div>
      <div class="font-medium">{{ formatMoney(preview) }}</div>
    </div>

    <div class="flex gap-2 text-sm">
      <button class="px-2 py-1 bg-green-100 rounded" @click="quickPercent(5)">+5%</button>
      <button class="px-2 py-1 bg-green-100 rounded" @click="quickPercent(10)">+10%</button>
      <button class="px-2 py-1 bg-red-100 rounded" @click="quickPercent(-5)">-5%</button>
      <button class="px-2 py-1 bg-red-100 rounded" @click="quickPercent(-10)">-10%</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  basePrice: { type: [Number, String], default: null },
})
const emit = defineEmits(['apply', 'menu-mousedown'])

const mode = ref('absolute')
const value = ref('')
const preview = ref(null)

watch(
  () => props.basePrice,
  (v) => {
    const base = parseNumber(v)
    if (mode.value === 'percent') {
      value.value = '5'
    } else {
      value.value = base === null || base === undefined ? '' : String(base)
    }
  },
  { immediate: true },
)

watch(
  () => mode.value,
  (m) => {
    const base = parseNumber(props.basePrice)
    if (m === 'percent') {
      // switch to percent: if current value is numeric absolute and base exists, compute percent
      const currAbs = parseNumber(value.value)
      if (currAbs !== null && base !== null && base !== 0) {
        const percent = Math.round((currAbs / base) * 1000) / 10
        value.value = String(percent)
      } else {
        // default to 5%
        value.value = '5'
      }
    } else {
      // switch to absolute: if current value is numeric percent and base exists, compute absolute value
      const currPerc = parseNumber(value.value)
      if (currPerc !== null && base !== null) {
        const abs = Math.round(base * (currPerc / 100))
        value.value = String(abs)
      } else {
        // default to 5% of base if base exists
        if (base !== null) value.value = String(Math.round(base * 0.05))
        else value.value = ''
      }
    }
  },
)

function parseNumber(v) {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number') return v
  const s = String(v).replace(/\./g, '').replace(/,/g, '')
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

function apply() {
  // If preview was set by quick actions, apply that value
  if (preview.value !== null) {
    const v = preview.value
    emit('apply', v < 0 ? 0 : v)
    preview.value = null
    return
  }
  const base = parseNumber(props.basePrice)
  if (mode.value === 'absolute') {
    const v = parseNumber(value.value)
    if (v === null) return
    emit('apply', v < 0 ? 0 : v)
  } else {
    // percent mode: value is percent change
    const p = parseNumber(value.value)
    if (p === null || base === null) return
    const newPrice = Math.round(base * (1 + p / 100))
    emit('apply', newPrice < 0 ? 0 : newPrice)
  }
}

function quickPercent(p) {
  const base = parseNumber(props.basePrice)
  if (base === null) return
  const newPrice = Math.round(base * (1 + p / 100))
  preview.value = newPrice
}

function applyPlus() {
  const base = parseNumber(props.basePrice)
  if (base === null) return
  if (mode.value === 'absolute') {
    const delta = parseNumber(value.value)
    if (delta === null) return
    const v = base + delta
    preview.value = v < 0 ? 0 : v
  } else {
    const p = parseNumber(value.value)
    if (p === null) return
    const newPrice = Math.round(base * (1 + p / 100))
    preview.value = newPrice < 0 ? 0 : newPrice
  }
}

function applyMinus() {
  const base = parseNumber(props.basePrice)
  if (base === null) return
  if (mode.value === 'absolute') {
    const delta = parseNumber(value.value)
    if (delta === null) return
    const v = base - delta
    preview.value = v < 0 ? 0 : v
  } else {
    const p = parseNumber(value.value)
    if (p === null) return
    const newPrice = Math.round(base * (1 - p / 100))
    preview.value = newPrice < 0 ? 0 : newPrice
  }
}

function formatMoney(v) {
  if (v === null || v === undefined) return '-'
  if (typeof v === 'number') return new Intl.NumberFormat('vi-VN').format(v)
  return String(v)
}

// keep menu open when clicking inside
// root element handles mouse down to keep menu open
</script>

<style scoped>
/* small styling to ensure menu looks OK */
</style>
