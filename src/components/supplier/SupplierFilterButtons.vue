<template>
  <div class="flex flex-wrap gap-2 items-center">
    <p>Lọc trạng thái:</p>
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
import FilterButton from '../ui/button/FilterButton.vue'
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'
import IconXCircle from '@/components/icons/IconXCircle.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const emit = defineEmits(['update:modelValue'])
const filterOptions = [
  { status: 'active', label: 'Đang hoạt động', color: 'primary', icon: IconCheckCircle },
  { status: 'inactive', label: 'Ngừng hoạt động', color: 'primary', icon: IconXCircle },
]
const isActive = (status) => {
  return props.modelValue.includes(status)
}
const selectFilter = (status) => {
  if (props.modelValue.includes(status)) {
    emit('update:modelValue', [])
  } else {
    emit('update:modelValue', [status])
  }
}
</script>
