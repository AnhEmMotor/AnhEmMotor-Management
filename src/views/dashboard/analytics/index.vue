<template>
  <div class="analytics-reporting">
    <ElRow :gutter="20">
      <ElCol :xs="24" :lg="24">
        <AnalyticsDashboard />
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" class="mt-5">
      <ElCol :xs="24" :lg="12">
        <ExpenseManagement />
      </ElCol>
      <ElCol :xs="24" :lg="12">
        <FinancialReport />
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import AnalyticsDashboard from './modules/analytics-dashboard.vue'
  import ExpenseManagement from './modules/expense-management.vue'
  import FinancialReport from './modules/financial-report.vue'

  defineOptions({ name: 'Analytics' })
</script>
