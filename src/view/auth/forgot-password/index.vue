<template>
  <div class="forgot-password-page">
    <div class="login-bg-overlay"></div>
    <div
      class="login-container relative z-10 flex items-center justify-center min-h-screen"
    >
      <el-card class="login-card max-w-md w-full m-4 border-0" shadow="hover">
        <div class="text-center mb-8">
          <div class="flex justify-center mb-4">
            <!-- Icon -->
            <div
              class="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg"
              style="background-color: var(--el-color-primary)"
            >
              <el-icon :size="32" color="white"><Key /></el-icon>
            </div>
          </div>
          <h2 class="mt-2 text-3xl font-extrabold title tracking-tight">
            Quên mật khẩu
          </h2>
          <p class="mt-3 text-sm subtitle px-4">
            Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn một liên kết
            để đặt lại mật khẩu.
          </p>
        </div>

        <el-form
          @submit.prevent="handleForgotPassword"
          class="space-y-5"
          label-position="top"
          size="large"
        >
          <el-form-item>
            <el-input
              v-model="email"
              type="email"
              placeholder="Nhập email đã đăng ký"
              :prefix-icon="Message"
              clearable
              class="custom-input"
              @keyup.enter="handleForgotPassword"
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

          <div v-if="successMessage" class="text-center">
            <el-alert
              :title="successMessage"
              type="success"
              show-icon
              :closable="false"
            />
          </div>

          <el-form-item class="mt-6">
            <el-button
              type="primary"
              native-type="submit"
              :loading="isLoading"
              class="w-full submit-btn"
              v-auth="Permissions.Admin.EmployeeManagement.Edit"
            >
              Gửi liên kết đặt lại mật khẩu
            </el-button>
          </el-form-item>

          <div class="text-center mt-6">
            <a
              @click="router.push({ name: 'Login' })"
              class="text-sm font-medium hover:underline transition-colors cursor-pointer inline-flex items-center"
              style="color: var(--el-color-primary)"
            >
              <el-icon class="mr-1"><Back /></el-icon>
              Quay lại đăng nhập
            </a>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Permissions } from "@/common/constants/permissions";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Message, Key, Back } from "@element-plus/icons-vue";

const router = useRouter();

const email = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const handleForgotPassword = async () => {
  if (!email.value) {
    errorMessage.value = "Vui lòng nhập địa chỉ email";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    // TODO: Call forgot password API when available
    // await fetchForgotPassword({ email: email.value });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

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

<style lang="scss" scoped>
.forgot-password-page {
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
    line-height: 1.5;
  }

  .custom-input {
    :deep(.el-input__wrapper) {
      background-color: var(--el-fill-color-light);
      border-radius: 10px;
      padding: 4px 15px;
      box-shadow: 0 0 0 1px var(--el-border-color) inset;
      transition: all 0.3s;

      &:hover,
      &.is-focus {
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
}
</style>
