<script setup>
import RoundBadge from '@components/ui/RoundBadge.vue'
import { formatCurrency } from '@/utils/currency'

defineProps({
  products: {
    type: Array,
    required: true,
  },
})

const getTrendIcon = (trend) => {
  if (!trend || trend.length < 2) return '—'
  const last = trend[trend.length - 1]
  const prev = trend[trend.length - 2]
  if (last > prev) return '📈'
  if (last < prev) return '📉'
  return '➖'
}
</script>

<template>
  <div class="overflow-x-auto rounded-lg shadow-sm border border-gray-300">
    <table class="min-w-full bg-white border-collapse">
      <thead>
        <tr
          class="bg-gray-50 text-gray-500 uppercase text-xs font-medium tracking-wider leading-normal border-b border-gray-200"
        >
          <th class="py-3 px-4 text-left">Sản Phẩm</th>
          <th class="py-3 px-4 text-right">Giá Bán</th>
          <th class="py-3 px-4 text-right">Đã Bán (30d)</th>
          <th class="py-3 px-4 text-left w-36">Tồn Kho</th>
          <th class="py-3 px-4 text-right">Margin</th>
          <th class="py-3 px-4 text-center">Trạng Thái</th>
        </tr>
      </thead>
      <tbody class="text-gray-600 text-sm">
        <tr
          v-for="product in products"
          :key="product.productName"
          class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <td class="py-3 px-4 whitespace-nowrap">
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0"
              >
                SP
              </div>
              <span class="font-medium text-gray-900">{{ product.productName }}</span>
            </div>
          </td>
          <td class="py-3 px-4 whitespace-nowrap text-right font-mono text-gray-700">
            {{ formatCurrency(product.sellPrice) }}
          </td>
          <td class="py-3 px-4 whitespace-nowrap text-right">
            <span class="font-mono text-gray-700">{{ product.soldCount30Days }}</span>
            <span class="ml-1">{{ getTrendIcon(product.trend) }}</span>
          </td>
          <td class="py-3 px-4 whitespace-nowrap">
            <div class="flex items-center gap-2">
              <span class="font-mono text-gray-700 w-8 text-right">{{
                product.stockQuantity
              }}</span>
              <div class="flex-1">
                <div class="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    class="h-1.5 rounded-full transition-all duration-500"
                    :class="
                      product.stockQuantity === 0
                        ? 'bg-gray-300'
                        : product.stockQuantity < 5
                          ? 'bg-yellow-400'
                          : 'bg-green-400'
                    "
                    :style="{ width: `${product.stockPercent}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </td>
          <td class="py-3 px-4 whitespace-nowrap text-right">
            <span
              class="font-semibold"
              :class="
                product.marginPercentage >= 30
                  ? 'text-green-600'
                  : product.marginPercentage >= 20
                    ? 'text-yellow-600'
                    : 'text-red-600'
              "
            >
              {{ product.marginPercentage }}%
            </span>
          </td>
          <td class="py-3 px-4 whitespace-nowrap text-center">
            <RoundBadge :color="product.stockStatus.color">
              {{ product.stockStatus.text }}
            </RoundBadge>
          </td>
        </tr>
        <tr v-if="products.length === 0">
          <td colspan="6" class="text-center py-8 text-gray-400">
            Không tìm thấy sản phẩm phù hợp
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>



