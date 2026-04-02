<script setup>
import { ref, watch } from 'vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import ProductForm from './ProductForm.vue'
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
  product: {
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

const localProduct = ref({ ...props.product })

watch(
  () => props.product,
  (newVal) => {
    localProduct.value = JSON.parse(JSON.stringify(newVal))
  },
  { deep: true },
)

const handleSave = () => {
  emit('save', localProduct.value)
}
</script>

<template>
  <DraggableModal
    v-if="show"
    @close="emit('close')"
    :onRefresh="onRefresh"
    :isLoading="isRefreshing"
    width="1000px"
  >
    <template #header>
      <span class="font-bold text-lg">{{ title }}</span>
    </template>
    <template #body>
      <ProductForm
        v-model="localProduct"
        :is-edit-mode="isEditMode"
        :errors="errors"
        :is-saving="isSaving"
      />
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <Button
          text="Huỷ bỏ"
          color="gray"
          @click="emit('close')"
          :disabled="isSaving || isRefreshing"
        />
        <Button
          text="Lưu sản phẩm"
          color="purple"
          @click="handleSave"
          :loading="isSaving"
          :disabled="isRefreshing"
        />
      </div>
    </template>
  </DraggableModal>
</template>
