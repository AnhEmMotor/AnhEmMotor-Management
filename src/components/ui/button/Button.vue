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
  // Semantic Variants - ENFORCED
  primary: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-transparent', // Brand Red
  secondary: 'bg-white text-gray-700 border border-gray-400 hover:bg-gray-50 focus:ring-gray-500', // Neutral actions with visible border
  outline: 'bg-transparent text-red-600 border border-red-600 hover:bg-red-50 focus:ring-red-500', // Secondary actions
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500', // Icon buttons
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500', // Destructive
  
  // Legacy Mapping - FORCE TO STANDARD COLORS
  blue: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500', // Map Info to Primary
  green: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500', // Map Success to Primary
  purple: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500', // Map Special to Primary
  yellow: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50', // Map Warning to Secondary
  red: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 focus:ring-offset-2', // Keep Red
  gray: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500', // Keep Gray for specific neutral needs
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
