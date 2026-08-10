<template>
  <div>
    <div class="user">
      <div class="resp-page admin-dashboard">
        <div class="art-card">
          <div class="mb-6 flex justify-between items-center flex-wrap gap-4">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">🛒 Kênh Doanh thu</h2>
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-sm text-gray-500">
                <b>{{ formatDate(dateRange[0] ?? '') }}</b> đến
                <b>{{ formatDate(dateRange[dateRange.length - 1] ?? '') }}</b>
              </span>
              <ElRadioGroup v-model="timeRange" size="small" @change="load">
                <ElRadioButton value="Week">Tuần</ElRadioButton>
                <ElRadioButton value="1Month">Tháng</ElRadioButton>
                <ElRadioButton value="Year">Năm</ElRadioButton>
              </ElRadioGroup>
              <ElDatePicker
                v-model="dateRange"
                type="daterange"
                range-separator=" đến "
                start-placeholder="Từ ngày"
                end-placeholder="Đến ngày"
                size="small"
                value-format="YYYY-MM-DD"
                :disabled-date="isFuture"
                @change="load"
                style="width: 240px"
              />
              <ElButton size="small" @click="reset">Mặc định</ElButton>
            </div>
          </div>

          <CardList :time-filter="timeRange" :date-range="dateRange" />

          <ElRow :gutter="20" class="my-5">
            <ElCol :xs="24" :sm="24" :md="12">
              <div class="art-card p-5">
                <h3 class="font-bold text-gray-800 dark:text-gray-100 mb-4">
                  Truy cập & doanh thu theo thời gian
                </h3>
                <div ref="lineChartRef" class="h-64 w-full"></div>
                <div
                  v-if="chartLoading"
                  class="h-64 flex items-center justify-center text-gray-400"
                >
                  Đang tải...
                </div>
              </div>
            </ElCol>
            <ElCol :xs="24" :sm="24" :md="12">
              <div class="art-card p-5">
                <h3 class="font-bold text-gray-800 dark:text-gray-100 mb-4">Doanh thu theo kênh</h3>
                <div ref="barChartRef" class="h-64 w-full"></div>
                <div
                  v-if="chartLoading"
                  class="h-64 flex items-center justify-center text-gray-400"
                >
                  Đang tải...
                </div>
              </div>
            </ElCol>
          </ElRow>

          <div class="art-card !mt-0">
            <h3 class="font-bold text-gray-800 dark:text-gray-100 mb-4">Chi tiết theo kênh</h3>
            <ElTable :data="paginatedTableData" stripe class="w-full">
              <ElTableColumn prop="name" label="Kênh" min-width="150" />
              <ElTableColumn prop="visits" label="Lượt truy cập" min-width="130" align="right" />
              <ElTableColumn prop="orders" label="Số đơn" min-width="110" align="right" />
              <ElTableColumn
                prop="conversionRate"
                label="Tỉ lệ chuyển đổi"
                min-width="140"
                align="right"
              >
                <template #default="scope">
                  <span class="font-medium text-gray-700">{{
                    formatPercent(scope.row.conversionRate)
                  }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="amount" label="Doanh thu" min-width="150" align="right">
                <template #default="scope">
                  <span class="font-bold text-blue-600">{{
                    formatCurrency(scope.row.amount)
                  }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn
                prop="changePercent"
                label="Xu hướng (Tăng trưởng)"
                min-width="180"
                align="right"
              >
                <template #default="scope">
                  <ElTag
                    :type="scope.row.changePercent >= 0 ? 'success' : 'danger'"
                    effect="light"
                    round
                    size="small"
                  >
                    <i
                      :class="
                        scope.row.changePercent >= 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line'
                      "
                    ></i>
                    {{ Math.abs(scope.row.changePercent).toFixed(1) }}%
                  </ElTag>
                </template>
              </ElTableColumn>
            </ElTable>

            <div class="flex justify-end mt-4">
              <ElPagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50]"
                :total="tableData.length"
                layout="total, sizes, prev, pager, next, jumper"
                background
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import {
  ElRadioGroup,
  ElRadioButton,
  ElDatePicker,
  ElRow,
  ElCol,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElTag,
} from 'element-plus';
import { computed } from 'vue';
import CardList from './card-list.vue';
import { fetchDailyCategoryRevenue } from '@/api/dashboard.api';
import { AnalyticsService } from '@/services/analytics.service';
import type {
  DashboardSummary,
  DailyCategoryRevenueRow,
  RevenueByCategoryItem,
} from '@/services/analytics.types';

defineOptions({ name: 'RevenueChannels' });

const breadcrumb = ref([
  { title: 'Trang chủ', to: '/' },
  {
    title: 'Tổng quan',
    to: '/admin/dashboard/console',
    icon: 'ri-pie-chart-line',
  },
  { title: 'Kênh Doanh thu', to: '/admin/dashboard/analysis' },
]);

const timeRange = ref<'Week' | '1Month' | 'Year'>('1Month');
const dateRange = ref<string[]>([]);
const chartLoading = ref(false);
const tableData = ref<any[]>([]);
const lineChartRef = ref<HTMLElement | null>(null);
const barChartRef = ref<HTMLElement | null>(null);
let lineChart: echarts.ECharts | null = null;
let barChart: echarts.ECharts | null = null;
let lineResize: (() => void) | null = null;

const currentPage = ref(1);
const pageSize = ref(10);

const paginatedTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return tableData.value.slice(start, start + pageSize.value);
});

