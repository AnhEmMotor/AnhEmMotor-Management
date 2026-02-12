<template>
  <ConfirmationModal v-if="state.show" :show="state.show" :title="state.title" @close="onCancel">
    <p class="text-gray-600">{{ state.message }}</p>
    <template #actions>
      <Button text="Bỏ qua" color="gray" @click="onCancel" />
      <Button text="Xác nhận" color="red" @click="onConfirm" />
    </template>
  </ConfirmationModal>
</template>

<script setup>
import ConfirmationModal from './ConfirmationModal.vue'
import Button from '@/components/ui/button/BaseButton.vue'
import { useConfirmationState, confirm, cancel } from '@/composables/useConfirmationState'

const { state } = useConfirmationState()

function onConfirm() {
  confirm()
}

function onCancel() {
  cancel()
}
</script>
