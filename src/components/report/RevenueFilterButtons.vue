<template>
  <div class="flex flex-wrap gap-2">
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
import BaseFilterButton from '../ui/BaseFilterButton.vue'
const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const emit = defineEmits(['update:modelValue'])
const filterOptions = [
  { status: '7-days', label: '7 ngày', color: 'red' },
  { status: '30-days', label: '30 ngày', color: 'red' },
  { status: '90-days', label: '90 ngày', color: 'red' },
]
const isActive = (status) => {
  return props.modelValue.includes(status)
}
const selectFilter = (status) => {
  const isCurrentlyActive = props.modelValue.includes(status)
  let newSelection
  if (isCurrentlyActive) {
    newSelection = []
  } else {
    newSelection = [status]
  }
  emit('update:modelValue', newSelection)
}
</script>
