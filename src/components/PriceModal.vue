<script setup>
// Define props and emits
const props = defineProps({
  isVisible: Boolean,
  product: Object
});

const emit = defineEmits(['close']);

function closeModal() {
  emit('close');
}
</script>

<template>
  <transition name="modal">
    <div v-if="isVisible" @click.self="closeModal"
      class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl transform">
        <!-- Modal Header -->
        <div class="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-800">
            Lịch sử giá: 
            <span v-if="product" class="text-red-600">{{ product.name }} ({{ product.id }})</span>
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-700 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 grid grid-cols-1 md:grid-cols-1 gap-6 max-h-[70vh] overflow-y-auto">
          <div>
            <h3 class="font-semibold text-lg text-gray-700 mb-3 border-b pb-2">Lịch sử giá bán</h3>
            <div class="space-y-2">
              <template v-if="product && product.history && product.history.length > 0">
                <div v-for="(item, index) in product.history" :key="index"
                  class="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-md">
                  <span class="text-gray-600">{{ item.date }}</span>
                  <span class="font-medium text-gray-800">{{ item.price }}</span>
                </div>
              </template>
              <template v-else>
                <p class="text-sm text-gray-500">Không có dữ liệu lịch sử giá bán.</p>
              </template>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 bg-gray-50 rounded-b-xl text-right">
          <button @click="closeModal" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Đóng</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 300ms ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
