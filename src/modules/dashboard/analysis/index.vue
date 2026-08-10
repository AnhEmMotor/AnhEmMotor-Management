<template>
  <div class="resp-page revenue-dashboard" v-if="false">
    <div class="header-actions flex justify-between items-center mb-5">
      <h2 class="text-xl font-bold m-0">Dashboard Tổng quan Doanh thu</h2>
      <ElRadioGroup v-model="period" size="default">
        <ElRadioButton value="today">Hôm nay</ElRadioButton>
        <ElRadioButton value="month">Tháng này</ElRadioButton>
        <ElRadioButton value="year">Năm này</ElRadioButton>
        <ElRadioButton value="custom">Tuỳ chọn...</ElRadioButton>
      </ElRadioGroup>
    </div>

    <RevenueKpi :period="period" />

    <div class="mt-5">
      <RevenueChart :period="period" />
    </div>

    <ElRow :gutter="20" class="mt-5">
      <ElCol :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
        <RevenueSources :period="period" />
      </ElCol>

      <ElCol :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
        <StaffPerformance :period="period" />
      </ElCol>
    </ElRow>

    <div class="mt-5">
      <RecentTransactions />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import RevenueKpi from './modules/revenue-kpi.vue';
import RevenueChart from './modules/revenue-chart.vue';
import RevenueSources from './modules/revenue-sources.vue';
import StaffPerformance from './modules/staff-performance.vue';
import RecentTransactions from './modules/recent-transactions.vue';

defineOptions({ name: 'Analysis' });

const period = ref('today');
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
