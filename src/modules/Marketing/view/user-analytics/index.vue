<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  onActivated,
  onDeactivated,
  nextTick,
  type Ref,
} from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import { ElMessage } from 'element-plus';
import {
  getGa4OverviewApi,
  getGa4DailyApi,
  getGa4PageTitlesApi,
  getGa4OperatingSystemsApi,
  getGa4BrowsersApi,
  getGa4DevicesApi,
  getGa4RealtimeApi,
  type Ga4Overview,
  type Ga4DimensionRow,
  type Ga4Realtime,
} from '@/api/marketing/ga4';
import { getVisitorTrackingApi } from '@/api/marketing/visitorTracking';
import { fetchGetUserById } from '@/api/auth/system-manage.api';

interface VisitorRecord {
  customerUserId: string | null;
  visitorKey: string | null;
  productId: number;
  productName: string;
  dwellTimeMs: number;
  viewedAt: string;
  customerName?: string;
  productImageUrl?: string;
  variantId?: number;
  variantName?: string;
  variantColorId?: number;
  variantColorName?: string;
}

const RANGE_OPTIONS = [
  { label: 'Hôm nay', value: 'today', days: 0 },
  { label: '7 ngày trước', value: '7d', days: 6 },
  { label: '30 ngày trước', value: '30d', days: 29 },
];
const rangeKey = ref('30d');

const loading = ref(false);
const realtimeLoading = ref(false);
const overview = ref<Ga4Overview | null>(null);
const dailyRows = ref<Ga4DimensionRow[]>([]);
const pageTitleRows = ref<Ga4DimensionRow[]>([]);
const osRows = ref<Ga4DimensionRow[]>([]);
const browserRows = ref<Ga4DimensionRow[]>([]);
const deviceRows = ref<Ga4DimensionRow[]>([]);
const realtime = ref<Ga4Realtime | null>(null);

const PALETTE = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#14b8a6',
  '#f97316',
  '#6366f1',
];
const SERIES_COLORS = { users: '#3b82f6', newUsers: '#f59e0b', views: '#10b981' };

const statCards = computed(() => [
  {
    label: 'Người dùng',
    value: fmt(overview.value?.totalUsers),
    icon: 'ri:user-line',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
  },
  {
    label: 'Người dùng mới',
    value: fmt(overview.value?.newUsers),
    icon: 'ri:user-add-line',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
  },
  {
    label: 'Số lần xem',
    value: fmt(overview.value?.screenPageViews),
    icon: 'ri:eye-line',
    gradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
  },
]);

const maxTitleViews = computed(() =>
  Math.max(1, ...pageTitleRows.value.map((r) => r.screenPageViews))
);

function fmt(value?: number): string {
  return (value ?? 0).toLocaleString('vi-VN');
}

function getRangeDates(): [Date, Date] {
  const days = RANGE_OPTIONS.find((o) => o.value === rangeKey.value)?.days ?? 29;
  const to = new Date();
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return [from, to];
}

function getRangeIso(): { from?: string; to?: string } {
  const [from, to] = getRangeDates();
  return {
    from: dayjs(from).startOf('day').format('YYYY-MM-DDTHH:mm:ss') + '+07:00',
    to: dayjs(to).endOf('day').format('YYYY-MM-DDTHH:mm:ss') + '+07:00',
  };
}

const trendEl = ref<HTMLDivElement>();
const osEl = ref<HTMLDivElement>();
const browserEl = ref<HTMLDivElement>();
const deviceEl = ref<HTMLDivElement>();
const rtMinuteEl = ref<HTMLDivElement>();
const rtDeviceEl = ref<HTMLDivElement>();

const charts = new Map<string, echarts.ECharts>();
const chartEls: Record<string, Ref<HTMLDivElement | undefined>> = {
  trend: trendEl,
  os: osEl,
  browser: browserEl,
  device: deviceEl,
  rtMinute: rtMinuteEl,
  rtDevice: rtDeviceEl,
};

function getChart(key: string): echarts.ECharts | null {
  const el = chartEls[key]?.value;
  if (!el) return null;
  if (!charts.has(key)) charts.set(key, echarts.init(el));
  return charts.get(key) ?? null;
}

