<template>
  <div class="reporting-page">
    <ReportPageHeader
      title="Báo cáo bán hàng"
      description="Phân tích doanh thu, lợi nhuận, sản phẩm bán chạy và phương thức thanh toán."
      icon="ri:funds-line"
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

    <div class="reporting-kpi-grid">
      <ArtStatsCard
        title="Doanh thu hôm nay"
        :count="formatCurrency(data.summary.todayRevenue)"
        :description="`${data.summary.revenueChangePercentage >= 0 ? 'Tăng' : 'Giảm'} ${Math.abs(data.summary.revenueChangePercentage).toFixed(1)}%`"
        icon="ri:money-dollar-circle-line"
        :icon-style="
          data.summary.revenueChangePercentage < 0
            ? 'bg-report-red-dark'
            : 'bg-report-red'
        "
      />
      <ArtStatsCard
        title="Doanh thu tháng"
        :count="formatCurrency(data.summary.monthlyRevenue)"
        :description="`Lợi nhuận: ${formatCurrency(data.summary.monthlyProfit)}`"
        icon="ri:calendar-check-line"
        icon-style="bg-report-red-light"
      />
      <ArtStatsCard
        title="7 ngày qua"
        :count="formatCurrency(data.summary.total7dRevenue)"
        :description="`Lợi nhuận: ${formatCurrency(data.summary.total7dProfit)}`"
        icon="ri:line-chart-line"
        icon-style="bg-report-red-dark"
      />
      <ArtStatsCard
        title="Ngày tốt nhất"
        :count="formatCurrency(data.summary.bestDayRevenue)"
        :description="data.summary.bestDayDate || 'Chưa có ngày nổi bật'"
        icon="ri:award-line"
        icon-style="bg-report-gray"
      />
    </div>

    <ElCard class="reporting-card mt-4">
      <template #header>Xu hướng doanh thu &amp; lợi nhuận</template>
      <div ref="trendChartRef" class="reporting-chart"></div>
    </ElCard>

    <div class="reporting-section-grid two-columns mt-4">
      <ElCard class="reporting-card">
        <template #header>Top sản phẩm theo doanh thu</template>
        <div ref="topProductChartRef" class="reporting-chart"></div>
      </ElCard>
      <ElCard class="reporting-card">
        <template #header>Phương thức thanh toán</template>
        <div ref="paymentChartRef" class="reporting-chart"></div>
      </ElCard>
    </div>

    <ElCard class="reporting-card mt-4">
      <template #header>Bảng doanh thu theo ngày</template>
      <ElTable
        :data="data.dailyTableData"
        class="reporting-table"
        empty-text="Chưa có dữ liệu"
        @expand-change="onExpandChange"
      >
        <ElTableColumn type="expand">
          <template #default="{ row }">
            <div
              v-if="detailMap[row.reportDay]?.loading"
              class="reporting-table__expand-loading"
            >
              Đang tải chi tiết...
            </div>
            <ElTable
              v-else-if="detailMap[row.reportDay]?.items"
              :data="detailMap[row.reportDay]!.items"
              class="reporting-table reporting-table--compact"
              empty-text="Không có chi tiết"
              :show-header="true"
            >
              <ElTableColumn
                prop="productName"
                label="Sản phẩm"
                min-width="220"
              />
              <ElTableColumn
                prop="employeeName"
                label="Nhân viên bán"
                min-width="160"
              />
              <ElTableColumn
                prop="quantity"
                label="Số lượng"
                min-width="100"
                align="right"
              />
              <ElTableColumn
                prop="revenue"
                label="Doanh thu"
                min-width="160"
                align="right"
              >
                <template #default="{ row }">{{
                  formatCurrency(row.revenue)
                }}</template>
              </ElTableColumn>
            </ElTable>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="reportDay" label="Ngày" min-width="140" />
        <ElTableColumn
          prop="totalRevenue"
          label="Doanh thu"
          min-width="160"
          align="right"
        >
          <template #default="{ row }">{{
            formatCurrency(row.totalRevenue)
          }}</template>
        </ElTableColumn>
        <ElTableColumn
          prop="totalProfit"
          label="Lợi nhuận"
          min-width="160"
          align="right"
        >
          <template #default="{ row }">{{
            formatCurrency(row.totalProfit)
          }}</template>
        </ElTableColumn>
        <ElTableColumn
          prop="orderCount"
          label="Số đơn"
          min-width="110"
          align="right"
        />
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import * as echarts from "echarts";
import ArtStatsCard from "@/components/core/cards/art-stats-card/index.vue";
import { statisticsApi } from "@/api/operations";
import type * as Statistical from "@/types/api/statistical";
import ReportPageHeader from "./ReportPageHeader.vue";
import ReportPeriodSwitcher from "./ReportPeriodSwitcher.vue";

