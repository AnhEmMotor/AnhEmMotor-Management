<template>
  <div class="resp-page">
    <ElRow :gutter="20" class="flex">
      <ElCol v-for="item in dataList" :key="item.label" :sm="12" :md="6" :lg="6">
        <div class="art-card relative flex flex-col justify-center h-35 px-5 mb-5 max-sm:mb-4">
          <span class="text-g-700 text-sm">{{ item.label }}</span>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2 mb-1">
            {{ item.value }}
          </h2>
          <div class="flex-c mt-1">
            <span class="text-xs text-g-600">Period nay</span>
          </div>
          <div
            class="absolute top-0 bottom-0 right-5 m-auto size-12.5 rounded-xl flex-cc bg-theme/10"
          >
            <ArtSvgIcon :icon="item.icon" class="text-xl text-theme" />
          </div>
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { fetchDashboardKpis } from '@/api/dashboard.api';

interface DataItem {
  label: string;
  value: string;
  icon: string;
}

const dataList = reactive<DataItem[]>([]);
const isLoading = ref(false);

function fmt(v: number): string {
  return v.toLocaleString('vi-VN');
}

async function load() {
  isLoading.value = true;
  try {
    const kpis = await fetchDashboardKpis();
    dataList.length = 0;
    (kpis.cards ?? []).forEach((c: any) => {
      dataList.push({
        label: c.label,
        value: fmt(c.value as number),
        icon: c.icon,
      });
    });
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
}

onMounted(load);
</script>
