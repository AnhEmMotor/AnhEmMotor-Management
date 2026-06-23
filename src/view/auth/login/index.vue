<template>
  <div class="login-page min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-bold text-gray-900">Đăng nhập</h2>
        <p class="mt-2 text-sm text-gray-600">
          Hoặc
          <a href="/register" class="font-medium text-primary-600 hover:text-primary-500">
            tạo tài khoản mới
          </a>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="usernameOrEmail" class="sr-only">Tên đăng nhập hoặc Email</label>
            <input
              id="usernameOrEmail"
              v-model="form.usernameOrEmail"
              name="usernameOrEmail"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Tên đăng nhập hoặc Email"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Mật khẩu</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Mật khẩu"
            />
          </div>
        </div>

        <div v-if="errorMessage" class="text-red-600 text-sm text-center">
          {{ errorMessage }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading">Đang đăng nhập...</span>
            <span v-else>Đăng nhập</span>
          </button>
        </div>

        <div class="text-center">
          <a href="/forgot-password" class="font-medium text-primary-600 hover:text-primary-500 text-sm">
            Quên mật khẩu?
          </a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/common/auth";

const router = useRouter();

const form = reactive({
  usernameOrEmail: "",
  password: "",
});

const isLoading = ref(false);
const errorMessage = ref("");

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const result = await authService.login({
      usernameOrEmail: form.usernameOrEmail,
      password: form.password,
    });

    if (result.isAuthenticated && result.token) {
      // Redirect to workspace or home page
      router.push("/workspace");
    } else {
      errorMessage.value = "Đăng nhập thất bại";
    }
  } catch (error: any) {
    errorMessage.value = error.message || "Đăng nhập thất bại";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
