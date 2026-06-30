<template>
  <div class="reporting-page">
    <ReportPageHeader
      title="Báo cáo nhân sự & hoa hồng"
      description="Theo dõi doanh số theo nhân viên, hoa hồng chi trả và trạng thái KPI trong kỳ."
      icon="ri:team-line"
    >
      <template #actions>
        <ReportPeriodSwitcher
          v-model="currentPeriod"
          v-model:start-date="periodStart"
          v-model:end-date="periodEnd"
          @update:modelValue="onPeriodChange"
        />
      </template>
    </ReportPageHeader>

    <!-- TẦNG 1: BỔ SUNG 4 THẺ CHỈ SỐ KPI NHANH -->
    <div class="reporting-kpi-grid">
      <ArtStatsCard
        title="Tổng quỹ hoa hồng"
        :count="formatShortCurrency(mockSummary.totalCommission)"
        description="Tháng này"
        icon="ri:money-dollar-circle-line"
        icon-style="bg-report-red"
      />
      <ArtStatsCard
        title="Doanh số nhân sự"
        :count="formatShortCurrency(mockSummary.totalStaffRevenue)"
        description="Tháng này"
        icon="ri:line-chart-line"
        icon-style="bg-report-red-light"
      />
      <ArtStatsCard
        title="Tỷ lệ đạt KPI"
        :count="mockSummary.kpiAchievement"
        description="Nhân viên"
        icon="ri:user-star-line"
        icon-style="bg-report-red-dark"
      />
      <ArtStatsCard
        title="Hoa hồng cao nhất"
        :count="formatShortCurrency(mockSummary.topPayout)"
        description="Cá nhân nổi bật"
        icon="ri:award-line"
        icon-style="bg-report-gray"
      />
    </div>

    <!-- TẦNG 2: BIỂU ĐỒ XU HƯỚNG FULL-WIDTH -->
    <ElCard class="reporting-card mt-4">
      <template #header
        >Xu hướng phát sinh hoa hồng & Doanh số nhân sự</template
      >
      <div ref="trendChartRef" class="reporting-chart"></div>
    </ElCard>

    <!-- TẦNG 3: CẶP ĐÔI BIỂU ĐỒ PHÂN TÍCH TỶ LỆ (CHIA ĐÔI 50/50) -->
    <div class="reporting-section-grid two-columns mt-4">
      <ElCard class="reporting-card">
        <template #header>Top 5 nhân viên doanh số cao nhất</template>
        <div ref="topEmployeeChartRef" class="reporting-chart"></div>
      </ElCard>
      <ElCard class="reporting-card">
        <template #header>Tỷ lệ chi trả hoa hồng theo vai trò</template>
        <div ref="roleChartRef" class="reporting-chart"></div>
      </ElCard>
    </div>

    <!-- TẦNG 4: BẢNG DỮ LIỆU CHI TIẾT (ĐẨY XUỐNG ĐÁY TRANG) -->
    <ElCard class="reporting-card mt-4">
      <template #header>Bảng thống kê chi tiết theo từng nhân sự</template>
      <ElTable
        :data="performance"
        class="reporting-table"
        empty-text="Không có dữ liệu hiệu suất cho khoảng thời gian này"
      >
        <ElTableColumn prop="employeeName" label="Nhân viên" min-width="220" />
        <ElTableColumn prop="role" label="Vai trò" min-width="180" />
        <ElTableColumn
          prop="totalSales"
          label="Doanh số mang về"
          min-width="170"
          align="right"
        >
          <template #default="{ row }">{{
            formatCurrency(row.totalSales)
          }}</template>
        </ElTableColumn>
        <ElTableColumn
          prop="commissionPaid"
          label="Hoa hồng chi trả"
          min-width="170"
          align="right"
        >
          <template #default="{ row }">
            <span class="font-semibold text-primary">{{
              formatCurrency(row.commissionPaid)
            }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Trạng thái KPI" min-width="150" align="center">
          <template #default="{ row }">
            <ElTag
              :type="getKpiTagType(row.totalSales, row.targetSales)"
              effect="light"
              round
            >
              {{ getKpiStatusLabel(row.totalSales, row.targetSales) }}
            </ElTag>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import ArtStatsCard from "@/components/core/cards/art-stats-card/index.vue";
import { AnalyticsService } from "@/services/analytics.service";
import type { StaffPerformance } from "@/services/analytics.types";
import ReportPageHeader from "./ReportPageHeader.vue";
import ReportPeriodSwitcher from "./ReportPeriodSwitcher.vue";

const currentPeriod = ref<"today" | "month" | "year" | "custom">("month");
const periodStart = ref(
  new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0],
);
const periodEnd = ref(new Date().toISOString().split("T")[0]);
const performance = ref<StaffPerformance[]>([]);

