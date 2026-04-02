<template>
  <div class="flex flex-wrap gap-2 items-center">
    <p class="text-sm font-medium text-gray-700 mr-2">Lọc trạng thái:</p>
    <FilterButton
      v-for="filter in filterOptions"
      :key="filter.status"
      :text="filter.label"
      :color="filter.color"
      :icon="filter.icon"
      :is-active="isActive(filter.status)"
      @toggle="selectFilter(filter.status)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import FilterButton from '../ui/button/FilterButton.vue'
import IconInput from '@/assets/icons/IconInput.svg'
import IconCheckCircle from '@/assets/icons/IconCheckCircle.svg'
import IconXCircle from '@/assets/icons/IconXCircle.svg'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
    default: '',
  },
  statusMap: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue'])

const filterOptions = computed(() => [
  {
    status: 'working',
    label: props.statusMap.working || 'Phiếu Tạm',
    color: 'red',
    icon: IconInput,
  },
  {
    status: 'finished',
    label: props.statusMap.finished || 'Hoàn Thành',
    color: 'red',
    icon: IconCheckCircle,
  },
  {
    status: 'cancelled',
    label: props.statusMap.cancelled || 'Đã Huỷ',
    color: 'red',
    icon: IconXCircle,
  },
])

const isActive = (status) => {
  return props.modelValue.includes(status)
}

const selectFilter = (status) => {
  if (props.modelValue === status) {
    emit('update:modelValue', '')
  } else {
    emit('update:modelValue', status)
  }
}
</script>
