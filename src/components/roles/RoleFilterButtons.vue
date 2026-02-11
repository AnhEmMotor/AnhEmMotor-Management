<template>
  <div class="flex flex-wrap gap-2 items-center">
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
  { status: 'active', label: 'Hoạt động', color: 'red', icon: IconCheckCircle },
  { status: 'disabled', label: 'Vô hiệu hoá', color: 'red', icon: IconXCircle },
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
