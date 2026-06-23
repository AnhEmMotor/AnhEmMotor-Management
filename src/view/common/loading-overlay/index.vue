<template>
  <transition name="fade-scale">
    <div v-if="visible" class="success-transition-overlay">
      <div class="transition-content">
        <div class="pulse-ring"></div>
        <div class="icon-container" style="background-color: var(--el-color-primary)">
          <el-icon class="is-loading" :size="40" color="white"><Loading /></el-icon>
        </div>
        <h2 class="mt-6 text-2xl font-bold text-white tracking-wide">{{ text }}</h2>
        <p class="mt-2 text-white/80">Vui lòng chờ trong giây lát...</p>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { Loading } from "@element-plus/icons-vue";

withDefaults(
  defineProps<{
    visible: boolean;
    text?: string;
  }>(),
  {
    visible: false,
    text: "Đang tải dữ liệu",
  }
);
</script>

<style lang="scss" scoped>
.success-transition-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  .transition-content {
    position: relative;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;

    .icon-container {
      position: relative;
      z-index: 2;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 30px var(--el-color-primary);
    }

    .pulse-ring {
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background-color: var(--el-color-primary);
      opacity: 0.5;
      animation: pulse 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
      z-index: 1;
    }
  }
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.5s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

@keyframes pulse {
  0% {
    transform: translateX(-50%) scale(0.8);
    opacity: 0.8;
  }
  70% {
    transform: translateX(-50%) scale(1.5);
    opacity: 0;
  }
  100% {
    transform: translateX(-50%) scale(1.5);
    opacity: 0;
  }
}
</style>
