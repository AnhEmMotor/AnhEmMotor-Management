<script setup>
import { reactive, computed, watch, ref } from 'vue'
import Button from '@/components/ui/button/BaseButton.vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import { formatCurrency, parseCurrency } from '@/utils/currency'

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['save', 'reset'])

const localSettings = reactive({ ...props.settings })
const testOrderValue = ref(15000000)

watch(
  () => props.settings,
  (newVal) => {
    Object.assign(localSettings, newVal)
  },
  { deep: true },
)

const depositAmount = computed(() => {
  if (testOrderValue.value <= localSettings.maxOrder) return 0
  return Math.round(testOrderValue.value * (localSettings.deposit / 100))
})

const needsDeposit = computed(() => testOrderValue.value > localSettings.maxOrder)

const handleMaxOrderInput = (e) => {
  localSettings.maxOrder = parseCurrency(e.target.value)
}

const handleDepositInput = (e) => {
  const n = Number(e.target.value)
  localSettings.deposit = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0
}

const handleMaxCountInput = (e) => {
  const n = Number(e.target.value)
  localSettings.maxCount = Number.isFinite(n) ? Math.max(1, n) : 1
}

const handleStockLevelInput = (e) => {
  const n = Number(e.target.value)
  localSettings.stockLevel = Number.isFinite(n) ? Math.max(0, n) : 0
}

const handleTestValueInput = (e) => {
  testOrderValue.value = parseCurrency(e.target.value)
}

const handleSave = () => {
  emit('save', { ...localSettings })
}

const handleReset = () => {
  emit('reset')
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-xl font-semibold text-gray-800">Cấu hình chi tiết</h2>
      <div class="flex items-center gap-2">
        <Button color="secondary" text="Mặc định" @click="handleReset" />
        <Button color="primary" text="Lưu thay đổi" :loading="isSaving" @click="handleSave" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-6">
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <div
            class="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200"
          >
            <div class="flex items-center gap-2">
              <span class="text-red-600 text-lg">💰</span>
              <h2 class="text-sm font-semibold text-gray-800">Quy Tắc Đặt Cọc</h2>
            </div>
          </div>

          <div class="p-5 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1.5"
                  >Đơn hàng vượt quá</label
                >
                <div class="relative">
                  <input
                    type="text"
                    :value="formatCurrency(localSettings.maxOrder)"
                    @input="handleMaxOrderInput"
                    class="w-full px-3 py-2 pr-12 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
                  />
                  <span
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium"
                    >VNĐ</span
                  >
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1.5">Tỷ lệ đặt cọc</label>
                <div class="relative">
                  <input
                    type="number"
                    :value="localSettings.deposit"
                    @input="handleDepositInput"
                    min="0"
                    max="100"
                    class="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
                  />
                  <span
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium"
                    >%</span
                  >
                </div>
              </div>
            </div>

            <div class="p-3 bg-red-50 border border-red-100 rounded-lg">
              <p class="text-xs font-semibold text-red-600 mb-2">⚡ Dùng thử</p>
              <div class="flex items-center gap-2 mb-2">
                <label class="text-xs text-gray-500 shrink-0">Giá trị đơn:</label>
                <div class="relative flex-1">
                  <input
                    type="text"
                    :value="formatCurrency(testOrderValue)"
                    @input="handleTestValueInput"
                    class="w-full px-3 py-1.5 pr-12 text-sm border border-red-200 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none bg-white"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                    >VNĐ</span
                  >
                </div>
              </div>
              <div
                class="text-sm font-medium"
                :class="needsDeposit ? 'text-red-700' : 'text-gray-500'"
              >
                <template v-if="needsDeposit">
                  → Khách phải cọc:
                  <span class="font-bold">{{ formatCurrency(depositAmount) }} VNĐ</span>
                </template>
                <template v-else> → Không yêu cầu cọc (đơn hàng chưa vượt ngưỡng) </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <div
            class="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200"
          >
            <div class="flex items-center gap-2">
              <span class="text-yellow-600 text-lg">📦</span>
              <h2 class="text-sm font-semibold text-gray-800">Giới Hạn Đơn Hàng</h2>
            </div>
          </div>

          <div class="p-5 space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5"
                >Số lượng xe tối đa / đơn</label
              >
              <div class="relative w-40">
                <input
                  type="number"
                  :value="localSettings.maxCount"
                  @input="handleMaxCountInput"
                  min="1"
                  class="w-full px-3 py-2 pr-14 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
                />
                <span
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium"
                  >chiếc</span
                >
              </div>
            </div>
            <div
              class="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-100 rounded-lg"
            >
              <span class="text-yellow-500 text-sm mt-0.5">ℹ️</span>
              <p class="text-xs text-yellow-700">
                Đơn hàng vượt quá <span class="font-bold">{{ localSettings.maxCount }} xe</span> sẽ
                chuyển sang trạng thái <span class="font-semibold">"Chờ duyệt"</span> thay vì xác
                nhận ngay. Admin cần phê duyệt thủ công.
              </p>
            </div>
          </div>
        </div>

        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <div
            class="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200"
          >
            <div class="flex items-center gap-2">
              <span class="text-red-600 text-lg">⚠️</span>
              <h2 class="text-sm font-semibold text-gray-800">Cảnh Báo Tồn Kho</h2>
            </div>
          </div>

          <div class="p-5 space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5"
                >Ngưỡng cảnh báo chung</label
              >
              <div class="relative w-40">
                <input
                  type="number"
                  :value="localSettings.stockLevel"
                  @input="handleStockLevelInput"
                  min="0"
                  class="w-full px-3 py-2 pr-16 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
                />
                <span
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium"
                  >sản phẩm</span
                >
              </div>
            </div>
            <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p class="text-xs text-gray-500 mb-2">Xem trước hiển thị:</p>
              <div class="flex items-center gap-3">
                <span class="text-sm text-gray-700"
                  >Tồn kho: <span class="font-bold">{{ localSettings.stockLevel }}</span></span
                >
                <span class="text-gray-300">→</span>
                <RoundBadge color="yellow">Sắp hết hàng</RoundBadge>
              </div>
              <div class="flex items-center gap-3 mt-2">
                <span class="text-sm text-gray-700">Tồn kho: <span class="font-bold">0</span></span>
                <span class="text-gray-300">→</span>
                <RoundBadge color="red">Hết hàng</RoundBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
