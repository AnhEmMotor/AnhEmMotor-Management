<template>
  <div class="resp-page console-dashboard">
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
        📊 Trung tâm Thống kê & Điều hành
      </h1>
      <div class="flex items-center gap-3">
        <ElRadioGroup v-model="timeFilter" size="default">
          <ElRadioButton value="today">Hôm nay</ElRadioButton>
          <ElRadioButton value="week">Tuần này</ElRadioButton>
          <ElRadioButton value="month">Tháng này</ElRadioButton>
          <ElRadioButton value="year">Năm nay</ElRadioButton>
        </ElRadioGroup>
        <ElDatePicker
          v-model="dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="Từ ngày"
          end-placeholder="Đến ngày"
          size="default"
          style="width: 240px"
        />
      </div>
    </div>

    <CardList :time-filter="timeFilter" :date-range="dateRange" />

    <ElRow :gutter="20">
      <ElCol :sm="24" :md="12" :lg="10">
        <ActiveUser />
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="14">
        <SalesOverview />
      </ElCol>
    </ElRow>

    <ElRow :gutter="20">
      <ElCol :sm="24" :md="12" :lg="12">
        <Dynamic />
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="12">
        <TodoList />
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CardList from './card-list.vue';
import ActiveUser from './active-user.vue';
import SalesOverview from './sales-overview.vue';
import Dynamic from './dynamic-stats.vue';
import TodoList from './todo-list.vue';

defineOptions({ name: 'AdminDashboard' });

const timeFilter = ref('month');
const dateRange = ref<[Date, Date] | null>(null);
</script>
