<template>
  <div class="product-report">
    <div class="reporting-kpi-grid">
      <ArtStatsCard
        title="Tổng SKU"
        :count="data.highlights.totalSKUs"
        description="Tổng mã sản phẩm đang theo dõi"
        icon="ri:barcode-line"
        icon-style="bg-report-red"
      />
      <ArtStatsCard
        title="Sản phẩm bán chạy nhất"
        :count="data.highlights.bestSellerName || 'Chưa có'"
        :description="`Đã bán: ${data.highlights.bestSellerSold}`"
        icon="ri:medal-line"
        icon-style="bg-report-red-light"
      />
      <ArtStatsCard
        title="Hàng ế tồn kho"
        :count="data.highlights.deadStockName || 'Không có'"
        :description="`Giá trị: ${formatCurrency(data.highlights.deadStockValue)}`"
        icon="ri:archive-drawer-line"
        icon-style="bg-report-red-dark"
      />
      <ArtStatsCard
        title="Vòng quay TB"
        :count="data.highlights.avgTurnover"
        description="Số ngày quay vòng trung bình"
        icon="ri:refresh-line"
        icon-style="bg-report-gray"
      />
    </div>

    <div class="reporting-section-grid two-columns mt-4">
      <ElCard class="reporting-card">
        <template #header>Top sản phẩm theo doanh thu</template>
        <div ref="topRevenueChartRef" class="reporting-chart"></div>
      </ElCard>
      <ElCard class="reporting-card">
        <template #header>Top sản phẩm theo lợi nhuận</template>
        <div ref="topProfitChartRef" class="reporting-chart"></div>
      </ElCard>
    </div>

    <ElCard class="reporting-card mt-4">
      <template #header>Hiệu suất sản phẩm</template>
      <ElTable
        :data="data.productPerformanceTable"
        class="reporting-table"
        empty-text="Chưa có dữ liệu"
      >
        <ElTableColumn prop="productName" label="Sản phẩm" min-width="220" />
        <ElTableColumn
          prop="sellPrice"
          label="Giá bán"
          min-width="140"
          align="right"
        >
          <template #default="{ row }">{{
            formatCurrency(row.sellPrice)
          }}</template>
        </ElTableColumn>
        <ElTableColumn
          prop="soldCount30Days"
          label="Đã bán (30 ngày)"
          min-width="150"
          align="right"
        />
        <ElTableColumn label="Tồn kho" min-width="130" align="right">
          <template #default="{ row }"
            >{{ row.stockQuantity }} / {{ row.maxStockQuantity }}</template
          >
        </ElTableColumn>
        <ElTableColumn
          prop="marginPercentage"
          label="Tỷ suất lợi nhuận"
          min-width="150"
          align="right"
        >
          <template #default="{ row }">
            <span
              :class="
                row.marginPercentage >= 0 ? 'text-green-600' : 'text-red-600'
              "
            >
              {{ row.marginPercentage.toFixed(1) }}%
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="status"
          label="Trạng thái"
          min-width="130"
          align="center"
        >
          <template #default="{ row }">
            <ElTag
              :type="productStatusType(row.status)"
              size="small"
              effect="light"
              round
            >
              {{ row.status || "-" }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Xu hướng 7 ngày" min-width="150" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <span
                v-for="(value, index) in row.trend"
                :key="index"
                class="inline-block w-2 rounded-sm"
                :class="
                  value > 0
                    ? 'bg-green-500'
                    : value < 0
                      ? 'bg-red-500'
                      : 'bg-gray-300'
                "
                :style="{ height: `${Math.max(4, Math.abs(value) * 3)}px` }"
              ></span>
            </div>
          </template>
        </ElTableColumn>
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

const topRevenueChartRef = ref<HTMLElement | null>(null);
const topProfitChartRef = ref<HTMLElement | null>(null);
let topRevenueChart: echarts.ECharts | null = null;
let topProfitChart: echarts.ECharts | null = null;
const chartTextColor = "#aeb0bd";
const chartAxisLineColor = "rgba(255, 255, 255, 0.16)";
const chartGridLineColor = "rgba(255, 255, 255, 0.1)";

const data = ref<Statistical.AdminProductReportResponse>({
  highlights: {
    bestSellerName: "",
    bestSellerSold: 0,
    deadStockName: "",
    deadStockValue: 0,
    avgTurnover: 0,
    totalSKUs: 0,
  },
  topRevenueProducts: [],
  topProfitProducts: [],
  productPerformanceTable: [],
});

async function load() {
  try {
    data.value = await statisticsApi.getProductReport();
    renderCharts();
  } catch (e) {
    console.error("Failed to load product report:", e);
  }
}

function renderCharts() {
  if (topRevenueChartRef.value) {
    if (!topRevenueChart)
      topRevenueChart = echarts.init(topRevenueChartRef.value);
    const top = data.value.topRevenueProducts.slice(0, 8);
    topRevenueChart.setOption({
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
  if (topProfitChartRef.value) {
    if (!topProfitChart) topProfitChart = echarts.init(topProfitChartRef.value);
    const top = data.value.topProfitProducts.slice(0, 8);
    topProfitChart.setOption({
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
          data: top.map((r) => r.profit).reverse(),
          itemStyle: { color: "#10b981" },
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
function productStatusType(status?: string) {
  if (status === "Bán chạy") return "success";
  if (status === "Tồn kho") return "danger";
  if (status === "Sắp hết") return "warning";
  return "info";
}
function handleResize() {
  topRevenueChart?.resize();
  topProfitChart?.resize();
}
onMounted(() => {
  load();
  window.addEventListener("resize", handleResize);
});
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  topRevenueChart?.dispose();
  topProfitChart?.dispose();
});
</script>
