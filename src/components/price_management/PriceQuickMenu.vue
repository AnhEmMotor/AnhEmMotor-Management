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
      
      <div class="flex bg-gray-100 rounded p-1 gap-1">
        <button 
          class="w-8 h-7 rounded text-sm font-bold transition-colors"
          :class="operation === 'add' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'"
          @click="operation = 'add'"
        >
          +
        </button>
        <button 
          class="w-8 h-7 rounded text-sm font-bold transition-colors"
          :class="operation === 'subtract' ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:bg-gray-200'"
          @click="operation = 'subtract'"
        >
          -
        </button>
      </div>
    </div>

    <div class="flex items-center gap-2 mb-2">
      <div class="flex-1">
        <div class="text-xs text-gray-500 mb-1">
          {{ operation === 'add' ? 'Tăng thêm' : 'Giảm đi' }}
        </div>
        <input 
          v-model="delta" 
          type="text" 
          class="w-full border rounded p-1 text-sm" 
          :placeholder="mode === 'percent' ? 'Nhập số %' : 'Nhập số tiền'"
          @keydown.enter="apply"
        />
      </div>
      <button class="px-3 py-1 bg-blue-600 text-white rounded text-sm mt-5 h-8 font-medium hover:bg-blue-700" @click="apply">
        Áp dụng
      </button>
    </div>

    <div v-if="computedPreview !== null" class="mb-2 text-sm bg-blue-50 p-2 rounded border border-blue-100">
      <div class="flex justify-between items-center">
        <span class="text-xs text-gray-500">Giá sau khi thay đổi:</span>
        <span class="font-bold text-lg text-blue-700">{{ formatMoney(computedPreview) }}</span>
      </div>
    </div>

    <div class="flex gap-2 text-sm">
      <button class="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100" @click="quickPercent(5)">+5%</button>
      <button class="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100" @click="quickPercent(10)">+10%</button>
      <button class="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100" @click="quickPercent(-5)">-5%</button>
      <button class="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100" @click="quickPercent(-10)">-10%</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  basePrice: { type: [Number, String], default: null },
})
const emit = defineEmits(['apply', 'menu-mousedown'])

const mode = ref('percent') // 'percent' | 'absolute'
const operation = ref('add') // 'add' | 'subtract'
const delta = ref('')

const computedPreview = computed(() => {
  const base = parseNumber(props.basePrice)
  const deltaValue = parseNumber(delta.value)

  if (base === null || deltaValue === null) return null

  let result
  if (mode.value === 'absolute') {
    if (operation.value === 'add') {
      result = base + deltaValue
    } else {
      result = base - deltaValue
    }
  } else {
    // Percent mode
    if (operation.value === 'add') {
      result = Math.round(base * (1 + deltaValue / 100))
    } else {
      result = Math.round(base * (1 - deltaValue / 100))
    }
  }
  
  return Math.max(0, result)
})

watch(
  () => props.basePrice,
  () => {
    delta.value = ''
    operation.value = 'add'
  },
  { immediate: true },
)

watch(mode, () => {
  delta.value = ''
})

function parseNumber(v) {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number') return v
  // Remove dots, commas, plus signs
  const s = String(v).replace(/[\.,\+]/g, '')
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

function apply() {
  if (computedPreview.value !== null) {
    emit('apply', computedPreview.value)
  }
}

function quickPercent(p) {
  mode.value = 'percent'
  if (p > 0) {
    operation.value = 'add'
    delta.value = String(p)
  } else {
    operation.value = 'subtract'
    delta.value = String(Math.abs(p))
  }
}

function formatMoney(v) {
  if (v === null || v === undefined) return '-'
  if (typeof v === 'number') return new Intl.NumberFormat('vi-VN').format(v)
  return String(v)
}
</script>
