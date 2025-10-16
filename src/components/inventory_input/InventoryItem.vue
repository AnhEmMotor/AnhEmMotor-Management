<script setup>
import InventoryReceiptSummary from './InventoryReceiptSummary.vue'
import InventoryReceiptDetail from './InventoryReceiptDetail.vue'

defineProps({
  itemData: Object,
  isOpen: Boolean,
})
defineEmits(['toggle-detail', 'edit'])
</script>

<template>
  <div
    class="inventory-item bg-white"
    :class="{
      'item-open shadow-xl': isOpen,
      'shadow-sm border border-gray-200': !isOpen,
    }"
  >
    <div class="overflow-x-auto">
      <InventoryReceiptSummary
        :item-data="itemData"
        :is-open="isOpen"
        @toggle-detail="$emit('toggle-detail', itemData.id)"
      />
      <InventoryReceiptDetail v-if="isOpen" :item-data="itemData" @edit="$emit('edit', itemData)" />
    </div>
  </div>
</template>
