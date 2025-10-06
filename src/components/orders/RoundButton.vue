<script setup>
import { computed } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: 'gray',
  },
})
const emit = defineEmits(['click'])
const colorClasses = {
  blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
  green: 'bg-green-100 text-green-600 hover:bg-green-200',
  red: 'bg-red-100 text-red-600 hover:bg-red-200',
  yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200',
  indigo: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
  gray: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
}
const buttonClasses = computed(() => colorClasses[props.color] || colorClasses.gray)
</script>

<template>
  <button
    @click="emit('click')"
    class="px-3 py-1 text-xs font-medium rounded-lg transition-colors duration-200"
    :class="buttonClasses"
  >
    <slot />
  </button>
</template>
