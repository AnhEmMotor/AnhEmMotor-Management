<template>
  <div
    class="forgot-password-page min-h-screen flex items-center justify-center bg-gray-50"
  >
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-bold text-gray-900">Quên mật khẩu</h2>
        <p class="mt-2 text-sm text-gray-600">
          Nhập email của bạn để nhận link đặt lại mật khẩu
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleForgotPassword">
        <div class="rounded-md shadow-sm">
          <div>
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              required
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Nhập email đã đăng ký"
            />
          </div>
        </div>

        <div
          v-if="errorMessage"
          class="text-red-600 text-sm text-center bg-red-50 p-3 rounded"
        >
          {{ errorMessage }}
        </div>

        <div
          v-if="successMessage"
          class="text-green-600 text-sm text-center bg-green-50 p-3 rounded"
        >
          {{ successMessage }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading">Đang gửi...</span>
            <span v-else>Gửi link đặt lại mật khẩu</span>
          </button>
        </div>

        <div class="text-center">
          <a
            @click="router.push({ name: 'Login' })"
            class="font-medium text-primary-600 hover:text-primary-500 text-sm cursor-pointer"
          >
            Quay lại đăng nhập
          </a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const email = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const handleForgotPassword = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    // TODO: Call forgot password API when available
    // await fetchForgotPassword({ email: email.value });

    // Simulate success for now
    successMessage.value =
      "Vui lòng kiểm tra email của bạn để nhận link đặt lại mật khẩu.";

    // Clear email after successful submission
    email.value = "";
  } catch (error: any) {
    errorMessage.value = error.message || "Gửi yêu cầu thất bại";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.forgot-password-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
