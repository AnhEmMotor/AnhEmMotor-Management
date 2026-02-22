<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>

    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      @input="handleInput"
      @blur="handleBlur"
      :readonly="readonly"
      :placeholder="placeholder"
      :class="[
        'w-full p-1.5 border rounded-md text-sm focus:outline-none transition-all duration-300',
        inputClasses,
        inputClass,
      ]"
      v-bind="$attrs"
    />

    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="errorMessage" class="mt-1 text-sm text-red-600">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Nhập dữ liệu...',
  },
  type: {
    type: String,
    default: 'text',
  },
  validation: {
    type: Function,
    default: () => null,
  },
  focusColor: {
    type: String,
    default: 'red',
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  inputClass: {
    type: [String, Array, Object],
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
})
const emit = defineEmits(['update:modelValue'])
const errorMessage = ref(null)
const isTouched = ref(false)
const inputId = `reusable-input-${Math.random().toString(36).substring(2, 9)}`
const handleInput = (event) => {
  if (props.readonly) return
  isTouched.value = true
  const newValue = event.target.value
  emit('update:modelValue', newValue)
  errorMessage.value = props.validation(newValue)
}
const handleBlur = () => {
  if (props.readonly) return
  isTouched.value = true
  errorMessage.value = props.validation(props.modelValue)
}
const inputClasses = computed(() => {
  if (props.readonly) {
    return 'bg-gray-100 cursor-not-allowed'
  }
  if (errorMessage.value && isTouched.value) {
    return 'border-red-500 ring-2 ring-red-200'
  }
  
  const focusColorMap = {
    blue: 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    red: 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500',
    green: 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500'
  }
  
  if (props.error) {
    return 'border-red-500 ring-2 ring-red-200'
  }
  
  return focusColorMap[props.focusColor] || focusColorMap.red
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (isTouched.value) {
      errorMessage.value = props.validation(newValue)
    }
  },
)
</script>
