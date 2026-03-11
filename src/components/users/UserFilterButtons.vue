<template>
  <div class="flex flex-wrap gap-2">
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
import IconCheckCircle from '@/assets/icons/IconCheckCircle.svg'
import IconXCircle from '@/assets/icons/IconXCircle.svg'
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})
const emit = defineEmits(['update:modelValue'])
const filterOptions = [
  { status: 'Active', label: 'Đang Hoạt Động', color: 'red', icon: IconCheckCircle },
  { status: 'Banned', label: 'Đã Khóa', color: 'red', icon: IconXCircle },
]
const isActive = (status) => {
  return props.modelValue === status
}
const selectFilter = (status) => {
  const newValue = props.modelValue === status ? '' : status
  emit('update:modelValue', newValue)
}
</script>
