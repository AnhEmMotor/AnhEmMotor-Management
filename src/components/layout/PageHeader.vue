<template>
  <header class="flex items-center justify-between bg-white shadow-sm py-1.5 px-4 border-b border-gray-200 flex-shrink-0">
    <div class="flex items-center space-x-2">
      <a href="#" class="text-gray-500 hover:text-gray-800">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </a>
      <h1 class="text-base font-semibold text-gray-800">Nhập hàng</h1>
    </div>

    <div class="flex items-center flex-grow mx-4 max-w-md">
      <div class="relative w-full">
        <input
          type="text"
          placeholder="Tìm hàng hóa theo mã hoặc tên (F3)"
          class="w-full p-1.5 pl-9 text-xs border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
          v-model="searchQuery"
        />
        <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <button
          @click="$emit('open-modal')"
          class="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>
      </div>
    </div>

    <div class="flex items-center space-x-2">
      <div class="relative">
        <select class="form-input text-xs p-1 pr-7">
          <option>Kim Ngân</option>
        </select>
      </div>
      <input
        type="text"
        :value="currentDateTime"
        class="form-input text-xs w-36"
        readonly
      />
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

defineEmits(['open-modal']);

const searchQuery = ref('');
const currentDateTime = ref('');
let intervalId = null;

function updateDateTime() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  currentDateTime.value = `${day}/${month}/${year} ${hours}:${minutes}`;
}

onMounted(() => {
  updateDateTime();
  intervalId = setInterval(updateDateTime, 60000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>