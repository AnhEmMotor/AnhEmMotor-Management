<template>
  <div 
    :class="[
      'fixed bottom-5 right-5 bg-green-500 text-white py-3 px-5 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out',
      show ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
    ]"
  >
    {{ message }}
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  message: {
    type: String,
    default: 'Thao tác thành công!',
  },
});
</script>