function renderTrendChart() {
  const chart = getChart('trend');
  if (!chart) return;
  const sorted = [...dailyRows.value].sort((a, b) => a.label.localeCompare(b.label));
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Người dùng', 'Người dùng mới', 'Số lần xem'], bottom: 0 },
    grid: { left: 48, right: 24, top: 24, bottom: 56 },
    xAxis: { type: 'category', boundaryGap: false, data: sorted.map((r) => r.label.slice(5)) },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: 'Người dùng',
        type: 'line',
        smooth: true,
        showSymbol: false,
        itemStyle: { color: SERIES_COLORS.users },
        data: sorted.map((r) => r.totalUsers),
      },
      {
        name: 'Người dùng mới',
        type: 'line',
        smooth: true,
        showSymbol: false,
        itemStyle: { color: SERIES_COLORS.newUsers },
        data: sorted.map((r) => r.newUsers),
      },
      {
        name: 'Số lần xem',
        type: 'line',
        smooth: true,
        showSymbol: false,
        itemStyle: { color: SERIES_COLORS.views },
        data: sorted.map((r) => r.screenPageViews),
      },
    ],
  });
}

function formatLegend(name: string, rows: { label: string; value: number }[]): string {
  const row = rows.find((r) => r.label === name);
  return row ? `${name} (${fmt(row.value)})` : name;
}

function renderOsChart() {
  const chart = getChart('os');
  if (!chart) return;
  const rows = osRows.value
    .filter((r) => r.label)
    .map((r) => ({ label: r.label, value: r.totalUsers }));
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, formatter: (name: string) => formatLegend(name, rows) },
    color: PALETTE,
    series: [
      {
        name: 'Hệ điều hành',
        type: 'pie',
        radius: '62%',
        center: ['50%', '44%'],
        label: { formatter: '{d}%' },
        data: rows.map((r) => ({ name: r.label, value: r.value })),
      },
    ],
  });
}

function renderBrowserChart() {
  const chart = getChart('browser');
  if (!chart) return;
  const rows = [...browserRows.value]
    .filter((r) => r.label)
    .sort((a, b) => a.totalUsers - b.totalUsers);
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 110, right: 40, top: 12, bottom: 24 },
    xAxis: { type: 'value', minInterval: 1 },
    yAxis: { type: 'category', data: rows.map((r) => r.label) },
    series: [
      {
        name: 'Người dùng',
        type: 'bar',
        barMaxWidth: 18,
        itemStyle: { color: '#3b82f6', borderRadius: [0, 4, 4, 0] },
        data: rows.map((r) => r.totalUsers),
      },
    ],
  });
}

function renderDeviceChart() {
  const chart = getChart('device');
  if (!chart) return;
  const rows = deviceRows.value
    .filter((r) => r.label)
    .map((r) => ({ label: r.label, value: r.totalUsers }));
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, formatter: (name: string) => formatLegend(name, rows) },
    color: ['#3b82f6', '#34d399', '#f59e0b', '#ef4444'],
    series: [
      {
        name: 'Thiết bị',
        type: 'pie',
        radius: ['42%', '66%'],
        center: ['50%', '44%'],
        label: { formatter: '{d}%' },
        data: rows.map((r) => ({ name: r.label, value: r.value })),
      },
    ],
  });
}

function formatMinuteLabel(label: string): string {
  if (/^\d{12}$/.test(label)) return `${label.slice(8, 10)}:${label.slice(10, 12)}`;
  return label;
}

function buildMinuteAxis(): { labels: string[]; values: number[] } {
  const map = new Map<string, number>();
  for (const row of realtime.value?.byMinute ?? []) {
    const minutesAgo = Number(row.label);
    const key = Number.isFinite(minutesAgo)
      ? dayjs().subtract(minutesAgo, 'minute').format('HH:mm')
      : formatMinuteLabel(row.label);
    map.set(key, row.activeUsers);
  }
  const labels: string[] = [];
  const values: number[] = [];
  for (let i = 29; i >= 0; i--) {
    const label = dayjs().subtract(i, 'minute').format('HH:mm');
    labels.push(label);
    values.push(map.get(label) ?? 0);
  }
  return { labels, values };
}

function renderRealtimeCharts() {
  const minuteChart = getChart('rtMinute');
  if (minuteChart) {
    const { labels, values } = buildMinuteAxis();
    minuteChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 16, top: 16, bottom: 24 },
      xAxis: { type: 'category', data: labels, axisLabel: { interval: 9 } },
      yAxis: { type: 'value', minInterval: 1 },
      series: [
        {
          name: 'Người dùng',
          type: 'bar',
          barMaxWidth: 10,
          itemStyle: { color: '#3b82f6' },
          data: values,
        },
      ],
    });
  }

  const deviceChart = getChart('rtDevice');
  if (deviceChart) {
    const rows = (realtime.value?.byDevice ?? [])
      .filter((r) => r.label)
      .map((r) => ({ label: r.label, value: r.activeUsers }));
    deviceChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, formatter: (name: string) => formatLegend(name, rows) },
      color: ['#3b82f6', '#34d399', '#f59e0b', '#ef4444'],
      series: [
        {
          name: 'Thiết bị',
          type: 'pie',
          radius: ['42%', '66%'],
          center: ['50%', '44%'],
          label: { formatter: '{d}%' },
          data: rows.map((r) => ({ name: r.label, value: r.value })),
        },
      ],
    });
  }
}

