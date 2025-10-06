<script setup>
import { computed } from 'vue'
const props = defineProps({
  color: {
    type: String,
  },
})
const bgColor = computed(() => `bg-${props.color}-100`)
const textColor = computed(() => `text-${props.color}-800`)
</script>

<template>
  <span class="px-2 py-1 font-semibold leading-tight rounded-full" :class="[bgColor, textColor]">
    <slot />
  </span>
</template>
