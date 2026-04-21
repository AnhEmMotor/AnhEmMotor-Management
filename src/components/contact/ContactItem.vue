<script setup>
import { computed } from 'vue'
import { formatDateTime } from '@/utils/date'
import Button from '@/components/ui/button/BaseButton.vue'
import IconChevronDown from '@/assets/icons/chevron-down.svg'
import IconChevronUp from '@/assets/icons/chevron-up.svg'
import IconReply from '@/assets/icons/IconReply.svg'
import IconEdit from '@/assets/icons/IconEdit.svg'

const props = defineProps({
  itemData: {
    type: Object,
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle-detail', 'reply', 'edit-note'])

const statusLabel = computed(() => {
  return props.itemData.status === 'Processed' ? 'Đã xử lý' : 'Chưa xử lý'
})

const statusClass = computed(() => {
  return props.itemData.status === 'Processed'
    ? 'bg-green-100 text-green-800'
    : 'bg-yellow-100 text-yellow-800'
})

const formattedDate = computed(() => {
  return formatDateTime(props.itemData.createdAt)
})
</script>

<template>
  <div class="contact-item border-b border-gray-100 hover:bg-gray-50 transition-colors">
    <div
      class="grid grid-cols-1 md:grid-cols-16 gap-2 py-4 px-5 items-center cursor-pointer"
      @click="emit('toggle-detail', itemData.id)"
    >
      <div class="md:col-span-4 font-medium text-gray-900">
        {{ itemData.fullName }}
      </div>
      <div class="md:col-span-4 text-gray-600 truncate">
        {{ itemData.subject }}
      </div>
      <div class="md:col-span-3 text-gray-500 text-sm">
        {{ itemData.phoneNumber }}
      </div>
      <div class="md:col-span-2 text-gray-500 text-sm">
        {{ formattedDate }}
      </div>
      <div class="md:col-span-2">
        <span :class="['px-2 py-1 rounded-full text-xs font-medium', statusClass]">
          {{ statusLabel }}
        </span>
      </div>
      <div class="md:col-span-1 flex justify-end">
        <component :is="isOpen ? IconChevronUp : IconChevronDown" class="h-5 w-5 text-gray-400" />
      </div>
    </div>

    <div v-if="isOpen" class="px-5 pb-5 pt-2 bg-gray-50 border-t border-gray-100 space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-3">
          <div>
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</h4>
            <p class="text-gray-700">{{ itemData.email }}</p>
          </div>
          <div>
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nội dung tin nhắn</h4>
            <div class="bg-white p-3 rounded border border-gray-200 text-gray-700 whitespace-pre-wrap">
              {{ itemData.message }}
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <div>
            <div class="flex justify-between items-center mb-1">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Ghi chú nội bộ</h4>
              <button 
                class="text-primary hover:underline text-xs flex items-center gap-1"
                @click.stop="emit('edit-note', itemData)"
              >
                <IconEdit class="h-3 w-3" /> Chỉnh sửa
              </button>
            </div>
            <div class="bg-blue-50 p-3 rounded border border-blue-100 text-blue-800 italic min-h-[60px]">
              {{ itemData.internalNote || 'Chưa có ghi chú nào về khách hàng này...' }}
            </div>
          </div>

          <div v-if="itemData.replies && itemData.replies.length > 0">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Lịch sử phản hồi</h4>
            <div class="space-y-2">
              <div 
                v-for="reply in itemData.replies" 
                :key="reply.id"
                class="bg-white p-2 rounded border border-gray-200 text-sm"
              >
                <div class="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>Bởi: {{ reply.repliedBy?.fullName || 'Admin' }}</span>
                  <span>{{ formatDateTime(reply.createdAt) }}</span>
                </div>
                <p class="text-gray-600">{{ reply.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <Button 
          text="Phản hồi khách hàng" 
          :icon="IconReply" 
          color="primary" 
          size="sm"
          @click.stop="emit('reply', itemData)"
        />
      </div>
    </div>
  </div>
</template>


