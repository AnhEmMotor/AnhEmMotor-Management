<template>
  <div class="reporting-page employee-report-page">
    <ReportPageHeader
      title="Báo cáo nhân sự & hoa hồng"
      description="Theo dõi doanh số theo nhân viên, hoa hồng chi trả và trạng thái KPI trong kỳ."
      icon="ri:team-line"
    >
      <template #actions>
        <div class="reporting-actions employee-report__actions">
          <ReportPeriodSwitcher
            v-model="currentPeriod"
            v-model:start-date="periodStart"
            v-model:end-date="periodEnd"
            @update:modelValue="onPeriodChange"
          />
          <ElButton
            type="primary"
            :icon="Refresh"
            :loading="loading"
            @click="loadPerformance"
          >
            Làm mới
          </ElButton>
        </div>
      </template>
    </ReportPageHeader>

    <div class="reporting-kpi-grid employee-report__kpis">
      <ArtStatsCard
        title="Doanh số nhân viên"
        :count="formatCurrency(reportSummary.totalSales)"
        :description="`${reportSummary.employeeCount} nhân viên có dữ liệu`"
        icon="ri:line-chart-line"
        icon-style="bg-report-red"
        :loading="loading"
      />
      <ArtStatsCard
        title="Hoa hồng chi trả"
        :count="formatCurrency(reportSummary.totalCommission)"
        :description="`Tỷ lệ hoa hồng: ${formatPercent(commissionRate)}`"
        icon="ri:hand-coin-line"
        icon-style="bg-report-red-light"
        :loading="loading"
      />
      <ArtStatsCard
        title="Hoàn thành KPI"
        :count="formatPercent(reportSummary.achievementRate)"
        :description="`${reportSummary.achievedCount} nhân viên đạt hoặc vượt KPI`"
        icon="ri:target-line"
        icon-style="bg-report-red-dark"
        :loading="loading"
      />
      <ArtStatsCard
        title="Cần cải thiện"
        :count="reportSummary.needImprovementCount"
        description="Nhân viên cần theo dõi KPI sát hơn"
        icon="ri:alarm-warning-line"
        :icon-style="
          reportSummary.needImprovementCount > 0
            ? 'bg-report-red-dark'
            : 'bg-report-gray'
        "
        :loading="loading"
      />
    </div>

    <div v-if="errorMessage" class="reporting-note employee-report__error">
      <ElIcon><WarningFilled /></ElIcon>
      <span>{{ errorMessage }}</span>
    </div>

    <div class="employee-report__charts">
      <ElCard
        class="reporting-card employee-report__chart-card employee-report__chart-card--wide"
      >
        <template #header>
          <div class="employee-report__card-header">
            <span>Doanh số và hoa hồng theo nhân viên</span>
            <span>{{ selectedRangeLabel }}</span>
          </div>
        </template>
        <div
          v-if="hasData"
          ref="salesCommissionChartRef"
          class="reporting-chart employee-report__chart"
        ></div>
        <ElEmpty
          v-else
          description="Chưa có dữ liệu"
          :image-size="90"
          class="employee-report__empty"
        />
      </ElCard>

      <ElCard class="reporting-card employee-report__chart-card">
        <template #header>
          <div class="employee-report__card-header">
            <span>Cơ cấu trạng thái KPI</span>
            <span>{{ reportSummary.employeeCount }} nhân viên</span>
          </div>
        </template>
        <div
          v-if="hasData"
          ref="kpiStatusChartRef"
          class="reporting-chart employee-report__chart"
        ></div>
        <ElEmpty
          v-else
          description="Chưa có dữ liệu"
          :image-size="90"
          class="employee-report__empty"
        />
      </ElCard>
    </div>

    <div class="employee-report__insights">
      <ElCard class="reporting-card employee-report__insight-card">
        <template #header>
          <div class="employee-report__card-header">
            <span>Nhân viên nổi bật</span>
            <span>{{ topPerformers.length }} người</span>
          </div>
        </template>
        <div v-if="topPerformers.length" class="employee-report__top-list">
          <div
            v-for="employee in topPerformers"
            :key="employee.employeeName"
            class="employee-report__top-row"
          >
            <div class="employee-report__top-main">
              <div class="employee-report__avatar">
                {{ employee.employeeName.charAt(0) }}
              </div>
              <div class="employee-report__top-info">
                <strong>{{ employee.employeeName }}</strong>
                <span>{{ employee.role }}</span>
              </div>
            </div>
            <div class="employee-report__top-value">
              <strong>{{ formatCurrency(employee.totalSales) }}</strong>
              <span>{{ formatPercent(getAchievementRate(employee)) }}</span>
            </div>
          </div>
        </div>
        <ElEmpty
          v-else
          description="Chưa có dữ liệu"
          :image-size="86"
          class="employee-report__empty employee-report__empty--compact"
        />
      </ElCard>

      <ElCard class="reporting-card employee-report__insight-card">
        <template #header>
          <div class="employee-report__card-header">
            <span>Tổng hợp theo vai trò</span>
            <span>{{ roleSummary.length }} nhóm</span>
          </div>
        </template>
        <div v-if="roleSummary.length" class="employee-report__role-list">
          <div
            v-for="role in roleSummary"
            :key="role.role"
            class="employee-report__role-row"
          >
            <div>
              <strong>{{ role.role }}</strong>
              <span>{{ role.employeeCount }} nhân viên</span>
            </div>
            <div class="employee-report__role-value">
              <strong>{{ formatCurrency(role.totalSales) }}</strong>
              <span>{{ formatCurrency(role.commissionPaid) }} hoa hồng</span>
            </div>
          </div>
        </div>
        <ElEmpty
          v-else
          description="Chưa có dữ liệu"
          :image-size="86"
          class="employee-report__empty employee-report__empty--compact"
        />
      </ElCard>
    </div>

    <ElCard class="reporting-card employee-report__table-card">
      <template #header>
        <div class="employee-report__card-header">
          <span>Chi tiết hiệu suất nhân sự</span>
          <span>{{ selectedRangeLabel }}</span>
        </div>
      </template>
      <ElTable
        v-loading="loading"
        :data="performance"
        class="reporting-table"
        empty-text="Chưa có dữ liệu"
      >
        <ElTableColumn prop="employeeName" label="Nhân viên" min-width="220">
          <template #default="{ row }">
            <div class="employee-report__employee-cell">
              <strong>{{ row.employeeName }}</strong>
              <ElTag v-if="row.isTopSeller" type="success" effect="light" round>
                Top
              </ElTag>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="role" label="Vai trò" min-width="180" />
        <ElTableColumn
          prop="totalSales"
          label="Doanh số mang về"
          min-width="170"
          align="right"
        >
          <template #default="{ row }">
            {{ formatCurrency(row.totalSales) }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="targetSales"
          label="Mục tiêu"
          min-width="150"
          align="right"
        >
          <template #default="{ row }">
            {{ formatCurrency(row.targetSales) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="Tiến độ KPI" min-width="180">
          <template #default="{ row }">
            <div class="employee-report__progress-cell">
              <ElProgress
                :percentage="Math.min(getAchievementRate(row), 130)"
                :stroke-width="8"
                :show-text="false"
              />
              <span>{{ formatPercent(getAchievementRate(row)) }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="commissionPaid"
          label="Hoa hồng chi trả"
          min-width="170"
          align="right"
        >
          <template #default="{ row }">
            <span class="font-semibold text-primary">
              {{ formatCurrency(row.commissionPaid) }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="kpiStatus"
          label="Trạng thái KPI"
          min-width="150"
          align="center"
        >
          <template #default="{ row }">
            <ElTag :type="getKpiTagType(row.kpiStatus)" effect="light" round>
              {{ row.kpiStatus }}
            </ElTag>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { ElMessage } from "element-plus";
import { Refresh, WarningFilled } from "@element-plus/icons-vue";

import ArtStatsCard from "@/components/core/cards/art-stats-card/index.vue";
import { AnalyticsService } from "@/services/analytics.service";
import type { StaffPerformance } from "@/services/analytics.types";
import ReportPageHeader from "./ReportPageHeader.vue";
import ReportPeriodSwitcher from "./ReportPeriodSwitcher.vue";

type Period = "today" | "month" | "year" | "custom";
type KpiStatus = StaffPerformance["kpiStatus"];

interface RoleSummary {
  role: string;
  employeeCount: number;
  totalSales: number;
  targetSales: number;
  commissionPaid: number;
}

const currentPeriod = ref<Period>("month");
const periodStart = ref(toDateInput(startOfMonth(new Date())));
const periodEnd = ref(toDateInput(new Date()));
const performance = ref<StaffPerformance[]>([]);
const loading = ref(false);
const errorMessage = ref("");

const salesCommissionChartRef = ref<HTMLElement | null>(null);
const kpiStatusChartRef = ref<HTMLElement | null>(null);
let salesCommissionChart: echarts.ECharts | null = null;
let kpiStatusChart: echarts.ECharts | null = null;

const hasData = computed(() => performance.value.length > 0);

const reportSummary = computed(() => {
  const totalSales = sumBy(performance.value, "totalSales");
  const totalTarget = sumBy(performance.value, "targetSales");
  const totalCommission = sumBy(performance.value, "commissionPaid");
  const achievedCount = performance.value.filter(
    (item) => item.kpiStatus === "Đạt" || item.kpiStatus === "Vượt KPI",
  ).length;
  const needImprovementCount = performance.value.filter(
    (item) => item.kpiStatus === "Cần cải thiện",
  ).length;

  return {
    employeeCount: performance.value.length,
    totalSales,
    totalTarget,
    totalCommission,
    achievedCount,
    needImprovementCount,
    achievementRate: totalTarget > 0 ? (totalSales / totalTarget) * 100 : 0,
  };
});

const commissionRate = computed(() =>
  reportSummary.value.totalSales > 0
    ? (reportSummary.value.totalCommission / reportSummary.value.totalSales) *
      100
    : 0,
);

const selectedRangeLabel = computed(
  () => `${formatDate(periodStart.value)} - ${formatDate(periodEnd.value)}`,
);

const kpiStatusSummary = computed(() =>
  (["Vượt KPI", "Đạt", "Cần cải thiện"] as KpiStatus[]).map((status) => ({
    status,
    count: performance.value.filter((item) => item.kpiStatus === status).length,
  })),
);

const topPerformers = computed(() =>
  [...performance.value]
    .sort((first, second) => second.totalSales - first.totalSales)
    .slice(0, 5),
);

const roleSummary = computed<RoleSummary[]>(() => {
  const grouped = new Map<string, RoleSummary>();

  for (const item of performance.value) {
    const current = grouped.get(item.role) ?? {
      role: item.role,
      employeeCount: 0,
      totalSales: 0,
      targetSales: 0,
      commissionPaid: 0,
    };

    current.employeeCount += 1;
    current.totalSales += item.totalSales || 0;
    current.targetSales += item.targetSales || 0;
    current.commissionPaid += item.commissionPaid || 0;
    grouped.set(item.role, current);
  }

  return [...grouped.values()].sort(
    (first, second) => second.totalSales - first.totalSales,
  );
});

function onPeriodChange(period?: Period) {
  if (period && period !== "custom") {
    setDateRange(period);
  }

  void loadPerformance();
}

async function loadPerformance() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const data = await AnalyticsService.getStaffPerformance(
      periodStart.value,
      periodEnd.value,
    );
    performance.value = Array.isArray(data) ? data : [];
  } catch (error) {
    performance.value = [];
    errorMessage.value = getErrorMessage(
      error,
      "Không thể tải dữ liệu nhân sự và hoa hồng",
    );
    ElMessage.error(errorMessage.value);
  } finally {
    loading.value = false;
    await nextTick();
    renderCharts();
  }
}

function renderCharts() {
  if (!hasData.value) {
    salesCommissionChart?.clear();
    kpiStatusChart?.clear();
    return;
  }

  renderSalesCommissionChart();
  renderKpiStatusChart();
}

function renderSalesCommissionChart() {
  if (!salesCommissionChartRef.value) return;
  if (!salesCommissionChart) {
    salesCommissionChart = echarts.init(salesCommissionChartRef.value);
  }

  const rows = topPerformers.value.length
    ? topPerformers.value
    : performance.value.slice(0, 8);

  salesCommissionChart.setOption({
    color: ["#E84A4A", "#FFB020"],
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number | string) =>
        typeof value === "number" ? formatCurrency(value) : String(value),
    },
    legend: {
      top: 0,
      textStyle: { color: chartTextColor() },
    },
    grid: {
      top: 44,
      right: 12,
      bottom: 28,
      left: 72,
    },
    xAxis: {
      type: "category",
      data: rows.map((item) => item.employeeName),
      axisLabel: {
        color: chartTextColor(),
        interval: 0,
        rotate: rows.length > 4 ? 20 : 0,
      },
      axisLine: { lineStyle: { color: chartGridColor() } },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: chartTextColor(),
        formatter: (value: number) => compactCurrency(value),
      },
      splitLine: { lineStyle: { color: chartGridColor() } },
    },
    series: [
      {
        name: "Doanh số",
        type: "bar",
        barMaxWidth: 34,
        data: rows.map((item) => item.totalSales || 0),
      },
      {
        name: "Hoa hồng",
        type: "bar",
        barMaxWidth: 34,
        data: rows.map((item) => item.commissionPaid || 0),
      },
    ],
  });
}

