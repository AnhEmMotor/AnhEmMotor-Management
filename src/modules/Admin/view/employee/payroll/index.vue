<template>
  <main class="resp-page hr-payroll-container reporting-page">
    <section class="payroll-hero" aria-labelledby="payroll-page-title">
      <div>
        <span class="payroll-hero__eyebrow">Quản trị nhân sự</span>
        <h1 id="payroll-page-title">{{ $t("menus.hr.payroll") }}</h1>
        <p>
          Tổng hợp lương cơ bản, hoa hồng và thưởng KPI theo từng kỳ chi trả.
        </p>
      </div>
      <div class="payroll-hero__actions">
        <span class="payroll-period-badge">
          <ArtSvgIcon icon="ri:calendar-check-line" />
          Kỳ {{ searchForm.month || currentMonth }}/{{ currentYear }}
        </span>
        <ElButton :loading="loading" @click="loadData">
          <ArtSvgIcon icon="ri:refresh-line" />
          Tải lại
        </ElButton>
        <ElButton
          type="primary"
          :disabled="loading"
          @click="exportPayrollExcel"
        >
          <ArtSvgIcon icon="ri:file-excel-2-line" />
          Xuất Excel
        </ElButton>
      </div>
    </section>

    <el-card shadow="never" class="reporting-card payroll-content-card">
      <!-- KPI Summary Cards Grid -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3 mb-4 reporting-kpi-grid payroll-kpi-grid"
      >
        <ArtStatsCard
          title="Tổng quỹ lương"
          :count="formatCurrency(stats.totalPayroll)"
          icon="ri:money-dollar-circle-line"
          iconStyle="bg-primary"
        />
        <ArtStatsCard
          title="Tổng thưởng KPI"
          :count="formatCurrency(stats.totalKpiBonus)"
          icon="ri:gift-line"
          iconStyle="bg-danger"
        />
        <ArtStatsCard
          title="Đã thanh toán"
          :count="formatCurrency(stats.paid)"
          icon="ri:checkbox-circle-line"
          iconStyle="bg-success"
        />
        <ArtStatsCard
          title="Chờ thanh toán"
          :count="formatCurrency(stats.pending)"
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
      <div class="payroll-filter-panel mb-4">
        <div class="payroll-section-heading">
          <div>
            <span class="payroll-section-heading__icon">
              <ArtSvgIcon icon="ri:filter-3-line" />
            </span>
            <div>
              <h2>Kỳ lương và nhân sự</h2>
              <p>Chọn tháng hoặc tìm nhanh theo tên nhân viên.</p>
            </div>
          </div>
          <span>{{ pagination.total }} kết quả</span>
        </div>
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
      <ElCard class="flex-1 art-table-card payroll-table-card">
        <div class="payroll-section-heading payroll-section-heading--table">
          <div>
            <span class="payroll-section-heading__icon">
              <ArtSvgIcon icon="ri:file-list-3-line" />
            </span>
            <div>
              <h2>Chi tiết bảng lương</h2>
              <p>
                Lương cơ bản + hoa hồng đủ điều kiện + thưởng KPI của từng nhân
                viên.
              </p>
            </div>
          </div>
          <ElTag type="info" effect="plain" round>
            {{ searchForm.month || currentMonth }}/{{ currentYear }}
          </ElTag>
        </div>
        <ArtTableHeader
          v-model:columns="columnChecks"
          :loading="loading"
          @refresh="loadData"
        >
          <template #left>
            <ElButton
              type="primary"
              v-ripple
              :disabled="!data.some((item) => item.confirmedCommission > 0)"
              class="payroll-approve-all"
              @click="handleApproveAll"
            >
              <ElIcon><Check /></ElIcon> Duyệt chi tất cả
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
            <div class="payroll-employee-cell">
              <span class="payroll-employee-cell__avatar">
                {{ (row.fullName || "?").charAt(0).toUpperCase() }}
              </span>
              <span>{{ row.fullName || "-" }}</span>
            </div>
          </template>

          <template #baseSalary="{ row }">
            <span class="payroll-money">{{
              formatCurrency(row.baseSalary)
            }}</span>
          </template>

          <template #confirmedCommission="{ row }">
            <span class="payroll-money payroll-money--commission">{{
              formatCurrency(row.confirmedCommission)
            }}</span>
          </template>

          <template #kpiBonus="{ row }">
            <div class="payroll-bonus-cell">
              <span class="payroll-money">{{
                formatCurrency(getKpiBonus(row))
              }}</span>
              <ElTag
                v-if="getKpiBonus(row) > 0"
                type="danger"
                size="small"
                effect="light"
                >Đạt KPI</ElTag
              >
            </div>
          </template>

          <template #totalNetPayable="{ row }">
            <strong class="payroll-money payroll-money--total">{{
              formatCurrency(row.totalNetPayable)
            }}</strong>
          </template>

          <template #operation="{ row }">
            <div class="payroll-action-cell">
              <ElButton
                v-if="row.confirmedCommission > 0"
                v-ripple
                size="small"
                type="primary"
                plain
                @click="handleApprove(row)"
              >
                Duyệt chi
              </ElButton>
              <span v-else class="payroll-action-cell__settled">
                <ArtSvgIcon icon="ri:checkbox-circle-line" />
                Đã xử lý
              </span>
            </div>
          </template>
        </ArtTable>
      </ElCard>
    </el-card>
  </main>
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
import { exportReportWorkbook } from "@/utils/report-excel";

