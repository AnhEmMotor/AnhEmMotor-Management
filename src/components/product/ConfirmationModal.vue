<template>
  <div
    v-if="confirmationModal.isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white p-8 rounded-xl shadow-2xl max-w-sm mx-4 text-center">
      <p class="text-lg mb-4 text-gray-800">{{ confirmationModal.text }}</p>
      <div class="flex justify-center space-x-4">
        <button
          @click="confirmAction"
          class="flex-1 py-2 rounded-lg text-white font-semibold transition-colors duration-200 bg-red-500 hover:bg-red-600"
        >
          Xác nhận
        </button>
        <button
          @click="cancelAction"
          class="flex-1 py-2 rounded-lg text-white font-semibold transition-colors duration-200 bg-gray-500 hover:bg-gray-600"
        >
          Hủy
        </button>
      </div>
    </div>
  </div>
</template>
