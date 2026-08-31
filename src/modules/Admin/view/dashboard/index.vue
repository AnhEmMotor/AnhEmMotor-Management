<template>
  <div class="resp-page console-dashboard">
    <div class="dash-header mb-6">
      <div class="dash-header__left">
        <div class="dash-header__icon">📊</div>
        <div>
          <h1 class="dash-header__title">Trung tâm Thống kê & Điều hành Đa Phân hệ</h1>
          <p class="dash-header__sub">
            Giám sát toàn diện 5 phân hệ cốt lõi: Bán hàng, Kho vận, Xưởng dịch vụ, Tài chính &
            Khách hàng
          </p>
        </div>
      </div>
      <div class="dash-header__controls">
        <ElRadioGroup v-model="timeFilter" size="default">
          <ElRadioButton value="today">Hôm nay</ElRadioButton>
          <ElRadioButton value="week">Tuần này</ElRadioButton>
          <ElRadioButton value="month">Tháng này</ElRadioButton>
          <ElRadioButton value="year">Năm nay</ElRadioButton>
        </ElRadioGroup>
        <ElDatePicker
          v-model="dateRange"
          type="daterange"
          range-separator="→"
          start-placeholder="Từ ngày"
          end-placeholder="Đến ngày"
          size="default"
          style="width: 240px"
        />
      </div>
    </div>

    <CardList :time-filter="timeFilter" :date-range="dateRange" />

    <SubsystemsOverview :time-filter="timeFilter" />

    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :md="16" :lg="16">
        <SalesOverview />
      </ElCol>
      <ElCol :sm="24" :md="8" :lg="8">
        <ActiveUser :time-filter="timeFilter" />
      </ElCol>
    </ElRow>

    <ElRow :gutter="20">
      <ElCol :sm="24" :md="12" :lg="12">
        <Dynamic />
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="12">
        <TodoList :time-filter="timeFilter" />
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CardList from './card-list.vue';
import SubsystemsOverview from './subsystems-overview.vue';
import ActiveUser from './active-user.vue';
import SalesOverview from './sales-overview.vue';
import Dynamic from './dynamic-stats.vue';
import TodoList from './todo-list.vue';

defineOptions({ name: 'AdminDashboard' });

const timeFilter = ref('month');
const dateRange = ref<[Date, Date] | null>(null);
</script>

<style scoped lang="scss">
.console-dashboard {
  padding: 24px;
  max-width: 100%;

  @media (width <= 640px) {
    padding: 12px;
  }
}

.dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;

  &__left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__icon {
    font-size: 32px;
    line-height: 1;
  }

  &__title {
    font-size: 22px;
    font-weight: 800;
    color: var(--el-text-color-primary);
    margin: 0 0 4px;
    letter-spacing: -0.3px;
  }

  &__sub {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin: 0;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
}
</style>
