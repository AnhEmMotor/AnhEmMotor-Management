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
  categories: {
    type: Array,
    required: true,
  },
  pagination: {
    type: Object,
    required: true,
  },
  isSavingSettings: {
    type: Boolean,
    default: false,
  },
  isSavingCategory: {
    type: Boolean,
    default: false,
  },
  searchRefs: {
    type: Object,
    required: true,
  },
  pagination: {
    type: Object,
    required: true,
  },
  isFetchingCategories: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['saveDeposit', 'saveStock', 'saveCategoryLimit'])

const localSettings = reactive({ ...props.settings })
const localCategories = ref([])

watch(
  () => props.categories,
  (newVal) => {
    localCategories.value = newVal.map((c) => ({ ...c }))
  },
  { immediate: true },
)

watch(
  () => props.settings,
  (newVal) => {
    Object.assign(localSettings, newVal)
  },
  { deep: true },
)

const handleSaveDeposit = () => {
  emit('saveDeposit', {
    maxOrder: localSettings.maxOrder,
    deposit: localSettings.deposit,
  })
}

const handleSaveStock = () => {
  emit('saveStock', localSettings.stockLevel)
}

const handleSaveCategoryLimit = (category) => {
  emit('saveCategoryLimit', category)
}

// Formatters and Handlers
const handleMaxOrderInput = (e) => {
  localSettings.maxOrder = parseCurrency(e.target.value)
}

const handleDepositInput = (e) => {
  const n = Number(e.target.value)
  localSettings.deposit = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0
}

const handleStockLevelInput = (e) => {
  const n = Number(e.target.value)
  localSettings.stockLevel = Number.isFinite(n) ? Math.max(0, n) : 0
}
</script>

