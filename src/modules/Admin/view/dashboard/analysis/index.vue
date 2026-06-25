<template>
  <div class="revenue-dashboard" v-if="false">
    <!-- 2.1 THANH CHUYỂN ĐỔI CHU KỲ -->
    <div class="header-actions flex justify-between items-center mb-5">
      <h2 class="text-xl font-bold m-0">Dashboard Tổng quan Doanh thu</h2>
      <ElRadioGroup v-model="period" size="default">
        <ElRadioButton label="today">Hôm nay</ElRadioButton>
        <ElRadioButton label="month">Tháng này</ElRadioButton>
        <ElRadioButton label="year">Năm này</ElRadioButton>
        <ElRadioButton label="custom">Tuỳ chọn...</ElRadioButton>
      </ElRadioGroup>
    </div>

    <!-- 2.2 4 CHỈ SỐ ĐẦU TRANG (KPI CARDS) -->
    <RevenueKpi :period="period" />

    <!-- 2.3 BIỂU ĐỒ DOANH THU CHÍNH -->
    <div class="mt-5">
      <RevenueChart :period="period" />
    </div>

    <ElRow :gutter="20" class="mt-5">
      <!-- 2.4 PHÂN TÍCH NGUỒN DOANH THU -->
      <ElCol :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
        <RevenueSources :period="period" />
      </ElCol>

      <!-- 2.5 HIỆU SUẤT NHÂN VIÊN -->
      <ElCol :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
        <StaffPerformance :period="period" />
      </ElCol>
    </ElRow>

    <!-- 2.6 DÒNG GIAO DỊCH THỜI GIAN THỰC -->
    <div class="mt-5">
      <RecentTransactions />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import RevenueKpi from "./modules/revenue-kpi.vue";
import RevenueChart from "./modules/revenue-chart.vue";
import RevenueSources from "./modules/revenue-sources.vue";
import StaffPerformance from "./modules/staff-performance.vue";
import RecentTransactions from "./modules/recent-transactions.vue";

defineOptions({ name: "Analysis" });

const period = ref("today");
</script>

<style scoped>
.revenue-dashboard {
  padding: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
