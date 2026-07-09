<template>
  <div class="admin-dashboard">
    <div class="art-card">
      <!-- Header + period filter -->
      <div class="mb-6 flex justify-between items-center flex-wrap gap-3">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Kênh Doanh thu
        </h2>
        <div class="flex items-center gap-2 flex-wrap">
          <ElRadioGroup v-model="currentPeriod" size="small">
            <ElRadioButton value="today">Hôm nay</ElRadioButton>
            <ElRadioButton value="week">Tuần</ElRadioButton>
            <ElRadioButton value="month">Tháng</ElRadioButton>
            <ElRadioButton value="year">Năm</ElRadioButton>
          </ElRadioGroup>
          <ElDatePicker
            v-model="customRange"
            type="daterange"
            range-separator="-"
            start-placeholder="Từ ngày"
            end-placeholder="Đến ngày"
            size="small"
            value-format="YYYY-MM-DD"
            @change="onCustomRange"
            style="width: 220px"
          />
        </div>
      </div>

      <!-- KPI bar -->
      <ElRow :gutter="16" class="mb-6">
        <ElCol :span="6" v-for="kpi in kpis" :key="kpi.label">
          <div class="p-4 rounded-lg border-l-4" :class="kpi.borderClass">
            <div
              class="text-sm font-bold uppercase tracking-wider"
              :class="kpi.labelClass"
            >
              {{ kpi.label }}
            </div>
            <div class="text-2xl font-bold mt-1" :class="kpi.valueClass">
              {{ formatCurrency(kpi.value) }}
            </div>
            <div
              v-if="kpi.changePercent !== undefined"
              class="text-sm mt-1"
              :class="kpi.changeClass"
            >
              {{ kpi.changePercent >= 0 ? "▲" : "▼" }}
              {{ Math.abs(kpi.changePercent) }}% so với kỳ trước
            </div>
          </div>
        </ElCol>
      </ElRow>

      <!-- Chart visits + alert flags -->
      <ElRow :gutter="20" class="mb-5">
        <ElCol :span="16">
          <div class="art-card p-5">
            <h3 class="font-bold text-gray-800 dark:text-gray-100 mb-4">
              Lượt truy cập theo thời gian
            </h3>
            <div ref="visitsChartRef" class="h-64 w-full"></div>
            <div
              v-if="chartLoading"
              class="h-64 flex items-center justify-center text-gray-400"
            >
              Đang tải...
            </div>
          </div>
        </ElCol>
        <ElCol :span="8">
          <div class="art-card p-5">
            <h3 class="font-bold text-gray-800 dark:text-gray-100 mb-4">
              Cảnh báo
            </h3>
            <div v-if="alerts.length === 0" class="text-sm text-gray-400 mt-4">
              Không có cảnh báo
            </div>
            <div class="space-y-3 mt-2">
              <div
                v-for="alert in alerts"
                :key="alert.id"
                class="flex items-start gap-3 p-2 rounded"
                :class="alert.bgClass"
              >
                <i :class="alert.icon" class="text-lg mt-0.5"></i>
                <div>
                  <div class="text-sm font-medium" :class="alert.textClass">
                    {{ alert.title }}
                  </div>
                  <div class="text-xs mt-1" :class="alert.titleClass">
                    {{ alert.desc }}
                  </div>
                  <div class="text-xs text-gray-400 mt-1">{{ alert.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </ElCol>
      </ElRow>

      <!-- Channel table -->
      <div class="art-card p-5">
        <h3 class="font-bold text-gray-800 dark:text-gray-100 mb-4">
          Chi tiết theo kênh
        </h3>
        <ElTable :data="channelTableData" stripe>
          <ElTableColumn prop="name" label="Kênh" width="160" />
          <ElTableColumn
            prop="visits"
            label="Lượt truy cập"
            width="150"
            align="right"
          />
          <ElTableColumn
            prop="orders"
            label="Số đơn"
            width="130"
            align="right"
          />
          <ElTableColumn
            prop="amount"
            label="Doanh thu"
            width="180"
            align="right"
          />
          <ElTableColumn
            prop="changePercent"
            label="% thay đổi"
            width="140"
            align="right"
          >
            <template #default="scope">
              <span
                :class="
                  scope.row.changePercent >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                {{ scope.row.changePercent >= 0 ? "▲" : "▼" }}
                {{ Math.abs(scope.row.changePercent) }}%
              </span>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import * as echarts from "echarts";
import {
  ElRadioGroup,
  ElRadioButton,
  ElDatePicker,
  ElRow,
  ElCol,
  ElTable,
  ElTableColumn,
} from "element-plus";

defineOptions({ name: "AdminChannels" });

const currentPeriod = ref("month");
const customRange = ref<string[] | null>(null);
const chartLoading = ref(false);
const visitsChartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const kpis = ref([
  {
    label: "Doanh thu",
    value: 0,
    changePercent: 0,
    borderClass: "border-blue-500",
    labelClass: "text-gray-500",
    valueClass: "text-gray-800 dark:text-gray-100",
    changeClass: "text-green-600",
  },
  {
    label: "Lợi nhuận",
    value: 0,
    changePercent: 0,
    borderClass: "border-green-500",
    labelClass: "text-gray-500",
    valueClass: "text-gray-800 dark:text-gray-100",
    changeClass: "text-green-600",
  },
  {
    label: "Kênh chính",
    value: 0,
    borderClass: "border-orange-500",
    labelClass: "text-gray-500",
    valueClass: "text-gray-800 dark:text-gray-100",
  },
  {
    label: "Cảnh báo",
    value: 3,
    borderClass: "border-red-500",
    labelClass: "text-gray-500",
    valueClass: "text-red-600",
  },
]);

const alerts = ref([
  {
    id: 1,
    title: "Doanh thu thấp hơn 50%",
    desc: "Kênh Online giảm 52% so với tháng trước",
    time: "2 phút trước",
    icon: "ri-alert-fill text-red-500",
    bgClass: "bg-red-50 dark:bg-red-900/10",
    textClass: "text-red-600",
    titleClass: "text-red-600",
  },
  {
    id: 2,
    title: "Hoàn tiền bất thường",
    desc: "3 đơn hoàn > 5tr trong 24h qua",
    time: "15 phút trước",
    icon: "ri-error-warning-fill text-yellow-500",
    bgClass: "bg-yellow-50 dark:bg-yellow-900/10",
    textClass: "text-yellow-600",
    titleClass: "text-yellow-600",
  },
  {
    id: 3,
    title: "Tồn kho gần hết",
    desc: "5 biến thể xe báo số lượng <= 2",
    time: "1 giờ trước",
    icon: "ri-inbox-fill text-orange-500",
    bgClass: "bg-orange-50 dark:bg-orange-900/10",
    textClass: "text-orange-600",
    titleClass: "text-orange-600",
  },
]);

const channelTableData = ref([
  {
    name: "Online (Website/App)",
    visits: 12400,
    orders: 320,
    amount: 4800000000,
    changePercent: 12,
  },
  {
    name: "Offline (showroom)",
    visits: 8900,
    orders: 210,
    amount: 3900000000,
    changePercent: -3,
  },
  {
    name: "Sàn TMĐT",
    visits: 21000,
    orders: 580,
    amount: 8200000000,
    changePercent: 28,
  },
  {
    name: "Đối tác/NCC",
    visits: 3200,
    orders: 95,
    amount: 1200000000,
    changePercent: 5,
  },
]);

function getDateRange(): { start: string; end: string } {
  if (
    currentPeriod.value === "custom" &&
    customRange.value &&
    customRange.value.length === 2
  ) {
    return { start: customRange.value[0], end: customRange.value[1] };
  }
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  let from: string;
  switch (currentPeriod.value) {
    case "today":
      from = to;
      break;
    case "week":
      from = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
      break;
    case "month":
      from = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
      break;
    case "year":
      from = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
      break;
    default:
      from = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
  }
  return { start: from, end: to };
}

function formatCurrency(value: number) {
  if (!value && value !== 0) return "-";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function setPeriod(p: string) {
  currentPeriod.value = p;
  load();
}

function onCustomRange() {
  if (!customRange.value) return;
  currentPeriod.value = "custom";
  load();
}

function buildVisitSeries(days: number) {
  const labels: string[] = [];
  const onlineData: number[] = [];
  const offlineData: number[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    onlineData.push(Math.floor(300 + Math.random() * 400));
    offlineData.push(Math.floor(200 + Math.random() * 250));
  }
  return { labels, onlineData, offlineData };
}

function renderVisitsChart() {
  if (!visitsChartRef.value) return;
  if (!chartInstance) chartInstance = echarts.init(visitsChartRef.value);
  const days =
    currentPeriod.value === "year"
      ? 30
      : currentPeriod.value === "month"
        ? 30
        : currentPeriod.value === "week"
          ? 7
          : 1;
  const { labels, onlineData, offlineData } = buildVisitSeries(days);
  chartInstance.setOption({
    tooltip: { trigger: "axis" },
    legend: { data: ["Online", "Offline"], bottom: 0 },
    grid: { left: 10, right: 10, bottom: 40, top: 10, containLabel: true },
    xAxis: { type: "category", data: labels },
    yAxis: { type: "value", name: "lượt" },
    series: [
      {
        name: "Online",
        type: "line",
        smooth: true,
        data: onlineData,
        itemStyle: { color: "#2563eb" },
      },
      {
        name: "Offline",
        type: "line",
        smooth: true,
        data: offlineData,
        itemStyle: { color: "#67c23a" },
      },
    ],
  });
}

async function load() {
  chartLoading.value = true;
  const { start, end } = getDateRange();
  try {
    // TODO: Thay bằng API thật khi có endpoint tương ứng
    // const data = await fetchVisitStats(start, end)
    // kpis.value = data.kpis
    // channelTableData.value = data.channels
    // alerts.value = data.alerts

    renderVisitsChart();
  } catch {
    // noop
  } finally {
    chartLoading.value = false;
  }
}

onMounted(() => {
  load();
  const onResize = () => chartInstance?.resize();
  window.addEventListener("resize", onResize);
});
</script>

<style scoped>
.admin-dashboard {
  min-height: 100%;
}
</style>
