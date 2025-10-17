<script setup>
import RoleItem from './RoleItem.vue'

defineProps({
  roles: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
    <!-- Table Header -->
    <div
      class="grid grid-cols-16 gap-4 p-2 bg-gray-100 border-b border-gray-200 font-semibold text-gray-700"
    >
      <div class="col-span-1 text-center">STT</div>
      <div class="col-span-3">Tên vai trò</div>
      <div class="col-span-6">Ghi chú</div>
      <div class="col-span-2 text-center">Số quyền hạn</div>
      <div class="col-span-2 text-center mr-[4px]">Trạng thái</div>
      <div class="col-span-2 text-center">Thao tác</div>
    </div>

    <!-- Table Body -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="roles.length === 0" class="flex items-center justify-center h-64 text-gray-500">
        <div class="text-center">
          <p class="text-xl mb-2">Không có vai trò nào</p>
          <p class="text-sm">Hãy thêm vai trò mới để bắt đầu</p>
        </div>
      </div>
      <RoleItem
        v-for="(role, index) in roles"
        :key="role.id"
        :role="role"
        :index="index"
        @edit="emit('edit', role)"
        @delete="emit('delete', role)"
      />
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
