<template>
  <div class="max-w-4xl mx-auto bg-white shadow-xl rounded-lg p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">⚙️ Cài Đặt Quy Tắc Bán Hàng</h1>

    <div class="space-y-8">
      <!-- Quy Tắc Đặt Cọc -->
      <div class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <svg
            class="w-6 h-6 mr-3 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2.5M9 10H7M15 10h2M9 14H7M15 14h2M12 12a5 5 0 01-5 5h10a5 5 0 01-5-5z"
            ></path>
          </svg>
          Quy Tắc Đặt Cọc
        </h2>
        <p class="text-gray-600 mb-6 text-sm">Thiết lập quy tắc đơn hàng phải đặt cọc trước.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div>
            <Input
              v-model="maxOrderProxy"
              type="text"
              id="max-order-value"
              placeholder="Ví dụ: 10,000,000"
              :inputClass="'setting-input w-full max-w-xs'"
              label="Giá trị đơn hàng vượt quá (VNĐ):"
            />
          </div>
          <div>
            <label for="deposit-percentage" class="block text-sm font-medium text-gray-700 mb-1"
              >Tỷ lệ đặt cọc (%):</label
            >
            <div class="relative w-full max-w-[120px]">
              <Input
                v-model="depositProxy"
                type="number"
                id="deposit-percentage"
                placeholder="10"
                :inputClass="'setting-input w-full pr-8'"
                min="0"
                max="100"
              />
              <span
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold"
                >%</span
              >
            </div>
          </div>
        </div>
        <div class="mt-6 p-4 bg-gray-50 rounded-md border border-gray-100">
          <p class="text-sm text-gray-600">
            Minh họa: Khi đơn hàng >
            <span class="font-bold text-gray-900">{{ formattedMaxOrder }}</span> đ, khách phải cọc
            <span class="font-bold text-gray-900">{{ settings.deposit }}%</span>.
          </p>
        </div>
      </div>

      <!-- Quy Tắc Đơn Hàng Số Lượng Lớn -->
      <div class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <svg
            class="w-6 h-6 mr-3 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            ></path>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
          </svg>
          Quy Tắc Đơn Hàng Số Lượng Lớn
        </h2>
        <p class="text-gray-600 mb-6 text-sm">
          Cho phép tạo đơn hàng số lượng lớn nhưng yêu cầu gặp trực tiếp.
        </p>
        <div class="w-full">
          <Input
            v-model="maxCountProxy"
            type="number"
            id="max-motorcycle-count"
            placeholder="3"
            :inputClass="'setting-input w-32 text-center'"
            min="1"
            label="Số lượng xe tối đa (chiếc):"
          />
        </div>
        <div class="mt-6 p-4 bg-gray-50 rounded-md border border-gray-100">
          <p class="text-sm text-gray-600">
            Minh họa: Đơn hàng >
            <span class="font-bold text-gray-900">{{ settings.maxCount }}</span> xe sẽ yêu cầu xác
            minh trực tiếp.
          </p>
        </div>
      </div>

      <!-- Cảnh Báo Tồn Kho -->
      <div class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <svg
            class="w-6 h-6 mr-3 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.398 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
          Cảnh Báo Tồn Kho
        </h2>
        <p class="text-gray-600 mb-6 text-sm">
          Thiết lập mức tồn kho tối thiểu để kích hoạt cảnh báo.
        </p>
        <div class="w-full">
          <Input
            v-model="stockLevelProxy"
            type="number"
            id="stock-warning-level"
            placeholder="5"
            :inputClass="'setting-input w-32 text-center'"
            min="0"
            label="Ngưỡng cảnh báo (sản phẩm):"
          />
        </div>
        <div class="mt-6 p-4 bg-gray-50 rounded-md border border-gray-100">
          <p class="text-sm text-gray-600">
            Minh họa: Tồn kho <=
            <span class="font-bold text-gray-900">{{ settings.stockLevel }}</span> sẽ báo động đỏ.
          </p>
        </div>
      </div>
    </div>

    <div class="flex justify-end pt-8 mt-8 border-t">
      <button
        @click="saveSettings"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 shadow-md flex items-center"
      >
        <svg
          class="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
          ></path>
        </svg>
        Lưu Cài Đặt
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import Input from '@/components/ui/input/Input.vue'

const settings = reactive({
  maxOrder: 10000000,
  deposit: 10,
  maxCount: 3,
  stockLevel: 5,
})

const toast = useToast()

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const formattedMaxOrder = computed(() => {
  return formatNumber(settings.maxOrder)
})


const maxOrderProxy = computed({
  get() {
    return settings.maxOrder != null ? String(settings.maxOrder) : ''
  },
  set(val) {
    const n = Number(val.replace(/,/g, ''))
    settings.maxOrder = Number.isFinite(n) ? n : 0
  },
})

const depositProxy = computed({
  get() {
    return settings.deposit != null ? String(settings.deposit) : ''
  },
  set(val) {
    const n = Number(val)
    settings.deposit = Number.isFinite(n) ? n : 0
  },
})

const maxCountProxy = computed({
  get() {
    return settings.maxCount != null ? String(settings.maxCount) : ''
  },
  set(val) {
    const n = Number(val)
    settings.maxCount = Number.isFinite(n) ? n : 0
  },
})

const stockLevelProxy = computed({
  get() {
    return settings.stockLevel != null ? String(settings.stockLevel) : ''
  },
  set(val) {
    const n = Number(val)
    settings.stockLevel = Number.isFinite(n) ? n : 0
  },
})

const saveSettings = () => {
  localStorage.setItem('anhemMotorSettings', JSON.stringify(settings))

  toast.success('Đã lưu cài đặt thành công!')
}

const loadSettings = () => {
  const savedSettings = localStorage.getItem('anhemMotorSettings')
  if (savedSettings) {
    const parsedSettings = JSON.parse(savedSettings)
    Object.assign(settings, parsedSettings)
  }
}

onMounted(() => {
  loadSettings()
})
</script>
