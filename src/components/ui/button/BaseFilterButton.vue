<template>
  <button
    @click="handleClick"
    :class="[
      'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
      isActive ? activeClasses : inactiveClasses,
    ]"
  >
    {{ text }}
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'gray',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['toggle'])
const colorClasses = {
  blue: {
    active: 'bg-blue-500 text-white',
    inactive: 'bg-transparent text-blue-600 hover:bg-blue-100',
  },
  gray: {
    active: 'bg-gray-500 text-white',
    inactive: 'bg-transparent text-gray-600 hover:bg-gray-100',
  },
  green: {
    active: 'bg-green-500 text-white',
    inactive: 'bg-transparent text-green-600 hover:bg-green-100',
  },
  yellow: {
    active: 'bg-yellow-500 text-white',
    inactive: 'bg-transparent text-yellow-600 hover:bg-yellow-100',
  },
  red: {
    active: 'bg-red-500 text-white',
    inactive: 'bg-transparent text-red-600 hover:bg-red-100',
  },
}

const activeClasses = computed(() => {
  return colorClasses[props.color]?.active || colorClasses.gray.active
})

const inactiveClasses = computed(() => {
  return colorClasses[props.color]?.inactive || colorClasses.gray.inactive
})

const handleClick = () => {
  emit('toggle')
}
</script>
