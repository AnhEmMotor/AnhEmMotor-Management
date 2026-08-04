<template>
  <div class="section-container">
    <el-button
      class="back-btn"
      @click="$emit('back')"
      icon="Back"
      type="primary"
      plain
    >
      Quay lai Tong quan
    </el-button>
    <div class="section-header">
      <div
        class="icon-wrapper"
        :style="{ '--section-shadow-color': section.shadowColor }"
      >
        <el-icon class="section-icon" :style="{ color: section.color }">
          <component :is="section.icon" />
        </el-icon>
      </div>
      <h1 class="section-title">{{ section.title }}</h1>
    </div>
    <p class="section-desc">{{ section.description }}</p>
    <div class="pages-list">
      <PageCard v-for="page in section.pages" :key="page.id" :page="page" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GuideSection } from "../data/guideData";
import PageCard from "./PageCard.vue";

defineProps<{ section: GuideSection }>();
defineEmits<{ back: [] }>();
</script>

<style scoped lang="scss">
.section-container {
  padding: 24px 20px;
  max-width: 900px;
  margin: 0 auto;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.back-btn {
  margin-bottom: 24px;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(-4px);
    box-shadow: 0 4px 12px rgb(var(--el-color-primary-rgb), 0.2);
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--section-shadow-color, rgb(0 0 0 / 5%));
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05) rotate(-5deg);
  }
}

.section-icon {
  font-size: 26px;
}

.section-title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--el-text-color-primary);
  margin: 0;
  background: linear-gradient(
    135deg,
    var(--el-text-color-primary) 0%,
    var(--el-text-color-regular) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-desc {
  font-size: 15px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  margin: 0 0 24px 64px;
  max-width: 700px;
}

.pages-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
