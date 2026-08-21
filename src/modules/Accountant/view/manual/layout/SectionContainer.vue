<template>
  <div class="section-container">
    <el-button class="back-btn" @click="$emit('back')" :icon="Back" type="primary" plain>
      Quay lại
    </el-button>
    <div class="section-header">
      <el-icon class="section-icon" :style="{ color: section.color }">
        <component :is="section.icon" />
      </el-icon>
      <h1 class="section-title">{{ section.title }}</h1>
    </div>
    <p class="section-desc">{{ section.description }}</p>
    <div v-if="section.imageUrl" class="section-image-wrapper">
      <img :src="section.imageUrl" alt="Section Illustration" class="section-image" />
    </div>
    <div class="pages-list">
      <div v-for="page in section.pages" :key="page.id" class="page-card">
        <div class="page-header">
          <h3 class="page-title">{{ page.title }}</h3>
          <el-tag v-if="page.permission" type="info" size="small" effect="plain">
            {{ page.permission }}
          </el-tag>
        </div>
        <p class="page-desc">{{ page.description }}</p>
        <div class="route-badge">
          <el-icon><Location /></el-icon>
          <code>{{ page.route }}</code>
        </div>
        <div class="steps-box">
          <div v-for="(step, i) in page.steps" :key="i" class="step-row">
            <span class="step-num">{{ i + 1 }}</span>
            <span class="step-text">{{ step }}</span>
          </div>
        </div>
        <el-alert
          v-if="page.tips && page.tips.length"
          type="info"
          :closable="false"
          class="tips-box"
        >
          <template #title><strong>Mẹo hữu ích:</strong></template>
          <ul class="tips-list">
            <li v-for="(t, i) in page.tips" :key="i">{{ t }}</li>
          </ul>
        </el-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GuideSection } from '../data/guideData';
import { Location, Back } from '@element-plus/icons-vue';
defineProps<{ section: GuideSection }>();
defineEmits<{ back: [] }>();
</script>

<style scoped lang="scss">
.section-container {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.back-btn {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
}

.section-icon {
  font-size: 36px;
}

.section-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--el-text-color-primary);
  margin: 0;
}

.section-desc {
  font-size: 15px;
  color: var(--el-text-color-secondary);
  margin: 0 0 28px 50px;
}

.section-image-wrapper {
  margin: 0 0 32px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgb(0 0 0 / 8%);
  border: 1px solid var(--el-border-color-lighter);
  max-width: 1200px;
}

.section-image {
  width: 100%;
  height: auto;
  display: block;
}

.pages-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 24px;
  align-items: start;
}

.page-card {
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  padding: 24px 28px;
  box-shadow: 0 2px 12px rgb(0 0 0 / 4%);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0;
}

.page-desc {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0 0 14px;
}

.route-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  margin-bottom: 18px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.route-badge code {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 13px;
}

.steps-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.step-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.step-num {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}

.step-text {
  flex: 1;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
  padding-top: 3px;
}

.tips-box {
  border-radius: 10px;
}

.tips-list {
  margin: 6px 0 0 20px;
  padding: 0;
}

.tips-list li {
  font-size: 13px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}
</style>
