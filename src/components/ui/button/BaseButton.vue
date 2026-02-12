<template>
  <button :class="buttonClasses" :disabled="disabled" @click="handleClick">
    <component
      :is="icon"
      v-if="typeof icon === 'object' || typeof icon === 'function'"
      class="w-5 h-5"
      :class="{ 'mr-2': text }"
    />
    <i v-else-if="icon" :class="icon"></i>
    <span :class="{ 'ml-2': icon && typeof icon === 'string' && text }">{{ text }}</span>
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
    type: [String, Object, Function],
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
  primary: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-transparent',
  secondary: 'bg-white text-gray-700 border border-gray-400 hover:bg-gray-50 focus:ring-gray-500',
  outline: 'bg-transparent text-red-600 border border-red-600 hover:bg-red-50 focus:ring-red-500',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  blue: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  green: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  purple: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  yellow: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  red: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 focus:ring-offset-2',
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
