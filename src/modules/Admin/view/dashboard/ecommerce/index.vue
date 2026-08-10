<template>
  <div class="resp-page ecommerce">
    <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">📊 Tổng quan kinh doanh</h1>
      <div class="flex items-center gap-2 flex-wrap">
        <ElButton
          v-for="p in periods"
          :key="p.value"
          size="small"
          @click="setPeriod(p.value)"
          :type="currentPeriod === p.value ? 'primary' : 'default'"
        >
          {{ p.label }}
        </ElButton>
        <ElDatePicker
          v-model="customRange"
          type="daterange"
          range-separator="-"
          start-placeholder="Từ ngày"
          end-placeholder="Đến ngày"
          size="small"
          value-format="YYYY-MM-DD"
          @change="onCustomRangeChange"
          style="width: 220px"
        />
      </div>
    </div>

    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :md="12" :lg="6">
        <div
          :class="[
            'art-card p-5 h-full border-l-4',
            summary.isRevenueAlert
              ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
              : 'border-blue-500',
          ]"
        >
          <div
            class="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2"
          >
            DOANH THU THỰC TẾ
          </div>
          <div class="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {{ formatCurrency(summary.totalRevenue) }}
          </div>
          <div
            class="text-sm font-medium"
            :class="(summary.revenueChangePercentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ (summary.revenueChangePercentage || 0) >= 0 ? '▲' : '▼ '
            }}{{ summary.revenueChangePercentage || 0 }}% so với kỳ trước
          </div>
          <div class="text-sm text-gray-500 mt-1">
            Mục tiêu ngày: {{ formatCurrency(summary.dailyTarget) }}
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-500"
              :style="{
                width:
                  Math.min(
                    Math.round((summary.totalRevenue / (summary.dailyTarget || 1)) * 100),
                    100
                  ) + '%',
              }"
            ></div>
          </div>
          <div class="text-right text-xs text-gray-500 mt-1">
            {{ Math.round((summary.totalRevenue / (summary.dailyTarget || 1)) * 100) }}
          </div>
          <div
            v-if="summary.isRevenueAlert"
            class="text-red-600 text-xs mt-1 font-bold flex items-center gap-1"
          >
            <i class="ri-alert-fill"></i> Cảnh báo: Thấp hơn 50% mục tiêu
          </div>
        </div>
      </ElCol>

      <ElCol :sm="24" :md="12" :lg="6">
        <div class="art-card p-5 h-full border-l-4 border-green-500">
          <div
            class="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2"
          >
            LỢI NHUẬN RÒNG
          </div>
          <div class="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {{ formatCurrency(summary.netProfit) }}
          </div>
          <div class="text-sm mt-2">
            Biên lợi nhuận:
            <span class="font-medium"> {{ summary.profitMargin }}% </span>
          </div>
          <div class="mt-2">
            <span
              class="text-sm"
              :class="summary.profitVsYesterdayPercentage >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ summary.profitVsYesterdayPercentage >= 0 ? '▲' : '▼' }}
              {{ summary.profitVsYesterdayPercentage }}% so với hôm qua
            </span>
          </div>
        </div>
      </ElCol>

      <ElCol :sm="24" :md="12" :lg="6">
        <div
          class="art-card p-5 h-full border-l-4"
          :class="
            summary.isPendingAlert
              ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
              : 'border-orange-500'
          "
        >
          <div
            class="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2"
          >
            TIỀN ĐANG TREO
          </div>
          <div class="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {{ formatCurrency(summary.pendingAmount) }}
          </div>
          <div class="mt-3 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Cọc giữ xe:</span>
              <span class="font-medium text-gray-800 dark:text-gray-100">{{
                formatCurrency(summary.depositAmount)
              }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Chờ giải ngân:</span>
              <span class="font-medium text-gray-800 dark:text-gray-100">{{
                formatCurrency(summary.loanWaitAmount)
              }}</span>
            </div>
          </div>
          <div
            v-if="summary.isPendingAlert"
            class="text-yellow-600 text-xs mt-2 font-bold flex items-center gap-1"
          >
            <i class="ri-error-warning-fill"></i> > 48h chưa giải ngân
          </div>
        </div>
      </ElCol>

      <ElCol :sm="24" :md="12" :lg="6">
        <div class="art-card p-5 h-full border-l-4 border-gray-500">
          <div
            class="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2"
          >
            CẦN XỬ LÝ
          </div>
          <div class="mt-2 space-y-3">
            <div class="flex justify-between text-sm cursor-pointer">
              <span class="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                ><span class="w-2 h-2 bg-red-500"></span>Khiếu nại mới</span
              >
              <span class="font-bold">{{ summary.newComplaintsCount }}</span>
            </div>
            <div class="flex justify-between text-sm cursor-pointer">
              <span class="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                ><span class="w-2 h-2 bg-yellow-400"></span>NH chậm giải ngân</span
              >
              <span class="font-bold">{{ summary.delayedLoansCount }}</span>
            </div>
            <div class="flex justify-between text-sm cursor-pointer">
              <span class="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                ><span class="w-2 h-2 bg-yellow-400"></span>Xe sắp hết hàng</span
              >
              <span class="font-bold">{{ summary.lowStockVehiclesCount }}</span>
            </div>
            <div class="flex justify-between text-sm cursor-pointer">
              <span class="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                ><span class="w-2 h-2 bg-green-500"></span>Lịch hẹn bỏ lỡ</span
              >
              <span class="font-bold">{{ summary.missedAppointmentsCount }}</span>
            </div>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :lg="16">
        <div class="art-card p-5 h-full">
          <div class="art-card-header mb-4">
            <h3 class="font-bold text-gray-800 dark:text-gray-100">
              Biểu đồ doanh thu theo chu kỳ
            </h3>
          </div>
          <div ref="revenueChartRef" class="h-64 w-full"></div>
          <div v-if="chartLoading" class="h-64 flex items-center justify-center text-gray-400">
            Đang tải dữ liệu...
          </div>
        </div>
      </ElCol>
      <ElCol :sm="24" :lg="8">
        <div class="art-card p-5 h-full">
          <div class="art-card-header mb-4">
            <h3 class="font-bold text-gray-800 dark:text-gray-100">Tóm tắt mục tiêu tháng</h3>
          </div>
          <div class="space-y-4 mt-4">
            <div class="flex justify-between">
              <span class="text-gray-500">Đã đạt:</span>
              <span class="font-bold text-lg text-gray-800 dark:text-gray-100">{{
                formatCurrency(summary.monthAchieved)
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Cần thêm:</span>
              <span class="font-bold text-lg text-red-500">{{
                formatCurrency(summary.monthRemaining)
              }}</span>
            </div>
            <div class="flex justify-between border-t pt-3">
              <span class="text-gray-600 dark:text-gray-300">Dự báo cuối tháng:</span>
              <span class="font-bold text-xl text-blue-600">{{
                formatCurrency(summary.monthForecast)
              }}</span>
            </div>
            <div>
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>Tiến độ</span>
                <span
                  >{{
                    Math.round((summary.monthAchieved / (summary.monthTarget || 1)) * 100)
                  }}%</span
                >
              </div>
              <ElProgress
                :percentage="Math.round((summary.monthAchieved / (summary.monthTarget || 1)) * 100)"
                :show-text="false"
              />
            </div>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :lg="12">
        <div class="art-card p-5 h-full">
          <div class="art-card-header mb-4">
            <h3 class="font-bold uppercase text-sm tracking-wider text-gray-700 dark:text-gray-300">
              NGUỒN DOANH THU
            </h3>
          </div>
          <div class="space-y-4">
            <div v-for="source in sources" :key="source.name" class="flex items-center gap-3">
              <span class="text-sm w-28 text-gray-700 dark:text-gray-300">{{ source.name }}</span>
              <div class="flex-1">
                <ElProgress :percentage="source.percent" :show-text="false" />
              </div>
              <span class="text-sm w-28 text-right font-medium text-gray-800 dark:text-gray-100">{{
                formatCurrency(source.amount).replace('₫', '')
              }}</span>
            </div>
          </div>
          <div v-if="sources.length === 0" class="text-center text-sm text-gray-400 mt-4">
            Chưa có dữ liệu
          </div>
        </div>
      </ElCol>

      <ElCol :sm="24" :lg="12">
        <div class="art-card p-5 h-full">
          <div class="art-card-header mb-4">
            <h3 class="font-bold uppercase text-sm tracking-wider text-gray-700 dark:text-gray-300">
              HIỆU SUẤT SALE
            </h3>
          </div>
          <div class="space-y-4">
            <div v-for="(staff, idx) in topStaff" :key="staff.employeeName">
              <div class="flex justify-between text-sm">
                <span class="w-32 truncate text-gray-700 dark:text-gray-300"
                  >#{{ idx + 1 }} {{ staff.employeeName }}</span
                >
                <span class="font-medium text-gray-800 dark:text-gray-100">{{
                  formatCurrencyShort(staff.totalSales)
                }}</span>
                <ElTag v-if="staff.isTopSeller" type="success" size="small" effect="dark"
                  >⭐ Vượt</ElTag
                >
                <ElTag v-else-if="staff.kpiStatus === 'Đạt'" type="primary" size="small"
                  >✓ Đạt</ElTag
                >
                <ElTag v-else type="warning" size="small">⚠️</ElTag>
              </div>
              <ElProgress
                :percentage="Math.round((staff.totalSales / (staff.targetSales || 1)) * 100)"
                :stroke-width="8"
              />
            </div>
            <div v-if="topStaff.length === 0" class="text-center text-sm text-gray-400 mt-4">
              Chưa có dữ liệu
            </div>

            <div class="mt-4 pt-3 border-t">
              <div class="flex justify-between text-sm">
                <span class="font-bold text-gray-800 dark:text-gray-100">Tổng team</span>
                <span>{{ formatCurrency(teamSales) }} / {{ formatCurrency(teamTarget) }}</span>
              </div>
              <ElProgress
                :percentage="Math.round((teamSales / (teamTarget || 1)) * 100)"
                :stroke-width="12"
                color="#e6a23c"
              />
            </div>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <ElRow>
      <ElCol :span="24">
        <div class="art-card p-5">
          <div class="art-card-header mb-4 flex justify-between items-center">
            <h3 class="font-bold uppercase text-sm tracking-wider text-gray-700 dark:text-gray-300">
              GIAO DỊCH GẦN NHẤT
            </h3>
          </div>
          <ElTable :data="transactions" stripe style="width: 100%" :max-height="400">
            <ElTableColumn prop="reportTime" label="Ngày" width="100">
              <template #default="scope">{{ formatDate(scope.row.reportTime) }}</template>
            </ElTableColumn>
            <ElTableColumn label="Khách hàng" min-width="150">
              <template #default="scope">{{ scope.row.customerName }}</template>
            </ElTableColumn>
            <ElTableColumn label="Sản phẩm / Dịch vụ" min-width="200">
              <template #default="scope">{{ scope.row.productName }}</template>
            </ElTableColumn>
            <ElTableColumn label="Trạng thái" width="110">
              <template #default="scope">
                <ElTag size="small" :type="mapStatusType(scope.row.status)">{{
                  scope.row.status
                }}</ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Số tiền" width="160" align="right">
              <template #default="scope">
                <div
                  class="flex items-center gap-1"
                  :class="scope.row.isRevenue ? 'text-green-600' : 'text-red-600'"
                >
                  {{ scope.row.isRevenue ? '+' : '-' }}{{ formatCurrency(scope.row.revenue) }}
                  <span v-if="scope.row.isPending" title="Đang chờ">⏳</span>
                  <span v-if="scope.row.isRefund" class="text-red-500" title="Hoàn tiền">🔴</span>
                </div>
              </template>
            </ElTableColumn>
          </ElTable>
          <div v-if="transactions.length === 0" class="text-center text-sm text-gray-400 mt-4">
            Chưa có giao dịch gần đây
          </div>
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import * as echarts from 'echarts';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useUserStore } from '@/application/store/user';
import {
  ElRow,
  ElCol,
  ElButton,
  ElDatePicker,
  ElProgress,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';
import type { ECharts } from 'echarts';

import { AnalyticsService } from '@/services/analytics.service';
import type {
  DashboardSummary,
  StaffPerformance,
  TransactionLog,
} from '@/services/analytics.types';
import { fetchRevenueByCategory, fetchDailyCategoryRevenue } from '@/api/dashboard.api';

defineOptions({ name: 'Ecommerce' });

const periods = [
  { label: 'Hôm nay', value: 'today' },
  { label: 'Tháng này', value: 'month' },
  { label: 'Năm nay', value: 'year' },
];

const currentPeriod = ref('today');
const customRange = ref<[string, string] | null>(null);
const chartLoading = ref(false);

const summary = ref<DashboardSummary>({
  totalRevenue: 0,
  revenueChangePercentage: 0,
  revenueVsYesterdayPercentage: 0,
  dailyTarget: 0,
  netProfit: 0,
  profitMargin: 0,
  profitVsYesterdayPercentage: 0,
  pendingAmount: 0,
  depositAmount: 0,
  loanWaitAmount: 0,
  isRevenueAlert: false,
  isPendingAlert: false,
  isStockAlert: false,
  newComplaintsCount: 0,
  delayedLoansCount: 0,
  lowStockVehiclesCount: 0,
  missedAppointmentsCount: 0,
  activeInstallmentCount: 0,
  lateInstallmentCount: 0,
  monthTarget: 0,
  monthAchieved: 0,
  monthRemaining: 0,
  monthForecast: 0,
  totalExpense: 0,
  grossProfit: 0,
  alertsCount: 0,
});
const sources = ref<{ name: string; amount: number; percent: number }[]>([]);
const topStaff = ref<StaffPerformance[]>([]);
const transactions = ref<TransactionLog[]>([]);

const revenueChartRef = ref<HTMLElement | null>(null);
let chartInstance: ECharts | null = null;

const teamSales = computed(() =>
  topStaff.value.reduce((acc, curr) => acc + (curr.totalSales ?? 0), 0)
);
const teamTarget = computed(() =>
  topStaff.value.reduce((acc, curr) => acc + (curr.targetSales ?? 1), 0)
);

function getDays() {
  switch (currentPeriod.value) {
    case 'today':
      return 7;
    case 'month':
      return 30;
    case 'year':
      return 366;
    case 'custom':
      return 30;
    default:
      return 7;
  }
}

function getDateRange(): { start: string; end: string } {
  if (currentPeriod.value === 'custom' && customRange.value && customRange.value.length === 2) {
    return { start: customRange.value[0], end: customRange.value[1] };
  }
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  let from: string;
  if (currentPeriod.value === 'today') {
    from = to;
  } else if (currentPeriod.value === 'month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  } else {
    from = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
  }
  return { start: from, end: to };
}

async function loadAll() {
  chartLoading.value = true;
  const { start, end } = getDateRange();
  try {
    const [summaryRes, staffRes, txRes, sourcesRes, chartData] = await Promise.allSettled([
      AnalyticsService.getDashboardSummary(start, end),
      AnalyticsService.getStaffPerformance(start, end),
      AnalyticsService.getRecentTransactions(),
      fetchRevenueByCategory(start, end),
      fetchDailyCategoryRevenue(getDays()),
    ]);

    if (summaryRes.status === 'fulfilled' && summaryRes.value)
      summary.value = normalizeSummary(summaryRes.value);

    if (staffRes.status === 'fulfilled' && staffRes.value) topStaff.value = staffRes.value;

    if (txRes.status === 'fulfilled' && txRes.value) transactions.value = txRes.value;

    if (sourcesRes.status === 'fulfilled' && Array.isArray(sourcesRes.value)) {
      const total = sourcesRes.value.reduce((s: number, i: any) => s + (i.revenue ?? 0), 0);
      sources.value = sourcesRes.value.map((i: any) => ({
        name: i.categoryName ?? i.name,
        amount: i.revenue ?? i.amount ?? 0,
        percent: total ? Math.round(((i.revenue ?? i.amount ?? 0) / total) * 100) : 0,
      }));
    } else {
      sources.value = [];
    }

    if (chartData.status === 'fulfilled') renderChart(chartData.value ?? []);
    else renderChart([]);
  } catch (err) {
    console.error('Ecommerce load error:', err);
  } finally {
    chartLoading.value = false;
  }
}

function normalizeSummary(s: any): DashboardSummary {
  if (!s) return summary.value as any;
  const safeNum = (v: any, fb = 0) => (v == null ? fb : typeof v === 'number' ? v : fb);
  return {
    totalRevenue: s.totalRevenue ?? s.revenueTotal ?? 0,
    netProfit: s.netProfit ?? s.profitToday ?? 0,
    totalExpense: safeNum(s.totalExpense),
    grossProfit: safeNum(s.grossProfit),
    alertsCount: safeNum(s.alertsCount),
    revenueChangePercentage: safeNum(s.revenueChangePercentage ?? s.incomeChangePercent ?? 0),
    revenueVsYesterdayPercentage: safeNum(
      s.revenueVsYesterdayPercentage ?? s.incomeChangePercent ?? 0
    ),
    dailyTarget: safeNum(s.dailyTarget),
    profitMargin: s.profitMargin ?? 0,
    profitVsYesterdayPercentage: safeNum(s.profitVsYesterdayPercentage),
    pendingAmount: s.pendingAmount ?? s.totalPending ?? 0,
    depositAmount: safeNum(s.depositAmount),
    loanWaitAmount: safeNum(s.loanWaitAmount),
    isRevenueAlert: !!s.isRevenueAlert,
    isPendingAlert: !!s.isPendingAlert,
    isStockAlert: !!s.isStockAlert,
    newComplaintsCount: safeNum(s.newComplaintsCount),
    delayedLoansCount: safeNum(s.delayedLoansCount),
    lowStockVehiclesCount: safeNum(s.lowStockVehiclesCount),
    missedAppointmentsCount: safeNum(s.missedAppointmentsCount),
    monthTarget: safeNum(s.monthTarget),
    monthAchieved: safeNum(s.monthAchieved),
    monthRemaining: safeNum(s.monthRemaining),
    monthForecast: safeNum(s.monthForecast),
    activeInstallmentCount: safeNum(s.activeInstallmentCount),
    lateInstallmentCount: safeNum(s.lateInstallmentCount),
  };
}

function renderChart(data: { reportDay: string; categoryName: string; revenue: number }[]) {
  if (!revenueChartRef.value) return;
  if (!chartInstance) chartInstance = echarts.init(revenueChartRef.value);

  if (!data.length) {
    chartInstance.clear();
    chartInstance.setOption({
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [],
      grid: { left: 10, right: 10, bottom: 20, top: 20 },
    });
    return;
  }

  const days = Array.from(new Set(data.map((d) => d.reportDay)));
  const categories = Array.from(new Set(data.map((d) => d.categoryName)));
  const palette = ['#2563eb', '#67c23a', '#e6a23c', '#f56c6c', '#9c27b0', '#00bcd4', '#ff9800'];

  const series = categories.map((cat, idx) => ({
    name: cat,
    type: 'line' as const,
    smooth: true,
    data: days.map(
      (day) => data.find((d) => d.reportDay === day && d.categoryName === cat)?.revenue ?? 0
    ),
    itemStyle: { color: palette[idx % palette.length] },
    lineStyle: { type: 'solid', width: 2 },
    symbol: 'circle',
    symbolSize: 6,
    emphasis: { focus: 'series' },
  }));

  chartInstance.setOption({
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, textStyle: { color: '#9ca3af' } },
    grid: { left: 10, right: 10, bottom: 50, top: 10, containLabel: true },
    xAxis: { type: 'category', data: days, axisLabel: { color: '#9ca3af' } },
    yAxis: { type: 'value', name: 'VNĐ', axisLabel: { color: '#9ca3af' } },
    series,
    color: palette,
  });
}

function setPeriod(p: string) {
  currentPeriod.value = p as any;
  if (p === 'custom') return;
  loadAll();
}

function onCustomRangeChange() {
  if (!customRange.value) return;
  currentPeriod.value = 'custom';
  loadAll();
}

function formatCurrency(value: any) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num);
}

function formatCurrencyShort(value: number) {
  if (!value && value !== 0) return '0đ';
  if (Math.abs(value) >= 1_000_000) return `${Math.round(value / 1_000_000)}tr`;
  if (Math.abs(value) >= 1_000) return `${Math.round(value / 1_000)}k`;
  return `${value}`;
}

function formatDate(ts: string) {
  if (!ts) return '-';
  return ts.slice(0, 10);
}

function mapStatusType(status: string) {
  switch (status) {
    case 'Completed':
      return 'success';
    case 'Pending':
      return 'warning';
    case 'Cancelled':
      return 'danger';
    default:
      return 'info';
  }
}

onMounted(() => {
  loadAll();

  const userStore = useUserStore();
  const token = userStore.accessToken;
  if (!token) return;

  fetchEventSource(`${import.meta.env.VITE_API_URL ?? '/api'}/analytics/stream/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
    onmessage(ev) {
      try {
        const t = JSON.parse(ev.data) as TransactionLog;
        if (!t) return;
        transactions.value = [t, ...transactions.value].slice(0, 50);
      } catch {
        
      }
    },
    onerror() {
      
    },
  });
});
</script>

<style scoped>
.ecommerce {
  min-height: 100%;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
