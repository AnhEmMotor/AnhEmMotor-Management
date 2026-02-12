<template>
  <button
    @click="handleClick"
    :class="[
      'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
      isActive ? activeClasses : inactiveClasses,
    ]"
  >
    <component :is="icon" v-if="icon" class="w-4 h-4" />
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
  icon: {
    type: [Object, Function],
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['toggle'])
const colorClasses = {
  primary: {
    active: 'bg-red-600 text-white border border-red-600',
    inactive: 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300',
  },
  input: {
    active: 'bg-white text-gray-900 border-primary-500 ring-1 ring-primary-500',
    inactive: 'bg-white text-gray-500 border-gray-300 hover:border-gray-400',
  },
  blue: {
    active: 'bg-blue-600 text-white border border-blue-600',
    inactive: 'bg-transparent text-gray-600 hover:bg-blue-50 border border-gray-300',
  },
  gray: {
    active: 'bg-gray-600 text-white border border-gray-600',
    inactive: 'bg-transparent text-gray-600 hover:bg-gray-100 border border-gray-300',
  },
  green: {
    active: 'bg-green-600 text-white border border-green-600',
    inactive: 'bg-transparent text-gray-600 hover:bg-green-50 border border-gray-300',
  },
  yellow: {
    active: 'bg-yellow-500 text-white border border-yellow-500',
    inactive: 'bg-transparent text-gray-600 hover:bg-yellow-50 border border-gray-300',
  },
  red: {
    active: 'bg-red-600 text-white border border-red-600',
    inactive: 'bg-transparent text-gray-600 hover:bg-red-50 border border-gray-300',
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
