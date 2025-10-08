<template>
  <div
    v-if="messageModal.isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white p-8 rounded-xl shadow-2xl max-w-sm mx-4 text-center">
      <p class="text-lg mb-4 text-gray-800">{{ messageModal.text }}</p>
      <button
        @click="closeMessageModal"
        :class="[
          'px-6 py-2 rounded-lg text-white font-semibold transition-colors duration-200',
          messageModal.type === 'error'
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-blue-500 hover:bg-blue-600',
        ]"
      >
        OK
      </button>
    </div>
  </div>
</template>