function renderKpiStatusChart() {
  if (!kpiStatusChartRef.value) return;
  if (!kpiStatusChart) {
    kpiStatusChart = echarts.init(kpiStatusChartRef.value);
  }

  kpiStatusChart.setOption({
    color: ["#22C55E", "#E84A4A", "#EF4444"],
    tooltip: { trigger: "item" },
    legend: {
      bottom: 0,
      textStyle: { color: chartTextColor() },
    },
    series: [
      {
        name: "Trạng thái KPI",
        type: "pie",
        radius: ["48%", "70%"],
        center: ["50%", "44%"],
        avoidLabelOverlap: true,
        label: {
          color: chartTextColor(),
          formatter: "{b}: {c}",
        },
        data: kpiStatusSummary.value.map((item) => ({
          name: item.status,
          value: item.count,
        })),
      },
    ],
  });
}

function resizeCharts() {
  salesCommissionChart?.resize();
  kpiStatusChart?.resize();
}

function destroyCharts() {
  salesCommissionChart?.dispose();
  kpiStatusChart?.dispose();
  salesCommissionChart = null;
  kpiStatusChart = null;
}

function getAchievementRate(item: Partial<StaffPerformance>) {
  const totalSales = item.totalSales ?? 0;
  const targetSales = item.targetSales ?? 0;

  return targetSales > 0 ? (totalSales / targetSales) * 100 : 0;
}

