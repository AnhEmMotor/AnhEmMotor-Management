<template>
  <div class="resp-page reporting-page">
    <ReportPageHeader
      title="Báo cáo hợp đồng"
      description="Quản lý và theo dõi hợp đồng mua bán xe và hợp đồng với nhà cung cấp."
      icon="ri:file-list-line"
    >
      <template #actions>
        <div class="reporting-actions">
          <ReportPeriodSwitcher
            v-model="currentPeriod"
            :start-date="periodStart"
            :end-date="periodEnd"
            @update:modelValue="onPeriodChange"
            @update:start-date="onStartDateChange"
            @update:end-date="onEndDateChange"
          />
          <ElButton
            type="primary"
            :disabled="isLoading"
            @click="exportContractExcel"
          >
            <ArtSvgIcon icon="ri:file-excel-2-line" />
            Xuất Excel
          </ElButton>
        </div>
      </template>
    </ReportPageHeader>

    <!-- KPI TẦNG 1 -->
    <div class="reporting-kpi-grid">
      <ArtStatsCard
        title="Tổng số HĐ Bán xe"
        :count="formatNumber(summaryData.totalSalesCount)"
        description="Trong kỳ"
        icon="ri:file-paper-2-line"
        icon-style="bg-report-blue"
      />
      <ArtStatsCard
        title="Giá trị HĐ Bán xe"
        :count="formatShortCurrency(summaryData.totalSalesValue)"
        description="Doanh thu dự kiến"
        icon="ri:money-dollar-circle-line"
        icon-style="bg-report-green"
      />
      <ArtStatsCard
        title="Tổng số HĐ Nhà Cung Cấp"
        :count="formatNumber(summaryData.totalSupplierCount)"
        description="Trong kỳ"
        icon="ri:truck-line"
        icon-style="bg-report-orange"
      />
      <ArtStatsCard
        title="Giá trị HĐ Nhà Cung Cấp"
        :count="formatShortCurrency(summaryData.totalSupplierValue)"
        description="Chi phí/Nhập hàng"
        icon="ri:wallet-3-line"
        icon-style="bg-report-red"
      />
    </div>

    <ElAlert
      v-if="errorMessage"
      :title="errorMessage"
      type="error"
      :closable="false"
      show-icon
      class="mt-4"
    />

    <!-- TẦNG 2: BIỂU ĐỒ TRẠNG THÁI TỔNG THỂ FULL-WIDTH -->
    <ElCard v-loading="isLoading" class="reporting-card mt-4">
      <template #header>Trạng thái hợp đồng</template>
      <div ref="trendChartRef" class="reporting-chart"></div>
    </ElCard>

    <!-- TẦNG 3: TRẠNG THÁI THEO TỪNG LOẠI HỢP ĐỒNG -->
    <div class="reporting-section-grid two-columns mt-4">
      <ElCard class="reporting-card">
        <template #header>Hợp đồng mua bán</template>
        <div ref="statusChartRef" class="reporting-chart"></div>
      </ElCard>
      <ElCard class="reporting-card">
        <template #header>Hợp đồng nhà cung cấp</template>
        <div ref="topSuppliersChartRef" class="reporting-chart"></div>
      </ElCard>
    </div>

    <!-- TẦNG 4: BẢNG DỮ LIỆU CHI TIẾT -->
    <ElCard class="reporting-card mt-4">
      <template #header>
        <div class="contract-list-header">
          <div class="contract-list-title-group">
            <span>Danh sách chi tiết hợp đồng</span>
            <div class="contract-list-count">
              Hiển thị {{ filteredContracts.length }}/{{ contractsData.length }}
              hợp đồng
            </div>
          </div>
          <div class="contract-filter-bar">
            <ElSelect
              v-model="typeFilter"
              placeholder="Loại hợp đồng"
              clearable
            >
              <ElOption label="Bán xe" value="Bán xe" />
              <ElOption label="Nhà cung cấp" value="Nhà cung cấp" />
            </ElSelect>
            <ElSelect v-model="statusFilter" placeholder="Trạng thái" clearable>
              <ElOption
                v-for="status in availableStatuses"
                :key="status"
                :label="status"
                :value="status"
              />
            </ElSelect>
            <ElInput
              v-model="searchQuery"
              placeholder="Tìm mã HĐ, tên đối tác..."
              clearable
            >
              <template #prefix>
                <div class="i-ri-search-line"></div>
              </template>
            </ElInput>
            <ElButton v-if="hasActiveFilters" @click="resetContractFilters">
              Xóa lọc
            </ElButton>
          </div>
        </div>
      </template>

      <ElTable
        :data="paginatedContracts"
        class="reporting-table"
        empty-text="Không có dữ liệu hợp đồng"
      >
        <ElTableColumn
          prop="contractNumber"
          label="Số hợp đồng"
          min-width="150"
        />
        <ElTableColumn prop="date" label="Ngày lập" min-width="130" />
        <ElTableColumn prop="type" label="Phân loại" min-width="130">
          <template #default="{ row }">
            <ElTag :type="row.type === 'Bán xe' ? 'success' : 'warning'" round>
              {{ row.type }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="partnerName"
          label="Đối tác (KH/NCC)"
          min-width="200"
        />
        <ElTableColumn
          prop="value"
          label="Giá trị HĐ"
          min-width="150"
          align="right"
        >
          <template #default="{ row }">
            <span
              class="font-semibold"
              :class="
                row.type === 'Bán xe' ? 'text-emerald-600' : 'text-rose-600'
              "
            >
              {{ formatCurrency(row.value) }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="Trạng thái" min-width="150">
          <template #default="{ row }">
            <ElTag type="info" round effect="plain">{{ row.status }}</ElTag>
          </template>
        </ElTableColumn>
      </ElTable>
      <div class="flex justify-end mt-4">
        <ElPagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredContracts.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import * as echarts from "echarts";
import ArtStatsCard from "@/components/core/cards/art-stats-card/index.vue";
import ReportPageHeader from "./ReportPageHeader.vue";
import ReportPeriodSwitcher from "./ReportPeriodSwitcher.vue";
import { statisticsApi, type ContractOverviewResponse } from "@/api/operations";
import { useSettingStore } from "@/application/store/setting";
import { storeToRefs } from "pinia";
import { exportReportWorkbook } from "@/utils/report-excel";

const settingStore = useSettingStore();
const { isDark } = storeToRefs(settingStore);

const currentPeriod = ref<"today" | "month" | "year" | "custom">("month");
const periodStart = ref(
  new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
);
const periodEnd = ref(new Date().toISOString());

const searchQuery = ref("");
const typeFilter = ref("");
const statusFilter = ref("");

// Refs for ECharts DOM elements
const trendChartRef = ref<HTMLElement | null>(null);
const statusChartRef = ref<HTMLElement | null>(null);
const topSuppliersChartRef = ref<HTMLElement | null>(null);

let trendChart: echarts.ECharts | null = null;
let statusChart: echarts.ECharts | null = null;
let topSuppliersChart: echarts.ECharts | null = null;

// Theming constants
const chartTextColor = computed(() => (isDark.value ? "#9ca3af" : "#4b5563"));
const chartAxisLineColor = computed(() =>
  isDark.value ? "rgba(255, 255, 255, 0.16)" : "rgba(0, 0, 0, 0.1)",
);
const chartGridLineColor = computed(() =>
  isDark.value ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
);

watch(isDark, () => {
  renderCharts();
});

const summaryData = ref({
  totalSalesCount: 0,
  totalSalesValue: 0,
  totalSupplierCount: 0,
  totalSupplierValue: 0,
});

const trendData = ref<ContractOverviewResponse["trendData"]>([]);
const statusData = ref<ContractOverviewResponse["statusData"]>([]);
const topSuppliersData = ref<ContractOverviewResponse["topSuppliersData"]>([]);
const contractsData = ref<ContractOverviewResponse["contractsData"]>([]);
const isLoading = ref(false);
const errorMessage = ref("");

const normalizeFilterValue = (value?: string) =>
  (value ?? "").trim().toLocaleLowerCase("vi-VN");

type ContractStatusChartItem = {
  name: string;
  value: number;
};

function summarizeContractStatuses(type: string): ContractStatusChartItem[] {
  const normalizedType = normalizeFilterValue(type);
  const statusCounts = new Map<string, number>();

  contractsData.value
    .filter((item) => normalizeFilterValue(item.type) === normalizedType)
    .forEach((item) => {
      statusCounts.set(item.status, (statusCounts.get(item.status) ?? 0) + 1);
    });

  return Array.from(statusCounts, ([name, value]) => ({ name, value }));
}

const salesContractStatusData = computed(() =>
  summarizeContractStatuses("Bán xe"),
);

const supplierContractStatusData = computed(() =>
  summarizeContractStatuses("Nhà cung cấp"),
);

const availableStatuses = computed(() =>
  Array.from(
    new Set(contractsData.value.map((item) => item.status).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right, "vi-VN")),
);

const hasActiveFilters = computed(
  () =>
    Boolean(typeFilter.value) ||
    Boolean(statusFilter.value) ||
    Boolean(searchQuery.value.trim()),
);

const filteredContracts = computed(() => {
  let result = contractsData.value;

  if (typeFilter.value) {
    const selectedType = normalizeFilterValue(typeFilter.value);
    result = result.filter(
      (item) => normalizeFilterValue(item.type) === selectedType,
    );
  }

  if (statusFilter.value) {
    const selectedStatus = normalizeFilterValue(statusFilter.value);
    result = result.filter(
      (item) => normalizeFilterValue(item.status) === selectedStatus,
    );
  }

  const q = searchQuery.value.trim().toLocaleLowerCase("vi-VN");
  if (q) {
    result = result.filter(
      (item) =>
        normalizeFilterValue(item.contractNumber).includes(q) ||
        normalizeFilterValue(item.partnerName).includes(q),
    );
  }

  return result;
});

const currentPage = ref(1);
const pageSize = ref(10);

const paginatedContracts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredContracts.value.slice(start, start + pageSize.value);
});

