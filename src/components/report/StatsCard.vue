<template>
  <div
    class="p-6 rounded-xl transform hover:scale-105 transition-transform duration-300 shadow-md"
    :class="cardBgColor"
  >
    <p class="text-sm font-medium" :class="titleColor">{{ title }}</p>
    <p class="text-3xl font-bold mt-1" :class="statColor">{{ stat }}</p>
    <p class="text-xs mt-2 flex items-center" :class="improvementTextColor">
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
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
})

const cardBgColor = computed(() => `bg-${props.color}-50`)
const titleColor = computed(() => `text-${props.color}-600`)
const statColor = computed(() => `text-${props.color}-900`)

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

<style scoped></style>
