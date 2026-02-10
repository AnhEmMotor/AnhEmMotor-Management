<script setup>
import SupplierSummary from './SupplierSummary.vue'
import SupplierDetail from './SupplierDetail.vue'

defineProps({
  itemData: Object,
  isOpen: Boolean,
})
defineEmits(['toggle-detail', 'edit-supplier', 'delete-supplier', 'toggle-activation'])
</script>

<template>
  <div
    class="supplier-item bg-white"
    :class="{
      'item-open z-10 relative shadow-md my-2 rounded-lg border border-gray-200': isOpen,
      'hover:bg-gray-50 transition-colors': !isOpen,
    }"
  >
    <div class="overflow-x-auto">
      <SupplierSummary
        :item-data="itemData"
        :is-open="isOpen"
        @toggle-detail="$emit('toggle-detail', itemData.id)"
      />
      <SupplierDetail
        v-if="isOpen"
        :item-data="itemData"
        @edit-supplier="$emit('edit-supplier', itemData)"
        @delete-supplier="$emit('delete-supplier', itemData)"
        @toggle-activation="$emit('toggle-activation', itemData.id)"
      />
    </div>
  </div>
</template>
