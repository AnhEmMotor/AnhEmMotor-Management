<script setup>
import { computed } from 'vue'

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Ghi chú...',
  },
  rows: {
    type: Number,
    default: 3,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])

const textareaId = computed(() => `base-textarea-${Math.random().toString(36).substring(2, 9)}`)
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="textareaId" class="block text-xs font-medium text-gray-500 mb-1">
      {{ label }}
    </label>
    <textarea
      :id="textareaId"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :rows="rows"
      :readonly="readonly"
      class="w-full p-2 border border-gray-300 rounded-md text-xs focus:ring-red-500 focus:border-red-500 resize-none"
      :class="{ 'bg-gray-100 cursor-not-allowed': readonly }"
    ></textarea>
  </div>
</template>
