<template>
  <transition name="fade-scale">
    <div v-if="visible" class="success-transition-overlay">
      <div class="transition-content">
        <!-- Hiệu ứng xe máy chuyển động -->
        <div class="motorcycle-wrapper">
          <div class="motorcycle-container">
            <svg
              class="motorcycle-icon"
              viewBox="0 0 640 512"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M432 0h-86.4c-11.8 0-22.3 7.3-26.6 18.4L271.7 136H240C222.3 136 208 150.3 208 168v24H155.6c-17.1-17.7-41.2-28.5-67.6-28.5C39.4 163.5 0 202.9 0 251.5c0 43.1 30.8 79.2 71.8 86.8L126.9 448H48c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h40c8.8 0 16-7.2 16-16v-18.7h96V496c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-65.5l98.9-88c21.8 19.1 50.4 30.5 81.1 30.5c66.3 0 120-53.7 120-120c0-62.8-48.4-114.5-109.8-119.5l30.8-82.2c3.5-9.3-.8-19.8-9.8-24.1l-25.1-11.9c-8.9-4.2-19.6-.8-24.1 8.3L371.3 200H303.4l37-96H432c8.8 0 16-7.2 16-16V16c0-8.8-7.2-16-16-16zm64 184c39.8 0 72 32.2 72 72s-32.2 72-72 72s-72-32.2-72-72s32.2-72 72-72zm-408 8c22.1 0 40 17.9 40 40s-17.9 40-40 40s-40-17.9-40-40s17.9-40 40-40z"
              />
            </svg>
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
  width: 200px;
  height: 140px;
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
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: bounce 0.4s ease-in-out infinite alternate;
}

.motorcycle-icon {
  width: 100px;
  height: 100px;
  color: var(--el-color-primary, #e74c3c);
  filter: drop-shadow(
    0 0 10px rgb(var(--el-color-primary-rgb, 231, 76, 60), 0.5)
  );
  z-index: 2;
}

.wheel {
  position: absolute;
  width: 24px;
  height: 24px;
  color: #fff;
  z-index: 3;
  bottom: 21px;
  animation: spin 0.5s linear infinite;
}

.wheel-front {
  right: 9px;
}

.wheel-back {
  left: 9px;
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
