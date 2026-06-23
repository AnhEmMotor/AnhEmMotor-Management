<template>
  <div class="error-page">
    <div class="login-bg-overlay"></div>
    <div class="login-container relative z-10 flex items-center justify-center min-h-screen">
      <el-card class="login-card max-w-lg w-full m-4 border-0" shadow="hover">
        <div class="text-center py-8">
          <div class="flex justify-center mb-6">
            <div class="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-lg" style="background-color: var(--el-color-info)">
              <el-icon :size="48" color="white"><Cpu /></el-icon>
            </div>
          </div>
          
          <h1 class="text-8xl font-extrabold mb-2 tracking-tighter" style="color: var(--el-color-info)">500</h1>
          <h2 class="text-3xl font-bold title tracking-tight mb-4">
            Lỗi máy chủ
          </h2>
          <p class="text-base subtitle px-6 mb-10">
            Xin lỗi, đã xảy ra lỗi trên máy chủ. Chúng tôi đang khắc phục sự cố. Vui lòng thử lại sau vài phút.
          </p>
          
          <div class="flex justify-center gap-4">
            <el-button 
              size="large" 
              @click="goBack"
              class="custom-btn"
            >
              <el-icon class="mr-2"><Back /></el-icon>
              Quay lại
            </el-button>
            <el-button 
              type="primary" 
              size="large" 
              @click="goHome"
              class="custom-btn submit-btn"
            >
              <el-icon class="mr-2"><HomeFilled /></el-icon>
              Về trang chủ
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { Cpu, HomeFilled, Back } from "@element-plus/icons-vue";

const router = useRouter();

const goBack = () => {
  router.back();
};

const goHome = () => {
  router.push("/");
};
</script>

<style lang="scss" scoped>
.error-page {
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
    line-height: 1.6;
  }

  .custom-btn {
    border-radius: 10px;
    font-weight: 600;
    padding: 12px 24px;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-2px);
    }
  }

  .submit-btn {
    &:hover {
      box-shadow: 0 8px 20px var(--el-color-primary-light-5);
    }
  }
}
</style>
