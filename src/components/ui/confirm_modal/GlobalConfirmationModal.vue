<template>
  <BaseConfirmationModal
    v-if="state.show"
    :show="state.show"
    :title="state.title"
    @close="onCancel"
  >
    <p class="text-gray-600">{{ state.message }}</p>
    <template #actions>
      <BaseButton text="Bỏ qua" color="gray" @click="onCancel" />
      <BaseButton text="Xác nhận" color="red" @click="onConfirm" />
    </template>
  </BaseConfirmationModal>
</template>

<script setup>
import BaseConfirmationModal from './BaseConfirmationModal.vue'
import BaseButton from '@/components/ui/button/BaseButton.vue'
import { useConfirmationState, confirm, cancel } from '@/composables/confirmation'

const { state } = useConfirmationState()

function onConfirm() {
  confirm()
}

function onCancel() {
  cancel()
}
</script>
