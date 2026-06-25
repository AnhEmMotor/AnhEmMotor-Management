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