const trendChartRef = ref<HTMLElement | null>(null);
const topProductChartRef = ref<HTMLElement | null>(null);
const paymentChartRef = ref<HTMLElement | null>(null);
let trendChart: echarts.ECharts | null = null;
let topProductChart: echarts.ECharts | null = null;
let paymentChart: echarts.ECharts | null = null;
const chartTextColor = "#aeb0bd";
const chartAxisLineColor = "rgba(255, 255, 255, 0.16)";
const chartGridLineColor = "rgba(255, 255, 255, 0.1)";

const currentPeriod = ref<"today" | "month" | "year" | "custom">("month");
const periodStart = ref("");
const periodEnd = ref("");

const data = ref<Statistical.AdminRevenueAnalysisResponse>({
  summary: {} as Statistical.DashboardStatsResponse,
  revenueTrend: [],
  topProductsByRevenue: [],
  brandRevenueDistribution: [],
  paymentMethodDistribution: [],
  dailyTableData: [],
});

type DetailEntry = {
  loading: boolean;
  items: Statistical.DailyRevenueDetailResponse[];
};
const detailMap = ref<Record<string, DetailEntry>>({});

async function onExpandChange(row: Statistical.DailyRevenueTableResponse) {
  const day = row.reportDay;
  if (detailMap.value[day]?.items) return;
  detailMap.value[day] = { loading: true, items: [] };
  try {
    const items = await statisticsApi.getDailyRevenueDetail(day);
    detailMap.value[day] = { loading: false, items };
  } catch {
    detailMap.value[day] = { loading: false, items: [] };
  }
}

function onPeriodChange() {
  // TODO: Pass period params to API when backend supports it
  // Expected: GET /api/v1/Statistics/revenue-analysis?period=...&start=...&end=...
  load();
}

async function load() {
  try {
    data.value = await statisticsApi.getRevenueAnalysis();
    renderCharts();
  } catch (e) {
    console.error("Failed to load revenue analysis:", e);
  }
}

function renderCharts() {
  if (trendChartRef.value) {
    if (!trendChart) trendChart = echarts.init(trendChartRef.value);
    trendChart.setOption({
      backgroundColor: "transparent",
      textStyle: { color: chartTextColor },
      tooltip: { trigger: "axis" },
      legend: { data: ["Doanh thu"], textStyle: { color: chartTextColor } },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "category",
        data: data.value.revenueTrend.map((r) => r.reportDay),
        axisLabel: { color: chartTextColor },
        axisLine: { lineStyle: { color: chartAxisLineColor } },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: chartTextColor },
        splitLine: { lineStyle: { color: chartGridLineColor } },
      },
      series: [
        {
          name: "Doanh thu",
          type: "line",
          smooth: true,
          data: data.value.revenueTrend.map((r) => r.totalRevenue),
          itemStyle: { color: "#e84a4a" },
          lineStyle: { color: "#e84a4a" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(232, 74, 74, 0.32)" },
              { offset: 1, color: "rgba(232, 74, 74, 0)" },
            ]),
          },
        },
      ],
    });
  }
  if (topProductChartRef.value) {
    if (!topProductChart)
      topProductChart = echarts.init(topProductChartRef.value);
    const top = data.value.topProductsByRevenue.slice(0, 8);
    topProductChart.setOption({
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
        data: top.map((r) => r.productName).reverse(),
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
  if (paymentChartRef.value) {
    if (!paymentChart) paymentChart = echarts.init(paymentChartRef.value);
    paymentChart.setOption({
      backgroundColor: "transparent",
      color: ["#e84a4a", "#ff6b6b", "#f97316", "#22c55e", "#3b82f6", "#a855f7"],
      textStyle: { color: chartTextColor },
      tooltip: { trigger: "item" },
      legend: { bottom: 0, textStyle: { color: chartTextColor } },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          data: data.value.paymentMethodDistribution.map((d) => ({
            name: d.methodName || "Khác",
            value: d.value,
          })),
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

function handleResize() {
  trendChart?.resize();
  topProductChart?.resize();
  paymentChart?.resize();
}
onMounted(() => {
  load();
  window.addEventListener("resize", handleResize);
});
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  trendChart?.dispose();
  topProductChart?.dispose();
  paymentChart?.dispose();
});
</script>