async function fetchMainData() {
  loading.value = true;
  try {
    const [from, to] = getRangeDates();
    const [overviewRes, dailyRes, titlesRes, osRes, browsersRes, devicesRes] = await Promise.all([
      getGa4OverviewApi(from, to),
      getGa4DailyApi(from, to),
      getGa4PageTitlesApi(from, to, 10),
      getGa4OperatingSystemsApi(from, to),
      getGa4BrowsersApi(from, to),
      getGa4DevicesApi(from, to),
    ]);
    overview.value = overviewRes;
    dailyRows.value = dailyRes?.rows ?? [];
    pageTitleRows.value = [...(titlesRes?.rows ?? [])].sort(
      (a, b) => b.screenPageViews - a.screenPageViews
    );
    osRows.value = osRes?.rows ?? [];
    browserRows.value = browsersRes?.rows ?? [];
    deviceRows.value = devicesRes?.rows ?? [];
    await nextTick();
    renderTrendChart();
    renderOsChart();
    renderBrowserChart();
    renderDeviceChart();
  } catch {
    ElMessage.error('Không tải được dữ liệu Google Analytics. Kiểm tra cấu hình GA4 trên Backend.');
  } finally {
    loading.value = false;
  }
}

async function fetchRealtime() {
  realtimeLoading.value = true;
  try {
    realtime.value = await getGa4RealtimeApi();
    await nextTick();
    renderRealtimeCharts();
  } catch {
    ElMessage.error('Không tải được dữ liệu realtime 30 phút qua.');
  } finally {
    realtimeLoading.value = false;
  }
}

let realtimeTimer: ReturnType<typeof setInterval> | null = null;

function startRealtimeTimer() {
  if (realtimeTimer === null) {
    realtimeTimer = setInterval(fetchRealtime, 60_000);
  }
}

function stopRealtimeTimer() {
  if (realtimeTimer !== null) {
    clearInterval(realtimeTimer);
    realtimeTimer = null;
  }
}

function handleRangeChange() {
  fetchMainData();
  fetchVisitorRecords();
}

function handleRefresh() {
  fetchMainData();
  fetchRealtime();
  fetchVisitorRecords();
}

const visitorRecords = ref<VisitorRecord[]>([]);
const tableLoading = ref(false);
const total = ref(0);
const pageNumber = ref(1);
const pageSize = ref(10);
const searchKeyword = ref('');

const loadingUser = ref<Record<string, boolean>>({});
const userInfo = ref<Record<string, any>>({});

const loadUserInfo = async (userId: string) => {
  if (userInfo.value[userId]) return;
  loadingUser.value[userId] = true;
  try {
    userInfo.value[userId] = await fetchGetUserById(userId);
  } catch {
    ElMessage.error('Không thể tải thông tin người dùng.');
  } finally {
    loadingUser.value[userId] = false;
  }
};

const guestMap = new Map<string, number>();
let guestCounter = 1;

const getGuestName = (key: string | null) => {
  const mapKey = key ?? '_';
  if (!guestMap.has(mapKey)) {
    guestMap.set(mapKey, guestCounter++);
  }
  return `Khách vãng lai số ${guestMap.get(mapKey)}`;
};

async function fetchVisitorRecords() {
  tableLoading.value = true;
  guestMap.clear();
  guestCounter = 1;
  try {
    const iso = getRangeIso();
    const response = await getVisitorTrackingApi({
      pageNumber: pageNumber.value,
      pageSize: pageSize.value,
      searchKeyword: searchKeyword.value || undefined,
      from: iso.from,
      to: iso.to,
    });
    visitorRecords.value = response?.items ?? [];
    total.value = response?.totalCount ?? 0;
  } catch {
    ElMessage.error('Không thể tải dữ liệu truy cập.');
  } finally {
    tableLoading.value = false;
  }
}

const handleSearch = () => {
  pageNumber.value = 1;
  fetchVisitorRecords();
};

const formatSeconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

const handleResize = () => {
  charts.forEach((chart) => chart.resize());
};

onMounted(() => {
  fetchMainData();
  fetchRealtime();
  fetchVisitorRecords();
  startRealtimeTimer();
  window.addEventListener('resize', handleResize);
});

onActivated(() => {
  handleResize();
  startRealtimeTimer();
});

