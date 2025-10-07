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
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  blue: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  green: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
  red: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  yellow: 'bg-amber-500 text-slate-900 hover:bg-amber-600 focus:ring-amber-500',
  gray: 'bg-slate-500 text-white hover:bg-slate-600 focus:ring-slate-500',
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
