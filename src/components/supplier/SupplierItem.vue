<script setup>
import SupplierSummary from './SupplierSummary.vue'
import SupplierDetail from './SupplierDetail.vue'

defineProps({
  itemData: Object,
})
defineEmits(['toggle-detail', 'edit-supplier', 'delete-supplier', 'toggle-activation'])
</script>

<template>
  <div
    class="supplier-item bg-white"
    :class="{
      'item-open shadow-xl': itemData.isOpen,
      'shadow-sm border border-gray-200': !itemData.isOpen,
    }"
  >
    <div class="overflow-x-auto">
      <SupplierSummary
        :item-data="itemData"
        :is-open="itemData.isOpen"
        @toggle-detail="$emit('toggle-detail', itemData.id)"
      />
      <SupplierDetail 
        v-if="itemData.isOpen" 
        :item-data="itemData"
        @edit-supplier="$emit('edit-supplier', itemData)"
        @delete-supplier="$emit('delete-supplier', itemData)"
        @toggle-activation="$emit('toggle-activation', itemData.id)"
      />
    </div>
  </div>
</template>
