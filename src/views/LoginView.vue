<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import IconLock from '@/assets/icons/login-lock.svg'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const form = reactive({
  usernameOrEmail: '',
  password: '',
})

const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!form.usernameOrEmail || !form.password) {
    toast.warning('Vui lòng nhập đầy đủ thông tin')
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''

    // Truyền trực tiếp form thô vào store, store sẽ tự gọi mapper
    await authStore.login(form)

    const redirectPath = router.currentRoute.value.query.redirect || '/'
    router.push(redirectPath)
    toast.success('Đăng nhập thành công!')
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng'
    toast.error(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 px-4"
  >
    <LoadingOverlay :show="isLoading" message="Đang đăng nhập..." />

    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-100">
        <div class="text-center">
          <div
            class="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4 shadow-lg shadow-red-200"
          >
            <IconLock class="w-8 h-8 text-white" />
          </div>
          <h2 class="text-2xl font-extrabold tracking-tight text-gray-900 mb-1">
            Chào mừng trở lại!
          </h2>
          <p class="text-gray-500 text-sm">Đăng nhập để quản lý hệ thống AnhEm Motor</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label for="usernameOrEmail" class="block text-sm font-medium text-gray-700 mb-2">
              Tài khoản hoặc Email
            </label>
            <input
              id="usernameOrEmail"
              name="usernameOrEmail"
              type="text"
              required
              v-model="form.usernameOrEmail"
              autocomplete="username"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 bg-gray-50/50"
              placeholder="Nhập tên đăng nhập hoặc email"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autocomplete="current-password"
              v-model="form.password"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 bg-gray-50/50"
              placeholder="Nhập mật khẩu"
            />
          </div>

          <div
            v-if="errorMessage"
            class="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm animate-pulse"
          >
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-red-200 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Đang xử lý...' : 'Đăng nhập ngay' }}
          </button>
        </form>

        <div class="text-center pt-2">
          <p class="text-xs text-gray-400">
            &copy; 2026 AnhEm Motor - Hệ thống quản lý chuyên nghiệp
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
