<script setup>
import { ref, watch } from 'vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import Button from '@/components/ui/button/BaseButton.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  contact: {
    type: Object,
    required: true,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'save'])

const internalNote = ref('')

watch(
  () => props.contact,
  (newVal) => {
    internalNote.value = newVal?.internalNote || ''
  },
  { immediate: true },
)

const handleSave = () => {
  emit('save', {
    contactId: props.contact.id,
    internalNote: internalNote.value,
  })
}
</script>

<template>
  <DraggableModal v-if="show" @close="emit('close')">
    <template #header>
      <h2 class="font-bold text-lg text-primary">Ghi chú nội bộ</h2>
    </template>
    <template #body>
      <div class="space-y-4">
        <div class="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p class="text-xs text-blue-400 font-bold uppercase mb-1">Thông tin khách hàng</p>
          <p class="font-medium text-blue-800">{{ contact.fullName }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ghi chú (chỉ nhân viên xem được)</label>
          <textarea
            v-model="internalNote"
            class="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
            placeholder="Ví dụ: Khách khó tính, thích màu đỏ, muốn mua trả góp..."
          ></textarea>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end space-x-2">
        <Button text="Hủy" color="gray" @click="emit('close')" :disabled="isSaving" />
        <Button
          text="Lưu ghi chú"
          color="primary"
          @click="handleSave"
          :loading="isSaving"
        />
      </div>
    </template>
  </DraggableModal>
</template>


