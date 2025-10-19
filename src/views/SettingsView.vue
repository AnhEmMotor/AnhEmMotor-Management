<template>
  <div class="max-w-4xl mx-auto bg-white shadow-xl rounded-lg p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">⚙️ Cài Đặt Quy Tắc Bán Hàng</h1>

    <!-- Deposit Rule Section -->
    <div class="space-y-10">
      <div class="p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
        <h2 class="text-xl font-semibold text-gray-700 mb-4 flex items-center">
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
        <p class="text-gray-600 mb-4">Thiết lập quy tắc đơn hàng phải đặt cọc trước.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <BaseInput
              v-model="maxOrderProxy"
              type="text"
              id="max-order-value"
              placeholder="Ví dụ: 10000000"
              :inputClass="'setting-input w-full'"
              label="Giá trị đơn hàng vượt quá (X đồng):"
            />
          </div>
          <div>
            <label for="deposit-percentage" class="block text-sm font-medium text-gray-700 mb-1"
              >Tỷ lệ đặt cọc (Y%):</label
            >
            <div class="relative">
              <BaseInput
                v-model="depositProxy"
                type="number"
                id="deposit-percentage"
                placeholder="Ví dụ: 10"
                :inputClass="'setting-input w-full pr-10'"
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
        <p class="mt-4 text-sm text-blue-700 bg-blue-100 p-3 rounded-lg">
          Khi đơn hàng vượt quá
          <span class="font-bold text-lg">{{ formattedMaxOrder }}</span> đồng, khách hàng phải đặt
          cọc trước <span class="font-bold text-lg">{{ settings.deposit }}</span
          >%.
        </p>
      </div>

      <!-- Large Order Rule Section -->
      <div class="p-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
        <h2 class="text-xl font-semibold text-gray-700 mb-4 flex items-center">
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
        <p class="text-gray-600 mb-4">
          Cho phép tạo đơn hàng số lượng lớn nhưng yêu cầu gặp trực tiếp.
        </p>
        <div class="w-full md:w-1/2">
          <BaseInput
            v-model="maxCountProxy"
            type="number"
            id="max-motorcycle-count"
            placeholder="Ví dụ: 3"
            :inputClass="'setting-input w-full'"
            min="1"
            label="Số lượng xe máy tối đa (Z chiếc) trước khi yêu cầu gặp mặt:"
          />
        </div>
        <p class="mt-4 text-sm text-yellow-700 bg-yellow-100 p-3 rounded-lg">
          Khi tổng số lượng xe máy trong đơn hàng vượt quá
          <span class="font-bold text-lg">{{ settings.maxCount }}</span> chiếc, đơn hàng sẽ chuyển
          sang trạng thái chờ xác nhận và yêu cầu nhập thông tin liên hệ.
        </p>
      </div>

      <!-- Stock Warning Rule Section -->
      <div class="p-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
        <h2 class="text-xl font-semibold text-gray-700 mb-4 flex items-center">
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
        <p class="text-gray-600 mb-4">Thiết lập mức tồn kho tối thiểu để kích hoạt cảnh báo.</p>
        <div class="w-full md:w-1/2">
          <BaseInput
            v-model="stockLevelProxy"
            type="number"
            id="stock-warning-level"
            placeholder="Ví dụ: 5"
            :inputClass="'setting-input w-full'"
            min="0"
            label="Ngưỡng cảnh báo tồn kho (số lượng sản phẩm):"
          />
        </div>
        <p class="mt-4 text-sm text-red-700 bg-red-100 p-3 rounded-lg">
          Khi tồn kho của một sản phẩm bằng hoặc dưới
          <span class="font-bold text-lg">{{ settings.stockLevel }}</span
          >, hệ thống sẽ gửi cảnh báo.
        </p>
      </div>
    </div>

    <!-- Save Button -->
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
  <Notification :show="showNotification" message="✅ Đã lưu cài đặt thành công!" />
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import Notification from '@/components/settings/Notification.vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'

// Reactive state for settings
const settings = reactive({
  maxOrder: 10000000,
  deposit: 10,
  maxCount: 3,
  stockLevel: 5,
})

// State for notification visibility
const showNotification = ref(false)

// Format number with commas
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Computed property to display formatted max order value
const formattedMaxOrder = computed(() => {
  return formatNumber(settings.maxOrder)
})

// Because BaseInput works with string modelValue, use computed proxies to
// convert between string and number while keeping user input responsive.
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

// Function to save settings to localStorage
const saveSettings = () => {
  localStorage.setItem('anhemMotorSettings', JSON.stringify(settings))

  // Show notification
  showNotification.value = true
  // Hide notification after 3 seconds
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

// Function to load settings from localStorage
const loadSettings = () => {
  const savedSettings = localStorage.getItem('anhemMotorSettings')
  if (savedSettings) {
    const parsedSettings = JSON.parse(savedSettings)
    // Assign values to the reactive object
    Object.assign(settings, parsedSettings)
  }
}

// Load settings when the component is mounted
onMounted(() => {
  loadSettings()
})
</script>
