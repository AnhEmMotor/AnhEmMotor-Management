<template>
  <div class="hr-payroll-container reporting-page">
    <el-card shadow="never" class="reporting-card">
      <template #header>
        <div class="card-header flex justify-between items-center">
          <span class="text-lg font-bold text-slate-800 dark:text-slate-100">{{
            $t("menus.hr.payroll")
          }}</span>
        </div>
      </template>

      <!-- KPI Summary Cards Grid -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 reporting-kpi-grid"
      >
        <ArtStatsCard
          title="Tổng quỹ lương"
          :count="stats.totalPayroll"
          icon="ri:money-dollar-circle-line"
          iconStyle="bg-primary"
        />
        <ArtStatsCard
          title="Tổng thưởng tháng"
          :count="stats.totalVolumeBonus"
          icon="ri:gift-line"
          iconStyle="bg-danger"
        />
        <ArtStatsCard
          title="Đã thanh toán"
          :count="stats.paid"
          icon="ri:checkbox-circle-line"
          iconStyle="bg-success"
        />
        <ArtStatsCard
          title="Chờ thanh toán"
          :count="stats.pending"
          icon="ri:time-line"
          iconStyle="bg-warning"
        />
        <ArtStatsCard
          title="Nhân viên"
          :count="stats.employeeCount"
          icon="ri:group-line"
          iconStyle="bg-info"
        />
      </div>

      <!-- Search & Filters -->
      <div
        class="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-100 dark:border-slate-800 mb-6"
      >
        <ArtSearchBar
          v-model="searchForm"
          :items="searchItems"
          :label-width="120"
          :span="8"
          @search="handleSearch"
          @reset="handleReset"
        />
      </div>

      <!-- Table Card -->
      <ElCard
        class="flex-1 art-table-card border border-slate-100 dark:border-slate-800"
      >
        <ArtTableHeader
          v-model:columns="columnChecks"
          :loading="loading"
          @refresh="loadData"
        >
          <template #left>
            <ElButton
              type="primary"
              v-ripple
              :disabled="data.length === 0"
              @click="handleApproveAll"
            >
              <ElIcon class="mr-1"><Check /></ElIcon> Duyệt chi tất cả
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
          <template #fullName="{ row }">
            <span class="font-medium text-slate-700 dark:text-slate-200">{{
              row.fullName || "-"
            }}</span>
          </template>

          <template #baseSalary="{ row }">
            <span class="text-slate-600 dark:text-slate-300">{{
              formatCurrency(row.baseSalary)
            }}</span>
          </template>

          <template #confirmedCommission="{ row }">
            <span class="text-slate-600 dark:text-slate-300 font-semibold">{{
              formatCurrency(row.confirmedCommission)
            }}</span>
          </template>

          <template #volumeBonus="{ row }">
            <div class="flex flex-col items-end">
              <span class="text-slate-600 dark:text-slate-300">{{
                formatCurrency(row.volumeBonus)
              }}</span>
              <ElTag
                v-if="row.volumeBonus > 0"
                type="danger"
                size="small"
                class="mt-1 bg-red-50 text-red-500 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50"
                >Đạt 10 xe</ElTag
              >
            </div>
          </template>

          <template #totalNetPayable="{ row }">
            <span class="font-semibold text-rose-600 dark:text-rose-400">{{
              formatCurrency(row.totalNetPayable)
            }}</span>
          </template>

          <template #operation="{ row }">
            <div class="flex gap-2 justify-center">
              <ElButton
                v-if="row.confirmedCommission > 0"
                v-ripple
                size="small"
                type="success"
                plain
                @click="handleApprove(row)"
              >
                Duyệt chi
              </ElButton>
              <span v-else class="text-xs text-slate-400 dark:text-slate-500"
                >Đã duyệt / Không có commission</span
              >
            </div>
          </template>
        </ArtTable>
      </ElCard>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Check } from "@element-plus/icons-vue";
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { ColumnOption } from "@/types/component";
import {
  payrollApi,
  type PayrollSummaryResponse,
} from "@/api/operations/payroll.api";

defineOptions({ name: "HRPayroll" });

const loading = ref(false);

const stats = reactive({
  totalPayroll: 0,
  paid: 0,
  pending: 0,
  employeeCount: 0,
  totalVolumeBonus: 0,
});

const pagination = reactive({ current: 1, size: 10, total: 0 });
const data = ref<PayrollSummaryResponse[]>([]);

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

const searchForm = ref({ month: currentMonth.toString(), employeeName: "" });
const searchItems = ref([
  {
    key: "month",
    label: "Tháng",
    type: "input",
    props: { placeholder: "VD: 7" },
  },
  { key: "employeeName", label: "Nhân viên", type: "input" },
]);

