<template>
  <div class="resp-page reporting-page">
    <ReportPageHeader
      title="Tổng quan điều hành"
      description="Theo dõi doanh thu, lợi nhuận, đơn hàng và cảnh báo tồn kho trong cùng một màn hình."
      icon="ri:dashboard-3-line"
    >
      <template #actions>
        <div class="reporting-actions">
          <ReportPeriodSwitcher
            v-model="currentPeriod"
            v-model:start-date="periodStart"
            v-model:end-date="periodEnd"
            @update:modelValue="onPeriodChange"
          />
          <ElButton type="primary" :disabled="loading" @click="exportDashboardExcel">
            <ArtSvgIcon icon="ri:file-excel-2-line" />
            Xuất Excel
          </ElButton>
        </div>
      </template>
    </ReportPageHeader>

    <div class="reporting-kpi-grid dashboard-report__kpis">
      <ArtStatsCard
        title="Doanh thu thực tế"
        :count="formatCurrency(summary.todayRevenue)"
        :description="`${summary.revenueChangePercentage >= 0 ? 'Tăng' : 'Giảm'} ${Math.abs(summary.revenueChangePercentage).toFixed(1)}% so với hôm qua`"
        icon="ri:money-dollar-circle-line"
        :icon-style="summary.revenueChangePercentage < 0 ? 'bg-report-red-dark' : 'bg-report-red'"
        :loading="loading"
      />
      <ArtStatsCard
        title="Lợi nhuận ròng"
        :count="formatCurrency(summary.todayProfit)"
        :description="`Tháng này: ${formatCurrency(summary.monthlyProfit)}`"
        icon="ri:line-chart-line"
        icon-style="bg-report-red-light"
        :loading="loading"
      />
      <ArtStatsCard
        title="Đơn hàng chờ xử lý"
        :count="summary.pendingOrdersCount"
        :description="`Quá hạn: ${summary.overdueOrdersCount}`"
        icon="ri:timer-line"
        icon-style="bg-report-red-dark"
        :loading="loading"
      />
      <ArtStatsCard
        title="Cảnh báo tồn kho"
        :count="summary.lowStockCount"
        description="Sản phẩm cần kiểm tra tồn kho"
        icon="ri:alarm-warning-line"
        :icon-style="summary.lowStockCount > 0 ? 'bg-report-red-dark' : 'bg-report-gray'"
        :loading="loading"
      />
    </div>

    <div class="reporting-section-grid three-columns dashboard-report__overview">
      <ElCard class="reporting-card dashboard-report__chart-card lg:col-span-2">
        <template #header>
          <div class="dashboard-report__card-header">
            <span>Biểu đồ doanh thu theo chu kỳ</span>
            <span>{{ selectedRangeLabel }}</span>
          </div>
        </template>
        <div ref="revenueChartRef" class="reporting-chart dashboard-report__chart"></div>
      </ElCard>
      <ElCard class="reporting-card dashboard-report__summary-card">
        <template #header>
          <div class="dashboard-report__card-header">
            <span>Tóm tắt vận hành</span>
            <span>{{ selectedRangeLabel }}</span>
          </div>
        </template>
        <div class="reporting-page__summary-grid">
          <div class="reporting-page__summary-row">
            <span class="reporting-muted">Doanh thu tháng:</span>
            <strong>{{ formatCurrency(summary.monthlyRevenue) }}</strong>
          </div>
          <div class="reporting-page__summary-row">
            <span class="reporting-muted">Tháng trước:</span>
            <strong>{{ formatCurrency(summary.lastMonthRevenue) }}</strong>
          </div>
          <div class="reporting-page__summary-row">
            <span>Xe bán tháng này:</span>
            <strong class="text-report-red">{{ summary.monthlyVehiclesSold }}</strong>
          </div>
          <div class="reporting-page__summary-row">
            <span class="reporting-muted">Tổng SKU:</span>
            <strong>{{ summary.totalSKUCount }}</strong>
          </div>
        </div>
      </ElCard>
    </div>

    <div class="reporting-section-grid two-columns dashboard-report__analysis">
      <ElCard class="reporting-card dashboard-report__chart-card">
        <template #header>Doanh thu theo thương hiệu</template>
        <div ref="brandChartRef" class="reporting-chart dashboard-report__chart"></div>
      </ElCard>
      <ElCard class="reporting-card dashboard-report__table-card">
        <template #header>Hiệu suất Sale (Top Ranking)</template>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr
                class="border-b border-(--el-border-color-light) text-(--el-text-color-secondary)"
              >
                <th class="pb-2">Nhân viên</th>
                <th class="pb-2">Doanh số</th>
                <th class="pb-2">KPI</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="staff in topStaff"
                :key="staff.employeeName"
                class="border-b border-(--art-card-border) last:border-0"
              >
                <td class="py-2 font-medium">{{ staff.employeeName }}</td>
                <td class="py-2">{{ formatCurrency(staff.totalSales) }}</td>
                <td class="py-2">
                  <span :class="['px-2 py-1 rounded-full text-xs', getKpiClass(staff.kpiStatus)]">
                    {{ staff.kpiStatus }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <ElEmpty v-if="topStaff.length === 0" description="Chưa có dữ liệu" :image-size="72" />
        </div>
      </ElCard>
    </div>

    <ElCard class="reporting-card dashboard-report__transactions">
      <template #header>Luồng nhật ký giao dịch gần nhất</template>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr class="border-b border-(--el-border-color-light) text-(--el-text-color-secondary)">
              <th class="pb-2">Mốc giờ</th>
              <th class="pb-2">Khách hàng</th>
              <th class="pb-2">Sản phẩm</th>
              <th class="pb-2">Số tiền</th>
              <th class="pb-2">Sale phụ trách</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tx in transactions"
              :key="tx.timestamp"
              class="border-b border-(--art-card-border) last:border-0 hover:bg-(--el-fill-color-light) transition-colors"
            >
              <td class="py-2 text-(--el-text-color-secondary)">
                {{ formatTime(tx.timestamp) }}
              </td>
              <td class="py-2 font-medium">{{ tx.customerName }}</td>
              <td class="py-2">{{ tx.productName }}</td>
              <td class="py-2 font-bold" :class="tx.isRevenue ? 'text-green-600' : 'text-red-600'">
                {{ tx.isRevenue ? '+' : '-' }} {{ formatCurrency(tx.amount) }}
              </td>
              <td class="py-2">{{ tx.staffName }}</td>
            </tr>
          </tbody>
        </table>
        <ElEmpty v-if="transactions.length === 0" description="Chưa có dữ liệu" :image-size="72" />
      </div>
    </ElCard>

    <ElCard class="reporting-card mt-4">
      <template #header>Đơn hàng gần đây</template>
      <ElTable :data="recentOrders" class="reporting-table" empty-text="Chưa có dữ liệu">
        <ElTableColumn label="Mã đơn" min-width="120">
          <template #default="{ row }">{{ row.orderCode || `#${row.id}` }}</template>
        </ElTableColumn>
        <ElTableColumn prop="buyerName" label="Khách hàng" min-width="180" />
        <ElTableColumn prop="totalAmount" label="Số tiền" min-width="150" align="right">
          <template #default="{ row }">{{ formatCurrency(row.totalAmount) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="statusId" label="Trạng thái" min-width="130">
          <template #default="{ row }">
            <ElTag size="small" effect="light" round>{{ row.statusId || '-' }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="Thời gian" min-width="170">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import { storeToRefs } from 'pinia';
import ArtStatsCard from '@/components/core/cards/art-stats-card/index.vue';
import { statisticsApi } from '@/api/operations';
import { useSettingStore } from '@/application/store/setting';
import { exportReportWorkbook } from '@/utils/report-excel';
import ReportPageHeader from './ReportPageHeader.vue';
import ReportPeriodSwitcher from './ReportPeriodSwitcher.vue';
import type { StaffPerformance, TransactionLog } from '@/services/analytics.types';
import type * as Statistical from '@/types/api/statistical';

type Period = 'today' | 'month' | 'year' | 'custom';

const settingStore = useSettingStore();
const { isDark } = storeToRefs(settingStore);

const revenueChartRef = ref<HTMLElement | null>(null);
const brandChartRef = ref<HTMLElement | null>(null);
let revenueChart: echarts.ECharts | null = null;
let brandChart: echarts.ECharts | null = null;
const recentOrders = ref<Statistical.RecentOrderResponse[]>([]);
const dailyRevenue = ref<Statistical.DailyRevenueResponse[]>([]);
const loading = ref(false);

const currentPeriod = ref<Period>('month');
const periodStart = ref(toDateInput(startOfMonth(new Date())));
const periodEnd = ref(toDateInput(new Date()));

const summary = ref<Statistical.DashboardStatsResponse>({
  todayRevenue: 0,
  revenueChangePercentage: 0,
  monthlyRevenue: 0,
  todayProfit: 0,
  monthlyProfit: 0,
  lastMonthRevenue: 0,
  lastMonthProfit: 0,
  total7dRevenue: 0,
  total7dProfit: 0,
  bestDayRevenue: 0,
  overdueOrdersCount: 0,
  lowStockCount: 0,
  overstockCount: 0,
  overdueDebtAmount: 0,
  todayVehiclesSold: 0,
  monthlyVehiclesSold: 0,
  currentInventoryCount: 0,
  totalSKUCount: 0,
  brandDistribution: [],
  activeInstallmentCount: 0,
  lateInstallmentCount: 0,
  totalCustomerDebt: 0,
  topSellingProducts: [],
  brandRevenueDistribution: [],
  todayActivities: [],
  pendingOrdersCount: 0,
  newCustomersCount: 0,
});
const topStaff = ref<StaffPerformance[]>([]);
const transactions = ref<TransactionLog[]>([]);

const selectedRangeLabel = computed(
  () => `${formatDate(periodStart.value)} - ${formatDate(periodEnd.value)}`
);
function onPeriodChange(period?: Period) {
  if (period && period !== 'custom') setDateRange(period);
  void loadData();
}

function exportDashboardExcel() {
  exportReportWorkbook({
    fileName: `Tong_quan_dieu_hanh_${periodStart.value}_${periodEnd.value}`,
    sheets: [
      {
        name: 'Tổng quan',
        rows: [
          {
            'Từ ngày': periodStart.value,
            'Đến ngày': periodEnd.value,
            'Doanh thu hôm nay': summary.value.todayRevenue,
            'Doanh thu tháng': summary.value.monthlyRevenue,
            'Lợi nhuận hôm nay': summary.value.todayProfit,
            'Lợi nhuận tháng': summary.value.monthlyProfit,
            'Xe bán hôm nay': summary.value.todayVehiclesSold,
            'Xe bán trong tháng': summary.value.monthlyVehiclesSold,
            'Đơn chờ xử lý': summary.value.pendingOrdersCount,
            'Công nợ quá hạn': summary.value.overdueDebtAmount,
            'Tồn kho hiện tại': summary.value.currentInventoryCount,
            'SKU sắp hết': summary.value.lowStockCount,
          },
        ],
      },
      {
        name: 'Doanh thu theo ngày',
        rows: dailyRevenue.value.map((item) => ({
          Ngày: item.reportDay,
          'Doanh thu': item.totalRevenue,
        })),
      },
      {
        name: 'Hiệu suất nhân viên',
        rows: topStaff.value.map((item) => ({
          'Nhân viên': item.employeeName,
          'Chức vụ': item.role,
          'Doanh số': item.totalSales,
          'Mục tiêu': item.targetSales,
          'Hoa hồng': item.commissionPaid,
          'Trạng thái KPI': item.kpiStatus,
        })),
      },
      {
        name: 'Giao dịch gần nhất',
        rows: transactions.value.map((item) => ({
          'Thời gian': item.timestamp,
          'Khách hàng': item.customerName,
          'Sản phẩm': item.productName,
          'Loại giao dịch': item.isRevenue ? 'Thu' : 'Chi',
          'Số tiền': item.amount,
          'Trạng thái': item.status,
          'Nhân viên': item.staffName,
        })),
      },
      {
        name: 'Đơn hàng gần đây',
        rows: recentOrders.value.map((item) => ({
          'Mã đơn': item.orderCode || item.id,
          'Khách hàng': item.buyerName,
          'Số tiền': item.totalAmount,
          'Trạng thái': item.statusId,
          'Thời gian': item.createdAt,
        })),
      },
    ],
  });
}

async function loadData() {
  loading.value = true;
  try {
    const res = await statisticsApi.getDashboardOverview(periodStart.value, periodEnd.value);
    summary.value = res.summary;
    recentOrders.value = (res.recentOrders || []).slice(0, 10);
    dailyRevenue.value = res.dailyRevenue || [];
    topStaff.value = Array.isArray(res.topStaff) ? res.topStaff : [];
    transactions.value = Array.isArray(res.recentTransactions) ? res.recentTransactions : [];
    await nextTick();
    updateCharts();
  } catch (e) {
    console.error('Failed to load dashboard overview:', e);
    recentOrders.value = [];
    dailyRevenue.value = [];
    topStaff.value = [];
    transactions.value = [];
  } finally {
    loading.value = false;
  }
}

function updateCharts() {
  if (revenueChartRef.value) {
    if (!revenueChart) revenueChart = echarts.init(revenueChartRef.value);
    const data = dailyRevenue.value;
    revenueChart.setOption({
      backgroundColor: 'transparent',
      textStyle: { color: chartTextColor() },
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.reportDay),
        axisTick: { alignWithLabel: true },
        axisLabel: { color: chartTextColor() },
        axisLine: { lineStyle: { color: chartAxisLineColor() } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: chartTextColor() },
        splitLine: { lineStyle: { color: chartGridLineColor() } },
      },
      series: [
        {
          name: 'Doanh thu',
          type: 'line',
          smooth: true,
          data: data.map((d) => d.totalRevenue),
          itemStyle: { color: '#e84a4a' },
          lineStyle: { color: '#e84a4a' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(232, 74, 74, 0.32)' },
              { offset: 1, color: 'rgba(232, 74, 74, 0)' },
            ]),
          },
        },
      ],
    });
  }
  if (brandChartRef.value) {
    if (!brandChart) brandChart = echarts.init(brandChartRef.value);
    const data = (summary.value.brandRevenueDistribution || []).slice(0, 6);
    brandChart.setOption({
      backgroundColor: 'transparent',
      color: ['#e84a4a', '#ff6b6b', '#f97316', '#22c55e', '#3b82f6', '#a855f7'],
      textStyle: { color: chartTextColor() },
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, textStyle: { color: chartTextColor() } },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          data: data.map((d: any) => ({
            name: d.brandName || 'Khác',
            value: d.revenue,
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    });
  }
}

function formatCurrency(value: number) {
  if (value == null) return '0đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getKpiClass(status: string) {
  switch (status) {
    case 'Vượt KPI':
      return 'bg-green-100 text-green-700';
    case 'Đạt':
      return 'bg-blue-100 text-blue-700';
    case 'Cần cải thiện':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700';
  }
}

function setDateRange(period: Period) {
  const today = new Date();

  if (period === 'today') {
    periodStart.value = toDateInput(today);
    periodEnd.value = toDateInput(today);
    return;
  }

  if (period === 'month') {
    periodStart.value = toDateInput(startOfMonth(today));
    periodEnd.value = toDateInput(today);
    return;
  }

  if (period === 'year') {
    periodStart.value = toDateInput(new Date(today.getFullYear(), 0, 1));
    periodEnd.value = toDateInput(today);
  }
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toDateInput(date: Date) {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 10);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function chartTextColor() {
  return isDark.value ? '#CBD5E1' : '#475569';
}

function chartAxisLineColor() {
  return isDark.value ? 'rgb(255 255 255 / 14%)' : '#E2E8F0';
}

function chartGridLineColor() {
  return isDark.value ? 'rgb(255 255 255 / 8%)' : '#F1F5F9';
}

function handleResize() {
  revenueChart?.resize();
  brandChart?.resize();
}

watch(isDark, async () => {
  await nextTick();
  updateCharts();
});

watch([periodStart, periodEnd], () => {
  if (currentPeriod.value === 'custom' && periodStart.value && periodEnd.value) {
    void loadData();
  }
});

onMounted(() => {
  loadData();
  window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  revenueChart?.dispose();
  brandChart?.dispose();
});
</script>

<style scoped lang="scss">
.dashboard-report__kpis,
.dashboard-report__overview,
.dashboard-report__analysis,
.dashboard-report__transactions {
  margin-bottom: 16px;
}

.dashboard-report__card-header {
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;

  span:last-child {
    overflow: hidden;
    font-size: 12px;
    font-weight: 500;
    color: var(--report-muted);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.dashboard-report__chart {
  min-height: 300px;
}

.dashboard-report__table-card table,
.dashboard-report__transactions table {
  color: var(--report-muted-strong);
}

.dashboard-report__table-card th,
.dashboard-report__transactions th {
  color: var(--report-muted);
}

@media (width <= 767px) {
  .dashboard-report__chart {
    min-height: 240px;
  }
}
</style>
