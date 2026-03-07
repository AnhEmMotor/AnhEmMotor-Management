<script setup>
import FullScreenModal from '@/components/ui/confirm_modal/ConfirmationModal.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import IconWarning from '@/assets/icons/warning.svg'

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  role: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <FullScreenModal :show="show" title="Xác nhận xóa vai trò" @close="emit('close')">
    <div class="space-y-4">
      <div class="flex items-center justify-center mb-4">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <IconWarning class="w-8 h-8 text-red-600" />
        </div>
      </div>

      <p class="text-center text-gray-700">
        Bạn có chắc chắn muốn xóa vai trò
        <strong class="text-gray-900">{{ role?.name }}</strong
        >?
      </p>

      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p class="text-sm text-yellow-800">
          <strong>⚠️ Cảnh báo:</strong>
        </p>
        <ul class="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
          <li>Người dùng có vai trò này sẽ bị mất quyền hạn tương ứng</li>
          <li>Hành động này không thể hoàn tác</li>
          <li>Tất cả dữ liệu liên quan đến vai trò này sẽ bị xóa</li>
        </ul>
      </div>

      <div v-if="role" class="bg-gray-50 rounded-lg p-4 space-y-2">
        <div class="flex justify-between">
          <span class="text-gray-600">Tên vai trò:</span>
          <span class="font-semibold text-gray-900">{{ role.name }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Số quyền hạn:</span>
          <span class="font-semibold text-gray-900">{{ role.permissionCount }} quyền</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Ngày tạo:</span>
          <span class="font-semibold text-gray-900">{{ role.createdAt }}</span>
        </div>
      </div>
    </div>

    <template #actions>
      <Button text="Hủy bỏ" color="gray" @click="emit('close')" />
      <Button text="Xóa vai trò" color="red" @click="emit('confirm')" />
    </template>
  </FullScreenModal>
</template>