const isFuture = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
};

function defaultRange() {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  dateRange.value = [from, to];
  return { from, to };
}

function formatCurrency(value: number) {
  if (!value && value !== 0) return '-';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  if (!value && value !== 0) return '-';
  return `${value.toFixed(1)}%`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function mapSummary(s: DashboardSummary) {
  return [
    {
      label: 'Doanh thu thực tế',
      value: s.totalRevenue ?? 0,
      change: safe(s.revenueChangePercentage ?? 0),
      positive: (s.revenueChangePercentage ?? 0) >= 0,
      color: '#2563eb',
    },
    {
      label: 'Lợi nhuận ròng',
      value: s.netProfit ?? 0,
      change: safe(s.profitVsYesterdayPercentage ?? 0),
      positive: (s.profitVsYesterdayPercentage ?? 0) >= 0,
      color: '#16a34a',
    },
    {
      label: 'Tiền đang treo',
      value: s.pendingAmount ?? 0,
      color: '#f59e0b',
    },
    {
      label: 'Cần xử lý',
      value:
        (Number(s.newComplaintsCount) || 0) +
        (Number(s.lowStockVehiclesCount) || 0) +
        (Number(s.delayedLoansCount) || 0),
      color: '#ef4444',
    },
  ];
}

function safe(v: any, fb = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
}

async function loadCharts() {
  if (!lineChartRef.value || !barChartRef.value) return;
  if (!lineChart) lineChart = echarts.init(lineChartRef.value);
  if (!barChart) barChart = echarts.init(barChartRef.value);

  let days = 30;
  if (timeRange.value === 'Week') days = 7;
  if (timeRange.value === 'Year') days = 30;

  try {
    const daily = await fetchDailyCategoryRevenue(days);

    const rawByDay = daily.reduce<Record<string, DailyCategoryRevenueRow[]>>((acc, cur) => {
      const day = cur.reportDay ?? '';
      if (!acc[day]) acc[day] = [];
      acc[day].push(cur);
      return acc;
    }, {});
    const dayKeys = Object.keys(rawByDay).sort();
    const categories = Array.from(new Set(daily.map((d) => d.categoryName))).filter(Boolean);
    const palette = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    const dailyTotal = dayKeys.map((day) =>
      rawByDay[day].reduce((s, d) => s + (d.revenue ?? 0), 0)
    );

    lineChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: {
        data: categories,
        bottom: 0,
        textStyle: { color: '#4b5563', fontSize: 13, fontWeight: 'bold' },
      },
      grid: { left: 10, right: 10, bottom: 40, top: 10, containLabel: true },
      xAxis: {
        type: 'category',
        data: dayKeys,
        axisLabel: { color: '#4b5563', fontSize: 12, fontWeight: 500 },
      },
      yAxis: {
        type: 'value',
        name: 'VNĐ',
        axisLabel: { color: '#4b5563', fontSize: 12, fontWeight: 500 },
        nameTextStyle: { fontSize: 12, fontWeight: 'bold' },
      },
      series: [
        {
          name: 'Doanh thu',
          type: 'line',
          smooth: true,
          data: dailyTotal,
          itemStyle: { color: '#2563eb' },
          lineStyle: { width: 3 },
          symbolSize: 6,
          emphasis: { focus: 'series' },
        },
      ],
      color: palette,
    });

    barChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 10, right: 10, bottom: 20, top: 10, containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          rotate: 20,
          color: '#4b5563',
          fontSize: 12,
          fontWeight: 500,
        },
      },
      yAxis: {
        type: 'value',
        name: 'VNĐ',
        axisLabel: { color: '#4b5563', fontSize: 12, fontWeight: 500 },
        nameTextStyle: { fontSize: 12, fontWeight: 'bold' },
      },
      series: [
        {
          type: 'bar',
          data: categories.map((cat, idx) => ({
            value: dayKeys.reduce(
              (s, d) => s + (rawByDay[d].find((x) => x.categoryName === cat)?.revenue ?? 0),
              0
            ),
            itemStyle: {
              color: palette[idx % palette.length],
              borderRadius: [4, 4, 0, 0],
            },
          })),
          emphasis: { focus: 'series' },
          barMaxWidth: 50,
        },
      ],
    });
  } catch {
  }
}

async function loadTable() {
  if (!dateRange.value || dateRange.value.length < 2) return;
  const [start, end] = dateRange.value;
  try {
    const raw = await AnalyticsService.getDashboardSummary(start, end);
    if (raw?.channelData && Array.isArray(raw.channelData)) tableData.value = raw.channelData;
    else tableData.value = [];
  } catch {
    tableData.value = [];
  }
}

async function load() {
  chartLoading.value = true;
  try {
    await Promise.all([loadCharts(), loadTable()]);
  } finally {
    chartLoading.value = false;
  }
}

function reset() {
  timeRange.value = '1Month';
  defaultRange();
  load();
}

onMounted(() => {
  const r = defaultRange();
  load();

  lineResize = () => {
    lineChart?.resize();
    barChart?.resize();
  };
  window.addEventListener('resize', lineResize);
});

onUnmounted(() => {
  lineChart?.dispose();
  barChart?.dispose();
  if (lineResize) window.removeEventListener('resize', lineResize);
});
</script>

<style scoped>
.admin-dashboard {
  min-height: 100%;
}
</style>