function sumBy(
  rows: StaffPerformance[],
  key: "totalSales" | "targetSales" | "commissionPaid",
) {
  return rows.reduce((total, item) => total + (item[key] || 0), 0);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function compactCurrency(value: number) {
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  }

  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)} tr`;
  }

  return `${value.toFixed(0)} đ`;
}

function formatPercent(value: number) {
  return `${(Number.isFinite(value) ? value : 0).toFixed(1)}%`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getKpiTagType(
  status: string,
): "primary" | "success" | "info" | "danger" | "warning" {
  switch (status) {
    case "Vượt KPI":
      return "success";
    case "Đạt":
      return "primary";
    case "Cần cải thiện":
      return "danger";
    default:
      return "info";
  }
}

function setDateRange(period: Period) {
  const today = new Date();

  if (period === "today") {
    periodStart.value = toDateInput(today);
    periodEnd.value = toDateInput(today);
    return;
  }

  if (period === "month") {
    periodStart.value = toDateInput(startOfMonth(today));
    periodEnd.value = toDateInput(today);
    return;
  }

  if (period === "year") {
    periodStart.value = toDateInput(new Date(today.getFullYear(), 0, 1));
    periodEnd.value = toDateInput(today);
  }
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toDateInput(date: Date) {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 10);
}

function chartTextColor() {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue("--el-text-color-regular")
      .trim() || "#606266"
  );
}

function chartGridColor() {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue("--el-border-color-light")
      .trim() || "#E5E7EB"
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

watch([periodStart, periodEnd], () => {
  if (currentPeriod.value === "custom") {
    void loadPerformance();
  }
});

onMounted(() => {
  void loadPerformance();
  window.addEventListener("resize", resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeCharts);
  destroyCharts();
});
</script>

<style scoped lang="scss">
.employee-report-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.employee-report__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 10px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 48%);
}

.employee-report__kpis {
  margin-top: 0;
}

.employee-report__error {
  color: #b45309;
  background: rgb(245 158 11 / 12%);
  border-color: rgb(245 158 11 / 30%);
}

.employee-report__charts,
.employee-report__insights {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 16px;
}

.employee-report__chart-card,
.employee-report__insight-card,
.employee-report__table-card {
  min-width: 0;
}

.employee-report__card-header {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  color: var(--report-text);
}

.employee-report__card-header > span:first-child {
  font-weight: 700;
}

.employee-report__card-header > span:last-child {
  font-size: 12px;
  font-weight: 600;
  color: var(--report-muted);
}

.employee-report__chart {
  min-height: 320px;
}

.employee-report__empty {
  min-height: 280px;
}

.employee-report__empty--compact {
  min-height: 180px;
}

.employee-report__top-list,
.employee-report__role-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.employee-report__top-row,
.employee-report__role-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--report-border);
}

.employee-report__top-row:last-child,
.employee-report__role-row:last-child {
  border-bottom: 0;
}

.employee-report__top-main,
.employee-report__employee-cell {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.employee-report__avatar {
  display: inline-flex;
  flex: 0 0 38px;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  font-weight: 800;
  color: var(--report-red-dark);
  background: rgb(232 74 74 / 14%);
  border: 1px solid rgb(232 74 74 / 20%);
  border-radius: 50%;
}

.employee-report__top-info,
.employee-report__role-row > div:first-child {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.employee-report__top-info strong,
.employee-report__role-row strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.employee-report__top-info span,
.employee-report__role-row span,
.employee-report__top-value span,
.employee-report__role-value span {
  margin-top: 4px;
  font-size: 12px;
  color: var(--report-muted);
}

.employee-report__top-value,
.employee-report__role-value {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.employee-report__progress-cell {
  display: grid;
  grid-template-columns: minmax(110px, 1fr) 58px;
  gap: 10px;
  align-items: center;
}

.employee-report__progress-cell span {
  font-size: 12px;
  font-weight: 700;
  color: var(--report-muted-strong);
  text-align: right;
}

@media (width >= 1024px) {
  .employee-report__charts {
    grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
  }

  .employee-report__insights {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 767px) {
  .employee-report__actions {
    align-items: stretch;
    width: 100%;
    overflow-x: auto;
  }

  .employee-report__top-row,
  .employee-report__role-row {
    align-items: flex-start;
  }

  .employee-report__top-value,
  .employee-report__role-value {
    max-width: 46%;
  }

  .employee-report__progress-cell {
    grid-template-columns: 1fr;
  }

  .employee-report__progress-cell span {
    text-align: left;
  }
}
</style>