watch([typeFilter, statusFilter, searchQuery], () => {
  currentPage.value = 1;
});

function resetContractFilters() {
  typeFilter.value = "";
  statusFilter.value = "";
  searchQuery.value = "";
  currentPage.value = 1;
}

function exportContractExcel() {
  exportReportWorkbook({
    fileName: `Bao_cao_hop_dong_${toDateInput(new Date(periodStart.value))}_${toDateInput(new Date(periodEnd.value))}`,
    sheets: [
      {
        name: "Tổng quan",
        rows: [
          {
            "Hợp đồng bán xe": summaryData.value.totalSalesCount,
            "Giá trị hợp đồng bán xe": summaryData.value.totalSalesValue,
            "Hợp đồng nhà cung cấp": summaryData.value.totalSupplierCount,
            "Giá trị hợp đồng NCC": summaryData.value.totalSupplierValue,
          },
        ],
      },
      {
        name: "Danh sách hợp đồng",
        rows: filteredContracts.value.map((item) => ({
          "Mã hợp đồng": item.contractNumber,
          Loại: item.type,
          "Đối tác": item.partnerName,
          "Giá trị": item.value,
          "Trạng thái": item.status,
          Ngày: item.date,
        })),
      },
      {
        name: "Xu hướng",
        rows: trendData.value.map((item) => ({
          Ngày: item.day,
          "Giá trị hợp đồng bán xe": item.salesValue,
          "Giá trị hợp đồng NCC": item.supplierValue,
        })),
      },
      {
        name: "Trạng thái",
        rows: statusData.value.map((item) => ({
          "Trạng thái": item.name,
          "Số lượng": item.value,
        })),
      },
    ],
  });
}

