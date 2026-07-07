<template>
  <transition name="fade-scale">
    <div v-if="visible" class="success-transition-overlay">
      <div class="transition-content">
        <!-- Hiệu ứng xe máy chuyển động -->
        <div class="motorcycle-wrapper">
          <div class="motorcycle-container">
            <svg
              class="motorcycle-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5,13C6.66,13 8,14.34 8,16C8,17.66 6.66,19 5,19C3.34,19 2,17.66 2,16C2,14.34 3.34,13 5,13M19,13C20.66,13 22,14.34 22,16C22,17.66 20.66,19 19,19C17.34,19 16,17.66 16,16C16,14.34 17.34,13 19,13M5,15C4.45,15 4,15.45 4,16C4,16.55 4.45,17 5,17C5.55,17 6,16.55 6,16C6,15.45 5.55,15 5,15M19,15C18.45,15 18,15.45 18,16C18,16.55 18.45,17 19,17C19.55,17 20,16.55 20,16C20,15.45 19.55,15 19,15M19,5.5L16.27,9.3C15.89,9.81 15.28,10.12 14.62,10.12H13.8L12.44,7.4L13.34,5.63L11.56,4.73L10.65,6.5L9.67,4.55C9.3,3.81 8.52,3.31 7.63,3.29C6.41,3.25 5.4,4.22 5.4,5.43V6.26L6.96,9.35L7.85,8.89L6.55,6.31V5.45L7.57,5.46L11.5,13.3L8.6,13.3C7.94,12.5 6.94,12 5.82,12C5.55,12 5.27,12.04 5,12.11V11.1L5.9,11.1C6.91,11.1 7.78,10.53 8.23,9.7L9.59,6.7L10.74,9C11.37,10.27 12.7,11.12 14.15,11.12H14.63C15.77,11.12 16.82,10.58 17.47,9.7L20.4,5.55L19,5.5M12.92,8.6L12,6.77L13,8.75L12.92,8.6M14,14V17H10V14H14Z"
                fill="currentColor"
              />
            </svg>
            <div class="wind-lines">
              <div class="line"></div>
              <div class="line"></div>
              <div class="line"></div>
            </div>
            <!-- Bánh xe hiệu ứng quay -->
            <div class="wheel wheel-front">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-dasharray="4 4"
                />
              </svg>
            </div>
            <div class="wheel wheel-back">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-dasharray="4 4"
                />
              </svg>
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
