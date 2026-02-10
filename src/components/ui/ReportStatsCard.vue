<template>
  <div
    class="p-6 rounded-xl transform hover:scale-105 transition-transform duration-300 shadow-md"
    :class="cardBgColor"
  >
    <p class="text-sm font-medium" :class="titleColor">{{ title }}</p>
    <p class="text-3xl font-bold mt-1" :class="statColor">{{ stat }}</p>
    <p
      v-if="improvement != null"
      class="text-xs mt-2 flex items-center"
      :class="improvementTextColor"
    >
      {{ improvementText }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  stat: {
    type: String,
    required: true,
  },
  improvement: {
    type: Number,
    required: false,
  },
  color: {
    type: String,
    default: 'purple',
  },
})
const colorStyles = {
  red: {
    background: 'bg-red-50 border border-red-100',
    title: 'text-red-700',
    stat: 'text-red-900',
  },
  green: {
    background: 'bg-green-50 border border-green-100',
    title: 'text-green-700',
    stat: 'text-green-900',
  },
  yellow: {
    background: 'bg-yellow-50 border border-yellow-100',
    title: 'text-yellow-700',
    stat: 'text-yellow-900',
  },
  purple: {
    background: 'bg-purple-50 border border-purple-100',
    title: 'text-purple-700',
    stat: 'text-purple-900',
  },
  indigo: {
    background: 'bg-indigo-50 border border-indigo-100',
    title: 'text-indigo-700',
    stat: 'text-indigo-900',
  },
}
const cardBgColor = computed(
  () => colorStyles[props.color]?.background || colorStyles.purple.background,
)
const titleColor = computed(() => colorStyles[props.color]?.title || colorStyles.purple.title)
const statColor = computed(() => colorStyles[props.color]?.stat || colorStyles.purple.stat)
const isPositive = computed(() => props.improvement >= 0)
const improvementText = computed(() => {
  const percentage = Math.abs(props.improvement)
  const action = isPositive.value ? 'Tăng' : 'Giảm'
  return `${action} ${percentage}% so với tháng trước`
})
const improvementTextColor = computed(() => {
  return isPositive.value ? 'text-green-500' : 'text-red-500'
})
</script>