<template>
  <div class="space-y-8">
    <!-- Section 1: Quy Tắc Đặt Cọc -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">💰</span>
          <div>
            <h2 class="text-lg font-bold text-gray-800">Quy Tắc Đặt Cọc</h2>
            <p class="text-xs text-gray-500">Cấu hình giá trị đơn hàng cần đặt cọc và tỷ lệ %</p>
          </div>
        </div>
        <Button
          color="primary"
          text="Lưu Quy Tắc Cọc"
          :loading="isSavingSettings"
          @click="handleSaveDeposit"
        />
      </div>

      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Đơn hàng vượt quá</label>
            <div class="relative">
              <input
                type="text"
                :value="formatCurrency(localSettings.maxOrder)"
                @input="handleMaxOrderInput"
                class="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
              />
              <span
                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm"
                >VNĐ</span
              >
            </div>
            <p class="mt-2 text-xs text-gray-400">
              Ngưỡng giá trị để hệ thống yêu cầu khách hàng đặt cọc trước.
            </p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Tỷ lệ đặt cọc (%)</label>
            <div class="relative">
              <input
                type="number"
                v-model="localSettings.deposit"
                min="0"
                max="100"
                class="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
              />
              <span
                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm"
                >%</span
              >
            </div>
            <p class="mt-2 text-xs text-gray-400">
              Phần trăm giá trị đơn hàng khách phải thanh toán trước.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: Giới Hạn Đơn Hàng Theo Thể Loại -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">📦</span>
          <div>
            <h2 class="text-lg font-bold text-gray-800">Giới Hạn Đơn Hàng</h2>
            <p class="text-xs text-gray-500">
              Giới hạn số lượng mua tối đa của từng thể loại sản phẩm
            </p>
          </div>
        </div>
        <div class="relative w-64">
          <input
            type="text"
            v-model="searchRefs.search"
            placeholder="Tìm thể loại..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all text-sm"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <template v-if="isFetchingCategories">
              <div
                class="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"
              ></div>
            </template>
            <template v-else> 🔍 </template>
          </span>
        </div>
      </div>

      <div class="p-6 bg-yellow-50 border-t border-yellow-100">
        <div class="flex gap-3">
          <span class="text-xl">ℹ️</span>
          <p class="text-sm text-yellow-800 leading-relaxed">
            <span class="font-bold">Giải thích:</span> Khi khách hàng thêm sản phẩm vào giỏ hàng, hệ
            thống sẽ kiểm tra tổng số lượng sản phẩm thuộc thể loại này. Nếu vượt quá giới hạn đã
            đặt, khách hàng sẽ được yêu cầu giảm số lượng. Điều này giúp kiểm soát các mặt hàng khan
            hiếm hoặc giá trị cao. Bạn vẫn có thể tạo đơn hàng có số sản phẩm cao hơn con số này ở
            trong trang quản trị.
          </p>
        </div>
      </div>

      <div class="p-0 relative">
        <!-- Subtle loading overlay for the table only -->
        <div
          v-if="isFetchingCategories"
          class="absolute inset-0 bg-white/30 backdrop-blur-[1px] z-10 flex items-center justify-center"
        ></div>

        <table
          class="w-full text-left"
          :class="{ 'opacity-50 pointer-events-none': isFetchingCategories }"
        >
          <thead
            class="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-100"
          >
            <tr>
              <th class="px-6 py-4">Thể loại sản phẩm</th>
              <th class="px-6 py-4 w-48">Số lượng tối đa</th>
              <th class="px-6 py-4 w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <template v-if="localCategories.length > 0">
              <tr
                v-for="cat in localCategories"
                :key="cat.id"
                class="hover:bg-gray-50 transition-colors group"
              >
                <td class="px-6 py-4">
                  <div class="font-medium text-gray-900">{{ cat.name }}</div>
                  <div v-if="cat.description" class="text-xs text-gray-400">
                    {{ cat.description }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <input
                      type="number"
                      v-model="cat.maxPurchaseQuantity"
                      placeholder="Không giới hạn"
                      class="w-32 px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    @click="handleSaveCategoryLimit(cat)"
                    :disabled="isSavingCategory"
                    class="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    Lưu
                  </button>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr>
                <td colspan="3" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center gap-2 text-gray-400">
                    <span class="text-3xl">🔍</span>
                    <p class="text-sm">Không tìm thấy kết quả phù hợp</p>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- Pagination -->
        <div
          class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50"
        >
          <span class="text-sm text-gray-500 font-medium">
            Trang {{ pagination.currentPage.value }} / {{ pagination.totalPages.value }}
          </span>
          <div v-if="pagination.totalCount.value > 5" class="flex gap-2">
            <button
              @click="pagination.prevPage"
              :disabled="pagination.isFirstPage.value"
              class="px-3 py-1 border border-gray-300 rounded disabled:opacity-30 hover:bg-white text-sm"
            >
              Trước
            </button>
            <button
              @click="pagination.nextPage"
              :disabled="pagination.isLastPage.value"
              class="px-3 py-1 border border-gray-300 rounded disabled:opacity-30 hover:bg-white text-sm"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Cảnh Báo Tồn Kho -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">⚠️</span>
          <div>
            <h2 class="text-lg font-bold text-gray-800">Cảnh Báo Tồn Kho</h2>
            <p class="text-xs text-gray-500">
              Ngưỡng hiển thị trạng thái sản phẩm trong trang quản lý
            </p>
          </div>
        </div>
        <Button
          color="primary"
          text="Lưu Cảnh Báo"
          :loading="isSavingSettings"
          @click="handleSaveStock"
        />
      </div>

      <div class="p-6">
        <div class="max-w-md">
          <label class="block text-sm font-semibold text-gray-700 mb-2"
            >Ngưỡng cảnh báo chung</label
          >
          <div class="relative w-48">
            <input
              type="number"
              v-model.number="localSettings.stockLevel"
              min="0"
              class="w-full pl-4 pr-20 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
            />
            <span
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm text-right"
              >Sản phẩm</span
            >
          </div>

          <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Xem trước hiển thị
            </p>
            <div class="flex items-center gap-4">
              <span class="text-sm font-medium">Tồn kho ≤ {{ localSettings.stockLevel }}</span>
              <span class="text-gray-300">→</span>
              <RoundBadge color="yellow">Sắp hết hàng</RoundBadge>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm font-medium">Tồn kho = 0</span>
              <span class="text-gray-300">→</span>
              <RoundBadge color="red">Hết hàng</RoundBadge>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
