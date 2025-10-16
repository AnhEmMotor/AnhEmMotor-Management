<script setup>
defineProps({
    isOpen: Boolean,
    supplier: Object,
})
defineEmits(['close', 'confirm'])
</script>
<template>
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center"
      @click.self="$emit('close')"
    >
      <div class="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
        <div class="flex justify-between items-start border-b pb-3 mb-4">
          <h3 class="text-xl font-bold text-red-600 flex items-center">
            Xác nhận xóa
          </h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>
        <p class="text-gray-700 mb-6" v-if="supplier">
          Bạn có chắc chắn muốn xóa nhà cung cấp **<span class="font-semibold">{{
            supplier.name
          }}</span
          >** (ID: <span class="font-mono text-xs">{{ supplier.id }}</span
          >)? Thao tác này không thể hoàn tác.
        </p>
        <div class="mt-6 flex justify-end space-x-3">
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
        </div>
      </div>
    </div>
</template>
