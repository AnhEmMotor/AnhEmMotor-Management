<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import * as echarts from 'echarts';
import {
  getGa4OverviewApi,
  getGa4DailyApi,
  getGa4SourcesApi,
  getGa4PagesApi,
  getGa4DevicesApi,
  type Ga4Overview,
  type Ga4DimensionRow,
} from '@/api/marketing/ga4';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const range = ref<[Date, Date]>([new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), new Date()]);

const overview = ref<Ga4Overview | null>(null);
const dailyRows = ref<Ga4DimensionRow[]>([]);
const sourceRows = ref<Ga4DimensionRow[]>([]);
const pageRows = ref<Ga4DimensionRow[]>([]);
const deviceRows = ref<Ga4DimensionRow[]>([]);

const trendChartEl = ref<HTMLDivElement>();
const deviceChartEl = ref<HTMLDivElement>();
let trendChart: echarts.ECharts | null = null;
let deviceChart: echarts.ECharts | null = null;

const disabledDate = (time: Date) => time.getTime() > Date.now();

const statCards = computed(() => [
  { label: 'Phiên truy cập', value: fmt(overview.value?.sessions), color: '#409eff' },
  { label: 'Người dùng', value: fmt(overview.value?.totalUsers), color: '#67c23a' },
  { label: 'Người dùng mới', value: fmt(overview.value?.newUsers), color: '#e6a23c' },
  { label: 'Lượt xem trang', value: fmt(overview.value?.screenPageViews), color: '#f56c6c' },
  {
    label: 'Tỷ lệ tương tác',
    value: `${Math.round((overview.value?.engagementRate ?? 0) * 100)}%`,
    color: '#9c27b0',
  },
  {
    label: 'Thời lượng phiên TB',
    value: `${Math.round(overview.value?.averageSessionDuration ?? 0)}s`,
    color: '#00bcd4',
  },
  { label: 'Sự kiện chuyển đổi', value: fmt(overview.value?.keyEvents), color: '#795548' },
  { label: 'Người dùng hoạt động', value: fmt(overview.value?.activeUsers), color: '#607d8b' },
]);

function fmt(value?: number): string {
  return (value ?? 0).toLocaleString('vi-VN');
}

function renderTrendChart() {
  if (!trendChartEl.value) return;
  trendChart ||= echarts.init(trendChartEl.value);
  const sorted = [...dailyRows.value].sort((a, b) => a.label.localeCompare(b.label));
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Phiên truy cập', 'Người dùng'] },
    grid: { left: 48, right: 24, top: 40, bottom: 32 },
    xAxis: { type: 'category', data: sorted.map((r) => r.label.slice(5)) },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: 'Phiên truy cập',
        type: 'line',
        smooth: true,
        data: sorted.map((r) => r.sessions),
        showSymbol: false,
      },
      {
        name: 'Người dùng',
        type: 'line',
        smooth: true,
        data: sorted.map((r) => r.totalUsers),
        showSymbol: false,
      },
    ],
  });
}

function renderDeviceChart() {
  if (!deviceChartEl.value) return;
  deviceChart ||= echarts.init(deviceChartEl.value);
  deviceChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        name: 'Thiết bị',
        type: 'pie',
        radius: ['38%', '62%'],
        center: ['50%', '44%'],
        data: deviceRows.value.map((r) => ({ name: r.label || 'Khác', value: r.sessions })),
      },
    ],
  });
}

async function fetchData() {
  loading.value = true;
  try {
    const [from, to] = range.value;
    const [overviewRes, dailyRes, sourcesRes, pagesRes, devicesRes] = await Promise.all([
      getGa4OverviewApi(from, to),
      getGa4DailyApi(from, to),
      getGa4SourcesApi(from, to, 10),
      getGa4PagesApi(from, to, 10),
      getGa4DevicesApi(from, to),
    ]);
    overview.value = overviewRes;
    dailyRows.value = dailyRes?.rows ?? [];
    sourceRows.value = sourcesRes?.rows ?? [];
    pageRows.value = pagesRes?.rows ?? [];
    deviceRows.value = devicesRes?.rows ?? [];
    renderTrendChart();
    renderDeviceChart();
  } catch {
    ElMessage.error('Không tải được chỉ số Google Analytics. Kiểm tra cấu hình GA4 trên Backend.');
  } finally {
    loading.value = false;
  }
}

const handleResize = () => {
  trendChart?.resize();
  deviceChart?.resize();
};

onMounted(() => {
  fetchData();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  trendChart?.dispose();
  deviceChart?.dispose();
});
</script>

<template>
  <div class="resp-page">
    <div class="page-header mb-4 flex justify-between items-center flex-wrap gap-2">
      <h2 class="text-lg font-semibold">Google Analytics</h2>
      <div class="flex items-center gap-2">
        <el-date-picker
          v-model="range"
          type="daterange"
          size="default"
          start-placeholder="Từ ngày"
          end-placeholder="Đến ngày"
          :disabled-date="disabledDate"
          :clearable="false"
        />
        <el-button type="primary" :loading="loading" @click="fetchData">Làm mới</el-button>
      </div>
    </div>

    <el-card shadow="never" class="mb-4" v-loading="loading">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="card in statCards" :key="card.label" class="p-4 border rounded-lg text-center">
          <p class="text-sm text-gray-500">{{ card.label }}</p>
          <p class="text-2xl font-bold mt-1" :style="{ color: card.color }">{{ card.value }}</p>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="mb-4" v-loading="loading">
      <template #header><span class="font-medium">Truy cập theo ngày</span></template>
      <div ref="trendChartEl" class="w-full h-72" />
    </el-card>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <el-card shadow="never" v-loading="loading">
        <template #header><span class="font-medium">Nguồn truy cập hàng đầu</span></template>
        <el-table :data="sourceRows" size="small" height="320">
          <el-table-column prop="label" label="Nguồn" min-width="140" />
          <el-table-column prop="sessions" label="Phiên" width="90" sortable />
          <el-table-column prop="totalUsers" label="Người dùng" width="110" sortable />
          <el-table-column prop="keyEvents" label="Chuyển đổi" width="105" sortable />
        </el-table>
      </el-card>

      <el-card shadow="never" v-loading="loading">
        <template #header><span class="font-medium">Trang được xem nhiều nhất</span></template>
        <el-table :data="pageRows" size="small" height="320">
          <el-table-column prop="label" label="Trang" min-width="160" show-overflow-tooltip />
          <el-table-column prop="screenPageViews" label="Lượt xem" width="100" sortable />
          <el-table-column prop="sessions" label="Phiên" width="90" sortable />
        </el-table>
      </el-card>

      <el-card shadow="never" v-loading="loading">
        <template #header><span class="font-medium">Thiết bị</span></template>
        <div ref="deviceChartEl" class="w-full h-80" />
      </el-card>

      <el-card shadow="never" v-loading="loading">
        <template #header><span class="font-medium">Chi tiết theo thiết bị</span></template>
        <el-table :data="deviceRows" size="small" height="320">
          <el-table-column prop="label" label="Thiết bị" min-width="120" />
          <el-table-column prop="sessions" label="Phiên" width="90" sortable />
          <el-table-column prop="newUsers" label="Mới" width="80" sortable />
          <el-table-column label="Tương tác" width="100">
            <template #default="{ row }">{{ Math.round(row.engagementRate * 100) }}%</template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.resp-page {
  padding: 20px;
}
</style>
