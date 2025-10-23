<template>
  <teleport to="body">
    <div v-if="show" class="overlay">
      <div class="spinner"></div>
      <p v-if="message">{{ message }}</p>
    </div>
  </teleport>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  message: {
    type: String,
    required: false,
    default: 'Đang tải, vui lòng chờ 1 chút...',
  },
})
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.spinner {
  width: 80px;
  height: 80px;
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3d008d;
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

p {
  color: white;
  margin-top: 1rem;
  font-size: 1.2rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
