<template>
  <div class="console-dashboard">
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800">📊 Trung tâm Thống kê & Điều hành</h1>
    </div>

    <!-- 4 Thẻ KPI: Tổng thu, Tổng chi, Lợi nhuận gộp, Lợi nhuận ròng -->
    <CardList />

    <ElRow :gutter="20">
      <ElCol :sm="24" :md="12" :lg="10">
        <!-- Dashboard Xưởng Dịch Vụ -->
        <ActiveUser />
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="14">
        <!-- Biểu đồ so sánh doanh thu và chi phí -->
        <SalesOverview />
      </ElCol>
    </ElRow>

    <ElRow :gutter="20">
      <ElCol :sm="24" :md="24" :lg="12">
        <!-- Dashboard Thuế & Hóa đơn -->
        <NewUser />
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="6">
        <!-- Audit Log / Hoạt động hệ thống -->
        <Dynamic />
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="6">
        <!-- Cảnh báo hệ thống (Todo) -->
        <TodoList />
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import CardList from './modules/card-list.vue'
  import ActiveUser from './modules/active-user.vue'
  import SalesOverview from './modules/sales-overview.vue'
  import NewUser from './modules/new-user.vue'
  import Dynamic from './modules/dynamic-stats.vue'
  import TodoList from './modules/todo-list.vue'

  defineOptions({ name: 'Console' })
</script>
