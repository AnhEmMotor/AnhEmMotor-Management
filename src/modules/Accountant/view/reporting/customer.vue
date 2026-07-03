<template>
  <div class="reporting-page">
    <ReportPageHeader
      title="Báo cáo khách hàng & Lead"
      description="Phân tích chất lượng tệp khách hàng, phễu chuyển đổi và theo dõi nguồn khách hàng."
      icon="ri:user-heart-line"
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

    <!-- TẦNG 1: BỘ CHỈ SỐ KPI -->
    <div class="reporting-kpi-grid">
      <ArtStatsCard
        title="Tổng lead mới"
        :count="3"
        description="🔼 +15% so với tháng trước"
        icon="ri:user-add-line"
        icon-style="bg-report-blue"
      />
      <ArtStatsCard
        title="Tỷ lệ chuyển đổi"
        count="0.0%"
        description="🔽 -1.2% so với tháng trước"
        icon="ri:filter-3-line"
        icon-style="bg-report-orange"
      />
      <ArtStatsCard
        title="Khách hàng mới"
        :count="0"
        description="0% (Chưa tăng trưởng)"
        icon="ri:user-star-line"
        icon-style="bg-report-green"
      />
      <ArtStatsCard
        title="Lead nóng"
        :count="1"
        description="🔼 +1 lead mới trong ngày"
        icon="ri:fire-line"
        icon-style="bg-report-red"
      />
    </div>

    <!-- TẦNG 2: CẶP BIỂU ĐỒ TRUNG TÂM -->
    <div class="reporting-section-grid two-columns mt-4">
      <ElCard class="reporting-card">
        <template #header>Phễu chuyển đổi theo kênh</template>
        <div ref="funnelChartRef" class="reporting-chart"></div>
      </ElCard>
      <ElCard class="reporting-card">
        <template #header>Phân bổ nguồn khách hàng</template>
        <div ref="sourceChartRef" class="reporting-chart"></div>
      </ElCard>
    </div>

    <!-- TẦNG 3: BIỂU ĐỒ PHÂN BỔ ĐIỂM LEAD (FULL-WIDTH) -->
    <ElCard class="reporting-card mt-4">
      <template #header>Phân bổ điểm Lead (Chất lượng khách hàng)</template>
      <div ref="histogramChartRef" class="reporting-chart"></div>
    </ElCard>

    <!-- TẦNG 4: BẢNG DANH SÁCH LEAD ƯU TIÊN -->
    <ElCard class="reporting-card mt-4">
      <template #header>
        <div class="flex justify-between items-center">
          <span>Danh sách Lead ưu tiên</span>
          <div class="flex gap-2">
            <ElInput
              v-model="searchQuery"
              placeholder="Tìm tên khách hàng..."
              class="w-64"
            >
              <template #prefix>
                <div class="i-ri-search-line"></div>
              </template>
            </ElInput>
            <ElButton type="primary" plain>
              <div class="i-ri-file-excel-2-line mr-1"></div>
              Xuất Excel
            </ElButton>
          </div>
        </div>
      </template>

      <ElTable
        :data="filteredLeads"
        class="reporting-table"
        empty-text="Không tìm thấy khách hàng"
      >
        <ElTableColumn prop="name" label="Tên khách hàng" min-width="150">
          <template #default="{ row }">
            <div class="font-medium">{{ row.name }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="phone" label="Số điện thoại" min-width="120" />
        <ElTableColumn prop="source" label="Nguồn" min-width="120">
          <template #default="{ row }">
            <ElTag :type="getSourceType(row.source)" effect="light" round>
              {{ row.source }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="Trạng thái" min-width="140" />

        <!-- Cột Lead Score với Progress Bar -->
        <ElTableColumn prop="score" label="Lead Score" min-width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <span
                class="w-8 font-semibold"
                :class="getScoreTextColor(row.score)"
                >{{ row.score }}</span
              >
              <ElProgress
                class="flex-1"
                :percentage="row.score"
                :color="getScoreColor(row.score)"
                :show-text="false"
                :stroke-width="10"
              />
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="assignee" label="Sale phụ trách" min-width="150" />
        <ElTableColumn
          label="Thao tác"
          width="100"
          align="center"
          fixed="right"
        >
          <template #default>
            <ElButton link type="primary">Chi tiết</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import ArtStatsCard from "@/components/core/cards/art-stats-card/index.vue";
import ReportPageHeader from "./ReportPageHeader.vue";
import ReportPeriodSwitcher from "./ReportPeriodSwitcher.vue";

const currentPeriod = ref<"today" | "month" | "year" | "custom">("month");
const periodStart = ref(
  new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0],
);
const periodEnd = ref(new Date().toISOString().split("T")[0]);
const searchQuery = ref("");

// Refs cho ECharts
const funnelChartRef = ref<HTMLElement | null>(null);
const sourceChartRef = ref<HTMLElement | null>(null);
const histogramChartRef = ref<HTMLElement | null>(null);

let funnelChart: echarts.ECharts | null = null;
let sourceChart: echarts.ECharts | null = null;
let histogramChart: echarts.ECharts | null = null;

const chartTextColor = "#aeb0bd";
const chartAxisLineColor = "rgba(255, 255, 255, 0.16)";
const chartGridLineColor = "rgba(255, 255, 255, 0.1)";

const groupedFunnelData = {
  stages: [],
  website: [],
  facebook: [],
  showroom: [],
};

const sourceData = [];

const histogramData = [];

const leadsData = [];

const filteredLeads = computed(() => {
  if (!searchQuery.value) return leadsData;
  const q = searchQuery.value.toLowerCase();
  return leadsData.filter(
    (l) => l.name.toLowerCase().includes(q) || l.phone.includes(q),
  );
});

function getSourceType(source: string) {
  if (source === "Website") return "danger";
  if (source === "Showroom") return "success";
  if (source === "Facebook") return "primary";
  return "warning";
}

function getScoreColor(score: number) {
  if (score > 80) return "#ef4444"; // Đỏ rực
  if (score > 60) return "#f97316"; // Cam
  if (score > 30) return "#3b82f6"; // Xanh dương
  return "#9ca3af"; // Xám
}

function getScoreTextColor(score: number) {
  if (score > 80) return "text-red-500";
  if (score > 60) return "text-orange-500";
  if (score > 30) return "text-blue-500";
  return "text-gray-500";
}

function onPeriodChange() {
  // TODO: Fetch real data here
}

function renderCharts() {
  // 1. Bar Chart Nhóm: Phễu chuyển đổi theo kênh
  if (funnelChartRef.value) {
    if (!funnelChart) funnelChart = echarts.init(funnelChartRef.value);
    funnelChart.setOption({
      backgroundColor: "transparent",
      textStyle: { color: chartTextColor },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: {
        data: ["Website", "Facebook", "Showroom"],
        textStyle: { color: chartTextColor },
        top: 0,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "5%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: groupedFunnelData.stages,
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
          name: "Website",
          type: "bar",
          data: groupedFunnelData.website,
          itemStyle: { color: "#3b82f6", borderRadius: [4, 4, 0, 0] },
          barGap: "15%",
        },
        {
          name: "Facebook",
          type: "bar",
          data: groupedFunnelData.facebook,
          itemStyle: { color: "#a855f7", borderRadius: [4, 4, 0, 0] },
        },
        {
          name: "Showroom",
          type: "bar",
          data: groupedFunnelData.showroom,
          itemStyle: { color: "#f97316", borderRadius: [4, 4, 0, 0] },
        },
      ],
    });
  }

  // 2. Donut Chart: Nguồn khách hàng
  if (sourceChartRef.value) {
    if (!sourceChart) sourceChart = echarts.init(sourceChartRef.value);
    sourceChart.setOption({
      backgroundColor: "transparent",
      textStyle: { color: chartTextColor },
      tooltip: { trigger: "item", formatter: "{b}: {c}%" },
      legend: { top: 0, textStyle: { color: chartTextColor } },
      series: [
        {
          type: "pie",
          radius: ["40%", "65%"],
          center: ["50%", "55%"],
          data: sourceData,
          label: {
            formatter: "{b}: {c}%",
            color: chartTextColor,
          },
        },
      ],
      color: ["#ef4444", "#22c55e", "#3b82f6", "#eab308"],
    });
  }

  // 3. Histogram Chart: Phân bổ điểm Lead
  if (histogramChartRef.value) {
    if (!histogramChart) histogramChart = echarts.init(histogramChartRef.value);
    histogramChart.setOption({
      backgroundColor: "transparent",
      textStyle: { color: chartTextColor },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "5%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: histogramData.map((d) => d.group),
        axisLabel: { color: chartTextColor },
        axisLine: { lineStyle: { color: chartAxisLineColor } },
      },
      yAxis: {
        type: "value",
        name: "Số lượng Lead",
        nameTextStyle: { color: chartTextColor },
        axisLabel: { color: chartTextColor },
        splitLine: { lineStyle: { color: chartGridLineColor } },
      },
      series: [
        {
          type: "bar",
          data: histogramData.map((d, i) => {
            const colors = ["#9ca3af", "#3b82f6", "#f97316", "#ef4444"];
            return {
              value: d.count,
              itemStyle: { color: colors[i] },
            };
          }),
          barWidth: "40%",
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
      ],
    });
  }
}

function handleResize() {
  funnelChart?.resize();
  sourceChart?.resize();
  histogramChart?.resize();
}

onMounted(() => {
  setTimeout(() => {
    renderCharts();
  }, 100);
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  funnelChart?.dispose();
  sourceChart?.dispose();
  histogramChart?.dispose();
});
</script>

<style scoped>
/* Scoped styles nếu cần */
</style>