const columns = ref<ColumnOption[]>([
  { label: "Nhân viên", prop: "fullName", minWidth: 180, useSlot: true },
  { label: "Chức vụ", prop: "jobTitle", width: 140 },
  {
    label: "Lương cơ bản",
    prop: "baseSalary",
    width: 140,
    align: "right",
    useSlot: true,
  },
  {
    label: "Hoa hồng chờ chi",
    prop: "confirmedCommission",
    width: 160,
    align: "right",
    useSlot: true,
  },
  {
    label: "Thưởng đạt ngưỡng",
    prop: "volumeBonus",
    width: 160,
    align: "right",
    useSlot: true,
  },
  {
    label: "Thực nhận",
    prop: "totalNetPayable",
    width: 160,
    align: "right",
    useSlot: true,
  },
  {
    label: "Thao tác",
    prop: "operation",
    width: 180,
    fixed: "right" as const,
    align: "center",
    useSlot: true,
  },
]);
const columnChecks = columns;

const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);

type PayrollSummaryApiResult =
  | PayrollSummaryResponse[]
  | { data?: PayrollSummaryResponse[] };

const unwrapPayrollSummary = (response: PayrollSummaryApiResult) =>
  Array.isArray(response) ? response : response.data || [];

const loadData = async () => {
  loading.value = true;
  try {
    let month = currentMonth;
    let year = currentYear;

    if (searchForm.value.month) {
      const parsedMonth = parseInt(searchForm.value.month);
      if (!isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
        month = parsedMonth;
      }
    }

    const res = await payrollApi.getSummary(month, year);
    const summaryData = unwrapPayrollSummary(res as PayrollSummaryApiResult);

    // Filter client-side by employee name
    let filteredData = [...summaryData];
    if (searchForm.value.employeeName) {
      const searchName = searchForm.value.employeeName.toLowerCase();
      filteredData = filteredData.filter((item) =>
        item.fullName.toLowerCase().includes(searchName),
      );
    }

    data.value = filteredData;
    pagination.total = filteredData.length;

    // Calculate stats client-side from the summary data
    const totalVolumeBonus = summaryData.reduce(
      (sum, item) => sum + (item.volumeBonus || 0),
      0,
    );
    const totalPayrollVal = summaryData.reduce(
      (sum, item) => sum + (item.totalNetPayable || 0),
      0,
    );
    const pendingVal = summaryData.reduce(
      (sum, item) =>
        sum + (item.confirmedCommission || 0) + (item.volumeBonus || 0),
      0,
    );
    const paidVal = summaryData.reduce(
      (sum, item) => sum + (item.paidCommission || 0),
      0,
    );

    stats.totalPayroll = totalPayrollVal;
    stats.paid = paidVal;
    stats.pending = pendingVal;
    stats.employeeCount = summaryData.length;
    stats.totalVolumeBonus = totalVolumeBonus;
  } catch (error) {
    console.error("Failed to load payroll:", error);
    ElMessage.error("Không thể tải danh sách bảng lương");
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  searchForm.value.month = currentMonth.toString();
  searchForm.value.employeeName = "";
  pagination.current = 1;
  loadData();
};

const handleApprove = async (row: PayrollSummaryResponse) => {
  let month = currentMonth;
  let year = currentYear;
  if (searchForm.value.month) {
    const parsedMonth = parseInt(searchForm.value.month);
    if (!isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
      month = parsedMonth;
    }
  }

  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn duyệt chi hoa hồng tháng ${month}/${year} cho nhân viên ${row.fullName}?`,
      "Xác nhận duyệt chi",
      {
        confirmButtonText: "Đòng ý",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    );
    loading.value = true;
    await payrollApi.approveCommissions(row.employeeId, month, year);
    ElMessage.success("Duyệt chi hoa hồng nhân viên thành công");
    loadData();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Failed to approve payroll:", error);
      ElMessage.error("Không thể duyệt chi hoa hồng");
    }
  } finally {
    loading.value = false;
  }
};

const handleApproveAll = async () => {
  let month = currentMonth;
  let year = currentYear;
  if (searchForm.value.month) {
    const parsedMonth = parseInt(searchForm.value.month);
    if (!isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
      month = parsedMonth;
    }
  }

  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn duyệt chi hoa hồng tháng ${month}/${year} cho TẤT CẢ nhân viên?`,
      "Xác nhận duyệt chi tất cả",
      {
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    );
    loading.value = true;
    await payrollApi.approveCommissions(null, month, year);
    ElMessage.success("Duyệt chi hoa hồng tất cả nhân viên thành công");
    loadData();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Failed to approve all payrolls:", error);
      ElMessage.error("Không thể duyệt chi tất cả hoa hồng");
    }
  } finally {
    loading.value = false;
  }
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
.hr-payroll-container {
  padding: 16px;
}
</style>
