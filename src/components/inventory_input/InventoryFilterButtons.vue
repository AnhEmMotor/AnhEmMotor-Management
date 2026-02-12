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
import FilterButton from '../ui/button/FilterButton.vue'
import IconInput from '../icons/IconInput.vue'
import IconCheckCircle from '../icons/IconCheckCircle.vue'
import IconXCircle from '../icons/IconXCircle.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const filterOptions = [
  { status: 'Phiếu tạm', label: 'Phiếu Tạm', color: 'red', icon: IconInput },
  { status: 'Đã nhập hàng', label: 'Đã Nhập Hàng', color: 'red', icon: IconCheckCircle },
  { status: 'Đã hủy', label: 'Đã Hủy', color: 'red', icon: IconXCircle },
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
