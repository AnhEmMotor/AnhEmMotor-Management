<template>
  <transition name="fade-scale">
    <div v-if="visible" class="success-transition-overlay">
      <div class="transition-content">
        <!-- Hiệu ứng xe máy chuyển động -->
        <div class="motorcycle-wrapper">
          <div class="motorcycle-container">
            <svg class="motorcycle-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.5 11C15.8807 11 17 9.88071 17 8.5C17 7.11929 15.8807 6 14.5 6H12V8H14.5C14.7761 8 15 8.22386 15 8.5C15 8.77614 14.7761 9 14.5 9H11V11H14.5ZM9 12.5C9 12.2239 8.77614 12 8.5 12H7C6.44772 12 6 12.4477 6 13V14C6 14.5523 6.44772 15 7 15H11.5L13.5 12.5H9ZM19.5 14C19.5 15.3807 18.3807 16.5 17 16.5C15.6193 16.5 14.5 15.3807 14.5 14C14.5 12.6193 15.6193 11.5 17 11.5C18.3807 11.5 19.5 12.6193 19.5 14ZM17 14.5C17.2761 14.5 17.5 14.2761 17.5 14C17.5 13.7239 17.2761 13.5 17 13.5C16.7239 13.5 16.5 13.7239 16.5 14C16.5 14.2761 16.7239 14.5 17 14.5ZM7 14.5C7.27614 14.5 7.5 14.2761 7.5 14C7.5 13.7239 7.27614 13.5 7 13.5C6.72386 13.5 6.5 13.7239 6.5 14C6.5 14.2761 6.72386 14.5 7 14.5ZM9.5 14C9.5 15.3807 8.38071 16.5 7 16.5C5.61929 16.5 4.5 15.3807 4.5 14C4.5 12.6193 5.61929 11.5 7 11.5C7.32766 11.5 7.64057 11.5631 7.92683 11.6756L8.45524 11H8.5C9.88071 11 11 12.1193 11 13.5V14H9.5ZM19 8C19.5523 8 20 8.44772 20 9V11H21V12H20V14C20 15.6569 18.6569 17 17 17C15.3431 17 14 15.6569 14 14C14 13.2505 14.2758 12.5651 14.733 12.0315L12.35 15H7C5.34315 15 4 13.6569 4 12C4 11.0264 4.4639 10.1607 5.18873 9.61935L5 9C4.44772 9 4 8.55228 4 8C4 7.44772 4.44772 7 5 7H7.13401L8.85246 3.56309C9.2847 2.69862 10.1643 2.15234 11.1311 2.15234H12C13.1046 2.15234 14 3.04777 14 4.15234V5H14.5C16.433 5 18 6.567 18 8.5C18 8.92211 17.9253 9.32684 17.7891 9.70275L18.4373 10H19V8Z" fill="currentColor"/>
            </svg>
            <div class="wind-lines">
              <div class="line"></div>
              <div class="line"></div>
              <div class="line"></div>
            </div>
            <!-- Bánh xe hiệu ứng quay -->
            <div class="wheel wheel-front">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
              </svg>
            </div>
            <div class="wheel wheel-back">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" />
              </svg>
            </div>
          </div>
          <div class="road-line"></div>
        </div>
        
        <h1 class="brand-name">AnhEm Motor</h1>
        <h2 class="mt-4 text-xl font-bold text-white/90 tracking-wide">{{ text }}</h2>
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
  background-color: rgba(10, 10, 15, 0.85);
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
  text-shadow: 0 0 15px rgba(var(--el-color-primary-rgb, 231, 76, 60), 0.6);
  animation: pulse-glow 2s infinite alternate;
  font-family: 'Inter', sans-serif;
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
  background: linear-gradient(90deg, transparent, var(--el-color-primary, #e74c3c), transparent);
  border-radius: 4px;
  margin-top: 10px;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
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
  filter: drop-shadow(0 0 10px rgba(var(--el-color-primary-rgb, 231, 76, 60), 0.5));
  z-index: 2;
}

.wheel {
  position: absolute;
  width: 28px;
  height: 28px;
  color: #fff;
  z-index: 3;
  bottom: 23px;
  animation: spin 0.5s linear infinite;
}

.wheel-front {
  right: 17px;
}

.wheel-back {
  left: 17px;
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

.wind-lines .line:nth-child(1) { width: 30px; animation-delay: 0s; }
.wind-lines .line:nth-child(2) { width: 45px; animation-delay: 0.2s; }
.wind-lines .line:nth-child(3) { width: 20px; animation-delay: 0.4s; }

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
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
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
  0% { transform: translateY(0) rotate(-1deg); }
  100% { transform: translateY(-4px) rotate(2deg); }
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

@keyframes wind {
  0% { transform: translateX(30px); opacity: 0; }
  20% { opacity: 0.8; }
  80% { opacity: 0.8; }
  100% { transform: translateX(-50px); opacity: 0; }
}

@keyframes road-move {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}

@keyframes pulse-glow {
  0% { text-shadow: 0 0 10px rgba(var(--el-color-primary-rgb, 231, 76, 60), 0.3); }
  100% { text-shadow: 0 0 25px rgba(var(--el-color-primary-rgb, 231, 76, 60), 0.8); }
}

@keyframes dot-pulse {
  0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
}
</style>
