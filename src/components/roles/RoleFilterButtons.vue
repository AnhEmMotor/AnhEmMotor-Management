<template>
  <div class="flex flex-wrap gap-2 items-center">
    <p>Lọc trạng thái:</p>
    <BaseFilterButton
      v-for="filter in filterOptions"
      :key="filter.status"
      :text="filter.label"
      :color="filter.color"
      :is-active="isActive(filter.status)"
      @toggle="selectFilter(filter.status)"
    />
  </div>
</template>

<script setup>
import BaseFilterButton from '../ui/button/BaseFilterButton.vue'
const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const emit = defineEmits(['update:modelValue'])
const filterOptions = [
  { status: 'enable', label: 'Hoạt động', color: 'green' },
  { status: 'disable', label: 'Vô hiệu hoá', color: 'red' },
]
const isActive = (status) => {
  return props.modelValue.includes(status)
}
const selectFilter = (status) => {
  const newSelection = [...props.modelValue]
  const index = newSelection.indexOf(status)
  if (index > -1) {
    newSelection.splice(index, 1)
  } else {
    newSelection.push(status)
  }
  emit('update:modelValue', newSelection)
}
</script>
