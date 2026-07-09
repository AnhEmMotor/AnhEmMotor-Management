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
    <div v-if="loading" class="reporting-kpi-grid">
      <ArtStatsCard
        title="Tổng lead mới"
        count="..."
        description="Đang tải..."
        icon="ri:user-add-line"
        icon-style="bg-report-blue"
        :loading="true"
      />
      <ArtStatsCard
        title="Tỷ lệ chuyển đổi"
        count="..."
        description="Đang tải..."
        icon="ri:filter-3-line"
        icon-style="bg-report-orange"
        :loading="true"
      />
      <ArtStatsCard
        title="Khách hàng mới"
        count="..."
        description="Đang tải..."
        icon="ri:user-star-line"
        icon-style="bg-report-green"
        :loading="true"
      />
      <ArtStatsCard
        title="Lead nóng"
        count="..."
        description="Đang tải..."
        icon="ri:fire-line"
        icon-style="bg-report-red"
        :loading="true"
      />
    </div>
    <div v-else class="reporting-kpi-grid">
      <ArtStatsCard
        title="Tổng lead mới"
        :count="kpi.totalLeads"
        :description="`Tổng lead trong kỳ`"
        icon="ri:user-add-line"
        icon-style="bg-report-blue"
      />
      <ArtStatsCard
        title="Tỷ lệ chuyển đổi"
        :count="`${conversionRate}%`"
        :description="`Lead đã chuyển đổi`"
        icon="ri:filter-3-line"
        icon-style="bg-report-orange"
      />
      <ArtStatsCard
        title="Khách hàng mới"
        :count="kpi.newCustomers"
        :description="`Khách hàng lần đầu`"
        icon="ri:user-star-line"
        icon-style="bg-report-green"
      />
      <ArtStatsCard
        title="Lead nóng"
        :count="kpi.hotLeads"
        description="Lead score >= 80"
        icon="ri:fire-line"
        icon-style="bg-report-red"
      />
    </div>

    <!-- TẦNG 2: CẶP BIỂU ĐỒ TRUNG TÂM -->
    <div class="reporting-section-grid two-columns mt-4">
      <ElCard class="reporting-card">
        <template #header>Phễu chuyển đổi theo kênh</template>
        <div ref="sourceChartRef" class="reporting-chart"></div>
      </ElCard>
      <ElCard class="reporting-card">
        <template #header>Phân bổ nguồn khách hàng</template>
        <div ref="funnelChartRef" class="reporting-chart"></div>
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
        v-loading="loading"
        :data="filteredLeads"
        class="reporting-table"
        empty-text="Không tìm thấy khách hàng"
      >
        <ElTableColumn prop="name" label="Tên khách hàng" min-width="150">
          <template #default="{ row }">
            <div class="font-medium">{{ row.customerName }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="phone" label="Số điện thoại" min-width="130" />
        <ElTableColumn prop="source" label="Nguồn" min-width="120">
          <template #default="{ row }">
            <ElTag :type="getSourceType(row.source)" effect="light" round>
              {{ row.source }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="Trạng thái" min-width="140" />
        <ElTableColumn prop="score" label="Lead Score" min-width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <span
                class="w-8 font-semibold"
                :class="getScoreTextColor(row.leadScore)"
                >{{ row.leadScore }}</span
              >
              <ElProgress
                class="flex-1"
                :percentage="row.leadScore"
                :color="getScoreColor(row.leadScore)"
                :show-text="false"
                :stroke-width="10"
              />
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="lastContact"
          label="Liên hệ gần nhất"
          min-width="160"
        />
        <ElTableColumn
          label="Thao tác"
          width="100"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <ElButton link type="primary" @click="handleViewDetail(row)">
              Chi tiết
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";
import ArtStatsCard from "@/components/core/cards/art-stats-card/index.vue";
import { fetchCustomerAnalytics } from "@/api/operations";
import ReportPageHeader from "./ReportPageHeader.vue";
import ReportPeriodSwitcher from "./ReportPeriodSwitcher.vue";

const funnelChartRef = ref<HTMLElement | null>(null);
const sourceChartRef = ref<HTMLElement | null>(null);
const histogramChartRef = ref<HTMLElement | null>(null);
const searchQuery = ref("");
const loading = ref(false);
const currentPeriod = ref<"today" | "month" | "year" | "custom">("month");
const periodStart = ref("");
const periodEnd = ref("");

const kpi = ref({ totalLeads: 0, newCustomers: 0, hotLeads: 0 });
const leads = ref<
  Array<{
    id: number;
    customerName: string;
    source: string;
    leadScore: number;
    status: string;
    lastContact: string;
  }>
>([]);

const conversionRate = computed(() => {
  if (kpi.value.totalLeads === 0) return 0;
  const converted = leads.value.filter(
    (l) => l.status === "Đã chuyển đổi",
  ).length;
  return ((converted / kpi.value.totalLeads) * 100).toFixed(1);
});

const filteredLeads = computed(() => {
  if (!searchQuery.value) return leads.value;
  const q = searchQuery.value.toLowerCase();
  return leads.value.filter((l) => l.customerName.toLowerCase().includes(q));
});

function getSourceType(source: string) {
  const map: Record<string, string> = {
    Website: "danger",
    Showroom: "success",
    Facebook: "primary",
  };
  return map[source] || "warning";
}

function getScoreColor(score: number) {
  if (score > 80) return "#ef4444";
  if (score > 60) return "#f97316";
  if (score > 30) return "#3b82f6";
  return "#9ca3af";
}

function getScoreTextColor(score: number) {
  if (score > 80) return "text-red-500";
  if (score > 60) return "text-orange-500";
  if (score > 30) return "text-blue-500";
  return "text-gray-500";
}

const chartTextColor = "#aeb0bd";
const chartAxisLineColor = "rgba(255, 255, 255, 0.16)";
const chartGridLineColor = "rgba(255, 255, 255, 0.1)";

let funnelChart: echarts.ECharts | null = null;
let sourceChart: echarts.ECharts | null = null;
let histogramChart: echarts.ECharts | null = null;

function onPeriodChange() {
  loadData();
}

function renderCharts() {
  // 1. Funnel: Phân bổ điểm Lead (bar chart theo score range)
  if (funnelChartRef.value) {
    if (!funnelChart) funnelChart = echarts.init(funnelChartRef.value);
    const scoreBuckets = [
      { label: "0-30", min: 0, max: 30 },
      { label: "31-60", min: 31, max: 60 },
      { label: "61-80", min: 61, max: 80 },
      { label: "81-100", min: 81, max: 100 },
    ];
    const bucketCounts = scoreBuckets.map(
      (b) =>
        leads.value.filter((l) => l.leadScore >= b.min && l.leadScore <= b.max)
          .length,
    );
    const bucketColors = ["#9ca3af", "#3b82f6", "#f97316", "#ef4444"];
    funnelChart.setOption({
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
        data: scoreBuckets.map((b) => b.label),
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
          data: bucketCounts.map((v, i) => ({
            value: v,
            itemStyle: { color: bucketColors[i], borderRadius: [4, 4, 0, 0] },
          })),
          barWidth: "45%",
        },
      ],
    });
  }

  // 2. Donut Chart: Nguồn khách hàng
  if (sourceChartRef.value) {
    if (!sourceChart) sourceChart = echarts.init(sourceChartRef.value);
    const sourceMap = new Map<string, number>();
    leads.value.forEach((l) => {
      const s = l.source || "Khác";
      sourceMap.set(s, (sourceMap.get(s) || 0) + 1);
    });
    const pieData = Array.from(sourceMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
    const pieColors = ["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7"];
    sourceChart.setOption({
      backgroundColor: "transparent",
      textStyle: { color: chartTextColor },
      tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
      legend: { top: 0, textStyle: { color: chartTextColor } },
      series: [
        {
          type: "pie",
          radius: ["40%", "65%"],
          center: ["50%", "55%"],
          data: pieData,
          label: { formatter: "{b}: {c}", color: chartTextColor },
        },
      ],
      color: pieColors,
    });
  }

  // 3. Histogram Chart: Phân bổ nguồn theo trạng thái (stacked bar)
  if (histogramChartRef.value) {
    if (!histogramChart) histogramChart = echarts.init(histogramChartRef.value);
    const sources = Array.from(
      new Set(leads.value.map((l) => l.source || "Khác")),
    );
    const statuses = Array.from(new Set(leads.value.map((l) => l.status)));
    const seriesData = sources.map((src) => {
      return {
        name: src,
        type: "bar",
        stack: "status",
        data: statuses.map(
          (st) =>
            leads.value.filter(
              (l) => (l.source || "Khác") === src && l.status === st,
            ).length,
        ),
      };
    });
    histogramChart.setOption({
      backgroundColor: "transparent",
      textStyle: { color: chartTextColor },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: {
        data: statuses,
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
        data: statuses,
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
      series: seriesData,
      color: ["#3b82f6", "#a855f7", "#f97316", "#ef4444", "#22c55e", "#eab308"],
    });
  }
}

function handleResize() {
  funnelChart?.resize();
  sourceChart?.resize();
  histogramChart?.resize();
}

async function loadData() {
  loading.value = true;
  try {
    const res = await fetchCustomerAnalytics();
    kpi.value = {
      totalLeads: res.kpi?.totalLeads ?? 0,
      newCustomers: res.kpi?.newCustomers ?? 0,
      hotLeads: res.kpi?.hotLeads ?? 0,
    };
    leads.value = (res.leads ?? []).map((l) => ({
      id: l.id,
      customerName: l.customerName,
      source: l.source,
      leadScore: l.leadScore,
      status: l.status,
      lastContact: l.lastContact,
    }));
  } catch (e: any) {
    ElMessage.error(e?.message || "Không thể tải dữ liệu khách hàng");
  } finally {
    loading.value = false;
  }
}

function handleViewDetail(row: { id: number }) {
  // navigate to lead detail page or open dialog
  console.log("Detail lead:", row.id);
}

onMounted(async () => {
  await loadData();
  setTimeout(renderCharts, 100);
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
/* kept minimal to match project style */
</style>
