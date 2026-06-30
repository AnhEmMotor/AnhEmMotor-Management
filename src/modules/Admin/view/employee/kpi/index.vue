<template>
  <div class="hr-kpi-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ $t("menus.hr.kpi") }}</span>
        </div>
      </template>

      <ArtSearchBar
        v-model="searchForm"
        :items="searchItems"
        :label-width="120"
        :span="8"
        @search="handleSearch"
        @reset="handleReset"
      />

      <ElCard class="flex-1 art-table-card mt-4">
        <ArtTableHeader
          v-model:columns="columnChecks"
          :loading="loading"
          @refresh="loadData"
        >
          <template #left>
            <ElButton type="primary" v-ripple @click="handleAdd">
              <ElIcon><Plus /></ElIcon> Thêm KPI
            </ElButton>
          </template>
        </ArtTableHeader>

        <ArtTable
          ref="tableRef"
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #employeeName="{ row }">
            <span>{{ row.employeeName || "-" }}</span>
          </template>
          <template #score="{ row }">
            <ElTag :type="getScoreType(row.score)" size="small"
              >{{ row.score }}/100</ElTag
            >
          </template>
          <template #operation="{ row }">
            <div class="flex gap-2 justify-center">
              <ArtButtonTable type="view" @click="handleView(row)" />
              <ElButton
                v-ripple
                size="small"
                type="primary"
                @click="handleEdit(row)"
                >Sửa</ElButton
              >
            </div>
          </template>
        </ArtTable>
      </ElCard>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Plus } from "@element-plus/icons-vue";
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import type { ColumnOption } from "@/types/component";
import { kpiApi } from "@/api/operations/kpi.api";

defineOptions({ name: "HRKPI" });

const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("Thêm KPI");

const pagination = reactive({ current: 1, size: 10, total: 0 });
const data = ref<any[]>([]);

const searchForm = ref({ employeeName: "", period: "", kpiName: "" });
const searchItems = ref([
  { key: "employeeName", label: "Nhân viên", type: "input" },
  { key: "period", label: "Kỳ đánh giá", type: "input" },
  { key: "kpiName", label: "Tên KPI", type: "input" },
]);

const columns = ref<ColumnOption[]>([
  { label: "Nhân viên", prop: "employeeName", minWidth: 180, useSlot: true },
  { label: "Kỳ đánh giá", prop: "period", width: 130, align: "center" },
  { label: "Tên KPI", prop: "kpiName", minWidth: 200 },
  { label: "Mục tiêu", prop: "target", minWidth: 200 },
  { label: "Điểm", prop: "score", width: 100, align: "center", useSlot: true },
  { label: "Ngày đánh giá", prop: "evaluatedAt", width: 130, align: "center" },
  {
    label: "Thao tác",
    prop: "operation",
    width: 160,
    fixed: "right" as const,
    align: "center",
    useSlot: true,
  },
]);
const columnChecks = columns;

const getScoreType = (score: number) => {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "danger";
};

const loadData = async () => {
  loading.value = true;
  try {
    const res = await kpiApi.getAll();
    data.value = res.data;
    pagination.total = res.data.length;
  } catch (error) {
    console.error("Failed to load KPIs:", error);
    ElMessage.error("Không thể tải danh sách KPI");
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
  dialogTitle.value = "Thêm KPI";
};
const handleEdit = (_row: any) => {
  dialogVisible.value = true;
  dialogTitle.value = "Cập nhật KPI";
};
const handleView = (row: any) => {
  ElMessage.info(`Xem chi tiết: ${row.kpiName}`);
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
.hr-kpi-container {
  padding: 16px;
}
</style>
