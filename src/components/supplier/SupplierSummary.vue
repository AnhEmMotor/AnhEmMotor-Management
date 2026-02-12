<script setup>
import RoundBadge from '../ui/RoundBadge.vue'
import { formatCurrency } from '@/composables/useCurrency'

defineProps({
  itemData: Object,
  isOpen: Boolean,
})
defineEmits(['toggle-detail'])

function getStatusColor(statusId) {
  switch (statusId) {
    case 'active':
      return 'red'
    case 'inactive':
      return 'gray'
    default:
      return 'gray'
  }
}
</script>

<template>
  <div class="border p-3 md:p-0 md:border-none mb-3 md:mb-0" @click="$emit('toggle-detail')">
    <div
      class="hidden md:grid grid-cols-16 gap-2 items-center py-3 px-5 text-sm cursor-pointer transition duration-150"
    >
      <div class="font-medium text-gray-800 truncate text-sm col-span-8">{{ itemData.name }}</div>
      <div class="text-gray-600 text-xs col-span-2">{{ itemData.phone || '---' }}</div>
      <div class="text-gray-600 text-xs col-span-2">{{ itemData.email || 'Chưa có' }}</div>
      <div class="text-right text-sm font-semibold text-red-600 col-span-2 justify-self-end">
        {{ formatCurrency(itemData.totalInput) }}
      </div>
      <div class="flex justify-start col-span-2">
        <RoundBadge :color="getStatusColor(itemData.statusId)">
          {{ itemData.statusId === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động' }}
        </RoundBadge>
      </div>
    </div>

    <div class="block md:hidden space-y-2 text-sm">
      <div class="flex justify-between items-center">
        <div class="font-semibold text-gray-800">{{ itemData.id }}</div>
        <RoundBadge :color="getStatusColor(itemData.statusId)">
          {{ itemData.statusId === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động' }}
        </RoundBadge>
      </div>
      <div class="pt-2">
        <div class="font-medium text-gray-800 truncate">{{ itemData.name }}</div>
        <div class="text-gray-600 text-xs">{{ itemData.phone }}</div>
      </div>
      <div class="flex justify-between items-center pt-2">
        <div class="text-gray-500">Tổng mua</div>
        <div class="font-semibold text-red-600">{{ formatCurrency(itemData.totalInput) }}</div>
      </div>
    </div>
  </div>
</template>
