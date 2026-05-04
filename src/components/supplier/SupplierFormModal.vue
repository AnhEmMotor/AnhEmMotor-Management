<script setup>
import { ref, watch } from 'vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import SupplierForm from './SupplierForm.vue'
import Button from '@/components/ui/button/BaseButton.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  supplier: {
    type: Object,
    required: true,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  isRefreshing: {
    type: Boolean,
    default: false,
  },
  onRefresh: {
    type: Function,
    default: undefined,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['close', 'save'])

const localSupplier = ref({ ...props.supplier })

watch(
  () => props.supplier,
  (newVal) => {
    localSupplier.value = JSON.parse(JSON.stringify(newVal))
  },
  { deep: true },
)

const handleSave = () => {
  emit('save', localSupplier.value)
}
</script>

<template>
  <DraggableModal
    v-if="show"
    @close="emit('close')"
    :onRefresh="onRefresh"
    :isLoading="isRefreshing"
  >
    <template #header>
      <h2 class="font-bold text-lg">{{ title }}</h2>
    </template>
    <template #body>
      <SupplierForm
        v-model="localSupplier"
        :errors="errors"
        @clear-error="(field) => emit('clear-error', field)"
      />
    </template>
    <template #footer>
      <div class="flex justify-end space-x-2">
        <Button
          text="Bỏ qua"
          color="gray"
          @click="emit('close')"
          :disabled="isSaving || isRefreshing"
        />
        <Button
          text="Lưu"
          color="purple"
          @click="handleSave"
          :loading="isSaving"
          :disabled="isRefreshing"
        />
      </div>
    </template>
  </DraggableModal>
</template>
