<script setup>
import RoleItem from './RoleItem.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'

defineProps({
  roles: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isError: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
    <div
      class="grid grid-cols-16 gap-4 p-3 bg-gray-100 border-b border-gray-200 font-semibold text-gray-700 items-center"
    >
      <div class="col-span-1 text-center">STT</div>
      <div class="col-span-3">Tên vai trò</div>
      <div class="col-span-6">Ghi chú</div>
      <div class="col-span-2 text-center">Số quyền hạn</div>
      <div class="col-span-2 text-center mr-[4px]">Trạng thái</div>
      <div class="col-span-2 text-center">Thao tác</div>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div v-if="isLoading">
        <div
          v-for="i in 5"
          :key="i"
          class="grid grid-cols-16 gap-4 p-3 border-b border-gray-100 items-center"
        >
          <div class="col-span-1 flex justify-center">
            <SkeletonLoader width="20px" height="20px" class="rounded" />
          </div>
          <div class="col-span-3">
            <SkeletonLoader width="70%" height="20px" />
          </div>
          <div class="col-span-6">
            <SkeletonLoader width="90%" height="20px" />
          </div>
          <div class="col-span-2 flex justify-center">
            <SkeletonLoader width="60%" height="24px" class="rounded-full" />
          </div>
          <div class="col-span-2 flex justify-center">
            <SkeletonLoader width="60%" height="24px" class="rounded-full" />
          </div>
          <div class="col-span-2 flex justify-center gap-2">
            <SkeletonLoader width="30px" height="20px" class="rounded" />
            <SkeletonLoader width="30px" height="20px" class="rounded" />
          </div>
        </div>
      </div>

      <div v-else-if="isError" class="flex items-center justify-center h-64">
        <div class="text-center text-red-500 font-medium">
          {{ errorMessage }}
        </div>
      </div>

      <div
        v-else-if="roles.length === 0"
        class="flex items-center justify-center h-64 text-gray-500"
      >
        <div class="text-center">
          <p class="text-xl mb-2">Không có vai trò nào</p>
          <p class="text-sm">Hãy thêm vai trò mới để bắt đầu</p>
        </div>
      </div>

      <RoleItem
        v-else
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
