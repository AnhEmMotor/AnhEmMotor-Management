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
      'item-open shadow-xl': isOpen,
      'shadow-sm border border-gray-200': !isOpen,
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
