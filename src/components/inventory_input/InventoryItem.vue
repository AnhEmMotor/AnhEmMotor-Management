<script setup>
import InventoryReceiptSummary from './InventoryReceiptSummary.vue'
import InventoryReceiptDetail from './InventoryReceiptDetail.vue'

defineProps({
  itemData: Object,
  isOpen: Boolean,
})
const emit = defineEmits([
  'toggle-detail',
  'edit',
  'cancel-request',
  'copy',
  'complete-request',
  'save-notes',
])
</script>

<template>
  <div
    class="inventory-item bg-white"
    :class="{
      'item-open z-10 relative shadow-md my-2 rounded-lg border border-gray-200': isOpen,
      'hover:bg-gray-50 transition-colors': !isOpen,
    }"
  >
    <div class="overflow-x-auto">
      <InventoryReceiptSummary
        :item-data="itemData"
        :is-open="isOpen"
        @toggle-detail="() => emit('toggle-detail', itemData.id)"
        @edit="() => emit('edit', itemData)"
        @copy="() => emit('copy', itemData)"
        @cancel-request="() => emit('cancel-request', itemData)"
      />
      <InventoryReceiptDetail
        v-if="isOpen"
        :item-data="itemData"
        @edit="() => emit('edit', itemData)"
        @copy="() => emit('copy', itemData)"
        @cancel-request="() => emit('cancel-request', itemData)"
        @save-notes="(payload) => emit('save-notes', payload)"
      />
    </div>
  </div>
</template>
