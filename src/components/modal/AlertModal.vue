<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]"
      @click.self="handleCancel"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-sm p-5 text-center">
        <p class="text-sm text-gray-800 mb-4">{{ message }}</p>
        <div class="flex justify-center space-x-2">
          <button
            @click="handleOk"
            class="text-sm bg-red-600 text-white font-semibold py-1.5 px-6 rounded-md hover:bg-red-700"
          >
            OK
          </button>
          <button
            v-if="type === 'confirm'"
            @click="handleCancel"
            class="text-sm bg-white border border-gray-300 text-gray-700 font-semibold py-1.5 px-4 rounded-md hover:bg-gray-100"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'alert', 
    validator: (value) => ['alert', 'confirm'].includes(value)
  }
});

const emit = defineEmits(['update:modelValue', 'ok', 'cancel']);

const isVisible = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  isVisible.value = newVal;
});

function handleOk() {
  emit('ok');
  emit('update:modelValue', false);
}

function handleCancel() {
  emit('cancel');
  emit('update:modelValue', false);
}
</script>