onDeactivated(() => {
  stopRealtimeTimer();
});

onBeforeUnmount(() => {
  stopRealtimeTimer();
  window.removeEventListener('resize', handleResize);
  charts.forEach((chart) => chart.dispose());
  charts.clear();
});
</script>

<template>
  <div class="resp-page">
    <div class="page-header mb-4 flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-lg font-semibold">Theo dõi người dùng</h2>
      <div class="flex items-center gap-2">
        <el-select v-model="rangeKey" style="width: 160px" @change="handleRangeChange">
          <el-option
            v-for="option in RANGE_OPTIONS"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-button type="primary" :loading="loading" @click="handleRefresh">Làm mới</el-button>
      </div>
    </div>

    <div v-loading="loading" class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="stat-card flex items-center justify-between rounded-lg px-6 py-5 text-white shadow-md"
        :style="{ background: card.gradient }"
      >
        <div>
          <p class="text-sm opacity-90">{{ card.label }}</p>
          <p class="mt-1 text-3xl font-bold">{{ card.value }}</p>
        </div>
        <ArtSvgIcon :icon="card.icon" class="text-4xl opacity-80" />
      </div>
    </div>

    <el-card v-loading="loading" shadow="never" class="mb-4">
      <template #header>
        <span class="font-medium">Dữ liệu Google Analytics</span>
      </template>
      <div ref="trendEl" class="h-80 w-full" />
    </el-card>

    <div class="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <el-card v-loading="loading" shadow="never">
        <template #header>
          <div class="flex items-center gap-2">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full text-white"
              style="background: #059669"
            >
              <ArtSvgIcon icon="ri:eye-line" />
            </span>
            <div>
              <p class="font-medium leading-tight">Số lần xem</p>
              <p class="text-xs text-gray-400">theo Tiêu đề trang</p>
            </div>
          </div>
        </template>
        <el-empty v-if="pageTitleRows.length === 0" description="Chưa có dữ liệu" />
        <div v-else class="flex flex-col gap-3">
          <div v-for="row in pageTitleRows" :key="row.label" class="title-row">
            <div class="flex items-start justify-between gap-4">
              <span class="line-clamp-2 text-sm text-gray-700">{{ row.label }}</span>
              <span class="shrink-0 text-sm font-semibold text-gray-800">
                {{ fmt(row.screenPageViews) }}
              </span>
            </div>
            <div class="mt-1 h-1 w-full rounded bg-gray-100">
              <div
                class="h-1 rounded"
                style="background: #ec4899"
                :style="{ width: `${Math.max(4, (row.screenPageViews / maxTitleViews) * 100)}%` }"
              />
            </div>
          </div>
        </div>
      </el-card>

      <el-card v-loading="loading" shadow="never">
        <template #header><span class="font-medium">Người dùng theo Hệ điều hành</span></template>
        <el-empty v-if="osRows.length === 0" description="Chưa có dữ liệu" />
        <div v-show="osRows.length > 0" ref="osEl" class="h-80 w-full" />
      </el-card>
    </div>

    <div class="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <el-card v-loading="loading" shadow="never">
        <template #header><span class="font-medium">Người dùng theo Trình duyệt</span></template>
        <el-empty v-if="browserRows.length === 0" description="Chưa có dữ liệu" />
        <div v-show="browserRows.length > 0" ref="browserEl" class="h-80 w-full" />
      </el-card>

      <el-card v-loading="loading" shadow="never">
        <template #header><span class="font-medium">Người dùng theo Thiết bị</span></template>
        <el-empty v-if="deviceRows.length === 0" description="Chưa có dữ liệu" />
        <div v-show="deviceRows.length > 0" ref="deviceEl" class="h-80 w-full" />
      </el-card>
    </div>

    <el-card v-loading="realtimeLoading" shadow="never" class="mb-4">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-medium">Realtime · 30 phút qua</span>
          <span class="text-xs text-gray-400">Tự động làm mới mỗi 60 giây</span>
        </div>
      </template>
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <p class="mb-2 text-sm text-gray-500">
            Người dùng trong 30 phút qua:
            <span class="text-lg font-bold text-blue-600">{{ fmt(realtime?.activeUsers) }}</span>
          </p>
          <div ref="rtMinuteEl" class="h-64 w-full" />
        </div>
        <div>
          <p class="mb-2 text-sm text-gray-500">Thiết bị trong 30 phút qua</p>
          <el-empty
            v-if="(realtime?.byDevice?.length ?? 0) === 0"
            description="Chưa có dữ liệu"
            :image-size="80"
          />
          <div
            v-show="(realtime?.byDevice?.length ?? 0) > 0"
            ref="rtDeviceEl"
            class="h-64 w-full"
          />
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="font-medium">Người dùng truy cập gần đây</span>
          <div class="flex items-center gap-2">
            <el-input
              v-model="searchKeyword"
              placeholder="Tìm theo tên / sản phẩm / visitor key"
              clearable
              style="width: 280px"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
            <el-button type="primary" plain @click="handleSearch">Tìm</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="tableLoading" :data="visitorRecords" border style="width: 100%">
        <el-table-column label="Thời gian truy cập" width="180">
          <template #default="scope">
            {{ dayjs(scope.row.viewedAt).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>

        <el-table-column label="Sản phẩm / Trang" min-width="240">
          <template #default="scope">
            <div class="flex items-center gap-3">
              <el-image
                v-if="scope.row.productImageUrl"
                :src="scope.row.productImageUrl"
                fit="cover"
                class="h-12 w-12 shrink-0 rounded border border-gray-100 bg-gray-50"
              />
              <div
                v-else
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-gray-100 bg-gray-50 text-gray-400"
              >
                <ArtSvgIcon icon="ri:image-line" class="text-xl" />
              </div>
              <div class="flex flex-col">
                <span class="font-medium text-gray-800">{{ scope.row.productName }}</span>
                <span v-if="scope.row.variantName" class="mt-0.5 text-xs text-gray-500">
                  {{ scope.row.variantName
                  }}<template v-if="scope.row.variantColorName">
                    - {{ scope.row.variantColorName }}</template
                  >
                </span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Người dùng (Guest / Tên)" min-width="200">
          <template #default="scope">
            <el-popover
              v-if="scope.row.customerUserId"
              placement="right"
              width="320"
              trigger="click"
              @show="loadUserInfo(scope.row.customerUserId)"
            >
              <template #reference>
                <span class="cursor-pointer font-medium text-blue-600 hover:underline">
                  {{ scope.row.customerName || 'User: ' + scope.row.customerUserId }}
                </span>
              </template>

              <div
                v-loading="loadingUser[scope.row.customerUserId]"
                class="flex min-h-[80px] flex-col gap-3"
              >
                <template v-if="userInfo[scope.row.customerUserId]">
                  <div class="flex items-center gap-4 border-b border-gray-100 pb-3">
                    <el-avatar
                      :src="userInfo[scope.row.customerUserId].avatarUrl || ''"
                      :size="56"
                      class="shrink-0 shadow-sm"
                    >
                      <span class="text-lg font-bold">{{
                        userInfo[scope.row.customerUserId].fullName?.charAt(0) || 'U'
                      }}</span>
                    </el-avatar>
                    <div class="flex flex-col overflow-hidden">
                      <div class="truncate text-base font-bold text-gray-800">
                        {{ userInfo[scope.row.customerUserId].fullName }}
                      </div>
                      <div
                        class="mt-1 max-w-full truncate rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-500"
                      >
                        {{ userInfo[scope.row.customerUserId].email || 'Chưa cập nhật Email' }}
                      </div>
                    </div>
                  </div>
                  <div class="mt-1 grid grid-cols-2 gap-y-2 text-sm">
                    <div class="text-gray-500">SĐT:</div>
                    <div class="text-right font-medium">
                      {{ userInfo[scope.row.customerUserId].phoneNumber || 'Chưa cập nhật' }}
                    </div>

                    <div class="text-gray-500">Giới tính:</div>
                    <div class="text-right font-medium">
                      {{
                        userInfo[scope.row.customerUserId].gender === 'Male'
                          ? 'Nam'
                          : userInfo[scope.row.customerUserId].gender === 'Female'
                            ? 'Nữ'
                            : 'Khác'
                      }}
                    </div>
                  </div>
                </template>
                <template v-else-if="!loadingUser[scope.row.customerUserId]">
                  <div class="py-4 text-center text-sm italic text-gray-400">
                    Không thể tải thông tin.
                  </div>
                </template>
              </div>
            </el-popover>

            <span v-else class="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">{{
              getGuestName(scope.row.visitorKey)
            }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Đã xem (giây)" width="140" align="right">
          <template #default="scope">
            {{ formatSeconds(scope.row.dwellTimeMs) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pageNumber"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @change="fetchVisitorRecords"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.resp-page {
  padding: 20px;
}

.stat-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 24px -8px rgb(0 0 0 / 25%),
    0 4px 10px -4px rgb(0 0 0 / 15%);
}

.title-row {
  border-bottom: 1px dashed rgb(0 0 0 / 6%);
  padding-bottom: 10px;
}
</style>
