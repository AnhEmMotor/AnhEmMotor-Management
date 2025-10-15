<template>
  <div class="w-full">
    <label v-if="label" :for="dateId" class="block text-xs font-medium text-gray-500 mb-1">
      {{ label }}
    </label>
    <div class="relative">
      <input
        :id="dateId"
        ref="flatpickrInput"
        type="text"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="readonly"
        class="w-full p-1.5 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
        :class="{ 'bg-gray-100 cursor-not-allowed': readonly }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js'

const props = defineProps({
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
    default: 'Chọn ngày',
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const flatpickrInput = ref(null)
let fpInstance = null

const dateId = computed(() => `base-datetime-${Math.random().toString(36).substring(2, 9)}`)

onMounted(() => {
  if (flatpickrInput.value && !props.readonly) {
    fpInstance = flatpickr(flatpickrInput.value, {
      locale: Vietnamese,
      dateFormat: 'd/m/Y',
      defaultDate: props.modelValue,
      onChange: (selectedDates, dateStr) => {
        emit('update:modelValue', dateStr)
      },
    })
  }
})

onBeforeUnmount(() => {
  if (fpInstance) {
    fpInstance.destroy()
  }
})
</script>
