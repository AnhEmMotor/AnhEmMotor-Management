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
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'
import IconExclamationCircle from '@/components/icons/IconExclamationCircle.vue'
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
  { status: 'active', label: 'Hoạt Động', color: 'red', icon: IconCheckCircle },
  { status: 'new', label: 'Mới', color: 'red', icon: IconExclamationCircle },
  { status: 'inactive', label: 'Không Hoạt Động', color: 'red', icon: IconXCircle },
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
