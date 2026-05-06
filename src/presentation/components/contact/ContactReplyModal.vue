<script setup>
import { ref } from 'vue'
import DraggableModal from '@components/ui/DraggableModal.vue'
import Button from '@components/ui/button/BaseButton.vue'
import Input from '@components/ui/input/BaseInput.vue'

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

const emit = defineEmits(['close', 'reply'])

const replyMessage = ref('')
const markAsProcessed = ref(true)

const handleReply = () => {
  if (!replyMessage.value.trim()) return
  emit('reply', {
    contactId: props.contact.id,
    message: replyMessage.value,
    markAsProcessed: markAsProcessed.value,
  })
}
</script>

<template>
  <DraggableModal v-if="show" @close="emit('close')">
    <template #header>
      <h2 class="font-bold text-lg text-primary">Phản hồi khách hàng</h2>
    </template>
    <template #body>
      <div class="space-y-4">
        <div class="p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p class="text-xs text-gray-400 font-bold uppercase mb-1">Khách hàng</p>
          <p class="font-medium text-gray-800">{{ contact.fullName }} ({{ contact.email }})</p>
          <p class="text-xs text-gray-400 font-bold uppercase mt-3 mb-1">Chủ đề</p>
          <p class="text-gray-700">{{ contact.subject }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nội dung phản hồi</label>
          <textarea
            v-model="replyMessage"
            class="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
            placeholder="Nhập nội dung phản hồi cho khách hàng..."
          ></textarea>
        </div>

        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            id="mark-processed"
            v-model="markAsProcessed"
            class="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label for="mark-processed" class="text-sm text-gray-600 cursor-pointer">
            Đánh dấu là "Đã xử lý" sau khi phản hồi
          </label>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end space-x-2">
        <Button text="Hủy bỏ" color="gray" @click="emit('close')" :disabled="isSaving" />
        <Button
          text="Gửi phản hồi"
          color="primary"
          @click="handleReply"
          :loading="isSaving"
          :disabled="!replyMessage.trim()"
        />
      </div>
    </template>
  </DraggableModal>
</template>