// Refs for ECharts
const trendChartRef = ref<HTMLElement | null>(null);
const topEmployeeChartRef = ref<HTMLElement | null>(null);
const roleChartRef = ref<HTMLElement | null>(null);

let trendChart: echarts.ECharts | null = null;
let topEmployeeChart: echarts.ECharts | null = null;
let roleChart: echarts.ECharts | null = null;

const chartTextColor = "#aeb0bd";
const chartAxisLineColor = "rgba(255, 255, 255, 0.16)";
const chartGridLineColor = "rgba(255, 255, 255, 0.1)";

// --- MOCK DATA ---
const mockSummary = {
  totalCommission: 145000000,
  totalStaffRevenue: 3200000000,
  kpiAchievement: "18 / 25",
  topPayout: 18500000,
};

// Generate 30 days of mock data
const mockTrendData = Array.from({ length: 30 }, (_, i) => {
  const day = `Ngày ${String(i + 1).padStart(2, "0")}`;
  const staffRevenue = Math.floor(Math.random() * 150000000) + 50000000; // 50M - 200M
  const commission = staffRevenue * (Math.random() * 0.05 + 0.02); // 2% - 7%
  return { day, staffRevenue, commission };
});

const mockTopEmployees = [
  { name: "Nguyễn Văn A", revenue: 1200000000 },
  { name: "Trần Thị B", revenue: 850000000 },
  { name: "Lê Văn C", revenue: 500000000 },
  { name: "Phạm Thị D", revenue: 320000000 },
  { name: "Hoàng Văn E", revenue: 210000000 },
];

const mockRoleDistribution = [
  { name: "Sale Xe Máy", value: 65 },
  { name: "Sale Phụ Tùng", value: 20 },
  { name: "Kỹ Thuật Viên", value: 15 },
];

function onPeriodChange() {
  loadPerformance();
}

async function loadPerformance() {
  // Bỏ qua gọi API tạm thời để hiển thị chính xác dữ liệu giả cho UI (API hiện trả về 0đ)
  // const apiData = await AnalyticsService.getStaffPerformance(periodStart.value, periodEnd.value);

  performance.value = [
    {
      employeeName: "Nguyễn Văn A",
      role: "Trưởng phòng KD",
      totalSales: 1200000000,
      targetSales: 1000000000,
      commissionPaid: 15000000,
      kpiStatus: "Đạt",
      isTopSeller: true,
    },
    {
      employeeName: "Trần Thị B",
      role: "Sale Xe Máy",
      totalSales: 850000000,
      targetSales: 1000000000,
      commissionPaid: 12000000,
      kpiStatus: "Cần cải thiện",
      isTopSeller: true,
    },
    {
      employeeName: "Lê Văn C",
      role: "Sale Phụ Tùng",
      totalSales: 500000000,
      targetSales: 400000000,
      commissionPaid: 5000000,
      kpiStatus: "Đạt",
      isTopSeller: true,
    },
    {
      employeeName: "Phạm Thị D",
      role: "Kỹ thuật viên",
      totalSales: 320000000,
      targetSales: 350000000,
      commissionPaid: 4500000,
      kpiStatus: "Cần cải thiện",
      isTopSeller: false,
    },
    {
      employeeName: "Hoàng Văn E",
      role: "Kỹ thuật viên",
      totalSales: 210000000,
      targetSales: 100000000,
      commissionPaid: 1500000,
      kpiStatus: "Cần cải thiện",
      isTopSeller: false,
    },
  ];

  renderCharts();
}

