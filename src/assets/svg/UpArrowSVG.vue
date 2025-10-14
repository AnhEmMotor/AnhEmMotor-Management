<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke="currentColor"
    class="w-5 h-5 transition-transform duration-300"
    :class="{ 'rotate-180': isOpen }"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
</template>

<script setup lang="ts">
// This component accepts an 'isOpen' prop to control its rotation state.
defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})
</script>
