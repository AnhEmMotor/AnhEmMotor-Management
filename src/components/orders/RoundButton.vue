<script setup>
import { computed } from 'vue'
const props = defineProps({
  color: {
    type: String,
  },
})
const bgColor = computed(() => `bg-${props.color}-100`)
const textColor = computed(() => `text-${props.color}-600`)
const hoverBgColor = computed(() => `hover:bg-${props.color}-200`)
</script>

<template>
  <button
    @click="$emit('click')"
    class="px-3 py-1 text-xs font-medium rounded-lg transition-colors duration-200"
    :class="[bgColor, textColor, hoverBgColor]"
  >
    <slot />
  </button>
</template>
