<script setup>
defineProps({
  role: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div
    class="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
  >
    <!-- STT -->
    <div class="col-span-1 flex items-center justify-center text-gray-600">
      {{ index + 1 }}
    </div>

    <!-- Tên vai trò -->
    <div class="col-span-3 flex items-center">
      <div>
        <p class="font-semibold text-gray-800">{{ role.name }}</p>
        <p class="text-xs text-gray-500">Tạo: {{ role.createdAt }}</p>
      </div>
    </div>

    <!-- Ghi chú -->
    <div class="col-span-4 flex items-center">
      <p class="text-gray-600 text-sm line-clamp-2">
        {{ role.description || 'Không có ghi chú' }}
      </p>
    </div>

    <!-- Số quyền hạn -->
    <div class="col-span-2 flex items-center justify-center">
      <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
        {{ role.permissionCount }} quyền
      </span>
    </div>

    <!-- Thao tác -->
    <div class="col-span-2 flex items-center justify-center gap-2">
      <button
        @click="emit('edit')"
        class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200 text-sm font-medium"
      >
        Sửa
      </button>
      <button
        @click="emit('delete')"
        class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm font-medium"
      >
        Xóa
      </button>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
