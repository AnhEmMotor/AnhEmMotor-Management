<template>
  <div
    class="returns-page flex flex-col gap-4 animate__animated animate__fadeIn"
  >
    <!-- Header with Search & Tabs -->
    <ElCard class="shrink-0" body-class="pb-0">
      <div class="flex justify-between items-center mb-4">
        <h1
          class="m-0 text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none flex items-center gap-2"
        >
          <ElIcon class="text-2xl text-primary"><List /></ElIcon>
          Quản lý hoàn hàng
        </h1>
        <ElInput
          v-model="searchQuery"
          placeholder="Tìm mã đơn, khách hàng..."
          clearable
          :prefix-icon="Search"
          class="w-80"
        />
      </div>

      <ElTabs
        v-model="statusFilter"
        @tab-change="fetchReturns"
        class="order-tabs"
      >
        <ElTabPane label="Tất cả" name="" />
        <ElTabPane label="Chờ xử lý" name="pending" />
        <ElTabPane label="Đang kiểm tra" name="inspecting" />
        <ElTabPane label="Đã hoàn tất" name="completed" />
      </ElTabs>
    </ElCard>

    <!-- Main List Data Table -->
    <div class="flex-1 h-[calc(100vh-220px)] mt-2">
      <ElTable
        :data="filteredReturns"
        style="width: 100%"
        v-loading="loadingList"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
        height="100%"
        class="custom-table cursor-pointer"
        stripe
        border
      >
        <ElTableColumn type="selection" width="50" align="center" />
        <ElTableColumn
          prop="originalTrackingNumber"
          label="Mã đơn gốc"
          min-width="150"
          align="center"
        >
          <template #default="{ row }">
            <span class="font-bold text-primary hover:underline">{{
              row.originalTrackingNumber
            }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="customerName" label="Khách hàng" min-width="180">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <ElIcon><User /></ElIcon> {{ row.customerName }}
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="carrier"
          label="Vận chuyển"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            <ElTag
              :type="getCarrierTag(row.carrier)"
              size="small"
              effect="plain"
              >{{ row.carrier }}</ElTag
            >
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="reason"
          label="Lý do hoàn"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <ElTag :type="getReasonTag(row.reason)" size="small">{{
              row.reason
            }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="status"
          label="Trạng thái"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            <ElTag :type="getStatusTag(row.status)" effect="dark">{{
              getStatusLabel(row.status)
            }}</ElTag>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { List, Search, User } from "@element-plus/icons-vue";
import { getReturns } from "@/api/logistics/returns";
import type { ReturnOrderDto } from "@/domain/logistics/returns.types";

defineOptions({ name: "ReverseLogistics" });

const router = useRouter();

// State for List
const returnsList = ref<ReturnOrderDto[]>([]);
const loadingList = ref(false);
const searchQuery = ref("");
const statusFilter = ref("");
const selectedRows = ref<ReturnOrderDto[]>([]);

// Filter logic
const filteredReturns = computed(() => {
  if (!searchQuery.value) return returnsList.value;
  const q = searchQuery.value.toLowerCase();
  return returnsList.value.filter(
    (item) =>
      item.originalTrackingNumber.toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q) ||
      (item.reason && item.reason.toLowerCase().includes(q)),
  );
});

onMounted(() => {
  fetchReturns();
});

// Fetch Data
const fetchReturns = async () => {
  loadingList.value = true;
  try {
    const res = await getReturns(statusFilter.value);
    returnsList.value = (res as unknown as ReturnOrderDto[]) || [];
  } catch (_error) {
    ElMessage.error("Lỗi khi tải danh sách hàng hoàn");
  } finally {
    loadingList.value = false;
  }
};

const handleRowClick = (row: ReturnOrderDto) => {
  router.push({ name: "ReturnDetail", params: { id: row.id } });
};

const getCarrierTag = (carrier: string) => {
  const c = carrier.toLowerCase();
  if (c.includes("ghtk")) return "success";
  if (c.includes("viettel") || c.includes("vtp")) return "warning";
  return "info";
};

const getReasonTag = (reason: string): "warning" | "danger" => {
  const r = reason.toLowerCase();
  if (r.includes("bom") || r.includes("không nhận")) return "warning";
  return "danger";
};

const getReasonAlertType = (reason: string) => {
  const r = reason.toLowerCase();
  if (r.includes("bom") || r.includes("không nhận")) return "warning";
  return "error";
};

const getStatusTag = (
  status: string | number,
): "danger" | "warning" | "success" | "info" => {
  const strStatus = String(status).toLowerCase();
  const map: Record<string, "danger" | "warning" | "success" | "info"> = {
    pending: "danger",
    "0": "danger",
    inspecting: "warning",
    "1": "warning",
    completed: "success",
    "2": "success",
  };
  return map[strStatus] || "info";
};

const getStatusLabel = (status: string | number) => {
  const strStatus = String(status).toLowerCase();
  const map: Record<string, string> = {
    pending: "Chờ kiểm tra",
    "0": "Chờ kiểm tra",
    inspecting: "Đang kiểm tra",
    "1": "Đang kiểm tra",
    completed: "Đã hoàn tất",
    "2": "Đã hoàn tất",
  };
  return map[strStatus] || String(status);
};

const getActionLabel = (action?: string) => {
  if (!action) return "Chưa xử lý";
  const map: Record<string, string> = {
    restock: "Nhập lại kho bán lẻ",
    defect: "Cách ly chờ hủy",
    refund: "Hoàn tiền cho khách",
  };
  return map[action] || action;
};

// Selection logic
const handleSelectionChange = (rows: ReturnOrderDto[]) => {
  selectedRows.value = rows;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};
</script>

<style scoped lang="scss">
.returns-page {
  height: calc(100vh - 100px);
}

:deep(.order-tabs .el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: var(--el-border-color-light);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--el-border-color-dark);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>
