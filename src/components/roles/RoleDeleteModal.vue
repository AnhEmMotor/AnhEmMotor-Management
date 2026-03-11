<script setup>
import FullScreenModal from '@/components/ui/confirm_modal/ConfirmationModal.vue'
import Button from '@/components/ui/button/BaseButton.vue'

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
    <div class="py-4">
      <p class="text-lg text-gray-700">
        Bạn có muốn xoá vai trò <strong class="text-red-600">{{ role?.name }}</strong> ấy?
      </p>
    </div>

    <template #actions>
      <Button text="Hủy bỏ" color="gray" @click="emit('close')" />
      <Button text="Xóa vai trò" color="red" @click="emit('confirm')" />
    </template>
  </FullScreenModal>
</template>