function renderCharts() {
  // 1. Line Chart: Xu hướng
  if (trendChartRef.value) {
    if (!trendChart) trendChart = echarts.init(trendChartRef.value);
    trendChart.setOption({
      backgroundColor: "transparent",
      textStyle: { color: chartTextColor },
      tooltip: { trigger: "axis" },
      legend: {
        data: ["Doanh số", "Hoa hồng"],
        textStyle: { color: chartTextColor },
      },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "category",
        data: mockTrendData.map((d) => d.day),
        axisLabel: { color: chartTextColor },
        axisLine: { lineStyle: { color: chartAxisLineColor } },
      },
      yAxis: [
        {
          type: "value",
          name: "Doanh số",
          axisLabel: { color: chartTextColor },
          splitLine: { lineStyle: { color: chartGridLineColor } },
        },
        {
          type: "value",
          name: "Hoa hồng",
          axisLabel: { color: chartTextColor },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: "Doanh số",
          type: "line",
          smooth: true,
          data: mockTrendData.map((d) => d.staffRevenue),
          itemStyle: { color: "#3b82f6" },
          lineStyle: { color: "#3b82f6" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(59, 130, 246, 0.32)" },
              { offset: 1, color: "rgba(59, 130, 246, 0)" },
            ]),
          },
        },
        {
          name: "Hoa hồng",
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          data: mockTrendData.map((d) => d.commission),
          itemStyle: { color: "#e84a4a" },
          lineStyle: { color: "#e84a4a", type: "dashed" },
        },
      ],
    });
  }

  // 2. Bar Chart: Top 5 NV
  if (topEmployeeChartRef.value) {
    if (!topEmployeeChart)
      topEmployeeChart = echarts.init(topEmployeeChartRef.value);
    const top = mockTopEmployees;
    topEmployeeChart.setOption({
      backgroundColor: "transparent",
      textStyle: { color: chartTextColor },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "value",
        axisLabel: { color: chartTextColor },
        splitLine: { lineStyle: { color: chartGridLineColor } },
      },
      yAxis: {
        type: "category",
        data: top.map((r) => r.name).reverse(),
        axisLabel: { color: chartTextColor },
        axisLine: { lineStyle: { color: chartAxisLineColor } },
      },
      series: [
        {
          type: "bar",
          data: top.map((r) => r.revenue).reverse(),
          itemStyle: { color: "#e84a4a" },
        },
      ],
    });
  }

  // 3. Pie Chart: Tỷ lệ theo khối
  if (roleChartRef.value) {
    if (!roleChart) roleChart = echarts.init(roleChartRef.value);
    roleChart.setOption({
      backgroundColor: "transparent",
      color: ["#e84a4a", "#f97316", "#3b82f6", "#22c55e", "#a855f7"],
      textStyle: { color: chartTextColor },
      tooltip: { trigger: "item", formatter: "{b}: {c}%" },
      legend: { bottom: 0, textStyle: { color: chartTextColor } },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          data: mockRoleDistribution.map((d) => ({
            name: d.name,
            value: d.value,
          })),
          label: {
            formatter: "{b}: {c}%",
            color: chartTextColor,
          },
        },
      ],
    });
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function formatShortCurrency(value: number) {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(2).replace(/\.00$/, "") + " Tỷ ₫";
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(0) + " Triệu ₫";
  }
  return formatCurrency(value);
}

function getKpiPercent(totalSales: number, targetSales: number): number {
  if (!targetSales || targetSales === 0) return 0;
  return (totalSales / targetSales) * 100;
}

function getKpiStatusLabel(totalSales: number, targetSales: number): string {
  const percent = getKpiPercent(totalSales, targetSales);
  if (percent >= 100) return "Đạt chỉ tiêu";
  if (percent >= 70) return "Đang tiến triển";
  return "Cần cải thiện";
}

function getKpiTagType(
  totalSales: number,
  targetSales: number,
): "primary" | "success" | "info" | "danger" | "warning" {
  const percent = getKpiPercent(totalSales, targetSales);
  if (percent >= 100) return "success";
  if (percent >= 70) return "warning";
  return "danger";
}

function handleResize() {
  trendChart?.resize();
  topEmployeeChart?.resize();
  roleChart?.resize();
}

onMounted(() => {
  loadPerformance();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  trendChart?.dispose();
  topEmployeeChart?.dispose();
  roleChart?.dispose();
});
</script>
