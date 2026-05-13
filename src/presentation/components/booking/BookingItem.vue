<script setup>
import { computed } from 'vue'
import { formatDateTime } from '@/utils/date'
import Button from '@components/ui/button/BaseButton.vue'
import IconCheck from '@/assets/icons/IconCheck.svg'

const props = defineProps({
  itemData: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['confirm'])

const statusLabel = computed(() => {
  const labels = {
    'Pending': 'Chờ xác nhận',
    'Confirmed': 'Đã xác nhận',
    'Cancelled': 'Đã hủy',
    'Completed': 'Hoàn tất'
  }
  return labels[props.itemData.status] || props.itemData.status
})

const statusClass = computed(() => {
  const classes = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Confirmed': 'bg-blue-100 text-blue-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'Completed': 'bg-green-100 text-green-800'
  }
  return classes[props.itemData.status] || 'bg-gray-100 text-gray-800'
})

const formattedDate = computed(() => {
  return formatDateTime(props.itemData.preferredDate)
})
</script>

<template>
  <div class="booking-item p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all">
    <div class="flex justify-between items-start mb-3">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
          {{ itemData.fullName.charAt(0) }}
        </div>
        <div>
          <h3 class="font-bold text-gray-900">{{ itemData.fullName }}</h3>
          <p class="text-xs text-gray-500">{{ itemData.phoneNumber }}</p>
        </div>
      </div>
      <span :class="['px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider', statusClass]">
        {{ statusLabel }}
      </span>
    </div>

    <div class="space-y-2 mb-4">
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <span class="font-bold text-gray-400 w-24">Thời gian:</span>
        <span>{{ formattedDate }}</span>
      </div>
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <span class="font-bold text-gray-400 w-24">Sản phẩm:</span>
        <span class="text-primary font-medium">
          {{ itemData.productVariant?.product?.name }} - {{ itemData.productVariant?.versionName }}
        </span>
      </div>
      <div v-if="itemData.note" class="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-500 italic">
        "{{ itemData.note }}"
      </div>
    </div>

    <div v-if="itemData.status === 'Pending'" class="pt-2 border-t border-gray-100 flex justify-end">
      <Button 
        text="Xác nhận lịch hẹn" 
        :icon="IconCheck" 
        color="primary" 
        size="sm"
        @click="emit('confirm', itemData.id)"
      />
    </div>
  </div>
</template>



