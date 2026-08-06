<template>
  <div class="page-card">
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
        <div
          style="
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          "
        >
          <span class="step-text" v-html="processStepHtml(step)"></span>
          <div
            v-if="isAdmin && getStepFileName(step)"
            style="margin-top: 10px; margin-left: 12px"
          >
            <el-upload
              action="#"
              :show-file-list="false"
              :http-request="
                (options) => handleUpload(options, getStepFileName(step))
              "
              accept="image/*"
            >
              <el-button size="small" type="primary" plain :icon="Upload">
                Cập nhật ảnh minh họa
              </el-button>
            </el-upload>
          </div>
        </div>
      </div>
    </div>
    <el-alert
      v-if="page.tips && page.tips.length"
      type="info"
      :closable="false"
      class="tips-box"
    >
      <template #title><strong>Meo huu ich:</strong></template>
      <ul class="tips-list">
        <li v-for="(t, i) in page.tips" :key="i">{{ t }}</li>
      </ul>
    </el-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Location, Upload } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { GuidePage } from "../data/guideData";
import { FileApi } from "@/api/operations";
import { useUserStore } from "@/application/store/user";

defineProps<{
  page: GuidePage;
}>();

const userStore = useUserStore();
const cacheBuster = ref(Date.now());

const isAdmin = computed(() => {
  return userStore.isLogin;
});

const getStepFileName = (step: string) => {
  const match = step.match(/\/manuals\/([^./]+)\.png/);
  return match ? match[1] : "";
};

const processStepHtml = (step: string) => {
  if (!step.includes("<img")) return step;
  return step.replace(/src='([^']+)'/g, (match, src) => {
    const separator = src.includes("?") ? "&" : "?";
    return `src='${src}${separator}cb=${cacheBuster.value}'`;
  });
};

const handleUpload = async (options: any, targetFileName: string) => {
  try {
    await FileApi.uploadManualImage(options.file, targetFileName);
    cacheBuster.value = Date.now();
    ElMessage.success("Cập nhật ảnh minh họa thành công!");
  } catch (err: any) {
    ElMessage.error(err.message || "Tải ảnh lên thất bại");
  }
};
</script>

<style scoped lang="scss">
.page-card {
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgb(0 0 0 / 2%);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: var(--el-color-primary);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgb(0 0 0 / 6%);
    border-color: var(--el-border-color-light);

    &::before {
      opacity: 1;
    }
  }
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-desc {
  font-size: 14px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
  margin: 0 0 16px;
}

.route-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  transition: background 0.2s ease;

  &:hover {
    background: var(--el-fill-color);
  }

  code {
    font-family: "SF Mono", Monaco, Consolas, monospace;
    font-size: 12px;
    color: var(--el-color-primary);
    font-weight: 600;
  }
}

.steps-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.step-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 10px;
  transition: background 0.3s ease;

  &:hover {
    background: var(--el-fill-color-light);

    .step-num {
      transform: scale(1.05);
      box-shadow: 0 4px 10px rgb(var(--el-color-primary-rgb), 0.2);
    }
  }
}

.step-num {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--el-color-primary),
    var(--el-color-primary-light-3)
  );
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  box-shadow: 0 2px 6px rgb(var(--el-color-primary-rgb), 0.15);
  transition: all 0.3s ease;
  margin-top: 2px;
}

.step-text {
  flex: 1;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-primary);
  padding-top: 6px;

  :deep(img) {
    display: block;
    max-width: 80%;
    border-radius: 10px;
    margin-top: 12px;
    border: 1px solid var(--el-border-color-lighter);
    box-shadow: 0 2px 10px rgb(0 0 0 / 4%);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgb(0 0 0 / 8%);
    }
  }

  :deep(b),
  :deep(strong) {
    color: var(--el-color-primary);
    font-weight: 600;
  }
}

.tips-box {
  border-radius: 10px;
  border: 1px solid var(--el-color-info-light-7);
  background: var(--el-color-info-light-9);

  :deep(.el-alert__title) {
    font-size: 14px;
    color: var(--el-color-info-dark-2);
  }
}

.tips-list {
  margin: 8px 0 0 20px;
  padding: 0;
}

.tips-list li {
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-color-info-dark-2);
  margin-bottom: 4px;

  &::marker {
    color: var(--el-color-info);
  }
}
</style>