defineOptions({ name: "HRPayroll" });

const loading = ref(false);

const stats = reactive({
  totalPayroll: 0,
  paid: 0,
  pending: 0,
  employeeCount: 0,
  totalKpiBonus: 0,
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
    label: "Thưởng KPI",
    prop: "kpiBonus",
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

const getKpiBonus = (item: PayrollSummaryResponse) =>
  item.kpiBonus ?? item.volumeBonus ?? 0;

const exportPayrollExcel = () => {
  const selectedMonth = searchForm.value.month || currentMonth.toString();

  exportReportWorkbook({
    fileName: `Bang_luong_nhan_su_${selectedMonth}_${currentYear}`,
    sheets: [
      {
        name: "Tổng hợp",
        rows: [
          {
            Tháng: selectedMonth,
            Năm: currentYear,
            "Số nhân viên": stats.employeeCount,
            "Tổng quỹ lương": stats.totalPayroll,
            "Tổng thưởng KPI": stats.totalKpiBonus,
            "Hoa hồng đã chi": stats.paid,
            "Giá trị chờ chi": stats.pending,
          },
        ],
      },
      {
        name: "Bảng lương",
        rows: data.value.map((item) => ({
          "Mã nhân viên": item.employeeId,
          "Nhân viên": item.fullName,
          "Chức vụ": item.jobTitle,
          "Lương cơ bản": item.baseSalary,
          "Hoa hồng chờ xác nhận": item.pendingCommission,
          "Hoa hồng chờ chi": item.confirmedCommission,
          "Hoa hồng đã chi": item.paidCommission,
          "Thưởng KPI": getKpiBonus(item),
          "Thực nhận": item.totalNetPayable,
        })),
      },
    ],
  });
};

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
    const totalKpiBonus = summaryData.reduce(
      (sum, item) => sum + getKpiBonus(item),
      0,
    );
    const totalPayrollVal = summaryData.reduce(
      (sum, item) => sum + (item.totalNetPayable || 0),
      0,
    );
    const pendingVal = summaryData.reduce(
      (sum, item) =>
        sum +
        (item.baseSalary || 0) +
        (item.confirmedCommission || 0) +
        getKpiBonus(item),
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
    stats.totalKpiBonus = totalKpiBonus;
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
  --payroll-red: #e84a4a;
  --payroll-red-dark: #c53a3a;
  --payroll-red-soft: color-mix(in srgb, var(--payroll-red) 10%, transparent);

  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 1600px;
  padding: 16px;
  margin: 0 auto;
}

.payroll-hero {
  position: relative;
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px 22px;
  overflow: hidden;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 16px;
  box-shadow: 0 12px 28px rgb(30 41 59 / 6%);
}

.payroll-hero::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 3px;
  content: "";
  background: linear-gradient(
    90deg,
    var(--payroll-red),
    var(--payroll-red-dark)
  );
}

.payroll-hero::after {
  position: absolute;
  top: -80px;
  right: -55px;
  width: 230px;
  height: 230px;
  pointer-events: none;
  content: "";
  background: radial-gradient(circle, var(--payroll-red-soft), transparent 68%);
}

.payroll-hero > div {
  position: relative;
  z-index: 1;
}

.payroll-hero__eyebrow {
  display: block;
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 700;
  color: var(--payroll-red);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.payroll-hero h1 {
  margin: 0;
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 750;
  line-height: 1.15;
  letter-spacing: -0.035em;
}

.payroll-hero p,
.payroll-section-heading p {
  margin: 5px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}

.payroll-hero__actions,
.payroll-period-badge {
  display: flex;
  gap: 7px;
  align-items: center;
}

.payroll-hero__actions {
  flex-shrink: 0;
}

.payroll-period-badge {
  min-height: 34px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 650;
  color: var(--payroll-red-dark);
  background: var(--payroll-red-soft);
  border: 1px solid color-mix(in srgb, var(--payroll-red) 24%, transparent);
  border-radius: 9px;
}

.payroll-content-card {
  border-radius: 16px;
}

.payroll-content-card :deep(> .el-card__body) {
  padding: 16px;
}

.payroll-kpi-grid :deep(.art-card) {
  min-height: 108px;
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 13px;
  box-shadow: none;
}

.payroll-kpi-grid :deep(> :first-child) {
  color: var(--el-text-color-primary);
  background: var(--el-bg-color-overlay);
  border-color: var(--el-border-color-lighter);
}

.payroll-kpi-grid :deep(> :first-child p) {
  color: var(--el-text-color-secondary) !important;
}

.payroll-kpi-grid :deep(> :first-child .art-count-to) {
  color: var(--el-text-color-primary) !important;
}

.payroll-kpi-grid :deep(.art-count-to),
.payroll-kpi-grid :deep(.art-card p:nth-child(2)) {
  font-variant-numeric: tabular-nums;
}

.payroll-filter-panel {
  padding: 14px 14px 0;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 12px;
}

.payroll-section-heading,
.payroll-section-heading > div {
  display: flex;
  align-items: center;
}

.payroll-section-heading {
  gap: 14px;
  justify-content: space-between;
  margin-bottom: 12px;
}

.payroll-section-heading > div {
  min-width: 0;
  gap: 10px;
}

.payroll-section-heading__icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  font-size: 16px;
  color: var(--payroll-red);
  background: var(--payroll-red-soft);
  border-radius: 9px;
}

.payroll-section-heading h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  letter-spacing: -0.015em;
}

