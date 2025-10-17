<script setup>
import FullScreenModal from '@/components/ui/FullScreenModal.vue'
import BaseButton from '@/components/ui/button/BaseButton.vue'

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <FullScreenModal :show="show" title="Xác nhận xóa người dùng" @close="emit('close')">
    <div class="space-y-4">
      <div class="flex items-center justify-center mb-4">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      </div>

      <p class="text-center text-gray-700">
        Bạn có chắc chắn muốn xóa người dùng
        <strong class="text-gray-900">{{ user?.name }}</strong
        >?
      </p>

      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p class="text-sm text-yellow-800">
          <strong>⚠️ Cảnh báo:</strong>
        </p>
        <ul class="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
          <li>Tất cả thông tin về người dùng này sẽ bị xóa vĩnh viễn</li>
          <li>Các đơn hàng và lịch sử giao dịch vẫn được giữ lại</li>
          <li>Hành động này không thể hoàn tác</li>
        </ul>
      </div>

      <div v-if="user" class="bg-gray-50 rounded-lg p-4 space-y-2">
        <div class="flex justify-between">
          <span class="text-gray-600">Mã KH:</span>
          <span class="font-semibold text-gray-900">{{ user.code }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Tên:</span>
          <span class="font-semibold text-gray-900">{{ user.name }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Email:</span>
          <span class="font-semibold text-gray-900">{{ user.email }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Số điện thoại:</span>
          <span class="font-semibold text-gray-900">{{ user.phone }}</span>
        </div>
      </div>
    </div>

    <template #actions>
      <BaseButton text="Hủy bỏ" color="gray" @click="emit('close')" />
      <BaseButton text="Xóa người dùng" color="red" @click="emit('confirm')" />
    </template>
  </FullScreenModal>
</template>

<style scoped>
/* Additional styles if needed */
</style>
