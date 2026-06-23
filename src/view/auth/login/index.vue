<template>
  <div class="login-page">
    <div class="login-bg-overlay"></div>
    <div class="login-container relative z-10 flex items-center justify-center min-h-screen">
      <el-card class="login-card max-w-md w-full m-4 border-0" shadow="hover">
        <div class="text-center mb-8">
          <div class="flex justify-center mb-4">
            <!-- Add Logo here if available -->
            <div class="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg" style="background-color: var(--el-color-primary)">
              <el-icon :size="32" color="white"><UserFilled /></el-icon>
            </div>
          </div>
          <h2 class="mt-2 text-3xl font-extrabold title tracking-tight">Chào mừng trở lại</h2>
          <p class="mt-3 text-sm subtitle">
            Đăng nhập vào hệ thống quản lý hoặc
            <a
              href="/register"
              class="font-medium hover:underline transition-colors"
              style="color: var(--el-color-primary)"
            >
              tạo tài khoản mới
            </a>
          </p>
        </div>

        <el-form 
          :model="form" 
          @submit.prevent="handleLogin" 
          class="space-y-5"
          label-position="top"
          size="large"
        >
          <el-form-item>
            <el-input
              v-model="form.usernameOrEmail"
              placeholder="Tên đăng nhập hoặc Email"
              :prefix-icon="User"
              clearable
              class="custom-input"
            />
          </el-form-item>
          
          <el-form-item>
            <el-input
              v-model="form.password"
              type="password"
              placeholder="Mật khẩu"
              :prefix-icon="Lock"
              show-password
              class="custom-input"
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <div v-if="errorMessage" class="text-center">
            <el-alert
              :title="errorMessage"
              type="error"
              show-icon
              :closable="false"
            />
          </div>

          <div class="flex items-center justify-between mt-2 mb-6">
            <el-checkbox v-model="form.rememberMe" class="font-normal subtitle">
              Ghi nhớ đăng nhập
            </el-checkbox>

            <a
              @click="router.push({ name: 'ForgetPassword' })"
              class="text-sm font-medium hover:underline transition-colors cursor-pointer"
              style="color: var(--el-color-primary)"
            >
              Quên mật khẩu?
            </a>
          </div>

          <el-form-item class="mb-0">
            <el-button
              type="primary"
              native-type="submit"
              :loading="isLoading"
              class="w-full submit-btn"
            >
              Đăng nhập hệ thống
            </el-button>
          </el-form-item>
        </el-form>

        <div class="mt-8">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-gray-800 text-gray-500 subtitle rounded-full" style="background: var(--el-bg-color-overlay)">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <div>
              <el-button class="w-full social-btn google-btn" @click="handleGoogleLogin">
                <template #icon>
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </template>
                Google
              </el-button>
            </div>
            <div>
              <el-button class="w-full social-btn facebook-btn" @click="handleFacebookLogin">
                <template #icon>
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" fill="#1877F2"/>
                  </svg>
                </template>
                Facebook
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/common/auth";
import { UserFilled, User, Lock } from "@element-plus/icons-vue";

const router = useRouter();

const form = reactive({
  usernameOrEmail: "",
  password: "",
  rememberMe: false,
});

const isLoading = ref(false);
const errorMessage = ref("");

const handleLogin = async () => {
  if (!form.usernameOrEmail || !form.password) {
    errorMessage.value = "Vui lòng nhập đầy đủ thông tin";
    return;
  }

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
      errorMessage.value = "Đăng nhập thất bại. Kiểm tra lại thông tin.";
    }
  } catch (error: any) {
    errorMessage.value = error.message || "Tên đăng nhập hoặc mật khẩu không đúng";
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleLogin = () => {
  // Implement Google login logic here
  console.log("Login with Google clicked");
};

const handleFacebookLogin = () => {
  // Implement Facebook login logic here
  console.log("Login with Facebook clicked");
};
</script>

<style lang="scss" scoped>
.login-page {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-image: url("https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1920");
  background-attachment: fixed;
  background-position: center;
  background-size: cover;

  .login-bg-overlay {
    position: fixed;
    inset: 0;
    z-index: 0;
    background-color: var(--el-bg-color-page);
    opacity: 0.45;
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
  }

  .login-card {
    background: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-light);
    border-radius: 20px;
    box-shadow: 0 10px 40px rgb(0 0 0 / 10%) !important;
    -webkit-backdrop-filter: blur(20px);
    backdrop-filter: blur(20px);
    padding: 10px;
    
    :deep(.el-card__body) {
      padding: 30px;
    }
  }

  .title {
    color: var(--el-text-color-primary);
  }

  .subtitle {
    color: var(--el-text-color-regular);
  }

  .custom-input {
    :deep(.el-input__wrapper) {
      background-color: var(--el-fill-color-light);
      border-radius: 10px;
      padding: 4px 15px;
      box-shadow: 0 0 0 1px var(--el-border-color) inset;
      transition: all 0.3s;
      
      &:hover, &.is-focus {
        box-shadow: 0 0 0 1px var(--el-color-primary) inset;
        background-color: var(--el-bg-color);
      }
    }
  }

  .submit-btn {
    border-radius: 10px;
    font-weight: 600;
    font-size: 16px;
    padding: 24px 0;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px var(--el-color-primary-light-5);
    }
  }

  .social-btn {
    border-radius: 10px;
    padding: 20px 0;
    font-weight: 500;
    transition: all 0.3s;
    background-color: var(--el-fill-color-light);
    border-color: var(--el-border-color-light);
    color: var(--el-text-color-regular);

    &:hover {
      transform: translateY(-2px);
      background-color: var(--el-bg-color);
      color: var(--el-text-color-primary);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
  }
}
</style>
