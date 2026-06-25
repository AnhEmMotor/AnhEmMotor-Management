<template>
  <div class="hr-policy-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ $t("menus.hr.commissionPolicy") }}</span>
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
              <ElIcon><Plus /></ElIcon> Thêm chính sách
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
          <template #name="{ row }">
            <span>{{ row.name || "-" }}</span>
          </template>
          <template #commissionRate="{ row }">
            <ElTag type="success" size="small">{{ row.commissionRate }}%</ElTag>
          </template>
          <template #status="{ row }">
            <ElTag :type="row.active ? 'success' : 'info'" size="small">{{
              row.active ? "Đang áp dụng" : "Đã ngừng"
            }}</ElTag>
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

defineOptions({ name: "HRCommissionPolicy" });

const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("Thêm chính sách");

const pagination = reactive({ current: 1, size: 10, total: 0 });
const data = ref<any[]>([]);

const searchForm = ref({ name: "", active: "" });
const searchItems = ref([
  { key: "name", label: "Tên chính sách", type: "input" },
  {
    key: "active",
    label: "Trạng thái",
    type: "select",
    props: {
      options: [
        { label: "Đang áp dụng", value: "true" },
        { label: "Đã ngừng", value: "false" },
      ],
    },
  },
]);

const columns = ref<ColumnOption[]>([
  { label: "Tên chính sách", prop: "name", minWidth: 200, useSlot: true },
  { label: "Mô tả", prop: "description", minWidth: 250 },
  {
    label: "Tỷ lệ hoa hồng",
    prop: "commissionRate",
    width: 140,
    align: "center",
    useSlot: true,
  },
  { label: "Áp dụng từ", prop: "applyFrom", width: 130, align: "center" },
  {
    label: "Trạng thái",
    prop: "status",
    width: 130,
    align: "center",
    useSlot: true,
  },
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

const loadData = async () => {
  loading.value = true;
  try {
    data.value = [];
    pagination.total = 0;
  } catch (error) {
    console.error("Failed to load policies:", error);
    ElMessage.error("Không thể tải danh sách chính sách");
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
  dialogTitle.value = "Thêm chính sách";
};
const handleEdit = (_row: any) => {
  dialogVisible.value = true;
  dialogTitle.value = "Cập nhật chính sách";
};
const handleView = (row: any) => {
  ElMessage.info(`Xem chi tiết: ${row.name}`);
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
.hr-policy-container {
  padding: 16px;
}
</style>
