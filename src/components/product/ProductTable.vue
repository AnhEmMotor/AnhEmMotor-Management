<script setup>
import { ref } from 'vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import SmallNoBgButton from '@/components/ui/button/SmallNoBgButton.vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import IconLeftArrow from '@/assets/icons/IconLeftArrow.svg'
import IconDownArrow from '@/assets/icons/IconDownArrow.svg'
import IconEdit from '@/assets/icons/IconEdit.svg'
import IconTrash from '@/assets/icons/IconTrash.svg'
import { Permissions } from '@/constants/permissions'
import { usePermission } from '@/composables/usePermission'
import { getImageUrl } from '@/utils/image'
import ProductTableDetail from './ProductTableDetail.vue'

const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  inventoryStatusMap: {
    type: Object,
    default: () => ({}),
  },
  inventoryStatusColorMap: {
    type: Object,
    default: () => ({}),
  },
  sortDirection: {
    type: Function,
    default: () => '',
  },
})

const emit = defineEmits(['edit', 'delete', 'sort'])
const { hasPermission } = usePermission()

const expandedProductIds = ref([])
const activeTabs = ref({})

const isExpanded = (productId) => expandedProductIds.value.includes(productId)

const toggleDetails = (productId) => {
  const index = expandedProductIds.value.indexOf(productId)
  if (index > -1) {
    expandedProductIds.value.splice(index, 1)
  } else {
    expandedProductIds.value.push(productId)
  }
}

const getActiveTab = (productId) => activeTabs.value[productId] || 'variants'
const setActiveTab = (productId, tab) => {
  activeTabs.value[productId] = tab
}

const getInventoryStatusLabel = (statusKey) =>
  props.inventoryStatusMap[statusKey] || statusKey || 'Không rõ'
const getInventoryStatusColor = (statusKey) => props.inventoryStatusColorMap[statusKey] || 'gray'
</script>

<template>
  <div class="overflow-x-auto rounded-lg shadow-sm border border-gray-300">
    <table class="min-w-full bg-white border-collapse">
      <thead
        class="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-medium border-b border-gray-200"
      >
        <tr>
          <th class="py-3 px-6 text-left w-12"></th>
          <th class="py-3 px-6 text-left w-28">Ảnh Bìa</th>
          <th class="py-3 px-6 text-left">Tên Dòng Sản Phẩm</th>
          <th class="py-3 px-6 text-left">Danh Mục</th>
          <th class="py-3 px-6 text-left">Thương Hiệu</th>
          <th class="py-3 px-6 text-left">Số Biến Thể</th>
          <th
            class="py-3 px-6 text-left cursor-pointer hover:bg-gray-100 transition-colors"
            @click="emit('sort', 'inventoryStatus')"
          >
            <div class="flex items-center space-x-1">
              <span>Trạng Thái Kho</span>
              <div class="flex flex-col">
                <IconDownArrow
                  class="w-3 h-3 transition-colors"
                  :class="
                    sortDirection('inventoryStatus') === 'asc' ? 'text-red-500' : 'text-gray-300'
                  "
                  style="transform: rotate(180deg)"
                />
                <IconDownArrow
                  class="w-3 h-3 transition-colors -mt-1"
                  :class="
                    sortDirection('inventoryStatus') === 'desc' ? 'text-red-500' : 'text-gray-300'
                  "
                />
              </div>
            </div>
          </th>
          <th class="py-3 px-6 text-center">Thao Tác</th>
        </tr>
      </thead>
      <tbody class="text-gray-600 text-sm font-light">
        <template v-if="products.length === 0">
          <template v-if="isLoading">
            <tr v-for="i in 5" :key="i" class="border-b border-gray-200">
              <td class="py-3 px-6 text-center"><SkeletonLoader width="16px" height="16px" /></td>
              <td class="py-3 px-6">
                <SkeletonLoader width="96px" height="64px" class="rounded-md" />
              </td>
              <td class="py-3 px-6"><SkeletonLoader width="150px" height="20px" /></td>
              <td class="py-3 px-6"><SkeletonLoader width="100px" height="20px" /></td>
              <td class="py-3 px-6"><SkeletonLoader width="80px" height="20px" /></td>
              <td class="py-3 px-6"><SkeletonLoader width="40px" height="20px" /></td>
              <td class="py-3 px-6">
                <SkeletonLoader width="90px" height="24px" class="rounded-full" />
              </td>
              <td class="py-3 px-6 text-center flex justify-center gap-2 mt-4">
                <SkeletonLoader width="40px" height="20px" />
                <SkeletonLoader width="40px" height="20px" />
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="8" class="text-center py-6 text-gray-500">
              Không có sản phẩm nào để hiển thị.
            </td>
          </tr>
        </template>

        <template v-for="product in products" :key="product.id">
          <tr class="border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200">
            <td class="py-3 px-6 w-12 text-center border-r border-gray-200">
              <button
                v-if="product.variants && product.variants.length > 0"
                @click="toggleDetails(product.id)"
                class="text-gray-500 hover:text-gray-800"
              >
                <IconLeftArrow v-if="!isExpanded(product.id)" />
                <IconDownArrow v-else />
              </button>
            </td>
            <td class="py-3 px-6 text-left w-28">
              <div class="w-24 h-16 bg-white border border-gray-200 rounded-md overflow-hidden flex items-center justify-center shadow-sm">
                <img
                  :src="getImageUrl(product.cover_image_url)"
                  alt="Ảnh bìa"
                  class="max-w-full max-h-full object-contain"
                />
              </div>
            </td>
            <td class="py-3 px-6 whitespace-nowrap font-medium text-gray-800">
              {{ product.name }}
            </td>
            <td class="py-3 px-6">{{ product.category }}</td>
            <td class="py-3 px-6">{{ product.brand }}</td>
            <td class="py-3 px-6">{{ product.variants ? product.variants.length : 0 }}</td>
            <td class="py-3 px-6">
              <RoundBadge :color="getInventoryStatusColor(product.inventory_status)">
                {{ getInventoryStatusLabel(product.inventory_status) }}
              </RoundBadge>
            </td>
            <td class="py-3 px-6 text-center space-x-2">
              <SmallNoBgButton
                v-if="hasPermission(Permissions.ProductsEdit)"
                @click="emit('edit', product)"
                :icon="IconEdit"
              >
                Sửa
              </SmallNoBgButton>
              <SmallNoBgButton
                v-if="hasPermission(Permissions.ProductsDelete)"
                color="red"
                @click="emit('delete', product)"
                :icon="IconTrash"
              >
                Xóa
              </SmallNoBgButton>
            </td>
          </tr>

          <tr v-if="isExpanded(product.id)" class="bg-gray-50 border-b border-gray-200">
            <td colspan="8" class="p-0">
              <ProductTableDetail
                :product="product"
                :activeTab="getActiveTab(product.id)"
                :inventoryStatusColorMap="inventoryStatusColorMap"
                :inventoryStatusMap="inventoryStatusMap"
                @update:activeTab="(tab) => setActiveTab(product.id, tab)"
              />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>


