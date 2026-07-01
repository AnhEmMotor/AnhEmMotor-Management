<template>
  <div class="hr-employee-container flex flex-col gap-4 h-full">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ $t("menus.hr.employee") }}</h1>
      <ElButton type="primary" v-ripple @click="handleAdd">
        <ElIcon class="mr-1"><Plus /></ElIcon> Thêm nhân viên
      </ElButton>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ArtStatsCard
        title="Tổng nhân viên"
        :count="stats.total"
        icon="ri:group-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Đang làm việc"
        :count="stats.active"
        icon="ri:checkbox-circle-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Đã nghỉ việc"
        :count="stats.inactive"
        icon="ri:close-circle-line"
        iconStyle="bg-danger"
      />
    </div>

    <!-- Main Content -->
    <ElCard class="flex-1 art-table-card flex flex-col" shadow="never">
      <div class="mb-4">
        <ArtSearchBar
          v-model="searchForm"
          :items="searchItems"
          :label-width="80"
          :span="6"
          @search="handleSearch"
          @reset="handleReset"
        />
      </div>

      <ArtTableHeader
        v-model:columns="columnChecks"
        :loading="loading"
        @refresh="loadData"
      />

      <ArtTable
        ref="tableRef"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #fullName="{ row }">
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 rounded-full bg-primary/10 flex-cc text-primary font-medium text-sm"
            >
              {{ getInitial(row.fullName) }}
            </div>
            <span>{{ row.fullName }}</span>
          </div>
        </template>
        <template #jobTitle="{ row }">
          <ElTag type="info" size="small">{{ row.jobTitle }}</ElTag>
        </template>
        <template #baseSalary="{ row }">
          <span class="font-medium text-gray-800 dark:text-gray-200">{{
            formatCurrency(row.baseSalary)
          }}</span>
        </template>
        <template #contractDate="{ row }">
          {{ formatDate(row.contractDate) }}
        </template>
        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ArtButtonTable
              type="view"
              @click="handleView(row)"
              v-auth="Permissions.Admin.EmployeeManagement.View"
            />
            <ArtButtonTable
              type="edit"
              @click="handleEdit(row)"
              v-auth="Permissions.Admin.EmployeeManagement.Edit"
            />
          </div>
        </template>
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { Permissions } from "@/common/constants/permissions";
import { Plus } from "@element-plus/icons-vue";
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { EmployeeApi, type EmployeeResponse } from "@/api/operations";

defineOptions({ name: "HREmployee" });

const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("Thêm nhân viên");

const stats = reactive({ total: 0, active: 0, inactive: 0 });

const pagination = reactive({ current: 1, size: 10, total: 0 });
const data = ref<EmployeeResponse[]>([]);

import { searchItems, columns } from "@/modules/Admin/logic/employee";

const searchForm = ref({ name: "", jobTitle: "", email: "" });
const columnChecks = ref([...columns]);

const getInitial = (name: string) => name?.charAt(0).toUpperCase() || "?";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value,
  );

const formatDate = (dateStr: string) => {
  if (!dateStr) return "---";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const loadStats = async () => {
  stats.total = data.value.length;
  stats.active = stats.total;
  stats.inactive = 0;
};

const loadData = async () => {
  loading.value = true;
  try {
    const res = await EmployeeApi.getList();
    data.value = res || [];
    pagination.total = data.value.length;
    loadStats();
  } catch (error) {
    console.error("Failed to load employees:", error);
    ElMessage.error("Không thể tải danh sách nhân viên");
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  pagination.current = 1;
  loadData();
};
const handleAdd = () => {
  dialogVisible.value = true;
  dialogTitle.value = "Thêm nhân viên";
};
const handleEdit = (_row: EmployeeResponse) => {
  dialogVisible.value = true;
  dialogTitle.value = "Cập nhật nhân viên";
};
const handleView = (row: EmployeeResponse) => {
  ElMessage.info(`Xem chi tiết: ${row.fullName}`);
};
const handleSizeChange = (size: number) => {
  pagination.size = size;
  pagination.current = 1;
  loadData();
};
const handleCurrentChange = (page: number) => {
  pagination.current = page;
  loadData();
};
const handleSearch = () => {
  pagination.current = 1;
  loadData();
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.hr-employee-container {
  padding: 16px;
}
</style>
