<script setup>
import FullScreenModal from '@/components/ui/FullScreenModal.vue'

defineProps({
  isOpen: Boolean,
  supplier: Object,
})
defineEmits(['close', 'confirm'])
</script>
<template>
  <FullScreenModal :show="isOpen" title="Xác nhận xóa" @close="$emit('close')">
    <p class="text-gray-700" v-if="supplier">
      Bạn có chắc chắn muốn xóa nhà cung cấp
      <strong class="font-semibold">{{ supplier.name }}</strong>
      (ID: <span class="font-mono text-xs">{{ supplier.id }}</span
      >)? Thao tác này không thể hoàn tác.
    </p>

    <template #actions>
      <button
        type="button"
        @click="$emit('close')"
        class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
      >
        Hủy
      </button>
      <button
        type="button"
        @click="$emit('confirm')"
        class="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Xóa vĩnh viễn
      </button>
    </template>
  </FullScreenModal>
</template>