async function loadContractOverview() {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await statisticsApi.getContractOverview(
      periodStart.value,
      periodEnd.value,
    );
    summaryData.value = res.kpi;
    trendData.value = res.trendData || [];
    statusData.value = (res.statusData || []).map((item) => ({
      ...item,
      name: translateContractStatus(item.name),
    }));
    topSuppliersData.value = res.topSuppliersData || [];
    contractsData.value = (res.contractsData || []).map((item) => ({
      ...item,
      status: translateContractStatus(item.status),
    }));
    currentPage.value = 1;
    renderCharts();
  } catch (error) {
    console.error("Failed to load contract overview", error);
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Không thể tải báo cáo hợp đồng trong khoảng thời gian đã chọn";
  } finally {
    isLoading.value = false;
  }
}

function onPeriodChange(period: "today" | "month" | "year" | "custom") {
  if (period !== "custom") {
    setPeriodRange(period);
  }

  if (periodStart.value && periodEnd.value) {
    void loadContractOverview();
  }
}

function onStartDateChange(value: string) {
  const shouldReload = currentPeriod.value === "custom";
  periodStart.value = value;
  currentPeriod.value = "custom";
  if (shouldReload && value && periodEnd.value) {
    void loadContractOverview();
  }
}

function onEndDateChange(value: string) {
  const shouldReload = currentPeriod.value === "custom";
  periodEnd.value = value;
  currentPeriod.value = "custom";
  if (shouldReload && periodStart.value && value) {
    void loadContractOverview();
  }
}

