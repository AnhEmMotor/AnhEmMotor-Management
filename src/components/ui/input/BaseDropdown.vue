<script setup>
import { computed } from 'vue'
defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])

const selectId = computed(() => `base-dropdown-${Math.random().toString(36).substring(2, 9)}`)
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="selectId" class="block text-xs font-medium text-gray-500 mb-1">
      {{ label }}
    </label>
    <select
      :id="selectId"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      :disabled="readonly"
      class="w-full p-1.5 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
      :class="{ 'bg-gray-100 cursor-not-allowed': readonly }"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.text }}
      </option>
    </select>
  </div>
</template>
