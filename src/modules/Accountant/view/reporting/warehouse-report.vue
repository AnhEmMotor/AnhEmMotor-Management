<template>
  <div class="warehouse-report">
    <div class="reporting-kpi-grid">
      <ArtStatsCard
        title="Tổng tồn kho"
        :count="data.summary.totalStock"
        :description="`Giá trị: ${formatCurrency(data.summary.totalValue)}`"
        icon="ri:archive-stack-line"
        icon-style="bg-report-red"
      />
      <ArtStatsCard
        title="Sắp hết hàng"
        :count="data.summary.lowStockCount"
        description="Sản phẩm cần bổ sung sớm"
        icon="ri:alarm-warning-line"
        icon-style="bg-report-red-dark"
      />
      <ArtStatsCard
        title="Hết hàng"
        :count="data.summary.outOfStockCount"
        description="Sản phẩm không còn tồn"
        icon="ri:close-circle-line"
        icon-style="bg-report-red-dark"
      />
      <ArtStatsCard
        title="Tỷ lệ tồn kho khỏe"
        :count="stockRatio"
        description="Không thuộc nhóm sắp hết/hết hàng"
        icon="ri:checkbox-circle-line"
        icon-style="bg-report-red-light"
      />
    </div>

    <div class="reporting-section-grid two-columns mt-4">
      <ElCard class="reporting-card">
        <template #header>Tồn kho theo thương hiệu</template>
        <div ref="brandChartRef" class="reporting-chart"></div>
      </ElCard>
      <ElCard class="reporting-card">
        <template #header>Tỷ lệ trạng thái tồn kho</template>
        <div ref="statusChartRef" class="reporting-chart"></div>
      </ElCard>
    </div>

    <ElCard class="reporting-card mt-4">
      <template #header>Chi tiết theo thương hiệu</template>
      <ElTable
        :data="data.warehouseTableData"
        class="reporting-table"
        empty-text="Chưa có dữ liệu"
      >
        <ElTableColumn prop="brandName" label="Thương hiệu" min-width="180">
          <template #default="{ row }">{{ row.brandName || "-" }}</template>
        </ElTableColumn>
        <ElTableColumn
          prop="totalStock"
          label="Tổng tồn"
          min-width="110"
          align="right"
        />
        <ElTableColumn
          prop="capacity"
          label="Sức chứa"
          min-width="110"
          align="right"
        />
        <ElTableColumn
          prop="lowStock"
          label="Sắp hết"
          min-width="110"
          align="right"
        >
          <template #default="{ row }">
            <span class="text-yellow-600">{{ row.lowStock }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="outOfStock"
          label="Hết hàng"
          min-width="110"
          align="right"
        >
          <template #default="{ row }">
            <span class="text-red-600">{{ row.outOfStock }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="value"
          label="Giá trị"
          min-width="150"
          align="right"
        >
          <template #default="{ row }">{{
            formatCurrency(row.value)
          }}</template>
        </ElTableColumn>
        <ElTableColumn
          prop="status"
          label="Trạng thái"
          min-width="130"
          align="center"
        >
          <template #default="{ row }">
            <ElTag
              :type="warehouseStatusType(row.status)"
              size="small"
              effect="light"
              round
            >
              {{ row.status || "-" }}
            </ElTag>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import * as echarts from "echarts";
import ArtStatsCard from "@/components/core/cards/art-stats-card/index.vue";
import { statisticsApi } from "@/api/operations";
import type * as Statistical from "@/types/api/statistical";

const brandChartRef = ref<HTMLElement | null>(null);
const statusChartRef = ref<HTMLElement | null>(null);
let brandChart: echarts.ECharts | null = null;
let statusChart: echarts.ECharts | null = null;
const chartTextColor = "#aeb0bd";
const chartPalette = [
  "#e84a4a",
  "#ff6b6b",
  "#f97316",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
];

const data = ref<Statistical.AdminWarehouseReportResponse>({
  summary: {
    totalStock: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  },
  stockByBrand: [],
  stockStatusRatio: [],
  warehouseTableData: [],
});

const stockRatio = computed(() => {
  const s = data.value.summary;
  if (!s.totalStock) return "0%";
  return (
    (
      ((s.totalStock - s.lowStockCount - s.outOfStockCount) / s.totalStock) *
      100
    ).toFixed(1) + "%"
  );
});

async function load() {
  try {
    data.value = await statisticsApi.getWarehouseReport();
    renderCharts();
  } catch (e) {
    console.error("Failed to load warehouse report:", e);
  }
}

function renderCharts() {
  if (brandChartRef.value) {
    if (!brandChart) brandChart = echarts.init(brandChartRef.value);
    const top = data.value.stockByBrand.slice(0, 8);
    brandChart.setOption({
      backgroundColor: "transparent",
      color: chartPalette,
      textStyle: { color: chartTextColor },
      tooltip: { trigger: "item" },
      legend: { bottom: 0, textStyle: { color: chartTextColor } },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          data: top.map((d) => ({
            name: d.brandName || "Khác",
            value: d.stockCount,
          })),
        },
      ],
    });
  }
  if (statusChartRef.value) {
    if (!statusChart) statusChart = echarts.init(statusChartRef.value);
    statusChart.setOption({
      backgroundColor: "transparent",
      color: chartPalette,
      textStyle: { color: chartTextColor },
      tooltip: { trigger: "item" },
      legend: { bottom: 0, textStyle: { color: chartTextColor } },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          data: data.value.stockStatusRatio.map((d) => ({
            name: d.statusLabel || "Khác",
            value: d.count,
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
function warehouseStatusType(status?: string) {
  if (status === "Bình thường") return "success";
  if (status === "Sắp hết") return "warning";
  if (status === "Hết hàng") return "danger";
  return "info";
}
function handleResize() {
  brandChart?.resize();
  statusChart?.resize();
}
onMounted(() => {
  load();
  window.addEventListener("resize", handleResize);
});
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  brandChart?.dispose();
  statusChart?.dispose();
});
</script>
