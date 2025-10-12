<template>
  <div class="discount-toggle" :style="{ width: width }">
    <button
      :class="{ active: modelValue === 'VND' }"
      @click="$emit('update:modelValue', 'VND')"
    >
      VND
    </button>
    <button
      :class="{ active: modelValue === '%' }"
      @click="$emit('update:modelValue', '%')"
    >
      %
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: 'VND'
  },
  width: {
    type: String,
    default: '80px'
  }
});

defineEmits(['update:modelValue']);
</script>