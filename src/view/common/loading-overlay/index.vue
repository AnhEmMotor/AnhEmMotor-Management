<template>
  <transition name="fade-scale">
    <div v-if="visible" class="success-transition-overlay">
      <div class="transition-content">
        <!-- Hiệu ứng xe máy chuyển động -->
        <div class="motorcycle-wrapper">
          <div class="motorcycle-container">
            <div class="system-text-icon">Hệ thống kinh doanh xe máy</div>
            <div class="wind-lines">
              <div class="line"></div>
              <div class="line"></div>
              <div class="line"></div>
            </div>
          </div>
          <div class="road-line"></div>
        </div>

        <h1 class="brand-name">AnhEm Motor</h1>
        <h2 class="mt-4 text-xl font-bold text-white/90 tracking-wide">
          {{ text }}
        </h2>
        <div class="loading-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    visible: boolean;
    text?: string;
  }>(),
  {
    visible: false,
    text: "Đang tải dữ liệu",
  },
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
  background-color: rgb(10 10 15 / 85%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  .transition-content {
    position: relative;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

.brand-name {
  font-size: 2.8rem;
  font-weight: 900;
  color: var(--el-color-primary, #e74c3c);
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-top: 1.5rem;
  margin-bottom: 0;
  text-shadow: 0 0 15px rgb(var(--el-color-primary-rgb, 231, 76, 60), 0.6);
  animation: pulse-glow 2s infinite alternate;
  font-family: Inter, sans-serif;
}

.motorcycle-wrapper {
  position: relative;
  width: 340px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.road-line {
  width: 100%;
  height: 4px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--el-color-primary, #e74c3c),
    transparent
  );
  border-radius: 4px;
  margin-top: 10px;
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 30%;
    height: 100%;
    background-color: white;
    box-shadow: 0 0 10px white;
    animation: road-move 1s linear infinite;
  }
}

.motorcycle-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  animation: bounce 0.4s ease-in-out infinite alternate;
}

.system-text-icon {
  color: var(--el-color-primary, #e74c3c);
  font-size: 1.15rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;
  filter: drop-shadow(
    0 0 10px rgb(var(--el-color-primary-rgb, 231, 76, 60), 0.5)
  );
  z-index: 2;
}

.wind-lines {
  position: absolute;
  right: 100%;
  top: 40%;
  transform: translateY(-50%);
  width: 60px;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.wind-lines .line {
  height: 2px;
  background-color: var(--el-color-primary, #e74c3c);
  border-radius: 2px;
  margin-bottom: 12px;
  opacity: 0;
  animation: wind 0.8s linear infinite;
}

.wind-lines .line:nth-child(1) {
  width: 30px;
  animation-delay: 0s;
}

.wind-lines .line:nth-child(2) {
  width: 45px;
  animation-delay: 0.2s;
}

.wind-lines .line:nth-child(3) {
  width: 20px;
  animation-delay: 0.4s;
}

.loading-dots {
  display: flex;
  gap: 8px;
  margin-top: 15px;

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--el-color-primary, #e74c3c);
    animation: dot-pulse 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

@keyframes bounce {
  0% {
    transform: translateY(0) rotate(-1deg);
  }

  100% {
    transform: translateY(-4px) rotate(2deg);
  }
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes wind {
  0% {
    transform: translateX(30px);
    opacity: 0;
  }

  20% {
    opacity: 0.8;
  }

  80% {
    opacity: 0.8;
  }

  100% {
    transform: translateX(-50px);
    opacity: 0;
  }
}

@keyframes road-move {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(300%);
  }
}

@keyframes pulse-glow {
  0% {
    text-shadow: 0 0 10px rgb(var(--el-color-primary-rgb, 231, 76, 60), 0.3);
  }

  100% {
    text-shadow: 0 0 25px rgb(var(--el-color-primary-rgb, 231, 76, 60), 0.8);
  }
}

@keyframes dot-pulse {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.3;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
