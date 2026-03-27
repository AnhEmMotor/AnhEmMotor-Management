<script setup>
import { useQuery } from '@tanstack/vue-query'
import productService from '@/services/product.service'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import { formatCurrency } from '@/utils/currency'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  activeTab: {
    type: String,
    default: 'variants',
  },
  inventoryStatusMap: {
    type: Object,
    default: () => ({}),
  },
  inventoryStatusColorMap: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:activeTab'])

const { data: predefinedOptionsData } = useQuery({
  queryKey: ['predefinedOptions'],
  queryFn: () => productService.getPredefinedOptions(),
  staleTime: 5 * 60 * 1000,
})

/*
 * const formatCurrency = (value) => {
 *   if (value === null || value === undefined) return ''
 *   return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
 * }
 */

const getVariantOptionsText = (variant) => {
  if (!variant.optionValues) return 'Mặc định'
  const values = Object.entries(variant.optionValues)
  if (values.length === 0) return 'Mặc định'
  const dict = predefinedOptionsData.value || {}
  return values.map(([key, value]) => `${dict[key] || key}: ${value}`).join(', ')
}

const getInventoryStatusLabel = (statusKey) =>
  props.inventoryStatusMap[statusKey] || statusKey || 'Không rõ'
const getInventoryStatusColor = (statusKey) => props.inventoryStatusColorMap[statusKey] || 'gray'
</script>

<template>
  <div class="p-3 px-10 border-t border-gray-200 bg-white">
    <!-- Tabs -->
    <div class="flex border-b border-gray-200 mb-3 space-x-5">
      <button
        class="py-1.5 text-sm transition-all duration-200"
        :class="
          activeTab === 'variants'
            ? 'font-semibold border-b-2 border-red-500 text-red-600'
            : 'text-gray-600 hover:text-gray-800'
        "
        @click="emit('update:activeTab', 'variants')"
      >
        Biến thể sản phẩm
      </button>
      <button
        class="py-1.5 text-sm transition-all duration-200"
        :class="
          activeTab === 'specs'
            ? 'font-semibold border-b-2 border-red-500 text-red-600'
            : 'text-gray-600 hover:text-gray-800'
        "
        @click="emit('update:activeTab', 'specs')"
      >
        Thông số kỹ thuật
      </button>
    </div>

    <!-- Tab Content: Variants -->
    <div v-show="activeTab === 'variants'">
      <table
        class="min-w-full bg-white rounded shadow-sm text-sm border border-gray-200 overflow-hidden"
      >
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="py-2 px-4 text-left w-20 text-gray-700 font-semibold tracking-wider">Ảnh</th>
            <th class="py-2 px-4 text-left text-gray-700 font-semibold tracking-wider">
              Thuộc tính
            </th>
            <th class="py-2 px-4 text-left text-gray-700 font-semibold tracking-wider">Giá Bán</th>
            <th class="py-2 px-4 text-left text-gray-700 font-semibold tracking-wider">Tồn Kho</th>
            <th class="py-2 px-4 text-left text-gray-700 font-semibold tracking-wider">Đã Đặt</th>
            <th class="py-2 px-4 text-left text-gray-700 font-semibold tracking-wider">Hiện Có</th>
            <th class="py-2 px-4 text-left text-gray-700 font-semibold tracking-wider">
              Trạng Thái
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="variant in product.variants"
            :key="variant.id"
            class="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150"
          >
            <td class="py-2 px-4 w-20">
              <img
                :src="variant.cover_image_url || 'https://placehold.co/100x100/gray/white?text=N/A'"
                class="w-12 h-12 object-cover rounded-md border border-gray-200"
              />
            </td>
            <td class="py-2 px-4 text-gray-800 font-medium">
              {{ getVariantOptionsText(variant) }}
            </td>
            <td class="py-2 px-4 font-semibold text-gray-900">
              {{ formatCurrency(variant.price) }}
            </td>
            <td class="py-2 px-4 text-gray-600">{{ variant.stock }}</td>
            <td class="py-2 px-4 text-gray-600">{{ variant.has_been_booked }}</td>
            <td
              class="py-2 px-4 font-medium"
              :class="
                getInventoryStatusColor(variant.inventory_status) === 'green'
                  ? 'text-green-600'
                  : getInventoryStatusColor(variant.inventory_status) === 'yellow'
                    ? 'text-yellow-500'
                    : 'text-red-500'
              "
            >
              {{ variant.stock - variant.has_been_booked }}
            </td>
            <td class="py-2 px-4">
              <RoundBadge :color="getInventoryStatusColor(variant.inventory_status)">
                {{ getInventoryStatusLabel(variant.inventory_status) }}
              </RoundBadge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tab Content: Specs -->
    <div v-show="activeTab === 'specs'" class="pt-2">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
        <div class="text-sm">
          <span class="text-gray-500 block">Khối lượng</span>
          <span class="font-medium text-gray-800">{{
            product.weight ? product.weight + ' kg' : '---'
          }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-500 block">Kích thước</span>
          <span class="font-medium text-gray-800">{{ product.dimensions || '---' }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-500 block">Dung tích</span>
          <span class="font-medium text-gray-800">{{
            product.displacement ? product.displacement + ' cc' : '---'
          }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-500 block">Tỷ số nén</span>
          <span class="font-medium text-gray-800">{{ product.compression_ratio || '---' }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-500 block">Đường kính x Hành trình piston</span>
          <span class="font-medium text-gray-800">{{ product.bore_stroke || '---' }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-500 block">Loại động cơ</span>
          <span class="font-medium text-gray-800">{{ product.engine_type || '---' }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-500 block">Công suất tối đa</span>
          <span class="font-medium text-gray-800">{{ product.max_power || '---' }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-500 block">Mô-men xoắn cực đại</span>
          <span class="font-medium text-gray-800">{{ product.max_torque || '---' }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-500 block">Khoảng cách trục bánh xe</span>
          <span class="font-medium text-gray-800">{{
            product.wheelbase ? product.wheelbase + ' mm' : '---'
          }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-500 block">Độ cao yên</span>
          <span class="font-medium text-gray-800">{{
            product.seat_height ? product.seat_height + ' mm' : '---'
          }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-500 block">Khoảng sáng gầm xe</span>
          <span class="font-medium text-gray-800">{{
            product.ground_clearance ? product.ground_clearance + ' mm' : '---'
          }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-500 block">Dung tích bình xăng</span>
          <span class="font-medium text-gray-800">{{
            product.fuel_capacity ? product.fuel_capacity + ' lít' : '---'
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
