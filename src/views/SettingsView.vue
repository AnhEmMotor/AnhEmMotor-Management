<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import * as settingApi from '@/api/setting'
import Button from '@/components/ui/button/BaseButton.vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'

const toast = useToast()
const queryClient = useQueryClient()

// No toggles needed

const testOrderValue = ref(15000000)

const settings = reactive({
  maxOrder: 10000000,
  deposit: 10,
  maxCount: 3,
  stockLevel: 5,
})

// No toggles to watch

// Fetch settings from API
const { isPending: isLoading, data } = useQuery({
  queryKey: ['settings'],
  queryFn: settingApi.fetchSettings,
  staleTime: 1000 * 60 * 5, // 5 minutes
})

watch(
  data,
  (newData) => {
    if (newData) {
      settings.deposit = Number(newData['Deposit_ratio']) || 0
      settings.stockLevel = Number(newData['Inventory_alert_level']) || 0
      settings.maxOrder = Number(newData['Order_value_exceeds']) || 0
      settings.maxCount = Number(newData['Z-bike_threshold_for_meeting']) || 0
    }
  },
  { immediate: true },
)

// Update settings
const { mutate: saveSettingsCore, isPending: isSaving } = useMutation({
  mutationFn: (payload) => settingApi.updateSettings(payload),
  onSuccess: (updatedData) => {
    queryClient.setQueryData(['settings'], updatedData)
    toast.success('Đã lưu cài đặt thành công!')
  },
  onError: (error) => {
    toast.error(error?.response?.data?.message || 'Lỗi khi lưu cài đặt')
  },
})

const saveSettings = () => {
  const payload = {
    Deposit_ratio: String(settings.deposit),
    Inventory_alert_level: String(settings.stockLevel),
    Order_value_exceeds: String(settings.maxOrder),
    'Z-bike_threshold_for_meeting': String(settings.maxCount),
  }
  saveSettingsCore(payload)
}

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const parseNumber = (str) => {
  const n = Number(String(str).replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

const depositAmount = computed(() => {
  if (testOrderValue.value <= settings.maxOrder) return 0
  return Math.round(testOrderValue.value * (settings.deposit / 100))
})

const needsDeposit = computed(() => testOrderValue.value > settings.maxOrder)

const handleMaxOrderInput = (e) => {
  settings.maxOrder = parseNumber(e.target.value)
}

const handleDepositInput = (e) => {
  const n = Number(e.target.value)
  settings.deposit = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0
}

const handleMaxCountInput = (e) => {
  const n = Number(e.target.value)
  settings.maxCount = Number.isFinite(n) ? Math.max(1, n) : 1
}

const handleStockLevelInput = (e) => {
  const n = Number(e.target.value)
  settings.stockLevel = Number.isFinite(n) ? Math.max(0, n) : 0
}

const handleTestValueInput = (e) => {
  testOrderValue.value = parseNumber(e.target.value)
}

const resetDefaults = () => {
  Object.assign(settings, { maxOrder: 10000000, deposit: 10, maxCount: 3, stockLevel: 5 })
  testOrderValue.value = 15000000
  toast.info('Đã khôi phục cài đặt cơ bản (Chưa lưu)')
}
</script>

<template>
  <div class="p-6 rounded-xl shadow-lg bg-white">
    <div
      class="flex items-start justify-between mb-6 sticky top-0 bg-white z-10 pb-4 border-b border-gray-200"
    >
      <div>
        <h1 class="text-3xl font-bold mb-1 text-gray-800">Cài Đặt Bán Hàng</h1>
        <p class="text-gray-500 text-sm">
          Quản lý quy tắc đặt cọc, giới hạn đơn hàng và cảnh báo tồn kho
        </p>
      </div>
      <div v-if="isLoading" class="flex gap-2">
        <SkeletonLoader width="100px" height="2.5rem" className="rounded-lg" />
        <SkeletonLoader width="120px" height="2.5rem" className="rounded-lg" />
      </div>
      <div v-else class="flex items-center gap-2">
        <Button color="secondary" text="Mặc định" @click="resetDefaults" />
        <Button color="primary" text="Lưu thay đổi" @click="saveSettings" />
      </div>
    </div>

    <template v-if="isLoading">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonLoader height="320px" className="rounded-lg" />
        <div class="space-y-6">
          <SkeletonLoader height="180px" className="rounded-lg" />
          <SkeletonLoader height="220px" className="rounded-lg" />
        </div>
      </div>
    </template>

    <template v-else>
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
                      :value="formatNumber(settings.maxOrder)"
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
                  <label class="block text-xs font-medium text-gray-500 mb-1.5"
                    >Tỷ lệ đặt cọc</label
                  >
                  <div class="relative">
                    <input
                      type="number"
                      :value="settings.deposit"
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
                      :value="formatNumber(testOrderValue)"
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
                    <span class="font-bold">{{ formatNumber(depositAmount) }} VNĐ</span>
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
                    :value="settings.maxCount"
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
                  Đơn hàng vượt quá <span class="font-bold">{{ settings.maxCount }} xe</span> sẽ
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
                    :value="settings.stockLevel"
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
                    >Tồn kho: <span class="font-bold">{{ settings.stockLevel }}</span></span
                  >
                  <span class="text-gray-300">→</span>
                  <RoundBadge color="yellow">Sắp hết hàng</RoundBadge>
                </div>
                <div class="flex items-center gap-3 mt-2">
                  <span class="text-sm text-gray-700"
                    >Tồn kho: <span class="font-bold">0</span></span
                  >
                  <span class="text-gray-300">→</span>
                  <RoundBadge color="red">Hết hàng</RoundBadge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