function setPeriodRange(period: "today" | "month" | "year") {
  const today = new Date();
  const start =
    period === "today"
      ? today
      : period === "month"
        ? new Date(today.getFullYear(), today.getMonth(), 1)
        : new Date(today.getFullYear(), 0, 1);

  periodStart.value = toDateInput(start);
  periodEnd.value = toDateInput(today);
}

function toDateInput(date: Date) {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 10);
}

function translateContractStatus(status: string) {
  const labels: Record<string, string> = {
    Draft: "Nháp",
    PendingApproval: "Chờ phê duyệt",
    Approved: "Đã phê duyệt",
    Signed: "Đã ký",
    Active: "Đang hiệu lực",
    Fulfilled: "Đã hoàn tất",
    Completed: "Đã hoàn thành",
    Expired: "Đã hết hạn",
    Terminated: "Đã thanh lý",
    Cancelled: "Đã hủy",
  };

  return labels[status] ?? status;
}

function renderCharts() {
  // 1. Horizontal Bar Chart: Trạng thái hợp đồng tổng thể
  if (trendChartRef.value) {
    if (!trendChart) trendChart = echarts.init(trendChartRef.value);
    trendChart.setOption(
      {
        backgroundColor: "transparent",
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        grid: {
          left: "3%",
          right: "6%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "value",
          minInterval: 1,
          axisLabel: { color: chartTextColor.value },
          splitLine: { lineStyle: { color: chartGridLineColor.value } },
        },
        yAxis: {
          type: "category",
          data: statusData.value.map((item) => item.name),
          axisLabel: { color: chartTextColor.value },
          axisLine: { lineStyle: { color: chartAxisLineColor.value } },
        },
        series: [
          {
            name: "Số hợp đồng",
            type: "bar",
            data: statusData.value.map((item) => item.value),
            barMaxWidth: 34,
            itemStyle: {
              color: "#e84a4a",
              borderRadius: [0, 6, 6, 0],
            },
            label: {
              show: true,
              position: "right",
              color: chartTextColor.value,
              formatter: "{c}",
              fontWeight: "bold",
            },
          },
        ],
      },
      true,
    );
  }

  // 2. Pie Chart: Hợp đồng nhà cung cấp
  if (topSuppliersChartRef.value) {
    if (!topSuppliersChart)
      topSuppliersChart = echarts.init(topSuppliersChartRef.value);
    topSuppliersChart.setOption(
      {
        backgroundColor: "transparent",
        tooltip: { trigger: "item" },
        legend: {
          orient: "vertical",
          left: "left",
          textStyle: { color: chartTextColor.value },
        },
        series: [
          {
            type: "pie",
            radius: ["40%", "70%"],
            center: ["60%", "50%"],
            data: supplierContractStatusData.value.map((item) => ({
              name: item.name,
              value: item.value,
            })),
            itemStyle: {
              borderRadius: 5,
              borderColor: isDark.value ? "rgba(30, 41, 59, 1)" : "#fff",
              borderWidth: 2,
            },
            label: {
              show: true,
              color: chartTextColor.value,
              formatter: "{b}: {c}",
              fontSize: 13,
              fontWeight: "bold",
            },
          },
        ],
        color: ["#f59e0b", "#e84a4a", "#3b82f6", "#22c55e", "#8b5cf6"],
      },
      true,
    );
  }

  // 3. Pie Chart: Hợp đồng mua bán
  if (statusChartRef.value) {
    if (!statusChart) statusChart = echarts.init(statusChartRef.value);
    statusChart.setOption(
      {
        backgroundColor: "transparent",
        tooltip: { trigger: "item" },
        legend: {
          orient: "vertical",
          left: "left",
          textStyle: { color: chartTextColor.value },
        },
        series: [
          {
            type: "pie",
            radius: ["40%", "70%"],
            center: ["60%", "50%"],
            data: salesContractStatusData.value.map((item) => ({
              name: item.name,
              value: item.value,
            })),
            itemStyle: {
              borderRadius: 5,
              borderColor: isDark.value ? "rgba(30, 41, 59, 1)" : "#fff",
              borderWidth: 2,
            },
            label: {
              show: true,
              color: chartTextColor.value,
              formatter: "{b}: {c}",
              fontSize: 13,
              fontWeight: "bold",
            },
          },
        ],
        color: ["#3b82f6", "#22c55e", "#f59e0b", "#e84a4a", "#8b5cf6"],
      },
      true,
    );
  }
}

