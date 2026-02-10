<template>
  <button :class="buttonClasses" :disabled="disabled" @click="handleClick">
    <i v-if="icon" :class="icon"></i>
    <span :class="{ 'ml-2': icon && text }">{{ text }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: null,
  },
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
  // Semantic Variants
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
  outline: 'bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50 focus:ring-primary-500',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  
  // Legacy Support (Mapping to new system or keeping closest tailwind color)
  blue: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500', // Info actions
  green: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500', // Success actions
  red: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500', // Destructive actions
  yellow: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500', // Warning actions
  purple: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500', // Special actions
  gray: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500',
}

const buttonClasses = computed(() => {
  const baseClasses =
    'inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  const colorClass = colorVariants[props.color] || colorVariants.primary
  const disabledClass = props.disabled ? 'opacity-50 cursor-not-allowed' : ''
  return [baseClasses, colorClass, disabledClass]
})

const handleClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}
</script>
