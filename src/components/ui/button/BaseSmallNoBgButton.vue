<template>
  <button :class="buttonClasses" :disabled="disabled" @click="handleClick">
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: 'primary',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])
const colorVariants = {
  primary: 'text-blue-600 hover:text-blue-800',
  gray: 'text-gray-600 hover:text-gray-800',
  red: 'text-red-600 hover:text-red-800',
}

const buttonClasses = computed(() => {
  const baseClasses = 'text-sm font-medium transition-colors duration-200'
  if (props.disabled) {
    return [baseClasses, 'text-gray-400 cursor-not-allowed']
  }
  const colorClass = colorVariants[props.color] || colorVariants.primary
  return [baseClasses, colorClass, 'hover:underline']
})

const handleClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}
</script>
