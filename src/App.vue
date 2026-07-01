<template>
  <ElConfigProvider
    size="default"
    :locale="locales[language]"
    :z-index="3000"
    :card="{
      shadow: 'never',
    }"
  >
    <RouterView></RouterView>
  </ElConfigProvider>
</template>

<script setup lang="ts">
import { useUserStore } from "./application/store/user";
import vi from "element-plus/es/locale/lang/vi";
import en from "element-plus/es/locale/lang/en";
import { systemUpgrade } from "@/common/utils/sys";
import { toggleTransition } from "@/common/utils/ui/animation";
import { checkStorageCompatibility } from "@/common/utils/storage";
import { initializeTheme } from "@/common/composables/useTheme";

const userStore = useUserStore();
const { language } = storeToRefs(userStore);

const locales: Record<string, any> = {
  vi: vi,
  en: en,
};

onBeforeMount(() => {
  toggleTransition(true);
  initializeTheme();
});

onMounted(() => {
  checkStorageCompatibility();
  toggleTransition(false);
  systemUpgrade();
});
</script>

<style lang="scss">
/* 
 * FORCE GLOBAL DARK MODE VARIABLES 
 * This ensures dark mode works perfectly across ALL pages in the app,
 * bypassing any Tailwind CSS caching or Element Plus theme variable issues.
 */
html.dark {
  --art-color: #fff !important;
  --default-bg-color: #070707 !important;
  --default-box-color: #161618 !important;
  --default-border: #333 !important;
  --default-border-dashed: #333 !important;
  --art-gray-900: #e5e6eb !important;
  --art-gray-800: #e5e6eb !important;
  --art-gray-700: #a3a6ad !important;
  --art-gray-600: #8c8f94 !important;
  --art-gray-500: #676a6f !important;
  --art-gray-400: #414243 !important;
  --art-gray-300: #333 !important;
  --art-gray-200: #2a2b2c !important;
  --art-text-gray-900: #e5e6eb !important;
  --art-text-gray-800: #e5e6eb !important;
  --art-text-gray-700: #a3a6ad !important;
  --art-card-border: #333 !important;
  --art-el-active-color: #1d1e1f !important;
}

html.dark .el-card {
  --el-card-bg-color: #161618 !important;
  --el-card-border-color: #333 !important;
  --el-text-color-primary: #e5e6eb !important;
  --el-text-color-regular: #a3a6ad !important;
  --el-border-color-light: #333 !important;
  --el-border-color-lighter: #414243 !important;
  --el-fill-color-blank: #161618 !important;
  --el-bg-color-overlay: #1d1e1f !important;
  --el-bg-color: #161618 !important;
}

html.dark .art-card,
html.dark .art-card-sm,
html.dark .art-card-xs {
  background: #161618 !important;
  border-color: #333 !important;
}

html.dark .art-card p {
  color: #e5e6eb !important;
}

html.dark .el-table {
  --el-table-bg-color: #161618 !important;
  --el-table-tr-bg-color: #161618 !important;
  --el-table-header-bg-color: #1d1e1f !important;
  --el-table-row-hover-bg-color: #1d1e1f !important;
  --el-table-border-color: #333 !important;
  --el-table-text-color: #e5e6eb !important;
  --el-table-header-text-color: #a3a6ad !important;
}

html.dark .el-drawer,
html.dark .el-dialog {
  --el-dialog-bg-color: #1d1e1f !important;
  --el-bg-color: #1d1e1f !important;
  --el-text-color-primary: #e5e6eb !important;
}

html.dark .el-pagination {
  --el-pagination-bg-color: #161618 !important;
  --el-pagination-button-bg-color: #1d1e1f !important;
  --el-pagination-button-disabled-bg-color: #161618 !important;
}
</style>
