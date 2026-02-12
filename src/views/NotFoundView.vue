<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center space-y-8">
      <div>
        <h1 class="text-9xl font-extrabold text-red-500">404</h1>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">
          Không tìm thấy trang
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
      </div>
      
      <div class="mt-8 space-y-4">
        <button
          @click="goHome"
          class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  </div>
</template>