.payroll-section-heading p {
  margin-top: 2px;
  font-size: 12px;
}

.payroll-section-heading > span {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 650;
  color: var(--el-text-color-secondary);
}

.payroll-table-card {
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}

.payroll-table-card :deep(> .el-card__body) {
  padding: 0;
}

.payroll-section-heading--table {
  padding: 14px 14px 12px;
  margin: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.payroll-table-card :deep(.art-table-header) {
  padding: 10px 12px;
  background: var(--el-fill-color-extra-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.payroll-approve-all {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.payroll-approve-all:not(:disabled):hover {
  box-shadow: 0 8px 18px rgb(232 74 74 / 22%);
  transform: translateY(-1px);
}

.payroll-employee-cell,
.payroll-action-cell,
.payroll-action-cell__settled {
  display: flex;
  align-items: center;
}

.payroll-employee-cell {
  gap: 9px;
  min-width: 0;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.payroll-employee-cell__avatar {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  font-size: 12px;
  font-weight: 750;
  color: var(--payroll-red-dark);
  background: var(--payroll-red-soft);
  border-radius: 9px;
}

.payroll-money {
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.payroll-money--commission {
  font-weight: 650;
}

.payroll-money--total {
  color: var(--payroll-red-dark);
}

.payroll-bonus-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-end;
}

.payroll-action-cell {
  justify-content: center;
}

.payroll-action-cell__settled {
  gap: 5px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

:global(html.dark) .payroll-hero,
:global(html.dark) .payroll-content-card,
:global(html.dark) .payroll-table-card {
  box-shadow: none;
}

:global(html.dark) .payroll-money--total {
  color: #ff8b8b;
}

@media (width >= 1280px) {
  .payroll-kpi-grid :deep(> :first-child) {
    grid-column: span 2 / span 2;
  }
}

@media (width <= 767px) {
  .hr-payroll-container {
    gap: 10px;
    padding: 10px;
  }

  .payroll-hero,
  .payroll-hero__actions,
  .payroll-section-heading {
    align-items: flex-start;
  }

  .payroll-hero,
  .payroll-hero__actions {
    flex-direction: column;
  }

  .payroll-hero {
    padding: 16px 15px 18px;
  }

  .payroll-hero__actions,
  .payroll-period-badge,
  .payroll-hero__actions :deep(.el-button) {
    width: 100%;
  }

  .payroll-period-badge,
  .payroll-hero__actions :deep(.el-button) {
    justify-content: center;
  }

  .payroll-content-card :deep(> .el-card__body) {
    padding: 10px;
  }

  .payroll-section-heading {
    gap: 8px;
  }

  .payroll-section-heading > span {
    padding-left: 44px;
  }

  .payroll-section-heading--table > span {
    padding-left: 0;
  }

  .payroll-table-card {
    overflow-x: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .payroll-approve-all {
    transition: none;
  }
}
</style>