function handleResize() {
  trendChart?.resize();
  statusChart?.resize();
  topSuppliersChart?.resize();
}

onMounted(() => {
  void loadContractOverview();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  trendChart?.dispose();
  statusChart?.dispose();
  topSuppliersChart?.dispose();
});

// Format Utilities
function formatCurrency(val: number) {
  if (!val) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
}

function formatShortCurrency(val: number) {
  if (!val) return "0 ₫";
  if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + " Tỷ";
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + " Tr";
  return formatCurrency(val);
}

function formatNumber(val: number) {
  return new Intl.NumberFormat("vi-VN").format(val || 0);
}
</script>

<style scoped>
@reference '@styles/core/tailwind.css';

.reporting-page {
  @apply p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200;
}

.reporting-kpi-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6;
}

.reporting-card {
  @apply bg-white dark:bg-slate-800 border-none shadow-xl rounded-xl;
}

.reporting-card :deep(.el-card__header) {
  @apply border-b border-slate-200 dark:border-slate-700/50 pb-4 text-base font-semibold text-slate-800 dark:text-slate-100;
}

.reporting-chart {
  @apply h-[300px] w-full;
}

.reporting-section-grid {
  @apply grid gap-4;
}

.reporting-section-grid.two-columns {
  @apply grid-cols-1 lg:grid-cols-2;
}

.contract-list-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contract-list-title-group {
  min-width: 0;
}

.contract-list-count {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-weight: 400;
}

.contract-filter-bar {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  width: 100%;
}

.contract-filter-bar :deep(.el-select),
.contract-filter-bar :deep(.el-input),
.contract-filter-bar :deep(.el-button) {
  width: 100%;
}

@media (width >= 768px) {
  .contract-list-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .contract-filter-bar {
    grid-template-columns:
      minmax(140px, 160px) minmax(140px, 180px) minmax(220px, 280px)
      auto;
    width: auto;
  }

  .contract-filter-bar :deep(.el-button) {
    width: auto;
  }
}

/* Custom icon colors */
.bg-report-blue {
  @apply bg-blue-500/10 text-blue-500;
}

.bg-report-green {
  @apply bg-emerald-500/10 text-emerald-500;
}

.bg-report-orange {
  @apply bg-orange-500/10 text-orange-500;
}

.bg-report-red {
  @apply bg-rose-500/10 text-rose-500;
}
</style>
