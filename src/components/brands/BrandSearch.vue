<script setup>
import Input from '@/components/ui/input/BaseInput.vue'

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <Input
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    type="text"
    placeholder="Tìm kiếm theo tên thương hiệu..."
    class="mb-3"
  />
</template>


