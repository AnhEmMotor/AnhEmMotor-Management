<template>
  <div class="console-dashboard">
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800">
        📊 Trung tâm Thống kê & Điều hành
      </h1>
    </div>

    <!-- 4 Thẻ KPI: Tổng thu, Tổng chi, Lợi nhuận gộp, Lợi nhuận ròng -->
    <CardList />

    <ElRow :gutter="20">
      <ElCol :sm="24" :md="12" :lg="10">
        <!-- Tổng quan người dùng hoạt động -->
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
import CardList from "./card-list.vue";
import ActiveUser from "./active-user.vue";
import SalesOverview from "./sales-overview.vue";
import NewUser from "./new-user.vue";
import Dynamic from "./dynamic-stats.vue";
import TodoList from "./todo-list.vue";

defineOptions({ name: "AdminDashboard" });
</script>
