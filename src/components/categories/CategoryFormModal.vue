<script setup>
import { ref, watch } from 'vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import Input from '@/components/ui/input/BaseInput.vue'
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
  category: {
    type: Object,
    default: () => ({ id: null, name: '', description: '' }),
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
})

const emit = defineEmits(['close', 'save', 'refresh'])

const editableCategory = ref({ ...props.category })
const formErrors = ref({ name: '' })

watch(
  () => props.category,
  (newVal) => {
    editableCategory.value = { ...newVal }
  },
  { deep: true },
)

const validate = () => {
  const errors = { name: '' }
  let valid = true
  if (!editableCategory.value.name?.trim()) {
    errors.name = 'Vui lòng nhập tên thể loại.'
    valid = false
  }
  formErrors.value = errors
  return valid
}

const handleSave = () => {
  if (!validate()) return
  emit('save', editableCategory.value)
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <DraggableModal
    v-if="show"
    @close="handleClose"
    :onRefresh="onRefresh"
    :isLoading="isRefreshing"
    width="480px"
  >
    <template #header>
      <span class="font-bold text-lg">{{ title }}</span>
    </template>
    <template #body>
      <div class="space-y-4 p-1">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tên thể loại <span class="text-red-500">*</span>
          </label>
          <Input v-model="editableCategory.name" placeholder="Nhập tên thể loại..." />
          <p v-if="formErrors.name" class="text-red-500 text-xs mt-1">{{ formErrors.name }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            v-model="editableCategory.description"
            placeholder="Nhập mô tả (tùy chọn)..."
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <Button
          text="Huỷ bỏ"
          color="gray"
          @click="handleClose"
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
