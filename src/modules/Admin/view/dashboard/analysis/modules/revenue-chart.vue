<template>
  <div class="art-card p-5 mb-5">
    <ElRow :gutter="20">
      <!-- Biểu đồ -->
      <ElCol :xl="18" :lg="16" :md="24" :sm="24" :xs="24">
        <h4 class="m-0 mb-4 font-bold text-lg">BIỂU ĐỒ DOANH THU CHÍNH</h4>
        <div style="height: 300px">
          <ArtBarChart
            height="100%"
            :data="chartData"
            :xAxisData="xAxisData"
            :showLegend="true"
            :showAxisLine="true"
            barWidth="20%"
          />
        </div>
      </ElCol>

      <!-- 3 con số tóm tắt -->
      <ElCol
        :xl="6"
        :lg="8"
        :md="24"
        :sm="24"
        :xs="24"
        class="flex flex-col justify-center border-l border-gray-100 pl-6 mt-4 lg:mt-0"
      >
        <h5 class="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-6">
          Tháng 5/2026 — 8 ngày đã qua
        </h5>

        <div class="mb-6">
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Đã đạt
          </div>
          <div class="text-xl font-bold text-blue-600">285.000.000đ</div>
        </div>

        <div class="mb-6">
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Cần thêm
          </div>
          <div class="text-xl font-bold text-orange-500">415.000.000đ</div>
        </div>

        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Dự báo (Dựa trên tốc độ hiện tại)
          </div>
          <div class="text-xl font-bold text-green-600">
            ~890.000.000đ
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400"
              >(89%)</span
            >
          </div>
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ArtBarChart from "@/components/core/charts/art-bar-chart/index.vue";

const props = defineProps({
  period: {
    type: String,
    default: "today",
  },
});

// Mock data based on period
const xAxisData = computed(() => {
  if (props.period === "today") {
    return ["8h", "10h", "12h", "14h", "16h", "18h"];
  }
  // month
  return Array.from({ length: 30 }, (_, i) => (i + 1).toString());
});

const chartData = computed(() => {
  if (props.period === "today") {
    return [
      {
        name: "Doanh thu",
        data: [15, 22, 10, 25, 30, 18], // Triệu đồng
      },
    ];
  }
  // month
  return [
    {
      name: "Doanh thu",
      data: Array.from(
        { length: 30 },
        () => Math.floor(Math.random() * 80) + 40,
      ),
    },
  ];
});
</script>

<style scoped>
.art-card {
  background-color: var(--art-bg-color);
  border: 1px solid var(--art-border-color);
  border-radius: var(--art-border-radius);
}
</style>
