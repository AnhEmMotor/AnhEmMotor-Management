<template>
  <div class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
    <div class="flex flex-col items-center animate-fade-in">
      <div class="relative w-16 h-16 mb-4">
        <div class="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      
      <p class="text-gray-500 font-medium text-sm tracking-wide animate-pulse">
        Đang tải...
      </p>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
