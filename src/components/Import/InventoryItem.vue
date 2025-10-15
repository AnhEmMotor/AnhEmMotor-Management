<script setup>
import InventoryReceiptSummary from './InventoryReceiptSummary.vue'
import InventoryReceiptDetail from './InventoryReceiptDetail.vue'

defineProps({
  itemData: Object,
})
defineEmits(['toggle-detail'])
</script>

<template>
  <div
    class="inventory-item bg-white rounded-md"
    :class="{
      'item-open shadow-xl': itemData.isOpen,
      'shadow-sm border border-gray-200': !itemData.isOpen,
    }"
  >
    <div class="overflow-x-auto">
      <InventoryReceiptSummary
        :item-data="itemData"
        :is-open="itemData.isOpen"
        @toggle-detail="$emit('toggle-detail', itemData.id)"
      />
      <InventoryReceiptDetail v-if="itemData.isOpen" :item-data="itemData" />
    </div>
  </div>
</template>
